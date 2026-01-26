
import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  Dumbbell,
  ArrowLeft,
  Search,
  X as XIcon,
  AlertCircle,
  Calendar,
  Eye,
  MessageSquareQuote,
  Sparkles,
  Loader2
} from 'lucide-react';
import { TrainingProgram, WorkoutDay, Exercise } from '../types';
import ExerciseLibraryModal from './ExerciseLibraryModal';
import { LibraryExercise } from '../constants/exercises';
import { generateSingleExerciseTip } from '../services/geminiService';

interface ManualWorkoutBuilderProps {
  studentName: string;
  studentGoal?: string;
  studentInjuries?: string;
  onSave: (program: TrainingProgram) => void;
  onCancel: () => void;
  initialProgram?: TrainingProgram;
}

const ManualWorkoutBuilder: React.FC<ManualWorkoutBuilderProps> = ({ 
  studentName, 
  studentGoal = 'Hipertrofia', 
  studentInjuries = '', 
  onSave, 
  onCancel, 
  initialProgram 
}) => {
  const [programName, setProgramName] = useState(initialProgram?.name || `Treino de ${studentName}`);
  const [startDate, setStartDate] = useState(initialProgram?.startDate || new Date().toISOString().split('T')[0]);
  const [days, setDays] = useState<WorkoutDay[]>(initialProgram?.split || [
    { day: 'Dia A', label: 'Superior', exercises: [] }
  ]);
  const [error, setError] = useState<string | null>(null);
  const [generatingTips, setGeneratingTips] = useState<Record<string, boolean>>({});
  
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [activeDayIdx, setActiveDayIdx] = useState<number | null>(null);
  const [activeExIdx, setActiveExIdx] = useState<number | null>(null);

  const addDay = () => {
    const nextLetter = String.fromCharCode(65 + days.length);
    setDays([...days, { day: `Dia ${nextLetter}`, label: 'Novo Dia', exercises: [] }]);
    setError(null);
  };

  const removeDay = (index: number) => {
    if (days.length > 1) {
      setDays(days.filter((_, i) => i !== index));
    }
  };

  const openLibraryForAdd = (dayIndex: number) => {
    setActiveDayIdx(dayIndex);
    setActiveExIdx(null);
    setIsLibraryOpen(true);
  };

  const openLibraryForEdit = (dayIndex: number, exIndex: number) => {
    setActiveDayIdx(dayIndex);
    setActiveExIdx(exIndex);
    setIsLibraryOpen(true);
  };

  const handleLibrarySelect = (libEx: LibraryExercise) => {
    const newDays = [...days];
    if (activeDayIdx !== null) {
      if (activeExIdx === null) {
        const newEx: Exercise = {
          id: Math.random().toString(36).substring(2, 11),
          name: libEx.name,
          sets: 3,
          reps: '12',
          rest: '60s',
          notes: '',
          videoUrl: libEx.videoUrl
        };
        newDays[activeDayIdx].exercises.push(newEx);
      } else {
        newDays[activeDayIdx].exercises[activeExIdx].name = libEx.name;
        newDays[activeDayIdx].exercises[activeExIdx].videoUrl = libEx.videoUrl;
      }
      setDays(newDays);
      setError(null);
    }
    setIsLibraryOpen(false);
    setActiveDayIdx(null);
    setActiveExIdx(null);
  };

  const handleGenerateAITip = async (dIdx: number, eIdx: number, exerciseName: string) => {
    if (!exerciseName) return;
    
    const tipKey = `${dIdx}-${eIdx}`;
    setGeneratingTips(prev => ({ ...prev, [tipKey]: true }));
    
    try {
      const tip = await generateSingleExerciseTip(exerciseName, { goal: studentGoal, injuries: studentInjuries });
      updateExercise(dIdx, eIdx, 'notes', tip);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingTips(prev => ({ ...prev, [tipKey]: false }));
    }
  };

  const updateExercise = (dayIndex: number, exIndex: number, field: keyof Exercise, value: any) => {
    const newDays = [...days];
    newDays[dayIndex].exercises[exIndex] = {
      ...newDays[dayIndex].exercises[exIndex],
      [field]: value
    };
    setDays(newDays);
  };

  const removeExercise = (dayIndex: number, exIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].exercises = newDays[dayIndex].exercises.filter((_, i) => i !== exIndex);
    setDays(newDays);
  };

  const handleSave = () => {
    if (!programName.trim()) {
      setError("Dê um nome ao programa de treino.");
      return;
    }
    if (!startDate) {
      setError("Selecione uma data de início.");
      return;
    }
    const filledDays = days.filter(d => d.exercises.length > 0);
    if (filledDays.length === 0) {
      setError("Adicione ao menos um exercício.");
      return;
    }

    onSave({
      id: initialProgram?.id || Math.random().toString(36).substring(2, 11),
      name: programName,
      startDate: startDate,
      split: filledDays,
      frequency: filledDays.length,
      goal: initialProgram?.goal || studentGoal
    });
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-50 flex flex-col animate-in slide-in-from-right duration-300">
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex items-center justify-between">
        <button onClick={onCancel} className="p-2 text-slate-400">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Montar Treino</h2>
          <p className="text-[10px] font-bold text-slate-400">{studentName}</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
        >
          Salvar
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600">
            <AlertCircle size={20} />
            <p className="text-xs font-bold uppercase tracking-wide">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nome do Programa</label>
            <input 
              type="text" 
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Data de Início</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-4">
          {days.map((day, dIdx) => (
            <div key={dIdx} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                    {day.day.split(' ')[1]}
                  </span>
                  <input 
                    type="text" 
                    value={day.label}
                    onChange={(e) => {
                      const newDays = [...days];
                      newDays[dIdx].label = e.target.value;
                      setDays(newDays);
                    }}
                    className="bg-transparent font-bold text-slate-800 border-none p-0 focus:ring-0 w-40"
                    placeholder="Foco do dia..."
                  />
                </div>
                {days.length > 1 && (
                  <button onClick={() => removeDay(dIdx)} className="text-slate-300 hover:text-red-500 p-2">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="p-4 space-y-4">
                {day.exercises.map((ex, eIdx) => (
                  <div key={ex.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 relative">
                    <button 
                      onClick={() => removeExercise(dIdx, eIdx)}
                      className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500"
                    >
                      <XIcon size={14} />
                    </button>
                    
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Nome do exercício"
                        value={ex.name}
                        onChange={(e) => updateExercise(dIdx, eIdx, 'name', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 shadow-sm"
                      />
                      <button 
                        onClick={() => openLibraryForEdit(dIdx, eIdx)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                      >
                        <Search size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 block ml-1">Séries</label>
                        <input type="number" value={ex.sets} onChange={(e) => updateExercise(dIdx, eIdx, 'sets', parseInt(e.target.value) || 0)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 block ml-1">Reps</label>
                        <input type="text" value={ex.reps} onChange={(e) => updateExercise(dIdx, eIdx, 'reps', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 block ml-1">Desc.</label>
                        <input type="text" value={ex.rest} onChange={(e) => updateExercise(dIdx, eIdx, 'rest', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1">
                          <MessageSquareQuote size={10} />
                          Dica do Personal
                        </label>
                        <button 
                          onClick={() => handleGenerateAITip(dIdx, eIdx, ex.name)}
                          disabled={generatingTips[`${dIdx}-${eIdx}`] || !ex.name}
                          className="flex items-center gap-1 text-[8px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition-all"
                        >
                          {generatingTips[`${dIdx}-${eIdx}`] ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : (
                            <Sparkles size={10} />
                          )}
                          Gerar com IA
                        </button>
                      </div>
                      <textarea 
                        placeholder="Dica de biomecânica ou segurança..."
                        value={ex.notes || ''}
                        onChange={(e) => updateExercise(dIdx, eIdx, 'notes', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-700 min-h-[60px] focus:ring-2 focus:ring-indigo-500 shadow-sm"
                      />
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => openLibraryForAdd(dIdx)}
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:border-indigo-300 transition-all"
                >
                  <Plus size={16} />
                  Adicionar Exercício
                </button>
              </div>
            </div>
          ))}

          <button 
            onClick={addDay}
            className="w-full py-5 bg-white border border-slate-200 rounded-3xl text-indigo-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus size={20} />
            Adicionar Novo Dia
          </button>
        </div>
      </div>

      {isLibraryOpen && (
        <ExerciseLibraryModal onSelect={handleLibrarySelect} onClose={() => setIsLibraryOpen(false)} />
      )}
    </div>
  );
};

export default ManualWorkoutBuilder;
