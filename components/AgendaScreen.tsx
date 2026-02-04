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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, User, Plus } from 'lucide-react';
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
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
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
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-600 dark:text-zinc-400"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-600 dark:text-zinc-400"
                    >
                        <ChevronRight size={20} />
                    </button>
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
                const dayEvents = events.filter(e => isSameDay(parseISO(e.start), cloneDay));
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);

                days.push(
                    <div
                        className={`min-h-[80px] p-2 border border-zinc-100 dark:border-zinc-800 relative transition-colors cursor-pointer group hover:bg-zinc-50 dark:hover:bg-zinc-800/50
              ${!isCurrentMonth ? "bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-300 dark:text-zinc-700" : "bg-white dark:bg-zinc-900"}
              ${isSelected ? "ring-2 ring-indigo-500 ring-inset z-10" : ""}
              ${i === 0 ? "rounded-l-2xl" : ""} ${i === 6 ? "rounded-r-2xl" : ""}
            `}
                        key={day.toString()}
                        onClick={() => setSelectedDate(cloneDay)}
                    >
                        <span className={`text-sm font-bold ${!isCurrentMonth ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-700 dark:text-zinc-300"}`}>
                            {formattedDate}
                        </span>

                        <div className="mt-1 space-y-1">
                            {dayEvents.slice(0, 2).map((event, idx) => (
                                <div key={idx} className="bg-indigo-100 dark:bg-indigo-900/40 px-1.5 py-0.5 rounded-md truncate">
                                    <p className="text-[9px] font-bold text-indigo-700 dark:text-indigo-300 truncate">
                                        {format(parseISO(event.start), 'HH:mm')} {event.title}
                                    </p>
                                </div>
                            ))}
                            {dayEvents.length > 2 && (
                                <p className="text-[9px] font-bold text-zinc-400 pl-1">+{dayEvents.length - 2} mais</p>
                            )}
                        </div>

                        {/* Hover Add Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddEvent(cloneDay);
                            }}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-indigo-600 text-white rounded-lg shadow-sm hover:scale-110 transition-all"
                        >
                            <Plus size={12} />
                        </button>
                    </div>
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
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wide transition-colors shadow-lg shadow-indigo-600/20"
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
                        dayEvents.map(event => (
                            <div
                                key={event.id}
                                onClick={() => onEditEvent(event)}
                                className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                                            <span className="text-xs font-bold">{format(parseISO(event.start), 'HH')}</span>
                                            <span className="text-[10px] opacity-70">:{format(parseISO(event.start), 'mm')}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-zinc-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
                                        <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                                            {format(parseISO(event.end), 'HH:mm')} término
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
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
