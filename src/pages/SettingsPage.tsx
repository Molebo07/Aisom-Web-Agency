import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProfile, updateProfile } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function SettingsPage() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setUsername(profile.username || "");
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: () => updateProfile({ display_name: displayName, username }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Settings</h1>

      <section className="space-y-4 mb-8">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Profile</h2>
        <p className="text-xs text-muted-foreground">{user?.email}</p>
        <div className="space-y-3">
          <div>
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="mt-1.5 max-w-sm" />
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@username" className="mt-1.5 max-w-sm" />
          </div>
        </div>
        <Button size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
      </section>

      <Separator className="my-8" />
      <section className="space-y-4 mb-8">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Billing</h2>
        <p className="text-sm text-muted-foreground">Upgrade or renew your subscription through Payfast.</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/checkout?plan=pro&annual=0">Payfast monthly</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/checkout?plan=pro&annual=1">Payfast annual</Link>
          </Button>
        </div>
      </section>

      <Separator className="my-8" />
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Keyboard Shortcuts</h2>
        <div className="space-y-2">
          {[
            ["⌘ K / Ctrl K", "Open command palette"],
            ["⌘ E / Ctrl E", "New card"],
            ["Esc", "Close sheet / dialog"],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-muted-foreground">{desc}</span>
              <kbd className="text-xs font-mono bg-secondary px-2 py-1 rounded">{key}</kbd>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Account</h2>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </section>
    </div>
  );
}
