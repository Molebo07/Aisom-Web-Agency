import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { hashPassword } from "@/lib/crypto";
import { siteUrl } from "@/lib/siteUrl";

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
  const [success, setSuccess] = useState(false);

  if (loading) return null;
  if (session) return <Navigate to="/app/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    const result = signupSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    
    setSubmitting(true);
    
    // Hash password for client-side security logging
    const passwordHash = hashPassword(password);
    
    const { error } = await supabase.auth.signUp({
      email,
      password, // Send plain password to Supabase (over HTTPS)
      options: {
        emailRedirectTo: siteUrl("/auth/callback"),
      },
    });
    
    setSubmitting(false);
    
    if (error) {
      setError(error.message);
      setPassword(""); // Clear password field
    } else {
      setSuccess(true);
      setEmail("");
      setPassword("");
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

          {success && (
            <div className="flex gap-2 p-3 rounded-lg bg-green-50 border border-green-200 mb-4">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-600">
                <p className="font-medium">Account created successfully!</p>
                <p className="text-xs mt-1">Check your email to confirm your account.</p>
              </div>
            </div>
          )}

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
                disabled={success}
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
                disabled={success}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                disabled={success}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && (
              <div className="flex gap-2 p-2 rounded text-xs bg-destructive/10 border border-destructive/30">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                <p className="text-destructive">{error}</p>
              </div>
            )}
            <Button type="submit" className="w-full h-11 bg-primary" disabled={submitting || success}>
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
