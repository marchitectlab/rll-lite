
import React, { useState, useMemo, useRef, useLayoutEffect, useEffect } from 'react';
import type { Skill } from '../types';
import { Difficulty } from '../types';
import { TRAINING_PER_HALF_STAR, SKILL_UNLOCK_REQUIREMENTS } from '../constants';

// --- ICONS ---
const LockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>);
const FullStarIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>);
const HalfStarIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 20 20"><path d="M10 0v15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0z"/></svg>);
const EmptyStarIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>);
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>);

// --- STYLES ---
const difficultyStyles: Record<Difficulty, { text: string; border: string; shadow: string; bg: string; glowClass?: string }> = {
  [Difficulty.E]: { text: 'text-gray-300', border: 'border-gray-500/50', shadow: 'hover:shadow-gray-500/20', bg: 'bg-gray-700/20' },
  [Difficulty.D]: { text: 'text-green-300', border: 'border-green-600/50', shadow: 'hover:shadow-green-500/20', bg: 'bg-green-800/10' },
  [Difficulty.C]: { text: 'text-orange-300', border: 'border-orange-600/50', shadow: 'hover:shadow-orange-500/20', bg: 'bg-orange-800/10' },
  [Difficulty.B]: { text: 'text-indigo-300', border: 'border-indigo-600/50', shadow: 'hover:shadow-indigo-500/20', bg: 'bg-indigo-800/10' },
  [Difficulty.A]: { text: 'text-purple-300', border: 'border-purple-600/50', shadow: 'hover:shadow-purple-500/20', bg: 'bg-purple-800/10' },
  [Difficulty.S]: { text: 'text-yellow-300', border: 'border-yellow-600/50', shadow: 'hover:shadow-yellow-500/20', bg: 'bg-yellow-800/10', glowClass: 'animate-grade-s-glow' },
  [Difficulty.S_PLUS]: { text: 'text-red-300', border: 'border-transparent', shadow: '', bg: 'bg-red-800/10', glowClass: 'animate-grade-s-plus-glow' },
  [Difficulty.X]: { text: 'text-red-400', border: 'border-transparent', shadow: '', bg: 'bg-black/60', glowClass: 'animate-black-hole' },
};

// --- HELPER COMPONENTS ---
const StarRating: React.FC<{ stars: number; masteryLevel: number; showMastery: boolean }> = ({ stars, masteryLevel, showMastery }) => {
  const fullStars = Math.floor(stars);
  const hasHalfStar = stars % 1 !== 0;
  
  const starColors = ['fill-white', 'fill-blue-400', 'fill-purple-400', 'fill-yellow-400', 'fill-red-500'];
  const glowClasses = ['', '', '', 'animate-gold-star-glow', 'animate-red-star-glow'];
  
  const starColor = showMastery ? (starColors[masteryLevel] || 'fill-white') : 'fill-white';
  const glowClass = showMastery ? (glowClasses[masteryLevel] || '') : '';

  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) { return <FullStarIcon key={i} className={`w-4 h-4 ${starColor} ${glowClass}`} />; }
        if (i === fullStars && hasHalfStar) { return <HalfStarIcon key={i} className={`w-4 h-4 ${starColor} ${glowClass}`} />; }
        return <EmptyStarIcon key={i} className="w-4 h-4 fill-gray-600" />;
      })}
    </div>
  );
};

