import React, { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle2, Calendar } from 'lucide-react';
import { Student } from '../types';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    parseISO,
    isValid,
    parse
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FrequencyCalendarModalProps {
    student?: Student;
    onClose: () => void;
}

const FrequencyCalendarModal: React.FC<FrequencyCalendarModalProps> = ({ student, onClose }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const historyDates = useMemo(() => {
        if (!student?.history) return [];

        return student.history.map(h => {
            let d: Date;
            // Handle both ISO and dd/mm/yyyy formats
            if (h.date.includes('/')) {
                // dd/mm/yyyy
                const parts = h.date.split('/');
                d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            } else {
                // Use new Date() for ISO strings to leverage potential UTC offset behavior if needed
                d = new Date(h.date);
            }
            // Normalize to noon to ensure consistent day comparison
            d.setHours(12, 0, 0, 0);
            return d;
        }).filter(d => isValid(d));
    }, [student]);

    const daysInMonth = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    // Fill empty days at start of month for alignment
    const startDayOfWeek = startOfMonth(currentDate).getDay(); // 0 (Sun) - 6 (Sat)
    const emptyDays = Array(startDayOfWeek).fill(null);

    const prevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
    const nextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

    return (
        <div className="fixed inset-0 z-[60] bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] w-full max-w-md shadow-2xl p-6 relative border dark:border-zinc-800 transition-colors animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                    <X size={24} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white">Histórico de Frequência</h3>
                        <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                            {student?.name}
                        </p>
                    </div>
                </div>

                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-2xl">
                    <button onClick={prevMonth} className="p-2 hover:bg-white dark:hover:bg-zinc-700/50 rounded-xl transition-colors text-zinc-500 dark:text-zinc-400">
                        <ChevronLeft size={20} />
                    </button>
                    <h4 className="font-black text-lg text-zinc-800 dark:text-white capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                    </h4>
                    <button onClick={nextMonth} className="p-2 hover:bg-white dark:hover:bg-zinc-700/50 rounded-xl transition-colors text-zinc-500 dark:text-zinc-400">
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Week Days */}
                <div className="grid grid-cols-7 mb-2">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                        <div key={i} className="text-center text-xs font-black text-zinc-300 dark:text-zinc-600 uppercase">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}

                    {daysInMonth.map((day) => {
                        const isHistory = historyDates.some(h => isSameDay(h, day));
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div
                                key={day.toISOString()}
                                className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold relative transition-all
                                    ${isHistory
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                        : isToday
                                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                    }
                                `}
                            >
                                {format(day, 'd')}
                                {isHistory && (
                                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 rounded-full p-0.5">
                                        <CheckCircle2 size={10} className="text-emerald-500" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 flex items-center justify-center gap-4 text-xs font-bold text-zinc-400 dark:text-zinc-500">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span>Treino Realizado</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800"></div>
                        <span>Hoje</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FrequencyCalendarModal;
