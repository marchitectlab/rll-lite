
import React, { useState, useRef } from 'react';
import { XP_PER_DIFFICULTY, QUEST_COIN_REWARDS } from '../constants';
import { Rank, Difficulty } from '../types';

interface CodexProps {
  onOpenExport: () => void;
  onOpenImport: (json: string) => void;
  onSetBackground: (url: string | null) => void;
  background: string | null;
  onNavigateToReport: () => void;
}

const BackgroundUploader: React.FC<{
    background: string | null;
    onSetBackground: (url: string | null) => void;
}> = ({ background, onSetBackground }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert("Image size should be less than 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                onSetBackground(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp, image/gif"
            />
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-orbitron bg-blue-600 text-white px-6 py-2 rounded-md uppercase font-bold tracking-wider hover:bg-blue-500 transition-all duration-300"
                >
                    Upload Background
                </button>
                {background && (
                    <button
                        type="button"
                        onClick={() => onSetBackground(null)}
                        className="font-orbitron bg-gray-600 text-white px-6 py-2 rounded-md uppercase font-bold tracking-wider hover:bg-gray-500 transition-all duration-300"
                    >
                        Clear Background
                    </button>
                )}
            </div>
            {background && <img src={background} alt="Background preview" className="mt-4 rounded-md max-w-xs max-h-48 object-cover" />}
        </div>
    );
};

const ImportDataButton: React.FC<{ onImport: (json: string) => void }> = ({ onImport }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result;
                if (typeof content === 'string') {
                    onImport(content);
                }
            };
            reader.readAsText(file);
        }
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
            <button onClick={() => fileInputRef.current?.click()} className="font-orbitron bg-red-600 text-white px-6 py-2 rounded-md uppercase font-bold tracking-wider hover:bg-red-500 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-red-500/50">Import Progress</button>
        </>
    );
};

const rankColorInfo: Record<string, string> = {
    [Rank.E]: 'text-gray-400',
    [Rank.D]: 'text-green-400',
    [Rank.C]: 'text-blue-400',
    [Rank.B]: 'text-indigo-400',
    [Rank.A]: 'text-purple-400',
    [Rank.S]: 'text-yellow-400',
    [Difficulty.S_PLUS]: 'text-red-400',
    [Difficulty.X]: 'text-red-700',
};

