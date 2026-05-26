import { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
};

const isNetworkError = (e: unknown): boolean => {
  if (!e) return false;
  const msg = (e instanceof Error ? e.message : String(e)).toLowerCase();
  return (
    msg.includes('fetch') ||
    msg.includes('network') ||
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('timeout') ||
    msg.includes('load failed') ||
    msg.includes('net::')
  );
};

const friendlyError = (e: unknown, fallback = 'Connection failed. Check your internet and try again.'): string => {
  if (!e) return fallback;
  if (isNetworkError(e)) return 'Connection failed. Check your internet and try again.';
  const msg = e instanceof Error ? e.message : String(e);
  return msg || fallback;
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (cancelled) return;
        if (error && isNetworkError(error)) {
          setAuthState({ user: null, session: null, loading: false, error: null });
          return;
        }
        setAuthState({ user: session?.user ?? null, session: session ?? null, loading: false, error: null });
      } catch {
        if (!cancelled) {
          setAuthState({ user: null, session: null, loading: false, error: null });
        }
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setAuthState({ user: session?.user ?? null, session, loading: false, error: null });
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setAuthState(s => ({ ...s, loading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        const msg = isNetworkError(error)
          ? 'Connection failed. Check your internet and try again.'
          : error.message;
        setAuthState(s => ({ ...s, loading: false, error: msg }));
        return { success: false, needsConfirmation: false };
      }
      const needsConfirmation = !data.session;
      setAuthState(s => ({ ...s, loading: false }));
      return { success: true, needsConfirmation };
    } catch (e) {
      setAuthState(s => ({ ...s, loading: false, error: friendlyError(e) }));
      return { success: false, needsConfirmation: false };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthState(s => ({ ...s, loading: true, error: null }));
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const msg = isNetworkError(error)
          ? 'Connection failed. Check your internet and try again.'
          : error.message;
        setAuthState(s => ({ ...s, loading: false, error: msg }));
        return false;
      }
      setAuthState(s => ({ ...s, loading: false }));
      return true;
    } catch (e) {
      setAuthState(s => ({ ...s, loading: false, error: friendlyError(e) }));
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    try { await supabase.auth.signOut(); } catch {}
    setAuthState(s => ({ ...s, user: null, session: null }));
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setAuthState(s => ({ ...s, loading: true, error: null }));
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://rll.app/reset-password',
      });
      if (error && isNetworkError(error)) {
        setAuthState(s => ({ ...s, loading: false, error: 'Connection failed. Check your internet and try again.' }));
        return false;
      }
      setAuthState(s => ({ ...s, loading: false, error: error?.message ?? null }));
      return !error;
    } catch (e) {
      setAuthState(s => ({ ...s, loading: false, error: friendlyError(e, 'Connection failed.') }));
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthState(s => ({ ...s, error: null }));
  }, []);

  return { ...authState, signUp, signIn, signOut, resetPassword, clearError };
};
