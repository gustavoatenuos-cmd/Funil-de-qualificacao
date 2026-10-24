## Integração comercial finalizada em 2026-10-24

- Número de destino da captação: **(43) 98422-2822**, formato `5543984222822`.
- O formulário salva nome, empresa, WhatsApp, histórico de anúncios, desafio, modalidade, consentimento e parâmetros UTM no Supabase.
- Um gatilho `AFTER INSERT` em `public.leads_canal_aquisicao_2026` cria **empresa, contato, card comercial e nota** na conta proprietária do Larkan em **mesma transação**. Se falhar, o cadastro é revertido e o funil NÃO redireciona.
- O contato recebe uma mensagem WhatsApp pré-preenchida, com o próprio nome, empresa e respostas, **após** confirmação de cadastro. O visitante deve tocar em **Enviar** no WhatsApp.
- ID de submissão gerado no navegador e `resolution=ignore-duplicates` impedem duplicidade em reenvios após timeout.
- O fluxo de reconciliação do Larkan continua como contingência. O card em produção aparece no pipeline mesmo sem a versão de menu especial de prévia.
- Teste técnico executado no banco em uma transação com `SET LOCAL ROLE anon`, criação verificada e `ROLLBACK` (sem persistir contato fictício).
- Configuração do Pixel Meta **ainda pendente**; não considere eventos Pixel validados antes de configurar a conta correta.

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
window.COMERCIAL_WHATSAPP = '5543984222822';  // (43) 98422-2822
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


## Painel de gestão (acesso protegido)

Endereço: `/gestao.html` dentro do mesmo deployment da Vercel.

Recursos:
- Login por e-mail e senha com Supabase Authentication;
- Lista dos até 250 leads mais recentes, com busca e filtro por status;
- Origem por campanha/criativo e link para WhatsApp individual;
- Etapas `novo`, `contatado`, `negociacao`, `ganho`, `perdido`;
- Exportação CSV somente para administradores autenticados.

**Segurança:** a tabela `public.aquisicao_leads_admins` contém apenas IDs de administradores autorizados, vinculados a `auth.users`. Políticas de Row Level Security bloqueiam SELECT e UPDATE dos leads por visitantes e usuários autenticados que não estejam nessa lista. Não há auto-cadastro público no painel nem senha fixa no GitHub.

**Ativação do primeiro administrador:**
1. Criar ou identificar a conta de acesso do administrador em Supabase → Authentication → Users, no projeto LARKAN 5.0. Preferir envio de convite ou fluxo de definição de senha ao invés de compartilhar senhas.
2. Autorizar explicitamente somente o UUID do usuário escolhido em `public.aquisicao_leads_admins`.
3. Testar login, listagem vazia, logout, mudança de etapa e acesso negado com conta não autorizada.
4. Nunca conceder SELECT dos leads a `anon` nem adicionar políticas `USING (true)` para leitura dos leads.
5. Não informar dados privados, credenciais nem UUIDs pessoais em issues públicas.

O painel começa sem administradores autorizados por segurança. **Ele não estará acessível para consulta até a liberação da primeira conta.**

