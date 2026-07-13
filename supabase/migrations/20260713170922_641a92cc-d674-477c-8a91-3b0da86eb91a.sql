
create or replace function public.workspace_role_rank(_role public.app_workspace_role)
returns int
language sql
immutable
set search_path = public
as $$
  select case _role
    when 'owner' then 4
    when 'admin' then 3
    when 'editor' then 2
    when 'viewer' then 1
  end;
$$;
