import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

async function ensureProfileExists(userId: string) {
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (!existingProfile) {
    // Profile doesn't exist, create it
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0],
        avatar_url: user.user_metadata?.avatar_url || null,
      });

    if (insertError) throw insertError;
  }
}

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase handles the token exchange from URL hash/params automatically
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          navigate("/auth/login?error=auth_failed", { replace: true });
          return;
        }

        // Ensure user profile exists
        await ensureProfileExists(session.user.id);

        // Check if user has completed onboarding
        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("onboarded")
          .eq("id", session.user.id)
          .single();

        const destination = (profile as any)?.onboarded ? "/app/dashboard" : "/app/onboarding";
        navigate(destination, { replace: true });
      } catch {
        navigate("/auth/login?error=auth_failed", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
