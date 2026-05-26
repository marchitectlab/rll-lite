
import { useState, useEffect, useCallback, useRef } from 'react';
import { Player, Quest, Difficulty, PlayerDataState, CompletedQuest, Skill, Attribute, SkillPrerequisite, SkillFolder, SkillCategory, ActiveDungeonState, DungeonCooldown, DungeonHistoryEntry, Inventory, Achievement, ShopItem, EquipmentSlot, PlayerDataEvent, WeeklyPlan, DayOfWeek, PlannerItem, MaterialItem, SystemNotification } from '../types';
import { Rank, Difficulty as DifficultyEnum } from '../types';
import { XP_PER_DIFFICULTY, getXpToNextLevel, getRankForLevel, TRAINING_PER_HALF_STAR, SKILL_UNLOCK_REQUIREMENTS, XP_FOR_SKILL_UNLOCK, STAT_POINTS_PER_DIFFICULTY, DUNGEONS, SYSTEM_QUESTS, XP_FOR_SKILL_ASCENSION, QUEST_COIN_REWARDS, ACHIEVEMENTS_DATA, MATERIALS, ADVANCEMENT_TRAITS, X_RANK_PENALTY_OVERRIDE, DAILY_XP_GOAL, ENHANCEMENT_REQUIREMENT, getLevelRequirement } from '../constants';

const DATA_VERSION = 11;
const Berserker_GEAR_IDS = ['armor_berserker'];

const getScalingXpBonus = (itemId: string, sourceRank: Difficulty): number => {
    if (itemId.includes('_rogue')) {
        if ([DifficultyEnum.E, DifficultyEnum.D].includes(sourceRank)) return 0;
        return 1;
    }
    if (itemId.includes('_iron')) {
        if ([DifficultyEnum.E, DifficultyEnum.D].includes(sourceRank)) return 0;
        return 2;
    }
    if (itemId.includes('_shadow')) {
        if ([DifficultyEnum.E, DifficultyEnum.D].includes(sourceRank)) return 0;
        if ([DifficultyEnum.C].includes(sourceRank)) return 2;
        if ([DifficultyEnum.B].includes(sourceRank)) return 3;
        return 5;
    }
    if (itemId.includes('_light')) {
        switch (sourceRank) {
            case DifficultyEnum.E:
            case DifficultyEnum.D: return 0;
            case DifficultyEnum.C: return 3;
            case DifficultyEnum.B: return 5;
            case DifficultyEnum.A: return 8;
            case DifficultyEnum.S: return 12;
            case DifficultyEnum.S_PLUS: return 25;
            default: return 0;
        }
    }
    if (itemId === 'gear_dragon_slayer') {
        switch (sourceRank) {
            case DifficultyEnum.E: return 1;
            case DifficultyEnum.D: return 2;
            case DifficultyEnum.C: return 3;
            case DifficultyEnum.B: return 5;
            case DifficultyEnum.A: return 15;
            case DifficultyEnum.S: return 30;
            case DifficultyEnum.S_PLUS: return 50;
            default: return 0;
        }
    }
    if (Berserker_GEAR_IDS.includes(itemId)) {
        switch (sourceRank) {
            case DifficultyEnum.E: return 2;
            case DifficultyEnum.D: return 3;
            case DifficultyEnum.C: return 5;
            case DifficultyEnum.B: return 10;
            case DifficultyEnum.A: return 25;
            case DifficultyEnum.S: return 50;
            case DifficultyEnum.S_PLUS: return 100;
            default: return 0;
        }
    }
    return 0;
};

const DEFAULT_STATE: PlayerDataState = {
    dataVersion: DATA_VERSION,
    player: { name: 'Hunter', level: 1, xp: 0, rank: Rank.E, attributes: { [Attribute.Intellect]: 1, [Attribute.Strength]: 1, [Attribute.Agility]: 1, [Attribute.Endurance]: 1, [Attribute.Perception]: 1 }, shopCoins: 0, unlockedTitles: [], equippedTitle: null },
    quests: [...SYSTEM_QUESTS], completedQuests: [], skills: [], skillFolders: [], categories: [], activeDungeon: null, dungeonCooldowns: {}, dungeonHistory: [], achievements: { ...ACHIEVEMENTS_DATA },
    inventory: { equipment: { helmet: null, armor: null, gloves: null, boots: null, gear: null }, storage: [], materials: [] },
    weeklyPlan: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] },
    events: [],
    notifications: []
};

const getInitialState = (): PlayerDataState => {
    try {
        const saved = localStorage.getItem('playerData');
        if (saved) {
            const parsed = JSON.parse(saved);
            const sanitizedInventory: Inventory = {
                equipment: { ...DEFAULT_STATE.inventory.equipment, ...(parsed.inventory?.equipment || {}) },
                storage: Array.isArray(parsed.inventory?.storage) ? parsed.inventory.storage : [],
                materials: Array.isArray(parsed.inventory?.materials) ? parsed.inventory.materials : []
            };

            // Migrate old cooldowns if they exist
            const dungeonCooldowns: Record<string, DungeonCooldown> = {};
            if (parsed.dungeonCooldowns) {
                Object.entries(parsed.dungeonCooldowns).forEach(([id, cd]: [string, any]) => {
                    if (cd.readyAt) {
                        dungeonCooldowns[id] = cd;
                    } else if (cd.date) {
                        // Migrate old date-based cooldown to yesterday to "expire" it safely
                        dungeonCooldowns[id] = { readyAt: 0, status: cd.status };
                    }
                });
            }

            return { 
                ...DEFAULT_STATE, 
                ...parsed, 
                skills: Array.isArray(parsed.skills) ? parsed.skills.map((s: any) => ({ ...s, originalGrade: s.originalGrade || s.grade })) : [],
                quests: Array.isArray(parsed.quests) ? parsed.quests : DEFAULT_STATE.quests,
                inventory: sanitizedInventory, 
                dungeonCooldowns,
                achievements: { ...ACHIEVEMENTS_DATA, ...(parsed.achievements || {}) }, 
                dataVersion: DATA_VERSION, 
                notifications: [] 
            };
        }
    } catch (e) { console.error("Critical: Failed to restore system state.", e); }
    return DEFAULT_STATE;
};

