/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://jrbuplweajtvgkxmimim.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyYnVwbHdlYWp0dmdreG1pbWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MzQ5MzYsImV4cCI6MjA5NTIxMDkzNn0.VnfOy22257mFd2vbt5_uls3WRRrMLmSj7nIFRlB0OdM';

const isNative = Capacitor.isNativePlatform();

const fetchWithTimeout = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      throw new Error('Connection timed out. Check your internet and try again.');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    ...(isNative ? { flowType: 'pkce' as const } : {}),
  },
  global: {
    fetch: fetchWithTimeout,
  },
});

export type AuthUser = {
  id: string;
  email: string | undefined;
};
