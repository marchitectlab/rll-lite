import { Purchases, LOG_LEVEL, PurchasesPackage, CustomerInfo, PurchasesOfferings } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

export const REVENUECAT_API_KEY = 'goog_KgAFOsBJYohudnACLWCIbgABOSu';
export const ENTITLEMENT_ID = 'pro';

// ---------------------------------------------------------------------------
// Error serialization — RC errors are NOT standard JS Error objects.
// They look like: { code, message, underlyingErrorMessage, userInfo }
// ---------------------------------------------------------------------------
export function serializeRCError(e: unknown): string {
  if (e === null || e === undefined) return 'Unknown error (null/undefined)';
  if (typeof e === 'string') return e;
  if (typeof e === 'number') return `Error code: ${e}`;

  try {
    const obj = e as Record<string, unknown>;
    const parts: string[] = [];

    if (obj.message) parts.push(`message: ${obj.message}`);
    if (obj.code !== undefined) parts.push(`code: ${obj.code}`);
    if (obj.underlyingErrorMessage) parts.push(`underlying: ${obj.underlyingErrorMessage}`);
    if (obj.userInfo) {
      try { parts.push(`userInfo: ${JSON.stringify(obj.userInfo)}`); } catch {}
    }

    if (parts.length > 0) return parts.join(' | ');

    // Fall through to full stringify
    const serialized = JSON.stringify(e, null, 2);
    return serialized.length > 0 ? serialized : String(e);
  } catch {
    return String(e);
  }
}

// ---------------------------------------------------------------------------
// RC readiness gate — waitForRC() resolves once configure() finishes.
// The gate is RESET each time initializeRevenueCat() is called so that
// a second configure() (e.g. after auth resolves) creates a fresh promise.
// ---------------------------------------------------------------------------
let _rcResolve: (() => void) | null = null;
let _rcReject: ((e: unknown) => void) | null = null;
let _rcReady = false;
let _rcError: unknown = null;
let _rcPromise: Promise<void>;

function _resetGate() {
  _rcReady = false;
  _rcError = null;
  _rcPromise = new Promise<void>((res, rej) => {
    _rcResolve = res;
    _rcReject = rej;
  });
}

// Initialize the gate on module load.
_resetGate();

/** Waits until initializeRevenueCat() has completed (or thrown). */
export function waitForRC(): Promise<void> {
  if (_rcReady) return Promise.resolve();
  if (_rcError) return Promise.reject(_rcError);
  return _rcPromise;
}

/** Returns true if RC has been successfully configured. */
export function isRCReady(): boolean {
  return _rcReady;
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------
export async function initializeRevenueCat(userId?: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.log('[RC] Not a native platform — skipping initialization.');
    _rcReady = true;
    _rcError = null;
    _rcResolve?.();
    return;
  }

  // Reset the gate so a fresh promise is returned to any new waitForRC() callers.
  // Any previous callers holding an old rejected promise must retry (tap Retry).
  _resetGate();
  console.log('[RC] initializeRevenueCat — gate reset. userId:', userId ?? '(anonymous)');

  try {
    console.log('[RC] Purchases.setLogLevel(DEBUG)…');
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

    console.log('[RC] Purchases.configure() — apiKey starts with:', REVENUECAT_API_KEY.slice(0, 8) + '…');
    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      ...(userId ? { appUserID: userId } : {}),
    });
    console.log('[RC] Purchases.configure() — SUCCESS');

    if (userId) {
      try {
        const { customerInfo } = await Purchases.logIn({ appUserID: userId });
        console.log('[RC] Purchases.logIn() — SUCCESS, originalAppUserId:', customerInfo?.originalAppUserId);
      } catch (loginErr: unknown) {
        // logIn failure is non-fatal — we're already configured
        console.warn('[RC] Purchases.logIn() — WARNING (non-fatal):', serializeRCError(loginErr));
      }
    }

    _rcReady = true;
    _rcResolve?.();
    console.log('[RC] initializeRevenueCat — COMPLETE, _rcReady=true');
  } catch (e: unknown) {
    const msg = serializeRCError(e);
    console.error('[RC] initializeRevenueCat — FAILED:', msg);
    console.error('[RC] Full error object:', JSON.stringify(e, Object.getOwnPropertyNames(e as object)));
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
  } catch (e: unknown) {
    console.error('[RC] getCustomerInfo error:', serializeRCError(e));
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
export async function getOfferings(): Promise<{ offerings: PurchasesOfferings | null; error: string | null }> {
  if (!Capacitor.isNativePlatform()) {
    return { offerings: null, error: 'Not a native platform.' };
  }

  if (!_rcReady) {
    const msg = 'getOfferings() called before RC is ready. Call waitForRC() first.';
    console.error('[RC]', msg);
    return { offerings: null, error: msg };
  }

  try {
    console.log('[RC] Purchases.getOfferings() — calling…');
    const offerings = await Purchases.getOfferings();

    const topLevelKeys = Object.keys(offerings ?? {});
    console.log('[RC] Purchases.getOfferings() — raw result keys:', topLevelKeys);
    console.log('[RC] offerings.current identifier:', (offerings as any)?.current?.identifier ?? 'null');
    console.log('[RC] offerings.all keys:', Object.keys((offerings as any)?.all ?? {}));

    const pkgs: PurchasesPackage[] = (offerings as any)?.current?.availablePackages ?? [];
    console.log(
      '[RC] availablePackages (' + pkgs.length + '):',
      pkgs.map(p => ({
        id: p.identifier,
        type: p.packageType,
        productId: p.product?.identifier,
        price: p.product?.priceString,
      }))
    );

    if (!(offerings as any)?.current) {
      const msg =
        `getOfferings() succeeded but offerings.current is null. ` +
        `Top-level keys: [${topLevelKeys.join(', ')}]. ` +
        `All offering IDs: [${Object.keys((offerings as any)?.all ?? {}).join(', ')}]. ` +
        `Make sure your RevenueCat "default" offering is set as the Current Offering in the RC dashboard.`;
      console.warn('[RC]', msg);
      return { offerings: null, error: msg };
    }

    return { offerings: offerings as unknown as PurchasesOfferings, error: null };
  } catch (e: unknown) {
    const msg = serializeRCError(e);
    console.error('[RC] Purchases.getOfferings() — THREW:', msg);
    console.error('[RC] Full offerings error:', JSON.stringify(e, Object.getOwnPropertyNames(e as object)));
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
  } catch (e: unknown) {
    const obj = e as Record<string, unknown>;
    if (obj?.userCancelled) {
      return { success: false, error: 'Purchase cancelled.' };
    }
    return { success: false, error: serializeRCError(e) };
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
  } catch (e: unknown) {
    console.error('[RC] restorePurchases error:', serializeRCError(e));
    return { success: false, wasPro: false };
  }
}
