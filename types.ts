
export enum Difficulty {
  E = 'E',
  D = 'D',
  C = 'C',
  B = 'B',
  A = 'A',
  S = 'S',
  S_PLUS = 'S+',
  X = 'X',
}

export enum Rank {
  E = 'E',
  D = 'D',
  C = 'C',
  B = 'B',
  A = 'A',
  S = 'S',
}

export enum Attribute {
  Intellect = 'Intellect',
  Strength = 'Strength',
  Agility = 'Agility',
  Endurance = 'Endurance',
  Perception = 'Perception',
}

export interface PlayerAttributes {
  [Attribute.Intellect]: number;
  [Attribute.Strength]: number;
  [Attribute.Agility]: number;
  [Attribute.Endurance]: number;
  [Attribute.Perception]: number;
}

export interface Quest {
  id: string;
  name: string;
  description?: string;
  difficulty: Difficulty;
  type: 'repetitive' | 'one-time';
  attributes: Attribute[];
  isSystemQuest?: boolean;
  failurePenalty?: {
    xp: number;
  };
  potentialDrops?: string; // Added to describe drops in UI
}

export interface CompletedQuest extends Quest {
  completedAt: string;
  completionId: string;
}

export interface SkillPrerequisite {
  skillId: string;
  requiredStars: number;
}

export interface SkillFolder {
  id: string;
  name: string;
  category: string;
  icon?: string;
}

export interface SkillCategory {
  name: string;
  icon: string;
}

export interface Skill {
  id: string;
  name: string;
  description?: string;
  guide?: string;
  grade: Difficulty;
  originalGrade: Difficulty; // Used for progression rules
  stars: number;
  starProgress: number;
  status: 'locked' | 'unlocked';
  unlockProgress: number;
  category?: string;
  folderId?: string;
  prerequisites?: SkillPrerequisite[];
  masteryLevel?: number; // 0: White, 1: Blue, 2: Purple, 3: Gold, 4: Red
  dailyTraining?: { date: string; count: number }; // Added to track daily limit
}

export interface Player {
  name: string;
  level: number;
  xp: number;
  rank: Rank;
  attributes: PlayerAttributes;
  shopCoins: number;
  unlockedTitles: string[];
  equippedTitle: string | null;
}

export interface DungeonFloor {
    id: string;
    name: string;
    tasks: DungeonTask[];
}

export interface DungeonTask {
    id: string;
    description: string;
    attribute?: Attribute;
    page: {
        title: string;
        narrative: string;
    };
}

export interface Dungeon {
    id:string;
    name: string;
    grade: Difficulty;
    description: string;
    type?: 'standard' | 'temptation';
    timeLimit?: number;
    floors: DungeonFloor[];
    rewards?: {
        xp: number;
        coins?: number;
    };
    failurePenalty?: {
        xp: number;
    };
}

export interface ActiveDungeonState {
    id: string;
    dungeonId: string;
    startedAt: number;
    currentFloorIndex: number;
    currentTaskIndex: number;
    taskStatus: Record<string, boolean>;
}

export interface DungeonCooldown {
    readyAt: number; // Timestamp when dungeon becomes available again
    status: 'cleared' | 'failed';
}

export interface DungeonHistoryEntry {
    id: string;
    name: string;
    grade: Difficulty;
    completedAt: number;
    status: 'cleared' | 'failed';
}

export type EquipmentSlot = 'helmet' | 'armor' | 'gloves' | 'boots' | 'gear';

export interface ShopItem {
  id: string;
  name: string;
  type: 'Gear' | 'Potion';
  slot?: EquipmentSlot;
  rank: Difficulty;
  bonusXp?: number;
  effectDescription: string;
  cost: number;
  // Enhancement stats
  enhancementLevel?: number; // 0-5
  stars?: number; 
  unlockedTraits?: number[]; // list of XP bonuses from stars
}

export interface MaterialItem {
    id: string;
    name: string;
    count: number;
    rank: Difficulty;
}

export interface Inventory {
    equipment: {
        helmet: ShopItem | null;
        armor: ShopItem | null;
        gloves: ShopItem | null;
        boots: ShopItem | null;
        gear: ShopItem | null;
    };
    storage: ShopItem[];
    materials: MaterialItem[];
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    rank: Difficulty;
    isUnlocked: boolean;
    unlockDate: number | null;
    progress: number;
    goal: number;
    nextTierId?: string; 
    titleReward?: string;
    rewardCoins: number;
    type: 'COMPLETE_QUEST' | 'CLEAR_DUNGEON' | 'TRAIN_SKILL' | 'MASTER_SKILL' | 'REACH_LEVEL' | 'OWN_GEAR' | 'ADVANCE_GEAR' | 'ADVANCE_SKILL';
    meta?: {
        difficulty?: Difficulty;
        grade?: Difficulty;
    };
}

export interface Title {
    id: string;
    name: string;
    rank: Difficulty;
}

export interface PlannerItem {
  id: string;
  text: string;
  completed: boolean;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type WeeklyPlan = Record<DayOfWeek, PlannerItem[]>;

export interface SystemNotification {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'danger' | 'info' | 'warning' | 'achievement' | 'level_up';
}

export type Page = 'menu' | 'status' | 'stats' | 'quests' | 'add-quest' | 'history' | 'skills' | 'add-skill' | 'dungeons' | 'task-list' | 'achievements' | 'shop' | 'inventory' | 'workshop' | 'codex' | 'report';

export type PlayerDataEvent =
    | { type: 'xp_gain'; amount: number; source: string; }
    | { type: 'stats_gain'; gains: { attribute: Attribute; amount: number }[]; }
    | { type: 'achievement_unlocked'; achievement: Achievement; }
    | { type: 'dungeon_cleared'; name: string; rewards: { xp: number; coins?: number }; drops?: string[]; }
    | { type: 'skill_ascended'; skillName: string; newGrade: Difficulty; newMasteryLevel: number; }
    | { type: 'quest_started'; name: string; difficulty: Difficulty; }
    | { type: 'quest_attempted'; name: string; difficulty: Difficulty; }
    | { type: 'quest_cleared'; name: string; difficulty: Difficulty; rewards: { xp: number; coins?: number }; }
    | { type: 'dungeon_started'; name: string; grade: Difficulty; }
    | { type: 'level_up'; level: number; rank: Rank; };

export interface PlayerDataState {
  dataVersion?: number;
  player: Player;
  quests: Quest[];
  completedQuests: CompletedQuest[];
  skills: Skill[];
  skillFolders: SkillFolder[];
  categories: SkillCategory[];
  activeDungeon: ActiveDungeonState | null;
  dungeonCooldowns: Record<string, DungeonCooldown>; 
  dungeonHistory: DungeonHistoryEntry[];
  achievements: Record<string, Achievement>;
  inventory: Inventory;
  weeklyPlan: WeeklyPlan;
  events: PlayerDataEvent[];
  notifications: SystemNotification[];
}

// Added missing Saga and Spiritual Realm types
export interface Saga {
    id: string;
    name: string;
    grade: Difficulty;
    description: string;
    endDate: number;
    maxDisciplineFailures: number;
}

export interface ActiveSaga {
    sagaId: string;
    disciplineFailures: number;
}

export interface SpiritualTask {
    id: string;
    name: string;
    type: 'mandatory' | 'obligatory';
    reward: {
        xp: number;
        deen: number;
    };
}

export interface SpiritualRealmState {
    deen: number;
    tasks: SpiritualTask[];
}
