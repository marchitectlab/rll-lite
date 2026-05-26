import React, { useState } from 'react';
import { ProPlan } from '../hooks/usePro';

interface ProPurchaseModalProps {
  onClose: () => void;
  onPurchase: (plan: 'monthly' | 'lifetime') => Promise<{ success: boolean; error?: string }>;
  onRestore: () => Promise<{ success: boolean; wasPro: boolean }>;
  purchasing: boolean;
  restoring: boolean;
  offeringsLoading: boolean;
  monthlyPlan: ProPlan;
  lifetimePlan: ProPlan;
}

export const ProPurchaseModal: React.FC<ProPurchaseModalProps> = ({
  onClose, onPurchase, onRestore, purchasing, restoring,
  offeringsLoading, monthlyPlan, lifetimePlan,
}) => {
  const [selected, setSelected] = useState<'monthly' | 'lifetime'>('lifetime');
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);

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
    setNotice(null);
    const result = await onRestore();
    if (!result.success) {
      setNotice({ type: 'error', msg: 'Could not restore. Check your connection and try again.' });
    } else if (result.wasPro) {
      setNotice({ type: 'success', msg: 'Pro restored! Welcome back.' });
      setTimeout(onClose, 1800);
    } else {
      setNotice({ type: 'info', msg: 'No previous Pro purchase found on this account.' });
    }
  };

  const plans: { key: 'monthly' | 'lifetime'; plan: ProPlan; badge?: string }[] = [
    { key: 'monthly', plan: monthlyPlan },
    { key: 'lifetime', plan: lifetimePlan, badge: 'BEST VALUE' },
  ];

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
            {/* Features list */}
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
            ) : (
              <div className="flex gap-2 mb-4">
                {plans.map(({ key, plan, badge }) => {
                  const isSelected = selected === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelected(key)}
                      className={`flex-1 relative rounded-lg border-2 py-3 px-3 text-left transition-all ${
                        isSelected
                          ? 'border-yellow-400 bg-yellow-950/40 shadow-[0_0_16px_rgba(234,179,8,0.3)]'
                          : 'border-slate-600 bg-slate-800/40 hover:border-slate-500'
                      }`}
                    >
                      {badge && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-black font-orbitron text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap">
                          {badge}
                        </span>
                      )}
                      <div className={`font-orbitron text-[9px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-yellow-300' : 'text-gray-400'}`}>
                        {plan.label}
                      </div>
                      <div className={`font-orbitron text-xl font-black leading-none ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                        {plan.price}
                      </div>
                      <div className="font-orbitron text-[8px] text-gray-500 uppercase tracking-wide mt-0.5">
                        {plan.period}
                      </div>
                      {isSelected && (
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
                notice.type === 'success' ? 'bg-green-900/50 text-green-400 border border-green-500/40' :
                notice.type === 'error' ? 'bg-red-900/50 text-red-400 border border-red-500/40' :
                'bg-blue-900/50 text-blue-400 border border-blue-500/40'
              }`}>
                {notice.msg}
              </div>
            )}

            {/* Purchase button */}
            <button
              onClick={handlePurchase}
              disabled={purchasing || restoring || offeringsLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-orbitron text-[11px] font-black uppercase tracking-widest py-3 rounded shadow-[0_0_20px_rgba(234,179,8,0.5)] hover:shadow-[0_0_30px_rgba(234,179,8,0.7)] transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mb-2"
            >
              {purchasing
                ? '⟳ Processing...'
                : `⚡ Get ${selected === 'monthly' ? monthlyPlan.price + '/mo' : lifetimePlan.price + ' Lifetime'}`}
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleRestore}
                disabled={purchasing || restoring}
                className="flex-1 bg-slate-800 border border-slate-600 text-gray-400 hover:text-white font-orbitron text-[9px] font-black uppercase tracking-widest py-2 rounded transition-colors disabled:opacity-40"
              >
                {restoring ? '⟳ Checking...' : 'Restore Purchase'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-slate-800 border border-slate-700 text-gray-600 hover:text-gray-300 font-orbitron text-[9px] font-black uppercase tracking-widest py-2 rounded transition-colors"
              >
                Not Now
              </button>
            </div>

            <p className="text-center font-orbitron text-[8px] text-gray-600 mt-3 tracking-wide">
              Payment processed via Google Play · Cancel anytime (monthly)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
