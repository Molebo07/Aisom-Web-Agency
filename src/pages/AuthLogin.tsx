import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

// ── Validation ────────────────────────────────────────────────
const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// ── OAuth provider config ─────────────────────────────────────
// BUG FIX: was using lovable.auth.signInWithOAuth which is inconsistent
// with the rest of the file. All auth calls now go through supabase directly.
// BUG FIX: redirect_uri → redirectTo (correct Supabase option key)
const REDIRECT_TO = `${window.location.origin}/auth/callback`;

type OAuthProvider = "google" | "apple" | "github";

// ── Component ─────────────────────────────────────────────────
export default function AuthLogin() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOAuthLoading] = useState<OAuthProvider | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Redirect already-authenticated users
  if (loading) return null;
  if (session) return <Navigate to="/app/dashboard" replace />;

  // ── OAuth sign-in (Google, iCloud, GitHub) ──────────────────
  const handleOAuth = async (provider: OAuthProvider) => {
    setError("");
    setOAuthLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: REDIRECT_TO },
    });
    // setOAuthLoading back to null only on error —
    // on success the page redirects and this component unmounts
    if (error) {
      setError(error.message || `${provider} sign-in failed. Please try again.`);
      setOAuthLoading(null);
    }
  };

  // ── Email + password sign-in ────────────────────────────────
  // BUG FIX: was using signInWithOtp (magic link) — replaced with
  // signInWithPassword so no email verification step is required.
  // BUG FIX: "Send magic link" label → "Sign in"
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      const errs: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as "email" | "password";
        errs[field] = err.message;
      });
      setFieldErrors(errs);
      return;
    }

    setFormLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });
    setFormLoading(false);

    if (error) {
      // Map Supabase error codes to human-readable messages
      const msg =
        error.message === "Invalid login credentials"
          ? "Incorrect email or password. Please try again."
          : error.message;
      setError(msg);
      return;
    }

    // Check onboarding status and route accordingly
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded")
      .eq("id", data.session?.user.id)
      .single();

    navigate(profile?.onboarded ? "/app/dashboard" : "/app/onboarding", {
      replace: true,
    });
  };

  // ── Shared OAuth button component ───────────────────────────
  const OAuthButton = ({
    provider,
    label,
    icon,
  }: {
    provider: OAuthProvider;
    label: string;
    icon: React.ReactNode;
  }) => (
    <Button
      type="button"
      variant="outline"
      className="w-full h-11 font-normal"
      onClick={() => handleOAuth(provider)}
      disabled={oauthLoading !== null || formLoading}
    >
      {oauthLoading === provider ? (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        <span className="mr-2 h-4 w-4 flex items-center justify-center">{icon}</span>
      )}
      {label}
    </Button>
  );

  // ── Render ──────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#F4F6F8" }}
    >
      <div className="w-full max-w-[400px]">
        {/* Wordmark */}
        <div className="text-center mb-6">
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ color: "#0B1220" }}
          >
            Aisom
          </span>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E8ECEF] rounded-[14px] p-10">
          <h1 className="text-[22px] font-semibold text-[#111111] mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-[#888888] mb-6">
            Sign in to your knowledge base.
          </p>

          {/* Global error */}
          {error && (
            <div className="mb-4 rounded-[6px] border border-red-200 bg-red-50 px-3 py-2.5">
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="flex flex-col gap-2.5 mb-5">
            {/* Google */}
            <OAuthButton
              provider="google"
              label="Continue with Google"
              icon={
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              }
            />

            {/* Apple / iCloud */}
            <OAuthButton
              provider="apple"
              label="Continue with Apple"
              icon={
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.39.07 2.36.74 3.17.78 1.21-.24 2.37-.93 3.67-.84 1.57.12 2.75.74 3.51 1.95-3.22 1.95-2.69 5.87.48 7.06-.57 1.53-1.32 3.04-2.83 3.93zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              }
            />

            {/* GitHub */}
            <OAuthButton
              provider="github"
              label="Continue with GitHub"
              icon={
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              }
            />
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8ECEF]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-[#888888]">or</span>
            </div>
          </div>

          {/* Email + Password form */}
          <form onSubmit={handleEmailSignIn} className="space-y-3" noValidate>
            {/* Email */}
            <div>
              <Label htmlFor="email" className="sr-only">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((p) => ({ ...p, email: undefined }));
                  setError("");
                }}
                className={`h-11 ${fieldErrors.email ? "border-red-400 focus-visible:ring-red-300" : ""}`}
                autoComplete="email"
                disabled={formLoading}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-600 mt-1.5">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Label htmlFor="password" className="sr-only">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((p) => ({ ...p, password: undefined }));
                    setError("");
                  }}
                  className={`h-11 pr-10 ${fieldErrors.password ? "border-red-400 focus-visible:ring-red-300" : ""}`}
                  autoComplete="current-password"
                  disabled={formLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888]
                             hover:text-[#444444] transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-600 mt-1.5">{fieldErrors.password}</p>
              )}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                to="/auth/forgot-password"
                className="text-xs text-[#888888] hover:text-[#111111] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 bg-[#0B1220] hover:bg-[#1a2740] text-white"
              disabled={formLoading || oauthLoading !== null}
            >
              {formLoading ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg"
                       fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[#888888] mt-5">
          No account yet?{" "}
          <Link
            to="/auth/signup"
            className="text-[#111111] font-medium hover:underline"
          >
            Create one →
          </Link>
        </p>
      </div>
    </div>
  );
}
