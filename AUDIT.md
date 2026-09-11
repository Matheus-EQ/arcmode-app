# Auditoria técnica do NeuroSync

Data da revisão: 10 de setembro de 2026.

## Escopo observado

- código real: `C:\Users\mathe\Documents\8. App NeuroSync\Codigo`;
- produção: `https://neurosync-rpg.pages.dev`;
- frontend React/Vite hospedado no Cloudflare Pages;
- Supabase para autenticação, Postgres e RLS;
- cliente de dados próprio, integrado diretamente ao Supabase e ao armazenamento local da demonstração;
- build estático em `dist` com fallback SPA via `public/_redirects`.

## Estado publicado versus código local

Antes das mudanças, os nomes dos arquivos JS e CSS publicados eram idênticos aos encontrados no `dist` local (`index--ekITe1C.js` e `index-BM-CZDyv.css`). A versão publicada abria diretamente a tela de autenticação e registrava ausência normal de sessão como erro no console.

A versão revisada, com landing pública, demonstração isolada, páginas legais e melhorias de conta, foi publicada em produção e validada em `https://neurosync-rpg.pages.dev`.

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

Em 10 de setembro de 2026, o ambiente remoto foi verificado pelo Editor SQL: as cinco tabelas estão com RLS ativa e cada uma possui quatro políticas, cobrindo `select`, `insert`, `update` e `delete` para o papel autenticado com isolamento por `created_by_id = auth.uid()`.

### Exclusão de conta

`supabase/delete-account-migration.sql` cria `delete_own_account()` como função `security definer`, sem parâmetro de usuário e com `search_path` vazio. Ela exclui somente `auth.uid()`. As chaves estrangeiras usam `on delete cascade`, removendo os registros associados. A execução pública é revogada e concedida apenas ao papel `authenticated`.

A migração foi aplicada em produção. A ACL efetiva foi verificada: somente `authenticated` (além do proprietário `postgres`) pode executar a função; `anon` e `service_role` não possuem permissão. O fluxo destrutivo completo ainda requer um teste com uma conta descartável controlada.

## Autenticação

Fluxos presentes: cadastro, mensagem de confirmação, login, logout, recuperação e redefinição de senha. A rota protegida `/app` exige sessão, exceto no modo demonstração local. Foram adicionadas rotas públicas separadas para entrada e criação de conta.

Configuração remota verificada em 10 de setembro de 2026:

1. confirmação obrigatória de e-mail ativada;
2. URL principal definida como `https://neurosync-rpg.pages.dev`;
3. redirects permitidos para a raiz e `/reset-password`;
4. função de exclusão aplicada com execução restrita ao papel autenticado.

Ainda recomendado antes de divulgar o cadastro real: configurar SMTP próprio para entrega confiável e executar cadastro, confirmação, redefinição e exclusão com um endereço descartável controlado pelo responsável.

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

Limite do teste: cadastro real, entrega de e-mail, redefinição efetiva e exclusão destrutiva não foram executados sem um endereço de teste autorizado. As URLs, confirmação obrigatória, RLS remota e permissões da função de exclusão foram verificadas diretamente no ambiente de produção.

## Git e repositório público

O Git foi inicializado diretamente na pasta `Codigo`, preservando a estrutura original. O repositório público oficial é `https://github.com/Matheus-EQ/neurosync-app`.

O conteúdo versionado inclui código, configurações públicas, documentação, migrações e materiais do projeto. Permanecem excluídos: `.env`, `node_modules`, `dist`, `.wrangler`, caches, logs, PIDs, ZIPs, arquivos de inspeção, `qa-screenshots` e credenciais locais.

Issues do repositório são o canal público para suporte e solicitações relacionadas a dados. Informações sensíveis não devem ser publicadas em uma issue.
