import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { hashPassword } from "@/lib/crypto";
import { isAccountLocked, recordFailedAttempt, getLockoutTimeRemaining, clearFailedAttempts, formatLockoutTime } from "@/lib/loginLockout";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AuthLogin() {
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

  useEffect(() => {
    // Check if account is locked
    const locked = isAccountLocked(email);
    setIsLocked(locked);
    
    if (locked) {
      const remaining = getLockoutTimeRemaining(email);
      setLockoutTimeRemaining(remaining);
      
      // Update countdown every second
      const interval = setInterval(() => {
        const newRemaining = getLockoutTimeRemaining(email);
        setLockoutTimeRemaining(newRemaining);
        
        if (newRemaining <= 0) {
          setIsLocked(false);
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [email]);

  if (loading) return null;
  if (session) return <Navigate to="/app/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Check if account is locked
    if (isAccountLocked(email)) {
      const remaining = getLockoutTimeRemaining(email);
      setError(`Account temporarily locked. Try again in ${formatLockoutTime(remaining)}.`);
      return;
    }
    
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    
    setSubmitting(true);
    
    // Use the plain password with Supabase (they handle encryption over HTTPS)
    // But we also hash it on the client for additional security logging
    const passwordHash = hashPassword(password);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password, // Send plain password to Supabase (over HTTPS)
    });
    
    setSubmitting(false);
    
    if (error) {
      // Record failed attempt
      recordFailedAttempt(email);
      
      // Check if just locked
      if (isAccountLocked(email)) {
        const remaining = getLockoutTimeRemaining(email);
        setError(`${error.message}. Account locked for ${formatLockoutTime(remaining)}.`);
        setIsLocked(true);
        setLockoutTimeRemaining(remaining);
      } else {
        setError(error.message);
      }
      setPassword(""); // Clear password field
    } else {
      // Clear failed attempts on successful login
      clearFailedAttempts(email);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "hsl(210 20% 97%)" }}>
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-6">
          <span className="text-2xl font-bold tracking-tight text-foreground">Aisom</span>
        </div>

        <div className="bg-background border border-border rounded-[14px] p-10">
          <h1 className="text-[22px] font-semibold text-foreground mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-6">Sign in to your knowledge base.</p>

          <Button type="button" variant="outline" className="w-full mb-4 h-11" onClick={handleGoogleSignIn}>
            Continue with Google
          </Button>

          {isLocked && (
            <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 mb-4">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm text-destructive">
                <p className="font-medium">Account temporarily locked</p>
                <p className="text-xs mt-1">Try again in {formatLockoutTime(lockoutTimeRemaining)}</p>
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
                autoFocus
                disabled={isLocked}
              />
            </div>
            <div className="relative">
              <Label htmlFor="password" className="sr-only">Password</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="h-11 pr-10"
                required
                disabled={isLocked}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                disabled={isLocked}
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
            {magicLinkSent && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                <p>Check your inbox</p>
                <p className="text-xs text-emerald-700">We sent the magic link to your email.</p>
              </div>
            )}
            <Button type="button" className="w-full h-11 bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={handleSendMagicLink} disabled={submitting || isLocked}>
              Send magic link
            </Button>
            <Button type="submit" className="w-full h-11 bg-primary" disabled={submitting || isLocked}>
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          No account yet?{" "}
          <Link to="/auth/signup" className="text-foreground font-medium hover:underline">
            Create one →
          </Link>
        </p>
      </div>
    </div>
  );
}
