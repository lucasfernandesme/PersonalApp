
import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  CheckCircle2,
  Clock,
  ChevronRight,
  Dumbbell,
  Timer,
  Award,
  ArrowRight,
  ArrowLeft,
  Users,
  History,
  Zap,
  RotateCcw,
  Plus,
  X,
  Eye,
  Info,
  Loader2,
  Check
} from 'lucide-react';
import { TrainingProgram, Student } from '../types';

interface StudentAppProps {
  program?: TrainingProgram;
  students: Student[];
  currentStudentId: string;
  onSelectStudent: (student: Student) => void;
  onFinishWorkout: (stats: { rpe_avg: number; completion: number; weights: Record<string, string>; duration: number }) => void;
  onBack?: () => void;
}

const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return '';

  // Se já for um link de embed, apenas garantir que tenha os parâmetros de estilo
  if (url.includes('youtube.com/embed/')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?rel=0&modestbranding=1&autoplay=1`;
  }

  let videoId = '';
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0];
  } else if (url.includes('v=')) {
    videoId = url.split('v=')[1].split('&')[0];
  } else if (url.includes('youtube.com/shorts/')) {
    videoId = url.split('youtube.com/shorts/')[1].split('?')[0];
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1` : url;
};

const StudentApp: React.FC<StudentAppProps> = ({
  program,
  students,
  currentStudentId,
  onSelectStudent,
  onFinishWorkout,
  onBack
}) => {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>({});
  const [exerciseDetails, setExerciseDetails] = useState<Record<string, { weight: string, rpe: string }>>({});
  const [showExecutionGuide, setShowExecutionGuide] = useState<{ url: string, type: 'iframe' | 'image' | 'youtube', notes?: string } | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const restTimerRef = useRef<number | null>(null);

  const student = students.find(s => s.id === currentStudentId);

  useEffect(() => {
    setCurrentDayIndex(0);
    setActiveExerciseIndex(null);
    setCompletedExercises(new Set());
    setCompletedExercises(new Set());
    setCompletedSets({});
    setExerciseDetails({});
    setIsFinished(false);
    stopTimer();
    setSeconds(0);
    setIsWorkoutActive(false);
    setRestSeconds(null);
  }, [currentStudentId, program]);

  useEffect(() => {
    if (isWorkoutActive) {
      timerRef.current = window.setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [isWorkoutActive]);

  useEffect(() => {
    if (restSeconds !== null && restSeconds > 0) {
      restTimerRef.current = window.setInterval(() => {
        setRestSeconds(s => (s !== null ? s - 1 : null));
      }, 1000);
    } else if (restSeconds === 0) {
      setRestSeconds(null);
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    }
    return () => { if (restTimerRef.current) clearInterval(restTimerRef.current); };
  }, [restSeconds]);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [hrs, mins, secs]
      .map(v => v < 10 ? "0" + v : v)
      .filter((v, i) => v !== "00" || i > 0)
      .join(":");
  };

  if (!program || !program.split || program.split.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 text-slate-300 dark:text-slate-700 rounded-full flex items-center justify-center mb-6">
          <Dumbbell size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Sem Treino Ativo</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">Seu Personal ainda não liberou sua ficha de treino para este período.</p>
      </div>
    );
  }

  const currentDay = program.split[currentDayIndex] || program.split[0];

  const toggleExercise = (name: string, restTime: string = "60s") => {
    if (!isWorkoutActive) {
      alert("Inicie o treino para marcar os exercícios!");
      return;
    }
    const newCompleted = new Set(completedExercises);
    if (!newCompleted.has(name)) {
      newCompleted.add(name);

      const ex = currentDay.exercises.find(e => e.name === name);
      if (ex) {
        const setsCount = typeof ex.sets === 'number' ? ex.sets : parseInt(ex.sets) || 3;
        setCompletedSets(prev => ({
          ...prev,
          [name]: Array(setsCount).fill(true)
        }));
      }

      const secondsToRest = parseInt(restTime) || 60;
      setRestSeconds(secondsToRest);
    } else {
      newCompleted.delete(name);
      setRestSeconds(null);
    }
    setCompletedExercises(newCompleted);
  };

  const toggleSet = (exerciseName: string, setIndex: number, totalSets: number, restTime: string) => {
    if (!isWorkoutActive) return;

    setCompletedSets(prev => {
      const currentSets = prev[exerciseName] || Array(totalSets).fill(false);
      const newSets = [...currentSets];
      newSets[setIndex] = !newSets[setIndex];

      if (newSets.every(s => s === true)) {
        const newCompleted = new Set(completedExercises);
        newCompleted.add(exerciseName);
        setCompletedExercises(newCompleted);
      } else {
        const newCompleted = new Set(completedExercises);
        newCompleted.delete(exerciseName);
        setCompletedExercises(newCompleted);
      }

      if (newSets[setIndex]) {
        const secondsToRest = parseInt(restTime) || 60;
        setRestSeconds(secondsToRest);
      }

      return { ...prev, [exerciseName]: newSets };
    });
  };

  const updateDetail = (name: string, field: 'weight' | 'rpe', value: string) => {
    setExerciseDetails(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        [field]: value
      }
    }));
  };

  const handleFinish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (completedExercises.size === 0) {
      alert("Realize ao menos um exercício antes de finalizar!");
      return;
    }

    const totalEx = currentDay?.exercises?.length || 1;
    const completion = Math.round((completedExercises.size / totalEx) * 100);

    const weights: Record<string, string> = {};
    Object.entries(exerciseDetails).forEach(([name, details]: [string, any]) => {
      if (details.weight) weights[name] = details.weight;
    });

    const rpeValues = Object.values(exerciseDetails)
      .map((d: any) => parseInt(d.rpe))
      .filter(v => !isNaN(v));

    const rpe_avg = rpeValues.length > 0
      ? Math.round(rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length)
      : 7;

    setIsWorkoutActive(false);
    setIsFinished(true);
    stopTimer();

    setTimeout(() => {
      onFinishWorkout({ rpe_avg, completion, weights, duration: seconds });
    }, 2000);
  };

  const getLastWeight = (exerciseName: string) => {
    if (!student?.history || student.history.length === 0) return null;
    const lastSession = student.history[student.history.length - 1];
    return lastSession.weights?.[exerciseName] || null;
  };

  if (isFinished) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-100/50 dark:shadow-emerald-900/10">
          <Award size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Treino Concluído!</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Excelente trabalho hoje. Suas cargas foram salvas na ficha.</p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Tempo Total</p>
            <p className="text-xl font-black text-slate-800 dark:text-white">{formatTime(seconds)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Conclusão</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{Math.round((completedExercises.size / (currentDay?.exercises?.length || 1)) * 100)}%</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-44 animate-in fade-in duration-300">
      {/* Rest Timer Overlay */}
      {restSeconds !== null && restSeconds >= 0 && (
        <div className="fixed top-20 left-4 right-4 z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-[28px] p-3 flex items-center justify-between shadow-2xl border border-slate-800 dark:border-slate-800 backdrop-blur-md bg-slate-900/95 dark:bg-slate-950/95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-indigo-600/20">
                <span className="text-[7px] font-black uppercase text-white/60">Rest</span>
                <span className="text-lg font-black tabular-nums">{restSeconds}</span>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-indigo-400">Tempo de Descanso</p>
                <p className="text-[10px] font-bold text-white/80">Recupere-se para a próxima série</p>
              </div>
            </div>

            <button
              onClick={() => setRestSeconds(0)}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm mb-6 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Meu Treino</h2>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{program.name}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-2xl border transition-all ${isWorkoutActive ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800'}`}>
            <Timer size={16} className={isWorkoutActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'} />
            <span className="tabular-nums">{formatTime(seconds)}</span>
          </div>
        </div>
      </div>

      {!isWorkoutActive && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {program.split.map((d, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentDayIndex(i);
                setCompletedExercises(new Set());
                setActiveExerciseIndex(null);
                setCompletedSets({});
              }}
              className={`flex-shrink-0 min-w-[90px] px-4 py-3 rounded-2xl text-xs font-black uppercase transition-all border ${currentDayIndex === i
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'
                }`}
            >
              {d.day}
            </button>
          ))}
        </div>
      )}

      <div className={`bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-200 dark:border-slate-800 flex flex-col gap-4 relative overflow-hidden shadow-sm transition-all ${isWorkoutActive ? 'ring-2 ring-indigo-500' : ''}`}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">Foco do Dia</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{currentDay.label}</h3>
        </div>

        {!isWorkoutActive ? (
          <button
            onClick={() => setIsWorkoutActive(true)}
            className="relative z-10 w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl hover:bg-slate-800 dark:hover:bg-slate-100"
          >
            <Play size={18} fill="currentColor" />
            Iniciar Sessão
          </button>
        ) : (
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase bg-emerald-50 dark:bg-emerald-900/20 w-fit px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Ativo
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 relative z-10">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Exercícios</p>
            <p className="text-lg font-black text-slate-800 dark:text-white">{currentDay.exercises.length}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Concluídos</p>
            <p className="text-lg font-black text-slate-800 dark:text-white">{completedExercises.size}/{currentDay.exercises.length}</p>
          </div>
        </div>
        <Dumbbell className="absolute -right-6 -bottom-6 w-32 h-32 text-slate-50 dark:text-slate-800/50 -rotate-12 transition-colors" />
      </div>

      <div className={`space-y-3 transition-all duration-500 ${!isWorkoutActive ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
        {currentDay.exercises.map((ex, idx) => {
          const isCompleted = completedExercises.has(ex.name);
          const lastWeight = getLastWeight(ex.name);
          const setsCount = typeof ex.sets === 'number' ? ex.sets : parseInt(ex.sets) || 3;
          const currentSets = completedSets[ex.name] || Array(setsCount).fill(false);
          const doneSetsCount = currentSets.filter(s => s).length;

          return (
            <div
              key={idx}
              className={`bg-white dark:bg-slate-900 rounded-[28px] border transition-all ${activeExerciseIndex === idx
                ? 'border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900/20 shadow-lg'
                : 'border-slate-200 dark:border-slate-800'
                } ${isCompleted ? 'bg-slate-50 dark:bg-slate-800/40 border-emerald-100 dark:border-emerald-900/40' : ''}`}
            >
              <div
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setActiveExerciseIndex(activeExerciseIndex === idx ? null : idx)}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExercise(ex.name, ex.rest);
                    }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isCompleted
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                      }`}
                  >
                    <CheckCircle2 size={26} />
                  </button>
                  <div>
                    <h4 className={`font-bold text-sm transition-all ${isCompleted ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-white'}`}>
                      {ex.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${isCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        }`}>
                        {doneSetsCount}/{setsCount} Séries
                      </span>
                      {lastWeight && !isCompleted && (
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <History size={10} /> Ant: {lastWeight}kg
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isCompleted && ex.videoUrl && (
                    <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-400 dark:text-indigo-500 rounded-lg flex items-center justify-center">
                      <Eye size={16} />
                    </div>
                  )}
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-300 dark:text-slate-600 transition-colors">
                    <ChevronRight className={`transition-transform duration-300 ${activeExerciseIndex === idx ? 'rotate-90 text-indigo-500' : ''}`} size={18} />
                  </div>
                </div>
              </div>

              {activeExerciseIndex === idx && (
                <div className="px-5 pb-6 pt-2 border-t border-slate-50 dark:border-slate-800 space-y-5 animate-in slide-in-from-top-2 duration-300">

                  {/* Set Tracker UI */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Acompanhamento de Séries</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full transition-colors">{ex.reps} Reps</p>
                        <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors">
                          <Clock size={10} /> {ex.rest} Descanso
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentSets.map((isSetDone, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => toggleSet(ex.name, sIdx, setsCount, ex.rest)}
                          className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center border-2 transition-all active:scale-90 ${isSetDone
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-indigo-200 dark:hover:border-indigo-900'
                            }`}
                        >
                          <span className="text-[9px] font-black uppercase opacity-60">Série</span>
                          <span className="text-sm font-black">{sIdx + 1}</span>
                          {isSetDone && <Check size={10} className="mt-0.5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-slate-50 dark:bg-slate-800 w-full transition-colors"></div>

                  {/* Guia de Execução Inteligente (In-App) */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setIsImageLoading(true);
                        if (ex.videoUrl && ex.videoUrl.startsWith('http')) {
                          // YouTube Embed ou link manual (limpa o link automaticamente)
                          setShowExecutionGuide({ url: getYouTubeEmbedUrl(ex.videoUrl), type: 'youtube', notes: ex.notes });
                        } else if (ex.videoUrl) {
                          // GIFs locais
                          setShowExecutionGuide({ url: ex.videoUrl, type: 'image', notes: ex.notes });
                        } else {
                          // YouTube Search Fallback incorporado
                          const query = encodeURIComponent(`como fazer ${ex.name} musculação`);
                          setShowExecutionGuide({
                            url: `https://www.youtube.com/embed?listType=search&list=${query}&modestbranding=1&rel=0`,
                            type: 'youtube',
                            notes: ex.notes
                          });
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all border border-indigo-100 dark:border-indigo-800"
                    >
                      <Info size={14} />
                      {ex.videoUrl ? 'Ver Guia de Execução' : 'Como Fazer? (Guia Rápido)'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 ml-2">Carga Usada (kg)</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder={ex.weight?.toString() || "0"}
                          value={exerciseDetails[ex.name]?.weight ?? (ex.weight?.toString() || '')}
                          onChange={(e) => updateDetail(ex.name, 'weight', e.target.value)}
                          className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 rounded-2xl py-3.5 px-4 text-sm font-black text-slate-900 dark:text-white transition-all shadow-inner"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 ml-2">Dificuldade</label>
                      <select
                        value={exerciseDetails[ex.name]?.rpe || ''}
                        onChange={(e) => updateDetail(ex.name, 'rpe', e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 rounded-2xl py-3.5 px-4 text-sm font-black text-slate-700 dark:text-slate-300 transition-all shadow-inner"
                      >
                        <option value="">Selecione</option>
                        <option value="1">Muito Leve</option>
                        <option value="2">Leve</option>
                        <option value="3">Moderada</option>
                        <option value="4">Pouco Intensa</option>
                        <option value="5">Intensa</option>
                        <option value="6">Muito Intensa</option>
                        <option value="7">Exaustão Máxima</option>
                      </select>
                    </div>
                  </div>

                  {ex.notes && (
                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
                      <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase mb-1">Dica do Personal</p>
                      <p className="text-xs text-indigo-900 dark:text-indigo-200 font-medium leading-relaxed italic">"{ex.notes}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Execution Guide Modal (In-App Experience) */}
      {showExecutionGuide && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[40px] overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 border dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                  <Play size={20} fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Tutorial de Execução</h3>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mantenha a postura correta</p>
                </div>
              </div>
              <button
                onClick={() => setShowExecutionGuide(null)}
                className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="w-full bg-slate-950 relative aspect-video">
              {isImageLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-950">
                  <Loader2 size={32} className="text-indigo-400 animate-spin mb-2" />
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest">Carregando Guia...</span>
                </div>
              )}

              {showExecutionGuide.type === 'image' ? (
                <img
                  src={showExecutionGuide.url}
                  className={`w-full h-full object-contain transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                  alt="Execution Guide"
                  onLoad={() => setIsImageLoading(false)}
                />
              ) : (
                <iframe
                  src={showExecutionGuide.url}
                  className={`w-full h-full border-0 transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => setIsImageLoading(false)}
                />
              )}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Dica de Ouro</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">
                    {showExecutionGuide.notes || "Controle o peso na descida e sinta a musculatura trabalhando. 🧠💪"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExecutionGuide(null)}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl active:scale-[0.98] transition-all hover:bg-slate-800 dark:hover:bg-slate-100"
              >
                Voltar para o Treino
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botão Encerrar Treino */}
      {isWorkoutActive && (
        <div className="fixed bottom-24 left-4 right-4 z-[40] animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-indigo-600 p-1 rounded-[32px] shadow-2xl shadow-indigo-600/40">
            <button
              onClick={handleFinish}
              className="w-full bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-black uppercase text-[11px] tracking-[0.2em] py-4 rounded-[28px] flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Encerrar Treino
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentApp;
