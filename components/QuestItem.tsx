
import React, { useState } from 'react';
import type { Quest } from '../types';
import { Difficulty } from '../types';
import { XP_PER_DIFFICULTY, QUEST_COIN_REWARDS } from '../constants';

interface QuestItemProps {
  quest: Quest;
  onComplete: (questId: string) => void;
  onDelete?: (questId: string) => void;
  onFail?: (questId: string) => void;
}

const getGradeStyles = (difficulty: Difficulty) => {
    switch (difficulty) {
        case Difficulty.E: return { bg: 'bg-gray-700/30', text: 'text-gray-400', border: 'border-gray-500/30', glow: '' };
        case Difficulty.D: return { bg: 'bg-green-800/20', text: 'text-green-400', border: 'border-green-600/30', glow: '' };
        case Difficulty.C: return { bg: 'bg-blue-800/20', text: 'text-blue-400', border: 'border-blue-600/30', glow: '' };
        case Difficulty.B: return { bg: 'bg-indigo-800/20', text: 'text-indigo-400', border: 'border-indigo-600/30', glow: '' };
        case Difficulty.A: return { bg: 'bg-purple-800/20', text: 'text-purple-400', border: 'border-purple-600/40', glow: 'animate-pulse' };
        case Difficulty.S: return { bg: 'bg-yellow-800/20', text: 'text-yellow-400', border: 'border-yellow-500/50', glow: 'animate-grade-s-glow' };
        case Difficulty.S_PLUS: return { bg: 'bg-red-900/30', text: 'text-red-500', border: 'border-red-600/60', glow: 'animate-grade-s-plus-glow' };
        case Difficulty.X: return { bg: 'bg-black/60', text: 'text-red-700', border: 'border-black', glow: 'animate-black-hole' };
        default: return { bg: 'bg-white/5', text: 'text-white', border: 'border-white/20', glow: '' };
    }
};

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const CoinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline-block mr-1 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
      <circle cx="10" cy="10" r="8" fill="#FBBF24" />
      <circle cx="10" cy="10" r="6" fill="#F59E0B" />
    </svg>
);

