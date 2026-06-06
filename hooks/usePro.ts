import { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { getOfferings, purchasePackage, checkIsPro, restorePurchases, waitForRC } from '../lib/revenuecat';
import { PurchasesPackage } from '@revenuecat/purchases-capacitor';

const PRO_STORAGE_KEY = 'rll_is_pro';

const loadLocalPro = (): boolean => {
  try { return localStorage.getItem(PRO_STORAGE_KEY) === 'true'; } catch { return false; }
};
const saveLocalPro = (val: boolean) => {
  try { localStorage.setItem(PRO_STORAGE_KEY, val ? 'true' : 'false'); } catch {}
};

export type ProPlan = {
  label: string;
  price: string;
  period: string;
  pkg: PurchasesPackage | null;
};

function findMonthly(pkgs: PurchasesPackage[]): PurchasesPackage | null {
  return (
    pkgs.find(p => p.packageType === 'MONTHLY') ??
    pkgs.find(p => p.identifier.toLowerCase().includes('month')) ??
    null
  );
}

function findLifetime(pkgs: PurchasesPackage[]): PurchasesPackage | null {
  return (
    pkgs.find(p => p.packageType === 'LIFETIME') ??
    pkgs.find(p =>
      p.identifier.toLowerCase().includes('lifetime') ||
      p.identifier.toLowerCase().includes('life') ||
      p.packageType === 'UNKNOWN'
    ) ??
    null
  );
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export const usePro = () => {
  const [isPro, setIsPro] = useState<boolean>(loadLocalPro);
  const [purchasing, setPurchasing] = useState(false);
  const [offeringsLoading, setOfferingsLoading] = useState(Capacitor.isNativePlatform());
  const [offeringsError, setOfferingsError] = useState(false);
  const [offeringsErrorMsg, setOfferingsErrorMsg] = useState<string>('');
  const loadingRef = useRef(false);

  const [monthlyPlan, setMonthlyPlan] = useState<ProPlan>({
    label: 'Monthly', price: '$0.99', period: '/month', pkg: null,
  });
  const [lifetimePlan, setLifetimePlan] = useState<ProPlan>({
    label: 'Lifetime', price: '$3.99', period: 'one-time', pkg: null,
  });

  const loadOfferings = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    if (loadingRef.current) return;
    loadingRef.current = true;
    setOfferingsLoading(true);
    setOfferingsError(false);
    setOfferingsErrorMsg('');

    try {
      await waitForRC();

      // Check entitlement first — avoids unnecessary offerings load if already pro
      const entitledOnServer = await checkIsPro().catch(() => false);
      if (entitledOnServer) {
        setIsPro(true);
        saveLocalPro(true);
        setOfferingsLoading(false);
        loadingRef.current = false;
        return;
      } else {
        setIsPro(false);
        saveLocalPro(false);
      }

      // Retry getOfferings up to 3 times with 1 s between attempts
      let lastError = '';
      let packages: PurchasesPackage[] = [];

      for (let attempt = 1; attempt <= 3; attempt++) {
        const { offerings, error } = await getOfferings();
        if (error) {
          lastError = error;
          console.warn(`[usePro] getOfferings attempt ${attempt} failed:`, error);
          if (attempt < 3) await sleep(1000 * attempt);
          continue;
        }
        if (offerings?.current) {
          packages = offerings.current.availablePackages;
          console.log(`[usePro] attempt ${attempt} — packages:`, packages.map(p => ({
            id: p.identifier, type: p.packageType, price: p.product.priceString,
          })));
          lastError = '';
          break;
        }
        lastError = `offerings.current is null (attempt ${attempt})`;
        console.warn('[usePro]', lastError);
        if (attempt < 3) await sleep(1000 * attempt);
      }

      if (packages.length === 0) {
        console.error('[usePro] No packages after 3 attempts. Last error:', lastError);
        setOfferingsErrorMsg(lastError || 'No packages found in RC offering after 3 attempts.');
        setOfferingsError(true);
        setOfferingsLoading(false);
        loadingRef.current = false;
        return;
      }

      // Match monthly and lifetime; fall back to first/last package if needed
      const monthly = findMonthly(packages);
      const lifetime = findLifetime(packages);

      // If nothing matched cleanly, use whatever we have
      const effectiveMonthly = monthly ?? (packages.length >= 2 ? packages[0] : null);
      const effectiveLifetime = lifetime ?? packages[packages.length - 1];

      if (effectiveMonthly) {
        setMonthlyPlan({
          label: 'Monthly',
          price: effectiveMonthly.product.priceString,
          period: '/month',
          pkg: effectiveMonthly,
        });
      }
      if (effectiveLifetime) {
        setLifetimePlan({
          label: 'Lifetime',
          price: effectiveLifetime.product.priceString,
          period: 'one-time',
          pkg: effectiveLifetime,
        });
      }

    } catch (e: any) {
      const msg = e?.message ?? String(e);
      console.error('[usePro] unexpected error:', msg);
      setOfferingsErrorMsg(msg);
      setOfferingsError(true);
    }

    setOfferingsLoading(false);
    loadingRef.current = false;
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    loadOfferings();
  }, [loadOfferings]);

  const refreshProStatus = useCallback(async () => {
    try {
      const isNowPro = await checkIsPro();
      setIsPro(isNowPro);
      saveLocalPro(isNowPro);
    } catch (e) {
      console.error('[usePro] refreshProStatus error:', e);
    }
  }, []);

  const purchasePlan = useCallback(async (plan: 'monthly' | 'lifetime'): Promise<{ success: boolean; error?: string }> => {
    setPurchasing(true);
    try {
      const planData = plan === 'monthly' ? monthlyPlan : lifetimePlan;

      if (!Capacitor.isNativePlatform()) {
        return { success: false, error: 'Purchases only available in the Android app.' };
      }
      if (!planData.pkg) {
        return { success: false, error: `${plan} plan not loaded yet — tap Retry then try again.` };
      }

      console.log(`[usePro] purchasing ${plan}:`, planData.pkg.identifier);
      const result = await purchasePackage(planData.pkg);
      if (result.success) {
        setIsPro(true);
        saveLocalPro(true);
      }
      return result;
    } catch (e: any) {
      return { success: false, error: e?.message ?? 'Purchase failed.' };
    } finally {
      setPurchasing(false);
    }
  }, [monthlyPlan, lifetimePlan]);

  const restoreProPurchases = useCallback(async (): Promise<{ success: boolean; wasPro: boolean; error?: string }> => {
    if (!Capacitor.isNativePlatform()) {
      return { success: false, wasPro: false, error: 'Restore only available in the Android app.' };
    }
    try {
      const result = await restorePurchases();
      if (result.wasPro) { setIsPro(true); saveLocalPro(true); }
      return result;
    } catch (e: any) {
      return { success: false, wasPro: false, error: e?.message ?? 'Restore failed.' };
    }
  }, []);

  return {
    isPro, purchasing, offeringsLoading, offeringsError, offeringsErrorMsg,
    monthlyPlan, lifetimePlan,
    purchasePlan,
    restoreProPurchases,
    retryOfferings: loadOfferings,
    refreshProStatus,
  };
};
