
-- =========================================================
-- 1. ENUM + TABLES
-- =========================================================

create type public.app_workspace_role as enum ('owner','admin','editor','viewer');

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'personal' check (plan in ('personal','pro','team')),
  is_personal boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.workspaces to authenticated;
grant all on public.workspaces to service_role;
alter table public.workspaces enable row level security;

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_workspace_role not null default 'viewer',
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

grant select, insert, update, delete on public.workspace_members to authenticated;
grant all on public.workspace_members to service_role;
alter table public.workspace_members enable row level security;

create table public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role public.app_workspace_role not null default 'editor',
  invited_by uuid not null references auth.users(id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.workspace_invites to authenticated;
grant all on public.workspace_invites to service_role;
alter table public.workspace_invites enable row level security;

create index on public.workspace_members (user_id);
create index on public.workspace_members (workspace_id);
create index on public.workspace_invites (workspace_id);
create index on public.workspace_invites (email);

-- =========================================================
-- 2. SECURITY DEFINER HELPERS
-- =========================================================

-- Rank helper for role hierarchy
create or replace function public.workspace_role_rank(_role public.app_workspace_role)
returns int language sql immutable as $$
  select case _role
    when 'owner' then 4
    when 'admin' then 3
    when 'editor' then 2
    when 'viewer' then 1
  end;
$$;

create or replace function public.has_workspace_role(
  _user_id uuid,
  _workspace_id uuid,
  _min_role public.app_workspace_role
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members m
    where m.user_id = _user_id
      and m.workspace_id = _workspace_id
      and public.workspace_role_rank(m.role) >= public.workspace_role_rank(_min_role)
  );
$$;

create or replace function public.is_workspace_member(_user_id uuid, _workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where user_id = _user_id and workspace_id = _workspace_id
  );
$$;

-- =========================================================
-- 3. RLS POLICIES ON WORKSPACE TABLES
-- =========================================================

-- workspaces
create policy "Members can view workspace" on public.workspaces
  for select to authenticated
  using (public.is_workspace_member(auth.uid(), id));

create policy "Users can create workspaces they own" on public.workspaces
  for insert to authenticated
  with check (owner_id = auth.uid());

create policy "Admins can update workspace" on public.workspaces
  for update to authenticated
  using (public.has_workspace_role(auth.uid(), id, 'admin'))
  with check (public.has_workspace_role(auth.uid(), id, 'admin'));

create policy "Owner can delete workspace" on public.workspaces
  for delete to authenticated
  using (owner_id = auth.uid() and not is_personal);

-- workspace_members
create policy "Members can view members of their workspaces" on public.workspace_members
  for select to authenticated
  using (public.is_workspace_member(auth.uid(), workspace_id));

create policy "Admins can add members" on public.workspace_members
  for insert to authenticated
  with check (public.has_workspace_role(auth.uid(), workspace_id, 'admin'));

create policy "Admins can update members" on public.workspace_members
  for update to authenticated
  using (public.has_workspace_role(auth.uid(), workspace_id, 'admin'))
  with check (public.has_workspace_role(auth.uid(), workspace_id, 'admin'));

create policy "Admins can remove members or user can leave" on public.workspace_members
  for delete to authenticated
  using (
    public.has_workspace_role(auth.uid(), workspace_id, 'admin')
    or user_id = auth.uid()
  );

-- workspace_invites
create policy "Admins view invites; invitees view by email" on public.workspace_invites
  for select to authenticated
  using (
    public.has_workspace_role(auth.uid(), workspace_id, 'admin')
    or email = (select email from auth.users where id = auth.uid())
  );

create policy "Admins create invites" on public.workspace_invites
  for insert to authenticated
  with check (public.has_workspace_role(auth.uid(), workspace_id, 'admin'));

create policy "Admins update invites" on public.workspace_invites
  for update to authenticated
  using (public.has_workspace_role(auth.uid(), workspace_id, 'admin'))
  with check (public.has_workspace_role(auth.uid(), workspace_id, 'admin'));

create policy "Admins delete invites" on public.workspace_invites
  for delete to authenticated
  using (public.has_workspace_role(auth.uid(), workspace_id, 'admin'));

-- =========================================================
-- 4. ADD workspace_id TO EXISTING TABLES
-- =========================================================

alter table public.cards add column workspace_id uuid references public.workspaces(id) on delete set null;
alter table public.projects add column workspace_id uuid references public.workspaces(id) on delete set null;
alter table public.payfast_payments add column workspace_id uuid references public.workspaces(id) on delete set null;

create index on public.cards (workspace_id);
create index on public.projects (workspace_id);
create index on public.payfast_payments (workspace_id);

-- =========================================================
-- 5. BACKFILL: PERSONAL WORKSPACES FOR EXISTING USERS
-- =========================================================

do $$
declare
  u record;
  ws_id uuid;
  uname text;
begin
  for u in select id, email from auth.users loop
    select coalesce(p.display_name, split_part(u.email, '@', 1), 'My')
      into uname
      from public.profiles p where p.id = u.id;
    if uname is null then uname := split_part(u.email, '@', 1); end if;

    insert into public.workspaces (name, owner_id, is_personal, plan)
    values (uname || '''s Workspace', u.id, true, 'personal')
    returning id into ws_id;

    insert into public.workspace_members (workspace_id, user_id, role)
    values (ws_id, u.id, 'owner');

    update public.cards set workspace_id = ws_id where user_id = u.id and workspace_id is null;
    update public.projects set workspace_id = ws_id where user_id = u.id and workspace_id is null;
    update public.payfast_payments set workspace_id = ws_id where user_id = u.id and workspace_id is null;
  end loop;
end $$;

-- =========================================================
-- 6. AUTO-CREATE PERSONAL WORKSPACE ON NEW USER
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ws_id uuid;
  uname text;
begin
  uname := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, uname, new.raw_user_meta_data->>'avatar_url');

  insert into public.workspaces (name, owner_id, is_personal, plan)
  values (uname || '''s Workspace', new.id, true, 'personal')
  returning id into ws_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (ws_id, new.id, 'owner');

  return new;
end;
$$;

-- Ensure trigger exists (recreate to be safe)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- 7. REWRITE RLS ON cards / projects / card_embeddings / payfast_payments
-- =========================================================

-- cards
drop policy if exists "Users own their cards" on public.cards;

create policy "View cards: owner or workspace member" on public.cards
  for select to authenticated
  using (
    user_id = auth.uid()
    or (workspace_id is not null and public.has_workspace_role(auth.uid(), workspace_id, 'viewer'))
  );

create policy "Insert cards: owner or workspace editor" on public.cards
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and (
      workspace_id is null
      or public.has_workspace_role(auth.uid(), workspace_id, 'editor')
    )
  );

create policy "Update cards: owner or workspace editor" on public.cards
  for update to authenticated
  using (
    user_id = auth.uid()
    or (workspace_id is not null and public.has_workspace_role(auth.uid(), workspace_id, 'editor'))
  )
  with check (
    user_id = auth.uid()
    or (workspace_id is not null and public.has_workspace_role(auth.uid(), workspace_id, 'editor'))
  );

create policy "Delete cards: owner or workspace admin" on public.cards
  for delete to authenticated
  using (
    user_id = auth.uid()
    or (workspace_id is not null and public.has_workspace_role(auth.uid(), workspace_id, 'admin'))
  );

-- projects
drop policy if exists "Users own their projects" on public.projects;

create policy "View projects: owner or workspace member" on public.projects
  for select to authenticated
  using (
    user_id = auth.uid()
    or (workspace_id is not null and public.has_workspace_role(auth.uid(), workspace_id, 'viewer'))
  );

create policy "Insert projects: owner or workspace editor" on public.projects
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and (
      workspace_id is null
      or public.has_workspace_role(auth.uid(), workspace_id, 'editor')
    )
  );

