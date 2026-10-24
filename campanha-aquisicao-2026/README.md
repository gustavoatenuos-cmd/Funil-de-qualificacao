# Aquisição Inteligente — Funil de Meta Ads (2026)

Funil de qualificação mobile-first, em **HTML/CSS/JS estático**, com animação CSS/SVG leve na primeira dobra.

## Experiência

1. Headline focada em contatos que não avançam, animação **Tráfego Pago → Funil → WhatsApp / R$** e CTA único.
2. Três perguntas sequenciais: histórico de anúncios, maior gargalo, modalidade de implantação.
3. Captura apenas **nome, empresa e WhatsApp**, mais consentimento explícito.
4. **Depois do salvamento confirmado**, dispara `lead_qualificado` no dataLayer e `Lead` caso o Pixel esteja configurado.
5. Com número comercial válido, gera mensagem personalizada e redireciona para `https://wa.me/...`, mantendo um link manual de contingência.
6. Sem número configurado, salva o lead e informa que o redirecionamento ainda está pendente, em vez de abrir um número arbitrário.

## Operação técnica

- Repositório: `gustavoatenuos-cmd/Funil-de-qualificacao`
- Pasta: `campanha-aquisicao-2026`
- Projeto Vercel: `aquisicao-inteligente-funil`
- Supabase: tabela isolada `public.leads_canal_aquisicao_2026` no projeto LARKAN. Chave de publicação pública, com RLS (INSERT autorizado e SELECT público bloqueado).
- O formulário envia `segmento: "Não informado"` para compatibilidade com o campo obrigatório atual, sem criar uma pergunta adicional.
- Parâmetros registrados quando presentes: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`, `gclid`.
- Aviso de privacidade: `privacidade.html`.

## Configuração obrigatória antes de usar em anúncios

No começo do `index.html`, configure:

```js
window.META_PIXEL_ID = '';       // Pixel Meta real (não inventar)
window.COMERCIAL_WHATSAPP = '';  // ex. '5543999999999', apenas exemplo
```

Não subir a campanha com Pixel incorreto ou WhatsApp sem destino comercial. Um envio salvo na base não é equivalente à conversa iniciada no WhatsApp.

## Checklist de validação

- [ ] Abrir a landing no celular e validar o movimento reduzido.
- [ ] Verificar headline, animação e botão.
- [ ] Responder às três perguntas, usar Voltar e alterar respostas.
- [ ] Validar campos obrigatórios, DDD e checkbox.
- [ ] Enviar **um** cadastro de teste e conferir gravação no Supabase.
- [ ] Verificar UTMs no banco e não duplicar o evento Lead.
- [ ] Configurar WhatsApp, confirmar mensagem pré-preenchida e destino.
- [ ] Configurar e validar PageView e Lead no Gerenciador de Eventos.
- [ ] Garantir que alguém monitore os cadastros; não há automação de alerta nesta versão.
- [ ] Promover a branch de teste somente após validação; evitar substituir a versão antiga prematuramente.

## Links de anúncios (exemplos)

`?utm_source=meta&utm_medium=paid&utm_campaign=aquisicao_2026&utm_content=motion01`

Trocar `motion01` por `motion02` ou `motion03` por criativo.

**Nota:** os arquivos de Google Apps Script na raiz do repositório não foram alterados.
