# Publicação do NeuroSync

Este documento descreve o processo atual: frontend Vite estático no Cloudflare Pages e autenticação/persistência no Supabase. Não publique antes de validar o ambiente local e obter aprovação do responsável pelo projeto.

## 1. Validação local

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
pnpm preview
```

Verifique `/`, `/app`, `/entrar`, `/criar-conta`, `/reset-password`, `/privacidade` e `/termos`, além do modo demonstração em desktop e celular.

## 2. Migrações do Supabase

No SQL Editor, execute somente o que ainda não estiver aplicado:

```text
supabase/schema.sql                         # instalação completa em projeto novo
supabase/professional-workspace-migration.sql
supabase/delete-account-migration.sql
```

Depois, confirme no painel que RLS está ativa nas tabelas `players`, `dailies`, `bosses`, `history_logs` e `professional_workspaces`, e que cada política compara `created_by_id` com `auth.uid()`.

Não coloque `service_role`, senha de banco ou token administrativo no frontend ou no Cloudflare Pages.

## 3. Autenticação

Em **Supabase > Authentication > URL Configuration**:

```text
Site URL: https://neurosync-rpg.pages.dev
Redirect URLs:
  https://neurosync-rpg.pages.dev
  https://neurosync-rpg.pages.dev/app
  https://neurosync-rpg.pages.dev/reset-password
```

Antes da divulgação pública:

1. ative `Confirm email`;
2. configure SMTP próprio em **Authentication > SMTP Settings**;
3. revise o template em `supabase/email-templates/confirm-signup.html`;
4. teste cadastro, ativação, login e recuperação com um endereço de teste.

## 4. Cloudflare Pages

Use o projeto existente `neurosync-rpg` para preservar a URL.

Configuração de build:

```text
Framework preset: Vite
Build command: pnpm build
Build output directory: dist
Node.js: 20 ou superior
```

Variáveis públicas necessárias:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### Publicação manual com Wrangler

Após aprovação final:

```bash
pnpm build
pnpm exec wrangler pages deploy dist --project-name neurosync-rpg
```

O comando requer autenticação local no Cloudflare. Não salve tokens no repositório.

### Publicação conectada ao GitHub

Somente depois de criar e revisar um repositório remoto:

1. conecte o repositório ao projeto Cloudflare Pages existente;
2. selecione o branch principal;
3. aplique as configurações de build acima;
4. cadastre somente as duas variáveis públicas do Supabase;
5. mantenha previews de branches separados da produção.

## 5. Checklist pós-deploy

- a landing pública aparece antes do login;
- a demonstração funciona sem requisições de escrita ao Supabase;
- Privacidade e Termos estão acessíveis;
- cadastro informa que a confirmação foi enviada;
- recuperação abre `/reset-password`;
- rotas protegidas não expõem dados sem sessão;
- logout encerra a sessão;
- cabeçalhos de segurança e fallback SPA continuam ativos;
- console sem erros esperados tratados como falha;
- nenhuma credencial, `.env`, log, ZIP ou dado de teste foi publicado.

## Rollback

Use **Cloudflare Pages > Deployments** para promover o último deploy estável. Migrações de banco devem ter plano próprio; não reverta schema apagando tabelas ou dados.
