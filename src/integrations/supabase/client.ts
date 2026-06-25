import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Create a secure Supabase client using browser-based cookie storage
// This is more secure than localStorage for sensitive auth tokens
export const supabase = createBrowserClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    cookieOptions: {
      name: 'sb-auth',
      lifetime: 60 * 60 * 24 * 365,
      domain: '',
      path: '/',
      sameSite: 'Lax',
      secure: true,
    },
  }
);