
import React, { useState, useMemo } from 'react';
import type { CompletedQuest, DungeonHistoryEntry } from '../types';
import { Difficulty } from '../types';
import { XP_PER_DIFFICULTY, DUNGEONS } from '../constants';

// --- TYPES & INTERFACES ---
interface QuestHistoryProps {
  completedQuests: CompletedQuest[];
  dungeonHistory: DungeonHistoryEntry[];
  onUpgradePro: () => void;
}

interface DailyActivity {
  quests: CompletedQuest[];
  dungeons: DungeonHistoryEntry[];
  totalXp: number;
}

// --- HELPER FUNCTIONS & CONSTANTS ---
const difficultyStyles: Record<Difficulty, { text: string; border: string }> = {
    [Difficulty.E]: { text: 'text-gray-500', border: 'border-gray-700' },
    [Difficulty.D]: { text: 'text-green-300', border: 'border-green-500' },
    [Difficulty.C]: { text: 'text-orange-300', border: 'border-orange-500' },
    [Difficulty.B]: { text: 'text-indigo-300', border: 'border-indigo-500' },
    [Difficulty.A]: { text: 'text-purple-300', border: 'border-purple-500' },
    [Difficulty.S]: { text: 'text-yellow-300', border: 'border-yellow-500' },
    [Difficulty.S_PLUS]: { text: 'text-red-400', border: 'border-red-500' },
    [Difficulty.X]: { text: 'text-red-400', border: 'border-red-800' },
};

const getXpGrade = (xp: number): Difficulty => {
    if (xp > 350) return Difficulty.S_PLUS;
    if (xp > 200) return Difficulty.S;
    if (xp > 130) return Difficulty.A;
    if (xp > 80) return Difficulty.B;
    if (xp > 50) return Difficulty.C;
    if (xp > 30) return Difficulty.D;
    return Difficulty.E;
};

// --- DETAIL MODAL ---
const HistoryDetailModal: React.FC<{ date: Date; activities: DailyActivity; onClose: () => void }> = ({ date, activities, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 border-2 border-blue-500/50 rounded-lg shadow-2xl shadow-blue-500/20 w-full max-w-2xl m-4" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <div>
                        <h2 className="font-orbitron text-xl text-blue-300">{date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
                        <p className="font-bold text-yellow-300">Total XP Earned: {activities.totalXp}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
                    {activities.quests.length > 0 && <div><h3 className="font-orbitron text-lg text-gray-300 mb-2">Activities Recorded</h3><div className="space-y-2">{activities.quests.map(q => <div key={q.completionId} className={`p-2 bg-gray-900/50 rounded-md text-sm ${q.difficulty === Difficulty.X ? 'border border-red-800' : ''}`}><span className={`font-bold mr-2 ${difficultyStyles[q.difficulty].text}`}>[{q.difficulty}]</span>{q.name} - <span className={q.difficulty === Difficulty.X ? 'text-red-500' : 'text-yellow-400'}>{q.difficulty === Difficulty.X ? 'PENALTY APPLIED' : `${XP_PER_DIFFICULTY[q.difficulty]} XP`}</span></div>)}</div></div>}
                    {activities.dungeons.length > 0 && <div><h3 className="font-orbitron text-lg text-gray-300 mb-2">Dungeons</h3><div className="space-y-2">{activities.dungeons.map(d => <div key={d.completedAt} className={`p-2 bg-gray-900/50 rounded-md text-sm ${d.status === 'failed' ? 'opacity-60' : ''}`}><span className={`font-bold mr-2 ${difficultyStyles[d.grade].text}`}>[{d.grade}]</span>{d.name} - <span className={d.status === 'cleared' ? 'text-green-400' : 'text-red-400'}>{d.status}</span></div>)}</div></div>}
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
export const QuestHistory: React.FC<QuestHistoryProps> = ({ completedQuests, dungeonHistory, onUpgradePro }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const activitiesByDate = useMemo(() => {
        const data = new Map<string, DailyActivity>();
        const toLocalDateKey = (d: Date | number | string): string => {
            const date = new Date(d);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Showing all quests including system quests in history
        completedQuests.forEach(quest => {
            const dateStr = toLocalDateKey(quest.completedAt);
            const entry = data.get(dateStr) || { quests: [], dungeons: [], totalXp: 0 };
            entry.quests.push(quest);
            entry.totalXp += XP_PER_DIFFICULTY[quest.difficulty] || 0;
            data.set(dateStr, entry);
        });

        dungeonHistory.forEach(dungeon => {
            if (dungeon.status === 'cleared') {
                const dateStr = toLocalDateKey(dungeon.completedAt);
                const entry = data.get(dateStr) || { quests: [], dungeons: [], totalXp: 0 };
                entry.dungeons.push(dungeon);
                const dungeonData = DUNGEONS.find(d => d.id === dungeon.id);
                entry.totalXp += dungeonData?.rewards?.xp || 0;
                data.set(dateStr, entry);
            }
        });

        return data;
    }, [completedQuests, dungeonHistory]);

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        const cells = [];
        const paddingDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
        for (let i = 0; i < paddingDays; i++) {
            cells.push(<div key={`pad-start-${i}`} className="h-14"></div>);
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const dayActivity = activitiesByDate.get(dateStr);
            const xpGrade = getXpGrade(dayActivity?.totalXp || 0);
            const gradeStyles = difficultyStyles[xpGrade];
            const hasActivity = !!dayActivity;
            
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

            cells.push(
                <div key={day} className="flex items-center justify-center h-14">
                    <button 
                        onClick={() => { if(hasActivity) onUpgradePro(); }}
                        className={`w-12 h-12 flex items-center justify-center text-base font-bold rounded-full transition-all duration-200 border-2 ${gradeStyles.border} ${hasActivity ? 'bg-gray-800/60 hover:bg-gray-700/80 cursor-pointer' : 'bg-transparent text-gray-600 cursor-default'}`}
                        disabled={!hasActivity}
                    >
                        <span className={isToday ? 'text-sky-300' : gradeStyles.text}>{day}</span>
                    </button>
                </div>
            );
        }
        return cells;
    };
    
    const changeMonth = (delta: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };

    return (
        <div>
            <div className="flex items-center gap-2 mb-4 text-[10px] font-orbitron font-black text-yellow-500/70 uppercase tracking-widest bg-yellow-900/20 border border-yellow-500/20 rounded px-3 py-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <span>Tap a date to view details — <span className="text-yellow-300">Pro feature</span></span>
            </div>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="font-orbitron p-2 rounded-md hover:bg-gray-700">&lt;</button>
                <h2 className="font-orbitron text-2xl text-blue-300">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <button onClick={() => changeMonth(1)} className="font-orbitron p-2 rounded-md hover:bg-gray-700">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-gray-400 text-sm mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
        </div>
    );
};
