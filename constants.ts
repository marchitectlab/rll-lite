
import { Difficulty, Rank, Attribute, Dungeon, Quest, ShopItem, Title, Achievement, Saga } from './types';

export const XP_PER_DIFFICULTY: Record<Difficulty, number> = {
  [Difficulty.E]: 7,
  [Difficulty.D]: 12,
  [Difficulty.C]: 20,
  [Difficulty.B]: 35,
  [Difficulty.A]: 55,
  [Difficulty.S]: 85,
  [Difficulty.S_PLUS]: 150,
  [Difficulty.X]: 0,
};

export const RANK_THRESHOLDS: { level: number; rank: Rank }[] = [
  { level: 1, rank: Rank.E },
  { level: 11, rank: Rank.D },
  { level: 26, rank: Rank.C },
  { level: 51, rank: Rank.B },
  { level: 76, rank: Rank.A },
  { level: 100, rank: Rank.S },
];

export const getRankForLevel = (level: number): Rank => {
  let currentRank = Rank.E;
  for (const threshold of RANK_THRESHOLDS) {
    if (level >= threshold.level) {
      currentRank = threshold.rank;
    }
  }
  return currentRank;
};

export const getXpToNextLevel = (level: number): number => {
    if (level < 1) return 100;
    const rank = getRankForLevel(level);
    const xpTable: Record<Rank, number> = {
        [Rank.E]: 100, [Rank.D]: 120, [Rank.C]: 150, [Rank.B]: 200, [Rank.A]: 500, [Rank.S]: 1000,
    };
    return xpTable[rank];
};

export const ATTRIBUTES: Attribute[] = [
  Attribute.Intellect,
  Attribute.Strength,
  Attribute.Agility,
  Attribute.Endurance,
  Attribute.Perception,
];

export const STAT_POINTS_PER_DIFFICULTY: Record<Difficulty, number> = {
  [Difficulty.E]: 1, [Difficulty.D]: 2, [Difficulty.C]: 3, [Difficulty.B]: 5, [Difficulty.A]: 8, [Difficulty.S]: 15, [Difficulty.S_PLUS]: 30, [Difficulty.X]: 0,
};

export const X_RANK_PENALTY_OVERRIDE = 1500; // Edit this to change the Sloth penalty

// --- WORKSHOP & MATERIALS ---
export const MATERIALS = {
    COPPER: 'mat_copper',
    IRON: 'mat_iron',
    ALUMINIUM: 'mat_aluminium',
    FANG: 'mat_beast_fang',
    RUBY: 'mat_ruby',
    SAPPHIRE: 'mat_sapphire',
    DIAMOND: 'mat_diamond',
    SHARD: 'mat_brilliant_shard',
    BLOODSTONE: 'mat_bloodstone'
};

export const ENHANCEMENT_REQUIREMENT: Record<Difficulty, number> = {
    [Difficulty.E]: 10,
    [Difficulty.D]: 10,
    [Difficulty.C]: 10,
    [Difficulty.B]: 3,
    [Difficulty.A]: 3,
    [Difficulty.S]: 5,
    [Difficulty.S_PLUS]: 10,
    [Difficulty.X]: 10,
};

export const ADVANCEMENT_TRAITS: Record<Difficulty, number[]> = {
    [Difficulty.B]: [1, 1],
    [Difficulty.A]: [2, 3, 5],
    [Difficulty.S]: [3, 3, 3, 5, 10],
    [Difficulty.S_PLUS]: [5, 5, 8, 10, 15],
    [Difficulty.X]: [10, 10, 10, 10, 10],
    [Difficulty.E]: [], [Difficulty.D]: [], [Difficulty.C]: []
};

// --- SHOP ---
export const RANK_LEVEL_REQUIREMENTS: Record<Difficulty, number> = {
  [Difficulty.E]: 0,
  [Difficulty.D]: 0,
  [Difficulty.C]: 0,
  [Difficulty.B]: 0,
  [Difficulty.A]: 15,
  [Difficulty.S]: 25,
  [Difficulty.S_PLUS]: 50,
  [Difficulty.X]: 50,
};

export const getLevelRequirement = (rank: Difficulty): number => {
    return RANK_LEVEL_REQUIREMENTS[rank] || 0;
};

export const QUEST_COIN_REWARDS: Record<Difficulty, number> = {
  [Difficulty.E]: 1, [Difficulty.D]: 2, [Difficulty.C]: 3, [Difficulty.B]: 5,
  [Difficulty.A]: 8, [Difficulty.S]: 15, [Difficulty.S_PLUS]: 30, [Difficulty.X]: 0,
};

