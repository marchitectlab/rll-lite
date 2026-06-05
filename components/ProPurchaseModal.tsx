import React, { useState } from 'react';
import { ProPlan } from '../hooks/usePro';

interface ProPurchaseModalProps {
  onClose: () => void;
  onPurchase: (plan: 'monthly' | 'lifetime') => Promise<{ success: boolean; error?: string }>;
  onRestore: () => Promise<{ success: boolean; wasPro: boolean; error?: string }>;
  onRetry: () => void;
  purchasing: boolean;
  offeringsLoading: boolean;
  offeringsError: boolean;
  monthlyPlan: ProPlan;
  lifetimePlan: ProPlan;
}

export const ProPurchaseModal: React.FC<ProPurchaseModalProps> = ({
  onClose, onPurchase, onRestore, onRetry, purchasing,
  offeringsLoading, offeringsError, monthlyPlan, lifetimePlan,
}) => {
  // Default to lifetime; fall back to monthly if lifetime didn't load
  const defaultPlan: 'monthly' | 'lifetime' =
    lifetimePlan.pkg !== null ? 'lifetime' : 'monthly';
  const [selected, setSelected] = useState<'monthly' | 'lifetime'>(defaultPlan);
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);
  const [restoring, setRestoring] = useState(false);

  const handlePurchase = async () => {
    setNotice(null);
    const result = await onPurchase(selected);
    if (result.success) {
      setNotice({ type: 'success', msg: 'Pro activated! All ads removed and features unlocked.' });
      setTimeout(onClose, 1800);
    } else {
      setNotice({ type: 'error', msg: result.error ?? 'Purchase could not be completed. Try again.' });
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    setNotice(null);
    const result = await onRestore();
    if (result.wasPro) {
      setNotice({ type: 'success', msg: 'Purchase restored! Pro is now active.' });
      setTimeout(onClose, 1800);
    } else if (result.success) {
      setNotice({ type: 'info', msg: 'No previous Pro purchase found on this account.' });
    } else {
      setNotice({ type: 'error', msg: result.error ?? 'Restore failed. Try again.' });
    }
    setRestoring(false);
  };

  const plans: { key: 'monthly' | 'lifetime'; plan: ProPlan; badge?: string }[] = [
    { key: 'monthly', plan: monthlyPlan },
    { key: 'lifetime', plan: lifetimePlan, badge: 'BEST VALUE' },
  ];

  const storeUnavailable = !offeringsLoading && offeringsError;
  // A plan is purchasable only if its package actually loaded from RC
  const selectedPlanLoaded =
    selected === 'monthly' ? monthlyPlan.pkg !== null : lifetimePlan.pkg !== null;
  const canPurchase = !offeringsLoading && !offeringsError && selectedPlanLoaded;

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-[300] backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-br from-slate-900 via-yellow-950/20 to-slate-900 border-2 border-yellow-500/70 rounded-lg shadow-[0_0_60px_rgba(234,179,8,0.35)] overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-900/50 to-amber-800/30 border-b border-yellow-500/30 px-5 pt-5 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-orbitron text-[8px] font-black text-yellow-500/80 uppercase tracking-[0.4em]">R.L.L SYSTEM</span>
                <h2 className="font-orbitron text-2xl font-black text-yellow-300 uppercase tracking-wide leading-none mt-1">
                  Upgrade to <span className="text-yellow-400">Pro</span>
                </h2>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none mt-1">&times;</button>
            </div>
          </div>

          <div className="px-5 py-4">
            {/* Features */}
            <ul className="space-y-2 mb-4">
              {[
                { icon: '🚫', label: 'Ad-Free Experience', sub: 'No banners or popups' },
                { icon: '📜', label: 'Full History Log', sub: 'Complete quest & dungeon history' },
                { icon: '📊', label: 'System Reports Export', sub: 'Share your progress stats' },
                { icon: '⭐', label: 'All Features Unlocked', sub: 'Everything, forever' },
              ].map(f => (
                <li key={f.label} className="flex items-center gap-3">
                  <span className="text-sm leading-none">{f.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-orbitron text-[10px] font-black text-white uppercase tracking-wide leading-none">{f.label}</p>
                    <p className="text-[9px] text-gray-500 font-orbitron mt-0.5">{f.sub}</p>
                  </div>
                  <span className="text-green-400 text-xs flex-shrink-0">✓</span>
                </li>
              ))}
            </ul>

            {/* Plan selector */}
            <p className="font-orbitron text-[9px] text-yellow-600 uppercase tracking-widest mb-2">Choose your plan:</p>

            {offeringsLoading ? (
              <div className="flex gap-2 mb-4">
                {[0, 1].map(i => (
                  <div key={i} className="flex-1 h-16 bg-slate-800/60 rounded-lg animate-pulse border border-slate-700" />
                ))}
              </div>
            ) : storeUnavailable ? (
              <div className="mb-4 px-3 py-3 rounded-lg border border-yellow-700/40 bg-yellow-950/30 text-center">
                <p className="font-orbitron text-[9px] text-yellow-500 uppercase tracking-widest mb-2">
                  ⚠ Store unavailable
                </p>
                <p className="font-orbitron text-[8px] text-gray-400 mb-3">
                  Could not connect to Google Play. Check your connection and try again.
                </p>
                <button
                  onClick={() => { setNotice(null); onRetry(); }}
                  className="font-orbitron text-[9px] font-black uppercase tracking-widest text-yellow-400 border border-yellow-600/40 px-4 py-1.5 rounded hover:bg-yellow-900/30 transition-colors"
                >
                  ↻ Retry
                </button>
              </div>
            ) : (
              <div className="flex gap-2 mb-4">
                {plans.map(({ key, plan, badge }) => {
                  const isSelected = selected === key;
                  const isAvailable = plan.pkg !== null;
                  return (
                    <button
                      key={key}
                      onClick={() => isAvailable && setSelected(key)}
                      disabled={!isAvailable}
                      className={`flex-1 relative rounded-lg border-2 py-3 px-3 text-left transition-all ${
                        !isAvailable
                          ? 'border-slate-700 bg-slate-900/40 opacity-40 cursor-not-allowed'
                          : isSelected
                          ? 'border-yellow-400 bg-yellow-950/40 shadow-[0_0_16px_rgba(234,179,8,0.3)]'
                          : 'border-slate-600 bg-slate-800/40 hover:border-slate-500'
                      }`}
                    >
                      {badge && isAvailable && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-black font-orbitron text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap">
                          {badge}
                        </span>
                      )}
                      <div className={`font-orbitron text-[9px] font-black uppercase tracking-widest mb-1 ${isSelected && isAvailable ? 'text-yellow-300' : 'text-gray-400'}`}>
                        {plan.label}
                      </div>
                      <div className={`font-orbitron text-xl font-black leading-none ${isSelected && isAvailable ? 'text-white' : 'text-gray-300'}`}>
                        {isAvailable ? plan.price : '—'}
                      </div>
                      <div className="font-orbitron text-[8px] text-gray-500 uppercase tracking-wide mt-0.5">
                        {isAvailable ? plan.period : 'unavailable'}
                      </div>
                      {isSelected && isAvailable && (
                        <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-yellow-400 flex items-center justify-center">
                          <span className="text-black text-[8px] font-black">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Notice */}
            {notice && (
              <div className={`mb-3 px-3 py-2 rounded text-[9px] font-orbitron uppercase tracking-wide font-black ${
                notice.type === 'success'
                  ? 'bg-green-900/50 text-green-400 border border-green-500/40'
                  : notice.type === 'info'
                  ? 'bg-blue-900/50 text-blue-400 border border-blue-500/40'
                  : 'bg-red-900/50 text-red-400 border border-red-500/40'
              }`}>
                {notice.msg}
              </div>
            )}

            {/* Purchase button */}
            <button
              onClick={handlePurchase}
              disabled={purchasing || offeringsLoading || !canPurchase}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-orbitron text-[11px] font-black uppercase tracking-widest py-3 rounded shadow-[0_0_20px_rgba(234,179,8,0.5)] hover:shadow-[0_0_30px_rgba(234,179,8,0.7)] transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mb-2"
            >
              {purchasing
                ? '⟳ Processing...'
                : canPurchase
                  ? `⚡ Get ${selected === 'monthly' ? monthlyPlan.price + '/mo' : lifetimePlan.price + ' Lifetime'}`
                  : '⚠ Plan Unavailable'}
            </button>

            {/* Restore Purchases */}
            <button
              onClick={handleRestore}
              disabled={restoring || purchasing}
              className="w-full bg-slate-800/60 border border-slate-700 text-gray-400 hover:text-yellow-400 font-orbitron text-[9px] font-black uppercase tracking-widest py-2 rounded transition-colors mb-2 disabled:opacity-50"
            >
              {restoring ? '⟳ Restoring...' : '↩ Restore Previous Purchase'}
            </button>

            <button
              onClick={onClose}
              className="w-full bg-slate-800 border border-slate-700 text-gray-500 hover:text-gray-300 font-orbitron text-[9px] font-black uppercase tracking-widest py-2 rounded transition-colors"
            >
              Not Now
            </button>

            <p className="text-center font-orbitron text-[8px] text-gray-600 mt-3 tracking-wide">
              Payment processed via Google Play · Cancel anytime (monthly)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
