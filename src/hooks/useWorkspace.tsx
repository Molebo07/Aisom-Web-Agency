import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMyWorkspaces, fetchMyRole, type Workspace, type WorkspaceRole } from "@/lib/workspaces";
import { useAuth } from "@/hooks/useAuth";

interface WorkspaceContextValue {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string) => void;
  myRole: WorkspaceRole | null;
  isLoading: boolean;
  refetch: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

const STORAGE_KEY = "aisom.activeWorkspaceId";

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  });

  const { data: workspaces = [], isLoading, refetch } = useQuery({
    queryKey: ["workspaces", user?.id],
    queryFn: fetchMyWorkspaces,
    enabled: !!user,
  });

  // Ensure an active workspace is selected (default to personal one, else first)
  useEffect(() => {
    if (!workspaces.length) return;
    if (activeWorkspaceId && workspaces.some((w) => w.id === activeWorkspaceId)) return;
    const personal = workspaces.find((w) => w.is_personal) || workspaces[0];
    setActiveWorkspaceIdState(personal.id);
    try { localStorage.setItem(STORAGE_KEY, personal.id); } catch { /* ignore */ }
  }, [workspaces, activeWorkspaceId]);

  const setActiveWorkspaceId = (id: string) => {
    setActiveWorkspaceIdState(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch { /* ignore */ }
  };

  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) ?? null,
    [workspaces, activeWorkspaceId]
  );

  const { data: myRole = null } = useQuery({
    queryKey: ["workspace-role", activeWorkspaceId, user?.id],
    queryFn: () => (activeWorkspaceId ? fetchMyRole(activeWorkspaceId) : Promise.resolve(null)),
    enabled: !!activeWorkspaceId && !!user,
  });

  const value: WorkspaceContextValue = {
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    setActiveWorkspaceId,
    myRole,
    isLoading,
    refetch: () => { void refetch(); },
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}