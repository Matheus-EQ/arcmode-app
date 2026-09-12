-- Base comercial do ArcMode.
-- A cobrança nasce desativada e só deve ser habilitada após o teste completo
-- do checkout e dos webhooks da Hotmart.

create table if not exists public.app_settings (
  id boolean primary key default true check (id),
  billing_enforced boolean not null default false,
  checkout_url text,
  support_email text not null default 'contato.neurosyncapp@gmail.com',
  updated_date timestamptz not null default now()
);

insert into public.app_settings (id, billing_enforced)
values (true, false)
on conflict (id) do nothing;

create table if not exists public.access_entitlements (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'hotmart' check (provider in ('hotmart', 'manual')),
  external_key text not null,
  buyer_email text not null,
  user_id uuid references auth.users(id) on delete set null,
  product_id text,
  plan_name text,
  transaction_id text,
  event_id text,
  event_date timestamptz,
  status text not null default 'pending' check (status in (
    'pending', 'trialing', 'active', 'past_due', 'cancelled', 'expired', 'refunded', 'chargeback', 'revoked'
  )),
  access_until timestamptz,
  last_event text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  unique (provider, external_key)
);

create index if not exists access_entitlements_user_id_idx
  on public.access_entitlements(user_id);
create index if not exists access_entitlements_buyer_email_idx
  on public.access_entitlements(lower(buyer_email));
create index if not exists access_entitlements_status_idx
  on public.access_entitlements(status);
create unique index if not exists access_entitlements_provider_event_idx
  on public.access_entitlements(provider, event_id)
  where event_id is not null;

drop trigger if exists access_entitlements_set_updated_date on public.access_entitlements;
create trigger access_entitlements_set_updated_date
before update on public.access_entitlements
for each row execute function public.set_updated_date();

alter table public.app_settings enable row level security;
alter table public.access_entitlements enable row level security;

drop policy if exists "app_settings_public_read" on public.app_settings;
create policy "app_settings_public_read" on public.app_settings
for select to anon, authenticated using (id = true);

