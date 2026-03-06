
import React, { useState, useMemo } from 'react';
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
  role?: string;
}

const StudentProgressScreen: React.FC<StudentProgressScreenProps> = ({ student, onBack, role }) => {
  const isTrainer = role === 'TRAINER';
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
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            {isTrainer ? `Evolução: ${student.name.split(' ')[0]}` : 'Meu Progresso'}
          </h2>
          <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
            {isTrainer ? `Acompanhe o desempenho de ${student.name.split(' ')[0]}.` : 'Veja como está sua evolução nos treinos.'}
          </p>
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

      {/* Load Evolution Chart */}
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm transition-colors">
        <h3 className="font-black text-zinc-800 dark:text-white text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-500" />
          Evolução de Cargas
        </h3>
        <LoadEvolutionChart history={history} />
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
                <span className="font-black text-zinc-900 dark:text-zinc-100">{String(weight).substring(0, 6)}kg</span>
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

const LoadEvolutionChart = ({ history }: { history: any[] }) => {
  const availableExercises = useMemo(() => {
    const exercises = new Set<string>();
    history.forEach(session => {
      if (session.weights) {
        Object.keys(session.weights).forEach(ex => exercises.add(ex));
      }
    });
    return Array.from(exercises).sort();
  }, [history]);

  const [selectedExercise, setSelectedExercise] = useState<string>(availableExercises[0] || '');

  React.useEffect(() => {
    if (!selectedExercise && availableExercises.length > 0) {
      setSelectedExercise(availableExercises[0]);
    }
  }, [availableExercises, selectedExercise]);

  const chartData = useMemo(() => {
    if (!selectedExercise) return [];
    return history
      .filter(s => s.weights && s.weights[selectedExercise])
      .map(s => {
        const rawW = String(s.weights[selectedExercise]);
        const w = parseFloat(rawW.replace(',', '.').replace(/[^0-9.]/g, '')) || 0;
        return {
          date: new Date(s.date),
          weight: w,
          rawDate: s.date
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [history, selectedExercise]);

  if (availableExercises.length === 0) {
    return (
      <div className="py-8 text-center text-zinc-400 dark:text-zinc-500 font-medium">Nenhum histórico de cargas para exibir o gráfico.</div>
    )
  }

  const width = 100;
  const height = 40;
  const paddingX = 5;
  const paddingY = 8;

  const points = chartData.filter(d => d.weight > 0);

  if (points.length < 2) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl font-bold text-sm text-zinc-800 dark:text-zinc-200 outline-none w-full appearance-none pr-10 hover:border-emerald-500/50 transition-colors"
          >
            {availableExercises.map(ex => (
              <option key={ex} value={ex}>{ex}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
          </div>
        </div>
        <div className="py-8 text-center text-zinc-400 dark:text-zinc-500 font-medium text-xs">Acesse mais sessões para este exercício para gerar o gráfico.</div>
      </div>
    );
  }

  const minWeight = Math.min(...points.map(p => p.weight));
  const maxWeight = Math.max(...points.map(p => p.weight));
  const weightRange = maxWeight - minWeight || 1;
  const minDate = points[0].date.getTime();
  const maxDate = points[points.length - 1].date.getTime();
  const timeRange = maxDate - minDate || 1;

  const getX = (date: Date) => paddingX + ((date.getTime() - minDate) / timeRange) * (width - paddingX * 2);
  const getY = (w: number) => height - paddingY - ((w - minWeight) / weightRange) * (height - paddingY * 2);

  const pathD = `M ${points.map(p => `${getX(p.date)},${getY(p.weight)}`).join(' L ')}`;

  return (
    <div className="space-y-6">
      <div className="relative">
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl font-bold text-sm text-zinc-800 dark:text-zinc-200 outline-none w-full appearance-none pr-10 hover:border-emerald-500/50 transition-colors cursor-pointer"
        >
          {availableExercises.map(ex => (
            <option key={ex} value={ex}>{ex}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
      </div>

      <div className="relative w-full aspect-[2/1] bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 flex flex-col">
        {/* Y Axis Labels */}
        <div className="absolute left-2 top-2 text-[8px] font-black text-zinc-400">{maxWeight.toFixed(1)}kg</div>
        <div className="absolute left-2 bottom-6 text-[8px] font-black text-zinc-400">{minWeight.toFixed(1)}kg</div>

        {/* X Axis Labels */}
        <div className="absolute left-4 bottom-2 text-[8px] font-black text-zinc-400">
          {points[0].date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
        </div>
        <div className="absolute right-4 bottom-2 text-[8px] font-black text-zinc-400">
          {points[points.length - 1].date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid Lines */}
          <line x1={paddingX} y1={getY(minWeight)} x2={width - paddingX} y2={getY(minWeight)} stroke="currentColor" className="text-zinc-200 dark:text-zinc-700" strokeWidth="0.5" strokeDasharray="1 1" />
          <line x1={paddingX} y1={getY(maxWeight)} x2={width - paddingX} y2={getY(maxWeight)} stroke="currentColor" className="text-zinc-200 dark:text-zinc-700" strokeWidth="0.5" strokeDasharray="1 1" />

          {/* Area gradient */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`${pathD} L ${getX(points[points.length - 1].date)},${height - paddingY} L ${getX(points[0].date)},${height - paddingY} Z`}
            fill="url(#chartGradient)"
          />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={getX(p.date)}
                cy={getY(p.weight)}
                r="1"
                fill="#fff"
                stroke="#10b981"
                strokeWidth="0.5"
              />
              {points.length <= 8 && (
                <text
                  x={getX(p.date)}
                  y={getY(p.weight) - 2}
                  fontSize="3"
                  fontWeight="bold"
                  fill="currentColor"
                  textAnchor="middle"
                  className="text-zinc-500 dark:text-zinc-400"
                >
                  {p.weight}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default StudentProgressScreen;