const codexData = {
    ranks: {
        title: "Ranks",
        entries: {
            [Rank.E]: { title: "E-Rank", content: `The rank of 'E' is the starting point for all users, granted upon reaching Level 1. It represents the first step on a long journey—a commitment to change and growth. Every legend has a beginning; this is yours.` },
            [Rank.D]: { title: "D-Rank", content: `Achieving 'D'-Rank at Level 11 signifies that you have surpassed the initial hurdles and are demonstrating above-average dedication. You are no longer a beginner but a promising individual on the path to greatness.` },
            [Rank.C]: { title: "C-Rank", content: `The rank of 'C', earned at Level 26, is the hallmark of a truly consistent user. You have established routines and discipline, setting a standard that many aspire to but few achieve. You are the dependable average, the solid core of the System.` },
            [Rank.B]: { title: "B-Rank", content: `Reaching 'B'-Rank at Level 51 is a testament to your unyielding spirit. You have faced challenges that would make others quit, yet you persevered. This rank symbolizes a refusal to give up and the tenacity required for true strength.` },
            [Rank.A]: { title: "A-Rank", content: `An 'A'-Rank user, having reached Level 76, possesses a bulletproof mindset. You are not deterred by setbacks; you see them as opportunities. Your mental fortitude is as honed as your skills, making you a formidable force within the System.` },
            [Rank.S]: { title: "S-Rank", content: `The 'S'-Rank, achieved at Level 100, is reserved for the elite. It is the pinnacle of achievement, earned through unparalleled consistency, ironclad discipline, and immense sacrifice. To be S-Rank is to embody the very ideals of the System.` },
        }
    },
    quests: {
        title: "Quests",
        entries: {
            difficulty: { title: "Difficulty & Rewards", content: "Quests are assigned a difficulty grade from E to S+. The XP and Shop Coin rewards are directly tied to this grade. Higher difficulty quests demand more effort but yield greater rewards, accelerating your progress.", table: Object.entries(XP_PER_DIFFICULTY).filter(([d, xp]) => d !== 'X').map(([d, xp]) => ({ grade: d as Difficulty, xp: `${xp} XP`, coins: `${QUEST_COIN_REWARDS[d as Difficulty]} Coins` })) },
            drops: { 
                title: "Material Drops", 
                content: "Quests of B-Rank and higher now grant a chance to acquire rare materials upon completion.\n\n" +
                "- **[B-Rank]:** 5% chance for Copper/Iron (1-3).\n" +
                "- **[A-Rank]:** 10% chance for Copper/Iron (1-5), 7% chance for Aluminium/Beast Fangs (1-3).\n" +
                "- **[S-Rank]:** 30% chance for Copper/Iron (5-15), 20% for Aluminium/Beast Fangs (2-8), 5% for Diamonds/Shards (3-5), 1% for Bloodstones (1-2).\n" +
                "- **[S+-Rank]:** 80% chance for Copper/Iron (20-30), 50% for Aluminium/Beast Fangs (5-15), 30% for Diamonds/Shards (3-10), and a GUARANTEED 100% drop of Bloodstones (1-3)."
            },
            types: { title: "Quest Types", content: `- **Repetitive:** Standard quests that can be completed any number of times.\n- **Round-Based:** Structured quests with built-in timers for focus periods (rounds) and breaks (intervals). Ideal for workouts or any task requiring structured time management.` },
        }
    },
    workshop: {
        title: "Workshop",
        entries: {
            enhancement: { title: "Enhancement Lab", content: "Items acquired from the Shop can be enhanced to increase their effectiveness.\n\n- **Levels:** Gear can be enhanced from Level 0 to 5.\n- **Materials:** Enhancement requires Copper, Iron, or rarer materials depending on the item's grade.\n- **Success:** Enhancement is guaranteed as long as materials are provided." },
            advancement: { title: "Star Ascension", content: "Once a piece of gear reaches Enhancement Level 5, it can 'Advance' to a new Star Tier.\n\n- **Reset:** Advancement resets Enhancement Level to 0 but increases the Star count.\n- **Trait Unlock:** Every new star unlocks a permanent passive XP bonus (Trait).\n- **Limit:** B-Grade items cap at 2 stars, A-Grade at 3 stars, and S-Grade+ at 5 stars.\n- **Cost:** Higher star advancements require Diamonds and substantial Shop Coins." },
        }
    },
    gear_bonuses: {
        title: "Gear Scaling",
        entries: {
            rules: { 
                title: "Bonus Scaling Logic", 
                content: "Gear bonuses are not flat. They scale based on the difficulty of the quest or gate you are attempting.\n\n- **Rank Lock:** Gear only provides bonuses for content of its own rank or higher. (e.g., C-Rank gear gives 0 bonus on D-Rank quests).\n- **Scaling:** High-grade gear provides exponentially more bonus XP on S-Rank and S+ Rank content.\n- **Traits:** Bonus XP from Advancement Stars is added on top of the base scaling bonus for B-Rank quests and above." 
            },
            grades: {
                title: "GEAR XP BONUSES",
                content: "Detailed breakdown of gear performance across all tiers. 'Initial' represents the base XP bonus at +0. Stars represent the additional permanent XP traits unlocked via Ascension in the Workshop.",
                gearTable: [
                    { grade: Difficulty.C, initial: "1 XP", stars: "N/A", total: "1 XP" },
                    { grade: Difficulty.B, initial: "2 XP", stars: "+1, +1", total: "4 XP" },
                    { grade: Difficulty.A, initial: "3-5 XP", stars: "+2, +3, +5", total: "13-15 XP" },
                    { grade: Difficulty.S, initial: "3-15 XP", stars: "+3, +3, +3, +5, +10", total: "27-39 XP" },
                    { grade: Difficulty.S_PLUS, initial: "1-50 XP", stars: "+5, +5, +8, +10, +15", total: "93 XP" },
                    { grade: Difficulty.X, initial: "CURSED -1500-100", stars: "+10, +10, +10, +10, +10", total: "150" },
                ]
            },
            cursed: { 
                title: "CURSED GEAR", 
                content: "Artifacts like the Berserker Armor (X-Rank) provide massive bonuses but carry heavy penalties. They cannot be unequipped normally and require a 'Brilliant Light Orb' to be purged." 
            }
        }
    },
    dungeons: {
        title: "Dungeons",
        entries: {
            loot: { 
                title: "Dungeon Drop Tables", 
                content: "Clearing Gates is the only way to acquire raw materials for the Workshop.\n\n- **C-Rank:** Copper, Iron.\n- **B-Rank:** Copper, Iron, Aluminium, Beast Fangs (Rare).\n- **A-Rank:** Aluminium, Beast Fangs, Diamonds (Rare), Brilliant Shards (Very Rare).\n- **S/S+ Rank:** High quantities of all materials + Bloodstones (Legendary)." 
            },
            cooldown: { 
                title: "Rules of Engagement", 
                content: `- **Cooldown:** Each gate can only be attempted once per day.\n- **Failure:** Failing or abandoning a gate mid-run triggers an XP penalty.\n- **Attributes:** Individual tasks within a dungeon grant permanent attribute points upon completion.` 
            },
        }
    },
    skills: {
        title: "Skills",
        entries: {
            mastery: {
                title: "Mastery & Ascension",
                content: `A skill's power is defined by its Grade, Mastery Tier, and Stars.\n\n- **Mastery Tiers:** Stars change color as you ascend (White -> Blue -> Purple -> Gold -> Red).\n- **Grade Promotion:** Reaching 5 stars allows a skill to promote to the next rank (e.g., E -> D).`
            },
        }
    },
    system: {
        title: "System",
        entries: {
            report: { title: "System Reports", content: "Generate visual reports of your progress to track your journey to the pinnacle." },
            data: { title: "Data Management", content: "Export or import your status. Proceed with caution." }
        }
    }
};

