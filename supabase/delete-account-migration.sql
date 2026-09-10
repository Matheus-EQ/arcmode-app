-- Execute no SQL Editor do Supabase antes de habilitar a exclusão em produção.
-- A função não aceita um id externo: ela usa exclusivamente auth.uid().
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

revoke all on function public.delete_own_account() from public, anon, service_role;
grant execute on function public.delete_own_account() to authenticated;
