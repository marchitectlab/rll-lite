
import React, { useState } from 'react';
import type { Skill, SkillFolder, SkillCategory, Difficulty, SkillPrerequisite } from '../types';
import { SkillTree } from './SkillTree';
import { IconPicker } from './IconPicker';
import CreateSkillForm from './CreateSkillForm';

interface SkillsPageProps {
  skills: Skill[];
  skillFolders: SkillFolder[];
  categories: SkillCategory[];
  improveSkill: (skillId: string) => void;
  addSkill: (name: string, grade: Difficulty, stars: number, status: 'locked' | 'unlocked', category: string, description: string, guide: string, prerequisites: SkillPrerequisite[], folderId?: string) => void;
  addSkillFolder: (name: string, category: string, icon: string) => void;
  addCategory: (name: string, icon: string) => void;
  onDeleteSkill: (skillId: string) => void;
  onDeleteSkillFolder: (folderId: string) => void;
  onDeleteCategory: (categoryName: string) => void;
}

type View = 'categories' | 'folders' | 'tree' | 'add';

const Breadcrumbs: React.FC<{
    view: View;
    category?: string | null;
    folder?: SkillFolder | null;
    onNavigate: (targetView: View) => void;
}> = ({ view, category, folder, onNavigate }) => {
    if (view === 'categories' && !category && !folder) {
        return <h2 className="font-orbitron text-gray-400 text-lg uppercase font-bold tracking-widest">Skills</h2>;
    }
    return (
        <div className="flex items-center text-sm text-gray-400 mb-4 font-orbitron">
            <button onClick={() => onNavigate('categories')} className="hover:text-white">Skills</button>
            {category && (
                <>
                    <span className="mx-2">/</span>
                    <button onClick={() => onNavigate('folders')} disabled={view === 'folders'} className="hover:text-white disabled:text-blue-300 disabled:cursor-default">{category}</button>
                </>
            )}
            {folder && (
                <>
                    <span className="mx-2">/</span>
                    <span className="text-blue-300">{folder.name}</span>
                </>
            )}
            {view === 'add' && (
                <>
                    <span className="mx-2">/</span>
                    <span className="text-blue-300">Initialise New Entry</span>
                </>
            )}
        </div>
    );
};

