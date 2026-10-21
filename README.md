# Funil de Qualificação de Leads

Funil simples e responsivo para campanhas de tráfego pago de negócios locais. O objetivo é qualificar contatos antes da conversa comercial, com o mínimo de atrito.

## Etapas do funil

1. Nome e WhatsApp.
2. Segmento do negócio.
3. Se já está operando / vendendo.
4. Se já investiu em anúncios (atualmente, anteriormente ou nunca).

O lead é salvo no Google Sheets com data, ID, perfil e parâmetros UTM. A mensagem de confirmação aparece após o registro.

## Arquivos

- Code.gs: backend Apps Script com validação, planilha e webhook opcional.
- Index.html: frontend responsivo e interação do formulário.
- appsscript.json: manifesto Apps Script.

## Como publicar

1. Abra https://script.google.com e crie um projeto.
2. Substitua o conteúdo do arquivo Code.gs pelo conteúdo homônimo deste repositório.
3. Crie um arquivo do tipo HTML chamado Index e cole o conteúdo de Index.html.
4. Em Configurações do projeto, habilite a visualização do manifesto appsscript.json e configure conforme este repositório.
5. Clique em Implantar > Nova implantação > Aplicativo da Web.
6. Selecione Executar como: Eu. Para captação pública, selecione Quem tem acesso: Qualquer pessoa. Autorize as permissões solicitadas.
7. Abra a URL terminada em /exec e faça um teste completo.

No primeiro envio, se a propriedade de script SHEET_ID estiver vazia, o backend cria uma planilha chamada Leads - Funil de Qualificação na conta proprietária do script, e salva o ID nas propriedades do script.

## Planilha existente (opcional)

Você pode indicar uma planilha própria. Nas Propriedades do script, adicione a chave SHEET_ID com o ID da planilha (trecho da URL). A aba Leads será criada caso ainda não exista.

## Webhook opcional

Nas Propriedades do script, adicione WEBHOOK_URL com um endpoint HTTPS confiável, como uma automação ou CRM próprio. O webhook será enviado após a gravação na planilha. Nunca coloque tokens no HTML ou no GitHub.

## Sincronização pelo GitHub

Você pode usar @google/clasp para sincronizar os arquivos deste repositório com o Apps Script, criando localmente um .clasp.json com o scriptId do projeto (esse arquivo está no .gitignore). Um commit no GitHub não publica automaticamente uma nova implantação do aplicativo web.

## Mensuração

- Captura utm_source, utm_medium, utm_campaign e utm_content.
- Após a gravação confirmada, dispara dataLayer.push com o evento lead_qualificado, se dataLayer estiver configurado.
- Evite disparar conversões apenas no clique: prefira a confirmação do servidor.

## Cuidados

- Coleta somente identificação, contato e dados de qualificação necessários.
- Ajuste o aviso de privacidade, retenção e permissões de planilha conforme a LGPD.
- A página no GitHub não executa o backend Apps Script: use o link /exec de sua implantação.

## Checklist

- [ ] Publicar como aplicativo web
- [ ] Testar navegação no celular e desktop
- [ ] Enviar lead de teste e conferir aba Leads
- [ ] Conferir as UTMs
- [ ] Conferir acesso à planilha e privacidade
- [ ] Configurar conversão somente no envio bem-sucedido