// --- DUNGEONS ---
export const DUNGEONS: Dungeon[] = [
    // --- E-RANK ---
    { 
        id: 'dungeon_e_01', 
        name: 'Sands of Shadow', 
        grade: Difficulty.E, 
        description: 'Escaping the scorching shadow desert.', 
        floors: [{
            id: 'f1', name: 'Desert Entrance', 
            tasks: [{ id: 't1', description: 'Drink 2 glasses of water', page: { title: 'Hydrate', narrative: 'The sun burns...' }}]
        }],
        rewards: { xp: 7 },
        failurePenalty: { xp: 5 }
    },
    { 
        id: 'dungeon_e_02', 
        name: 'Dark Room', 
        grade: Difficulty.E, 
        description: 'Entering the dungeon telports you into a pitch black room, find a light to exit the dungeon.', 
        floors: [{
            id: 'f1', name: 'Dark room', 
            tasks: [{ id: 't1', description: '20/20/20 eye rule', page: { title: 'Eye Strain relief', narrative: 'cannot see...' }}]
        }],
        rewards: { xp: 7 },
        failurePenalty: { xp: 5 }
    },
    // --- D-RANK ---
    { 
        id: 'dungeon_d_01', 
        name: 'Sniper Goblin\'s Perch', 
        grade: Difficulty.D, 
        description: 'Evading projectiles from a high-perched goblin.', 
        floors: [{
            id: 'f1', name: 'Goblin Tower',
            tasks: [{ id: 't1', description: '25 Squats', page: { title: 'Dodge', narrative: 'Arrows fly...' }}]
        }],
        rewards: { xp: 15 },
        failurePenalty: { xp: 10 }
    },
    { 
        id: 'dungeon_d_02', 
        name: 'The Scholar\'s Test', 
        grade: Difficulty.D, 
        type: 'standard', 
        description: 'Knowledge is power. A passage from an ancient text is before you, but its meaning is obscured. Study it until its secrets are revealed.', 
        timeLimit: 1200, 
        floors: [{
            id: 'f1', name: 'The Archive',
            tasks: [{ id: 't1', description: 'Study a chosen subject for 30 minutes', attribute: Attribute.Intellect, page: { title: 'Task 1: Illumination', narrative: 'Focus your mind. The secrets of the universe are written for those with the discipline to read them.' }}]
        }], 
        rewards: { xp: 15, coins: QUEST_COIN_REWARDS[Difficulty.D] }
    },
    { 
        id: 'dungeon_d_03', 
        name: 'The Jester\'s Agility', 
        grade: Difficulty.D, 
        type: 'standard', 
        description: 'The court jester is more agile than any knight. Mimic his movements with high knees to improve your own nimbleness.', 
        timeLimit: 300, 
        floors: [{
            id: 'f1', name: 'The Court',
            tasks: [{ id: 't1', description: 'Perform 1 minute of high knees', attribute: Attribute.Agility, page: { title: 'Task 1: The Frantic Dance', narrative: 'Speed and stamina are your goals. Move your feet as if the ground itself is burning.' }}]
        }], 
        rewards: { xp: 12, coins: QUEST_COIN_REWARDS[Difficulty.D] }
    },
    { 
        id: 'dungeon_d_04', 
        name: 'Forging the Abs', 
        grade: Difficulty.D, 
        type: 'standard', 
        description: 'A warrior\'s core must be as solid as their shield. Perform a set of crunches until you feel the burn of the forge.', 
        timeLimit: 300, 
        floors: [{
            id: 'f1', name: 'The Forge',
            tasks: [{ id: 't1', description: 'Perform 1 set of 30 crunches', attribute: Attribute.Strength, page: { title: 'Task 1: The Abdominal Forge', narrative: 'With each crunch, you are hammering your core into a plate of armor.' }}]
        }], 
        rewards: { xp: 12, coins: QUEST_COIN_REWARDS[Difficulty.D] }
    },
    { 
        id: 'dungeon_d_05', 
        name: 'The Message Runner', 
        grade: Difficulty.D, 
        type: 'standard', 
        description: 'A vital message must be delivered to a nearby outpost. A short, brisk walk is required.', 
        timeLimit: 1200, 
        floors: [{
            id: 'f1', name: 'The Trail',
            tasks: [{ id: 't1', description: 'Walk for 15 minutes', attribute: Attribute.Endurance, page: { title: 'Task 1: The Courier', narrative: 'Move with purpose. Your swiftness ensures the message arrives in time.' }}]
        }], 
        rewards: { xp: 11, coins: QUEST_COIN_REWARDS[Difficulty.D] }
    },
    { 
        id: 'dungeon_d_06', 
        name: 'The Staircase', 
        grade: Difficulty.D, 
        type: 'standard', 
        description: 'You find yourself at the bottom of a seemingly endless staircase. Climb it to build the power in your legs.', 
        timeLimit: 300, 
        floors: [{
            id: 'f1', name: 'The Base',
            tasks: [{ id: 't1', description: 'climb up 3 floors', attribute: Attribute.Strength, page: { title: 'Task 1: The Ascent', narrative: 'Each step is a victory. Each flight is a new level of strength. Ascend.' }}]
        }], 
        rewards: { xp: 12, coins: QUEST_COIN_REWARDS[Difficulty.D] }
    },
    { 
        id: 'dungeon_d_07', 
        name: 'Deciphering the Runes', 
        grade: Difficulty.D, 
        type: 'standard', 
        description: 'An ancient tablet is covered in runes you don\'t understand. Spend time with a foreign language primer to begin your journey as a translator.', 
        timeLimit: 900, 
        floors: [{
            id: 'f1', name: 'The Tablet',
            tasks: [{ id: 't1', description: 'Practice a foreign language for 10 minutes', attribute: Attribute.Intellect, page: { title: 'Task 1: The Lost Tongue', narrative: 'New languages unlock new worlds. Begin to decipher the ancient words.' }}]
        }], 
        rewards: { xp: 11, coins: QUEST_COIN_REWARDS[Difficulty.D] }
    },
    { 
        id: 'dungeon_d_08', 
        name: 'The Griffin\'s Roost', 
        grade: Difficulty.D, 
        type: 'standard', 
        description: 'To reach the griffin\'s roost, you must perform a series of powerful lunges up a steep incline.', 
        timeLimit: 300, 
        floors: [{
            id: 'f1', name: 'The Incline',
            tasks: [{ id: 't1', description: 'Perform 1 set of 20 lunges (10 per leg)', attribute: Attribute.Strength, page: { title: 'Task 1: The Climb', narrative: 'This climb requires strength and balance. Each lunge brings you closer to the peak.' }}]
        }], 
        rewards: { xp: 12, coins: QUEST_COIN_REWARDS[Difficulty.D] }
    },
    { 
        id: 'dungeon_d_09', 
        name: 'The Silent Oracle', 
        grade: Difficulty.D, 
        type: 'standard', 
        description: 'The Silent Oracle speaks not in words, but in written passages. Read from a book of wisdom to gain insight.', 
        timeLimit: 900, 
        floors: [{
            id: 'f1', name: 'The Sanctum',
            tasks: [{ id: 't1', description: 'Read 5 pages of a non-fiction book', attribute: Attribute.Intellect, page: { title: 'Task 1: Gaining Insight', narrative: 'The wisdom of ages is yours to claim. Absorb the knowledge.' }}]
        }], 
        rewards: { xp: 8, coins: QUEST_COIN_REWARDS[Difficulty.D] }
    },
    { 
        id: 'dungeon_d_10', 
        name: 'The Golem\'s Push', 
        grade: Difficulty.D, 
        type: 'standard', 
        description: 'A stone golem blocks your path. It won\'t budge. Perform powerful push-ups to build the strength to move it.', 
        timeLimit: 300, 
        floors: [{
            id: 'f1', name: 'The Obstacle',
            tasks: [{ id: 't1', description: 'Perform 1 set of 15 push-ups (on knees if needed)', attribute: Attribute.Strength, page: { title: 'Task 1: The Unmovable Object', narrative: 'Test your strength against an impassable foe. Become the irresistible force.' }}]
        }], 
        rewards: { xp: 12, coins: QUEST_COIN_REWARDS[Difficulty.D] }
    },
    { 
        id: 'dungeon_d_11_rf', 
        name: 'Rock Fall', 
        grade: Difficulty.D, 
        description: 'run 250m to escape the falling rocks.', 
        floors: [{
            id: 'f1', name: 'Rock Fall',
            tasks: [{ id: 't1', description: '250m Run', page: { title: 'Dodge', narrative: 'Rocks fall...' }}]
        }],
        rewards: { xp: 12 },
        failurePenalty: { xp: 8 }
    },
    // --- C-RANK ---
    { 
        id: 'dungeon_c_01', 
        name: 'Residents of the Grave', 
        grade: Difficulty.C, 
        description: 'Kill the undead.', 
        floors: [{
            id: 'f1', name: 'Graveyard',
            tasks: [{ id: 't1', description: 'Shadow box 3 mins', page: { title: 'First Wave', narrative: 'Bones rattle...' }}]
        }],
        rewards: { xp: 15 },
        failurePenalty: { xp: 20 }
    },
    { 
        id: 'dungeon_c_02', 
        name: 'The King\'s Road Patrol', 
        grade: Difficulty.C, 
        type: 'standard', 
        description: 'The King\'s Road is beset by bandits. Patrol a 1km stretch to ensure the safety of travelers.', 
        timeLimit: 1200, 
        floors: [{
            id: 'f1', name: 'The King\'s Road',
            tasks: [{ id: 't1', description: 'Jog or run for 500m', attribute: Attribute.Endurance, page: { title: 'Task 1: Securing the Road', narrative: 'Your presence is a deterrent. Your speed is a weapon. Clear the King\'s Road.' }}]
        }], 
        rewards: { xp: 20, coins: QUEST_COIN_REWARDS[Difficulty.C] }
    },
    { 
        id: 'dungeon_c_03', 
        name: 'The Great Library', 
        grade: Difficulty.C, 
        type: 'standard', 
        description: 'The Great Library holds infinite knowledge, but you are only permitted to study one tome. Absorb its contents for half an hour.', 
        timeLimit: 2100, 
        floors: [{
            id: 'f1', name: 'The Silent Stacks',
            tasks: [{ id: 't1', description: 'Read a book for 30 minutes', attribute: Attribute.Intellect, page: { title: 'Task 1: Communion with Knowledge', narrative: 'The silence of the library is filled with the voices of the past. Listen to them.' }}]
        }], 
        rewards: { xp: 17, coins: QUEST_COIN_REWARDS[Difficulty.C] }
    },
    { 
        id: 'dungeon_c_04', 
        name: 'The Banquet\'s Aftermath', 
        grade: Difficulty.C, 
        type: 'standard', 
        description: 'A grand banquet has concluded, leaving a mountain of dirty plates and goblets. It falls to you to restore order to the castle kitchen.', 
        timeLimit: 1800, 
        floors: [{
            id: 'f1', name: 'The Scullery',
            tasks: [{ id: 't1', description: 'Do all the dishes in the house, including pots and pans', attribute: Attribute.Endurance, page: { title: 'Task 1: The Scullery Maid\'s Trial', narrative: 'This thankless task builds more character than a thousand battles. Find discipline in the mundane.' }}]
        }], 
        rewards: { xp: 16, coins: QUEST_COIN_REWARDS[Difficulty.C] }
    },
    { 
        id: 'dungeon_c_05', 
        name: 'The Triad of Power', 
        grade: Difficulty.C, 
        type: 'standard', 
        description: 'A true warrior balances strength, agility, and endurance. Complete a circuit of push-ups, squats, and planks.', 
        timeLimit: 1200, 
        floors: [{
            id: 'f1', name: 'The Trinity Arena',
            tasks: [{ id: 't1', description: 'Complete 3 rounds of: 10 push-ups, 15 squats, 30-sec plank', attribute: Attribute.Strength, page: { title: 'Task 1: The Trinity Circuit', narrative: 'Forge your body in the three pillars of physical prowess. Do not falter.' }}]
        }], 
        rewards: { xp: 20, coins: QUEST_COIN_REWARDS[Difficulty.C] }
    },
    { 
        id: 'dungeon_c_06', 
        name: 'The Loremaster\'s Challenge', 
        grade: Difficulty.C, 
        type: 'standard', 
        description: 'A Loremaster challenges you to recall an ancient lay. Read a chapter of a book, then summarize its key points.', 
        timeLimit: 1800, 
        floors: [{
            id: 'f1', name: 'The High Study',
            tasks: [{ id: 't1', description: 'Read a chapter, then write a short summary', attribute: Attribute.Intellect, page: { title: 'Task 1: Absorb and Recount', narrative: 'It is not enough to read the words; you must understand their soul. Prove your comprehension.' }}]
        }], 
        rewards: { xp: 19, coins: QUEST_COIN_REWARDS[Difficulty.C] }
    },
    { 
        id: 'dungeon_c_07', 
        name: 'The Garrison\'s Laundry', 
        grade: Difficulty.C, 
        type: 'standard', 
        description: 'The entire garrison\'s laundry has been assigned to you. A daunting task, but one that builds character.', 
        timeLimit: 3600, 
        floors: [{
            id: 'f1', name: 'The Wash Yard',
            tasks: [{ id: 't1', description: 'Wash, dry, and fold a load of laundry', attribute: Attribute.Endurance, page: { title: 'Task 1: The Quartermaster\'s Burden', narrative: 'An army runs on clean linen as much as it does on steel. See this task through.' }}]
        }], 
        rewards: { xp: 15, coins: QUEST_COIN_REWARDS[Difficulty.C] }
    },
    { 
        id: 'dungeon_c_08', 
        name: 'The Endurance Run', 
        grade: Difficulty.C, 
        type: 'standard', 
        description: 'The system requires you to test your stamina. A brisk walk through the enchanted forest is in order.', 
        timeLimit: 2100, 
        floors: [{
            id: 'f1', name: 'The Long Path',
            tasks: [{ id: 't1', description: 'Go for a 30-minute walk', attribute: Attribute.Endurance, page: { title: 'Task 1: The Long Path', narrative: 'This is not a race. This is a test of sustained effort. Maintain your pace.' }}]
        }], 
        rewards: { xp: 18, coins: QUEST_COIN_REWARDS[Difficulty.C] }
    },
    { 
        id: 'dungeon_c_09', 
        name: 'The Spellbook\'s Secrets', 
        grade: Difficulty.C, 
        type: 'standard', 
        description: 'You\'ve found a new spellbook, but the incantations are complex. You must memorize one spell completely.', 
        timeLimit: 1500, 
        floors: [{
            id: 'f1', name: 'The Mind Chamber',
            tasks: [{ id: 't1', description: 'Memorize a new piece of information (e.g., a recipe, a formula, 10 vocabulary words)', attribute: Attribute.Intellect, page: { title: 'Task 1: Etching the Mind', narrative: 'Carve this new knowledge into your memory until it is as familiar as your own name.' }}]
        }], 
        rewards: { xp: 19, coins: QUEST_COIN_REWARDS[Difficulty.C] }
    },
    { 
        id: 'dungeon_c_10', 
        name: 'The Wyvern\'s Climb', 
        grade: Difficulty.C, 
        type: 'standard', 
        description: 'To reach the wyvern\'s nest, you must scale a cliff face. This requires immense upper body strength.', 
        timeLimit: 1200, 
        floors: [{
            id: 'f1', name: 'The Wyvern Cliff',
            tasks: [{ id: 't1', description: 'Complete 3 sets of pull-ups or an alternative back exercise to failure', attribute: Attribute.Strength, page: { title: 'Task 1: The Vertical Ascent', narrative: 'The only way is up. Pull your body towards the sky, rep by rep.' }}]
        }], 
        rewards: { xp: 20, coins: QUEST_COIN_REWARDS[Difficulty.C] }
    },
    { 
        id: 'dungeon_c_11_lz', 
        name: 'Lava Zone', 
        grade: Difficulty.C, 
        description: 'user will be given a pair of eagle wings use them to fly and escape the lava.', 
        floors: [{
            id: 'f1', name: 'Lava Zone',
            tasks: [{ id: 't1', description: 'complete lateral raises 3 sets of 15 reps', page: { title: 'Fly...', narrative: 'Bones rattle...' }}]
        }],
        rewards: { xp: 20 },
        failurePenalty: { xp: 25 }
    },
    { 
        id: 'dungeon_c_12_gp', 
        name: 'Goblin Pack', 
        grade: Difficulty.C, 
        description: 'kill the goblins', 
        floors: [{
            id: 'f1', name: 'Goblins Pack',
            tasks: [{ id: 't1', description: 'Shadow box for 3 mins', page: { title: 'fight...', narrative: 'kill the goblins...' }}]
        }],
        rewards: { xp: 15 },
        failurePenalty: { xp: 15 }
    },
    // --- B-RANK ---
    { 
        id: 'dungeon_b_01', 
        name: 'The Colosseum Gauntlet', 
        grade: Difficulty.B, 
        type: 'standard', 
        description: 'You are a contender in the Colosseum. Survive four rounds of grueling exercises to earn the crowd\'s favor.', 
        timeLimit: 2700, 
        floors: [{
            id: 'f1', name: 'The Colosseum Floor',
            tasks: [{ id: 't1', description: 'Complete 3 sets of a compound exercise (e.g., 4x12 squats or deadlifts)', attribute: Attribute.Strength, page: { title: 'Task 1: The Test of Strength', narrative: 'The crowd roars. Your opponent is the iron itself. Defeat it four times over.' }}]
        }], 
        rewards: { xp: 40, coins: QUEST_COIN_REWARDS[Difficulty.B] }
    },
    { 
        id: 'dungeon_b_02', 
        name: 'The Titan\'s Legs', 
        grade: Difficulty.B, 
        type: 'standard', 
        description: 'To stand against a titan, you must possess legs of equal might. This brutal leg workout will forge them.', 
        timeLimit: 2100, 
        floors: [{
            id: 'f1', name: 'The Earth Shaker Arena',
            tasks: [{ id: 't1', description: 'Complete 2 sets of a difficult leg exercise (e.g., Bulgarian split squats) to failure', attribute: Attribute.Strength, page: { title: 'Task 1: The Earth Shaker', narrative: 'This exercise will break you down to build you up stronger. Push until your legs scream for mercy.' }}]
        }], 
        rewards: { xp: 38, coins: QUEST_COIN_REWARDS[Difficulty.B] }
    },
    { 
        id: 'dungeon_b_03', 
        name: 'The Full-Body Blitz', 
        grade: Difficulty.B, 
        type: 'standard', 
        description: 'The ultimate test of a B-Rank warrior. A relentless full-body workout designed to push you to your limits.', 
        timeLimit: 1800, 
        floors: [{
            id: 'f1', name: 'The Eye of the Storm',
            tasks: [{ id: 't1', description: 'Complete 3 rounds of: 10 burpees, 20 lunges, 15 push-ups', attribute: Attribute.Endurance, page: { title: 'Task 1: The Storm', narrative: 'There is no rest, no respite. Only the storm of movement. Endure it.' }}]
        }], 
        rewards: { xp: 40, coins: QUEST_COIN_REWARDS[Difficulty.B] }
    },
    { 
        id: 'dungeon_b_04', 
        name: 'The Mountain Pass', 
        grade: Difficulty.B, 
        type: 'standard', 
        description: 'A treacherous mountain pass stands between you and your objective. A 1km run is the only way through.', 
        timeLimit: 2400, 
        floors: [{
            id: 'f1', name: 'The High Road',
            tasks: [{ id: 't1', description: 'Run 1km', attribute: Attribute.Endurance, page: { title: 'Task 1: The High Road', narrative: 'The air is thin and the path is steep. Your endurance is the only thing that will see you to the other side.' }}]
        }], 
        rewards: { xp: 35, coins: QUEST_COIN_REWARDS[Difficulty.B] }
    },
    { 
        id: 'dungeon_b_05', 
        name: 'The Forgemaster\'s Challenge', 
        grade: Difficulty.B, 
        type: 'standard', 
        description: 'The Forgemaster demands you prove your upper body strength. Two grueling exercises are your test.', 
        timeLimit: 2700, 
        floors: [{
            id: 'f1', name: 'The Twin Anvils',
            tasks: [{ id: 't1', description: 'Complete 2 difficult upper body exercises (e.g., 4 sets of pull-ups, 4 sets of bench press)', attribute: Attribute.Strength, page: { title: 'Task 1: The Twin Anvils', narrative: 'One exercise tests your pull, the other tests your push. Master both to earn the Forgemaster\'s respect.' }}]
        }], 
        rewards: { xp: 40, coins: QUEST_COIN_REWARDS[Difficulty.B] }
    },
    { 
        id: 'dungeon_b_06_cs', 
        name: 'The Code Sorcerer', 
        grade: Difficulty.B, 
        description: 'Mastering logical incantations.', 
        floors: [{
            id: 'f1', name: 'Sanctum of Logic',
            tasks: [{ id: 't1', description: 'Study 40 mins', page: { title: 'Decipher', narrative: 'The glyphs hum...' }}]
        }],
        rewards: { xp: 35 },
        failurePenalty: { xp: 40 }
    },
    { 
        id: 'dungeon_b_07_wf', 
        name: 'Wild Forest', 
        grade: Difficulty.C, 
        description: 'Survive the wild life.', 
        floors: [{
            id: 'f1', name: 'Wild Forest',
            tasks: [{ id: 't1', description: '50 push ups', page: { title: 'Push...', narrative: 'Strong will...' }}]
        }],
        rewards: { xp: 35 },
        failurePenalty: { xp: 40 }
    },
    // --- A-RANK ---
    { 
        id: 'dungeon_a_01', 
        name: 'Mystery of Miracle', 
        grade: Difficulty.A, 
        description: 'Escaping toxic fog in a damp cave.', 
        floors: [
            { id: 'f1', name: 'Mist Entry', tasks: [{ id: 't1', description: 'plank 2 minutes', page: { title: 'Holding Breath', narrative: 'The air turns thick...' }}]},
            { id: 'f2', name: 'Poison Path', tasks: [{ id: 't2', description: '30 Squats', page: { title: 'Swift Move', narrative: 'Vapors rise...' }}]},
            { id: 'f3', name: 'The Core', tasks: [{ id: 't3', description: '30 push ups ', page: { title: 'The Escape', narrative: 'I can see the light...' }}]}
        ],
        rewards: { xp: 75 },
        failurePenalty: { xp: 100 }
    },
    { 
        id: 'dungeon_a_02', 
        name: 'Orc Attack', 
        grade: Difficulty.A, 
        description: 'Defeat all the Orcs in the dungeon.', 
        floors: [
            { id: 'f1', name: 'Orc Goons', tasks: [{ id: 't1', description: 'shadow box 3 minutes 5 rounds', page: { title: '3 groups of Orcs attacks', narrative: 'ambushed...' }}]},
            { id: 'f2', name: 'High Orcs', tasks: [{ id: 't2', description: 'weighted shadow boxing 3mins 3 rounds', page: { title: 'tough situatiom', narrative: 'in a pinch...' }}]},
            { id: 'f3', name: 'Orc Leader', tasks: [{ id: 't3', description: 'heavy bag 3 minutes 5 rounds', page: { title: 'The head Orc', narrative: 'kill...' }}]}
        ],
        rewards: { xp: 225 },
        failurePenalty: { xp: 250 }
    },
    { 
        id: 'dungeon_a_03', 
        name: 'The Volcano\'s Core', 
        grade: Difficulty.A, 
        type: 'standard', 
        description: 'The ground rumbles as you descend into a volcano. The air is scorching, and the floor is unstable. You must reach the summit and escape before it erupts.', 
        timeLimit: 900, 
        floors: [
            { id: 'f1', name: 'The Slopes', tasks: [{ id: 't1', description: 'Perform 50 jumping lunges to scale the slippery incline.', attribute: Attribute.Strength, page: { title: 'Task 1: The Ascent', narrative: 'The volcano\'s slope is steep and covered in treacherous ash.' }}]},
            { id: 'f2', name: 'Steam Field', tasks: [{ id: 't2', description: 'Perform 30 squat jumps to evade the scalding steam.', attribute: Attribute.Agility, page: { title: 'Task 2: Steam Vents', narrative: 'The path is riddled with superheated steam vents.' }}]},
            { id: 'f3', name: 'The Summit', tasks: [{ id: 't3', description: 'Sprint for 30 seconds without stopping to outrun the pyroclastic flow.', attribute: Attribute.Agility, page: { title: 'Task 3: The Summit Sprint', narrative: 'The volcano has begun its final eruption!' }}]}
        ],
        rewards: { xp: 75, coins: QUEST_COIN_REWARDS[Difficulty.A] }, 
        failurePenalty: { xp: 50 }
    },
    { 
        id: 'dungeon_a_04', 
        name: 'The Assassin\'s Gauntlet', 
        grade: Difficulty.A, 
        type: 'standard', 
        description: 'You\'ve been dropped into an assassin\'s training gauntlet. Traps are everywhere. Your only hope is to move with inhuman speed and agility.', 
        timeLimit: 720, 
        floors: [
            { id: 'f1', name: 'Hall of Blades', tasks: [{ id: 't1', description: '3 minutes of high-intensity shadow boxing to disarm pressure plates', attribute: Attribute.Agility, page: { title: 'Task 1: The Hall of Blades', narrative: 'The floor is a tapestry of pressure plates.' }}]},
            { id: 'f2', name: 'Laser Path', tasks: [{ id: 't2', description: 'Perform 60 seconds of high knees to leap over tripwires', attribute: Attribute.Agility, page: { title: 'Task 2: The Razor Wire', narrative: 'Gleaming wires are strung at shin-height.' }}]},
            { id: 'f3', name: 'Final Chasm', tasks: [{ id: 't3', description: '30 squat jumps to clear a chasm', attribute: Attribute.Strength, page: { title: 'Task 3: The Leap of Faith', narrative: 'The final obstacle is a chasm.' }}]}
        ],
        rewards: { xp: 80, coins: QUEST_COIN_REWARDS[Difficulty.A] }, 
        failurePenalty: { xp: 55 }
    },
    { 
        id: 'dungeon_a_05', 
        name: 'The Wyrm\'s Breath', 
        grade: Difficulty.A, 
        type: 'standard', 
        description: 'A great wyrm guards the path. It unleashes a torrent of fire, forcing you to constantly move. This is a pure test of agility and stamina.', 
        timeLimit: 600, 
        floors: [
            { id: 'f1', name: 'The Scorched Path', tasks: [{ id: 't1', description: 'Complete 3 rounds of: 10 burpees, 20 mountain climbers.', attribute: Attribute.Agility, page: { title: 'Task 1: The First Salvo', narrative: 'The wyrm unleashes its first wave of fire.' }}]},
            { id: 'f2', name: 'The Inferno', tasks: [{ id: 't2', description: 'Complete 3 rounds of: 15 jumping squats, 10 push-ups.', attribute: Attribute.Agility, page: { title: 'Task 2: The Inferno', narrative: 'Angered, the wyrm floods the area with fire.' }}]},
            { id: 'f3', name: 'The Final Breach', tasks: [{ id: 't3', description: 'Survive for 2 minutes by performing continuous shuttle sprints.', attribute: Attribute.Agility, page: { title: 'Task 3: The Final Barrage', narrative: 'The wyrm makes a final, desperate attempt to incinerate you.' }}]}
        ],
        rewards: { xp: 110, coins: QUEST_COIN_REWARDS[Difficulty.A] }, 
        failurePenalty: { xp: 60 }
    },
    { 
        id: 'dungeon_a_06', 
        name: 'The Berserker\'s Rage', 
        grade: Difficulty.A, 
        type: 'standard', 
        description: 'You\'ve consumed a berserker\'s brew. A wave of uncontrollable energy fills you. You must expend it through intense physical exertion before it consumes you.', 
        timeLimit: 900, 
        floors: [
            { id: 'f1', name: 'Primal Burst', tasks: [{ id: 't1', description: 'Perform 50 kettlebell swings (or dumbbell swings/burpees) to begin expending the raw energy.', attribute: Attribute.Strength, page: { title: 'Task 1: The Boiling Blood', narrative: 'The rage begins to build, a fire in your veins.' }}]},
            { id: 'f2', name: 'Unchained Fury', tasks: [{ id: 't2', description: 'Perform 3 sets of maximum-repetition push-ups, with only 30 seconds rest between sets.', attribute: Attribute.Strength, page: { title: 'Task 2: The Unchained Fury', narrative: 'The brew takes full effect. You feel an urge to destroy.' }}]},
            { id: 'f3', name: 'Rage Burnout', tasks: [{ id: 't3', description: 'Perform a 100-meter sprint at maximum effort to fully burn out the rage.', attribute: Attribute.Agility, page: { title: 'Task 3: The Final Howl', narrative: 'The rage is almost spent. PURGE IT.' }}]}
        ],
        rewards: { xp: 130, coins: QUEST_COIN_REWARDS[Difficulty.A] }, 
        failurePenalty: { xp: 50 }
    },
    { 
        id: 'dungeon_a_07', 
        name: 'The Gravity Well', 
        grade: Difficulty.A, 
        type: 'standard', 
        description: 'You are caught in a gravity well that threatens to crush you. Only by generating immense upward force can you hope to escape its pull.', 
        timeLimit: 720, 
        floors: [
            { id: 'f1', name: 'Crushing Weight', tasks: [{ id: 't1', description: 'Perform 100 weighted calf raises (or 200 bodyweight) to fight against the initial pull.', attribute: Attribute.Strength, page: { title: 'Task 1: Resisting the Pull', narrative: 'The gravity well pulls at you, trying to root you to the ground.' }}]},
            { id: 'f2', name: 'Escape Velocity', tasks: [{ id: 't2', description: 'Perform 50 box jumps (or tuck jumps) to generate explosive upward force.', attribute: Attribute.Agility, page: { title: 'Task 2: Upward Burst', narrative: 'You need to generate escape velocity.' }}]},
            { id: 'f3', name: 'The Breakout', tasks: [{ id: 't3', description: 'Perform 50 burpees to create a final, full-body shockwave to break free.', attribute: Attribute.Endurance, page: { title: 'Task 3: The Final Push', narrative: 'A final, full-body shockwave is needed to shatter the well\'s hold.' }}]}
        ],
        rewards: { xp: 85, coins: QUEST_COIN_REWARDS[Difficulty.A] }, 
        failurePenalty: { xp: 70 }
    },
    { 
        id: 'dungeon_a_08', 
        name: 'The Final Stand', 
        grade: Difficulty.A, 
        type: 'standard', 
        description: 'The horde is endless. Your back is against the wall. This is your final stand. Fight until you have nothing left.', 
        timeLimit: 1200, 
        floors: [
            { id: 'f1', name: 'The Outer Wall', tasks: [{ id: 't1', description: 'Survive the first 5 minutes by completing 50 push-ups.', attribute: Attribute.Strength, page: { title: 'Task 1: The Vanguard', narrative: 'The first wave of the horde crashes against your position.' }}]},
            { id: 'f2', name: 'The Courtyard', tasks: [{ id: 't2', description: 'Survive the next 7 minutes by completing 100 squats.', attribute: Attribute.Strength, page: { title: 'Task 2: The Elites', narrative: 'Heavily armored elites have joined the fray.' }}]},
            { id: 'f3', name: 'The Keep', tasks: [{ id: 't3', description: 'Survive the final 8 minutes by completing 25 pull-ups (or 50 inverted rows).', attribute: Attribute.Strength, page: { title: 'Task 3: The General', narrative: 'The enemy general has appeared. This is the final push.' }}]}
        ],
        rewards: { xp: 250, coins: QUEST_COIN_REWARDS[Difficulty.A] }, 
        failurePenalty: { xp: 80 }
    },
    // --- S-RANK ---
    { 
        id: 'dungeon_s_01', 
        name: 'Grim Reaper', 
        grade: Difficulty.S, 
        description: 'Outrunning death itself.', 
        floors: [
            { id: 'f1', name: 'Chamber of Silence', tasks: [{ id: 't1', description: '3km Run nonstop no music', page: { title: 'Whispers', narrative: 'its easy to quit...' }}]},
            { id: 'f2', name: 'End of the tunnel', tasks: [{ id: 't2', description: '100m sprint', page: { title: 'the light', narrative: 'final push...' }}]},
        ],
        rewards: { xp: 450 },
        failurePenalty: { xp: 600 }
    }
];

