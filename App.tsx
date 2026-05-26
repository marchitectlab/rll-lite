
import React, { useState, useEffect, useCallback } from 'react';
import { PlayerStats } from './components/PlayerStats';
import { QuestList } from './components/QuestList';
import { CreateQuestForm } from './components/CreateQuestForm';
import { usePlayerData } from './hooks/usePlayerData';
import { usePro } from './hooks/usePro';
import { QuestHistory } from './components/QuestHistory';
import { ProPurchaseModal } from './components/ProPurchaseModal';
import type { Player, Quest, Difficulty, ActiveDungeonState, DungeonCooldown, DungeonHistoryEntry, Achievement, ShopItem, Inventory, EquipmentSlot, SystemNotification, Page, DayOfWeek, Attribute, Dungeon } from './types';
import { Difficulty as DifficultyEnum } from './types';
import { DUNGEONS, SHOP_ITEMS, getLevelRequirement } from './constants';
import { Codex } from './components/Codex';
import { SkillsPage } from './components/SkillsPage';
import StartupPage from './components/StartupPage';
import { AuthPage } from './components/AuthPage';
import { ReportExport } from './components/ReportExport';
import { TaskList } from './components/TaskList';
import { WorkshopPage } from './components/WorkshopPage';
import { supabase } from './lib/supabase';

// ---- AdMob IDs ----
const BANNER_AD_ID = 'ca-app-pub-2481483129842770/1727552190';
const INTERSTITIAL_AD_ID = 'ca-app-pub-2481483129842770/9928108860';
const REWARDED_AD_ID = 'ca-app-pub-2481483129842770/3292365019';

// Pages that show banner ads
const BANNER_PAGES: string[] = ['menu', 'quests', 'dungeons'];
// Pages that trigger interstitial on enter
const INTERSTITIAL_ON_ENTER: string[] = ['history', 'status'];

// Lazy-load AdMob so the app still works on web/non-capacitor environments
let AdMobLib: any = null;
const getAdMob = async () => {
  if (AdMobLib) return AdMobLib;
  try {
    const mod = await import('@capacitor-community/admob');
    AdMobLib = mod;
    return mod;
  } catch {
    return null;
  }
};

const initAdMob = async () => {
  const lib = await getAdMob();
  if (!lib) return;
  try {
    await lib.AdMob.initialize({ requestTrackingAuthorization: false, testingDevices: [] });
  } catch {}
};

const showBannerAd = async () => {
  const lib = await getAdMob();
  if (!lib) return;
  try {
    await lib.AdMob.showBanner({
      adId: BANNER_AD_ID,
      adSize: lib.BannerAdSize.ADAPTIVE_BANNER,
      position: lib.BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: false,
    });
  } catch {}
};

const hideBannerAd = async () => {
  const lib = await getAdMob();
  if (!lib) return;
  try { await lib.AdMob.hideBanner(); } catch {}
};

const prepareInterstitialAd = async () => {
  const lib = await getAdMob();
  if (!lib) return;
  try {
    await lib.AdMob.prepareInterstitial({ adId: INTERSTITIAL_AD_ID, isTesting: false });
  } catch {}
};

const showInterstitialAd = async () => {
  const lib = await getAdMob();
  if (!lib) return;
  try { await lib.AdMob.showInterstitial(); } catch {}
  prepareInterstitialAd();
};


const prepareRewardedAd = async () => {
  const lib = await getAdMob();
  if (!lib) return;
  try {
    await lib.AdMob.prepareRewardVideoAd({ adId: REWARDED_AD_ID, isTesting: false });
  } catch {}
};

const showRewardedAd = async (onRewarded: () => void) => {
  const lib = await getAdMob();
  if (!lib) { onRewarded(); return; }
  try {
    const listener = await lib.AdMob.addListener(
      lib.RewardAdPluginEvents?.Rewarded ?? 'onRewardedVideoAdRewardedUser',
      () => { onRewarded(); listener.remove(); }
    );
    await lib.AdMob.showRewardVideoAd();
    prepareRewardedAd();
  } catch { onRewarded(); }
};

// --- ICONS ---
const MenuIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>);
const BackIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mt-0 pt-0 pl-[14px] -ml-[11px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>);
const StatusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const StatsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const QuestLogIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
const HistoryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const DungeonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 2.209-1.791 4-4 4s-4-1.791-4-4 1.791-4 4-4 4 1.791-4 4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 2.209 1.791 4 4 4s4-1.791 4-4-1.791-4-4-4-4 1.791-4 4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m-8-10H2m20 0h-2m-1.757-6.243l-1.414 1.414M7.172 16.828l-1.414 1.414M16.828 16.828l1.414 1.414M7.172 7.172l-1.414-1.414" />
    <circle cx="12" cy="11" r="3" fill="currentColor" opacity="0.2" />
  </svg>
);
const CoinIcon = ({ className = "h-5 w-5" }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" className={`${className} inline-block text-yellow-400`} viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="8" fill="#FBBF24" /><circle cx="10" cy="10" r="6" fill="#F59E0B" /></svg>);
const WorkshopIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);
const ShopIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>);
const InventoryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>);
const ReportIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
const AchievementIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>);
const SkillIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

// --- Pro Version Banner Component ---
const ProVersionBanner: React.FC<{ compact?: boolean; onUpgrade: () => void }> = ({ compact, onUpgrade }) => (
  <button
    onClick={onUpgrade}
    className={`w-full flex items-center gap-2 bg-gradient-to-r from-yellow-900/60 to-amber-800/40 border border-yellow-500/40 rounded-sm px-3 py-2 cursor-pointer hover:from-yellow-800/70 transition-all group ${compact ? 'text-[9px]' : 'text-[10px]'}`}
  >
    <svg className="w-4 h-4 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
    <span className="font-orbitron font-black text-yellow-300 uppercase tracking-wide leading-tight group-hover:text-yellow-100 transition-colors">
      <span className="text-yellow-400">Upgrade to Pro</span> — go <span className="text-white">100% ad-free</span>
    </span>
  </button>
);

