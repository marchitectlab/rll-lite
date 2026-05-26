import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const PRO_STORAGE_KEY = 'rll_is_pro';

const loadLocalPro = (): boolean => {
  try { return localStorage.getItem(PRO_STORAGE_KEY) === 'true'; } catch { return false; }
};

const saveLocalPro = (val: boolean) => {
  try { localStorage.setItem(PRO_STORAGE_KEY, val ? 'true' : 'false'); } catch {}
};

export const usePro = () => {
  const [isPro, setIsPro] = useState<boolean>(loadLocalPro);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // On mount, sync from Supabase user metadata
  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.is_pro === true) {
          setIsPro(true);
          saveLocalPro(true);
        }
      } catch {}
    })();
  }, []);

  const syncProToSupabase = useCallback(async (val: boolean) => {
    try {
      await supabase.auth.updateUser({ data: { is_pro: val } });
    } catch {}
  }, []);

  const activatePro = useCallback(async () => {
    setIsPro(true);
    saveLocalPro(true);
    await syncProToSupabase(true);
  }, [syncProToSupabase]);

  // Attempt native in-app purchase; falls back to direct activation for dev/web/sideloaded builds
  const purchasePro = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setPurchasing(true);
    try {
      // On a real native build connected to Google Play, you would call the
      // Play Billing API here (e.g. via a RevenueCat Capacitor plugin or
      // your own billing integration). For now we activate directly so the
      // full UI/UX flow works on dev, web, and sideloaded APKs.
      await activatePro();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message ?? 'Purchase failed' };
    } finally {
      setPurchasing(false);
    }
  }, [activatePro]);

  const restorePurchases = useCallback(async (): Promise<{ success: boolean; wasPro: boolean }> => {
    setRestoring(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const cloudPro = user?.user_metadata?.is_pro === true;
      if (cloudPro) {
        setIsPro(true);
        saveLocalPro(true);
        return { success: true, wasPro: true };
      }
      return { success: true, wasPro: false };
    } catch {
      return { success: false, wasPro: false };
    } finally {
      setRestoring(false);
    }
  }, []);

  return { isPro, purchasing, restoring, purchasePro, restorePurchases };
};
