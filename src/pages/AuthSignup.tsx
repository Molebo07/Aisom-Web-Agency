import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AuthSignup() {
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (loading) return null;
  if (session) return <Navigate to="/app/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = signupSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://aisom.co.za/auth/callback",
      },
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "hsl(210 20% 97%)" }}>
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-6">
          <span className="text-2xl font-bold tracking-tight text-foreground">Aisom</span>
        </div>

        <div className="bg-background border border-border rounded-[14px] p-10">
          <h1 className="text-[22px] font-semibold text-foreground mb-1">Create your account</h1>
          <p className="text-sm text-muted-foreground mb-6">Start building your second brain.</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="email" className="sr-only">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="h-11"
                required
              />
            </div>
            <div className="relative">
              <Label htmlFor="password" className="sr-only">Password</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="h-11 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
            <Button type="submit" className="w-full h-11 bg-primary" disabled={submitting}>
              {submitting ? "Creating account..." : "Sign up"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-foreground font-medium hover:underline">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
