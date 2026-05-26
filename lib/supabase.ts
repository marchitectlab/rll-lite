import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://jrbuplweajtvgkxmimim.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyYnVwbHdlYWp0dmdreG1pbWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MzQ5MzYsImV4cCI6MjA5NTIxMDkzNn0.VnfOy22257mFd2vbt5_uls3WRRrMLmSj7nIFRlB0OdM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export type AuthUser = {
  id: string;
  email: string | undefined;
};
