create extension if not exists "pgcrypto";

create or replace function public.set_updated_date()
returns trigger
language plpgsql
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  created_by_id uuid not null references auth.users(id) on delete cascade,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  name text not null default 'CyberRunner',
  level numeric not null default 1,
  xp numeric not null default 0,
  "maxXp" numeric not null default 1000,
  hp numeric not null default 100,
  coins numeric not null default 0,
  streak numeric not null default 0,
  "lastCycleDate" text,
  avatar text not null default 'default',
  theme text not null default 'purple',
  attributes jsonb not null default '{"intelecto":1,"fisico":1,"disciplina":1,"emocional":1,"social":1,"profissional":1}'::jsonb,
  "attrXp" jsonb not null default '{"intelecto":0,"fisico":0,"disciplina":0,"emocional":0,"social":0,"profissional":0}'::jsonb
);

create table if not exists public.dailies (
  id uuid primary key default gen_random_uuid(),
  created_by_id uuid not null references auth.users(id) on delete cascade,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  title text not null,
  attribute text not null check (attribute in ('intelecto', 'fisico', 'disciplina', 'emocional', 'social', 'profissional')),
  type text not null default 'task' check (type in ('task', 'timer')),
  duration numeric not null default 0,
  days integer[] not null default '{}',
  completed boolean not null default false
);

create table if not exists public.bosses (
  id uuid primary key default gen_random_uuid(),
  created_by_id uuid not null references auth.users(id) on delete cascade,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  name text not null,
  description text,
  date text,
  hp numeric not null default 100,
  "maxHp" numeric not null default 100,
  color text not null default 'text-purple-500',
  "xpReward" numeric not null default 1000,
  "coinReward" numeric not null default 500,
  subtasks jsonb not null default '[]'::jsonb
);

create table if not exists public.history_logs (
  id uuid primary key default gen_random_uuid(),
  created_by_id uuid not null references auth.users(id) on delete cascade,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  date text not null,
  text text not null,
  type text not null check (type in ('victory', 'level', 'penalty', 'purchase'))
);

create table if not exists public.professional_workspaces (
  id uuid primary key default gen_random_uuid(),
  created_by_id uuid not null unique references auth.users(id) on delete cascade,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  data jsonb not null default '{}'::jsonb
);

create index if not exists players_created_by_id_idx on public.players(created_by_id);
create index if not exists dailies_created_by_id_idx on public.dailies(created_by_id);
create index if not exists bosses_created_by_id_idx on public.bosses(created_by_id);
create index if not exists history_logs_created_by_id_idx on public.history_logs(created_by_id);
create index if not exists history_logs_created_date_idx on public.history_logs(created_date desc);
create index if not exists professional_workspaces_created_by_id_idx on public.professional_workspaces(created_by_id);

drop trigger if exists players_set_updated_date on public.players;
create trigger players_set_updated_date
before update on public.players
for each row execute function public.set_updated_date();

drop trigger if exists dailies_set_updated_date on public.dailies;
create trigger dailies_set_updated_date
before update on public.dailies
for each row execute function public.set_updated_date();

drop trigger if exists bosses_set_updated_date on public.bosses;
create trigger bosses_set_updated_date
before update on public.bosses
for each row execute function public.set_updated_date();

drop trigger if exists history_logs_set_updated_date on public.history_logs;
create trigger history_logs_set_updated_date
before update on public.history_logs
for each row execute function public.set_updated_date();

drop trigger if exists professional_workspaces_set_updated_date on public.professional_workspaces;
create trigger professional_workspaces_set_updated_date
before update on public.professional_workspaces
for each row execute function public.set_updated_date();

alter table public.players enable row level security;
alter table public.dailies enable row level security;
alter table public.bosses enable row level security;
alter table public.history_logs enable row level security;
alter table public.professional_workspaces enable row level security;

drop policy if exists "players_select_own" on public.players;
create policy "players_select_own" on public.players
for select to authenticated
using (created_by_id = auth.uid());

drop policy if exists "players_insert_own" on public.players;
create policy "players_insert_own" on public.players
for insert to authenticated
with check (created_by_id = auth.uid());

drop policy if exists "players_update_own" on public.players;
create policy "players_update_own" on public.players
for update to authenticated
using (created_by_id = auth.uid())
with check (created_by_id = auth.uid());

drop policy if exists "players_delete_own" on public.players;
create policy "players_delete_own" on public.players
for delete to authenticated
using (created_by_id = auth.uid());

drop policy if exists "dailies_select_own" on public.dailies;
create policy "dailies_select_own" on public.dailies
for select to authenticated
using (created_by_id = auth.uid());

drop policy if exists "dailies_insert_own" on public.dailies;
create policy "dailies_insert_own" on public.dailies
for insert to authenticated
with check (created_by_id = auth.uid());

drop policy if exists "dailies_update_own" on public.dailies;
create policy "dailies_update_own" on public.dailies
for update to authenticated
using (created_by_id = auth.uid())
with check (created_by_id = auth.uid());

drop policy if exists "dailies_delete_own" on public.dailies;
create policy "dailies_delete_own" on public.dailies
for delete to authenticated
using (created_by_id = auth.uid());

drop policy if exists "bosses_select_own" on public.bosses;
create policy "bosses_select_own" on public.bosses
for select to authenticated
using (created_by_id = auth.uid());

drop policy if exists "bosses_insert_own" on public.bosses;
create policy "bosses_insert_own" on public.bosses
for insert to authenticated
with check (created_by_id = auth.uid());

drop policy if exists "bosses_update_own" on public.bosses;
create policy "bosses_update_own" on public.bosses
for update to authenticated
using (created_by_id = auth.uid())
with check (created_by_id = auth.uid());

drop policy if exists "bosses_delete_own" on public.bosses;
create policy "bosses_delete_own" on public.bosses
for delete to authenticated
using (created_by_id = auth.uid());

drop policy if exists "history_logs_select_own" on public.history_logs;
create policy "history_logs_select_own" on public.history_logs
for select to authenticated
using (created_by_id = auth.uid());

drop policy if exists "history_logs_insert_own" on public.history_logs;
create policy "history_logs_insert_own" on public.history_logs
for insert to authenticated
with check (created_by_id = auth.uid());

drop policy if exists "history_logs_update_own" on public.history_logs;
create policy "history_logs_update_own" on public.history_logs
for update to authenticated
using (created_by_id = auth.uid())
with check (created_by_id = auth.uid());

drop policy if exists "history_logs_delete_own" on public.history_logs;
create policy "history_logs_delete_own" on public.history_logs
for delete to authenticated
using (created_by_id = auth.uid());

drop policy if exists "professional_workspaces_select_own" on public.professional_workspaces;
create policy "professional_workspaces_select_own" on public.professional_workspaces
for select to authenticated using (created_by_id = auth.uid());

drop policy if exists "professional_workspaces_insert_own" on public.professional_workspaces;
create policy "professional_workspaces_insert_own" on public.professional_workspaces
for insert to authenticated with check (created_by_id = auth.uid());

drop policy if exists "professional_workspaces_update_own" on public.professional_workspaces;
create policy "professional_workspaces_update_own" on public.professional_workspaces
for update to authenticated
using (created_by_id = auth.uid()) with check (created_by_id = auth.uid());

drop policy if exists "professional_workspaces_delete_own" on public.professional_workspaces;
create policy "professional_workspaces_delete_own" on public.professional_workspaces
for delete to authenticated using (created_by_id = auth.uid());

-- Exclui somente a conta autenticada. A cascata de auth.users remove os dados
-- associados nas tabelas acima. Esta função nunca recebe um id do frontend.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
