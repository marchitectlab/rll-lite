import { Purchases, LOG_LEVEL, PurchasesPackage, CustomerInfo } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

export const REVENUECAT_API_KEY = 'test_maMzaOVNlYsFIMLkAteqNDwlERW';
export const ENTITLEMENT_ID = 'pro';

export async function initializeRevenueCat(userId?: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    if (userId) {
      await Purchases.logIn({ appUserID: userId });
    }
  } catch (e) {
    console.error('RevenueCat init error:', e);
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (e) {
    console.error('getCustomerInfo error:', e);
    return null;
  }
}

export async function checkIsPro(): Promise<boolean> {
  const info = await getCustomerInfo();
  if (!info) return false;
  return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
}

export async function getOfferings() {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const { offerings } = await Purchases.getOfferings();
    return offerings;
  } catch (e) {
    console.error('getOfferings error:', e);
    return null;
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<{ success: boolean; error?: string }> {
  if (!Capacitor.isNativePlatform()) {
    return { success: true };
  }
  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return { success: isPro };
  } catch (e: any) {
    if (e?.userCancelled) {
      return { success: false, error: 'Purchase cancelled.' };
    }
    return { success: false, error: e?.message ?? 'Purchase failed.' };
  }
}

export async function restorePurchases(): Promise<{ success: boolean; wasPro: boolean }> {
  if (!Capacitor.isNativePlatform()) {
    return { success: true, wasPro: false };
  }
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    const wasPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return { success: true, wasPro };
  } catch (e) {
    console.error('restorePurchases error:', e);
    return { success: false, wasPro: false };
  }
}
