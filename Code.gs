/**
 * Funil de Qualificação - backend Google Apps Script.
 * Configure SHEET_ID (opcional) e WEBHOOK_URL (opcional) em
 * Configurações do projeto > Propriedades do script.
 */

var LEAD_HEADERS = [
  'Data e hora',
  'ID do lead',
  'Nome',
  'WhatsApp',
  'Segmento',
  'Negócio já opera?',
  'Histórico de anúncios',
  'Perfil de qualificação',
  'UTM Source',
  'UTM Medium',
  'UTM Campaign',
  'UTM Content',
  'Origem'
];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Diagnóstico de crescimento | Qualificação')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function submitLead(input) {
  if (!input || typeof input !== 'object') {
    throw new Error('Não foi possível receber os dados. Tente novamente.');
  }

  // Campo invisível antispam: preenchimento indica bot.
  if (input.website) {
    throw new Error('Não foi possível concluir o envio.');
  }

  var nome = cleanText_(input.nome, 90);
  var segmento = cleanText_(input.segmento, 100);
  var whatsapp = normalizePhone_(input.whatsapp);
  var opera = String(input.opera || '');
  var anuncios = String(input.anuncios || '');

  if (nome.length < 2) throw new Error('Informe seu nome.');
  if (segmento.length < 2) throw new Error('Informe o segmento do negócio.');
  if (!/^\d{10,11}$/.test(whatsapp)) throw new Error('Informe um WhatsApp válido com DDD.');
  if (['sim', 'nao'].indexOf(opera) === -1) throw new Error('Informe se o negócio já opera.');
  if (['atual', 'passado', 'nunca'].indexOf(anuncios) === -1) {
    throw new Error('Informe seu histórico com anúncios.');
  }
  if (input.consentimento !== true) {
    throw new Error('Precisamos da sua autorização para entrar em contato.');
  }

  var perfil = qualification_(opera, anuncios);
  var leadId = Utilities.getUuid().split('-')[0].toUpperCase();
  var row = [
    new Date(),
    leadId,
    safeCell_(nome),
    whatsapp,
    safeCell_(segmento),
    opera === 'sim' ? 'Sim' : 'Não',
    anuncios === 'atual' ? 'Investe atualmente' : anuncios === 'passado' ? 'Já investiu' : 'Nunca investiu',
    perfil,
    safeCell_(cleanText_(input.utm_source, 120)),
    safeCell_(cleanText_(input.utm_medium, 120)),
    safeCell_(cleanText_(input.utm_campaign, 120)),
    safeCell_(cleanText_(input.utm_content, 120)),
    safeCell_(cleanText_(input.origem, 300))
  ];

  // Impede que dois envios simultâneos criem planilhas ou escrevam na mesma linha.
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) {
    throw new Error('Estamos recebendo muitos contatos. Tente novamente.');
  }

  try {
    var sheet = getLeadSheet_();
    var nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 4).setNumberFormat('@'); // preserva DDD e zeros iniciais
    sheet.getRange(nextRow, 1, 1, LEAD_HEADERS.length).setValues([row]);
    SpreadsheetApp.flush();
  } catch (error) {
    console.error('Falha ao salvar lead: ' + error);
    throw new Error('Não foi possível registrar agora. Tente novamente em instantes.');
  } finally {
    lock.releaseLock();
  }

  // Integração opcional. Não deve impedir a confirmação após a gravação.
  sendWebhook_({
    id: leadId,
    nome: nome,
    whatsapp: whatsapp,
    segmento: segmento,
    opera: opera,
    anuncios: anuncios,
    perfil: perfil,
    utm_source: cleanText_(input.utm_source, 120),
    utm_medium: cleanText_(input.utm_medium, 120),
    utm_campaign: cleanText_(input.utm_campaign, 120),
    utm_content: cleanText_(input.utm_content, 120),
    origem: cleanText_(input.origem, 300)
  });

  return { ok: true, id: leadId, perfil: perfil };
}

function getLeadSheet_() {
  var properties = PropertiesService.getScriptProperties();
  var spreadsheetId = properties.getProperty('SHEET_ID');
  var spreadsheet;

  if (spreadsheetId) {
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  } else {
    spreadsheet = SpreadsheetApp.create('Leads - Funil de Qualificação');
    properties.setProperty('SHEET_ID', spreadsheet.getId());
  }

  var sheet = spreadsheet.getSheetByName('Leads');
  if (!sheet) {
    var sheets = spreadsheet.getSheets();
    if (sheets.length === 1 && sheets[0].getLastRow() === 0) {
      sheet = sheets[0];
      sheet.setName('Leads');
    } else {
      sheet = spreadsheet.insertSheet('Leads');
    }
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(LEAD_HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, LEAD_HEADERS.length)
      .setBackground('#15243a')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    sheet.setColumnWidth(1, 175);
    sheet.setColumnWidth(3, 190);
    sheet.setColumnWidth(4, 145);
    sheet.setColumnWidth(5, 170);
  }
  return sheet;
}

function normalizePhone_(phone) {
  var digits = String(phone || '').replace(/\D/g, '');
  if (digits.indexOf('55') === 0 && (digits.length === 12 || digits.length === 13)) {
    digits = digits.substring(2);
  }
  return digits;
}

function cleanText_(value, maxLength) {
  return String(value == null ? '' : value)
    .trim().replace(/\s+/g, ' ').substring(0, maxLength);
}

function safeCell_(value) {
  // Evita execução de fórmulas quando conteúdo não confiável vai para a planilha.
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function qualification_(opera, anuncios) {
  if (opera === 'nao') return 'Negócio em estruturação';
  if (anuncios === 'atual') return 'Operando e anunciando';
  if (anuncios === 'passado') return 'Operando - já anunciou';
  return 'Operando - primeiro investimento';
}

function sendWebhook_(data) {
  var url = PropertiesService.getScriptProperties().getProperty('WEBHOOK_URL');
  if (!url) return;
  if (!/^https:\/\//i.test(url)) {
    console.warn('WEBHOOK_URL ignorada: use endereço HTTPS.');
    return;
  }
  try {
    var response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(data),
      muteHttpExceptions: true,
      followRedirects: false
    });
    if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
      console.warn('Webhook retornou HTTP ' + response.getResponseCode());
    }
  } catch (error) {
    console.warn('Falha opcional no webhook: ' + error);
  }
}
