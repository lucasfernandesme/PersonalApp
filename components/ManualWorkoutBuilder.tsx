
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
  Loader2
} from 'lucide-react';
import { TrainingProgram, WorkoutDay, Exercise } from '../types';
import ExerciseLibraryModal from './ExerciseLibraryModal';
import { LibraryExercise } from '../constants/exercises';

interface ManualWorkoutBuilderProps {
  studentName: string;
  studentGoal?: string;
  studentInjuries?: string;
  onSave: (program: TrainingProgram) => void;
  onCancel: () => void;
  initialProgram?: TrainingProgram;
}

const ManualWorkoutBuilder: React.FC<ManualWorkoutBuilderProps> = ({
  studentName = '',
  studentGoal = 'Hipertrofia',
  studentInjuries = '',
  onSave,
  onCancel,
  initialProgram
}) => {
  const isTemplateMode = !studentName;
  const [programName, setProgramName] = useState(initialProgram?.name || (isTemplateMode ? '' : `Treino de ${studentName}`));
  const [goal, setGoal] = useState(initialProgram?.goal || studentGoal || 'Hipertrofia');
  const [difficulty, setDifficulty] = useState<'adaptation' | 'beginner' | 'intermediate' | 'advanced'>(initialProgram?.difficulty || 'beginner');
  const [startDate, setStartDate] = useState(initialProgram?.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(initialProgram?.endDate || '');
  const [days, setDays] = useState<WorkoutDay[]>(initialProgram?.split || [
    { day: 'Dia A', label: 'Treino A', exercises: [] }
  ]);
  const [error, setError] = useState<string | null>(null);
  const [observations, setObservations] = useState(initialProgram?.observations || '');

  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    setError(null);
    if (!programName.trim()) {
      setError("Dê um nome ao programa.");
      return;
    }

    // Data de início só é obrigatória se NÃO for template
    if (!isTemplateMode && !startDate) {
      setError("Selecione uma data de início.");
      return;
    }

    const filledDays = days.filter(d => d.exercises.length > 0);
    if (filledDays.length === 0) {
      setError("Adicione ao menos um exercício.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        id: initialProgram?.id || Math.random().toString(36).substring(2, 11),
        name: programName,
        startDate: isTemplateMode ? undefined : startDate,
        endDate: isTemplateMode ? undefined : endDate,
        split: filledDays,
        frequency: filledDays.length,
        goal: goal,
        difficulty: difficulty,
        observations: observations
      });
    } catch (error) {
      console.error("Failed to save program:", error);
      setError("Erro ao salvar o programa. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-zinc-50 dark:bg-zinc-950 flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
      {/* Dynamic Header Standardized */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 transition-all duration-300 relative flex-shrink-0 mb-6">
        <button onClick={onCancel} className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-red-500 transition-colors z-10 w-10">
          <ArrowLeft size={24} />
        </button>

        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="PersonalFlow" className="w-8 h-8 rounded-full shadow-sm" />
          <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">PersonalFlow</span>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-zinc-900/20 dark:shadow-zinc-100/10 disabled:opacity-50 z-10"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>Salvar</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-6 pb-2">
          <div className="flex flex-col gap-1 mb-6">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              {isTemplateMode ? 'Criar Rotina' : 'Montar Treino'}
            </h2>
            <p className="text-zinc-400 dark:text-zinc-500 font-medium">
              {isTemplateMode ? 'Biblioteca de Treinos' : `Prescrevendo para ${studentName}`}
            </p>
          </div>
        </div>

        <div className="p-4 space-y-6 pb-24 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle size={20} />
              <p className="text-xs font-bold uppercase tracking-wide">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 ml-1 tracking-widest">Nome da Rotina</label>
                <input
                  type="text"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-5 py-4 font-bold text-zinc-800 dark:text-white focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                  placeholder={isTemplateMode ? "Ex: Hipertrofia Masculina A/B" : ""}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 ml-1 tracking-widest">Objetivo do Treino</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-5 py-4 font-bold text-zinc-800 dark:text-white focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all appearance-none"
                >
                  <option value="Hipertrofia" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">Hipertrofia</option>
                  <option value="Emagrecimento" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">Emagrecimento / Redução de Gordura</option>
                  <option value="Condicionamento" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">Condicionamento Físico</option>
                  <option value="Força" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">Força Máxima</option>
                  <option value="Qualidade de Vida" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">Qualidade de Vida</option>
                  <option value="Reabilitação" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">Reabilitação / Fortalecimento</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 ml-1 tracking-widest">Dificuldade / Nível</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'adaptation', label: 'Adaptação' },
                    { id: 'beginner', label: 'Iniciante' },
                    { id: 'intermediate', label: 'Intermediário' },
                    { id: 'advanced', label: 'Avançado' }
                  ].map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setDifficulty(level.id as any)}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${difficulty === level.id
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg shadow-zinc-900/20 dark:shadow-zinc-100/10'
                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                        }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {!isTemplateMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 ml-1 tracking-widest">Data de Início</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-5 py-4 font-bold text-zinc-800 dark:text-white focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all font-sans"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 ml-1 tracking-widest">Data Final (Opcional)</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-5 py-4 font-bold text-zinc-800 dark:text-white focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all font-sans"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2 transition-colors">
            <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 ml-1 tracking-widest">Observações Gerais</label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observações sobre o treino, restrições, orientações gerais..."
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-5 py-4 font-medium text-zinc-700 dark:text-white focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all min-h-[100px] resize-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-4">
            {days.map((day, dIdx) => (
              <div key={dIdx} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-700">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-black text-xs">
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
                      className="bg-transparent font-bold text-zinc-800 dark:text-white border-none p-0 focus:ring-0 w-40 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                      placeholder="Foco do dia..."
                    />
                  </div>
                  {days.length > 1 && (
                    <button onClick={() => removeDay(dIdx)} className="text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 p-2 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="p-4 space-y-4">
                  {day.exercises.map((ex, eIdx) => (
                    <div key={ex.id} className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-4 relative transition-colors">
                      <button
                        onClick={() => removeExercise(dIdx, eIdx)}
                        className="absolute top-2 right-2 p-1 text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <XIcon size={14} />
                      </button>

                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          placeholder="Nome do exercício"
                          value={ex.name}
                          onClick={() => openLibraryForEdit(dIdx, eIdx)}
                          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-4 pr-10 py-2.5 text-sm font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white shadow-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-colors cursor-pointer select-none"
                        />
                        <button
                          onClick={() => openLibraryForEdit(dIdx, eIdx)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                        >
                          <Search size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 block ml-1">Séries</label>
                          <input type="number" value={ex.sets} onChange={(e) => updateExercise(dIdx, eIdx, 'sets', parseInt(e.target.value) || 0)} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-zinc-900 dark:text-white transition-colors" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 block ml-1">Reps</label>
                          <input type="text" value={ex.reps} onChange={(e) => updateExercise(dIdx, eIdx, 'reps', e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-zinc-900 dark:text-white transition-colors" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 block ml-1">Desc.</label>
                          <input type="text" value={ex.rest} onChange={(e) => updateExercise(dIdx, eIdx, 'rest', e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-zinc-900 dark:text-white transition-colors" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                            <MessageSquareQuote size={10} />
                            Dica do Personal
                          </label>

                        </div>
                        <textarea
                          placeholder="Dica de biomecânica ou segurança..."
                          value={ex.notes || ''}
                          onChange={(e) => updateExercise(dIdx, eIdx, 'notes', e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-medium text-zinc-700 dark:text-white min-h-[60px] focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white shadow-sm transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => openLibraryForAdd(dIdx)}
                    className="w-full py-4 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-400 dark:text-zinc-500 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all"
                  >
                    <Plus size={16} />
                    Adicionar Exercício
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={addDay}
              className="w-full py-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-900 dark:text-zinc-100 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
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
    </div>
  );
};

export default ManualWorkoutBuilder;