export const QuestItem: React.FC<QuestItemProps> = ({ quest, onComplete, onDelete, onFail }) => {
  const styles = getGradeStyles(quest.difficulty);
  const xp = XP_PER_DIFFICULTY[quest.difficulty];
  const coins = QUEST_COIN_REWARDS[quest.difficulty];
  const [isExpanded, setIsExpanded] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);

  const hasFailureCondition = !!quest.failurePenalty;

  const handleAction = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    onComplete(quest.id);
    // Local reset after some time just in case, but usually quest is removed/updated
    setTimeout(() => setIsProcessing(false), 2000);
  };

  const handleFailAction = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    onFail?.(quest.id);
    setTimeout(() => setIsProcessing(false), 2000);
  };
  
  return (
    <div className={`glass-panel rounded border transition-all duration-500 ${styles.bg} ${styles.border} ${styles.glow} group/quest hover:-translate-y-0.5 mb-3 md:mb-4 ${isProcessing ? 'opacity-70 pointer-events-none' : ''}`}>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 overflow-hidden bg-[#03091c] rounded-none gap-3 md:gap-4">
            {quest.attributes.length > 0 && (
                <div className="absolute top-1 left-2 flex flex-wrap gap-1">
                    {quest.attributes.map(attr => (
                        <span key={attr} className="text-[6px] md:text-[7px] font-black inline-block py-0 px-1.5 rounded-sm text-blue-300 bg-blue-900/60 uppercase tracking-[0.1em] md:tracking-[0.2em] border border-blue-500/20">
                            {attr}
                        </span>
                    ))}
                </div>
            )}
            <div className={`flex items-center flex-grow min-w-0 w-full sm:w-auto ${quest.attributes.length > 0 ? 'mt-3 md:mt-4' : ''}`}>
                 {onDelete && (
                    <button
                        onClick={() => onDelete(quest.id)}
                        className="mr-2 md:mr-4 p-1.5 md:p-2 rounded-full bg-red-900/40 text-red-400 hover:bg-red-700 hover:text-white transition-all duration-200 opacity-60 sm:opacity-0 group-hover/quest:opacity-100"
                        aria-label="Delete quest"
                    >
                        <TrashIcon />
                    </button>
                )}
                <div className={`font-orbitron text-lg md:text-2xl font-black w-10 md:w-12 text-center mr-2 md:mr-4 flex-shrink-0 ${styles.text} drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]`}>
                    [{quest.difficulty}]
                </div>
                <div className="min-w-0 flex-grow pr-2 md:pr-4">
                    <p className="font-orbitron font-black text-white text-[10px] md:text-[11px] leading-tight md:leading-[20px] uppercase tracking-[0.05em] md:tracking-[0.1em] truncate mb-0.5 md:mb-1">{quest.name}</p>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4">
                        {xp > 0 && (
                             <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${styles.text}`}>
                                {hasFailureCondition ? `Loss: -${quest.failurePenalty?.xp} XP` : `Gain: +${xp} XP`}
                             </p>
                        )}
                        {!hasFailureCondition && coins > 0 && (
                            <p className="text-[9px] md:text-[10px] font-black text-yellow-400 flex items-center tracking-widest">
                                <CoinIcon/>{coins} <span className="ml-1 text-[7px] md:text-[8px] opacity-60">GOLD</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
            
            <div className={`flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 md:gap-3 flex-shrink-0 w-full sm:w-auto ${quest.attributes.length > 0 ? 'sm:mt-4' : ''}`}>
                <span className="text-[7px] md:text-[8px] font-black inline-block py-0.5 md:py-1 px-2 md:px-3 rounded-sm uppercase tracking-[0.2em] md:tracking-[0.3em] border border-white/10 bg-black/60 text-gray-500">
                    {quest.type.replace('-', ' ')}
                </span>
                {hasFailureCondition ? (
                     <button
                        onClick={handleFailAction}
                        className="font-orbitron bg-red-900/80 hover:bg-red-700 text-white px-3 md:px-5 py-1.5 md:py-2 rounded-sm uppercase text-[9px] md:text-[10px] font-black tracking-widest transition-all shadow-lg w-20 md:w-[100px] border border-red-500/40"
                    >
                        Fail
                    </button>
                ) : (
                    <button
                        onClick={handleAction}
                        className="font-orbitron bg-blue-700 hover:bg-blue-600 text-white px-3 md:px-5 py-1.5 md:py-2 rounded-sm uppercase text-[9px] md:text-[10px] font-black tracking-widest transition-all shadow-lg hover:shadow-[0_0_15px_rgba(56,189,248,0.5)] w-20 md:w-[100px] border border-blue-400/40"
                    >
                        Clear
                    </button>
                )}
            </div>
             {(quest.description || quest.isSystemQuest) && (
                <button onClick={() => setIsExpanded(!isExpanded)} className="absolute bottom-1 right-2 text-gray-800 hover:text-blue-400 transition-colors" aria-label={isExpanded ? 'Collapse' : 'Expand'}>
                    <svg className={`h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                </button>
            )}
        </div>
        {isExpanded && (
            <div className="px-4 md:px-5 pb-3 md:pb-4 pt-2 md:pt-3 border-t border-white/5 bg-black/40 space-y-2">
                {quest.description && <p className="text-[10px] md:text-xs text-gray-500 leading-normal uppercase tracking-widest italic font-medium">"{quest.description}"</p>}
                {(quest.difficulty === Difficulty.B || quest.difficulty === Difficulty.A || quest.difficulty === Difficulty.S || quest.difficulty === Difficulty.S_PLUS) && (
                    <div className="flex flex-col gap-1 border-t border-white/5 pt-2">
                        <p className="text-[8px] text-blue-400 font-black uppercase tracking-widest">Potential Drops:</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">
                            {quest.difficulty === Difficulty.B && "5% Chance: Copper/Iron (1-3)"}
                            {quest.difficulty === Difficulty.A && "10% Chance: Copper/Iron (1-5), 7% Chance: Aluminium/Fangs (1-3)"}
                            {quest.difficulty === Difficulty.S && "30% Chance: Copper/Iron (5-15), 20% Chance: Aluminium/Fangs (2-8), 5% Chance: Diamonds/Shards (3-5), 1% Chance: Bloodstones (1-2)"}
                            {quest.difficulty === Difficulty.S_PLUS && "80% Chance: Copper/Iron (20-30), 50% Chance: Aluminium/Fangs (5-15), 30% Chance: Diamonds/Shards (3-10), 100% Chance: Bloodstones (1-3)"}
                        </p>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};
