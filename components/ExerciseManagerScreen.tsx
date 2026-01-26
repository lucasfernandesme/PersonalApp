
import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Dumbbell, Trash2, X } from 'lucide-react';
import { LibraryExercise, CATEGORIES } from '../constants/exercises';

interface ExerciseManagerScreenProps {
  exercises: LibraryExercise[];
  onAdd: (exercise: LibraryExercise) => void;
  onBack: () => void;
}

const ExerciseManagerScreen: React.FC<ExerciseManagerScreenProps> = ({ exercises, onAdd, onBack }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newExercise, setNewExercise] = useState<LibraryExercise>({ name: '', category: 'Peito' });

  const filtered = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!newExercise.name) return;
    onAdd(newExercise);
    setNewExercise({ name: '', category: 'Peito' });
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col animate-in slide-in-from-right duration-300">
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 text-slate-400">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-black text-slate-900">Biblioteca</h2>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 text-white p-2 rounded-xl"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="p-4 bg-white border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Buscar na biblioteca..."
            className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 font-bold text-sm focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-24">
        {filtered.map((ex, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Dumbbell size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{ex.name}</p>
                <p className="text-[10px] font-black uppercase text-slate-400">{ex.category}</p>
              </div>
            </div>
            <button className="p-2 text-slate-200 hover:text-red-500 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] p-6 space-y-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900">Novo Exercício</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nome</label>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Ex: Supino Inclinado Articulado"
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-indigo-500"
                  value={newExercise.name}
                  onChange={e => setNewExercise({...newExercise, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Categoria</label>
                <select 
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700"
                  value={newExercise.category}
                  onChange={e => setNewExercise({...newExercise, category: e.target.value})}
                >
                  {CATEGORIES.filter(c => c !== 'Todos').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-indigo-600 text-white font-black uppercase text-xs tracking-widest py-5 rounded-2xl shadow-xl shadow-indigo-600/30"
            >
              Adicionar à Biblioteca
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseManagerScreen;
