
import React, { useState } from 'react';
import { Difficulty, Quest, Attribute } from '../types';
import { ATTRIBUTES } from '../constants';

interface CreateQuestFormProps {
  addQuest: (name: string, difficulty: Difficulty, type: 'repetitive' | 'one-time', attributes: Attribute[], description: string) => void;
  onWatchAd: (onGranted: () => void) => void;
}

export const CreateQuestForm: React.FC<CreateQuestFormProps> = ({ addQuest, onWatchAd }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.E);
  const [type, setType] = useState<Quest['type']>('repetitive');
  const [selectedAttributes, setSelectedAttributes] = useState<Attribute[]>([]);

  const handleAttributeToggle = (attribute: Attribute) => {
    setSelectedAttributes(prev =>
        prev.includes(attribute)
            ? prev.filter(a => a !== attribute)
            : [...prev, attribute]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const doCreate = () => {
        addQuest(
          name.trim(),
          difficulty,
          type,
          selectedAttributes,
          description.trim()
        );
        setName('');
        setDescription('');
        setDifficulty(Difficulty.E);
        setType('repetitive');
        setSelectedAttributes([]);
      };
      onWatchAd(doCreate);
    }
  };

  const difficultyOptions = Object.values(Difficulty).map(d => (
    <option key={d} value={d}>{d}</option>
  ));
  
  const difficultyColors: Record<Difficulty, string> = {
    [Difficulty.E]: 'border-gray-500 text-gray-300',
    [Difficulty.D]: 'border-green-600 text-green-300',
    [Difficulty.C]: 'border-orange-600 text-orange-300',
    [Difficulty.B]: 'border-indigo-600 text-indigo-300',
    [Difficulty.A]: 'border-purple-600 text-purple-300',
    [Difficulty.S]: 'border-yellow-600 text-yellow-300',
    [Difficulty.S_PLUS]: 'border-red-600 text-red-300',
    [Difficulty.X]: 'border-red-900 text-red-400',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
          <label className="block text-sm font-bold text-gray-300 mb-1">Quest Name</label>
          <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Enter quest name" required
              className="w-full bg-gray-900/70 border-2 border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
      </div>
       <div>
        <label className="block text-sm font-bold text-gray-300 mb-2">Attributes <span className="text-gray-500">(Optional)</span></label>
        <div className="flex flex-wrap gap-2">
            {ATTRIBUTES.map(attr => (
            <button
                type="button"
                key={attr}
                onClick={() => handleAttributeToggle(attr)}
                className={`font-orbitron px-3 py-1.5 text-sm rounded-md border-2 transition-colors duration-200 ${
                selectedAttributes.includes(attr)
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
                }`}
            >
                {attr}
            </button>
            ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-300 mb-1">Description <span className="text-gray-500">(Optional)</span></label>
        <textarea
            value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the quest objectives..."
            rows={2}
            className="w-full bg-gray-900/70 border-2 border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-1">Difficulty</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className={`w-full bg-gray-900/70 border-2 rounded-md px-4 py-2 font-orbitron focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${difficultyColors[difficulty]}`}>
              {difficultyOptions}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-1">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as Quest['type'])}
              className="w-full bg-gray-900/70 border-2 border-gray-600 rounded-md px-4 py-2 font-orbitron focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
              <option value="repetitive">Repetitive</option>
              <option value="one-time">One-Time</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-2">
          <button type="submit"
              className="font-orbitron bg-blue-600 text-white px-6 py-2 rounded-md uppercase font-bold tracking-wider hover:bg-blue-500 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Watch Ad to Create
          </button>
      </div>
    </form>
  );
};
