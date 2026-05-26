import React, { useState } from 'react';

interface ProPurchaseModalProps {
  onClose: () => void;
  onPurchase: () => Promise<{ success: boolean; error?: string }>;
  onRestore: () => Promise<{ success: boolean; wasPro: boolean }>;
  purchasing: boolean;
  restoring: boolean;
}

export const ProPurchaseModal: React.FC<ProPurchaseModalProps> = ({
  onClose,
  onPurchase,
  onRestore,
  purchasing,
  restoring,
}) => {
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);

  const handlePurchase = async () => {
    setNotice(null);
    const result = await onPurchase();
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
            <div className="flex items-center gap-2 mt-3">
              <div className="h-px flex-1 bg-yellow-500/20" />
              <span className="font-orbitron text-[9px] text-yellow-600 uppercase tracking-widest">ONE-TIME PURCHASE</span>
              <div className="h-px flex-1 bg-yellow-500/20" />
            </div>
          </div>

          {/* Features list */}
          <div className="px-5 py-4">
            <p className="text-gray-400 text-[10px] uppercase font-orbitron tracking-widest mb-3">What you unlock:</p>
            <ul className="space-y-2.5 mb-5">
              {[
                { icon: '🚫', label: '100% Ad-Free Experience', sub: 'No banners, interstitials, or popups' },
                { icon: '📜', label: 'Detailed History Log', sub: 'Full quest & dungeon history' },
                { icon: '📊', label: 'System Reports Export', sub: 'Share your progress stats' },
                { icon: '⭐', label: 'All Features Unlocked', sub: 'Everything, forever' },
              ].map(f => (
                <li key={f.label} className="flex items-start gap-3">
                  <span className="text-base leading-none mt-0.5">{f.icon}</span>
                  <div>
                    <p className="font-orbitron text-[10px] font-black text-white uppercase tracking-wide">{f.label}</p>
                    <p className="text-[9px] text-gray-500 font-orbitron">{f.sub}</p>
                  </div>
                  <span className="ml-auto text-green-400 text-sm">✓</span>
                </li>
              ))}
            </ul>

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

            {/* Buttons */}
            <button
              onClick={handlePurchase}
              disabled={purchasing || restoring}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-orbitron text-[11px] font-black uppercase tracking-widest py-3 rounded shadow-[0_0_20px_rgba(234,179,8,0.5)] hover:shadow-[0_0_30px_rgba(234,179,8,0.7)] transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mb-2"
            >
              {purchasing ? '⟳ Processing...' : '⚡ Upgrade to Pro'}
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
          </div>
        </div>
      </div>
    </div>
  );
};
