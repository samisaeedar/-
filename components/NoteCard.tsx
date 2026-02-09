
import React from 'react';
import { Note } from '../types.ts';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  lang: 'ar' | 'en';
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete, lang }) => {
  const isProcessing = note.ai_category === 'معالجة' || note.ai_category === 'Processing';

  return (
    <div className={`glass p-8 rounded-[2.5rem] shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden flex flex-col h-full border-white/40 ${isProcessing ? 'opacity-80' : ''}`}>
      {isProcessing && (
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-shimmer"></div>
      )}
      
      <div className="flex justify-between items-start mb-6">
        <span className={`text-[10px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest ${
          isProcessing ? 'bg-slate-100 text-slate-400 animate-pulse' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
        }`}>
          {note.ai_category}
        </span>
        <button 
          onClick={() => onDelete(note.id)}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/50 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-sm border border-white/50"
        >
          <i className="fas fa-trash-can text-sm"></i>
        </button>
      </div>
      
      <h3 className={`text-2xl font-black text-slate-800 mb-4 leading-tight tracking-tight ${isProcessing ? 'animate-pulse' : ''}`}>
        {note.ai_title}
      </h3>
      
      <p className="text-slate-600 text-base leading-relaxed whitespace-pre-wrap flex-grow font-medium opacity-90">
        {note.content}
      </p>
      
      <div className="mt-8 pt-6 border-t border-slate-100/50 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        <span>
          {new Date(note.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
        <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-200"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
        </div>
      </div>
    </div>
  );
};
