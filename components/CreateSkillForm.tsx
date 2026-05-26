
import React, { useState, useMemo } from 'react';
import { Difficulty, Skill, SkillPrerequisite, SkillFolder, SkillCategory } from '../types';

interface CreateSkillFormProps { 
    addSkill: (name: string, grade: Difficulty, stars: number, status: 'locked' | 'unlocked', category: string, description: string, guide: string, prerequisites: SkillPrerequisite[], folderId?: string) => void;
    skills: Skill[];
    skillFolders: SkillFolder[];
    categories: SkillCategory[];
}

const difficultyStyles: Record<Difficulty, { border: string; text: string; }> = {
  [Difficulty.E]: { border: 'border-gray-500', text: 'text-gray-300' },
  [Difficulty.D]: { border: 'border-green-600', text: 'text-green-300' },
  [Difficulty.C]: { border: 'border-orange-600', text: 'text-orange-300' },
  [Difficulty.B]: { border: 'border-indigo-600', text: 'text-indigo-300' },
  [Difficulty.A]: { border: 'border-purple-600', text: 'text-purple-300' },
  [Difficulty.S]: { border: 'border-yellow-600', text: 'text-yellow-300' },
  [Difficulty.S_PLUS]: { border: 'border-red-600', text: 'text-red-300' },
  [Difficulty.X]: { border: 'border-red-900', text: 'text-red-400' },
};

const SKILL_UNLOCK_REQUIREMENTS: Record<Difficulty, number> = {
  [Difficulty.E]: 10, [Difficulty.D]: 12, [Difficulty.C]: 15, [Difficulty.B]: 20, [Difficulty.A]: 30, [Difficulty.S]: 50,
  [Difficulty.S_PLUS]: 75,
  [Difficulty.X]: 999,
};