create policy "Update projects: owner or workspace editor" on public.projects
  for update to authenticated
  using (
    user_id = auth.uid()
    or (workspace_id is not null and public.has_workspace_role(auth.uid(), workspace_id, 'editor'))
  )
  with check (
    user_id = auth.uid()
    or (workspace_id is not null and public.has_workspace_role(auth.uid(), workspace_id, 'editor'))
  );

create policy "Delete projects: owner or workspace admin" on public.projects
  for delete to authenticated
  using (
    user_id = auth.uid()
    or (workspace_id is not null and public.has_workspace_role(auth.uid(), workspace_id, 'admin'))
  );

-- card_embeddings: piggyback on cards visibility
drop policy if exists "Users can access their own embeddings" on public.card_embeddings;

create policy "Embeddings follow card access" on public.card_embeddings
  for all to authenticated
  using (
    exists (
      select 1 from public.cards c
      where c.id = card_embeddings.card_id
        and (
          c.user_id = auth.uid()
          or (c.workspace_id is not null and public.has_workspace_role(auth.uid(), c.workspace_id, 'viewer'))
        )
    )
  )
  with check (
    exists (
      select 1 from public.cards c
      where c.id = card_embeddings.card_id
        and (
          c.user_id = auth.uid()
          or (c.workspace_id is not null and public.has_workspace_role(auth.uid(), c.workspace_id, 'editor'))
        )
    )
  );

-- payfast_payments: existing SELECT policy still fine; keep as-is (owner sees own)
-- (workspace_id here is informational; keep policy scoped to auth.uid() = user_id)
