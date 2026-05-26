
import React, { useState, useEffect } from 'react';
import type { Player } from '../types';
import { getXpToNextLevel, TITLES } from '../constants';
import { Difficulty } from '../types';

interface PlayerStatsProps {
  player: Player;
  onRename: (newName: string) => void;
  onLoginPress?: () => void;
  userEmail?: string;
  onSignOut?: () => void;
}

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
);

const getAttributeGradeData = (val: number) => {
  if (val <= 100) return { grade: 'E', min: 0, max: 100, color: 'from-gray-600 to-gray-400', glow: 'rgba(156, 163, 175, 0.4)', text: 'text-gray-400', border: 'border-gray-500/50' };
  if (val <= 250) return { grade: 'D', min: 101, max: 250, color: 'from-green-600 to-green-400', glow: 'rgba(74, 222, 128, 0.4)', text: 'text-green-400', border: 'border-green-500/50' };
  if (val <= 500) return { grade: 'C', min: 251, max: 500, color: 'from-orange-600 to-orange-400', glow: 'rgba(251, 146, 60, 0.4)', text: 'text-orange-400', border: 'border-orange-500/50' };
  if (val <= 1000) return { grade: 'B', min: 501, max: 1000, color: 'from-indigo-600 to-indigo-400', glow: 'rgba(129, 140, 248, 0.4)', text: 'text-indigo-400', border: 'border-indigo-500/50' };
  if (val <= 1500) return { grade: 'A', min: 1001, max: 1500, color: 'from-purple-600 to-purple-400', glow: 'rgba(192, 132, 252, 0.4)', text: 'text-purple-400', border: 'border-purple-500/50' };
  if (val <= 3000) return { grade: 'S', min: 1501, max: 3000, color: 'from-yellow-600 to-yellow-400', glow: 'rgba(250, 204, 21, 0.4)', text: 'text-yellow-400', border: 'border-yellow-500/50' };
  return { grade: 'S+', min: 3001, max: 3001, color: 'from-red-600 to-red-400', glow: 'rgba(239, 68, 68, 0.6)', text: 'text-red-500', border: 'border-red-500/50', isMax: true };
};