export const SHOP_ITEMS: ShopItem[] = [
    // Helmets
    { id: 'helm_rogue', name: 'Rogue Helmet', type: 'Gear', slot: 'helmet', rank: Difficulty.C, bonusXp: 1, effectDescription: "Basic equipment.", cost: 100 },
    { id: 'helm_iron', name: 'Iron Helmet', type: 'Gear', slot: 'helmet', rank: Difficulty.B, bonusXp: 2, effectDescription: "Decent gear.", cost: 250 },
    { id: 'helm_shadow', name: 'Shadow Helmet', type: 'Gear', slot: 'helmet', rank: Difficulty.A, bonusXp: 3, effectDescription: "Forged with dark metals.", cost: 500 },
    { id: 'helm_light', name: 'Brilliant Light Helmet', type: 'Gear', slot: 'helmet', rank: Difficulty.S, bonusXp: 3, effectDescription: "Forged with the highest caliber of metals and gold.", cost: 1200 },
    
    // Armor
    { id: 'armor_rogue', name: 'Rogue Armor', type: 'Gear', slot: 'armor', rank: Difficulty.C, bonusXp: 1, effectDescription: "Basic equipment.", cost: 100 },
    { id: 'armor_iron', name: 'Iron Armor', type: 'Gear', slot: 'armor', rank: Difficulty.B, bonusXp: 2, effectDescription: "Decent gear.", cost: 250 },
    { id: 'armor_shadow', name: 'Shadow Armor', type: 'Gear', slot: 'armor', rank: Difficulty.A, bonusXp: 5, effectDescription: "Forged with dark metals.", cost: 500 },
    { id: 'armor_light', name: 'Brilliant Light Armor', type: 'Gear', slot: 'armor', rank: Difficulty.S, bonusXp: 15, effectDescription: "Forged with the highest caliber of metals and gold.", cost: 1200 },
    { id: 'armor_berserker', name: 'Berserker Armor', type: 'Gear', slot: 'armor', rank: Difficulty.X, bonusXp: 0, effectDescription: "CURSED. CRAVES BLOOD AND ATTRACTS EVIL. Significantly increases penalty but offers greater bonuses. Cannot be removed normally.", cost: 2200 },
     
    // Gloves
    { id: 'gloves_rogue', name: 'Rogue Gloves', type: 'Gear', slot: 'gloves', rank: Difficulty.C, bonusXp: 1, effectDescription: "Basic equipment.", cost: 100 },
    { id: 'gloves_iron', name: 'Iron Gloves', type: 'Gear', slot: 'gloves', rank: Difficulty.B, bonusXp: 2, effectDescription: "Decent gear.", cost: 250 },
    { id: 'gloves_shadow', name: 'Shadow Gloves', type: 'Gear', slot: 'gloves', rank: Difficulty.A, bonusXp: 4, effectDescription: "Forged with dark metals.", cost: 500 },
    { id: 'gloves_light', name: 'Brilliant Light Gloves', type: 'Gear', slot: 'gloves', rank: Difficulty.S, bonusXp: 12, effectDescription: "Forged with the highest caliber of metals and gold.", cost: 1200 },
    
    // Boots
    { id: 'boots_rogue', name: 'Rogue Boots', type: 'Gear', slot: 'boots', rank: Difficulty.C, bonusXp: 1, effectDescription: "Basic equipment.", cost: 100 },
    { id: 'boots_iron', name: 'Iron Boots', type: 'Gear', slot: 'boots', rank: Difficulty.B, bonusXp: 2, effectDescription: "Decent gear.", cost: 250 },
    { id: 'boots_shadow', name: 'Shadow Boots', type: 'Gear', slot: 'boots', rank: Difficulty.A, bonusXp: 4, effectDescription: "Forged with dark metals.", cost: 500 },
    { id: 'boots_light', name: 'Brilliant Light Boots', type: 'Gear', slot: 'boots', rank: Difficulty.S, bonusXp: 12, effectDescription: "Forged with the highest caliber of metals and gold.", cost: 1200 },
    
    // Special Gear
    { id: 'gear_shadow', name: 'Shadow Sword', type: 'Gear', slot: 'gear', rank: Difficulty.A, bonusXp: 4, effectDescription: "Forged with dark metals.", cost: 700 },
    { id: 'gear_light', name: 'Brilliant Light Sword', type: 'Gear', slot: 'gear', rank: Difficulty.S, bonusXp: 12, effectDescription: "Forged with the highest caliber of metals and gold.", cost: 1500 },
    { id: 'gear_dragon_slayer', name: 'Dragon Slayer', type: 'Gear', slot: 'gear', rank: Difficulty.S_PLUS, bonusXp: 50, effectDescription: "Forged with the malice of slain spirits.", cost: 3000 },
    
    // Items
    { id: 'potion_healing', name: 'Healing Potion', type: 'Potion', rank: Difficulty.S, effectDescription: "Restores 100 XP.", cost: 500 },
    { id: 'brilliant_light_orb', name: 'Brilliant Light Orb', type: 'Potion', rank: Difficulty.S, effectDescription: "Used to Uplift Berserker Gear curse.", cost: 2000 },
];

