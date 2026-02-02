
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Student } from '../types';

interface TrainingFrequencyCardProps {
    student?: Student;
}

export const TrainingFrequencyCard: React.FC<TrainingFrequencyCardProps> = ({ student }) => {
    // Calcular dias da semana com treino
    const today = new Date().getDay(); // 0 = Domingo, 1 = Segunda, etc
    const daysOfWeek = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

    // 1. Identificar dias ALVO (Target) baseados no nome do treino (ex: "Segunda", "Treino A")
    // Se o nome do treino contiver o dia da semana, marcamos como alvo.
    const trainingDays: number[] = [];

    if (student?.program?.split) {
        student.program.split.forEach(day => {
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

    if (student?.history) {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Domingo da semana atual
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        student.history.forEach(h => {
            // Converter data dd/mm/yyyy ou ISO para Date
            let dateParts = h.date.split('/');
            let entryDate: Date;

            if (dateParts.length === 3) {
                // Formato PT-BR dd/mm/yyyy
                entryDate = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
            } else {
                // Tentar ISO
                entryDate = new Date(h.date);
            }

            if (entryDate >= startOfWeek && entryDate <= endOfWeek) {
                completedDays.push(entryDate.getDay());
            }
        });
    }

    return (
        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm w-full">
            <h3 className="text-slate-800 font-black text-sm mb-4 uppercase tracking-tight">Frequência de Treinos</h3>
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
                                        ? 'border-2 border-emerald-400 text-emerald-600 bg-emerald-50'
                                        : isToday
                                            ? 'bg-amber-100 text-amber-600 border border-amber-200'
                                            : 'border border-slate-100 text-slate-300'
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
    );
};
