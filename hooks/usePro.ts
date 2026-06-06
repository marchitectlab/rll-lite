import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { getOfferings, purchasePackage, checkIsPro, restorePurchases } from '../lib/revenuecat';
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

/** Match a package as the monthly plan — no dangerous fallbacks. */
function findMonthly(pkgs: PurchasesPackage[]): PurchasesPackage | null {
  return (
    pkgs.find(p => p.packageType === 'MONTHLY') ??
    pkgs.find(p => p.identifier.toLowerCase().includes('month')) ??
    null
  );
}

/** Match a package as the lifetime plan — no dangerous fallbacks. */
function findLifetime(pkgs: PurchasesPackage[]): PurchasesPackage | null {
  return (
    pkgs.find(p => p.packageType === 'LIFETIME') ??
    pkgs.find(p => p.identifier.toLowerCase().includes('lifetime')) ??
    null
  );
}

export const usePro = () => {
  const [isPro, setIsPro] = useState<boolean>(loadLocalPro);
  const [purchasing, setPurchasing] = useState(false);
  const [offeringsLoading, setOfferingsLoading] = useState(Capacitor.isNativePlatform());
  const [offeringsError, setOfferingsError] = useState(false);

  const [monthlyPlan, setMonthlyPlan] = useState<ProPlan>({
    label: 'Monthly', price: '$0.99', period: '/month', pkg: null,
  });
  const [lifetimePlan, setLifetimePlan] = useState<ProPlan>({
    label: 'Lifetime', price: '$3.99', period: 'one-time', pkg: null,
  });

  const loadOfferings = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    setOfferingsLoading(true);
    setOfferingsError(false);
    try {
      const entitledOnServer = await checkIsPro();
      if (entitledOnServer) {
        setIsPro(true);
        saveLocalPro(true);
      } else {
        setIsPro(false);
        saveLocalPro(false);
      }

      const offerings = await getOfferings();

      if (offerings?.current) {
        const pkgs = offerings.current.availablePackages;

        console.log('[usePro] packages from RC:', pkgs.map(p => ({
          id: p.identifier,
          type: p.packageType,
          price: p.product.priceString,
        })));

        const monthly = findMonthly(pkgs);
        const lifetime = findLifetime(pkgs);

        console.log('[usePro] matched monthly:', monthly?.identifier ?? 'none');
        console.log('[usePro] matched lifetime:', lifetime?.identifier ?? 'none');

        if (monthly) {
          setMonthlyPlan({
            label: 'Monthly',
            price: monthly.product.priceString,
            period: '/month',
            pkg: monthly,
          });
        }

        if (lifetime) {
          setLifetimePlan({
            label: 'Lifetime',
            price: lifetime.product.priceString,
            period: 'one-time',
            pkg: lifetime,
          });
        }

        if (!monthly && !lifetime) {
          console.warn('[usePro] No monthly or lifetime package found in current offering.');
          setOfferingsError(true);
        }
      } else {
        console.warn('[usePro] No current offering configured in RevenueCat dashboard.');
        setOfferingsError(true);
      }
    } catch (e) {
      console.error('[usePro] loadOfferings error:', e);
      setOfferingsError(true);
    }
    setOfferingsLoading(false);
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    // Wait 1.5s for RC to finish configure() before the first offerings call.
    // If that still fails, the Retry button in the modal calls loadOfferings again.
    const t = setTimeout(loadOfferings, 1500);
    return () => clearTimeout(t);
  }, [loadOfferings]);

  /** Call after a successful RC paywall purchase to re-sync pro status. */
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
        return { success: false, error: 'Purchases are only available in the Android app.' };
      }

      if (!planData.pkg) {
        return { success: false, error: `The ${plan} plan is not available. Check your RevenueCat offering setup.` };
      }

      console.log(`[usePro] purchasing ${plan} plan:`, planData.pkg.identifier);
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
      if (result.wasPro) {
        setIsPro(true);
        saveLocalPro(true);
      }
      return result;
    } catch (e: any) {
      return { success: false, wasPro: false, error: e?.message ?? 'Restore failed.' };
    }
  }, []);

  return {
    isPro, purchasing, offeringsLoading, offeringsError,
    monthlyPlan, lifetimePlan,
    purchasePlan,
    restoreProPurchases,
    retryOfferings: loadOfferings,
    refreshProStatus,
  };
};
