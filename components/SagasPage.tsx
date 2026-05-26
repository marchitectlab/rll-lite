
import React from 'react';
import type { ActiveSaga, Saga } from '../types';
import { SAGAS } from '../constants';
import { Difficulty } from '../types';

const difficultyStyles: Record<Difficulty, { bg: string; text: string; border: string; glowClass?: string }> = {
  [Difficulty.E]: { bg: 'bg-gray-700/50', text: 'text-gray-300', border: 'border-gray-500' },
  [Difficulty.D]: { bg: 'bg-green-800/40', text: 'text-green-300', border: 'border-green-600' },
  [Difficulty.C]: { bg: 'bg-orange-800/40', text: 'text-orange-300', border: 'border-orange-600' },
  [Difficulty.B]: { bg: 'bg-indigo-800/40', text: 'text-indigo-300', border: 'border-indigo-600' },
  [Difficulty.A]: { bg: 'bg-purple-800/40', text: 'text-purple-300', border: 'border-transparent', glowClass: 'animate-grade-a-glow' },
  [Difficulty.S]: { bg: 'bg-yellow-800/40', text: 'text-yellow-300', border: 'border-transparent', glowClass: 'animate-grade-s-glow' },
  [Difficulty.S_PLUS]: { bg: 'bg-red-900/50', text: 'text-red-400', border: 'border-transparent', glowClass: 'animate-grade-s-plus-glow' },
  [Difficulty.X]: { bg: 'bg-black/80', text: 'text-red-400', border: 'border-transparent', glowClass: 'animate-black-hole' },
};

interface ActiveSagaDisplayProps { activeSaga: ActiveSaga; }
const ActiveSagaDisplay: React.FC<ActiveSagaDisplayProps> = ({ activeSaga }) => {
    const saga = SAGAS.find(s => s.id === activeSaga.sagaId);
    if (!saga) return null;
    
    const styles = difficultyStyles[saga.grade];
    const daysRemaining = Math.max(0, Math.ceil((saga.endDate - Date.now()) / (1000 * 60 * 60 * 24)));

    return (
        <div className={`relative p-6 mb-8 rounded-lg border ${styles.bg} ${styles.border} ${styles.glowClass}`}>
            <div className="flex flex-col md:flex-row justify-between items-start">
                <div>
                    <h3 className={`font-orbitron text-3xl font-bold ${styles.text}`}>[{saga.grade}] {saga.name}</h3>
                    <p className="text-gray-400 text-sm mt-1 max-w-2xl">{saga.description}</p>
                </div>
                <div className="text-center md:text-right mt-4 md:mt-0 md:ml-4 flex-shrink-0">
                     <p className="font-orbitron text-5xl text-white">{daysRemaining}</p>
                     <p className="text-lg text-gray-300">Days Remaining</p>
                </div>
            </div>
            <div className="mt-4 pt-3 border-t border-red-500/30">
                 <p className="font-orbitron text-sm text-red-300 uppercase tracking-wider">Discipline Failures</p>
                 <div className="flex items-center gap-4 mt-2">
                    {[...Array(saga.maxDisciplineFailures)].map((_, i) => (
                        <div key={i} className={`h-4 w-1/3 rounded-full ${i < activeSaga.disciplineFailures ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-gray-600'}`}></div>
                    ))}
                 </div>
            </div>
        </div>
    );
};


interface SagasPageProps {
    activeSaga: ActiveSaga | null;
    completedSagas: Record<string, 'cleared' | 'failed'>;
}

const SagasPage: React.FC<SagasPageProps> = ({ activeSaga, completedSagas }) => {
    const otherSagas = SAGAS.filter(s => s.id !== activeSaga?.sagaId);

    return (
        <div className="bg-gray-800/50 backdrop-blur-md border border-blue-500/50 p-6 rounded-lg shadow-2xl shadow-blue-500/10">
            {activeSaga ? (
                <ActiveSagaDisplay activeSaga={activeSaga} />
            ) : (
                <div className="text-center p-8 mb-8 border border-gray-700 rounded-lg">
                    <h2 className="font-orbitron text-2xl text-gray-400">No Active Sagas</h2>
                    <p className="text-gray-500 mt-2">Your legend awaits its next chapter.</p>
                </div>
            )}

            {otherSagas.length > 0 && (
                <div>
                    <h3 className="font-orbitron text-xl text-blue-300 mb-4 border-b border-blue-500/30 pb-2">Saga Archive</h3>
                    <div className="space-y-3">
                        {otherSagas.map(saga => {
                            const status = completedSagas[saga.id];
                            if (!status) return null; // Or render as 'upcoming' if needed
                            
                            const styles = status === 'cleared' 
                                ? { bg: 'bg-green-900/40', text: 'text-green-300', border: 'border-green-700/60' }
                                : { bg: 'bg-red-900/40', text: 'text-red-300', border: 'border-red-700/60' };

                            return (
                                <div key={saga.id} className={`flex items-center justify-between p-4 rounded-lg border-l-4 opacity-70 ${styles.bg} ${styles.border}`}>
                                    <div>
                                        <p className="font-bold text-gray-300">[{saga.grade}] {saga.name}</p>
                                        <p className="text-xs text-gray-400">{saga.description}</p>
                                    </div>
                                    <p className={`font-orbitron text-lg font-bold uppercase ${styles.text}`}>{status}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SagasPage;