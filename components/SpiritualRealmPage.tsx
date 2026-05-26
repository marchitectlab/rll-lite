import React from 'react';
import type { SpiritualRealmState, SpiritualTask } from '../types';
import { SpiritualTaskItem } from './SpiritualTaskItem';

interface SpiritualRealmPageProps {
    spiritualRealm: SpiritualRealmState;
    onCompleteTask: (task: SpiritualTask) => void;
    onAbandonTask: (task: SpiritualTask) => void;
}

const DeenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{filter: 'drop-shadow(0 0 8px #67e8f9)'}}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);


export const SpiritualRealmPage: React.FC<SpiritualRealmPageProps> = ({ spiritualRealm, onCompleteTask, onAbandonTask }) => {
    const mandatoryTasks = spiritualRealm.tasks.filter(t => t.type === 'mandatory');
    const obligatoryTasks = spiritualRealm.tasks.filter(t => t.type === 'obligatory');
    
    return (
        <div className="bg-gray-800/50 backdrop-blur-md border border-cyan-500/50 p-6 rounded-lg shadow-2xl shadow-cyan-500/10 min-h-[70vh] relative">
            <div className="spiritual-overlay" aria-hidden="true"></div>
            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-cyan-500/30">
                    <h2 className="font-orbitron text-2xl text-cyan-300 mb-2 sm:mb-0">Spiritual Realm</h2>
                    <div className="flex items-center gap-3 bg-gray-900/50 px-4 py-2 rounded-lg border border-gray-700">
                        <DeenIcon />
                        <span className="font-orbitron text-3xl text-white">{spiritualRealm.deen}</span>
                        <span className="text-gray-400 self-end pb-1">Deen</span>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="font-orbitron text-xl text-cyan-400 mb-4">Mandatory Tasks</h3>
                    <div className="space-y-3">
                        {mandatoryTasks.map(task => (
                            <SpiritualTaskItem key={task.id} task={task} onComplete={onCompleteTask} onAbandon={onAbandonTask} />
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-orbitron text-xl text-cyan-400 mb-4">Obligatory Tasks</h3>
                    <div className="space-y-3">
                        {obligatoryTasks.map(task => (
                            <SpiritualTaskItem key={task.id} task={task} onComplete={onCompleteTask} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};