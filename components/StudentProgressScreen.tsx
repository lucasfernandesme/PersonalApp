
import React from 'react';
import { Student } from '../types';
import { 
  TrendingUp, 
  Calendar, 
  Zap, 
  CheckCircle2, 
  Trophy,
  History,
  Dumbbell
} from 'lucide-react';

interface StudentProgressScreenProps {
  student: Student;
}

const StudentProgressScreen: React.FC<StudentProgressScreenProps> = ({ student }) => {
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
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Meu Progresso</h2>
        <p className="text-slate-400 font-medium">Veja como está sua evolução nos treinos.</p>
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
          icon={<TrendingUp className="text-indigo-500" size={20} />} 
          label="Esforço" 
          value={stats.avgRpe} 
          unit="RPE médio"
        />
        <StatCard 
          icon={<Trophy className="text-orange-500" size={20} />} 
          label="Nível" 
          value={student.experience} 
          unit="experiência"
          isUpper
        />
      </div>

      {/* Last Session Weights */}
      <div className="bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm">
        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
          <Dumbbell size={18} className="text-indigo-600" />
          Últimas Cargas Registradas
        </h3>
        {stats.lastWeights && Object.keys(stats.lastWeights).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(stats.lastWeights).map(([ex, weight]) => (
              <div key={ex} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-700 text-sm">{ex}</span>
                <span className="font-black text-indigo-600">{weight}kg</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-6 text-slate-400 font-medium">Nenhuma carga registrada recentemente.</p>
        )}
      </div>

      {/* History Timeline */}
      <div className="space-y-4">
        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
          <History size={18} className="text-slate-400" />
          Histórico de Atividades
        </h3>
        <div className="space-y-3">
          {history.length > 0 ? (
            [...history].reverse().map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-[24px] border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">
                      {new Date(item.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Sessão Finalizada</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100">
                    {item.completion}%
                  </span>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100">
                    RPE {item.rpe_avg}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold">Nenhum treino registrado ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, unit, isUpper = false }: { icon: React.ReactNode, label: string, value: string | number, unit: string, isUpper?: boolean }) => (
  <div className="bg-white p-5 rounded-[32px] border border-slate-200 shadow-sm flex flex-col gap-1">
    <div className="mb-2">{icon}</div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className={`text-xl font-black text-slate-800 ${isUpper ? 'capitalize' : ''}`}>{value}</p>
    <p className="text-[9px] font-bold text-slate-300 uppercase">{unit}</p>
  </div>
);

export default StudentProgressScreen;