const CreateSkillForm: React.FC<CreateSkillFormProps> = ({ addSkill, skills, skillFolders, categories }) => {
  const [name, setName] = useState(''); const [category, setCategory] = useState(''); const [grade, setGrade] = useState<Difficulty>(Difficulty.E); const [status, setStatus] = useState<'unlocked' | 'locked'>('unlocked');
  const [description, setDescription] = useState(''); const [guide, setGuide] = useState('');
  const [prerequisites, setPrerequisites] = useState<SkillPrerequisite[]>([]);
  const [selectedPrereq, setSelectedPrereq] = useState<string>('');
  const [requiredStars, setRequiredStars] = useState(1);
  const [folderId, setFolderId] = useState<string>('');
  
  const handleAddPrerequisite = () => {
      if (selectedPrereq && !prerequisites.some(p => p.skillId === selectedPrereq)) {
          setPrerequisites([...prerequisites, { skillId: selectedPrereq, requiredStars }]);
          setSelectedPrereq('');
          setRequiredStars(1);
      }
  };

  const handleRemovePrerequisite = (skillId: string) => {
      setPrerequisites(prerequisites.filter(p => p.skillId !== skillId));
  };
  
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (name.trim()) { addSkill(name.trim(), grade, 0, status, category.trim(), description.trim(), guide.trim(), prerequisites, folderId || undefined); setName(''); setCategory(''); setGrade(Difficulty.E); setStatus('unlocked'); setDescription(''); setGuide(''); setPrerequisites([]); setFolderId(''); } };
  
  const availableSkillsForPrereq = skills.filter(s => !prerequisites.some(p => p.skillId === s.id));

  const availableFolders = useMemo(() => {
    if (!category.trim()) return [];
    return skillFolders.filter(f => f.category.toLowerCase() === category.trim().toLowerCase());
  }, [category, skillFolders]);
  
  const isFormInvalid = !name.trim() || !category.trim() || !folderId;


  return (<form onSubmit={handleSubmit} className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-bold text-gray-300 mb-1">Skill Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter skill name" className="w-full bg-gray-900/70 border-2 border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" /></div>
  <div>
    <label className="block text-sm font-bold text-gray-300 mb-1">Category</label>
    <input 
      type="text" 
      value={category} 
      onChange={e => {
          setCategory(e.target.value);
          setFolderId(''); // Reset folder when category changes
      }} 
      placeholder="e.g. Physical, Mental" 
      className="w-full bg-gray-900/70 border-2 border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      list="category-suggestions"
    />
    <datalist id="category-suggestions">
      {categories.map(cat => <option key={cat.name} value={cat.name} />)}
    </datalist>
  </div>
   <div>
    <label className="block text-sm font-bold text-gray-300 mb-1">Folder <span className="text-gray-500">(Required)</span></label>
    <select 
      value={folderId} 
      onChange={e => setFolderId(e.target.value)}
      disabled={!category.trim() || availableFolders.length === 0}
      className="w-full bg-gray-900/70 border-2 border-gray-600 rounded-md px-4 py-2 font-orbitron focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
        <option value="">Select a folder...</option>
        {availableFolders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
    </select>
  </div>
  <div><label className="block text-sm font-bold text-gray-300 mb-1">Grade</label><select value={grade} onChange={e => setGrade(e.target.value as Difficulty)} className={`w-full bg-gray-900/70 border-2 rounded-md px-4 py-2 font-orbitron focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${difficultyStyles[grade].border} ${difficultyStyles[grade].text}`}>{Object.values(Difficulty).map(d => <option key={d} value={d}>{d}-Grade</option>)}</select></div><div><label className="block text-sm font-bold text-gray-300 mb-1">Initial Status</label><select value={status} onChange={e => setStatus(e.target.value as 'unlocked' | 'locked')} className="w-full bg-gray-900/70 border-2 border-gray-600 rounded-md px-4 py-2 font-orbitron focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"><option value="unlocked">Unlocked</option><option value="locked">Locked</option></select></div></div><div><label className="block text-sm font-bold text-gray-300 mb-1">Description <span className="text-gray-500">(Optional)</span></label><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this skill about?" rows={2} className="w-full bg-gray-900/70 border-2 border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"></textarea></div><div><label className="block text-sm font-bold text-gray-300 mb-1">Guide <span className="text-gray-500">(Optional)</span></label><textarea value={guide} onChange={e => setGuide(e.target.value)} placeholder="How to train this skill? Add notes, links, etc." rows={4} className="w-full bg-gray-900/70 border-2 border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"></textarea></div>
    <div className="border-t border-blue-500/30 pt-4 space-y-3">
        <label className="block text-sm font-bold text-gray-300">Prerequisites <span className="text-gray-500">(Optional)</span></label>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-end">
            <select value={selectedPrereq} onChange={e => setSelectedPrereq(e.target.value)} className="w-full bg-gray-800/70 border-2 border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                <option value="">Select a skill...</option>
                {availableSkillsForPrereq.map(s => <option key={s.id} value={s.id}>[{s.grade}] {s.name}</option>)}
            </select>
            <input 
                type="number"
                value={requiredStars}
                onChange={e => setRequiredStars(Number(e.target.value))}
                min="1" max="24.5" step="0.5"
                className="bg-gray-800/70 border-2 border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-24 text-center"
                aria-label="Required stars"
            />
            <button type="button" onClick={handleAddPrerequisite} className="font-orbitron bg-gray-600 text-white px-4 py-2 rounded-md font-bold tracking-wider hover:bg-gray-500 transition-all duration-300 h-full">Add</button>
        </div>
        {prerequisites.length > 0 && (
            <div className="space-y-1 pt-2">
                {prerequisites.map(p => {
                    const skill = skills.find(s => s.id === p.skillId);
                    return (<div key={p.skillId} className="flex justify-between items-center bg-gray-900/50 p-2 rounded-md border border-gray-700">
                        <span className="text-sm">Requires <span className="font-bold text-blue-300">"{skill?.name}"</span> at <span className="font-bold text-yellow-300">{p.requiredStars} total stars</span></span>
                        <button type="button" onClick={() => handleRemovePrerequisite(p.skillId)} className="text-red-500 hover:text-red-400">&times;</button>
                    </div>)
                })}
            </div>
        )}
    </div>
    {status === 'locked' && (<div className="mt-3 text-sm text-gray-400 bg-gray-900/50 p-2 rounded-md border border-gray-700"><p className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg><span>An <strong className={`${difficultyStyles[grade].text} font-bold`}>{grade}-Grade</strong> locked skill requires <strong className="text-yellow-300 font-orbitron">{SKILL_UNLOCK_REQUIREMENTS[grade]}</strong> training sessions to unlock.</span></p></div>)}
    <div className="pt-4 flex flex-col items-end">
        <button type="submit" disabled={isFormInvalid} className="font-orbitron bg-blue-600 text-white px-8 py-2 rounded-md uppercase font-bold tracking-wider transition-all duration-300 shadow-md enabled:hover:bg-blue-500 enabled:hover:shadow-lg enabled:hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-600 disabled:cursor-not-allowed">Add Skill</button>
        {isFormInvalid && <p className="text-xs text-gray-400 mt-2">A skill name, category, and folder are required.</p>}
    </div>
    </form>);
};

export default CreateSkillForm;
