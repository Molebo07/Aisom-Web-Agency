import { Button } from "@/components/ui/button";
import { Plus, FolderKanban } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const projects = [
  { id: "1", name: "Aisom App", description: "Personal knowledge system for developers", cards: 23, color: "#0B1220" },
  { id: "2", name: "CLI Tool", description: "Command-line interface for quick card capture", cards: 8, color: "#1A7A3A" },
  { id: "3", name: "Design System", description: "Shared component library and tokens", cards: 12, color: "#B45309" },
];

export default function Projects() {
  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Projects</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <div key={project.id} className="aisom-card cursor-pointer group">
            <div className="flex items-start gap-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: project.color }}
              >
                <FolderKanban className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{project.name}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>
                <p className="text-xs text-muted-foreground mt-2">{project.cards} cards</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
