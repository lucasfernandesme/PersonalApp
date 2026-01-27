
import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Dumbbell, Trash2, X, ChevronDown, Play } from 'lucide-react';
import { LibraryExercise, CATEGORIES } from '../constants/exercises';

interface ExerciseManagerScreenProps {
  exercises: LibraryExercise[];
  onAdd: (exercise: LibraryExercise) => void;
  onBack: () => void;
}

const ExerciseManagerScreen: React.FC<ExerciseManagerScreenProps> = ({ exercises, onAdd, onBack }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isComboOpen, setIsComboOpen] = useState(false);
  const [newExercise, setNewExercise] = useState<LibraryExercise>({ name: '', category: 'Peito', videoUrl: '' });
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed')) return url;

    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('youtube.com/shorts/')[1].split('?')[0];
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : url;
  };

  const getYouTubeId = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url.split('youtube.com/embed/')[1].split('?')[0];
    if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
    if (url.includes('v=')) return url.split('v=')[1].split('&')[0];
    if (url.includes('youtube.com/shorts/')) return url.split('youtube.com/shorts/')[1].split('?')[0];
    return '';
  };

  const filtered = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSave = () => {
    if (!newExercise.name) return;

    const formattedExercise = {
      ...newExercise,
      videoUrl: getYouTubeEmbedUrl(newExercise.videoUrl || '')
    };

    onAdd(formattedExercise);
    setNewExercise({ name: '', category: 'Peito', videoUrl: '' });
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
          onClick={() => {
            setNewExercise({ name: '', category: 'Peito', videoUrl: '' });
            setIsPlayingPreview(false);
            setIsAdding(true);
          }}
          className="bg-indigo-600 text-white p-2 rounded-xl"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="p-6 bg-white border-b border-slate-100 relative z-20">
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text"
              placeholder="Buscar na biblioteca..."
              className="w-full bg-slate-50 border border-slate-100 rounded-[20px] pl-12 pr-6 py-4 font-bold text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm placeholder:text-slate-300"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-24">
        {filtered.map((ex, idx) => (
          <div
            key={idx}
            onClick={() => {
              setNewExercise(ex);
              setIsPlayingPreview(false);
              setIsAdding(true);
            }}
            className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between cursor-pointer hover:border-indigo-200 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Dumbbell size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{ex.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-black uppercase text-slate-400">{ex.category}</p>
                  {ex.videoUrl && (
                    <span className="w-1 h-1 rounded-full bg-red-400"></span>
                  )}
                  {ex.videoUrl && (
                    <p className="text-[10px] font-black uppercase text-red-400">Vídeo</p>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement delete logic
              }}
              className="p-2 text-slate-200 hover:text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] p-6 space-y-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900">{newExercise.id ? 'Editar Exercício' : 'Novo Exercício'}</h3>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setIsPlayingPreview(false);
                  setNewExercise({ name: '', category: 'Peito', videoUrl: '' });
                }}
                className="text-slate-400"
              >
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
                  onChange={e => setNewExercise({ ...newExercise, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Categoria</label>
                <select
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700"
                  value={newExercise.category}
                  onChange={e => setNewExercise({ ...newExercise, category: e.target.value })}
                >
                  {CATEGORIES.filter(c => c !== 'Todos').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Link do Vídeo (YouTube)</label>

                {newExercise.videoUrl && getYouTubeId(newExercise.videoUrl) && (
                  <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 mb-4 group animate-in zoom-in-95 duration-300">
                    {isPlayingPreview ? (
                      <iframe
                        src={`${getYouTubeEmbedUrl(newExercise.videoUrl)}&autoplay=1`}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div
                        onClick={() => setIsPlayingPreview(true)}
                        className="relative w-full h-full cursor-pointer"
                      >
                        <img
                          src={`https://img.youtube.com/vi/${getYouTubeId(newExercise.videoUrl)}/mqdefault.jpg`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          alt="Preview"
                        />
                        <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center group-hover:bg-slate-900/40 transition-all">
                          <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-600 shadow-xl group-hover:scale-110 active:scale-95 transition-all">
                            <Play size={24} fill="currentColor" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                    <Dumbbell size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Cole o link do YouTube aqui..."
                    className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-5 py-4 font-bold focus:ring-2 focus:ring-red-500"
                    value={newExercise.videoUrl || ''}
                    onChange={e => setNewExercise({ ...newExercise, videoUrl: e.target.value })}
                  />
                </div>
                <p className="text-[9px] text-slate-400 font-medium px-1">
                  Pode ser link curto, do navegador ou shorts. O app formata sozinho! ✨
                </p>
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
