create table if not exists public.professional_workspaces (
  id uuid primary key default gen_random_uuid(),
  created_by_id uuid not null unique references auth.users(id) on delete cascade,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  data jsonb not null default '{}'::jsonb
);

create index if not exists professional_workspaces_created_by_id_idx
on public.professional_workspaces(created_by_id);

drop trigger if exists professional_workspaces_set_updated_date on public.professional_workspaces;
create trigger professional_workspaces_set_updated_date
before update on public.professional_workspaces
for each row execute function public.set_updated_date();

alter table public.professional_workspaces enable row level security;

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
