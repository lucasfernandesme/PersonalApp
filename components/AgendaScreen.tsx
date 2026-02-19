import React, { useState } from 'react';
import {
    format,
    startOfWeek,
    addDays,
    startOfMonth,
    endOfMonth,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    parseISO,
    isWithinInterval
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, User, Plus, X } from 'lucide-react';
import { ScheduleEvent, Student } from '../types';

interface AgendaScreenProps {
    events: ScheduleEvent[];
    students: Student[];
    onAddEvent: (date: Date) => void;
    onEditEvent: (event: ScheduleEvent) => void;
    onClose: () => void;
}

const AgendaScreen: React.FC<AgendaScreenProps> = ({ events, students, onAddEvent, onEditEvent, onClose }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const renderHeader = () => {
        return (
            <div className="flex flex-col mb-8">
                {/* Standardized Brand Header */}
                <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 transition-all duration-300 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 relative flex-shrink-0 mb-6">
                    <div className="w-10"></div> {/* Placeholder for symmetry */}

                    <div className="flex items-center gap-2">
                        <img src="/logo.jpg" alt="PersonalFlow" className="w-8 h-8 rounded-full shadow-sm" />
                        <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">PersonalFlow</span>
                    </div>

                    <button onClick={onClose} className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-red-500 transition-colors z-10 w-10 flex justify-end">
                        <X size={20} />
                    </button>
                </header>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-zinc-900 dark:text-zinc-100">
                            <CalendarIcon size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-zinc-800 dark:text-white capitalize">
                                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                            </h2>
                            <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500">Gerencie seus horários</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); setCurrentMonth(subMonths(currentMonth, 1)); }}
                            className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 dark:text-zinc-500 border border-zinc-100 dark:border-zinc-800"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setCurrentMonth(addMonths(currentMonth, 1)); }}
                            className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 dark:text-zinc-500 border border-zinc-100 dark:border-zinc-800"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = [];
        const dateFormat = "EEEE";
        const startDate = startOfWeek(currentMonth);

        for (let i = 0; i < 7; i++) {
            days.push(
                <div className="text-center font-bold text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2" key={i}>
                    {format(addDays(startDate, i), dateFormat, { locale: ptBR }).substring(0, 3)}
                </div>
            );
        }

        return <div className="grid grid-cols-7 mb-2">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        console.log('[AgendaScreen] renderCells. Total events:', events.length);

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;

                // Find events for this day
                const dayEvents = events.filter(e => {
                    const eventDate = parseISO(e.start);
                    const match = isSameDay(eventDate, cloneDay);
                    // Log only if it's the target date (e.g. 18th) and event is the one being edited (roughly check time)
                    if (cloneDay.getDate() === 18) {
                        console.log(`[AgendaScreen] Checking event ${e.title} (${e.start}) against ${cloneDay.toISOString()}: ${match}`);
                    }
                    return match;
                });
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);

                days.push(
                    <button
                        type="button"
                        className={`min-h-[80px] p-2 border border-zinc-100 dark:border-zinc-800 relative transition-colors cursor-pointer group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-left w-full
              ${!isCurrentMonth ? "bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-300 dark:text-zinc-700" : "bg-white dark:bg-zinc-900"}
              ${isSelected ? "ring-2 ring-zinc-900 dark:ring-white ring-inset z-10" : ""}
              ${i === 0 ? "rounded-l-2xl" : ""} ${i === 6 ? "rounded-r-2xl" : ""}
            `}
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(cloneDay)}
                    >
                        <span className={`text-sm font-bold ${!isCurrentMonth ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-700 dark:text-zinc-300"}`}>
                            {formattedDate}
                        </span>

                        <div className="mt-1 space-y-1">
                            {dayEvents.slice(0, 2).map((event, idx) => {
                                // Color based on status
                                const statusColors = {
                                    completed: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700',
                                    cancelled: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
                                    planned: 'bg-zinc-100 dark:bg-zinc-800 border-transparent dark:border-zinc-700'
                                };
                                const statusTextColors = {
                                    completed: 'text-emerald-900 dark:text-emerald-100',
                                    cancelled: 'text-red-900 dark:text-red-100',
                                    planned: 'text-zinc-900 dark:text-white'
                                };

                                return (
                                    <div key={idx} className={`px-1.5 py-0.5 rounded-md truncate border ${statusColors[event.status] || statusColors.planned}`}>
                                        <p className={`text-[9px] font-bold truncate ${statusTextColors[event.status] || statusTextColors.planned}`}>
                                            {format(parseISO(event.start), 'HH:mm')} {event.title}
                                        </p>
                                    </div>
                                );
                            })}
                            {dayEvents.length > 2 && (
                                <p className="text-[9px] font-bold text-zinc-400 pl-1">+{dayEvents.length - 2} mais</p>
                            )}
                        </div>

                        {/* Hover Add Button */}
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddEvent(cloneDay);
                            }}
                            role="button"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg shadow-sm hover:scale-110 transition-all z-20"
                        >
                            <Plus size={12} />
                        </div>
                    </button>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="space-y-1">{rows}</div>;
    };

    const renderSelectedDayDetails = () => {
        const dayEvents = events.filter(e => isSameDay(parseISO(e.start), selectedDate))
            .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());

        return (
            <div className="mt-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-[28px] p-6 animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-zinc-800 dark:text-white flex items-center gap-2">
                        Agenda de {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                        <span className="text-sm font-medium text-zinc-400 bg-white dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-100 dark:border-zinc-800">
                            {dayEvents.length} {dayEvents.length === 1 ? 'evento' : 'eventos'}
                        </span>
                    </h3>
                    <button
                        onClick={() => onAddEvent(selectedDate)}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors shadow-lg shadow-zinc-900/20 dark:shadow-none"
                    >
                        <Plus size={16} /> Nova Aula
                    </button>
                </div>

                <div className="space-y-3">
                    {dayEvents.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="text-zinc-400 dark:text-zinc-500 text-sm font-medium">Nenhum agendamento para este dia.</p>
                        </div>
                    ) : (
                        dayEvents.map(event => {
                            // Color based on status
                            const statusBorderColors = {
                                completed: 'border-emerald-300 dark:border-emerald-700 hover:border-emerald-400 dark:hover:border-emerald-600',
                                cancelled: 'border-red-300 dark:border-red-700 hover:border-red-400 dark:hover:border-red-600',
                                planned: 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                            };
                            const statusBgColors = {
                                completed: 'bg-emerald-50/50 dark:bg-emerald-900/10',
                                cancelled: 'bg-red-50/50 dark:bg-red-900/10',
                                planned: 'bg-white dark:bg-zinc-900'
                            };
                            const statusTimeBadgeColors = {
                                completed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                                cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
                                planned: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-700'
                            };

                            return (
                                <div
                                    key={event.id}
                                    onClick={() => onEditEvent(event)}
                                    className={`p-4 rounded-2xl border-2 shadow-sm transition-all cursor-pointer group ${statusBgColors[event.status] || statusBgColors.planned} ${statusBorderColors[event.status] || statusBorderColors.planned}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2 ${statusTimeBadgeColors[event.status] || statusTimeBadgeColors.planned}`}>
                                                <span className="text-xs font-bold">{format(parseISO(event.start), 'HH')}</span>
                                                <span className="text-[10px] opacity-70">:{format(parseISO(event.start), 'mm')}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-zinc-900 dark:text-white text-base group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                                                    {event.title}
                                                </h4>
                                                <div className="flex flex-col gap-1 mt-1">
                                                    {event.studentName && (
                                                        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                                                            <User size={12} />
                                                            <span className="text-xs font-bold">{event.studentName}</span>
                                                        </div>
                                                    )}
                                                    {event.location && (
                                                        <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
                                                            <MapPin size={12} />
                                                            <span className="text-xs">{event.location}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${statusTimeBadgeColors[event.status] || statusTimeBadgeColors.planned}`}>
                                                {format(parseISO(event.end), 'HH:mm')} término
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col">
            {renderHeader()}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {renderDays()}
                {renderCells()}
                {renderSelectedDayDetails()}
            </div>
        </div>
    );
};

export default AgendaScreen;
