import { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setAuthState({ user: session?.user ?? null, session, loading: false, error: null });
      })
      .catch(() => {
        setAuthState({ user: null, session: null, loading: false, error: null });
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({ user: session?.user ?? null, session, loading: false, error: null });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setAuthState(s => ({ ...s, loading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setAuthState(s => ({ ...s, loading: false, error: error.message }));
        return { success: false, needsConfirmation: false };
      }
      const needsConfirmation = !data.session;
      setAuthState(s => ({ ...s, loading: false }));
      return { success: true, needsConfirmation };
    } catch {
      setAuthState(s => ({ ...s, loading: false, error: 'Connection failed. Check your internet and try again.' }));
      return { success: false, needsConfirmation: false };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthState(s => ({ ...s, loading: true, error: null }));
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthState(s => ({ ...s, loading: false, error: error.message }));
        return false;
      }
      setAuthState(s => ({ ...s, loading: false }));
      return true;
    } catch {
      setAuthState(s => ({ ...s, loading: false, error: 'Connection failed. Check your internet and try again.' }));
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    try { await supabase.auth.signOut(); } catch {}
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setAuthState(s => ({ ...s, loading: true, error: null }));
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://rll.app/reset-password',
      });
      setAuthState(s => ({ ...s, loading: false, error: error?.message ?? null }));
      return !error;
    } catch {
      setAuthState(s => ({ ...s, loading: false, error: 'Connection failed.' }));
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthState(s => ({ ...s, error: null }));
  }, []);

  return { ...authState, signUp, signIn, signOut, resetPassword, clearError };
};
