import {
  LayoutDashboard,
  Layers,
  FolderKanban,
  Search,
  Settings,
  Terminal,
  Plus,
  Users,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/lib/api";
import { WorkspaceSwitcher } from "@/components/app/WorkspaceSwitcher";

const navItems = [
  { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
  { title: "Cards", url: "/app/cards", icon: Layers },
  { title: "Projects", url: "/app/projects", icon: FolderKanban },
  { title: "Search", url: "/app/search", icon: Search },
];

const bottomItems = [
  { title: "Workspace", url: "/app/workspace", icon: Users },
  { title: "Settings", url: "/app/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link to="/app/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent">
            <Terminal className="h-4 w-4 text-sidebar-accent-foreground" />
          </div>
          {!collapsed && (
            <span className="text-base font-semibold text-sidebar-foreground tracking-tight">
              Aisom
            </span>
          )}
        </Link>
        {!collapsed && (
          <div className="mt-2">
            <WorkspaceSwitcher />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/50">Navigate</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent/50 text-sidebar-foreground/70"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <SidebarGroup>
            <div className="flex items-center justify-between px-2">
              <SidebarGroupLabel className="text-sidebar-foreground/50">Projects</SidebarGroupLabel>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50" asChild>
                <Link to="/app/projects">
                  <Plus className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {projects.length === 0 ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton className="text-sidebar-foreground/40 text-sm" asChild>
                      <Link to="/app/projects">No projects yet</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : (
                  projects.slice(0, 5).map((project) => (
                    <SidebarMenuItem key={project.id}>
                      <SidebarMenuButton asChild className="text-sidebar-foreground/70 hover:bg-sidebar-accent/50">
                        <Link to={`/app/projects?projectId=${project.id}`}>
                          <div
                            className="h-2.5 w-2.5 rounded-full mr-2 shrink-0"
                            style={{ backgroundColor: project.color || "hsl(var(--sidebar-foreground) / 0.3)" }}
                          />
                          <span className="text-sm truncate">{project.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  className="hover:bg-sidebar-accent/50 text-sidebar-foreground/70"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        {!collapsed && (
          <div className="px-3 pt-2 pb-1">
            <p className="text-[10px] text-sidebar-foreground/30 font-mono">⌘K search · ⌘N new card</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
