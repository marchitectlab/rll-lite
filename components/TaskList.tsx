import React, { useState } from 'react';
import { WeeklyPlan, DayOfWeek } from '../types';

interface TaskListProps {
  weeklyPlan: WeeklyPlan;
  onAddTask: (day: DayOfWeek, text: string) => void;
  onToggleTask: (day: DayOfWeek, id: string) => void;
  onDeleteTask: (day: DayOfWeek, id: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ weeklyPlan, onAddTask, onToggleTask, onDeleteTask }) => {
  const [activeDay, setActiveDay] = useState<DayOfWeek>('monday');
  const [text, setText] = useState('');
  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="glass-panel p-4 md:p-8 pt-6 md:pt-8 mt-5 border-none border-0 rounded-none border-blue-500/20 pb-24 md:pb-8">
      <h2 className="font-orbitron text-xl md:text-2xl text-blue-400 ml-0 pl-1.5 mr-0 pt-0 pr-0 mb-6 md:mb-8 neon-text uppercase font-black tracking-tight md:tracking-normal">WEEKLY SCHEDULE</h2>
      <div className="flex overflow-x-auto custom-scrollbar gap-2 mb-6 md:mb-8 pb-2 -mx-2 px-2 no-scrollbar">
        {days.map(d => (
          <button key={d} onClick={() => setActiveDay(d)} className={`flex-shrink-0 px-3 md:px-4 py-2 rounded text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border ${activeDay === d ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(56,189,248,0.4)]' : 'bg-gray-950 border-slate-800 text-gray-500'}`}>{d.slice(0, 3)}</button>
        ))}
      </div>
      
      <form onSubmit={e => { e.preventDefault(); if (text.trim()) { onAddTask(activeDay, text); setText(''); } }} className="flex gap-2 md:gap-3 mb-6 md:mb-8">
        <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder={`PLAN ${activeDay.toUpperCase()}...`} className="flex-grow bg-black/40 border-2 border-blue-500/20 rounded-sm pl-4 py-2.5 font-orbitron text-[10px] md:text-xs font-bold text-white outline-none focus:border-blue-400" />
        <button type="submit" className="font-orbitron bg-blue-700 text-white px-3 md:px-4 py-1.5 rounded-sm uppercase text-[9px] md:text-[10px] font-black tracking-widest hover:bg-blue-600 transition-colors">INITIALIZE</button>
      </form>

      <div className="space-y-2 md:space-y-3">
        {weeklyPlan[activeDay].map(task => (
          <div key={task.id} className="group glass-panel flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-900/40 border border-white/5 rounded-sm">
            <input type="checkbox" checked={task.completed} onChange={() => onToggleTask(activeDay, task.id)} className="h-4 w-4 md:h-5 md:w-5 rounded-sm bg-black/60 border-blue-500/40 text-blue-500" />
            <span className={`flex-grow font-medium text-xs md:text-sm transition-all ${task.completed ? 'line-through text-gray-700 font-normal' : 'text-blue-100'}`}>{task.text}</span>
            <button onClick={() => onDeleteTask(activeDay, task.id)} className="text-gray-700 hover:text-red-500 opacity-60 md:opacity-0 group-hover:opacity-100 transition-all p-1">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            </button>
          </div>
        ))}
        {weeklyPlan[activeDay].length === 0 && (
            <div className="text-center py-10 opacity-20">
                <p className="font-orbitron text-[9px] uppercase tracking-[0.4em]">No objectives detected.</p>
            </div>
        )}
      </div>
    </div>
  );
};