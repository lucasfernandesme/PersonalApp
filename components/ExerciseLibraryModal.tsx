
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
    <div className="fixed inset-0 z-[80] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <div>
          <h2 className="text-xl font-black text-slate-900">Biblioteca</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Escolha um exercício</p>
        </div>
        <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500">
          <X size={20} />
        </button>
      </div>

      {/* Search and Filters */}
      <div className="p-6 bg-white border-b border-slate-50 relative z-20">
        <div className="grid grid-cols-1 gap-4">
          {/* Custom Combobox */}
          <div className="relative">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block">Filtrar por Categoria</label>
            <button
              onClick={() => setIsComboOpen(!isComboOpen)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 flex items-center justify-between group hover:border-indigo-200 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                <span className="font-bold text-slate-700">{selectedCategory}</span>
              </div>
              <ChevronDown className={`text-slate-400 transition-transform duration-300 ${isComboOpen ? 'rotate-180 text-indigo-500' : ''}`} size={20} />
            </button>

            {isComboOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsComboOpen(false)}
                ></div>
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-[24px] shadow-2xl py-3 z-20 animate-in fade-in zoom-in-95 duration-200">
                  <div className="max-h-60 overflow-y-auto px-2 space-y-1">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsComboOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wide transition-all flex items-center justify-between ${selectedCategory === cat
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-500 hover:bg-slate-50'
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome do exercício..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-[20px] pl-12 pr-6 py-4 font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredExercises.length > 0 ? (
          filteredExercises.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(ex)}
              className="w-full p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between active:bg-slate-50 active:scale-[0.98] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Dumbbell size={20} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800 text-sm">{ex.name}</p>
                    {ex.videoUrl && (
                      <div className="text-indigo-400 flex items-center gap-1" title="Possui guia visual">
                        <Eye size={12} />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] font-black uppercase text-slate-400">{ex.category}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>
          ))
        ) : (
          <div className="py-20 text-center space-y-2">
            <p className="text-slate-400 font-bold">Nenhum exercício encontrado</p>
            <p className="text-xs text-slate-300">Tente mudar os filtros ou o termo de busca</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseLibraryModal;
