import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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

        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarded")
          .eq("id", session.user.id)
          .single();

        const destination = profile?.onboarded ? "/app/dashboard" : "/app/onboarding";
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
