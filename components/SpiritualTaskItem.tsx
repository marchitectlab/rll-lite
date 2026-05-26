import React from 'react';
import type { SpiritualTask } from '../types';

interface SpiritualTaskItemProps {
    task: SpiritualTask;
    onComplete: (task: SpiritualTask) => void;
    onAbandon?: (task: SpiritualTask) => void;
}

const DeenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

export const SpiritualTaskItem: React.FC<SpiritualTaskItemProps> = ({ task, onComplete, onAbandon }) => {
    
    return (
        <div className={'p-4 rounded-lg border transition-all duration-300 bg-gray-900/40 border-cyan-700/50 hover:bg-gray-800/50'}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="mb-3 sm:mb-0">
                    <h4 className="font-orbitron font-bold text-white text-lg">{task.name}</h4>
                    <div className="flex items-center gap-4 mt-1">
                        <p className="text-sm text-yellow-400">XP: +{task.reward.xp}</p>
                        <div className="flex items-center gap-1 font-orbitron text-sm text-cyan-300">
                            <DeenIcon />
                            <span>+{task.reward.deen}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                    {task.type === 'mandatory' && onAbandon && (
                         <button
                            onClick={() => onAbandon(task)}
                            className='font-orbitron w-full sm:w-24 text-center px-4 py-2 rounded-md uppercase text-xs font-bold tracking-wider transition-all duration-300 shadow-md bg-red-800/70 text-red-300 hover:bg-red-700/80'
                        >
                            Abandon
                        </button>
                    )}
                    <button
                        onClick={() => onComplete(task)}
                        className='font-orbitron w-full sm:w-24 text-center px-4 py-2 rounded-md uppercase text-xs font-bold tracking-wider transition-all duration-300 shadow-md bg-cyan-600 text-white enabled:hover:bg-cyan-500 enabled:hover:shadow-lg enabled:hover:shadow-cyan-500/50'
                    >
                        Complete
                    </button>
                </div>
            </div>
        </div>
    );
};