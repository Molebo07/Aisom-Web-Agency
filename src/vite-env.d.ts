/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ASSISTANT_DEMO_ENABLED?: string;
  readonly VITE_ASSISTANT_STORAGE_REGION?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}
