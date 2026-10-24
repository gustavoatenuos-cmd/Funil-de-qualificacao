# Campanha — Canal de Aquisição (2026)

Landing page estática, mobile-first, que acompanha os motions de Meta Ads e leva à qualificação rápida.

## Fluxo
Anúncio → Landing → 3 perguntas (histórico, gargalo, modalidade) → Nome / empresa / ramo / WhatsApp + consentimento → confirmação.

## Persistência
O lead é inserido pelo Supabase REST em `public.leads_canal_aquisicao_2026` no projeto LARKAN, em tabela isolada. A chave no front é **publishable** e a RLS bloqueia leitura, alteração e exclusão pelo papel anônimo. Nunca publicar chaves secret/service_role.

## Antes de anunciar
1. Configurar `window.META_PIXEL_ID` com o ID real do Pixel Meta no `index.html` e validar os eventos PageView/Lead.
2. Enviar um cadastro real de teste e validar no Supabase (Table Editor → leads_canal_aquisicao_2026); conferir consentimento e UTMs.
3. Definir responsável por monitorar os cadastros: nesta versão não existe envio automático de alertas no WhatsApp ou e-mail.
4. Testar visualização no celular e verificar CTA para formulário.
5. Usar URL com UTM por anúncio, como `?utm_source=meta&utm_medium=paid&utm_campaign=implantacao_out26&utm_content=motion01`.

## Hospedagem
Vercel: Root Directory `campanha-aquisicao-2026` do repositório `gustavoatenuos-cmd/Funil-de-qualificacao`, framework Other/static. A implantação não modifica o Apps Script antigo na raiz.

## Segurança/privacidade
O front tem validação e honeypot; RLS é somente escrita para visitantes. Recomendado acrescentar rate limit anti-bot caso receba spam. A divulgação exige aviso de privacidade válido e conferência de consentimento.
