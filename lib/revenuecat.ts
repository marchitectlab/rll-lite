import { Purchases, LOG_LEVEL, PurchasesPackage, CustomerInfo, Offerings } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

export const REVENUECAT_API_KEY = 'goog_KgAFOsBJYohudnACLWCIbgABOSu';
export const ENTITLEMENT_ID = 'pro';

// ---------------------------------------------------------------------------
// RC readiness gate — waitForRC() resolves once configure() finishes
// ---------------------------------------------------------------------------
let _rcResolve: (() => void) | null = null;
let _rcReject: ((e: unknown) => void) | null = null;
let _rcReady = false;
let _rcError: unknown = null;

const _rcPromise: Promise<void> = new Promise((res, rej) => {
  _rcResolve = res;
  _rcReject = rej;
});

/** Waits until initializeRevenueCat() has completed (or thrown). */
export function waitForRC(): Promise<void> {
  if (_rcReady) return Promise.resolve();
  if (_rcError) return Promise.reject(_rcError);
  return _rcPromise;
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------
export async function initializeRevenueCat(userId?: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.log('[RC] Not a native platform — skipping initialization.');
    _rcReady = true;
    _rcResolve?.();
    return;
  }

  try {
    console.log('[RC] initializeRevenueCat — start. userId:', userId ?? '(anonymous)');
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    console.log('[RC] Purchases.configure() — SUCCESS');

    if (userId) {
      await Purchases.logIn({ appUserID: userId });
      console.log('[RC] Purchases.logIn() — SUCCESS, appUserID:', userId);
    }

    _rcReady = true;
    _rcResolve?.();
    console.log('[RC] initializeRevenueCat — COMPLETE');
  } catch (e: any) {
    console.error('[RC] initializeRevenueCat — FAILED:', e?.message ?? e);
    _rcError = e;
    _rcReject?.(e);
  }
}

// ---------------------------------------------------------------------------
// Customer info / entitlement
// ---------------------------------------------------------------------------
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (e: any) {
    console.error('[RC] getCustomerInfo error:', e?.message ?? e);
    return null;
  }
}

export async function checkIsPro(): Promise<boolean> {
  const info = await getCustomerInfo();
  if (!info) return false;
  return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
}

// ---------------------------------------------------------------------------
// Offerings — always returns { offerings, error }, never null
// ---------------------------------------------------------------------------
export async function getOfferings(): Promise<{ offerings: Offerings | null; error: string | null }> {
  if (!Capacitor.isNativePlatform()) {
    return { offerings: null, error: 'Not a native platform.' };
  }

  try {
    console.log('[RC] Purchases.getOfferings() — calling…');
    const result = await Purchases.getOfferings();
    const offerings = result.offerings;

    console.log('[RC] Purchases.getOfferings() — raw result keys:', Object.keys(result));
    console.log('[RC] offerings.current:', offerings?.current?.identifier ?? 'null');

    const pkgs = offerings?.current?.availablePackages ?? [];
    console.log(
      '[RC] availablePackages (' + pkgs.length + '):',
      pkgs.map(p => ({
        id: p.identifier,
        type: p.packageType,
        productId: p.product?.identifier,
        price: p.product?.priceString,
      }))
    );

    if (!offerings?.current) {
      const msg = `Purchases.getOfferings() succeeded but offerings.current is null. All offerings keys: [${Object.keys(offerings ?? {}).join(', ')}]`;
      console.warn('[RC]', msg);
      return { offerings: null, error: msg };
    }

    return { offerings, error: null };
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    console.error('[RC] Purchases.getOfferings() — THREW:', msg, e);
    return { offerings: null, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Paywall (RC-hosted, optional)
// ---------------------------------------------------------------------------
export type PaywallResult = 'PURCHASED' | 'RESTORED' | 'NOT_PRESENTED' | 'ERROR' | 'CANCELLED';

export async function presentRCPaywall(): Promise<PaywallResult> {
  if (!Capacitor.isNativePlatform()) return 'NOT_PRESENTED';
  try {
    const result = await (Purchases as any).presentPaywall({
      requiredEntitlementIdentifier: ENTITLEMENT_ID,
    });
    const r: PaywallResult = result?.paywallResult ?? 'NOT_PRESENTED';
    console.log('[RC] presentPaywall result:', r);
    return r;
  } catch (e) {
    console.warn('[RC] presentPaywall not available or errored, falling back:', e);
    return 'NOT_PRESENTED';
  }
}

// ---------------------------------------------------------------------------
// Purchase & restore
// ---------------------------------------------------------------------------
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
  } catch (e: any) {
    console.error('[RC] restorePurchases error:', e?.message ?? e);
    return { success: false, wasPro: false };
  }
}