// --- SKILL NODE ---
interface SkillNodeProps {
    skill: Skill;
    onImprove: (skillId: string) => void;
    onDelete: (skillId: string) => void;
    isPrereqsMet: boolean;
    prereqDetails: string;
}
const SkillNode: React.FC<SkillNodeProps> = ({ skill, onImprove, onDelete, isPrereqsMet, prereqDetails }) => {
    const styles = difficultyStyles[skill.grade];
    const masteryLevel = skill.masteryLevel || 0;
    const isHighTier = [Difficulty.S, Difficulty.S_PLUS, Difficulty.X].includes(skill.originalGrade);
    const today = new Date().toISOString().split('T')[0];
    const dailyCount = skill.dailyTraining?.date === today ? skill.dailyTraining.count : 0;
    const isDailyLimitReached = dailyCount >= 5;

    let isFullyMastered = false;
    let isReadyForAscension = false;
    let isReadyForPromotion = false;

    if (isHighTier) {
        isReadyForAscension = skill.stars === 5 && masteryLevel < 4;
        isReadyForPromotion = skill.stars === 5 && masteryLevel === 4 && skill.grade === Difficulty.S;
        isFullyMastered = skill.stars === 5 && ((masteryLevel === 4 && skill.grade === Difficulty.S_PLUS) || skill.grade === Difficulty.X);
    } else {
        isReadyForPromotion = skill.stars === 5 && skill.grade !== Difficulty.S;
        isFullyMastered = skill.stars === 5 && skill.grade === Difficulty.S;
    }

    const isDisabled = !isPrereqsMet || isFullyMastered || isDailyLimitReached;
    const nodeRef = useRef<HTMLDivElement>(null);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [pulseAnimationClass, setPulseAnimationClass] = useState('');
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) { isInitialMount.current = false; }
        else {
            setPulseAnimationClass('animate-train-pulse');
            const pulseTimer = setTimeout(() => { setPulseAnimationClass(''); }, 700);
            return () => clearTimeout(pulseTimer);
        }
    }, [skill.starProgress, skill.unlockProgress, skill.status, skill.grade, skill.masteryLevel]);

    const nodeClasses = () => {
        if (skill.grade === Difficulty.X) return 'animate-black-hole';
        if (skill.grade === Difficulty.S_PLUS) return 'animate-grade-s-plus-glow';
        if (skill.grade === Difficulty.S) return 'animate-grade-s-glow';
        if (isHighTier && masteryLevel === 3) return 'animate-mastered-glow glowing-border';
        return `${styles.border} ${styles.shadow}`;
    };

    if (skill.status === 'locked') {
        const unlockRequirement = SKILL_UNLOCK_REQUIREMENTS[skill.grade];
        const unlockPercentage = (skill.unlockProgress / unlockRequirement) * 100;
        return (
            <div ref={nodeRef} data-skill-id={skill.id} onMouseEnter={() => !isPrereqsMet && setTooltipVisible(true)} onMouseLeave={() => setTooltipVisible(false)} className={`glass-panel group relative p-3 rounded-lg border w-64 flex-shrink-0 ${styles.bg} ${styles.border} transition-all duration-300 ${styles.shadow} ${!isPrereqsMet ? 'opacity-40 grayscale-[0.5]' : ''} ${pulseAnimationClass}`}>
                <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
                    {!isPrereqsMet && <div className="text-gray-400"><InfoIcon/></div>}
                     <button onClick={(e) => { e.stopPropagation(); onDelete(skill.id); }} className="p-1 rounded-full bg-gray-900/50 text-gray-500 hover:bg-red-800/70 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                     </button>
                </div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center"><div className={`font-orbitron text-lg font-bold w-9 text-center mr-2 ${styles.text} drop-shadow-md`}>[{skill.grade}]</div><div><p className="font-bold text-gray-400 text-[13px] tracking-tight">{skill.name}</p></div></div>
                    <div className="flex items-center gap-1 text-gray-500"><LockIcon /><span className="font-orbitron text-[9px] font-bold">LOCKED</span></div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-full bg-black/40 rounded-sm h-3 border border-gray-600/30 flex-grow relative overflow-hidden">
                        <div className={`h-full transition-all duration-500 ease-out bg-gradient-to-r from-orange-700 to-red-600`} style={{ width: `${unlockPercentage}%` }}></div>
                        <div className="absolute inset-0 flex items-center justify-center"><span className="text-[9px] font-orbitron font-bold text-white z-10">{skill.unlockProgress}/{unlockRequirement}</span></div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <button onClick={() => onImprove(skill.id)} disabled={isDisabled} className="font-orbitron bg-gray-700/80 text-white px-2 py-1 rounded-sm text-[9px] font-bold tracking-widest transition-all duration-300 shadow-md enabled:hover:bg-gray-600 disabled:opacity-50 w-16 text-center border border-gray-500/30">
                            {isDailyLimitReached ? 'LIMIT' : 'UNLOCK'}
                        </button>
                        <span className="text-[7px] font-black text-gray-600 uppercase tracking-tighter">Daily: {dailyCount}/5</span>
                    </div>
                </div>
                 {tooltipVisible && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-black/90 text-white text-[10px] rounded p-2 z-30 whitespace-pre-wrap text-center border border-blue-500/30 backdrop-blur-sm">{prereqDetails}</div>}
            </div>
        );
    }

    const trainingRequirement = TRAINING_PER_HALF_STAR[skill.grade];
    const trainingPercentage = isReadyForAscension || isReadyForPromotion || isFullyMastered || !trainingRequirement ? 100 : (skill.starProgress / trainingRequirement) * 100;
    
    const getProgressBarClass = () => {
        if (isFullyMastered) return 'bg-gradient-to-r from-red-600 via-red-500 to-red-800';
        if (isReadyForPromotion) return 'bg-gradient-to-r from-red-600 via-red-500 to-orange-400 animate-pulse';
        if (isReadyForAscension) return 'bg-gradient-to-r from-purple-600 via-purple-400 to-indigo-700';
        if (!isHighTier) return 'bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400';

        switch (masteryLevel) {
          case 1: return 'bg-gradient-to-r from-cyan-600 via-blue-500 to-blue-700';
          case 2: return 'bg-gradient-to-r from-fuchsia-600 via-purple-500 to-purple-800';
          case 3: return 'bg-gradient-to-r from-yellow-500 via-yellow-300 to-amber-600';
          case 4: return 'bg-gradient-to-r from-rose-600 via-red-500 to-red-700';
          default: return 'bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400';
        }
    };

    return (
        <div ref={nodeRef} data-skill-id={skill.id} onMouseEnter={() => !isPrereqsMet && setTooltipVisible(true)} onMouseLeave={() => setTooltipVisible(false)} className={`glass-panel group relative p-3 rounded-lg border w-64 flex-shrink-0 ${styles.bg} transition-all duration-300 ${!isPrereqsMet ? 'opacity-40 grayscale-[0.3]' : ''} ${nodeClasses()} ${pulseAnimationClass}`}>
            <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
                {!isPrereqsMet && <div className="text-gray-400"><InfoIcon /></div>}
                <button onClick={(e) => { e.stopPropagation(); onDelete(skill.id); }} className="p-1 rounded-full bg-gray-900/40 text-gray-500 hover:bg-red-800/60 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                </button>
            </div>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start"><div className={`font-orbitron text-xl font-bold w-10 text-center mr-2 flex-shrink-0 ${styles.text} drop-shadow-md`}>[{skill.grade}]</div><div><p className="font-bold text-white text-[13px] tracking-tight neon-text">{skill.name}</p></div></div>
                <div className="pt-1"><StarRating stars={skill.stars} masteryLevel={masteryLevel} showMastery={isHighTier} /></div>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-full bg-black/50 rounded-sm h-3 border border-white/5 flex-grow relative overflow-hidden p-[1px]">
                  <div className={`h-full transition-all duration-500 ease-out ${getProgressBarClass()}`} style={{ width: `${trainingPercentage}%`, boxShadow: '0 0 5px rgba(255,255,255,0.1)' }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] font-orbitron font-black text-white/90 drop-shadow-sm tracking-tighter">
                        {isFullyMastered ? 'ULTIMATE' : isReadyForPromotion ? 'PROMOTE >>' : isReadyForAscension ? 'ASCEND >>' : `${skill.starProgress}/${trainingRequirement}`}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <button onClick={() => onImprove(skill.id)} disabled={isDisabled} className={`font-orbitron text-white px-2 py-1 rounded-sm text-[9px] font-bold tracking-widest transition-all duration-300 shadow-md focus:outline-none w-16 text-center border ${isFullyMastered ? 'bg-red-900 border-red-500 opacity-80 cursor-not-allowed' : (isReadyForPromotion || isReadyForAscension) ? 'bg-yellow-600 border-yellow-400' : 'bg-blue-600/80 border-blue-400/50'} enabled:hover:scale-105 disabled:bg-gray-800 disabled:opacity-50`}>
                        {isFullyMastered ? 'MAX' : isDailyLimitReached ? 'LIMIT' : isReadyForPromotion ? 'PROMOTE' : isReadyForAscension ? 'ASCEND' : 'TRAIN'}
                    </button>
                    <span className="text-[7px] font-black text-gray-600 uppercase tracking-tighter">Daily: {dailyCount}/5</span>
                </div>
            </div>
            {tooltipVisible && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-black/95 text-white text-[10px] rounded p-2 z-30 border border-blue-500/40 backdrop-blur-md">{prereqDetails}</div>}
        </div>
    );
};

// --- SKILL TREE ---
interface SkillTreeProps {
    skills: Skill[];
    onImprove: (skillId: string) => void;
    onDelete: (skillId: string) => void;
}
export const SkillTree: React.FC<SkillTreeProps> = ({ skills, onImprove, onDelete }) => {
    const treeContainerRef = useRef<HTMLDivElement>(null);
    const [lines, setLines] = useState<React.ReactNode[]>([]);

    const { tree, skillMap } = useMemo<{ tree: Skill[][]; skillMap: Map<string, Skill> }>(() => {
        const skillMap = new Map<string, Skill>(skills.map(s => [s.id, s]));
        const childrenMap = new Map<string, string[]>();
        const inDegree = new Map<string, number>();

        skills.forEach(skill => { inDegree.set(skill.id, skill.prerequisites?.length ?? 0); });
        
        skills.forEach(skill => {
            if (skill.prerequisites) {
                skill.prerequisites.forEach(prereq => {
                    const children = childrenMap.get(prereq.skillId) || [];
                    if (!children.includes(skill.id)) { children.push(skill.id); }
                    childrenMap.set(prereq.skillId, children);
                });
            }
        });

        const levels: Skill[][] = [];
        let queue: Skill[] = skills.filter(s => (inDegree.get(s.id) ?? 0) === 0);
        const processedSkills = new Set<string>();

        while (queue.length > 0) {
            levels.push(queue);
            const nextQueueMap = new Map<string, Skill>();
            for (const skill of queue) {
                processedSkills.add(skill.id);
                const childrenIds = childrenMap.get(skill.id) || [];
                for (const childId of childrenIds) {
                    const newInDegree = (inDegree.get(childId) || 1) - 1;
                    inDegree.set(childId, newInDegree);
                    if (newInDegree === 0) {
                        const childSkill = skillMap.get(childId);
                        if (childSkill) { nextQueueMap.set(childId, childSkill); }
                    }
                }
            }
            queue = Array.from(nextQueueMap.values());
        }

        const remainingSkills = skills.filter(s => !processedSkills.has(s.id));
        if (remainingSkills.length > 0) { levels.push(remainingSkills); }

        return { tree: levels, skillMap };
    }, [skills]);

    useLayoutEffect(() => {
        const calculateLines = () => {
            if (!treeContainerRef.current) return;
            const containerRect = treeContainerRef.current.getBoundingClientRect();
            const newLines: React.ReactNode[] = [];
            const nodeElements = Array.from(treeContainerRef.current.querySelectorAll('[data-skill-id]')) as HTMLDivElement[];
            const nodePositions = new Map<string, { x: number, y: number, width: number, height: number }>();
            nodeElements.forEach(node => {
                const rect = node.getBoundingClientRect();
                nodePositions.set(node.dataset.skillId!, { x: rect.left - containerRect.left, y: rect.top - containerRect.top, width: rect.width, height: rect.height });
            });

            skills.forEach(skill => {
                if (skill.prerequisites) {
                    const childPos = nodePositions.get(skill.id);
                    if (childPos) {
                        skill.prerequisites.forEach(prereq => {
                            const parentPos = nodePositions.get(prereq.skillId);
                            const parentSkill = skillMap.get(prereq.skillId);
                            if (parentPos && parentSkill) {
                                const parentTotalStars = (parentSkill.masteryLevel || 0) * 5 + parentSkill.stars;
                                const isMet = parentTotalStars >= prereq.requiredStars;
                                const x1 = parentPos.x + parentPos.width; const y1 = parentPos.y + parentPos.height / 2;
                                const x2 = childPos.x; const y2 = childPos.y + childPos.height / 2;
                                const path = `M${x1},${y1} C${x1 + 60},${y1} ${x2 - 60},${y2} ${x2},${y2}`;
                                newLines.push(<path key={`${skill.id}-${prereq.skillId}`} d={path} stroke={isMet ? '#60a5fa' : '#334155'} strokeWidth="2" fill="none" strokeDasharray={isMet ? 'none' : '4 4'} style={{ filter: isMet ? 'drop-shadow(0 0 5px rgba(56, 189, 248, 0.5))' : 'none' }} />);
                            }
                        });
                    }
                }
            });
            setLines(newLines);
        };
        calculateLines();
        window.addEventListener('resize', calculateLines);
        return () => window.removeEventListener('resize', calculateLines);
    }, [tree, skills, skillMap]);
    
    return (
        <div ref={treeContainerRef} className="relative flex items-start gap-x-32 gap-y-12 p-8 overflow-x-auto min-h-[60vh]">
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ minWidth: Math.max(1200, tree.length * 400) }}>{lines}</svg>
            {tree.map((level: Skill[], levelIndex: number) => (
                <div key={levelIndex} className="flex flex-col gap-10 z-10">
                    {level.map((skill) => {
                        const isPrereqsMet = skill.prerequisites?.every(p => {
                            const parentSkill = skillMap.get(p.skillId);
                            if (!parentSkill) return false;
                            const parentTotalStars = (parentSkill.masteryLevel || 0) * 5 + parentSkill.stars;
                            return parentTotalStars >= p.requiredStars;
                        }) ?? true;
                        const prereqDetails = skill.prerequisites?.map(p => `• Requires "${skillMap.get(p.skillId)?.name}" at ${p.requiredStars}★`).join('\n') || '';
                        return <SkillNode key={skill.id} skill={skill} onImprove={onImprove} onDelete={onDelete} isPrereqsMet={isPrereqsMet} prereqDetails={prereqDetails} />;
                    })}
                </div>
            ))}
        </div>
    );
};
