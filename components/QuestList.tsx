
import React, { useState, useMemo } from 'react';
import type { Quest, Attribute } from '../types';
import { Difficulty } from '../types';
import { QuestItem } from './QuestItem';
import { ATTRIBUTES } from '../constants';

interface QuestListProps {
  quests: Quest[];
  onComplete: (questId: string) => void;
  onDelete: (questId: string) => void;
  onFail: (questId: string) => void;
}

type SortKey = 'name' | 'difficulty';
type SortDirection = 'asc' | 'desc';

const difficultyOrder = Object.values(Difficulty);

const SortIcon = ({ direction }: { direction: SortDirection }) => (<svg className="h-4 w-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">{direction === 'asc' ? (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />) : (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />)}</svg>);

const filterButtonStyles: Record<Difficulty, { border: string; text: string; bgHover: string; activeBg: string }> = {
    [Difficulty.E]: { border: 'border-gray-500', text: 'text-gray-300', bgHover: 'hover:bg-gray-700/80', activeBg: 'bg-gray-700' },
    [Difficulty.D]: { border: 'border-green-600', text: 'text-green-300', bgHover: 'hover:bg-green-800/80', activeBg: 'bg-green-800' },
    [Difficulty.C]: { border: 'border-orange-600', text: 'text-orange-300', bgHover: 'hover:bg-orange-800/80', activeBg: 'bg-orange-800' },
    [Difficulty.B]: { border: 'border-indigo-600', text: 'text-indigo-300', bgHover: 'hover:bg-indigo-800/80', activeBg: 'bg-indigo-800' },
    [Difficulty.A]: { border: 'border-purple-600', text: 'text-purple-300', bgHover: 'hover:bg-purple-800/80', activeBg: 'bg-purple-800' },
    [Difficulty.S]: { border: 'border-yellow-600', text: 'text-yellow-300', bgHover: 'hover:bg-yellow-800/80', activeBg: 'bg-yellow-800' },
    [Difficulty.S_PLUS]: { border: 'border-red-600', text: 'text-red-300', bgHover: 'hover:bg-red-800/80', activeBg: 'bg-red-800' },
    [Difficulty.X]: { border: 'border-red-900', text: 'text-red-400', bgHover: 'hover:bg-black/80', activeBg: 'bg-black/50' },
};

