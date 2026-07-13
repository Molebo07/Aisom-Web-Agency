import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/hooks/useWorkspace";
import {
  fetchWorkspaceMembers,
  fetchWorkspaceInvites,
  inviteToWorkspace,
  updateMemberRole,
  removeMember,
  cancelInvite,
  roleAtLeast,
  type WorkspaceRole,
} from "@/lib/workspaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const roleOptions: WorkspaceRole[] = ["viewer", "editor", "admin", "owner"];

export default function WorkspaceMembers() {
  const { activeWorkspace, myRole } = useWorkspace();
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("editor");
  const [saving, setSaving] = useState(false);

  const canAdmin = roleAtLeast(myRole, "admin");
  const isTeamPlan = activeWorkspace?.plan === "team";

  const { data: members = [] } = useQuery({
    queryKey: ["workspace-members", activeWorkspace?.id],
    queryFn: () => (activeWorkspace ? fetchWorkspaceMembers(activeWorkspace.id) : Promise.resolve([])),
    enabled: !!activeWorkspace,
  });

  const { data: invites = [] } = useQuery({
    queryKey: ["workspace-invites", activeWorkspace?.id],
    queryFn: () => (activeWorkspace ? fetchWorkspaceInvites(activeWorkspace.id) : Promise.resolve([])),
    enabled: !!activeWorkspace && canAdmin,
  });

  if (!activeWorkspace) {
    return <div className="p-8 text-muted-foreground">Loading workspace…</div>;
  }

  const handleInvite = async () => {
    if (!email.trim() || !activeWorkspace) return;
    setSaving(true);
    try {
      await inviteToWorkspace(activeWorkspace.id, email, inviteRole);
      setEmail("");
      await qc.invalidateQueries({ queryKey: ["workspace-invites", activeWorkspace.id] });
      toast.success(`Invited ${email}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to invite");
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (memberId: string, role: WorkspaceRole) => {
    try {
      await updateMemberRole(memberId, role);
      await qc.invalidateQueries({ queryKey: ["workspace-members", activeWorkspace.id] });
      toast.success("Role updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update role");
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      await removeMember(memberId);
      await qc.invalidateQueries({ queryKey: ["workspace-members", activeWorkspace.id] });
      toast.success("Member removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove member");
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await cancelInvite(inviteId);
      await qc.invalidateQueries({ queryKey: ["workspace-invites", activeWorkspace.id] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to cancel invite");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{activeWorkspace.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {activeWorkspace.is_personal ? "Your personal workspace" : "Team workspace"} · Plan: {activeWorkspace.plan}
        </p>
      </div>

      {/* Invite */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Invite team members</h2>
          {!isTeamPlan && (
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3" /> Team plan required
            </Badge>
          )}
        </div>

        {!isTeamPlan ? (
          <div className="rounded-lg border border-dashed p-4 text-sm">
            <p className="text-muted-foreground mb-3">
              Inviting teammates is a Team plan feature. Upgrade this workspace to invite others and share your knowledge base.
            </p>
            <Button asChild size="sm">
              <Link to="/checkout?plan=team">Upgrade to Team</Link>
            </Button>
          </div>
        ) : !canAdmin ? (
          <p className="text-sm text-muted-foreground">Only admins and owners can invite members.</p>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <div className="flex-1">
              <Label htmlFor="invite-email" className="text-xs">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@example.com"
              />
            </div>
            <div className="w-full sm:w-40">
              <Label className="text-xs">Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as WorkspaceRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleInvite} disabled={saving || !email.trim()}>
              Send invite
            </Button>
          </div>
        )}
      </Card>

      {/* Members */}
      <Card className="p-5 mb-6">
        <h2 className="text-sm font-semibold mb-4">Members ({members.length})</h2>
        <div className="divide-y">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {m.profile?.display_name ?? "Member"}
                </p>
                <p className="text-xs text-muted-foreground">{m.role}</p>
              </div>
              <div className="flex items-center gap-2">
                {canAdmin && m.role !== "owner" ? (
                  <Select value={m.role} onValueChange={(v) => handleRoleChange(m.id, v as WorkspaceRole)}>
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.filter((r) => r !== "owner").map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className="capitalize">{m.role}</Badge>
                )}
                {canAdmin && m.role !== "owner" && (
                  <Button variant="ghost" size="icon" onClick={() => handleRemove(m.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Pending invites */}
      {canAdmin && invites.length > 0 && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold mb-4">Pending invites</h2>
          <div className="divide-y">
            {invites.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="text-sm truncate">{inv.email}</p>
                  <p className="text-xs text-muted-foreground">{inv.role}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleCancelInvite(inv.id)}>
                  Cancel
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}