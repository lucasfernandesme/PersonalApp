
import React from 'react';
import { Student } from '../types';
import {
  TrendingUp,
  Calendar,
  Zap,
  CheckCircle2,
  Trophy,
  History,
  Dumbbell,
  ArrowLeft
} from 'lucide-react';
import { translateExperience } from '../utils/formatters';

interface StudentProgressScreenProps {
  student: Student;
  onBack: () => void;
}

const StudentProgressScreen: React.FC<StudentProgressScreenProps> = ({ student, onBack }) => {
  const history = student.history || [];

  const stats = {
    totalWorkouts: history.length,
    avgCompletion: history.length > 0
      ? Math.round(history.reduce((acc, curr) => acc + curr.completion, 0) / history.length)
      : 0,
    avgRpe: history.length > 0
      ? (history.reduce((acc, curr) => acc + curr.rpe_avg, 0) / history.length).toFixed(1)
      : '0',
    lastWeights: history.length > 0 ? history[history.length - 1].weights : {}
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Meu Progresso</h2>
          <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500">Veja como está sua evolução nos treinos.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Zap className="text-amber-500" size={20} />}
          label="Treinos"
          value={stats.totalWorkouts}
          unit="sessões"
        />
        <StatCard
          icon={<CheckCircle2 className="text-emerald-500" size={20} />}
          label="Consistência"
          value={`${stats.avgCompletion}%`}
          unit="média"
        />
        <StatCard
          icon={<TrendingUp className="text-zinc-900 dark:text-zinc-100" size={20} />}
          label="Esforço"
          value={stats.avgRpe}
          unit="RPE médio"
        />
        <StatCard
          icon={<Trophy className="text-orange-500" size={20} />}
          label="Nível"
          value={translateExperience(student.experience)}
          unit="experiência"
          isUpper
        />
      </div>

      {/* Last Session Weights */}
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm transition-colors">
        <h3 className="font-black text-zinc-800 dark:text-white text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
          <Dumbbell size={18} className="text-zinc-900 dark:text-zinc-100" />
          Últimas Cargas Registradas
        </h3>
        {stats.lastWeights && Object.keys(stats.lastWeights).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(stats.lastWeights).map(([ex, weight]) => (
              <div key={ex} className="flex justify-between items-center p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-800 transition-colors">
                <span className="font-bold text-zinc-700 dark:text-zinc-300 text-sm">{ex}</span>
                <span className="font-black text-zinc-900 dark:text-zinc-100">{weight}kg</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-6 text-zinc-400 dark:text-zinc-500 font-medium">Nenhuma carga registrada recentemente.</p>
        )}
      </div>

      {/* History Timeline */}
      <div className="space-y-4">
        <h3 className="font-black text-zinc-800 dark:text-white text-sm uppercase tracking-widest flex items-center gap-2">
          <History size={18} className="text-zinc-400 dark:text-zinc-600" />
          Histórico de Atividades
        </h3>
        <div className="space-y-3">
          {history.length > 0 ? (
            [...history].reverse().map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-900 p-5 rounded-[24px] border border-zinc-100 dark:border-zinc-800 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="font-black text-zinc-800 dark:text-white text-sm">
                      {new Date(item.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Sessão Finalizada</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full border border-emerald-100 dark:border-emerald-800 transition-colors">
                    {item.completion}%
                  </span>
                  <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-[10px] font-black rounded-full border border-zinc-200 dark:border-zinc-700 transition-colors">
                    RPE {item.rpe_avg}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-[32px] border border-dashed border-zinc-200 dark:border-zinc-800 transition-colors">
              <p className="text-zinc-400 dark:text-zinc-500 font-bold">Nenhum treino registrado ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, unit, isUpper = false }: { icon: React.ReactNode, label: string, value: string | number, unit: string, isUpper?: boolean }) => (
  <div className="bg-white dark:bg-zinc-900 p-5 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-1 transition-colors">
    <div className="mb-2">{icon}</div>
    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{label}</p>
    <p className={`text-xl font-black text-zinc-800 dark:text-white ${isUpper ? 'capitalize' : ''}`}>{value}</p>
    <p className="text-[9px] font-bold text-zinc-300 dark:text-zinc-600 uppercase">{unit}</p>
  </div>
);

export default StudentProgressScreen;