const DefaultIconPlaceholder: React.FC<{className?: string, colorClass?: string}> = ({className = 'h-8 w-8', colorClass = 'text-gray-500'}) => (
    <svg className={`${className} ${colorClass}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
    </svg>
);


export const SkillsPage: React.FC<SkillsPageProps> = ({ skills, skillFolders, categories, improveSkill, addSkill, addSkillFolder, addCategory, onDeleteSkill, onDeleteSkillFolder, onDeleteCategory }) => {
  const [view, setView] = useState<View>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<SkillFolder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderIcon, setNewFolderIcon] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('');

  const handleAddFolder = (e: React.FormEvent) => {
      e.preventDefault();
      if(newFolderName.trim() && selectedCategory) {
          addSkillFolder(newFolderName.trim(), selectedCategory, newFolderIcon);
          setNewFolderName('');
          setNewFolderIcon('');
      }
  };
  
  const handleAddCategory = (e: React.FormEvent) => {
      e.preventDefault();
      if(newCategoryName.trim()) {
          addCategory(newCategoryName.trim(), newCategoryIcon);
          setNewCategoryName('');
          setNewCategoryIcon('');
      }
  };

  const navigate = (targetView: View) => {
      if(targetView === 'categories') {
          setSelectedCategory(null);
          setSelectedFolder(null);
      }
      if(targetView === 'folders') {
          setSelectedFolder(null);
      }
      setView(targetView);
  }

  const renderContent = () => {
    if (view === 'add') {
        return (
            <div className="glass-panel p-8 rounded-lg border-blue-500/30">
                <CreateSkillForm 
                    addSkill={(...args) => { addSkill(...args); navigate('categories'); }} 
                    skills={skills} 
                    skillFolders={skillFolders} 
                    categories={categories} 
                />
            </div>
        );
    }

    if (view === 'tree' && selectedFolder) {
      const folderSkills = skills.filter(s => s.folderId === selectedFolder.id);
      return <SkillTree skills={folderSkills} onImprove={improveSkill} onDelete={onDeleteSkill} />;
    }

    if (view === 'folders' && selectedCategory) {
        const foldersInCategory = skillFolders.filter(f => f.category === selectedCategory);
        const unassignedSkills = skills.filter(s => s.category === selectedCategory && !s.folderId);
        const isCategoryEmpty = foldersInCategory.length === 0 && unassignedSkills.length === 0;
      return (
          <div>
            {isCategoryEmpty && (
                <p className="text-center text-gray-400 py-8">This category is empty. Create a new folder to organize skills.</p>
            )}

            {foldersInCategory.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {foldersInCategory.map(folder => {
                        return (
                            <div key={folder.id} className="group relative">
                                <button 
                                    onClick={() => { setSelectedFolder(folder); setView('tree'); }} 
                                    className="w-full h-full flex items-center text-left p-4 bg-gray-800/50 border border-blue-500/50 rounded-lg shadow-lg shadow-blue-500/10 hover:bg-gray-700/50 hover:border-blue-400 transition-all duration-300"
                                >
                                    <div className="h-8 w-8 mr-4 flex-shrink-0 flex items-center justify-center bg-gray-700/50 rounded">
                                        {folder.icon ? (
                                            <img src={folder.icon} alt={folder.name} className="h-full w-full object-cover rounded" />
                                        ) : (
                                            <DefaultIconPlaceholder colorClass="text-blue-400"/>
                                        )}
                                    </div>
                                    <h3 className="font-orbitron text-lg text-white">{folder.name}</h3>
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteSkillFolder(folder.id); }}
                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-gray-900/50 text-gray-500 hover:bg-red-800/70 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label={`Delete folder ${folder.name}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}

            <form onSubmit={handleAddFolder} className="mt-8 p-4 bg-gray-900/50 border border-gray-700 rounded-lg space-y-4">
                <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="New Folder Name..."
                    className="w-full bg-gray-800/70 border-2 border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                 <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Folder Icon</label>
                    <IconPicker selectedValue={newFolderIcon} onSelect={setNewFolderIcon} />
                </div>
                <button type="submit" className="w-full font-orbitron bg-blue-600 text-white px-5 py-2 rounded-md uppercase text-sm font-bold tracking-wider hover:bg-blue-500 transition-all duration-300">Create Folder</button>
            </form>

            {unassignedSkills.length > 0 && (
                <div className="mt-8">
                    <h3 className="font-orbitron text-xl text-gray-400 mb-4">Unassigned Skills</h3>
                    <div className="space-y-2">
                        {unassignedSkills.map(skill => (
                            <div key={skill.id} className="p-3 bg-gray-800/40 border border-gray-700/50 rounded-md flex justify-between items-center">
                                <span className="font-semibold text-gray-300">[{skill.grade}] {skill.name}</span>
                                <span className="text-sm text-gray-500">({skill.stars} ★)</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      );
    }

    // Default to categories view
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.length > 0 ? categories.map(cat => {
                return (
                    <div key={cat.name} className="group relative">
                        <button onClick={() => { setSelectedCategory(cat.name); setView('folders'); }} className="w-full h-full flex items-center text-left p-4 bg-gray-800/50 border border-blue-500/50 rounded-lg shadow-lg shadow-blue-500/10 hover:bg-gray-700/50 hover:border-blue-400 transition-all duration-300">
                            <div className="h-8 w-8 mr-4 flex-shrink-0 flex items-center justify-center bg-gray-700/50 rounded">
                                {cat.icon ? (
                                    <img src={cat.icon} alt={cat.name} className="h-full w-full object-cover rounded" />
                                ) : (
                                    <DefaultIconPlaceholder colorClass="text-blue-400" />
                                )}
                            </div>
                            <h3 className="font-orbitron text-lg text-white">{cat.name}</h3>
                        </button>
                         <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteCategory(cat.name); }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-gray-900/50 text-gray-500 hover:bg-red-800/70 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Delete category ${cat.name}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )
            }) : (
                <p className="text-left text-gray-400 font-orbitron font-bold text-xs py-12 px-2 ml-[34px] mr-[-3px] col-span-full opacity-60 leading-relaxed uppercase tracking-widest">No skill categories found. Add a skill or create a category to begin.</p>
            )}
        </div>
         <form onSubmit={handleAddCategory} className="mt-3 pt-6 pl-6 pb-3 pr-4 ml-[34px] bg-black/40 border-2 border-blue-500/20 rounded-md space-y-6">
            <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New Category Name"
                className="w-full bg-black/40 border-2 border-blue-500/20 rounded-sm px-5 py-3 font-orbitron text-xs font-bold text-white outline-none focus:border-blue-400 transition-all"
            />
            <div>
                <label className="block text-sm font-bold text-gray-400 font-orbitron mb-4 uppercase tracking-widest">Category Icon</label>
                <IconPicker selectedValue={newCategoryIcon} onSelect={setNewCategoryIcon} />
            </div>
            <button type="submit" className="w-full font-orbitron bg-blue-600/20 border border-blue-500/50 text-blue-300 px-5 py-3 rounded-sm uppercase text-xs font-black tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-300">Create Category</button>
        </form>
      </>
    );
  };
  
  return (
    <div className="glass-panel p-4 md:p-8 rounded-lg border-2 border-blue-500/20 shadow-2xl shadow-blue-500/5 min-h-[70vh] -mt-4 md:-mt-[43px]">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-8 md:mb-12 gap-4">
            <Breadcrumbs view={view} category={selectedCategory} folder={selectedFolder} onNavigate={navigate} />
            <button 
                onClick={() => setView(view === 'add' ? 'categories' : 'add')} 
                className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2.5 rounded-sm text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:bg-blue-500 transition-all"
            >
                {view === 'add' ? 'Abort Entry' : 'Initialize New Entry'}
            </button>
        </div>
        <div className="pb-20 md:pb-0">
            {renderContent()}
        </div>
    </div>
  );
};
