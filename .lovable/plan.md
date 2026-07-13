## Goal

Introduce shared **Workspaces** so Team-plan users can collaborate, while Pro/Free users continue working exactly as today. Every existing user gets a private "personal" workspace auto-created; nothing breaks.

Team-only features (invites, member management, workspace switcher for >1 workspace) are gated behind the user's plan. Pro users can *upgrade* to Team but cannot invite until upgraded.

---

## 1. Data model (migration)

### New tables

- `workspaces`
  - `name text not null`
  - `owner_id uuid not null` → `auth.users`
  - `plan text not null default 'personal'` — `'personal' | 'pro' | 'team'`
  - `is_personal boolean not null default false` (true for auto-created personal workspaces)
- `workspace_members`
  - `workspace_id uuid` → `workspaces`
  - `user_id uuid` → `auth.users`
  - `role app_workspace_role not null` — enum: `owner | admin | editor | viewer`
  - unique `(workspace_id, user_id)`
- `workspace_invites`
  - `workspace_id`, `email`, `role`, `invited_by`, `token`, `accepted_at`, `expires_at`

### Enum + security-definer function

```sql
create type public.app_workspace_role as enum ('owner','admin','editor','viewer');

create function public.has_workspace_role(_user_id uuid, _workspace_id uuid, _min_role app_workspace_role)
  returns boolean security definer stable ...
```

Role hierarchy: owner > admin > editor > viewer. `has_workspace_role` returns true if the user's role is ≥ requested.

Roles live ONLY in `workspace_members` — never on `profiles`.

### Extend existing tables

Add nullable `workspace_id uuid references workspaces(id)` to:
- `cards`
- `projects`
- `card_embeddings` (via join — actually stays keyed to `cards`, no change needed)
- `payfast_payments` (tracks which workspace the plan was purchased for)

`workspace_id IS NULL` = personal-only row (legacy path, kept working).

### Backfill

For every existing `auth.users` row:
1. Insert a `workspaces` row named `"<display_name>'s Workspace"`, `is_personal=true`, `owner_id=<user>`.
2. Insert matching `workspace_members` row with `role='owner'`.
3. `UPDATE cards / projects / payfast_payments SET workspace_id = <personal ws>` for that user.

New signups get the same treatment via an updated `handle_new_user()` trigger (create personal workspace + membership).

### RLS rewrite

Policies change from `auth.uid() = user_id` to:

```sql
-- read
using ( user_id = auth.uid()
        OR (workspace_id is not null
            and public.has_workspace_role(auth.uid(), workspace_id, 'viewer')) )
-- write
using ( user_id = auth.uid()
        OR (workspace_id is not null
            and public.has_workspace_role(auth.uid(), workspace_id, 'editor')) )
```

Personal rows (`workspace_id is null`) remain owner-only. Shared rows are gated by workspace role.

GRANTs (`authenticated`, `service_role`) added for every new table per Lovable rules.

---

## 2. Plan gating

Plan is stored on `workspaces.plan`. Derived helper:

- `personal` — solo, no invites
- `pro` — solo, no invites (has invite CTA that leads to upgrade)
- `team` — invites + member management enabled

Payfast webhook (`payfast-itn`) updates `workspaces.plan` for the workspace the checkout was tied to.

---

## 3. UI changes

### Sidebar
- New **WorkspaceSwitcher** under the Aisom logo in `AppSidebar` (dropdown listing user's workspaces + "Create workspace"). Hidden visually when the user has only their personal workspace, to keep current UX unchanged.
- Active workspace stored in React context + `localStorage`; all data hooks (`fetchProjects`, cards queries) filter by active `workspace_id`.

### New page `/app/workspace`
- Members table (name, email, role, actions)
- Invite form (email + role) — disabled with upgrade prompt when plan ≠ `team`
- Pending invites list
- Owner/admin can change roles + remove; owner can transfer/leave

### Card ownership badge
- On `CardDetailSheet` and card list rows: small badge — "Personal" when `workspace_id` null-or-personal, otherwise workspace name.

### Onboarding
- Add step 5 "Invite your team (optional)" — skippable. Only sends invites if plan is Team; otherwise shows "Upgrade to Team to invite".

### Settings / plan
- "Upgrade to Team" CTA on Settings for Pro users; routes to Payfast checkout with workspace context.

---

## 4. Files to add / edit

**New**
- `supabase/migrations/<ts>_workspaces.sql`
- `src/hooks/useWorkspace.tsx` — active workspace context
- `src/components/app/WorkspaceSwitcher.tsx`
- `src/pages/WorkspaceMembers.tsx` (`/app/workspace`)
- `src/lib/workspaces.ts` — API helpers

**Edit**
- `src/App.tsx` — add route, wrap in `WorkspaceProvider`
- `src/components/app/AppSidebar.tsx` — mount switcher
- `src/components/app/AppLayout.tsx` — provider
- `src/lib/api.ts` — filter queries by active workspace
- `src/pages/Onboarding.tsx` — step 5
- `src/pages/SettingsPage.tsx` — upgrade CTA
- `src/components/cards/CardDetailSheet.tsx` — ownership badge
- `supabase/functions/payfast-itn/index.ts` — set `workspaces.plan='team'` on team-plan payment

---

## 5. Order of execution

1. Run migration (schema + backfill + trigger update + RLS rewrite + grants).
2. Regenerate types.
3. Add `useWorkspace` context and switch data hooks over.
4. Add UI (switcher, members page, badge, onboarding step).
5. Wire Payfast plan updates.
6. Manual smoke test: existing user still sees their cards; new invitee flow works end-to-end.

### Technical notes

- Existing users see **zero visual change**: switcher hides with 1 workspace, all their data lands in the personal workspace, RLS still lets them through via the `user_id = auth.uid()` clause.
- Type errors from generated Supabase types can be silenced with `as any` per project convention.
- No new secrets required.
- Invite emails will use the transactional email infra already being scaffolded (`notify.aisom.co.za`); if not yet live, invites fall back to a copy-link flow.