export const PlayerStats: React.FC<PlayerStatsProps> = ({ player, onRename, onLoginPress, userEmail, onSignOut }) => {
  const { level, xp, rank, name, shopCoins, equippedTitle, attributes } = player;
  const xpToNextLevel = getXpToNextLevel(level);
  const xpPercentage = (xp / xpToNextLevel) * 100;
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(name);
  const title = equippedTitle ? TITLES[equippedTitle] : null;

  useEffect(() => {
    setEditingName(name);
  }, [name]);
  
  const handleRename = () => {
    onRename(editingName);
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleRename();
    else if (e.key === 'Escape') { setEditingName(name); setIsEditing(false); }
  };

  const rankStyles: Record<string, { className: string; glowClass?: string }> = {
    E: { className: 'text-gray-400' },
    D: { className: 'text-green-400' },
    C: { className: 'text-orange-400' },
    B: { className: 'text-indigo-400' },
    A: { className: 'text-purple-400', glowClass: 'animate-rank-a-glow' },
    S: { className: 'text-yellow-400', glowClass: 'animate-rank-s-glow' },
    [Difficulty.S_PLUS]: { className: 'text-red-400', glowClass: 'animate-grade-s-plus-glow' },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 w-full animate-fadeIn">
      {/* Left Section: Identity & Summary */}
      <div className="lg:col-span-4 space-y-4 md:space-y-6">
        <div className="border border-blue-500/20 p-5 md:p-8 rounded-lg shadow-2xl scanline-effect group bg-transparent">
            <div className="mb-4 md:mb-8">
                {title && <p className={`font-orbitron text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-2 ${rankStyles[title.rank]?.className} neon-text`}>« {title.name} »</p>}
                {isEditing ? (
                <input
                    type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)}
                    onBlur={handleRename} onKeyDown={handleKeyDown}
                    className="font-orbitron text-2xl md:text-3xl bg-gray-700/30 border-b-2 border-blue-500 focus:outline-none text-white w-full"
                    autoFocus
                />
                ) : (
                <div className="flex items-center gap-2 md:gap-3">
                    <h2 className="font-orbitron text-2xl md:text-4xl font-black text-white neon-text uppercase tracking-tight">{name}</h2>
                    <button onClick={() => setIsEditing(true)} className="text-gray-600 hover:text-blue-400 transition-colors">
                        <EditIcon />
                    </button>
                </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-8 border-y border-white/5 py-6 md:py-8">
                <div className="space-y-1">
                    <p className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">Synchronization</p>
                    <p className="font-orbitron text-2xl md:text-4xl font-black text-white neon-text">LV. {level}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">Ranking</p>
                    <p className={`font-orbitron text-2xl md:text-4xl font-black ${rankStyles[rank].className} ${rankStyles[rank].glowClass || ''}`}>{rank}</p>
                </div>
            </div>

            <div className="space-y-4 md:space-y-6">
                <div className="flex justify-between items-center bg-black/40 p-3 md:p-4 rounded border border-yellow-500/20">
                    <span className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">Gold Coins</span>
                    <div className="flex items-center gap-2">
                        <span className="font-orbitron text-xl md:text-2xl text-yellow-400 font-black">{shopCoins}</span>
                        <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-yellow-400"></div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[8px] md:text-[9px] font-black font-orbitron text-blue-300/60 uppercase tracking-widest">
                        <span>XP Progress</span>
                        <span>{Math.floor(xp)} / {xpToNextLevel}</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-sm h-2.5 md:h-3 border border-blue-500/20 p-[2px] relative overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-blue-700 via-blue-400 to-cyan-400 h-full transition-all duration-1000 ease-out"
                            style={{ width: `${xpPercentage}%`, boxShadow: '0 0 10px rgba(56, 189, 248, 0.4)' }}
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>


      {/* Account / Login Section */}
      <div className="lg:col-span-12 mt-2">
        <div className="border border-blue-500/10 rounded-lg p-4 md:p-6 bg-transparent">
          {userEmail ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="font-orbitron text-[8px] text-gray-500 uppercase tracking-widest mb-1">Linked Account</p>
                <p className="font-orbitron text-xs text-blue-400/80 truncate max-w-xs">{userEmail}</p>
              </div>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="font-orbitron text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-red-400 border border-gray-700 hover:border-red-500/40 px-4 py-2 rounded transition-all duration-200"
                >
                  Sign Out
                </button>
              )}
            </div>
          ) : onLoginPress ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="font-orbitron text-[8px] text-gray-500 uppercase tracking-widest mb-1">Account</p>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Link an account to sync your progress across devices</p>
              </div>
              <button
                onClick={onLoginPress}
                className="shrink-0 font-orbitron text-[10px] font-black uppercase tracking-widest text-blue-400 border border-blue-500/40 hover:bg-blue-500/10 hover:border-blue-400 px-5 py-2.5 rounded transition-all duration-200"
              >
                Login / Register
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Right Section: Attributes Matrix */}
      <div className="lg:col-span-8 space-y-4 md:space-y-6">
        <div className="border border-blue-500/20 p-5 md:p-8 rounded-lg shadow-xl bg-transparent h-full">
            <h3 className="font-orbitron text-xs md:text-sm font-black text-blue-400 mb-6 md:mb-8 uppercase tracking-[0.2em] md:tracking-[0.3em] border-l-4 border-blue-500 pl-4">ATTRIBUTE MATRIX</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 md:gap-y-12">
                {Object.entries(attributes).map(([attr, val]) => {
                    const data = getAttributeGradeData(val as number);
                    const progress = data.isMax ? 100 : (((val as number) - data.min) / (data.max - data.min)) * 100;
                    
                    return (
                        <div key={attr} className="group relative">
                            <div className="flex justify-between items-end mb-1 md:mb-2">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded bg-black/40 border flex items-center justify-center font-orbitron text-[10px] md:text-xs font-black ${data.text} ${data.border}`}>
                                        {data.grade}
                                    </div>
                                    <span className="font-orbitron text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-blue-300 transition-colors">{attr}</span>
                                </div>
                                <span className={`font-orbitron text-lg md:text-xl font-black ${data.isMax ? 'text-red-500 animate-pulse' : 'text-white neon-text'}`}>
                                    {data.isMax ? 'PEAK' : val}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 relative">
                                <div 
                                    className={`h-full bg-gradient-to-r ${data.color} transition-all duration-1500 ease-in-out`}
                                    style={{ width: `${Math.max(4, progress)}%`, boxShadow: `0 0 10px ${data.glow}` }}
                                />
                                {data.isMax && <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />}
                            </div>
                            {!data.isMax && (
                                <div className="flex justify-between mt-1 px-1">
                                    <span className="text-[6px] md:text-[7px] font-orbitron text-gray-700 uppercase tracking-widest">{data.min} MIN</span>
                                    <span className="text-[6px] md:text-[7px] font-orbitron text-gray-700 uppercase tracking-widest">{data.max} MAX</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};
