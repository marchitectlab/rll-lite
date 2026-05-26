
import React from 'react';
import { Inventory, ShopItem, Difficulty, Player } from '../types';
import { MATERIALS, ADVANCEMENT_TRAITS, ENHANCEMENT_REQUIREMENT } from '../constants';

interface WorkshopPageProps {
    inventory: Inventory;
    player: Player;
    onEnhance: (id: string) => void;
    onAdvance: (id: string) => void;
}

const getGradeStyles = (difficulty: Difficulty) => {
    switch (difficulty) {
        case Difficulty.E: return { text: 'text-gray-400', border: 'border-gray-500/30', bg: 'bg-gray-500/10', glow: '' };
        case Difficulty.D: return { text: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-500/10', glow: '' };
        case Difficulty.C: return { text: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10', glow: '' };
        case Difficulty.B: return { text: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10', glow: '' };
        case Difficulty.A: return { text: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10', glow: 'animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.3)]' };
        case Difficulty.S: return { text: 'text-yellow-400', border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', glow: 'animate-grade-s-glow' };
        case Difficulty.S_PLUS: return { text: 'text-red-500', border: 'border-red-600/60', bg: 'bg-red-900/20', glow: 'animate-grade-s-plus-glow' };
        case Difficulty.X: return { text: 'text-red-700', border: 'border-black', bg: 'bg-black/80', glow: 'animate-black-hole' };
        default: return { text: 'text-white', border: 'border-white/20', bg: 'bg-white/5', glow: '' };
    }
};

const getEnhancementReqs = (rank: Difficulty) => {
    switch (rank) {
        case Difficulty.B: return [{ mat: MATERIALS.COPPER, qty: 20 }, { mat: MATERIALS.IRON, qty: 15 }];
        case Difficulty.A: return [{ mat: MATERIALS.IRON, qty: 25 }, { mat: MATERIALS.FANG, qty: 3 }];
        case Difficulty.S: return [{ mat: MATERIALS.SHARD, qty: 3 }];
        case Difficulty.S_PLUS: return [{ mat: MATERIALS.BLOODSTONE, qty: 1 }, { mat: MATERIALS.IRON, qty: 5 }];
        case Difficulty.X: return [{ mat: MATERIALS.BLOODSTONE, qty: 2 }, { mat: MATERIALS.FANG, qty: 5 }];
        default: return [];
    }
};

const getAdvancementReqs = (rank: Difficulty) => {
    switch (rank) {
        case Difficulty.B: return { coins: 200 };
        case Difficulty.A: return { coins: 250 };
        case Difficulty.S: return { coins: 450, diamond: 8 };
        case Difficulty.S_PLUS: return { coins: 1000, diamond: 25 };
        case Difficulty.X: return { coins: 1500, diamond: 15 };
        default: return { coins: 0 };
    }
};

export const WorkshopPage: React.FC<WorkshopPageProps> = ({ inventory, onEnhance, onAdvance, player }) => {
    // Collect all gear from storage and active equipment
    const allGear = [
        ...inventory.storage,
        ...(Object.values(inventory.equipment).filter(i => i !== null) as ShopItem[])
    ];
    
    const enhanceable = allGear.filter(i => i.type === 'Gear' && [Difficulty.B, Difficulty.A, Difficulty.S, Difficulty.S_PLUS, Difficulty.X].includes(i.rank));
    const getMatCount = (id: string) => inventory.materials.find(m => m.id === id)?.count || 0;

    return (
        <div className="space-y-6 md:space-y-10">
            <div className="glass-panel p-4 md:p-8 rounded-lg border-blue-500/30">
                <h2 className="font-orbitron text-xl md:text-2xl text-blue-400 mb-6 md:mb-8 neon-text uppercase font-black tracking-[0.2em] md:tracking-widest">ENHANCEMENT LAB</h2>
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                    {enhanceable.map(item => {
                        const styles = getGradeStyles(item.rank);
                        const curStar = item.stars || 0;
                        const maxStars = item.rank === Difficulty.B ? 2 : item.rank === Difficulty.A ? 3 : 5;
                        const isMax = curStar >= maxStars;
                        const enhancementLevel = item.enhancementLevel || 0;
                        const requirement = ENHANCEMENT_REQUIREMENT[item.rank] || 10;
                        const isReadyForAdvance = enhancementLevel >= requirement;

                        const enhanceReqs = getEnhancementReqs(item.rank);
                        const advanceReqs = getAdvancementReqs(item.rank);
                        
                        // Fix for line 75: explicitly typing the result of Object.values to avoid 'unknown' inference
                        const isEquipped = (Object.values(inventory.equipment) as (ShopItem | null)[]).some(e => e?.id === item.id);

                        return (
                            <div key={item.id} className={`bg-black/60 border rounded p-4 md:p-6 flex flex-col justify-between items-stretch gap-4 md:gap-6 transition-all ${styles.border} ${styles.glow}`}>
                                <div className="flex-grow min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-2 md:mb-3">
                                        <span className={`font-orbitron text-xs md:text-sm font-black ${styles.text}`}>[{item.rank}]</span>
                                        <h3 className="font-orbitron text-base md:text-lg font-black text-white uppercase tracking-wider truncate flex-grow sm:flex-grow-0">{item.name}</h3>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <span className="text-blue-500 font-black text-[9px] md:text-[10px] uppercase tracking-widest border border-blue-500/30 px-2 md:px-3 py-1 bg-blue-500/5 rounded-sm">Enhancement Lvl {enhancementLevel}/{requirement}</span>
                                            {isEquipped && <span className="text-green-500 font-black text-[7px] md:text-[8px] uppercase tracking-[0.2em] px-2 py-0.5 border border-green-500/30 bg-green-500/5 rounded-full whitespace-nowrap">Equipped</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-1 mb-3 md:mb-4">
                                        {[...Array(maxStars)].map((_, i) => (
                                            <span key={i} className={`text-base md:text-lg transition-colors duration-500 ${i < curStar ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'text-gray-800'}`}>★</span>
                                        ))}
                                    </div>
                                    
                                    <div className="mb-3 md:mb-4 bg-slate-900/40 border border-white/5 p-2 md:p-3 rounded-sm">
                                        {!isReadyForAdvance ? (
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[7px] md:text-[8px] text-blue-400/60 uppercase font-black tracking-widest mb-1">Enhancement Requirements:</p>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                                    {enhanceReqs.map(r => {
                                                        const count = getMatCount(r.mat);
                                                        const isMet = count >= r.qty;
                                                        return (
                                                            <div key={r.mat} className="flex items-center gap-1.5 md:gap-2">
                                                                <span className={`text-[9px] md:text-[10px] font-bold ${isMet ? 'text-green-400' : 'text-red-400'}`}>{count}/{r.qty}</span>
                                                                <span className="text-[8px] md:text-[9px] text-gray-500 uppercase font-black">{r.mat.replace('mat_', '').toUpperCase()}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : !isMax ? (
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[7px] md:text-[8px] text-yellow-500/60 uppercase font-black tracking-widest mb-1">Advancement Requirements:</p>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                                    <div className="flex items-center gap-1.5 md:gap-2">
                                                        <span className={`text-[9px] md:text-[10px] font-bold ${player.shopCoins >= advanceReqs.coins ? 'text-green-400' : 'text-red-400'}`}>{player.shopCoins}/{advanceReqs.coins}</span>
                                                        <span className="text-[8px] md:text-[9px] text-gray-500 uppercase font-black">COINS</span>
                                                    </div>
                                                    {advanceReqs.diamond && (
                                                        <div className="flex items-center gap-1.5 md:gap-2">
                                                            <span className={`text-[9px] md:text-[10px] font-bold ${getMatCount(MATERIALS.DIAMOND) >= (advanceReqs.diamond || 0) ? 'text-green-400' : 'text-red-400'}`}>{getMatCount(MATERIALS.DIAMOND)}/{advanceReqs.diamond}</span>
                                                            <span className="text-[8px] md:text-[9px] text-gray-500 uppercase font-black">DIAMOND</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-[9px] md:text-[10px] text-green-400/80 font-black uppercase tracking-widest italic">Ultimate Synchronization Reached</p>
                                        )}
                                    </div>

                                    <div className="text-[8px] md:text-[9px] text-gray-500 uppercase font-black tracking-[0.1em] md:tracking-[0.2em] flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <span className="text-blue-400/60">Bonus Yields:</span> 
                                        {item.unlockedTraits && item.unlockedTraits.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {item.unlockedTraits.map((t, idx) => (
                                                    <span key={idx} className="bg-blue-900/30 border border-blue-500/20 px-1.5 md:px-2 py-0.5 rounded-sm text-blue-300">+{t} XP</span>
                                                ))}
                                            </div>
                                        ) : <span className="italic text-gray-700">No special traits detected</span>}
                                    </div>
                                </div>

                                <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
                                    {isMax ? (
                                        <div className="w-full bg-green-900/20 border border-green-500/50 px-4 md:px-8 py-2 md:py-3 rounded-sm flex items-center justify-center">
                                            <span className="text-green-400 font-orbitron text-[9px] md:text-[10px] font-black uppercase tracking-[0.22em] md:tracking-[0.3em] neon-text">MAX POTENTIAL</span>
                                        </div>
                                    ) : (
                                        <>
                                            {!isReadyForAdvance ? (
                                                <button onClick={() => onEnhance(item.id)} className="w-full font-orbitron bg-blue-700 hover:bg-blue-500 text-white px-4 md:px-8 py-2 md:py-3 rounded-sm text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border border-blue-400/30">Enhance</button>
                                            ) : (
                                                <button onClick={() => onAdvance(item.id)} className="w-full font-orbitron bg-yellow-600 hover:bg-yellow-500 text-white px-4 md:px-8 py-2 md:py-3 rounded-sm text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border border-yellow-400/30 shadow-[0_0_15px_rgba(234,179,8,0.3)]">Advance Star</button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {enhanceable.length === 0 && (
                        <div className="text-center py-16 md:py-20 bg-black/20 border border-white/5 rounded-sm">
                            <p className="font-orbitron text-gray-700 text-xs md:text-sm uppercase font-black tracking-[0.3em] px-4">No enhanceable gear detected.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-panel p-4 md:p-8 rounded-lg border-blue-500/30 pb-24 md:pb-8">
                <h2 className="font-orbitron text-lg md:text-xl text-blue-400 mb-6 md:mb-8 uppercase font-black tracking-[0.2em]">RESOURCE STORAGE</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                    {Object.entries(MATERIALS).map(([key, id]) => (
                        <div key={id} className="bg-gray-900/60 p-3 md:p-5 rounded-sm border border-white/5 text-center group hover:border-blue-500/40 transition-colors">
                            <p className="text-[7px] md:text-[9px] text-gray-500 font-black mb-1 md:mb-2 uppercase tracking-widest transition-colors group-hover:text-blue-400 truncate px-1">{key.replace('_', ' ')}</p>
                            <p className="font-orbitron text-2xl md:text-3xl font-black text-blue-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.3)]">{getMatCount(id)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