export const TITLES: Record<string, Title> = {
    'title_s_the_relentless': { id: 'title_s_the_relentless', name: 'The Relentless', rank: Difficulty.S },
};

export const ACHIEVEMENTS_DATA: Record<string, Achievement> = {
    'lvl_10': { id: 'lvl_10', name: 'Novice', description: 'Reach Level 10.', rank: Difficulty.E, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'REACH_LEVEL', rewardCoins: 100 },
    'lvl_15': { id: 'lvl_15', name: 'Rookie Hunter', description: 'Reach Level 15.', rank: Difficulty.D, isUnlocked: false, unlockDate: null, progress: 0, goal: 15, type: 'REACH_LEVEL', rewardCoins: 150 },
    'lvl_20': { id: 'lvl_20', name: 'Tough Cookie', description: 'Reach Level 20.', rank: Difficulty.D, isUnlocked: false, unlockDate: null, progress: 0, goal: 20, type: 'REACH_LEVEL', rewardCoins: 300 },
    'lvl_25': { id: 'lvl_25', name: 'Fighter', description: 'Reach Level 25.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 25, type: 'REACH_LEVEL', rewardCoins: 500 },
    'lvl_30': { id: 'lvl_30', name: 'Epic hunter', description: 'Reach Level 30.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 30, type: 'REACH_LEVEL', rewardCoins: 800 },
    'lvl_40': { id: 'lvl_40', name: 'Hitman', description: 'Reach Level 40.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 40, type: 'REACH_LEVEL', rewardCoins: 1000 },
    'lvl_50': { id: 'lvl_50', name: 'Hero', description: 'Reach Level 50.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'REACH_LEVEL', rewardCoins: 1250 },
    'lvl_60': { id: 'lvl_60', name: 'Discipline', description: 'Reach Level 60.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 60, type: 'REACH_LEVEL', rewardCoins: 1500 },
    'lvl_70': { id: 'lvl_70', name: 'Pushing Past Limits', description: 'Reach Level 70.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 70, type: 'REACH_LEVEL', rewardCoins: 2000 },
    'lvl_80': { id: 'lvl_80', name: 'Elite Hunter', description: 'Reach Level 80.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 80, type: 'REACH_LEVEL', rewardCoins: 2250 },
    'lvl_90': { id: 'lvl_90', name: 'Warrior', description: 'Reach Level 90.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 90, type: 'REACH_LEVEL', rewardCoins: 2500 },
    'lvl_100': { id: 'lvl_100', name: 'Pinnacle', description: 'Reach Level 100.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'REACH_LEVEL', rewardCoins: 5000, titleReward: 'title_s_the_relentless' },
    
    // E Rank Quests
    'q_e_10': { id: 'q_e_10', name: 'Novice Contractor I', description: 'Complete 10 E-Rank Quests.', rank: Difficulty.E, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.E }, rewardCoins: 10 },
    'q_e_30': { id: 'q_e_30', name: 'Novice Contractor II', description: 'Complete 30 E-Rank Quests.', rank: Difficulty.D, isUnlocked: false, unlockDate: null, progress: 0, goal: 30, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.E }, rewardCoins: 25 },
    'q_e_50': { id: 'q_e_50', name: 'Novice Contractor III', description: 'Complete 50 E-Rank Quests.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.E }, rewardCoins: 50 },
    'q_e_100': { id: 'q_e_100', name: 'Novice Contractor IV', description: 'Complete 100 E-Rank Quests.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.E }, rewardCoins: 150 },

    // D Rank Quests
    'q_d_10': { id: 'q_d_10', name: 'Consistent Hunter I', description: 'Complete 10 D-Rank Quests.', rank: Difficulty.E, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.D }, rewardCoins: 15 },
    'q_d_30': { id: 'q_d_30', name: 'Consistent Hunter II', description: 'Complete 30 D-Rank Quests.', rank: Difficulty.D, isUnlocked: false, unlockDate: null, progress: 0, goal: 30, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.D }, rewardCoins: 35 },
    'q_d_50': { id: 'q_d_50', name: 'Consistent Hunter III', description: 'Complete 50 D-Rank Quests.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.D }, rewardCoins: 60 },
    'q_d_100': { id: 'q_d_100', name: 'Consistent Hunter IV', description: 'Complete 100 D-Rank Quests.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.D }, rewardCoins: 200 },

    // C Rank Quests
    'q_c_10': { id: 'q_c_10', name: 'Solid Core I', description: 'Complete 10 C-Rank Quests.', rank: Difficulty.E, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.C }, rewardCoins: 20 },
    'q_c_25': { id: 'q_c_25', name: 'Solid Core II', description: 'Complete 25 C-Rank Quests.', rank: Difficulty.D, isUnlocked: false, unlockDate: null, progress: 0, goal: 25, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.C }, rewardCoins: 50 },
    'q_c_50': { id: 'q_c_50', name: 'Solid Core III', description: 'Complete 50 C-Rank Quests.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.C }, rewardCoins: 75 },
    'q_c_75': { id: 'q_c_75', name: 'Solid Core IV', description: 'Complete 75 C-Rank Quests.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 75, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.C }, rewardCoins: 100 },
    'q_c_100': { id: 'q_c_100', name: 'Solid Core V', description: 'Complete 100 C-Rank Quests.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.C }, rewardCoins: 200 },

    // B Rank Quests
    'q_b_10': { id: 'q_b_10', name: 'Tenacious Will I', description: 'Complete 10 B-Rank Quests.', rank: Difficulty.D, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.B }, rewardCoins: 30 },
    'q_b_25': { id: 'q_b_25', name: 'Tenacious Will II', description: 'Complete 25 B-Rank Quests.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 25, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.B }, rewardCoins: 60 },
    'q_b_50': { id: 'q_b_50', name: 'Tenacious Will III', description: 'Complete 50 B-Rank Quests.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.B }, rewardCoins: 100 },
    'q_b_75': { id: 'q_b_75', name: 'Tenacious Will IV', description: 'Complete 75 B-Rank Quests.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 75, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.B }, rewardCoins: 150 },
    'q_b_100': { id: 'q_b_100', name: 'Tenacious Will V', description: 'Complete 100 B-Rank Quests.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.B }, rewardCoins: 300 },

    // A Rank Quests
    'q_a_10': { id: 'q_a_10', name: 'Iron Discipline I', description: 'Complete 10 A-Rank Quests.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.A }, rewardCoins: 50 },
    'q_a_25': { id: 'q_a_25', name: 'Iron Discipline II', description: 'Complete 25 A-Rank Quests.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 25, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.A }, rewardCoins: 100 },
    'q_a_50': { id: 'q_a_50', name: 'Iron Discipline III', description: 'Complete 50 A-Rank Quests.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.A }, rewardCoins: 150 },
    'q_a_75': { id: 'q_a_75', name: 'Iron Discipline IV', description: 'Complete 75 A-Rank Quests.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 75, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.A }, rewardCoins: 250 },
    'q_a_100': { id: 'q_a_100', name: 'Iron Discipline V', description: 'Complete 100 A-Rank Quests.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.A }, rewardCoins: 550 },

    // S Rank Quests
    'q_s_10': { id: 'q_s_10', name: 'Pinnacle Seeker I', description: 'Complete 10 S-Rank Quests.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.S }, rewardCoins: 100 },
    'q_s_25': { id: 'q_s_25', name: 'Pinnacle Seeker II', description: 'Complete 25 S-Rank Quests.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 25, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.S }, rewardCoins: 200 },
    'q_s_50': { id: 'q_s_50', name: 'Pinnacle Seeker III', description: 'Complete 50 S-Rank Quests.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.S }, rewardCoins: 550 },
    'q_s_75': { id: 'q_s_75', name: 'Pinnacle Seeker IV', description: 'Complete 75 S-Rank Quests.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 75, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.S }, rewardCoins: 850 },
    'q_s_100': { id: 'q_s_100', name: 'Pinnacle Seeker V', description: 'Complete 100 S-Rank Quests.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.S }, rewardCoins: 1250 },

    // S+ Rank Quests
    'q_sp_10': { id: 'q_sp_10', name: 'Unyielding Monarch I', description: 'Complete 10 S+-Rank Quests.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.S_PLUS }, rewardCoins: 150 },
    'q_sp_25': { id: 'q_sp_25', name: 'Unyielding Monarch II', description: 'Complete 25 S+-Rank Quests.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 25, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.S_PLUS }, rewardCoins: 300 },
    'q_sp_50': { id: 'q_sp_50', name: 'Unyielding Monarch III', description: 'Complete 50 S+-Rank Quests.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.S_PLUS }, rewardCoins: 500 },
    'q_sp_75': { id: 'q_sp_75', name: 'Unyielding Monarch IV', description: 'Complete 75 S+-Rank Quests.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 75, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.S_PLUS }, rewardCoins: 1000 },
    'q_sp_100': { id: 'q_sp_100', name: 'Unyielding Monarch V', description: 'Complete 100 S+-Rank Quests.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.S_PLUS }, rewardCoins: 1500 },

    // Dungeons Total
    'd_total_10': { id: 'd_total_10', name: 'Gate Breaker I', description: 'Complete 10 Dungeons.', rank: Difficulty.D, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'CLEAR_DUNGEON', rewardCoins: 250 },
    'd_total_30': { id: 'd_total_30', name: 'Gate Breaker II', description: 'Complete 30 Dungeons.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 30, type: 'CLEAR_DUNGEON', rewardCoins: 450 },
    'd_total_50': { id: 'd_total_50', name: 'Gate Breaker III', description: 'Complete 50 Dungeons.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'CLEAR_DUNGEON', rewardCoins: 700 },
    'd_total_100': { id: 'd_total_100', name: 'Gate Breaker IV', description: 'Complete 100 Dungeons.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'CLEAR_DUNGEON', rewardCoins: 1200 },

    // A Rank Dungeons
    'd_a_10': { id: 'd_a_10', name: 'Expert Raider I', description: 'Complete 10 A-Rank Dungeons.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'CLEAR_DUNGEON', meta: { grade: Difficulty.A }, rewardCoins: 200 },
    'd_a_30': { id: 'd_a_30', name: 'Expert Raider II', description: 'Complete 30 A-Rank Dungeons.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 30, type: 'CLEAR_DUNGEON', meta: { grade: Difficulty.A }, rewardCoins: 450 },
    'd_a_50': { id: 'd_a_50', name: 'Expert Raider III', description: 'Complete 50 A-Rank Dungeons.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'CLEAR_DUNGEON', meta: { grade: Difficulty.A }, rewardCoins: 850 },

    // S Rank Dungeons
    'd_s_5': { id: 'd_s_5', name: 'Legendary Hunter I', description: 'Complete 5 S-Rank Dungeons.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 5, type: 'CLEAR_DUNGEON', meta: { grade: Difficulty.S }, rewardCoins: 300 },
    'd_s_10': { id: 'd_s_10', name: 'Legendary Hunter II', description: 'Complete 10 S-Rank Dungeons.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'CLEAR_DUNGEON', meta: { grade: Difficulty.S }, rewardCoins: 700 },
    'd_s_25': { id: 'd_s_25', name: 'Legendary Hunter III', description: 'Complete 25 S-Rank Dungeons.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 25, type: 'CLEAR_DUNGEON', meta: { grade: Difficulty.S }, rewardCoins: 1000 },

    // Weapon Ownership
    'own_s_1': { id: 'own_s_1', name: 'Elite Arsenal I', description: 'Own one S-Grade Weapon.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 1, type: 'OWN_GEAR', meta: { grade: Difficulty.S }, rewardCoins: 150 },
    'own_s_3': { id: 'own_s_3', name: 'Elite Arsenal II', description: 'Own three S-Grade Weapons.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 3, type: 'OWN_GEAR', meta: { grade: Difficulty.S }, rewardCoins: 500 },
    'own_sp_1': { id: 'own_sp_1', name: 'Aura', description: 'Own one S+-Grade Weapon.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 1, type: 'OWN_GEAR', meta: { grade: Difficulty.S_PLUS }, rewardCoins: 250 },
    'own_x_1': { id: 'own_x_1', name: 'Cursed Relic', description: 'Own one X-Grade Weapon.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 1, type: 'OWN_GEAR', meta: { grade: Difficulty.X }, rewardCoins: 250 },

    // Advancement Weapons
    'adv_gear_3': { id: 'adv_gear_3', name: 'Blacksmith Novice', description: 'Advance Weapons 3 times.', rank: Difficulty.D, isUnlocked: false, unlockDate: null, progress: 0, goal: 3, type: 'ADVANCE_GEAR', rewardCoins: 500 },
    'adv_gear_5': { id: 'adv_gear_5', name: 'Blacksmith Apprentice', description: 'Advance Weapons 5 times.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 5, type: 'ADVANCE_GEAR', rewardCoins: 1000 },
    'adv_gear_10': { id: 'adv_gear_10', name: 'Skilled Artisan', description: 'Advance Weapons 10 times.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'ADVANCE_GEAR', rewardCoins: 2000 },
    'adv_gear_25': { id: 'adv_gear_25', name: 'Master Craftsman', description: 'Advance Weapons 25 times.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 25, type: 'ADVANCE_GEAR', rewardCoins: 3550 },
    'adv_gear_50': { id: 'adv_gear_50', name: 'Legendary Smith', description: 'Advance Weapons 50 times.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'ADVANCE_GEAR', rewardCoins: 5000 },

    // Skill Training
    'train_skill_10': { id: 'train_skill_10', name: 'Novice Monk I', description: 'Train Skills 10 times.', rank: Difficulty.E, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'TRAIN_SKILL', rewardCoins: 30 },
    'train_skill_50': { id: 'train_skill_50', name: 'Novice Monk II', description: 'Train Skills 50 times.', rank: Difficulty.D, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'TRAIN_SKILL', rewardCoins: 50 },
    'train_skill_100': { id: 'train_skill_100', name: 'Focused Soul I', description: 'Train Skills 100 times.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'TRAIN_SKILL', rewardCoins: 150 },
    'train_skill_200': { id: 'train_skill_200', name: 'Focused Soul II', description: 'Train Skills 200 times.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 200, type: 'TRAIN_SKILL', rewardCoins: 250 },
    'train_skill_350': { id: 'train_skill_350', name: 'Meditation Master I', description: 'Train Skills 350 times.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 350, type: 'TRAIN_SKILL', rewardCoins: 550 },
    'train_skill_500': { id: 'train_skill_500', name: 'Meditation Master II', description: 'Train Skills 500 times.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 500, type: 'TRAIN_SKILL', rewardCoins: 750 },
    'train_skill_1000': { id: 'train_skill_1000', name: 'Enlightened One', description: 'Train Skills 1000 times.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 1000, type: 'TRAIN_SKILL', rewardCoins: 1000 },

    // Skill Advancement (Ascension)
    'adv_skill_5': { id: 'adv_skill_5', name: 'Breaking Limits I', description: 'Advance Skills 5 times.', rank: Difficulty.D, isUnlocked: false, unlockDate: null, progress: 0, goal: 5, type: 'ADVANCE_SKILL', rewardCoins: 250 },
    'adv_skill_25': { id: 'adv_skill_25', name: 'Breaking Limits II', description: 'Advance Skills 25 times.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 25, type: 'ADVANCE_SKILL', rewardCoins: 550 },
    'adv_skill_50': { id: 'adv_skill_50', name: 'Breaking Limits III', description: 'Advance Skills 50 times.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'ADVANCE_SKILL', rewardCoins: 1250 },
    'adv_skill_100': { id: 'adv_skill_100', name: 'Breaking Limits IV', description: 'Advance Skills 100 times.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'ADVANCE_SKILL', rewardCoins: 2350 },
    'adv_skill_250': { id: 'adv_skill_250', name: 'Breaking Limits V', description: 'Advance Skills 250 times.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 250, type: 'ADVANCE_SKILL', rewardCoins: 3850 },
    'adv_skill_500': { id: 'adv_skill_500', name: 'Transcendent Entity', description: 'Advance Skills 500 times.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 500, type: 'ADVANCE_SKILL', rewardCoins: 1250 },
}; 

export const SYSTEM_QUESTS: Quest[] = [
    // E Rank
    { id: 'sys_e_01', name: 'WALKING', difficulty: Difficulty.E, attributes: [Attribute.Endurance], description: "THE START OF A JOURNEY.", type: 'repetitive', isSystemQuest: true },
    { id: 'sys_e_02', name: 'WARM UP', difficulty: Difficulty.E, attributes: [Attribute.Endurance], description: "5-10 MINUTES OF WARM UP TO PREPARE FOR THE FIGHTS AHEAD.", type: 'repetitive', isSystemQuest: true },
    // D Rank
    { id: 'sys_d_01', name: '15 PUSH UPS', difficulty: Difficulty.D, attributes: [Attribute.Strength], description: "COMPLETE 15 PUSH UPS IN GOOD FORM.", type: 'repetitive', isSystemQuest: true },
    { id: 'sys_d_02', name: 'DEAD HANG 30SEC', difficulty: Difficulty.D, attributes: [Attribute.Endurance], description: "HOLD THE DEAD HANG FOR 30 SECONDS.", type: 'repetitive', isSystemQuest: true },
    { id: 'sys_d_03', name: 'CRUNCHES 25', difficulty: Difficulty.D, attributes: [Attribute.Strength], description: "PERFORM 25 ABDOMINAL CRUNCHES.", type: 'repetitive', isSystemQuest: true },
    // C Rank
    { id: 'sys_c_01', name: 'PUSH UPS 25', difficulty: Difficulty.C, attributes: [Attribute.Strength], description: "COMPLETE 25 PUSH UPS IN GOOD FORM.", type: 'repetitive', isSystemQuest: true },
    { id: 'sys_c_02', name: 'PULL UPS 10', difficulty: Difficulty.C, attributes: [Attribute.Strength], description: "COMPLETE 10 PULL UPS.", type: 'repetitive', isSystemQuest: true },
    { id: 'sys_c_03', name: 'PLANK 60 SEC', difficulty: Difficulty.C, attributes: [Attribute.Endurance, Attribute.Strength], description: "HOLD PLANK FOR 60 SECONDS.", type: 'repetitive', isSystemQuest: true },
    { id: 'sys_c_04', name: 'SQUATS 20', difficulty: Difficulty.C, attributes: [Attribute.Strength], description: "PERFORM 20 SQUATS.", type: 'repetitive', isSystemQuest: true },
    // B Rank
    { id: 'sys_b_01', name: '1KM RUN', difficulty: Difficulty.B, attributes: [Attribute.Endurance], description: "COMPLETE A 1 KILOMETER RUN.", type: 'repetitive', isSystemQuest: true },
    { id: 'sys_b_02', name: 'STUDY 1HR', difficulty: Difficulty.B, attributes: [Attribute.Intellect], description: "SEEK KNOWLEDGE OF ANY KIND FOR AN HOUR.", type: 'repetitive', isSystemQuest: true },
    // A Rank
    { id: 'sys_a_01', name: 'PUSH UPS 50', difficulty: Difficulty.A, attributes: [Attribute.Strength], description: "COMPLETE 50 PUSH UPS IN GOOD FORM.", type: 'repetitive', isSystemQuest: true },
    { id: 'sys_a_02', name: 'SQUATS 50', difficulty: Difficulty.A, attributes: [Attribute.Strength], description: "PERFORM 50 SQUATS.", type: 'repetitive', isSystemQuest: true },
    { id: 'sys_a_03', name: '40 BURPEES', difficulty: Difficulty.A, attributes: [Attribute.Strength], description: "PERFORM 40 BURPEES.", type: 'repetitive', isSystemQuest: true },
    // S Rank
    { id: 'sys_s_01', name: 'RUNNING 3K', difficulty: Difficulty.S, attributes: [Attribute.Endurance], description: "COMPLETE A 3 KILOMETER RUN.", type: 'repetitive', isSystemQuest: true },
    // S_PLUS Rank
    { id: 'sys_sp_01', name: 'RUNNING 5K', difficulty: Difficulty.S_PLUS, attributes: [Attribute.Endurance], description: "COMPLETE A 5 KILOMETER RUN.", type: 'repetitive', isSystemQuest: true },
    // Special Rank
    { id: 'sys_x_01', name: 'SLOTH-GLUTTONY', difficulty: Difficulty.X, attributes: [], description: "An uncontrollable temptation boils within. You can only succumb to it. There is no victory, only the aftermath.", failurePenalty: { xp: 250 }, type: 'repetitive', isSystemQuest: true },
];

export const TRAINING_PER_HALF_STAR: Record<Difficulty, number> = { [Difficulty.E]: 3, [Difficulty.D]: 4, [Difficulty.C]: 5, [Difficulty.B]: 8, [Difficulty.A]: 12, [Difficulty.S]: 20, [Difficulty.S_PLUS]: 30, [Difficulty.X]: 999 };
export const SKILL_UNLOCK_REQUIREMENTS: Record<Difficulty, number> = { [Difficulty.E]: 8, [Difficulty.D]: 10, [Difficulty.C]: 12, [Difficulty.B]: 15, [Difficulty.A]: 20, [Difficulty.S]: 30, [Difficulty.S_PLUS]: 50, [Difficulty.X]: 999 };
export const XP_FOR_SKILL_UNLOCK: Record<Difficulty, number> = { [Difficulty.E]: 50, [Difficulty.D]: 80, [Difficulty.C]: 120, [Difficulty.B]: 150, [Difficulty.A]: 250, [Difficulty.S]: 500, [Difficulty.S_PLUS]: 750, [Difficulty.X]: 0 };
export const XP_FOR_SKILL_ASCENSION: Record<Difficulty, number> = { [Difficulty.E]: 10, [Difficulty.D]: 12, [Difficulty.C]: 15, [Difficulty.B]: 22, [Difficulty.A]: 35, [Difficulty.S]: 50, [Difficulty.S_PLUS]: 0, [Difficulty.X]: 0 };

// --- MISSING CONSTANTS FOR DAILY QUESTS AND SAGAS ---

export const DAILY_XP_GOAL = 100;
export const DAILY_QUEST_PENALTY = 50;
export const STREAK_BONUS_XP = 20;

export const SAGAS: Saga[] = [];
