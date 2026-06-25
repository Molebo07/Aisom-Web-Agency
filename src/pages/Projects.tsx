import { Button } from "@/components/ui/button";
import { Plus, FolderKanban } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProjects, createProject, type Project } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Projects() {
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  useEffect(() => {
    const id = searchParams.get("projectId");
    if (id && projects.length) {
      const p = projects.find((pr) => pr.id === id);
      if (p) setSelectedProject(p);
    }
  }, [searchParams, projects]);

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created!");
      setOpen(false);
      setName("");
      setDescription("");
      setRepoUrl("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Projects</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />New Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label htmlFor="pname">Name</Label>
                <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="pdesc">Description</Label>
                <Textarea id="pdesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this project?" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="prepo">Repository URL</Label>
                <Input id="prepo" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/..." className="mt-1.5" />
              </div>
              <Button onClick={() => mutation.mutate({ name, description, repo_url: repoUrl })} disabled={!name.trim() || mutation.isPending}>
                {mutation.isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-2">No projects yet</p>
          <Button size="sm" onClick={() => setOpen(true)}>Create your first project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="aisom-card cursor-pointer group" onClick={() => setSelectedProject(project)}>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: project.color }}>
                  <FolderKanban className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{project.name}</h3>
                  {project.description && <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={!!selectedProject} onOpenChange={(openState) => {
        if (!openState) {
          setSelectedProject(null);
          if (searchParams.get("projectId")) {
            searchParams.delete("projectId");
            setSearchParams(searchParams, { replace: true });
          }
        }
      }}>
        <SheetContent side="right" className="w-full sm:w-[520px] p-0">
          <SheetHeader className="p-6">
            <SheetTitle>{selectedProject?.name || "Project details"}</SheetTitle>
          </SheetHeader>

          {selectedProject ? (
            <div className="space-y-6 p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl" style={{ backgroundColor: selectedProject.color }} />
                <div>
                  <p className="text-sm text-muted-foreground">Project</p>
                  <h2 className="text-lg font-semibold text-foreground">{selectedProject.name}</h2>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="rounded-xl border border-border p-4 bg-background text-sm">{selectedProject.description || "No description provided."}</p>
              </div>

              {selectedProject.repo_url && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Repository URL</p>
                  <a
                    href={selectedProject.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl border border-border p-4 text-sm text-primary underline-offset-2 hover:underline"
                  >
                    {selectedProject.repo_url}
                  </a>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button asChild>
                  <Link to={`/app/cards/new?type=project&projectId=${selectedProject.id}`}>Create a project card</Link>
                </Button>
                {selectedProject.repo_url ? (
                  <Button variant="outline" asChild>
                    <a href={selectedProject.repo_url} target="_blank" rel="noreferrer">Open repository</a>
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setSelectedProject(null)}>Close</Button>
                )}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