export const usePlayerData = () => {
    const [state, setState] = useState<PlayerDataState>(getInitialState);

    useEffect(() => {
        localStorage.setItem('playerData', JSON.stringify({ ...state, events: [], notifications: [] }));
    }, [state]);

    const addNotification = useCallback((title: string, message: string, type: SystemNotification['type'] = 'info') => {
        const id = `notif-${Date.now()}-${Math.random()}`;
        
        setState(s => ({
            ...s,
            notifications: [...s.notifications, { id, title, message, type }]
        }));

        // Reduce duration to 2.5s for snappier experience
        setTimeout(() => {
            setState(s => ({
                ...s,
                notifications: s.notifications.filter(n => n.id !== id)
            }));
        }, 2500);

        if (type === 'danger') {
            const flash = document.createElement('div');
            flash.className = 'fixed inset-0 bg-red-900/40 pointer-events-none z-[400] animate-[pulse_0.4s_ease-out_forwards]';
            document.body.appendChild(flash);
            setTimeout(() => flash.remove(), 400);
        }
    }, []);

    const addEvent = useCallback((event: PlayerDataEvent) => setState(s => ({ ...s, events: [...s.events, event] })), []);
    const clearEvents = useCallback(() => setState(s => ({ ...s, events: [] })), []);

    const checkAchievements = useCallback((type: Achievement['type'], meta?: any, amount: number = 1) => {
        setState(prevState => {
            const achievements = { ...prevState.achievements };
            let stateChanged = false;
            let totalCoinBonus = 0;
            Object.keys(achievements).forEach(key => {
                const originalAch = achievements[key];
                if (originalAch.isUnlocked || originalAch.type !== type) return;
                if (originalAch.meta) {
                    if (originalAch.type === 'COMPLETE_QUEST' && originalAch.meta.difficulty && originalAch.meta.difficulty !== meta?.difficulty) return;
                    if (originalAch.type === 'CLEAR_DUNGEON' && originalAch.meta.grade && originalAch.meta.grade !== meta?.grade) return;
                    if (originalAch.type === 'OWN_GEAR' && originalAch.meta.grade && originalAch.meta.grade !== meta?.grade) return;
                }
                let newProgress = originalAch.progress;
                if (originalAch.type === 'OWN_GEAR') newProgress = meta?.count ?? originalAch.progress;
                else if (originalAch.type === 'REACH_LEVEL') newProgress = Math.max(originalAch.progress, meta?.level ?? 0);
                else newProgress += amount;

                if (newProgress !== originalAch.progress) {
                    stateChanged = true;
                    const updatedAch = { ...originalAch, progress: newProgress };
                    if (updatedAch.progress >= updatedAch.goal) {
                        updatedAch.progress = updatedAch.goal;
                        updatedAch.isUnlocked = true;
                        updatedAch.unlockDate = Date.now();
                        totalCoinBonus += updatedAch.rewardCoins;
                        // Trigger achievement unlock immediately (Milestone Group)
                        setTimeout(() => addNotification('ACHIEVEMENT UNLOCKED', `${updatedAch.name} accomplished!`, 'achievement'), 0);
                    }
                    achievements[key] = updatedAch;
                }
            });
            if (!stateChanged) return prevState;
            return { ...prevState, achievements, player: { ...prevState.player, shopCoins: prevState.player.shopCoins + totalCoinBonus } };
        });
    }, [addNotification]);

    const processingQuests = useRef<Set<string>>(new Set());

    const gainXp = useCallback((amount: number, source: string, manualRank?: Difficulty) => {
        let levelUpOccurred = false;
        let rankChangeOccurred: 'promotion' | 'demotion' | null = null;
        let finalXpAmount = 0;
        let newLevelValue = 0;
        let newRankValue: Rank | null = null;

        setState(prevState => {
            const sourceRank = manualRank || (Array.isArray(prevState.quests) ? prevState.quests.find(q => q.name === source)?.difficulty : undefined) || DUNGEONS.find(d => `Cleared ${d.name}` === source || `Failed ${d.name}` === source)?.grade;
            let totalBonus = 0;
            const equipped = Object.values(prevState.inventory.equipment).filter(Boolean) as ShopItem[];
            if (sourceRank && amount > 0) {
                equipped.forEach(item => {
                    totalBonus += getScalingXpBonus(item.id, sourceRank);
                    if (item.unlockedTraits && item.unlockedTraits.length > 0 && [DifficultyEnum.B, DifficultyEnum.A, DifficultyEnum.S, DifficultyEnum.S_PLUS, DifficultyEnum.X].includes(sourceRank)) {
                        totalBonus += item.unlockedTraits.reduce((a, b) => a + b, 0);
                    }
                });
            }
            let finalAmount = amount + (amount > 0 ? totalBonus : 0);
            const shadowItemCount = equipped.filter(i => Berserker_GEAR_IDS.includes(i.id)).length;
            
            if (sourceRank === DifficultyEnum.X && shadowItemCount > 0 && amount < 0) {
                finalAmount = -X_RANK_PENALTY_OVERRIDE;
            }

            finalXpAmount = finalAmount;
            let newXp = (prevState.player?.xp || 0) + finalAmount;
            let newLevel = prevState.player?.level || 1;
            const oldRank = prevState.player?.rank || Rank.E;

            while (newXp >= getXpToNextLevel(newLevel)) {
                newXp -= getXpToNextLevel(newLevel);
                newLevel++;
                levelUpOccurred = true;
            }
            while (newXp < 0 && newLevel > 1) {
                newLevel--;
                newXp += getXpToNextLevel(newLevel);
            }
            if (newLevel === 1 && newXp < 0) newXp = 0;
            const newRank = getRankForLevel(newLevel);
            newLevelValue = newLevel;
            newRankValue = newRank;

            if (newLevel > prevState.player.level) levelUpOccurred = true;
            if (newRank !== oldRank) {
                rankChangeOccurred = newLevel > prevState.player.level ? 'promotion' : 'demotion';
            }
            
            return { 
                ...prevState, 
                player: { ...prevState.player, xp: Math.max(0, newXp), level: newLevel, rank: newRank }, 
                events: [...prevState.events, { type: 'xp_gain', amount: finalAmount, source }] 
            };
        });

        // Trigger notifications outside of setState to avoid potential issues with batching/renders
        setTimeout(() => {
            if (finalXpAmount !== 0) {
                addNotification(
                    finalXpAmount > 0 ? 'XP ACQUIRED' : 'SYSTEM PENALTY', 
                    `${finalXpAmount > 0 ? '+' : ''}${Math.round(finalXpAmount)} XP from ${source}`, 
                    finalXpAmount > 0 ? 'info' : 'danger'
                );
            }
            if (levelUpOccurred) {
                addNotification('LEVEL UP', `You have reached Level ${newLevelValue}!`, 'level_up');
                checkAchievements('REACH_LEVEL', { level: newLevelValue }, 0);
            }
            if (rankChangeOccurred === 'promotion') {
                addNotification('RANK PROMOTION', `System has updated your ranking to [${newRankValue}].`, 'achievement');
            } else if (rankChangeOccurred === 'demotion') {
                addNotification('RANK DEMOTION', `System has updated your ranking to [${newRankValue}].`, 'danger');
            }
        }, 100);
    }, [addNotification, checkAchievements]);

    useEffect(() => {
        const checkDailyPenalties = () => {
            const todayStr = new Date().toISOString().split('T')[0];
            const lookbackDays = 14;
            const penaltyAmountBase = 250;

            setState(currentState => {
                let currentXp = currentState.player.xp;
                let currentLevel = currentState.player.level;
                let newCompletedQuests = [...currentState.completedQuests];
                let penaltyDates: string[] = [];
                let changesMade = false;
                
                for (let i = 1; i <= lookbackDays; i++) {
                    const checkDate = new Date();
                    checkDate.setDate(checkDate.getDate() - i);
                    const checkDateStr = checkDate.toISOString().split('T')[0];
                    
                    const dailyXp = currentState.completedQuests
                        .filter(q => q.completedAt.startsWith(checkDateStr) && !q.isSystemQuest)
                        .reduce((sum, q) => sum + (XP_PER_DIFFICULTY[q.difficulty] || 0), 0) +
                        currentState.dungeonHistory
                        .filter(d => new Date(d.completedAt).toISOString().split('T')[0] === checkDateStr && d.status === 'cleared')
                        .reduce((sum, d) => sum + (DUNGEONS.find(dd => dd.id === d.id)?.rewards?.xp || 0), 0);

                    const alreadyPenalized = currentState.completedQuests.some(q => q.id === 'sys_x_01' && q.completedAt.startsWith(checkDateStr));
                    
                    if (dailyXp < DAILY_XP_GOAL && !alreadyPenalized) {
                        const slothQuest = SYSTEM_QUESTS.find(q => q.id === 'sys_x_01') || currentState.quests.find(q => q.id === 'sys_x_01');
                        if (slothQuest) {
                            changesMade = true;
                            penaltyDates.push(checkDateStr);
                            const penaltyRecord: CompletedQuest = { ...slothQuest, completedAt: `${checkDateStr}T23:59:59Z`, completionId: `penalty-${checkDateStr}-${Date.now()}` };
                            newCompletedQuests.push(penaltyRecord);
                            
                            let amount = - (slothQuest.failurePenalty?.xp || penaltyAmountBase);
                            const equipped = Object.values(currentState.inventory.equipment).filter(Boolean) as ShopItem[];
                            const shadowItemCount = equipped.filter(i => Berserker_GEAR_IDS.includes(i.id)).length;
                            
                            if (shadowItemCount > 0) {
                                // Cap the penalty for Berserker gear to a specific override, but don't double it again here
                                amount = -Math.max(Math.abs(amount), X_RANK_PENALTY_OVERRIDE);
                            }
                            currentXp += amount;
                        }
                    }
                }

                if (!changesMade) return currentState;

                // Level down logic for penalty
                while (currentXp < 0 && currentLevel > 1) {
                    currentLevel--;
                    currentXp += getXpToNextLevel(currentLevel);
                }
                if (currentLevel === 1 && currentXp < 0) currentXp = 0;

                setTimeout(() => {
                    penaltyDates.forEach(d => addNotification('SLOTH PENALTY', `Discipline failure detected on ${d}.`, 'danger'));
                }, 100);

                return { 
                    ...currentState, 
                    completedQuests: newCompletedQuests, 
                    player: { ...currentState.player, xp: currentXp, level: currentLevel, rank: getRankForLevel(currentLevel) } 
                };
            });
        };
        const timeout = setTimeout(checkDailyPenalties, 1500); 
        return () => clearTimeout(timeout);
    }, [addNotification, state.completedQuests.length]);

    const checkOwnershipAchievements = useCallback((inventory: Inventory) => {
        const allGear = [...inventory.storage, ...Object.values(inventory.equipment)].filter(i => i && i.type === 'Gear') as ShopItem[];
        [DifficultyEnum.S, DifficultyEnum.S_PLUS, DifficultyEnum.X].forEach(grade => {
            const count = allGear.filter(g => g.rank === grade).length;
            if (count > 0) checkAchievements('OWN_GEAR', { grade, count }, 0);
        });
    }, [checkAchievements]);

    const completeQuest = useCallback((id: string) => {
        if (processingQuests.current.has(id)) return;
        
        const q = state.quests.find(x => x.id === id);
        if (!q) return;

        processingQuests.current.add(id);

        const completionRecord: CompletedQuest = { 
            ...q, 
            completedAt: new Date().toISOString(), 
            completionId: `c-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
        };
        const statPoints = STAT_POINTS_PER_DIFFICULTY[q.difficulty] || 0;
        
        // NEW DROP LOGIC
        const drops: Record<string, number> = {};
        const coins = QUEST_COIN_REWARDS[q.difficulty] || 0;
        const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

        if (q.difficulty === DifficultyEnum.B) {
            if (Math.random() < 0.05) drops[Math.random() > 0.5 ? MATERIALS.COPPER : MATERIALS.IRON] = rand(1, 3);
        } else if (q.difficulty === DifficultyEnum.A) {
            if (Math.random() < 0.10) drops[Math.random() > 0.5 ? MATERIALS.COPPER : MATERIALS.IRON] = rand(1, 5);
            if (Math.random() < 0.07) {
                drops[MATERIALS.ALUMINIUM] = rand(1, 3);
                drops[MATERIALS.FANG] = rand(1, 3);
            }
        } else if (q.difficulty === DifficultyEnum.S) {
            if (Math.random() < 0.30) {
                drops[MATERIALS.COPPER] = rand(5, 15);
                drops[MATERIALS.IRON] = rand(5, 15);
            }
            if (Math.random() < 0.20) {
                drops[MATERIALS.ALUMINIUM] = rand(2, 8);
                drops[MATERIALS.FANG] = rand(2, 8);
            }
            if (Math.random() < 0.05) {
                drops[MATERIALS.DIAMOND] = rand(3, 5);
                drops[MATERIALS.SHARD] = rand(3, 5);
            }
            if (Math.random() < 0.01) drops[MATERIALS.BLOODSTONE] = rand(1, 2);
        } else if (q.difficulty === DifficultyEnum.S_PLUS) {
            if (Math.random() < 0.80) {
                drops[MATERIALS.COPPER] = rand(20, 30);
                drops[MATERIALS.IRON] = rand(20, 30);
            }
            if (Math.random() < 0.50) {
                drops[MATERIALS.ALUMINIUM] = rand(5, 15);
                drops[MATERIALS.FANG] = rand(5, 15);
            }
            if (Math.random() < 0.30) {
                drops[MATERIALS.DIAMOND] = rand(3, 10);
                drops[MATERIALS.SHARD] = rand(3, 10);
            }
            drops[MATERIALS.BLOODSTONE] = rand(1, 3); // 100% chance
        }

        const dropSummary = Object.entries(drops)
            .filter(([_, count]) => count > 0)
            .map(([mid, count]) => `${mid.replace('mat_', '').replace('_', ' ').toUpperCase()} x${count}`)
            .join(', ');

        setState(prevState => {
            const newAttributes = { ...prevState.player.attributes };
            if (q.attributes && q.attributes.length > 0 && statPoints > 0) {
                q.attributes.forEach((attr) => {
                    newAttributes[attr] = (newAttributes[attr] || 0) + statPoints;
                });
            }

            const newInventoryMaterials = [...prevState.inventory.materials];
            Object.entries(drops).forEach(([mid, count]) => {
                if (count <= 0) return;
                const idx = newInventoryMaterials.findIndex(m => m.id === mid);
                if (idx > -1) newInventoryMaterials[idx] = { ...newInventoryMaterials[idx], count: newInventoryMaterials[idx].count + count };
                else newInventoryMaterials.push({ id: mid, name: mid.replace('mat_', '').replace('_', ' ').toUpperCase(), count, rank: q.difficulty });
            });
            
            return { 
                ...prevState, 
                quests: q.type === 'one-time' ? prevState.quests.filter(quest => quest.id !== id) : prevState.quests, 
                completedQuests: [completionRecord, ...prevState.completedQuests], 
                player: { 
                    ...prevState.player, 
                    shopCoins: prevState.player.shopCoins + coins, 
                    attributes: newAttributes 
                },
                inventory: { ...prevState.inventory, materials: newInventoryMaterials }
            };
        });

        // Trigger side-effects outside of setState
        if (q.attributes && q.attributes.length > 0 && statPoints > 0) {
            q.attributes.forEach((attr) => {
                addNotification('STAT INCREASE', `${attr.toUpperCase()} +${statPoints}`, 'success');
            });
        }
        gainXp(XP_PER_DIFFICULTY[q.difficulty] || 0, q.name, q.difficulty);
        checkAchievements('COMPLETE_QUEST', { difficulty: q.difficulty });
        addNotification('QUEST CLEAR', `Mission Accomplished: ${q.name}.`, 'success');
        if (coins > 0) {
            addNotification('REWARD GRANTED', `Received ${coins} Shop Coins.`, 'info');
        }
        if (dropSummary) {
            addNotification('LOOT ACQUIRED', dropSummary, 'success');
        }
        // Release the lock
        setTimeout(() => processingQuests.current.delete(id), 500);
    }, [state.quests, addNotification, gainXp, checkAchievements]);


    const startDungeon = useCallback((id: string) => {
        const dungeon = DUNGEONS.find(d => d.id === id);
        if (dungeon) {
            setState(s => ({ ...s, activeDungeon: { id: `d-${Date.now()}`, dungeonId: id, startedAt: Date.now(), currentFloorIndex: 0, currentTaskIndex: 0, taskStatus: {} } }));
            addNotification('GATE ENTERED', `Incursion initiated: ${dungeon.name}.`, 'info');
        }
    }, [addNotification]);

    const progressDungeon = useCallback(() => {
        setState(prevState => {
            if (!prevState.activeDungeon) return prevState;
            const dungeon = DUNGEONS.find(d => d.id === prevState.activeDungeon!.dungeonId);
            if (!dungeon) return prevState;
            const currentFloor = dungeon.floors[prevState.activeDungeon.currentFloorIndex];
            const currentTask = currentFloor.tasks[prevState.activeDungeon.currentTaskIndex];
            const isLastTask = prevState.activeDungeon.currentTaskIndex >= currentFloor.tasks.length - 1;
            const newAttributes = { ...prevState.player.attributes };
            if (currentTask?.attribute) {
                const points = Math.max(1, Math.floor(STAT_POINTS_PER_DIFFICULTY[dungeon.grade] / 3));
                newAttributes[currentTask.attribute] = (newAttributes[currentTask.attribute] || 0) + points;
                setTimeout(() => addNotification('STAT INCREASE', `${currentTask.attribute?.toUpperCase()} +${points}`, 'success'), 0);
            }
            if (isLastTask) {
                if (prevState.activeDungeon.currentFloorIndex >= dungeon.floors.length - 1) return { ...prevState, player: { ...prevState.player, attributes: newAttributes }, activeDungeon: { ...prevState.activeDungeon, currentTaskIndex: currentFloor.tasks.length } };
                setTimeout(() => addNotification('FLOOR CLEARED', `Moving to floor ${prevState.activeDungeon!.currentFloorIndex + 2}...`, 'info'), 0);
                return { ...prevState, player: { ...prevState.player, attributes: newAttributes }, activeDungeon: { ...prevState.activeDungeon, currentFloorIndex: prevState.activeDungeon.currentFloorIndex + 1, currentTaskIndex: 0 } };
            }
            return { ...prevState, player: { ...prevState.player, attributes: newAttributes }, activeDungeon: { ...prevState.activeDungeon, currentTaskIndex: prevState.activeDungeon.currentTaskIndex + 1 } };
        });
    }, [addNotification]);

    const clearActiveDungeon = useCallback(() => {
        const activeDungeon = state.activeDungeon;
        if (!activeDungeon) return;
        
        const dungeon = DUNGEONS.find(d => d.id === activeDungeon.dungeonId);
        if (!dungeon) return;

        let coins = 0;
        const drops: Record<string, number> = {};
        const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
        
        if (dungeon.grade === DifficultyEnum.E) coins = rand(3, 8);
        else if (dungeon.grade === DifficultyEnum.D) coins = rand(5, 15);
        else if (dungeon.grade === DifficultyEnum.C) { coins = rand(10, 25); drops[MATERIALS.COPPER] = rand(1, 2); drops[MATERIALS.IRON] = rand(1, 2); }
        else if (dungeon.grade === DifficultyEnum.B) { coins = rand(15, 40); drops[MATERIALS.COPPER] = rand(5, 8); drops[MATERIALS.IRON] = rand(5, 8); drops[MATERIALS.ALUMINIUM] = rand(2, 3); drops[MATERIALS.FANG] = Math.random() > 0.5 ? 1 : 0; }
        else if (dungeon.grade === DifficultyEnum.A) { coins = rand(50, 100); drops[MATERIALS.COPPER] = rand(5, 10); drops[MATERIALS.IRON] = rand(5, 10); drops[MATERIALS.ALUMINIUM] = rand(5, 8); drops[MATERIALS.FANG] = rand(1, 5); if (Math.random() > 0.7) drops[MATERIALS.DIAMOND] = rand(1, 5); if (Math.random() > 0.9) drops[MATERIALS.SHARD] = rand(1, 2); }
        else { coins = dungeon.grade === DifficultyEnum.S ? rand(200, 500) : rand(300, 750); drops[MATERIALS.COPPER] = rand(35, 80); drops[MATERIALS.IRON] = rand(35, 80); drops[MATERIALS.ALUMINIUM] = rand(30, 60); drops[MATERIALS.FANG] = rand(25, 55); drops[MATERIALS.DIAMOND] = rand(10, 25); drops[MATERIALS.SHARD] = rand(2, 5); drops[MATERIALS.BLOODSTONE] = rand(0, 3); }

        const dropSummary = Object.entries(drops)
            .filter(([_, count]) => count > 0)
            .map(([id, count]) => `${id.replace('mat_', '').replace('_', ' ').toUpperCase()} x${count}`)
            .join(', ');

        setState(prevState => {
            const newInventoryMaterials = [...prevState.inventory.materials];
            Object.entries(drops).forEach(([id, count]) => {
                if (count <= 0) return;
                const idx = newInventoryMaterials.findIndex(m => m.id === id);
                if (idx > -1) newInventoryMaterials[idx] = { ...newInventoryMaterials[idx], count: newInventoryMaterials[idx].count + count };
                else newInventoryMaterials.push({ id, name: id.replace('mat_', '').replace('_', ' ').toUpperCase(), count, rank: dungeon.grade });
            });

            return { 
                ...prevState, 
                activeDungeon: null, 
                player: { ...prevState.player, shopCoins: prevState.player.shopCoins + coins }, 
                dungeonHistory: [{ id: dungeon.id, name: dungeon.name, grade: dungeon.grade, completedAt: Date.now(), status: 'cleared' }, ...prevState.dungeonHistory], 
                dungeonCooldowns: { ...prevState.dungeonCooldowns, [dungeon.id]: { readyAt: Date.now() + (7 * 24 * 60 * 60 * 1000), status: 'cleared' } }, 
                inventory: { ...prevState.inventory, materials: newInventoryMaterials } 
            };
        });

        // Trigger Reward Group notifications outside of setState
        gainXp(dungeon.rewards?.xp || 0, `Cleared ${dungeon.name}`, dungeon.grade);
        checkAchievements('CLEAR_DUNGEON', { grade: dungeon.grade });
        addNotification('DUNGEON CLEAR', `${dungeon.name} extraction complete.`, 'info');
        if (dropSummary) addNotification('LOOT ACQUIRED', dropSummary, 'success');
    }, [state.activeDungeon, addNotification, gainXp, checkAchievements]);

    const failActiveDungeon = useCallback(() => {
        const activeDungeon = state.activeDungeon;
        if (!activeDungeon) return;
        const dungeon = DUNGEONS.find(d => d.id === activeDungeon.dungeonId);
        if (!dungeon) return;
        
        const penaltyAmount = dungeon.failurePenalty?.xp || 0;

        setState(prevState => ({ 
            ...prevState, 
            activeDungeon: null, 
            dungeonHistory: [{ id: dungeon.id, name: dungeon.name, grade: dungeon.grade, completedAt: Date.now(), status: 'failed' }, ...prevState.dungeonHistory], 
            dungeonCooldowns: { ...prevState.dungeonCooldowns, [dungeon.id]: { readyAt: Date.now() + (7 * 24 * 60 * 60 * 1000), status: 'failed' } } 
        }));

        if (penaltyAmount > 0) {
            gainXp(-penaltyAmount, `Failed ${dungeon.name}`, dungeon.grade);
            addNotification('MISSION FAILED', `Penalty applied for ${dungeon.name}.`, 'danger');
        } else {
            addNotification('MISSION FAILED', `Operation aborted: ${dungeon.name}.`, 'danger');
        }
    }, [state.activeDungeon, gainXp, addNotification]);

    const buyItem = useCallback((item: ShopItem) => {
        setState(s => {
            const reqLevel = getLevelRequirement(item.rank);
            if (s.player.level < reqLevel) {
                addNotification('ACCESS DENIED', `Minimum Level ${reqLevel} required for ${item.rank} rank gear.`, 'danger');
                return s;
            }

            if (s.player.shopCoins >= item.cost) {
                const newInventory = { ...s.inventory, storage: [...s.inventory.storage, item] };
                const newState = { ...s, player: { ...s.player, shopCoins: s.player.shopCoins - item.cost }, inventory: newInventory };
                
                setTimeout(() => { 
                    addNotification('SYSTEM EXCHANGE', `${item.name} acquired.`, 'info'); 
                    checkOwnershipAchievements(newInventory); 
                }, 0);
                
                return newState;
            }
            addNotification('INSUFFICIENT COINS', 'Access denied.', 'danger');
            return s;
        });
    }, [addNotification, checkOwnershipAchievements]);

    const enhanceGear = useCallback((gearId: string) => {
        setState(prevState => {
            let gear: ShopItem | null = null;
            let location: string | null = null;
            let storageIdx = -1;

            // Find gear in storage
            storageIdx = prevState.inventory.storage.findIndex(i => i.id === gearId);
            if (storageIdx !== -1) {
                gear = { ...prevState.inventory.storage[storageIdx] };
                location = 'storage';
            } else {
                // Find gear in equipment
                for (const slot in prevState.inventory.equipment) {
                    const equipSlot = slot as EquipmentSlot;
                    if (prevState.inventory.equipment[equipSlot]?.id === gearId) {
                        gear = { ...prevState.inventory.equipment[equipSlot]! };
                        location = equipSlot;
                        break;
                    }
                }
            }

            if (!gear) return prevState;
            const requirement = ENHANCEMENT_REQUIREMENT[gear.rank] || 10;
            if ((gear.enhancementLevel || 0) >= requirement) return prevState;

            const reqs: any = { 
                [DifficultyEnum.B]: [{ mat: MATERIALS.COPPER, qty: 20 }, { mat: MATERIALS.IRON, qty: 15 }], 
                [DifficultyEnum.A]: [{ mat: MATERIALS.IRON, qty: 25 }, { mat: MATERIALS.FANG, qty: 3 }], 
                [DifficultyEnum.S]: [{ mat: MATERIALS.SHARD, qty: 3 }], 
                [DifficultyEnum.S_PLUS]: [{ mat: MATERIALS.BLOODSTONE, qty: 1 }, { mat: MATERIALS.IRON, qty: 5 }], 
                [DifficultyEnum.X]: [{ mat: MATERIALS.BLOODSTONE, qty: 2 }, { mat: MATERIALS.FANG, qty: 5 }] 
            };
            
            const mats = reqs[gear.rank] || [];
            if (!mats.every((r: any) => (prevState.inventory.materials.find(m => m.id === r.mat)?.count || 0) >= r.qty)) { 
                setTimeout(() => addNotification('MATERIALS MISSING', 'Gather more resources.', 'danger'), 0);
                return prevState; 
            }

            gear.enhancementLevel = (gear.enhancementLevel || 0) + 1;
            const updatedGear = gear;

            // Immutable update of materials
            const newMaterials = prevState.inventory.materials.map(m => {
                const req = mats.find((r: any) => r.mat === m.id);
                return req ? { ...m, count: m.count - req.qty } : m;
            });

            // Immutable update of storage/equipment
            const newStorage = location === 'storage' 
                ? prevState.inventory.storage.map((item, idx) => idx === storageIdx ? updatedGear : item)
                : [...prevState.inventory.storage];

            const newEquipment = location !== 'storage' && location !== null
                ? { ...prevState.inventory.equipment, [location]: updatedGear }
                : { ...prevState.inventory.equipment };

            setTimeout(() => {
                addNotification('ENHANCEMENT SUCCESS', `${updatedGear.name} upgraded to +${updatedGear.enhancementLevel}.`, 'info');
            }, 0);

            return { 
                ...prevState, 
                inventory: { 
                    ...prevState.inventory, 
                    materials: newMaterials,
                    storage: newStorage,
                    equipment: newEquipment as Inventory['equipment']
                } 
            };
        });
    }, [addNotification]);

    const advanceGear = useCallback((gearId: string) => {
        setState(prevState => {
            let gear: ShopItem | null = null;
            let location: string | null = null;
            let storageIdx = -1;

            storageIdx = prevState.inventory.storage.findIndex(i => i.id === gearId);
            if (storageIdx !== -1) {
                gear = { ...prevState.inventory.storage[storageIdx] };
                location = 'storage';
            } else {
                for (const slot in prevState.inventory.equipment) {
                    const equipSlot = slot as EquipmentSlot;
                    if (prevState.inventory.equipment[equipSlot]?.id === gearId) {
                        gear = { ...prevState.inventory.equipment[equipSlot]! };
                        location = equipSlot;
                        break;
                    }
                }
            }

            if (!gear) return prevState;
            const requirement = ENHANCEMENT_REQUIREMENT[gear.rank] || 10;
            if ((gear.enhancementLevel || 0) < requirement) return prevState;

            const costs: any = { 
                [DifficultyEnum.B]: { coins: 200 }, 
                [DifficultyEnum.A]: { coins: 250 }, 
                [DifficultyEnum.S]: { coins: 450, diamond: 8 }, 
                [DifficultyEnum.S_PLUS]: { coins: 1000, diamond: 25 }, 
                [DifficultyEnum.X]: { coins: 1500, diamond: 15 } 
            };
            const cost = costs[gear.rank];

            if (prevState.player.shopCoins < cost.coins || (cost.diamond && (prevState.inventory.materials.find(m => m.id === MATERIALS.DIAMOND)?.count || 0) < cost.diamond)) { 
                setTimeout(() => addNotification('ADVANCEMENT FAILED', 'Requirements not met.', 'danger'), 0);
                return prevState; 
            }

            const currentStar = gear.stars || 0;
            const maxStars = gear.rank === DifficultyEnum.B ? 2 : gear.rank === DifficultyEnum.A ? 3 : 5;
            if (currentStar >= maxStars) return prevState;

            gear.stars = currentStar + 1;
            gear.enhancementLevel = 0;
            gear.unlockedTraits = [...(gear.unlockedTraits || []), ADVANCEMENT_TRAITS[gear.rank][currentStar]];
            const updatedGear = gear;

            const newMaterials = prevState.inventory.materials.map(m => 
                (cost.diamond && m.id === MATERIALS.DIAMOND) ? { ...m, count: m.count - cost.diamond! } : m
            );

            const newStorage = location === 'storage' 
                ? prevState.inventory.storage.map((item, idx) => idx === storageIdx ? updatedGear : item)
                : [...prevState.inventory.storage];

            const newEquipment = location !== 'storage' && location !== null
                ? { ...prevState.inventory.equipment, [location]: updatedGear }
                : { ...prevState.inventory.equipment };

            setTimeout(() => {
                addNotification('GEAR ASCENSION', `${updatedGear.name} advanced to ${updatedGear.stars} Star!`, 'achievement');
                checkAchievements('ADVANCE_GEAR');
            }, 0);

            return { 
                ...prevState, 
                player: { ...prevState.player, shopCoins: prevState.player.shopCoins - cost.coins }, 
                inventory: { 
                    ...prevState.inventory, 
                    materials: newMaterials,
                    storage: newStorage,
                    equipment: newEquipment as Inventory['equipment']
                } 
            };
        });
    }, [addNotification, checkAchievements]);


    const addSkill = useCallback((name: string, grade: Difficulty, stars: number, status: 'locked' | 'unlocked', category: string, description: string, guide: string, prerequisites: SkillPrerequisite[], folderId?: string) => {
        const isHighTier = [DifficultyEnum.S, DifficultyEnum.S_PLUS, DifficultyEnum.X].includes(grade);
        setState(s => ({
            ...s,
            skills: [...s.skills, {
                id: `sk-${Date.now()}`,
                name, grade, originalGrade: grade, stars, status, category, description, guide, prerequisites, folderId,
                starProgress: 0, unlockProgress: 0,
                masteryLevel: isHighTier ? 1 : 0,
                dailyTraining: { date: new Date().toISOString().split('T')[0], count: 0 }
            }]
        }));
        addNotification('SKILL LOGGED', `Ability initialized: ${name}`, 'info');
    }, [addNotification]);

    const improveSkill = useCallback((skillId: string) => {
        const skill = state.skills.find(s => s.id === skillId);
        if (!skill) return;

        const isHighTier = [DifficultyEnum.S, DifficultyEnum.S_PLUS, DifficultyEnum.X].includes(skill.originalGrade);
        const today = new Date().toISOString().split('T')[0];
        
        if (skill.dailyTraining?.date === today && skill.dailyTraining.count >= 5) {
            addNotification('CAPACITY REACHED', `Maximum daily training limit (5/5) reached for ${skill.name}.`, 'warning');
            return;
        }

        setState(prevState => {
            const skillIdx = prevState.skills.findIndex(s => s.id === skillId);
            if (skillIdx === -1) return prevState;
            const skills = [...prevState.skills];
            const currentSkill = { ...skills[skillIdx] };

            if (!currentSkill.dailyTraining || currentSkill.dailyTraining.date !== today) {
                currentSkill.dailyTraining = { date: today, count: 0 };
            }

            let unlockedNow = false;
            let starGained = false;
            let masteryAscended = false;
            let rankPromoted = false;
            let nextRank: Difficulty | null = null;
            let peakMastery = false;
            let peakMasterySRank = false;

            if (currentSkill.status === 'locked') {
                const req = SKILL_UNLOCK_REQUIREMENTS[currentSkill.grade];
                currentSkill.unlockProgress += 1;
                if (currentSkill.unlockProgress >= req) {
                    currentSkill.status = 'unlocked'; 
                    currentSkill.unlockProgress = 0;
                    unlockedNow = true;
                }
            } else {
                const req = TRAINING_PER_HALF_STAR[currentSkill.grade];
                currentSkill.starProgress += 1;
                if (currentSkill.starProgress >= req) {
                    currentSkill.starProgress = 0; 
                    currentSkill.stars += 0.5;
                    starGained = true;
                    if (currentSkill.stars >= 5) {
                        if (isHighTier) {
                            if ((currentSkill.masteryLevel || 0) < 4) {
                                currentSkill.masteryLevel = (currentSkill.masteryLevel || 0) + 1; 
                                currentSkill.stars = 0;
                                masteryAscended = true;
                            } else if (currentSkill.grade === DifficultyEnum.S) {
                                currentSkill.grade = DifficultyEnum.S_PLUS; 
                                currentSkill.stars = 0; 
                                currentSkill.masteryLevel = 0;
                                rankPromoted = true;
                                nextRank = DifficultyEnum.S_PLUS;
                            } else {
                                peakMastery = true;
                            }
                        } else {
                            const nextGradeMap: any = { [DifficultyEnum.E]: DifficultyEnum.D, [DifficultyEnum.D]: DifficultyEnum.C, [DifficultyEnum.C]: DifficultyEnum.B, [DifficultyEnum.B]: DifficultyEnum.A, [DifficultyEnum.A]: DifficultyEnum.S };
                            const next = nextGradeMap[currentSkill.grade];
                            if (next) {
                                currentSkill.grade = next; 
                                currentSkill.stars = 0; 
                                currentSkill.masteryLevel = 0;
                                rankPromoted = true;
                                nextRank = next;
                            } else {
                                peakMasterySRank = true;
                            }
                        }
                    }
                }
            }
            
            // Increment daily count
            currentSkill.dailyTraining.count += 1;
            skills[skillIdx] = currentSkill;

            // Trigger side effects outside of setState logic (in a timeout to run after current execution)
            setTimeout(() => {
                if (unlockedNow) {
                    addNotification('SKILL UNLOCKED', `Ability synchronized: ${currentSkill.name}`, 'info'); 
                    gainXp(XP_FOR_SKILL_UNLOCK[currentSkill.grade], `Unlocking ${currentSkill.name}`); 
                } else if (!unlockedNow && currentSkill.status === 'locked') {
                    const req = SKILL_UNLOCK_REQUIREMENTS[currentSkill.grade];
                    addNotification('TRAINING LOGGED', `Unlock progress: ${currentSkill.unlockProgress}/${req}`, 'info');
                }

                if (starGained) checkAchievements('TRAIN_SKILL');

                if (masteryAscended) {
                    addNotification('SKILL ASCENSION', `${currentSkill.name} Tier Up!`, 'achievement'); 
                    gainXp((XP_FOR_SKILL_ASCENSION[currentSkill.grade] || 10) * 5, `Ascending ${currentSkill.name}`); 
                }

                if (rankPromoted && nextRank) {
                    addNotification('RANK PROMOTION', `${currentSkill.name} promoted to ${nextRank}!`, 'level_up'); 
                    gainXp(XP_FOR_SKILL_UNLOCK[nextRank] || 100, `Promoting ${currentSkill.name}`); 
                    checkAchievements('ADVANCE_SKILL'); 
                }

                if (peakMastery) addNotification('PEAK MASTERY', `${currentSkill.name} maxed.`, 'achievement');
                if (peakMasterySRank) addNotification('PEAK MASTERY', `${currentSkill.name} maxed at S-Rank.`, 'achievement');
                
                if (!unlockedNow && !starGained && currentSkill.status === 'unlocked') {
                    const req = TRAINING_PER_HALF_STAR[currentSkill.grade];
                    addNotification('TRAINING LOGGED', `${currentSkill.name} progress: ${currentSkill.starProgress}/${req}`, 'info');
                }
            }, 0);

            return { ...prevState, skills };
        });
    }, [state.skills, addNotification, gainXp, checkAchievements]);

    const toggleTaskListTask = useCallback((day: DayOfWeek, id: string) => {
        setState(s => ({
            ...s,
            weeklyPlan: {
                ...s.weeklyPlan,
                [day]: s.weeklyPlan[day].map(t => t.id === id ? { ...t, completed: !t.completed } : t)
            }
        }));
    }, []);

    const addTaskListTask = useCallback((day: DayOfWeek, text: string) => {
        setState(s => ({
            ...s,
            weeklyPlan: {
                ...s.weeklyPlan,
                [day]: [...s.weeklyPlan[day], { id: `task-${Date.now()}`, text, completed: false }]
            }
        }));
    }, []);

    const deleteTaskListTask = useCallback((day: DayOfWeek, id: string) => {
        setState(s => ({
            ...s,
            weeklyPlan: {
                ...s.weeklyPlan,
                [day]: s.weeklyPlan[day].filter(t => t.id !== id)
            }
        }));
    }, []);

    const addQuest = useCallback((name: string, difficulty: Difficulty, type: 'repetitive' | 'one-time', attributes: Attribute[], description: string) => {
        setState(s => ({
            ...s,
            quests: [...s.quests, {
                id: `q-${Date.now()}`,
                name, difficulty, type, attributes, description
            }]
        }));
        addNotification('QUEST INITIALIZED', `New objective registered: ${name}`, 'info');
    }, [addNotification]);

    const deleteQuest = useCallback((id: string) => {
        setState(s => ({
            ...s,
            quests: s.quests.filter(q => q.id !== id)
        }));
    }, []);

    const failQuest = useCallback((id: string) => {
        if (processingQuests.current.has(id)) return;
        
        const q = state.quests.find(x => x.id === id);
        if (!q) return;

        processingQuests.current.add(id);
        const penaltyAmount = q.failurePenalty?.xp || (XP_PER_DIFFICULTY[q.difficulty] || 0) * 1.5;

        // Perform any state updates if needed (none currently for failQuest in this snippet)
        
        // Trigger side-effectsoutside of setState
        gainXp(-penaltyAmount, `Failing ${q.name}`, q.difficulty);
        addNotification('MISSION FAILED', `Penalty applied for ${q.name}.`, 'danger');
        
        setTimeout(() => processingQuests.current.delete(id), 500);
    }, [state.quests, addNotification, gainXp]);

    const exportState = useCallback(async () => {
        const fileName = `rll_backup_${new Date().toISOString().split('T')[0]}.json`;
        const fileContent = JSON.stringify(state, null, 2);
        const isNative = (window as any).Capacitor?.isNativePlatform();

        if (isNative) {
            try {
                const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
                const { Share } = await import('@capacitor/share');
                await Filesystem.writeFile({
                    path: fileName,
                    data: fileContent,
                    directory: Directory.Cache,
                    encoding: Encoding.UTF8,
                });
                const fileUri = await Filesystem.getUri({
                    directory: Directory.Cache,
                    path: fileName,
                });
                await Share.share({
                    title: 'Export Player Data',
                    text: 'Backup of your Leveling Progress',
                    url: fileUri.uri,
                    dialogTitle: 'Save your JSON file',
                });
                addNotification('SYSTEM BACKUP', 'State exported successfully.', 'info');
            } catch (e) {
                console.error('Error exporting on Android', e);
                addNotification('EXPORT FAILED', 'Could not export data.', 'danger');
            }
        } else {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(fileContent);
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", fileName);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            addNotification('SYSTEM BACKUP', 'State exported successfully.', 'info');
        }
    }, [state, addNotification]);

    const importState = useCallback((json: string) => {
        try {
            const parsed = JSON.parse(json);
            if (parsed.player) {
                const questsWithSystem = [...parsed.quests];
                if (!questsWithSystem.some(q => q.id === 'sys_x_01')) {
                    questsWithSystem.push(SYSTEM_QUESTS.find(q => q.id === 'sys_x_01')!);
                }
                setState({ ...parsed, quests: questsWithSystem, notifications: [], events: [] });
                addNotification('RESTORE SUCCESS', 'System state synchronized.', 'success');
            }
        } catch (e) {
            addNotification('RESTORE FAILED', 'Data corruption detected.', 'danger');
        }
    }, [addNotification]);

    return { 
        ...state, 
        gainXp, clearActiveDungeon, enhanceGear, advanceGear, toggleTaskListTask, addTaskListTask, deleteTaskListTask, addQuest, deleteQuest, failQuest, completeQuest, startDungeon, progressDungeon, failActiveDungeon, buyItem, 
        renamePlayer: (newName: string) => { if (newName.trim()) { setState(s => ({ ...s, player: { ...s.player, name: newName.trim() } })); addNotification('IDENTITY UPDATED', `Recognized as [${newName}].`, 'info'); } }, 
        equipItem: (item: ShopItem) => {
            setState(s => {
                const newStorage = s.inventory.storage.filter(i => i.id !== item.id);
                const equipment = { ...s.inventory.equipment };
                if (equipment[item.slot!]) {
                    newStorage.push(equipment[item.slot!]!);
                }
                equipment[item.slot!] = item;
                const newInventory = { ...s.inventory, equipment, storage: newStorage };
                
                setTimeout(() => {
                    addNotification('EQUIPMENT UPDATED', `${item.name} synced.`, 'info');
                    checkOwnershipAchievements(newInventory);
                }, 0);

                return { ...s, inventory: newInventory };
            });
        }, 
        unequipItem: (slot: EquipmentSlot) => {
            setState(s => {
                const item = s.inventory.equipment[slot];
                if (!item || Berserker_GEAR_IDS.includes(item.id)) return s;
                
                const newInventory = { 
                    ...s.inventory, 
                    equipment: { ...s.inventory.equipment, [slot]: null }, 
                    storage: [...s.inventory.storage, item] 
                };

                setTimeout(() => {
                    addNotification('EQUIPMENT REMOVED', `${item.name} desynced.`, 'info');
                    checkOwnershipAchievements(newInventory);
                }, 0);

                return { ...s, inventory: newInventory };
            });
        }, 
        breakGear: (slot: EquipmentSlot) => {
            setState(s => {
                const orbIdx = s.inventory.storage.findIndex(i => i.id === 'brilliant_light_orb');
                if (orbIdx === -1) {
                    addNotification('ACTION IMPOSSIBLE', 'Light Orb required.', 'danger');
                    return s;
                }
                const newInventory = { 
                    ...s.inventory, 
                    equipment: { ...s.inventory.equipment, [slot]: null }, 
                    storage: s.inventory.storage.filter((_, i) => i !== orbIdx) 
                };

                setTimeout(() => {
                    addNotification('CURSE BROKEN', 'Cursed gear destroyed.', 'info');
                    checkOwnershipAchievements(newInventory);
                }, 0);

                return { ...s, inventory: newInventory };
            });
        }, 
        clearEvents, addEvent, importState, exportState, addSkill, 
        deleteSkill: (id: string) => { setState(s => ({ ...s, skills: s.skills.filter(sk => sk.id !== id) })); addNotification('SKILL ERASED', 'Purged from database.', 'warning'); }, 
        addSkillFolder: (name: string, category: string, icon: string) => { setState(s => ({ ...s, skillFolders: [...s.skillFolders, { id: `sf-${Date.now()}`, name, category, icon }] })); addNotification('FOLDER INITIALIZED', `Organisation unit "${name}" established.`, 'info'); }, 
        deleteSkillFolder: (id: string) => { setState(s => ({ ...s, skillFolders: s.skillFolders.filter(f => f.id !== id) })); addNotification('FOLDER DELETED', 'Removed.', 'warning'); }, 
        addCategory: (name: string, icon: string) => { setState(s => ({ ...s, categories: [...s.categories, { name, icon }] })); addNotification('CATEGORY ESTABLISHED', `Classification "${name}" logged.`, 'info'); }, 
        deleteCategory: (name: string) => { setState(s => ({ ...s, categories: s.categories.filter(c => c.name !== name) })); addNotification('CATEGORY REMOVED', 'Purged.', 'warning'); }, 
        improveSkill 
    };
};
