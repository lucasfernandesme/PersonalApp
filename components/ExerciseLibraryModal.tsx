
import React, { useState, useMemo } from 'react';
import { Search, X, ChevronRight, Dumbbell, Eye, ChevronDown, Filter } from 'lucide-react';
import { EXERCISES_DB, CATEGORIES, LibraryExercise } from '../constants/exercises';

interface ExerciseLibraryModalProps {
  onSelect: (exercise: LibraryExercise) => void;
  onClose: () => void;
}

const ExerciseLibraryModal: React.FC<ExerciseLibraryModalProps> = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isComboOpen, setIsComboOpen] = useState(false);

  const filteredExercises = useMemo(() => {
    return EXERCISES_DB.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || ex.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="fixed inset-0 z-[80] bg-white dark:bg-slate-900 flex flex-col animate-in slide-in-from-bottom duration-300 transition-colors">
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-4 transition-all duration-300 relative flex-shrink-0 mb-6">
        <div className="w-10"></div> {/* Placeholder for symmetry */}

        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="PersonalFlow" className="w-8 h-8 rounded-full shadow-sm" />
          <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">PersonalFlow</span>
        </div>

        <button onClick={onClose} className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-red-500 transition-colors z-10 w-10 flex justify-end">
          <X size={24} />
        </button>
      </header>

      <div className="px-6 mb-4">
        <h2 className="text-xl font-black text-zinc-900 dark:text-white transition-colors">Biblioteca</h2>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider transition-colors">Escolha um exercício</p>
      </div>

      {/* Search and Filters */}
      <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-50 dark:border-slate-800 relative z-20 transition-colors">
        <div className="grid grid-cols-1 gap-4">
          {/* Custom Combobox */}
          <div className="relative">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 mb-2 block transition-colors">Filtrar por Categoria</label>
            <button
              onClick={() => setIsComboOpen(!isComboOpen)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 flex items-center justify-between group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-zinc-400 shadow-[0_0_8px_rgba(161,161,170,0.5)]"></div>
                <span className="font-bold text-slate-700 dark:text-slate-200">{selectedCategory}</span>
              </div>
              <ChevronDown className={`text-slate-400 transition-transform duration-300 ${isComboOpen ? 'rotate-180 text-zinc-900 dark:text-zinc-100' : ''}`} size={20} />
            </button>

            {isComboOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsComboOpen(false)}
                ></div>
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[24px] shadow-2xl py-3 z-20 animate-in fade-in zoom-in-95 duration-200 transaction-colors">
                  <div className="max-h-60 overflow-y-auto px-2 space-y-1 custom-scrollbar">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsComboOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wide transition-all flex items-center justify-between ${selectedCategory === cat
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                      >
                        {cat}
                        {selectedCategory === cat && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome do exercício..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-[20px] pl-12 pr-6 py-4 font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:bg-white dark:focus:bg-zinc-900 transition-all shadow-sm dark:shadow-none dark:text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
        {filteredExercises.length > 0 ? (
          filteredExercises.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(ex)}
              className="w-full p-4 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 rounded-2xl flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-800 active:scale-[0.98] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors">
                  <Dumbbell size={20} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800 dark:text-white text-sm transition-colors">{ex.name}</p>
                    {ex.videoUrl && (
                      <div className="text-zinc-400 dark:text-zinc-500 flex items-center gap-1" title="Possui guia visual">
                        <Eye size={12} />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 transition-colors">{ex.category}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300 dark:text-slate-700" />
            </button>
          ))
        ) : (
          <div className="py-20 text-center space-y-2 transition-colors">
            <p className="text-slate-400 dark:text-slate-600 font-bold">Nenhum exercício encontrado</p>
            <p className="text-xs text-slate-300 dark:text-slate-700">Tente mudar os filtros ou o termo de busca</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseLibraryModal;
