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
      // ── RC entitlement check on every call ──
      // AppRoot.tsx already called initializeRevenueCat() — do NOT call it
      // again here. Calling Purchases.configure() twice on v9 throws and
      // the subsequent getOfferings() call would silently fail.
      const entitledOnServer = await checkIsPro();
      if (entitledOnServer) {
        setIsPro(true);
        saveLocalPro(true);
      } else {
        setIsPro(false);
        saveLocalPro(false);
      }

      // ── Load live prices from RC offerings ──
      const offerings = await getOfferings();
      if (offerings?.current) {
        const pkgs = offerings.current.availablePackages;

        const monthly = pkgs.find(p =>
          p.packageType === 'MONTHLY' ||
          p.identifier.toLowerCase().includes('month')
        ) ?? pkgs[0] ?? null;

        const lifetime = pkgs.find(p =>
          p.packageType === 'LIFETIME' ||
          p.identifier.toLowerCase().includes('lifetime')
        ) ?? pkgs.find(p =>
          p.packageType === 'ANNUAL' ||
          p.identifier.toLowerCase().includes('annual')
        ) ?? (pkgs.length > 1 ? pkgs[1] : null);

        if (monthly) setMonthlyPlan({
          label: 'Monthly', price: monthly.product.priceString, period: '/month', pkg: monthly,
        });
        if (lifetime) setLifetimePlan({
          label: 'Lifetime', price: lifetime.product.priceString, period: 'one-time', pkg: lifetime,
        });

        // If we got offerings but still no packages, flag as error
        if (!monthly && !lifetime) setOfferingsError(true);
      } else {
        // No current offering configured in RevenueCat dashboard
        setOfferingsError(true);
      }
    } catch {
      setOfferingsError(true);
    }
    setOfferingsLoading(false);
  }, []);

  useEffect(() => {
    // Small delay so AppRoot.tsx's initializeRevenueCat() finishes first
    const t = setTimeout(loadOfferings, 300);
    return () => clearTimeout(t);
  }, [loadOfferings]);

  const purchasePlan = useCallback(async (plan: 'monthly' | 'lifetime'): Promise<{ success: boolean; error?: string }> => {
    setPurchasing(true);
    try {
      const planData = plan === 'monthly' ? monthlyPlan : lifetimePlan;

      if (!Capacitor.isNativePlatform()) {
        return { success: false, error: 'Purchases are only available in the Android app.' };
      }

      if (!planData.pkg) {
        return { success: false, error: 'Store not available. Check your connection and tap Retry.' };
      }

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
  };
};
