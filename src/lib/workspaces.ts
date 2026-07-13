import { supabase as supabaseClient } from "@/integrations/supabase/client";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = supabaseClient as any;

export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";
export type WorkspacePlan = "personal" | "pro" | "team";

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  plan: WorkspacePlan;
  is_personal: boolean;
  created_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
  profile?: { display_name: string | null; avatar_url: string | null } | null;
}

export interface WorkspaceInvite {
  id: string;
  workspace_id: string;
  email: string;
  role: WorkspaceRole;
  invited_by: string;
  token: string;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
}

// List all workspaces the current user is a member of
export async function fetchMyWorkspaces(): Promise<Workspace[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: memberships, error: mErr } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", user.id);
  if (mErr) throw mErr;

  const ids = (memberships || []).map((m: { workspace_id: string }) => m.workspace_id);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .in("id", ids)
    .order("is_personal", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []) as Workspace[];
}

export async function fetchMyRole(workspaceId: string): Promise<WorkspaceRole | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();
  return (data?.role as WorkspaceRole) ?? null;
}

export async function fetchWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const { data, error } = await supabase
    .from("workspace_members")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const members = (data || []) as WorkspaceMember[];
  const userIds = members.map((m) => m.user_id);
  if (userIds.length === 0) return members;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", userIds);

  const byId = new Map(
    (profiles || []).map((p: { id: string; display_name: string | null; avatar_url: string | null }) => [p.id, p])
  );
  return members.map((m) => ({ ...m, profile: byId.get(m.user_id) ?? null }));
}

export async function fetchWorkspaceInvites(workspaceId: string): Promise<WorkspaceInvite[]> {
  const { data, error } = await supabase
    .from("workspace_invites")
    .select("*")
    .eq("workspace_id", workspaceId)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as WorkspaceInvite[];
}

export async function createWorkspace(name: string): Promise<Workspace> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: ws, error } = await supabase
    .from("workspaces")
    .insert({ name, owner_id: user.id, is_personal: false, plan: "personal" })
    .select()
    .single();
  if (error) throw error;

  const { error: mErr } = await supabase
    .from("workspace_members")
    .insert({ workspace_id: ws.id, user_id: user.id, role: "owner" });
  if (mErr) throw mErr;

  return ws as Workspace;
}

export async function inviteToWorkspace(workspaceId: string, email: string, role: WorkspaceRole) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("workspace_invites")
    .insert({ workspace_id: workspaceId, email: email.toLowerCase().trim(), role, invited_by: user.id })
    .select()
    .single();
  if (error) throw error;
  return data as WorkspaceInvite;
}

export async function updateMemberRole(memberId: string, role: WorkspaceRole) {
  const { error } = await supabase.from("workspace_members").update({ role }).eq("id", memberId);
  if (error) throw error;
}

export async function removeMember(memberId: string) {
  const { error } = await supabase.from("workspace_members").delete().eq("id", memberId);
  if (error) throw error;
}

export async function cancelInvite(inviteId: string) {
  const { error } = await supabase.from("workspace_invites").delete().eq("id", inviteId);
  if (error) throw error;
}

export function roleAtLeast(role: WorkspaceRole | null, min: WorkspaceRole): boolean {
  const rank: Record<WorkspaceRole, number> = { owner: 4, admin: 3, editor: 2, viewer: 1 };
  if (!role) return false;
  return rank[role] >= rank[min];
}