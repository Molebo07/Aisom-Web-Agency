import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { LayoutDashboard, Layers, FolderKanban, Search, Plus, Bug, GitBranch, BookOpen, Package } from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper component to display keyboard shortcuts
function KeyboardShortcut({ mac, windows }: { mac?: string; windows?: string }) {
  const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const shortcut = isMac ? mac : windows;
  if (!shortcut) return null;

  return (
    <kbd className="ml-auto text-[10px] font-mono bg-secondary px-2 py-1 rounded text-muted-foreground">
      {shortcut}
    </kbd>
  );
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K to open command palette
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      // Cmd/Ctrl+T to create new card
      if (e.key === "t" && (e.metaKey || e.ctrlKey) && !open) {
        e.preventDefault();
        navigate("/app/cards/new");
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange, navigate]);

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search cards, navigate, or create..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Create">
          <CommandItem onSelect={() => runCommand(() => navigate("/app/cards/new"))} className="flex items-center justify-between">
            <div className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              New Card
            </div>
            <KeyboardShortcut mac="⌘T" windows="Ctrl+T" />
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate("/app/dashboard"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/app/cards"))}>
            <Layers className="mr-2 h-4 w-4" />
            All Cards
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/app/projects"))}>
            <FolderKanban className="mr-2 h-4 w-4" />
            Projects
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/app/search"))}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Create Card Types">
          <CommandItem onSelect={() => runCommand(() => navigate("/app/cards/new?type=bug"))}>
            <Bug className="mr-2 h-4 w-4" />
            New Bug Card
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/app/cards/new?type=adr"))}>
            <GitBranch className="mr-2 h-4 w-4" />
            New ADR Card
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/app/cards/new?type=concept"))}>
            <BookOpen className="mr-2 h-4 w-4" />
            New Concept Card
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/app/cards/new?type=library"))}>
            <Package className="mr-2 h-4 w-4" />
            New Library Card
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
