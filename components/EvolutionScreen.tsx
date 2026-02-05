
import React from 'react';
import { Student } from '../types';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Zap,
  BarChart3
} from 'lucide-react';

interface EvolutionScreenProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
}

const EvolutionScreen: React.FC<EvolutionScreenProps> = ({ students, onSelectStudent }) => {
  const getStatus = (history: any[]) => {
    if (history.length === 0) return { label: 'Sem dados', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-transparent' };
    const avgRpe = history.reduce((acc, curr) => acc + curr.rpe_avg, 0) / history.length;
    const avgComp = history.reduce((acc, curr) => acc + curr.completion, 0) / history.length;

    if (avgComp < 70) return { label: 'Em Alerta', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/50' };
    if (avgRpe < 7) return { label: 'Aumentar Carga', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700' };
    return { label: 'Consistente', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50' };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight transition-colors">Evolução Global</h2>
        <p className="text-zinc-400 dark:text-zinc-500 font-medium transition-colors">Acompanhe a performance de todos os seus alunos.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {students.map(student => {
          const status = getStatus(student.history);
          const lastWorkout = student.history[student.history.length - 1];
          const avgRpe = student.history.length > 0
            ? (student.history.reduce((acc, curr) => acc + curr.rpe_avg, 0) / student.history.length).toFixed(1)
            : '0';

          return (
            <div
              key={student.id}
              onClick={() => onSelectStudent(student)}
              className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-xl dark:hover:shadow-zinc-500/5 transition-all cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <img src={student.avatar} className="w-14 h-14 rounded-2xl object-cover" alt="" />
                  <div>
                    <h4 className="font-black text-zinc-800 dark:text-white text-lg group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">{student.name}</h4>
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border mt-1 ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8 flex-1 md:max-w-md">
                  <div className="space-y-1 text-center md:text-left transition-colors">
                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1 justify-center md:justify-start">
                      <BarChart3 size={12} /> RPE Médio
                    </p>
                    <p className="text-lg font-black text-zinc-800 dark:text-white transition-colors">{avgRpe}</p>
                  </div>
                  <div className="space-y-1 text-center md:text-left transition-colors">
                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1 justify-center md:justify-start">
                      <Zap size={12} /> Frequência
                    </p>
                    <p className="text-lg font-black text-zinc-800 dark:text-white transition-colors">{student.history.length} <span className="text-xs text-zinc-300 dark:text-zinc-700">treinos</span></p>
                  </div>
                  <div className="space-y-1 text-center md:text-left transition-colors">
                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1 justify-center md:justify-start">
                      <CheckCircle2 size={12} /> Conclusão
                    </p>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <p className="text-lg font-black text-zinc-800 dark:text-white transition-colors">
                        {student.history.length > 0 ? (student.history.reduce((a, b) => a + b.completion, 0) / student.history.length).toFixed(0) : 0}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl items-center justify-center text-zinc-300 dark:text-zinc-600 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>

              {lastWorkout && (
                <div className="mt-6 pt-6 border-t border-zinc-50 dark:border-zinc-800 flex items-center gap-4 text-zinc-400 dark:text-zinc-500 transition-colors">
                  <Clock size={14} />
                  <p className="text-[10px] font-bold uppercase tracking-widest">
                    Último registro em: {new Date(lastWorkout.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {students.length === 0 && (
        <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-[40px] border border-dashed border-zinc-200 dark:border-zinc-800 transition-colors">
          <TrendingUp className="mx-auto text-zinc-200 dark:text-zinc-800 mb-4" size={48} />
          <p className="text-zinc-400 dark:text-zinc-500 font-bold">Cadastre alunos para ver a evolução aqui.</p>
        </div>
      )}
    </div>
  );
};

export default EvolutionScreen;