type CodexTab = keyof typeof codexData;

export const Codex: React.FC<CodexProps> = ({ onOpenExport, onOpenImport, onSetBackground, background, onNavigateToReport }) => {
    const [activeTab, setActiveTab] = useState<CodexTab>('ranks');
    const [activeEntryKey, setActiveEntryKey] = useState<string>(Object.keys(codexData.ranks.entries)[0]);

    const handleTabClick = (tab: CodexTab) => {
        setActiveTab(tab);
        setActiveEntryKey(Object.keys(codexData[tab].entries)[0]);
    };

    const currentTab = codexData[activeTab];
    const currentEntry = (currentTab.entries as any)[activeEntryKey];
    
    return (
        <div>
            <div className="flex border-b border-blue-500/30 mb-4 overflow-x-auto">
                {Object.keys(codexData).map((tabKey) => {
                    const tab = codexData[tabKey as CodexTab];
                    const isActive = activeTab === tabKey;
                    return (
                        <button
                            key={tabKey}
                            onClick={() => handleTabClick(tabKey as CodexTab)}
                            className={`font-orbitron text-lg px-6 py-2 transition-colors duration-300 border-b-2 flex-shrink-0 ${isActive ? 'text-blue-300 border-blue-400' : 'text-gray-500 border-transparent hover:text-white'}`}
                        >
                            {tab.title}
                        </button>
                    )
                })}
            </div>

            <div className="flex flex-col md:flex-row gap-6 min-h-[50vh]">
                {/* Left Nav */}
                <div className="w-full md:w-1/3 border-r-0 md:border-r border-blue-500/30 pr-0 md:pr-6">
                    <div className="max-h-[50vh] overflow-y-auto pr-2">
                        <ul className="space-y-2">
                            {Object.entries(currentTab.entries).map(([key, entry]) => {
                                 const isActive = activeEntryKey === key;
                                 return (
                                    <li key={key}>
                                        <button onClick={() => setActiveEntryKey(key)} className={`w-full text-left font-orbitron p-3 rounded-md transition-colors duration-200 ${isActive ? 'bg-blue-600/30 text-blue-200' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}>
                                            {(entry as { title: string }).title}
                                        </button>
                                    </li>
                                 )
                            })}
                        </ul>
                    </div>
                </div>

                {/* Right Content */}
                <div className="w-full md:w-2/3 max-h-[50vh] overflow-y-auto pr-2">
                    <h3 className={`font-orbitron text-2xl mb-4 ${rankColorInfo[currentEntry.title.slice(0,1)] || 'text-blue-300'}`}>{currentEntry.title}</h3>
                    <div className="text-gray-300 space-y-4 whitespace-pre-wrap">{currentEntry.content}</div>

                    {currentEntry.table && (
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                            {currentEntry.table.map((row: any) => (
                                <div key={row.grade} className="bg-gray-900/50 p-3 rounded-md border border-gray-700 text-center">
                                    <span className={`font-orbitron font-bold text-lg ${rankColorInfo[row.grade]}`}>[{row.grade}]</span>
                                    <span className="block text-white text-sm">{row.xp}</span>
                                    {row.coins && <span className="block text-yellow-300 text-xs">{row.coins}</span>}
                                </div>
                            ))}
                        </div>
                    )}

                    {currentEntry.gearTable && (
                        <div className="mt-6 overflow-x-auto border border-blue-500/20 rounded-md">
                            <table className="w-full text-left border-collapse text-[10px] sm:text-xs">
                                <thead className="bg-blue-900/40 text-blue-300 font-orbitron uppercase">
                                    <tr>
                                        <th className="p-3 border-r border-blue-500/20">Grade</th>
                                        <th className="p-3 border-r border-blue-500/20">Initial</th>
                                        <th className="p-3 border-r border-blue-500/20 text-center">Star Traits</th>
                                        <th className="p-3">Potential</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentEntry.gearTable.map((row: any) => (
                                        <tr key={row.grade} className="border-t border-blue-500/10 hover:bg-white/5 transition-colors">
                                            <td className={`p-3 border-r border-blue-500/20 font-black font-orbitron text-sm ${rankColorInfo[row.grade]}`}>[{row.grade}]</td>
                                            <td className="p-3 border-r border-blue-500/20 text-gray-200">
                                                {row.initial === "CURSED -1500-100" ? (
                                                    <span>CURSED <span className="text-red-500 font-bold">-1500</span>-100</span>
                                                ) : (
                                                    row.initial
                                                )}
                                            </td>
                                            <td className="p-3 border-r border-blue-500/20 text-cyan-400 font-mono text-center">{row.stars}</td>
                                            <td className="p-3 text-green-400 font-bold">{row.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    {activeEntryKey === 'background' && (
                        <div className="pt-4 mt-4 border-t border-gray-700">
                            <BackgroundUploader background={background} onSetBackground={onSetBackground} />
                        </div>
                    )}

                    {activeEntryKey === 'report' && (
                        <div className="pt-4 mt-4 border-t border-gray-700">
                             <button onClick={onNavigateToReport} className="font-orbitron bg-blue-600 text-white px-6 py-2 rounded-md uppercase font-bold tracking-wider hover:bg-blue-500 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-blue-500/50">Generate System Report</button>
                        </div>
                    )}

                    {activeEntryKey === 'data' && (
                        <div className="flex flex-wrap gap-4 pt-4 mt-4 border-t border-gray-700">
                            <button onClick={onOpenExport} className="font-orbitron bg-blue-600 text-white px-6 py-2 rounded-md uppercase font-bold tracking-wider hover:bg-blue-500 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-blue-500/50">Export Progress</button>
                            <ImportDataButton onImport={onOpenImport} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
