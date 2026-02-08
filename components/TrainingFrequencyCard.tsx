import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Student } from '../types';
import FrequencyCalendarModal from './FrequencyCalendarModal';
import { parseISO } from 'date-fns';

interface TrainingFrequencyCardProps {
    student?: Student;
}

export const TrainingFrequencyCard: React.FC<TrainingFrequencyCardProps> = ({ student }) => {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Calcular dias da semana com treino
    const today = new Date().getDay(); // 0 = Domingo, 1 = Segunda, etc
    const daysOfWeek = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

    // 1. Identificar dias ALVO (Target) baseados no nome do treino (ex: "Segunda", "Treino A")
    // Se o nome do treino contiver o dia da semana, marcamos como alvo.
    const trainingDays: number[] = [];

    if (student?.program?.split && Array.isArray(student.program.split)) {
        student.program.split.forEach(day => {
            if (!day || !day.label || !day.day) return;
            const label = (day.label + " " + day.day).toLowerCase();
            if (label.includes('domingo')) trainingDays.push(0);
            if (label.includes('segunda')) trainingDays.push(1);
            if (label.includes('terça') || label.includes('terca')) trainingDays.push(2);
            if (label.includes('quarta')) trainingDays.push(3);
            if (label.includes('quinta')) trainingDays.push(4);
            if (label.includes('sexta')) trainingDays.push(5);
            if (label.includes('sábado') || label.includes('sabado')) trainingDays.push(6);
        });
    }

    // 2. Identificar dias COMPLETOS (History) na semana atual
    const completedDays: number[] = [];

    if (student?.history && Array.isArray(student.history)) {
        const now = new Date();
        const startOfWeek = new Date(now);

        // Ajustar para começar na Segunda-feira
        const day = now.getDay(); // 0 (Dom) a 6 (Sab)
        // Se for Domingo (0), subtrai 6 dias para voltar à Segunda
        // Se for Segunda (1), subtrai 0 dias
        // Fórmula: (day + 6) % 7
        const diff = (day + 6) % 7;

        startOfWeek.setDate(now.getDate() - diff);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        student.history.forEach(h => {
            if (!h || !h.date) return;
            // Converter data dd/mm/yyyy ou ISO para Date
            let entryDate: Date;

            try {
                if (h.date.includes('/')) {
                    // Formato PT-BR dd/mm/yyyy
                    const dateParts = h.date.split('/');
                    if (dateParts.length === 3) {
                        entryDate = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
                    } else {
                        return;
                    }
                } else {
                    // Tentar ISO com parseISO (evita shift de fuso horário)
                    entryDate = parseISO(h.date);
                }

                // Check for Invalid Date
                if (isNaN(entryDate.getTime())) return;

                // Normalize time to avoid timezone edge cases when comparing
                entryDate.setHours(12, 0, 0, 0);

                if (entryDate >= startOfWeek && entryDate <= endOfWeek) {
                    completedDays.push(entryDate.getDay());
                }
            } catch (e) {
                console.warn("Invalid date in history:", h.date);
            }
        });
    }

    return (
        <>
            <div
                onClick={() => setIsCalendarOpen(true)}
                className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm w-full transition-colors duration-300 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 group relative"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-zinc-800 dark:text-white font-black text-sm uppercase tracking-tight">Frequência de Treinos</h3>
                    <span className="text-[10px] uppercase font-bold text-zinc-900 dark:text-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity">Ver Histórico</span>
                </div>

                <div className="flex justify-between items-center">
                    {daysOfWeek.map((day, index) => {
                        // Ajuste de índice: 0 (Segunda) -> 1 (Date.getDay()), 6 (Domingo) -> 0
                        const dayValue = (index + 1) % 7;

                        const isTrainingDay = trainingDays.includes(dayValue);
                        const isCompleted = completedDays.includes(dayValue);
                        const isToday = dayValue === today;

                        return (
                            <div key={index} className="flex flex-col items-center gap-2">
                                <div
                                    className={`w-9 h-9 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${isCompleted
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                                        : isTrainingDay
                                            ? 'border-2 border-emerald-400 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30'
                                            : isToday
                                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700'
                                                : 'border border-zinc-100 dark:border-zinc-800 text-zinc-300 dark:text-zinc-600'
                                        }`}
                                >
                                    {isCompleted ? <CheckCircle2 size={20} /> : day}
                                </div>
                                {isToday && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {isCalendarOpen && (
                <FrequencyCalendarModal
                    student={student}
                    onClose={() => setIsCalendarOpen(false)}
                />
            )}
        </>
    );
};
