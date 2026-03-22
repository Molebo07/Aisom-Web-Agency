import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Terminal, Github, Mail } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Login() {
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  if (loading) return null;
  if (session) return <Navigate to="/app/dashboard" replace />;

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/app/dashboard" },
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email for the login link!");
    }
  };

  const handleGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: window.location.origin + "/app/dashboard" },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Terminal className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-foreground">Aisom</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your knowledge base</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGitHub}
            className="w-full h-11 bg-[#24292e] hover:bg-[#24292e]/90 text-white"
          >
            <Github className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <form onSubmit={handleMagicLink} className="space-y-3">
            <div>
              <Label htmlFor="email" className="sr-only">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                required
              />
            </div>
            <Button type="submit" variant="outline" className="w-full h-11" disabled={sending}>
              <Mail className="mr-2 h-4 w-4" />
              {sending ? "Sending..." : "Send magic link"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to Aisom's terms of service.
        </p>
      </div>
    </div>
  );
}