// --- Rate App Modal (shown after level-ups) ---
const RateAppModal: React.FC<{ level: number; onClose: () => void }> = ({ level, onClose }) => {
  const handleRate = () => {
    window.open('https://play.google.com/store/apps/details?id=com.rll.mobile', '_blank');
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[210] backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-br from-slate-900 to-cyan-950/40 border-2 border-cyan-400/60 rounded-lg p-6 shadow-[0_0_40px_rgba(34,211,238,0.25)]">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">⚔️</div>
            <span className="font-orbitron text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em]">LEVEL UP ACHIEVED</span>
            <h3 className="font-orbitron text-2xl font-black text-cyan-400 uppercase mt-1">Level {level}!</h3>
          </div>
          <p className="text-gray-300 text-xs text-center mb-1 leading-relaxed">
            Your real-life progress is legendary. Help other hunters find their path —
          </p>
          <p className="text-white text-xs font-black text-center mb-5 uppercase tracking-wide">
            Leave a review on the Play Store!
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 bg-gray-800 px-3 py-2.5 rounded text-[9px] uppercase font-black tracking-widest text-gray-400 hover:text-white transition-colors border border-gray-700">Not Now</button>
            <button onClick={handleRate} className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 px-3 py-2.5 rounded text-[9px] uppercase font-black tracking-widest text-white shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:scale-105 transition-transform">
              ★ Rate Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- In-App Promo Modal (shown periodically) ---
const PromoModal: React.FC<{ onClose: () => void; onPurchase: () => void }> = ({ onClose, onPurchase }) => (
  <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-[200] backdrop-blur-sm" onClick={onClose}>
    <div className="w-full max-w-sm mb-20 mx-4" onClick={e => e.stopPropagation()}>
      <div className="bg-gradient-to-br from-slate-900 to-amber-950/40 border-2 border-yellow-500/60 rounded-lg p-5 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="font-orbitron text-[9px] font-black text-yellow-500 uppercase tracking-[0.3em]">SYSTEM NOTICE</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none">&times;</button>
        </div>
        <h3 className="font-orbitron text-lg font-black text-yellow-400 uppercase mb-1">Upgrade to Pro</h3>
        <p className="text-gray-300 text-xs mb-4 leading-relaxed">
          You are currently playing <span className="text-yellow-400 font-bold">R.L.L Lite</span>. Upgrade to <span className="text-white font-bold">Pro</span> for:
        </p>
        <ul className="text-[10px] text-gray-400 space-y-1 mb-4 font-bold uppercase tracking-wide">
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 100% Ad-Free Experience</li>
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Full Progress Tracking</li>
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> All Premium Features Unlocked</li>
        </ul>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-gray-800 px-3 py-2 rounded text-[9px] uppercase font-black tracking-widest text-gray-500">Later</button>
          <button onClick={() => { onClose(); onPurchase(); }} className="flex-1 bg-gradient-to-r from-yellow-600 to-amber-500 px-3 py-2 rounded text-[9px] uppercase font-black tracking-widest text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]">
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  </div>
);


// --- Upgrade to Pro Modal ---
const UpgradeToProModal: React.FC<{ featureName: string; onClose: () => void; onPurchase: () => void }> = ({ featureName, onClose, onPurchase }) => (
  <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[220] backdrop-blur-sm" onClick={onClose}>
    <div className="w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
      <div className="bg-gradient-to-br from-slate-900 to-yellow-950/30 border-2 border-yellow-500/60 rounded-lg p-6 shadow-[0_0_40px_rgba(234,179,8,0.25)]">
        <div className="flex justify-between items-start mb-4">
          <span className="font-orbitron text-[9px] font-black text-yellow-500 uppercase tracking-[0.3em]">SYSTEM LOCK</span>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none">&times;</button>
        </div>
        <div className="text-center mb-4">
          <div className="text-3xl mb-2">🔒</div>
          <h3 className="font-orbitron text-xl font-black text-yellow-400 uppercase mb-1">Pro Required</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            <span className="text-white font-bold">{featureName}</span> is a <span className="text-yellow-400 font-bold">Pro-exclusive</span> feature. Upgrade to Pro to unlock full access.
          </p>
        </div>
        <ul className="text-[10px] text-gray-400 space-y-1 mb-5 font-bold uppercase tracking-wide">
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Detailed History Log</li>
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> System Reports Export</li>
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 100% Ad-Free Experience</li>
        </ul>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-gray-800 px-3 py-2.5 rounded text-[9px] uppercase font-black tracking-widest text-gray-400 hover:text-white transition-colors border border-gray-700">Later</button>
          <button onClick={() => { onClose(); onPurchase(); }} className="flex-1 bg-gradient-to-r from-yellow-600 to-amber-500 px-3 py-2.5 rounded text-[9px] uppercase font-black tracking-widest text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]">
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  </div>
);

const getGradeStyles = (difficulty: Difficulty) => {
    switch (difficulty) {
        case DifficultyEnum.E: return { text: 'text-gray-400', border: 'border-gray-500/60', bg: 'bg-gray-500/10', glow: '' };
        case DifficultyEnum.D: return { text: 'text-green-400', border: 'border-green-500/60', bg: 'bg-green-500/10', glow: '' };
        case DifficultyEnum.C: return { text: 'text-blue-400', border: 'border-blue-500/60', bg: 'bg-blue-500/10', glow: '' };
        case DifficultyEnum.B: return { text: 'text-indigo-400', border: 'border-indigo-500/60', bg: 'bg-indigo-500/10', glow: '' };
        case DifficultyEnum.A: return { text: 'text-purple-400', border: 'border-purple-500/70', bg: 'bg-purple-500/10', glow: 'animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.3)]' };
        case DifficultyEnum.S: return { text: 'text-yellow-400', border: 'border-yellow-500/80', bg: 'bg-yellow-500/15', glow: 'animate-grade-s-glow' };
        case DifficultyEnum.S_PLUS: return { text: 'text-red-500', border: 'border-red-600/90', bg: 'bg-red-900/20', glow: 'animate-grade-s-plus-glow' };
        case DifficultyEnum.X: return { text: 'text-red-700', border: 'border-black', bg: 'bg-black/80', glow: 'animate-black-hole' };
        default: return { text: 'text-white', border: 'border-white/30', bg: 'bg-white/5', glow: '' };
    }
};

const NotificationManager: React.FC<{ notifications: SystemNotification[] }> = ({ notifications }) => {
    return (
        <div className="fixed top-6 right-6 z-[300] flex flex-col items-end pointer-events-none w-full max-w-xs gap-2">
            {notifications.map(n => {
                let color = 'border-blue-500 text-blue-200';
                let bg = 'bg-slate-900/95 shadow-[0_0_20px_rgba(56,189,248,0.2)]';
                
                if (n.type === 'danger') {
                  color = 'border-red-600 text-red-200';
                  bg = 'bg-red-950/90 shadow-[0_0_15px_rgba(220,38,38,0.3)]';
                } else if (n.type === 'warning') {
                  color = 'border-yellow-500 text-yellow-200';
                } else if (n.type === 'achievement' || n.type === 'level_up') {
                  color = 'border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.4)]';
                  bg = 'bg-cyan-950/90';
                }

                return (
                    <div key={n.id} className={`glass-panel p-3 px-5 rounded-sm border-2 animate-notification pointer-events-auto backdrop-blur-md w-full ${color} ${bg}`}>
                        <div className="flex flex-col items-start gap-0.5">
                          <h4 className="font-orbitron text-[8px] font-black uppercase tracking-[0.3em] opacity-60 leading-none mb-1">SYSTEM ALERT</h4>
                          <p className="text-[10px] font-black uppercase tracking-widest leading-tight border-b border-white/5 pb-0.5 mb-0.5 w-full">{n.title}</p>
                          <p className="text-[12px] font-bold tracking-wide leading-tight italic">{n.message}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const ConfirmationModal: React.FC<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; isDangerous?: boolean }> = ({ isOpen, title, message, onConfirm, onCancel, isDangerous }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[150] backdrop-blur-md">
            <div className={`glass-panel border-2 rounded-lg p-6 w-full max-w-sm m-4 ${isDangerous ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-blue-500 shadow-[0_0_20px_rgba(56,189,248,0.3)]'}`}>
                <h3 className={`font-orbitron text-lg font-black mb-2 uppercase ${isDangerous ? 'text-red-500' : 'text-blue-300'}`}>{title}</h3>
                <p className="text-gray-300 text-xs mb-8 uppercase tracking-tighter font-bold">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onCancel} className="bg-gray-800 px-4 py-2 rounded text-[10px] uppercase font-black tracking-widest text-gray-400 hover:text-white transition-colors">Abort</button>
                    <button onClick={() => { onConfirm(); onCancel(); }} className={`${isDangerous ? 'bg-red-700' : 'bg-blue-700'} px-4 py-2 rounded text-[10px] uppercase font-black tracking-widest hover:scale-105 transition-transform`}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

const StatusPage: React.FC<{ player: Player; onRename: (name: string) => void; onLoginPress?: () => void; userEmail?: string; onSignOut?: () => void }> = ({ player, onRename, onLoginPress, userEmail, onSignOut }) => (<div className="w-full h-full"><PlayerStats player={player} onRename={onRename} onLoginPress={onLoginPress} userEmail={userEmail} onSignOut={onSignOut} /></div>);

const AchievementsPage: React.FC<{ achievements: Record<string, Achievement> }> = ({ achievements }) => {
    const list: Achievement[] = Object.values(achievements);
    return (
        <div className="space-y-6">
            <h2 className="font-orbitron text-2xl text-blue-400 uppercase tracking-widest font-black mb-6">SYSTEM ACHIEVEMENTS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {list.length === 0 ? <p className="text-gray-500 uppercase text-xs italic">No achievements recorded yet.</p> : list.map((ach: Achievement) => {
                    const styles = getGradeStyles(ach.rank);
                    return (
                        <div key={ach.id} className={`glass-panel p-4 rounded border ${styles.border} ${ach.isUnlocked ? styles.bg : 'opacity-40 grayscale'} ${ach.isUnlocked ? styles.glow : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`font-orbitron text-[10px] font-black ${styles.text}`}>[{ach.rank}]</span>
                                {ach.isUnlocked && <span className="text-[9px] font-black text-green-400 uppercase">SYNCHRONIZED</span>}
                            </div>
                            <h3 className="font-orbitron text-sm font-black text-white uppercase mb-1">{ach.name}</h3>
                            <p className="text-gray-500 text-[10px] uppercase tracking-tighter mb-2">{ach.description}</p>
                            <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center gap-1 text-yellow-400 text-xs font-black">
                                    <CoinIcon className="h-3 w-3" /> {ach.rewardCoins}
                                </div>
                                {!ach.isUnlocked && <div className="text-[10px] text-gray-600 font-black">{ach.progress}/{ach.goal}</div>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const QuestLogPage: React.FC<{
    quests: Quest[];
    onComplete: (id: string) => void;
    onDelete: (id: string) => void;
    onFail: (id: string) => void;
    onAddQuest: (name: string, difficulty: Difficulty, type: 'repetitive' | 'one-time', attributes: Attribute[], description: string) => void;
    onWatchAdForQuest: (onGranted: () => void) => void;
}> = ({ quests, onComplete, onDelete, onFail, onAddQuest, onWatchAdForQuest }) => {
    const [view, setView] = useState<'list' | 'add'>('list');
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="font-orbitron text-2xl text-blue-400 uppercase tracking-widest font-black">QUEST LOG</h2>
                <button onClick={() => setView(view === 'list' ? 'add' : 'list')} className="bg-blue-600 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest border border-blue-400/50 hover:bg-blue-500 transition-colors">
                    {view === 'list' ? 'Initialize New Entry' : 'Abort Entry'}
                </button>
            </div>
            
            {view === 'list' ? (
                <QuestList quests={quests} onComplete={onComplete} onDelete={onDelete} onFail={onFail} />
            ) : (
                <div className="glass-panel p-4 md:p-8 rounded-lg border-blue-500/30">
                    <CreateQuestForm
                        addQuest={(...args) => { onAddQuest(...args); setView('list'); }}
                        onWatchAd={onWatchAdForQuest}
                    />
                </div>
            )}
        </div>
    );
};

const DungeonsPage: React.FC<{
    onStartDungeon: (d: Dungeon) => void;
    activeDungeon: ActiveDungeonState | null;
    dungeonCooldowns: Record<string, DungeonCooldown>;
    onClearDungeon: () => void;
    onFailDungeon: () => void;
    onProgressDungeon: () => void;
    dungeonHistory: DungeonHistoryEntry[];
}> = ({ onStartDungeon, activeDungeon, dungeonCooldowns, onClearDungeon, onFailDungeon, onProgressDungeon, dungeonHistory }) => {
    const [selectedRank, setSelectedRank] = useState<Difficulty | null>(null);
    const [view, setView] = useState<'gates' | 'cooldowns'>('gates');

    if (activeDungeon) {
        const dungeon = DUNGEONS.find(d => d.id === activeDungeon.dungeonId)!;
        const currentFloor = dungeon.floors[activeDungeon.currentFloorIndex];
        const isCompletionReady = activeDungeon.currentFloorIndex >= dungeon.floors.length - 1 && activeDungeon.currentTaskIndex >= currentFloor.tasks.length;

        return (
            <div className="glass-panel p-8 rounded-lg border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="font-orbitron text-2xl text-red-500 uppercase tracking-tighter font-black">GATE: {dungeon.name}</h2>
                    <div className="flex flex-col items-end">
                        <div className="text-gray-400 font-orbitron text-xs font-bold uppercase tracking-widest">FLOOR {activeDungeon.currentFloorIndex + 1} / {dungeon.floors.length}</div>
                        {!isCompletionReady && <div className="text-[10px] text-red-400 font-black mt-1 uppercase">OBJECTIVE {activeDungeon.currentTaskIndex + 1} / {currentFloor.tasks.length}</div>}
                    </div>
                </div>
                
                <div className="min-h-[250px] mb-8">
                    {isCompletionReady ? (
                        <div className="text-center py-12">
                            <h3 className="font-orbitron text-4xl text-green-400 mb-4 neon-text">GATE OPENED</h3>
                            <p className="text-gray-400 mb-8 uppercase tracking-[0.2em] text-[10px] font-black">All floors cleared. Core extracted. ready for extraction.</p>
                            <button onClick={onClearDungeon} className="bg-green-600 px-12 py-4 rounded text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:scale-105 transition-transform">Claim Rewards</button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="border-b border-white/10 pb-4 mb-6">
                                <h3 className="font-orbitron text-xl text-blue-300 uppercase tracking-wide">{currentFloor.name}</h3>
                            </div>
                            <h4 className="font-orbitron text-2xl text-white uppercase tracking-wide">{currentFloor.tasks[activeDungeon.currentTaskIndex].page.title}</h4>
                            <p className="text-gray-400 italic text-sm border-l-2 border-white/10 pl-4">"{currentFloor.tasks[activeDungeon.currentTaskIndex].page.narrative}"</p>
                            <div className="bg-black/40 p-6 border border-white/5 rounded-sm mt-8">
                                <p className="text-white font-black uppercase tracking-[0.2em] text-xs mb-2 text-blue-400">System Instruction:</p>
                                <p className="text-white font-bold uppercase tracking-widest text-base">{currentFloor.tasks[activeDungeon.currentTaskIndex].description}</p>
                            </div>
                        </div>
                    )}
                </div>

                {!isCompletionReady && (
                    <div className="flex gap-4">
                        <button onClick={onFailDungeon} className="bg-red-900/60 hover:bg-red-800 px-6 py-3 rounded text-[10px] font-black uppercase tracking-widest border border-red-500/30 transition-colors">Abandon</button>
                        <button onClick={onProgressDungeon} className="flex-grow bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all">Task Completed</button>
                    </div>
                )}
            </div>
        );
    }

    const renderSubNav = () => (
        <div className="flex gap-8 border-b border-blue-500/20 mb-8">
            <button onClick={() => setView('gates')} className={`font-orbitron text-sm uppercase tracking-[0.3em] font-black pb-3 transition-all ${view === 'gates' ? 'text-blue-400 border-b-2 border-blue-400 neon-text' : 'text-gray-500 hover:text-gray-300'}`}>GATES</button>
            <button onClick={() => setView('cooldowns')} className={`font-orbitron text-sm uppercase tracking-[0.3em] font-black pb-3 transition-all ${view === 'cooldowns' ? 'text-blue-400 border-b-2 border-blue-400 neon-text' : 'text-gray-500 hover:text-gray-300'}`}>COOLDOWNS</button>
        </div>
    );

    if (view === 'cooldowns') {
        const dungeonsOnCooldown = Object.entries(dungeonCooldowns).filter(([_, data]) => data.readyAt > Date.now());
        return (
            <div className="space-y-6">
                {renderSubNav()}
                <h2 className="font-orbitron text-xl text-blue-400 uppercase tracking-widest font-black mb-6">RESTRICTED ACCESS</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dungeonsOnCooldown.length > 0 ? dungeonsOnCooldown.map(([id, data]) => {
                        const dungeon = DUNGEONS.find(d => d.id === id);
                        if (!dungeon) return null;
                        const styles = getGradeStyles(dungeon.grade);
                        const refreshDate = new Date(data.readyAt).toLocaleDateString();
                        return (
                            <div key={id} className="glass-panel p-5 rounded border border-red-500/20 bg-red-950/10 flex items-center justify-between opacity-80">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`font-orbitron text-[9px] font-black ${styles.text}`}>[{dungeon.grade}]</span>
                                        <p className="font-orbitron text-xs font-black text-white uppercase">{dungeon.name}</p>
                                    </div>
                                    <p className="text-[8px] text-red-400/60 uppercase font-black tracking-widest">Available: {refreshDate}</p>
                                </div>
                                <div className="text-red-500">
                                    <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="col-span-full text-center py-20 bg-black/20 border border-white/5 rounded-sm">
                             <p className="font-orbitron text-gray-700 uppercase font-black tracking-[0.3em]">No gates currently on cooldown.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!selectedRank) {
        const ranks = [DifficultyEnum.E, DifficultyEnum.D, DifficultyEnum.C, DifficultyEnum.B, DifficultyEnum.A, DifficultyEnum.S, DifficultyEnum.S_PLUS];
        return (
            <div className="space-y-6">
                {renderSubNav()}
                <h2 className="font-orbitron text-2xl text-blue-400 uppercase tracking-widest font-black mb-8 border-b border-blue-500/20 pb-4">GATE CLASSIFICATIONS</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ranks.map(rank => {
                        const styles = getGradeStyles(rank);
                        const count = DUNGEONS.filter(d => d.grade === rank).length;
                        return (
                            <button key={rank} onClick={() => setSelectedRank(rank)} className={`glass-panel p-8 rounded border transition-all duration-300 hover:scale-105 group text-center flex flex-col items-center ${styles.border} ${styles.glow}`}>
                                <span className={`font-orbitron text-5xl font-black mb-3 ${styles.text}`}>[{rank}]</span>
                                <span className="font-orbitron text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Rank Gates</span>
                                <span className="bg-white/5 px-4 py-1 rounded-full text-[9px] font-bold text-gray-500 uppercase tracking-widest">{count} Available</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    const filteredDungeons = DUNGEONS.filter(d => d.grade === selectedRank);
    const styles = getGradeStyles(selectedRank);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8 border-b border-blue-500/20 pb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedRank(null)} className="text-blue-400 hover:text-blue-200 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <h2 className="font-orbitron text-2xl text-blue-400 uppercase tracking-widest font-black">[{selectedRank}] RANK GATES</h2>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDungeons.map(d => {
                    const cooldown = dungeonCooldowns[d.id];
                    const isLocked = cooldown && cooldown.readyAt > Date.now();
                    const rewardXp = d.rewards?.xp || 0;
                    const estimatedCoins = d.grade === DifficultyEnum.S || d.grade === DifficultyEnum.S_PLUS ? '200-750' : d.grade === DifficultyEnum.A ? '50-100' : d.grade === DifficultyEnum.B ? '15-40' : '3-25';
                    return (
                        <div key={d.id} className={`glass-panel p-6 rounded border transition-all duration-500 hover:-translate-y-1 ${styles.border} ${styles.glow} group`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`font-orbitron text-xs font-black ${styles.text}`}>[{d.grade}]</span>
                                        <h3 className="font-orbitron text-sm font-black text-white uppercase">{d.name}</h3>
                                    </div>
                                    <p className="text-gray-500 text-[10px] uppercase tracking-tighter">{d.description}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                                <div className="text-[9px] text-gray-500 uppercase font-black">{d.floors.length} FLOORS</div>
                                {isLocked ? (
                                    <span className="text-[9px] text-red-400 font-black uppercase tracking-widest">ON COOLDOWN</span>
                                ) : (
                                    <button onClick={() => onStartDungeon(d)} className={`px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest border transition-all ${styles.border} ${styles.text} hover:bg-white/5`}>Enter Gate</button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ShopPage: React.FC<{
    player: Player;
    inventory: Inventory;
    onBuyItem: (item: ShopItem) => void;
}> = ({ player, inventory, onBuyItem }) => {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-blue-500/20 pb-4">
                <h2 className="font-orbitron text-2xl text-blue-400 uppercase tracking-widest font-black">SYSTEM EXCHANGE</h2>
                <div className="flex items-center gap-3 bg-black/40 px-6 py-2 border border-yellow-500/20 rounded-sm">
                    <CoinIcon className="h-6 w-6" />
                    <span className="font-orbitron text-3xl text-yellow-400 font-black">{player.shopCoins}</span>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SHOP_ITEMS.map(item => {
                    const styles = getGradeStyles(item.rank);
                    const hasItem = (item.type === 'Gear') && (inventory.storage.some(i => i.id === item.id) || (Object.values(inventory.equipment) as (ShopItem | null)[]).some(i => i?.id === item.id));
                    const canAfford = player.shopCoins >= item.cost;
                    const reqLevel = getLevelRequirement(item.rank);
                    const isLevelLocked = player.level < reqLevel;
                    return (
                        <div key={item.id} className={`glass-panel p-6 rounded border flex flex-col justify-between transition-all duration-300 ${styles.border} ${styles.glow} ${hasItem ? 'opacity-50 grayscale' : 'hover:scale-[1.02]'} ${isLevelLocked ? 'opacity-70 bg-gray-900/40 border-gray-700/30' : ''}`}>
                            <div className="relative">
                                {isLevelLocked && (
                                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 rounded-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500/50 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <p className="font-orbitron text-[10px] text-red-400 font-bold tracking-widest bg-black/60 px-2 py-1 rounded">LV {reqLevel} REQUIRED</p>
                                    </div>
                                )}
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{item.type} {item.slot ? `| ${item.slot}` : ''}</span>
                                    <span className={`font-orbitron text-xs font-black ${styles.text}`}>[{item.rank}]</span>
                                </div>
                                <h3 className="font-orbitron text-sm font-black text-white mb-2 uppercase tracking-wide">{item.name}</h3>
                                <p className="text-gray-500 text-[10px] mb-4 h-10 uppercase tracking-tighter leading-tight">{item.effectDescription}</p>
                            </div>
                            <div className="mt-4 flex justify-between items-center pt-4 border-t border-white/5">
                                <div className="flex items-center gap-1">
                                    <CoinIcon />
                                    <span className="font-orbitron text-yellow-500 font-black text-lg">{item.cost}</span>
                                </div>
                                <button disabled={hasItem || !canAfford || isLevelLocked} onClick={() => onBuyItem(item)} className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${hasItem ? 'bg-gray-800 text-gray-500' : isLevelLocked ? 'bg-gray-900 border border-gray-800 text-gray-600 cursor-not-allowed' : canAfford ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-red-900/40 text-red-400 cursor-not-allowed'}`}>
                                    {hasItem ? 'OWNED' : isLevelLocked ? 'LOCKED' : 'EXCHANGE'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const InventoryPageWrapper: React.FC<{ inventory: Inventory; player: Player; onEquip: any; onUnequip: any; onBreak: any }> = ({ inventory, onEquip, onUnequip, onBreak }) => {
    const [subTab, setSubTab] = useState<'loadout' | 'storage'>('loadout');
    const [storageType, setStorageType] = useState<'gear' | 'items'>('gear');
    return (
        <div className="space-y-6">
            <div className="flex gap-8 border-b border-blue-500/20 mb-8">
                {(['loadout', 'storage'] as const).map(t => (
                    <button key={t} onClick={() => setSubTab(t)} className={`font-orbitron text-sm uppercase tracking-[0.3em] font-black pb-3 transition-all ${subTab === t ? 'text-blue-400 border-b-2 border-blue-400 neon-text' : 'text-gray-500 hover:text-gray-300'}`}>{t}</button>
                ))}
            </div>
            {subTab === 'loadout' ? (
                <div className="glass-panel p-8 rounded-lg border-blue-500/30">
                    <h2 className="font-orbitron text-xl text-blue-400 mb-8 uppercase font-black tracking-widest">ACTIVE LOADOUT</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {(['helmet', 'armor', 'gloves', 'boots', 'gear'] as EquipmentSlot[]).map(slot => {
                            const item = inventory.equipment[slot];
                            const styles = item ? getGradeStyles(item.rank) : null;
                            const isCursed = item && ['armor_berserker', 'shadow_sword', 'shadow_gloves', 'shadow_boots'].includes(item.id);
                            return (
                                <div key={slot} className={`group relative bg-black/40 border p-5 rounded-sm min-h-[140px] flex flex-col items-center justify-center text-center transition-all ${styles ? `${styles.border} ${styles.glow} border-2` : 'border-gray-800 border-dashed'}`}>
                                    <span className="text-[9px] text-blue-500/40 absolute top-2 uppercase font-black tracking-[0.2em]">{slot}</span>
                                    {item ? (
                                        <>
                                            <p className={`font-orbitron text-[11px] font-black uppercase tracking-tight ${styles?.text}`}>{item.name}</p>
                                            <div className="flex gap-1 mt-2">{[...Array(item.stars || 0)].map((_, i) => <span key={i} className="text-yellow-400 text-[10px]">★</span>)}</div>
                                            <p className="text-[8px] text-yellow-500/70 mt-2 font-black uppercase tracking-[0.2em]">ADV. ★ {item.stars || 0}</p>
                                            <button onClick={() => isCursed ? onBreak(slot) : onUnequip(slot)} className={`absolute inset-0 ${isCursed ? 'bg-red-900/90' : 'bg-blue-900/90'} opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all text-white backdrop-blur-sm`}>
                                                {isCursed ? 'Break (Orb)' : 'Unequip'}
                                            </button>
                                        </>
                                    ) : <span className="text-gray-800 text-[10px] font-black uppercase tracking-widest">Empty</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="flex gap-4">
                        {(['gear', 'items'] as const).map(t => (
                            <button key={t} onClick={() => setStorageType(t)} className={`px-6 py-2 rounded-sm text-[10px] uppercase font-black border transition-all tracking-[0.2em] ${storageType === t ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'bg-gray-900 border-slate-800 text-gray-500 hover:text-gray-300'}`}>{t} storage</button>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {storageType === 'gear' ? inventory.storage.filter(i => i.type === 'Gear').map(item => {
                            const styles = getGradeStyles(item.rank);
                            return (
                                <div key={item.id} className={`p-4 rounded border-2 flex justify-between items-center transition-all glass-panel ${styles.border} ${styles.glow}`}>
                                    <div className="min-w-0 flex-grow pr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`font-orbitron text-[9px] font-black ${styles.text}`}>[{item.rank}]</span>
                                            <p className="font-orbitron text-xs font-black text-white uppercase truncate">{item.name}</p>
                                        </div>
                                        <p className="text-[8px] text-gray-500 uppercase tracking-tighter truncate">{item.effectDescription}</p>
                                    </div>
                                    <button onClick={() => onEquip(item)} className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest text-white transition-colors">Equip</button>
                                </div>
                            );
                        }) : (
                            <div className="col-span-full space-y-6">
                                <h3 className="font-orbitron text-sm text-gray-500 uppercase tracking-[0.3em] border-l-2 border-blue-500/40 pl-3">Material Reserves</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {inventory.materials.map(mat => (
                                        <div key={mat.id} className="bg-gray-900/60 p-5 rounded-sm border border-slate-800 text-center hover:border-blue-500/40 transition-colors">
                                            <p className="font-orbitron text-2xl font-black text-blue-300 mb-1">{mat.count}</p>
                                            <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">{mat.name}</p>
                                        </div>
                                    ))}
                                    {inventory.materials.length === 0 && <p className="text-gray-600 text-[10px] uppercase font-bold tracking-widest col-span-full italic">No materials discovered.</p>}
                                </div>
                                <h3 className="font-orbitron text-sm text-gray-500 uppercase tracking-[0.3em] border-l-2 border-yellow-500/40 pl-3 mt-10">Consumables</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {inventory.storage.filter(i => i.type === 'Potion').map(item => (
                                        <div key={item.id} className="glass-panel p-4 rounded-sm border border-slate-800 flex justify-between items-center hover:border-yellow-500/30 transition-all">
                                            <div className="min-w-0 pr-4">
                                                <p className="font-orbitron text-xs font-black text-white truncate uppercase">{item.name}</p>
                                                <p className="text-[9px] text-gray-500 uppercase tracking-tighter mt-1">{item.effectDescription}</p>
                                            </div>
                                            <div className="text-[9px] font-black text-blue-500 border border-blue-500/30 px-2 py-1 bg-blue-500/5 uppercase tracking-widest">Potion</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const RATE_EVERY_N_LEVELS = 3; // show rate prompt every 3 level-ups
const RATE_STORAGE_KEY = 'rll_levelups_since_rate';

interface AppProps {
  userEmail?: string;
  onSignIn: (email: string, password: string) => Promise<boolean>;
  onSignUp: (email: string, password: string) => Promise<{ success: boolean; needsConfirmation: boolean }>;
  onSignOut: () => Promise<void>;
  onResetPassword: (email: string) => Promise<boolean>;
  authError: string | null;
  onClearAuthError: () => void;
  authLoading: boolean;
}

const App: React.FC<AppProps> = ({ userEmail, onSignIn, onSignUp, onSignOut, onResetPassword, authError, onClearAuthError, authLoading }) => {
    const data = usePlayerData();
    const { isPro, purchasing, restoring, purchasePro, restorePurchases } = usePro();
    const [page, setPage] = useState<Page | 'startup'>('startup');
    const handleSignOut = useCallback(async () => {
        await onSignOut();
    }, [onSignOut]);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [confirm, setConfirm] = useState<any>(null);
    const [showPromo, setShowPromo] = useState(false);
    const [showRate, setShowRate] = useState(false);
    const [showUpgradePro, setShowUpgradePro] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [upgradeFeatureName, setUpgradeFeatureName] = useState('');
    const promoCountRef = React.useRef(0);
    const prevLevelRef = React.useRef<number | null>(null);

    const openPurchaseModal = useCallback(() => setShowPurchaseModal(true), []);

    // Initialize AdMob on mount (skip if Pro)
    useEffect(() => {
        if (isPro) return;
        initAdMob().then(() => { prepareInterstitialAd(); prepareRewardedAd(); });
    }, [isPro]);

    // Detect level-up and show rate prompt every RATE_EVERY_N_LEVELS levels
    useEffect(() => {
        const currentLevel = data.player.level;
        if (prevLevelRef.current === null) {
            prevLevelRef.current = currentLevel;
            return;
        }
        if (currentLevel > prevLevelRef.current) {
            const levelsGained = currentLevel - prevLevelRef.current;
            prevLevelRef.current = currentLevel;
            const stored = parseInt(localStorage.getItem(RATE_STORAGE_KEY) || '0', 10);
            const updated = stored + levelsGained;
            if (updated >= RATE_EVERY_N_LEVELS) {
                localStorage.setItem(RATE_STORAGE_KEY, '0');
                setTimeout(() => setShowRate(true), 1500);
            } else {
                localStorage.setItem(RATE_STORAGE_KEY, String(updated));
            }
        }
    }, [data.player.level]);

    // Show promo modal every 5 page navigations (only for non-Pro users)
    const maybeShowPromo = useCallback(() => {
        if (isPro) return;
        promoCountRef.current += 1;
        if (promoCountRef.current % 5 === 0) {
            setShowPromo(true);
        }
    }, [isPro]);

    // Manage banner ads based on page (skip if Pro)
    useEffect(() => {
        if (isPro) { hideBannerAd(); return; }
        if (BANNER_PAGES.includes(page as string)) {
            showBannerAd();
        } else {
            hideBannerAd();
        }
    }, [page, isPro]);

    // Navigate with ad logic (skip interstitials if Pro)
    const navigateTo = useCallback((newPage: Page | 'startup') => {
        if (!isPro && INTERSTITIAL_ON_ENTER.includes(newPage as string)) {
            showInterstitialAd();
        }
        maybeShowPromo();
        setPage(newPage);
    }, [maybeShowPromo, isPro]);

    // Clear dungeon — skip interstitial if Pro
    const handleClearDungeon = useCallback(async () => {
        if (!isPro) await showInterstitialAd();
        data.clearActiveDungeon();
    }, [data, isPro]);

    // Complete quest — skip interstitial if Pro
    const handleCompleteQuest = useCallback((id: string) => {
        setConfirm({
            title: 'Clear Quest',
            message: 'Confirm mission accomplishment?',
            onConfirm: async () => {
                if (!isPro) await showInterstitialAd();
                data.completeQuest(id);
            }
        });
    }, [data, isPro]);

    // Watch ad for quest — grant immediately if Pro
    const handleWatchAdForQuest = useCallback((onGranted: () => void) => {
        if (isPro) { onGranted(); return; }
        showRewardedAd(onGranted);
    }, [isPro]);

    const handleShowUpgrade = useCallback((featureName: string) => {
        setUpgradeFeatureName(featureName);
        setShowUpgradePro(true);
    }, []);

    const nav = [
        { id: 'status', label: 'STATUS', icon: <StatusIcon /> },
        { id: 'quests', label: 'QUESTS', icon: <QuestLogIcon /> },
        { id: 'skills', label: 'SKILLS', icon: <SkillIcon /> },
        { id: 'dungeons', label: 'DUNGEONS', icon: <DungeonIcon /> },
        { id: 'menu', label: 'MENU', icon: <MenuIcon /> },
    ];

    const fullNav = [
        ...nav,
        { id: 'history', label: 'HISTORY', icon: <HistoryIcon /> },
        { id: 'workshop', label: 'WORKSHOP', icon: <WorkshopIcon /> },
        { id: 'task-list', label: 'PLANNER', icon: <StatsIcon /> },
        { id: 'shop', label: 'SHOP', icon: <ShopIcon /> },
        { id: 'inventory', label: 'INVENTORY', icon: <InventoryIcon /> },
        { id: 'achievements', label: 'ACHIEVEMENTS', icon: <AchievementIcon /> },
        { id: 'report', label: 'REPORTS', icon: <ReportIcon /> },
        { id: 'codex', label: 'CODEX', icon: <InfoIcon /> },
    ];

    const render = () => {
        switch (page) {
            case 'menu': return (
                <div className="animate-fadeIn pb-24 lg:pb-0 space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                        {fullNav.filter(n => n.id !== 'menu').map(n => (
                            <button key={n.id} onClick={() => navigateTo(n.id as Page)} className="bg-[#020617] p-4 md:p-8 rounded-lg flex flex-col items-center justify-center hover:bg-blue-500/10 transition-all border-blue-500/20 group hover:border-blue-400/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
                                <div className="text-blue-400 mb-2 md:mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(56,189,248,0.5)] scale-90 md:scale-100">{n.icon}</div>
                                <span className="font-orbitron text-[9px] md:text-[11px] font-black tracking-[0.2em] md:tracking-[0.3em] text-white uppercase text-center leading-tight">{n.label}</span>
                            </button>
                        ))}
                    </div>

                </div>
            );
            case 'status': return <StatusPage player={data.player} onRename={data.renamePlayer} onLoginPress={!userEmail ? () => setShowAuthModal(true) : undefined} userEmail={userEmail} onSignOut={userEmail ? handleSignOut : undefined} />;
            case 'achievements': return <AchievementsPage achievements={data.achievements} />;
            case 'quests': return <QuestLogPage quests={data.quests} onComplete={handleCompleteQuest} onDelete={id => setConfirm({ title: 'Erase Entry', message: 'Permanently purge this quest record?', isDangerous: true, onConfirm: () => data.deleteQuest(id) })} onFail={id => data.failQuest(id)} onAddQuest={data.addQuest} onWatchAdForQuest={handleWatchAdForQuest} />;
            case 'skills': return <SkillsPage skills={data.skills} skillFolders={data.skillFolders} categories={data.categories} improveSkill={data.improveSkill} addSkill={data.addSkill} addSkillFolder={data.addSkillFolder} addCategory={data.addCategory} onDeleteSkill={data.deleteSkill} onDeleteSkillFolder={data.deleteSkillFolder} onDeleteCategory={data.deleteCategory} />;
            case 'dungeons': return <DungeonsPage onStartDungeon={d => setConfirm({ title: 'Enter Gate', message: `Proceed into [${d.grade}] Gate: ${d.name}? Danger level is high.`, onConfirm: () => data.startDungeon(d.id) })} activeDungeon={data.activeDungeon} dungeonCooldowns={data.dungeonCooldowns} onClearDungeon={handleClearDungeon} onFailDungeon={data.failActiveDungeon} onProgressDungeon={data.progressDungeon} dungeonHistory={data.dungeonHistory} />;
            case 'history': return <QuestHistory completedQuests={data.completedQuests} dungeonHistory={data.dungeonHistory} onUpgradePro={() => handleShowUpgrade('Detailed History Log')} />;
            case 'task-list': return <TaskList weeklyPlan={data.weeklyPlan} onAddTask={data.addTaskListTask} onToggleTask={data.toggleTaskListTask} onDeleteTask={data.deleteTaskListTask} />;
            case 'workshop': return <WorkshopPage inventory={data.inventory} onEnhance={data.enhanceGear} onAdvance={data.advanceGear} player={data.player} />;
            case 'shop': return <ShopPage player={data.player} inventory={data.inventory} onBuyItem={i => setConfirm({ title: 'System Exchange', message: `Authorize coin transfer for ${i.name}?`, onConfirm: () => data.buyItem(i) })} />;
            case 'inventory': return <InventoryPageWrapper inventory={data.inventory} player={data.player} onEquip={data.equipItem} onUnequip={data.unequipItem} onBreak={slot => setConfirm({ title: 'Break Curse', message: 'Permanently destroy cursed equipment using Light Orb?', isDangerous: true, onConfirm: () => data.breakGear(slot) })} />;
            case 'codex': return <Codex onOpenExport={data.exportState} onOpenImport={data.importState} onSetBackground={() => {}} background={null} onNavigateToReport={() => navigateTo('report')} />;
            case 'report': return <ReportExport player={data.player} completedQuests={data.completedQuests} dungeonHistory={data.dungeonHistory} achievements={data.achievements} inventory={data.inventory} onUpgradePro={() => handleShowUpgrade('System Reports')} />;
            default: return null;
        }
    };

    if (page === 'startup') {
        return <StartupPage onEnter={() => navigateTo('menu')} onLoginPress={!userEmail ? () => setShowAuthModal(true) : undefined} userEmail={userEmail} />;
    }

    return (
        <div className="h-screen bg-[#020617] text-white font-sans flex flex-col lg:flex-row overflow-hidden pb-16 lg:pb-0">
            <NotificationManager notifications={data.notifications} />

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 flex-col glass-panel border-r border-blue-500/10 p-8 z-50 overflow-y-auto custom-scrollbar">
                <header className="mb-8">
                    <div className="flex items-baseline gap-2">
                        <h1 className="font-orbitron font-black text-3xl tracking-tighter text-blue-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]">R.L.L</h1>
                        <span className="font-orbitron text-[8px] font-black text-blue-300/60 uppercase tracking-[0.2em] border border-blue-500/30 px-1 py-0.5 rounded-sm">LITE</span>
                    </div>
                    <p className="font-orbitron text-[8px] text-blue-500/40 uppercase tracking-widest mt-0.5">REAL LIFE LEVELLING LITE</p>
                    <div className="h-1 w-16 bg-blue-500 mt-2 rounded-full"></div>
                </header>
                <nav className="flex flex-col gap-3 flex-grow">
                    {fullNav.map(n => (
                        <button key={n.id} onClick={() => navigateTo(n.id as Page)} className={`flex items-center gap-5 p-4 rounded-sm transition-all font-orbitron text-[10px] font-black tracking-[0.2em] uppercase border border-transparent ${page === n.id ? 'bg-blue-600/30 text-white border-blue-500 shadow-[inset_0_0_10px_rgba(56,189,248,0.2)]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
                            <span className={`w-5 h-5 flex items-center justify-center transition-transform ${page === n.id ? 'scale-110 text-blue-300' : ''}`}>{n.icon}</span>
                            <span>{n.label}</span>
                        </button>
                    ))}
                </nav>
                {/* Pro Version Banner in sidebar — hidden when Pro */}
                {!isPro && (
                    <div className="mt-6">
                        <ProVersionBanner compact onUpgrade={openPurchaseModal} />
                    </div>
                )}
                {userEmail && (
                    <div className="mt-4 pt-4 border-t border-blue-500/10">
                        <p className="font-orbitron text-[7px] text-gray-600 uppercase tracking-widest truncate mb-2">{userEmail}</p>
                        <button onClick={handleSignOut} className="w-full text-[9px] font-orbitron font-black uppercase tracking-widest text-gray-500 hover:text-red-400 transition-colors py-1">
                            Sign Out
                        </button>
                    </div>
                )}
                <footer className="mt-4 text-[8px] font-orbitron text-blue-500/40 tracking-widest uppercase">
                    &copy; 2025 R.L.L OS // LITE EDITION
                </footer>
            </aside>

            {/* Mobile Top Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-950/90 backdrop-blur-md border-b border-blue-500/10 z-[100] px-4 py-3 flex justify-between items-center shadow-lg h-14">
                <div className="flex items-center gap-2">
                    {page !== 'menu' && (
                         <button onClick={() => navigateTo('menu')} className="text-blue-500 p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                    <div className="flex items-baseline gap-1.5">
                        <h1 className="font-orbitron font-black text-xl text-blue-400 tracking-tighter uppercase leading-none">R.L.L</h1>
                        <span className="font-orbitron text-[7px] font-black text-blue-300/50 uppercase tracking-[0.15em] border border-blue-500/20 px-1 rounded-sm">LITE</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-orbitron text-[10px] font-black text-blue-500/60 uppercase tracking-widest bg-blue-500/5 px-2 py-1 rounded border border-blue-500/20">LVL {data.player.level}</span>
                    {userEmail && (
                        <button onClick={handleSignOut} className="font-orbitron text-[8px] font-black text-gray-600 hover:text-red-400 uppercase tracking-widest transition-colors px-1">
                            OUT
                        </button>
                    )}
                </div>
            </div>

            <main className="flex-grow overflow-y-auto custom-scrollbar pt-14 lg:pt-0">
                <div className={page === 'status' ? 'w-full h-full p-2 md:p-4 lg:p-12' : 'max-w-6xl mx-auto p-4 md:p-6 lg:p-16 border-none rounded-none'}>
                    {render()}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-lg border-t border-blue-500/10 z-[110] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                {/* Pro Version Banner above bottom nav — hidden when Pro */}
                {!isPro && (
                    <div className="px-3 pt-1.5 pb-0 border-b border-blue-500/5">
                        <ProVersionBanner compact onUpgrade={openPurchaseModal} />
                    </div>
                )}
                <div className="h-16 flex items-center justify-around px-2">
                    {nav.map(n => (
                        <button
                            key={n.id}
                            onClick={() => navigateTo(n.id as Page)}
                            className={`flex flex-col items-center justify-center w-14 h-full transition-all ${page === n.id ? 'text-blue-400' : 'text-gray-500'}`}
                        >
                            <div className={`transition-transform duration-300 ${page === n.id ? 'scale-110 mb-0.5' : 'scale-90 opacity-60'}`}>{n.icon}</div>
                            <span className={`font-orbitron text-[7px] font-black tracking-widest uppercase transition-all ${page === n.id ? 'opacity-100' : 'opacity-40'}`}>{n.label}</span>
                            {page === n.id && (
                                <div className="absolute bottom-1 w-6 h-0.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)] animate-pulse" />
                            )}
                        </button>
                    ))}
                </div>
            </nav>

            <ConfirmationModal isOpen={!!confirm} title={confirm?.title || ''} message={confirm?.message || ''} onConfirm={confirm?.onConfirm || (() => {})} onCancel={() => setConfirm(null)} isDangerous={confirm?.isDangerous} />

            {showPromo && <PromoModal onClose={() => setShowPromo(false)} onPurchase={openPurchaseModal} />}
            {showRate && <RateAppModal level={data.player.level} onClose={() => setShowRate(false)} />}
            {showUpgradePro && <UpgradeToProModal featureName={upgradeFeatureName} onClose={() => setShowUpgradePro(false)} onPurchase={openPurchaseModal} />}
            {showPurchaseModal && (
                <ProPurchaseModal
                    onClose={() => setShowPurchaseModal(false)}
                    onPurchase={purchasePro}
                    onRestore={restorePurchases}
                    purchasing={purchasing}
                    restoring={restoring}
                />
            )}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[500] flex items-end justify-center" onClick={() => setShowAuthModal(false)}>
                    <div className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <AuthPage
                            onSignIn={async (email, password) => { const ok = await onSignIn(email, password); if (ok) setShowAuthModal(false); return ok; }}
                            onSignUp={onSignUp}
                            onForgotPassword={onResetPassword}
                            loading={authLoading}
                            error={authError}
                            onClearError={onClearAuthError}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
