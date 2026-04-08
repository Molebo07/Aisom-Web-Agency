import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";
import { CommandPalette } from "@/components/app/CommandPalette";
import { ProfileMenu } from "@/components/app/ProfileMenu";
import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Plus } from "lucide-react";

// Helper component to display keyboard shortcuts
function KeyboardShortcut({ mac, windows }: { mac?: string; windows?: string }) {
  const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const shortcut = isMac ? mac : windows;
  if (!shortcut) return null;

  return (
    <kbd className="text-[10px] font-mono bg-secondary px-1.5 py-0.5 rounded">
      {shortcut}
    </kbd>
  );
}

export default function AppLayout() {
  const [commandOpen, setCommandOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="h-14 flex items-center justify-between border-b px-4 bg-background shrink-0">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <button
              onClick={() => navigate("/app/cards/new")}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Card</span>
              <KeyboardShortcut mac="⌘E" windows="Ctrl+E" />
            </button>
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <span>Search cards...</span>
              <KeyboardShortcut mac="⌘K" windows="Ctrl+K" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <ProfileMenu />
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </SidebarProvider>
  );
}
