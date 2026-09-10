# Auditoria técnica do NeuroSync

Data da revisão: 10 de setembro de 2026.

## Escopo observado

- código real: `C:\Users\mathe\Documents\8. App NeuroSync\Codigo`;
- produção: `https://neurosync-rpg.pages.dev`;
- frontend React/Vite hospedado no Cloudflare Pages;
- Supabase para autenticação, Postgres e RLS;
- compatibilidade legada com o SDK Base44 mantida no código;
- build estático em `dist` com fallback SPA via `public/_redirects`.

## Estado publicado versus código local

Antes das mudanças, os nomes dos arquivos JS e CSS publicados eram idênticos aos encontrados no `dist` local (`index--ekITe1C.js` e `index-BM-CZDyv.css`). A versão publicada abria diretamente a tela de autenticação e registrava ausência normal de sessão como erro no console.

A versão local agora possui landing pública, demonstração isolada, páginas legais e melhorias de conta. Ela ainda não foi publicada, portanto produção continua na versão anterior.

## Segurança e dados

- o frontend usa `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`;
- não foi encontrado uso de `service_role` no frontend;
- os valores locais não foram copiados nem registrados nesta auditoria;
- `.env` está ignorado e `.env.example` foi explicitamente liberado para versionamento;
- logs, PIDs, caches, `.wrangler`, ZIP de deploy, inspeções locais e capturas de QA estão ignorados;
- artefatos de build (`dist`) e dependências (`node_modules`) estão ignorados;
- a chave anônima do Supabase é pública por definição, mas sua segurança depende integralmente de RLS correta.

### RLS revisada no código

As cinco tabelas — `players`, `dailies`, `bosses`, `history_logs` e `professional_workspaces` — habilitam RLS. As políticas de `select`, `insert`, `update` e `delete` exigem `created_by_id = auth.uid()`; as políticas de escrita também validam `with check`.

Não há uma política aberta no SQL local. A pendência é confirmar no painel do Supabase que o ambiente de produção possui exatamente essas políticas e que nenhuma política adicional permissiva foi criada.

### Exclusão de conta

`supabase/delete-account-migration.sql` cria `delete_own_account()` como função `security definer`, sem parâmetro de usuário e com `search_path` vazio. Ela exclui somente `auth.uid()`. As chaves estrangeiras usam `on delete cascade`, removendo os registros associados. A execução pública é revogada e concedida apenas ao papel `authenticated`.

Essa migração precisa ser revisada e aplicada manualmente antes de testar a exclusão no ambiente publicado.

## Autenticação

Fluxos presentes: cadastro, mensagem de confirmação, login, logout, recuperação e redefinição de senha. A rota protegida `/app` exige sessão, exceto no modo demonstração local. Foram adicionadas rotas públicas separadas para entrada e criação de conta.

Dependências externas ainda necessárias:

1. confirmação obrigatória de e-mail no Supabase;
2. URL do site e redirects corretos;
3. SMTP próprio para entrega confiável;
4. aplicação da função de exclusão;
5. teste com endereço de e-mail controlado pelo responsável.

## Modo demonstração

- marcado em `sessionStorage`;
- coleções com prefixo `neurosync:demo:` em `localStorage`;
- cliente Supabase ignorado durante a sessão;
- dados coerentes para tarefas, recorrência, dependências, projetos, agenda, tempo e histórico;
- aviso permanente, reinicialização e saída;
- ações de conta desativadas;
- nenhum dado da demonstração se mistura com contas reais.

## Qualidade

Validado localmente:

- lint;
- typecheck;
- build de produção;
- landing, autenticação e páginas legais;
- demonstração em desktop e celular;
- criação rápida de tarefa;
- conclusão e reabertura;
- cronômetro, pausa e retomada;
- agenda semanal e mensal;
- compromissos e recorrências carregados;
- dependência sinalizada no planejamento;
- relatórios;
- troca entre Profissional e RPG;
- isolamento e reinicialização da demonstração.

Limite do teste: cadastro real, envio de e-mail, redefinição efetiva, exclusão real e confirmação das políticas remotas não foram executados, pois exigem configuração/credenciais externas e poderiam alterar produção.

## Git e primeiro commit

A pasta `Codigo` não é um repositório Git. A alternativa mais segura é inicializar o repositório diretamente nela, sem mover ou apagar a pasta e sem usar o diretório vazio do Codex como substituto. Isso preserva caminhos, histórico operacional e configuração local.

Após autorização, o primeiro commit deve incluir:

- arquivos de configuração na raiz, `.env.example`, `.gitignore`, README, auditoria e documentação;
- `src/` completo;
- `supabase/` completo;
- `public/` completo, exceto itens cobertos pelo `.gitignore`;
- `base44/` como compatibilidade legada documentada;
- `scripts/` e seus quatro screenshots usados no material de portfólio;
- `pnpm-lock.yaml` e `pnpm-workspace.yaml`.

Não devem entrar: `.env`, `node_modules`, `dist`, `.wrangler`, caches, logs, PIDs, ZIPs, arquivos de inspeção, `qa-screenshots` e credenciais locais.

Comandos a executar somente após autorização:

```powershell
Set-Location 'C:\Users\mathe\Documents\8. App NeuroSync\Codigo'
git init -b main
git add .
git status --short
git diff --cached --stat
git commit -m "feat: prepare NeuroSync portfolio demo"
```

Nenhum remoto deve ser criado ou configurado antes de uma segunda revisão do conteúdo preparado para commit.