export const QuestList: React.FC<QuestListProps> = ({ quests, onComplete, onDelete, onFail }) => {
  const [activeTab, setActiveTab] = useState<'system' | 'custom'>('system');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<Quest['type'] | 'all'>('all');
  const [attributeFilter, setAttributeFilter] = useState<Attribute | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'difficulty', direction: 'asc' });
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const { systemQuests, customQuests } = useMemo(() => {
    return quests.reduce(
        (acc: { systemQuests: Quest[]; customQuests: Quest[] }, quest) => {
            if (quest.isSystemQuest) acc.systemQuests.push(quest);
            else acc.customQuests.push(quest);
            return acc;
        }, { systemQuests: [], customQuests: [] }
    );
  }, [quests]);

  const sortedAndFilteredQuests = useMemo(() => {
    const questsForTab = activeTab === 'system' ? systemQuests : customQuests;
    const filtered = questsForTab.filter(quest => {
        const difficultyMatch = difficultyFilter === 'all' || quest.difficulty === difficultyFilter;
        const typeMatch = typeFilter === 'all' || quest.type === typeFilter;
        const attributeMatch = attributeFilter === 'all' || quest.attributes.includes(attributeFilter);
        return difficultyMatch && typeMatch && attributeMatch;
    });

    return [...filtered].sort((a, b) => {
        const { key, direction } = sortConfig;
        let comparison = 0;
        if (key === 'difficulty') {
            comparison = difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty);
        } else {
            comparison = a.name.localeCompare(b.name);
        }
        return direction === 'asc' ? comparison : -comparison;
    });
  }, [systemQuests, customQuests, activeTab, difficultyFilter, typeFilter, attributeFilter, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };
  
  const typeFilterOptions = ['all', 'repetitive', 'one-time'] as const;

  return (
    <>
      <div className="flex border-b border-blue-500/30 mb-4">
        <button
            onClick={() => setActiveTab('system')}
            className={`font-orbitron text-lg px-6 py-2 transition-colors duration-300 border-b-2 ${activeTab === 'system' ? 'text-blue-300 border-blue-400' : 'text-gray-500 border-transparent hover:text-white'}`}
        >
            System Quests
        </button>
        <button
            onClick={() => setActiveTab('custom')}
            className={`font-orbitron text-lg px-6 py-2 transition-colors duration-300 border-b-2 ${activeTab === 'custom' ? 'text-blue-300 border-blue-400' : 'text-gray-500 border-transparent hover:text-white'}`}
        >
            Custom Quests
        </button>
      </div>

      <div className="mb-6">
        <button 
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)} 
            className="flex items-center gap-2 text-[10px] font-black font-orbitron text-blue-500 uppercase tracking-[0.2em] mb-4 hover:text-blue-300 transition-colors"
        >
            <svg className={`w-4 h-4 transition-transform duration-300 ${isFiltersExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            {isFiltersExpanded ? 'Close Protocols' : 'Filter & Sort Protocols'}
        </button>

        {isFiltersExpanded && (
            <div className="flex flex-col gap-4 animate-fadeIn border-l-2 border-blue-500/20 pl-4 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mr-2">Difficulty Rank:</span>
                    {(['all', ...Object.values(Difficulty)] as const).map(option => {
                        const isActive = difficultyFilter === option;
                        if (option === 'all') return <button key={option} onClick={() => setDifficultyFilter('all')} className={`font-orbitron px-3 py-1 text-[10px] rounded-sm border transition-all ${isActive ? 'bg-blue-600 border-blue-400 text-white' : 'border-slate-800 text-gray-500 hover:border-blue-500/40'}`}>All</button>
                        const styles = filterButtonStyles[option];
                        return <button key={option} onClick={() => setDifficultyFilter(option)} className={`font-orbitron w-10 py-1 text-[10px] rounded-sm border transition-all ${isActive ? `${styles.activeBg} ${styles.border} ${styles.text}` : `bg-transparent border-slate-800 text-gray-500 ${styles.bgHover}`}`}>{option}</button>
                    })}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mr-2">Quest Type:</span>
                    {typeFilterOptions.map(option => {
                        const isActive = typeFilter === option;
                        return <button key={option} onClick={() => setTypeFilter(option as any)} className={`font-orbitron px-3 py-1 text-[10px] rounded-sm border transition-all capitalize ${isActive ? 'bg-blue-600 border-blue-400 text-white' : 'border-slate-800 text-gray-500 hover:border-blue-500/40'}`}>{option}</button>
                    })}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mr-2">Attribute Focus:</span>
                    {(['all', ...ATTRIBUTES] as const).map(option => {
                        const isActive = attributeFilter === option;
                        return <button key={option} onClick={() => setAttributeFilter(option)} className={`font-orbitron px-3 py-1 text-[10px] rounded-sm border transition-all capitalize ${isActive ? 'bg-blue-600 border-blue-400 text-white' : 'border-slate-800 text-gray-500 hover:border-blue-500/40'}`}>{option}</button>
                    })}
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mr-2">Ordering Logic:</span>
                    {(['difficulty', 'name'] as const).map(key => {
                        const isActive = sortConfig.key === key;
                        return <button key={key} onClick={() => handleSort(key)} className={`flex items-center font-orbitron px-3 py-1 text-[10px] rounded-sm border transition-all capitalize ${isActive ? 'bg-blue-600 border-blue-400 text-white' : 'border-slate-800 text-gray-500 hover:border-blue-500/40'}`}>{key}{isActive && <SortIcon direction={sortConfig.direction} />}</button>
                    })}
                </div>
            </div>
        )}
      </div>

      {(activeTab === 'custom' && customQuests.length === 0) ? (
        <p className="text-center text-gray-600 uppercase font-black tracking-[0.2em] py-20 bg-black/20 border border-white/5 rounded-sm">No custom objectives registered.</p>
      ) : sortedAndFilteredQuests.length === 0 ? (
        <p className="text-center text-gray-600 uppercase font-black tracking-[0.2em] py-20 bg-black/20 border border-white/5 rounded-sm">No objectives match the current criteria.</p>
      ) : (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {sortedAndFilteredQuests.map(quest => (
            <QuestItem key={quest.id} quest={quest} onComplete={onComplete} onDelete={!quest.isSystemQuest ? onDelete : undefined} onFail={onFail} />
          ))}
        </div>
      )}
    </>
  );
};