drop policy if exists "access_entitlements_select_own" on public.access_entitlements;
create policy "access_entitlements_select_own" on public.access_entitlements
for select to authenticated
using (
  user_id = auth.uid()
  or (
    user_id is null
    and lower(buyer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

-- Vincula uma compra recebida antes do cadastro ao usuário autenticado.
create or replace function public.claim_own_entitlement()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_email text;
begin
  current_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  if auth.uid() is null or current_email = '' then
    raise exception 'Authentication required';
  end if;

  update public.access_entitlements
  set user_id = auth.uid(), updated_date = now()
  where user_id is null and lower(buyer_email) = current_email;
end;
$$;

revoke all on function public.claim_own_entitlement() from public, anon, service_role;
grant execute on function public.claim_own_entitlement() to authenticated;

-- Centraliza a autorização comercial para que ela também seja aplicada pelo banco.
create or replace function public.has_neurosync_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    not coalesce((select billing_enforced from public.app_settings where id = true), false)
    or exists (
      select 1
      from public.access_entitlements entitlement
      where (
        entitlement.user_id = auth.uid()
        or (
          entitlement.user_id is null
          and lower(entitlement.buyer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
      )
      and (
        entitlement.status in ('active', 'trialing')
        or (entitlement.status = 'cancelled' and entitlement.access_until > now())
      )
      and (entitlement.access_until is null or entitlement.access_until > now())
    );
$$;

revoke all on function public.has_neurosync_access() from public, anon, service_role;
grant execute on function public.has_neurosync_access() to authenticated;

-- Reforça a licença nas políticas das tabelas de dados. Enquanto
-- app_settings.billing_enforced=false, o comportamento atual é preservado.
drop policy if exists "players_select_own" on public.players;
create policy "players_select_own" on public.players for select to authenticated
using (created_by_id = auth.uid() and public.has_neurosync_access());
drop policy if exists "players_insert_own" on public.players;
create policy "players_insert_own" on public.players for insert to authenticated
with check (created_by_id = auth.uid() and public.has_neurosync_access());
drop policy if exists "players_update_own" on public.players;
create policy "players_update_own" on public.players for update to authenticated
using (created_by_id = auth.uid() and public.has_neurosync_access())
with check (created_by_id = auth.uid() and public.has_neurosync_access());
drop policy if exists "players_delete_own" on public.players;
create policy "players_delete_own" on public.players for delete to authenticated
using (created_by_id = auth.uid() and public.has_neurosync_access());

drop policy if exists "dailies_select_own" on public.dailies;
create policy "dailies_select_own" on public.dailies for select to authenticated
using (created_by_id = auth.uid() and public.has_neurosync_access());
drop policy if exists "dailies_insert_own" on public.dailies;
create policy "dailies_insert_own" on public.dailies for insert to authenticated
with check (created_by_id = auth.uid() and public.has_neurosync_access());
drop policy if exists "dailies_update_own" on public.dailies;
create policy "dailies_update_own" on public.dailies for update to authenticated
using (created_by_id = auth.uid() and public.has_neurosync_access())
with check (created_by_id = auth.uid() and public.has_neurosync_access());
drop policy if exists "dailies_delete_own" on public.dailies;
create policy "dailies_delete_own" on public.dailies for delete to authenticated
using (created_by_id = auth.uid() and public.has_neurosync_access());

drop policy if exists "bosses_select_own" on public.bosses;
create policy "bosses_select_own" on public.bosses for select to authenticated
using (created_by_id = auth.uid() and public.has_neurosync_access());
drop policy if exists "bosses_insert_own" on public.bosses;
create policy "bosses_insert_own" on public.bosses for insert to authenticated
with check (created_by_id = auth.uid() and public.has_neurosync_access());
drop policy if exists "bosses_update_own" on public.bosses;
create policy "bosses_update_own" on public.bosses for update to authenticated
using (created_by_id = auth.uid() and public.has_neurosync_access())
with check (created_by_id = auth.uid() and public.has_neurosync_access());
drop policy if exists "bosses_delete_own" on public.bosses;
create policy "bosses_delete_own" on public.bosses for delete to authenticated
using (created_by_id = auth.uid() and public.has_neurosync_access());

drop policy if exists "history_logs_select_own" on public.history_logs;
create policy "history_logs_select_own" on public.history_logs for select to authenticated
using (created_by_id = auth.uid() and public.has_neurosync_access());
drop policy if exists "history_logs_insert_own" on public.history_logs;
create policy "history_logs_insert_own" on public.history_logs for insert to authenticated
with check (created_by_id = auth.uid() and public.has_neurosync_access());
drop policy if exists "history_logs_update_own" on public.history_logs;
create policy "history_logs_update_own" on public.history_logs for update to authenticated
using (created_by_id = auth.uid() and public.has_neurosync_access())
with check (created_by_id = auth.uid() and public.has_neurosync_access());
drop policy if exists "history_logs_delete_own" on public.history_logs;
create policy "history_logs_delete_own" on public.history_logs for delete to authenticated
using (created_by_id = auth.uid() and public.has_neurosync_access());

drop policy if exists "professional_workspaces_select_own" on public.professional_workspaces;
create policy "professional_workspaces_select_own" on public.professional_workspaces for select to authenticated
using (created_by_id = auth.uid() and public.has_neurosync_access());
drop policy if exists "professional_workspaces_insert_own" on public.professional_workspaces;
create policy "professional_workspaces_insert_own" on public.professional_workspaces for insert to authenticated
with check (created_by_id = auth.uid() and public.has_neurosync_access());
drop policy if exists "professional_workspaces_update_own" on public.professional_workspaces;
create policy "professional_workspaces_update_own" on public.professional_workspaces for update to authenticated
using (created_by_id = auth.uid() and public.has_neurosync_access())
with check (created_by_id = auth.uid() and public.has_neurosync_access());
drop policy if exists "professional_workspaces_delete_own" on public.professional_workspaces;
create policy "professional_workspaces_delete_own" on public.professional_workspaces for delete to authenticated
using (created_by_id = auth.uid() and public.has_neurosync_access());
