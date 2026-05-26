import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { initializeRevenueCat, getOfferings, purchasePackage, checkIsPro } from '../lib/revenuecat';
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

  const [monthlyPlan, setMonthlyPlan] = useState<ProPlan>({
    label: 'Monthly', price: '$0.99', period: '/month', pkg: null,
  });
  const [lifetimePlan, setLifetimePlan] = useState<ProPlan>({
    label: 'Lifetime', price: '$3.99', period: 'one-time', pkg: null,
  });

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    (async () => {
      try {
        // ── Initialize RevenueCat SDK first ──
        await initializeRevenueCat();

        // ── RevenueCat entitlement verification on every app launch ──
        // Always check server-side entitlement — cannot be spoofed by
        // clearing localStorage because RevenueCat validates against
        // Google Play servers.
        const entitledOnServer = await checkIsPro();
        if (entitledOnServer) {
          setIsPro(true);
          saveLocalPro(true);
        } else {
          // Revoke if server says not entitled (e.g. refund, expiry)
          setIsPro(false);
          saveLocalPro(false);
        }

        // ── Load live prices from offerings ──
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
        }
      } catch {}
      setOfferingsLoading(false);
    })();
  }, []);

  const purchasePlan = useCallback(async (plan: 'monthly' | 'lifetime'): Promise<{ success: boolean; error?: string }> => {
    setPurchasing(true);
    try {
      const planData = plan === 'monthly' ? monthlyPlan : lifetimePlan;
      if (Capacitor.isNativePlatform() && planData.pkg) {
        const result = await purchasePackage(planData.pkg);
        if (result.success) { setIsPro(true); saveLocalPro(true); }
        return result;
      }
      // Web/dev: activate directly for testing
      setIsPro(true);
      saveLocalPro(true);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message ?? 'Purchase failed' };
    } finally {
      setPurchasing(false);
    }
  }, [monthlyPlan, lifetimePlan]);

  return {
    isPro, purchasing, offeringsLoading,
    monthlyPlan, lifetimePlan,
    purchasePlan,
  };
};
