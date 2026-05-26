
import React from 'react';
import { DAILY_XP_GOAL, DAILY_QUEST_PENALTY, STREAK_BONUS_XP } from '../constants';

interface DailyQuestProps {
  progress: number;
  streak?: number;
}

const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const BoltIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline text-orange-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 0L4 11h5l-1 9L16 9h-5L10 0z" />
    </svg>
);

export const DailyQuest: React.FC<DailyQuestProps> = ({ progress, streak = 0 }) => {
  const isComplete = progress >= 100;

  return (
    <div className="glass-panel p-5 rounded-lg border-blue-500/20 group">
        <h3 className="font-orbitron text-xl text-blue-400 neon-text mb-1 tracking-tight">DAILY QUEST: DISCIPLINE</h3>
        <p className="text-gray-500 mb-4 text-xs font-medium uppercase tracking-wider">Earn {DAILY_XP_GOAL} XP today to maintain synchronization.</p>
        
        <div className="w-full bg-black/40 rounded-sm h-6 border border-blue-500/20 mb-3 overflow-hidden p-[2px]">
            <div
                className={`h-full rounded-sm transition-all duration-700 ease-in-out flex items-center justify-center text-[10px] font-bold ${isComplete ? 'bg-gradient-to-r from-yellow-600 via-yellow-400 to-orange-500' : 'bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400'}`}
                style={{ width: `${Math.min(100, progress)}%`, boxShadow: isComplete ? '0 0 15px rgba(234, 179, 8, 0.4)' : '0 0 10px rgba(56, 189, 248, 0.3)' }}
            >
                <span className="text-white drop-shadow-md">{progress.toFixed(0)}%</span>
            </div>
        </div>

        <div className="text-[10px] font-orbitron uppercase tracking-widest text-center">
            {isComplete ? (
                <p className="text-yellow-400 font-bold animate-pulse">!! MISSION COMPLETE !!</p>
            ) : (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6">
                    {streak >= 7 && (
                        <p className="text-green-400 font-bold flex items-center">
                            <BoltIcon />
                            <span>STREAK ACTIVE: +{STREAK_BONUS_XP} XP</span>
                        </p>
                    )}
                    <p className="text-red-500/80 flex items-center justify-center font-bold">
                        <AlertIcon />
                        PENALTY: -{DAILY_QUEST_PENALTY} XP
                    </p>
                </div>
            )}
        </div>
    </div>
  );
};
