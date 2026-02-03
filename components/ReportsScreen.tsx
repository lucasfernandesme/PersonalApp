import React, { useState, useMemo } from 'react';
import { ScheduleEvent, Student } from '../types';
import { format, isWithinInterval, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Download, Filter, Search, Calendar, User, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface ReportsScreenProps {
    events: ScheduleEvent[];
    students: Student[];
    onClose: () => void;
}

const ReportsScreen: React.FC<ReportsScreenProps> = ({ events, students, onClose }) => {
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'planned' | 'completed' | 'cancelled'>('all');


    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const eventDate = parseISO(event.start);
            const start = parseISO(startDate);
            const end = parseISO(endDate);
            // Fix end date to include the full day
            end.setHours(23, 59, 59, 999);

            const matchesDate = isWithinInterval(eventDate, { start, end });
            const matchesStudent = selectedStudentId === 'all' || event.studentId === selectedStudentId;
            const matchesStatus = statusFilter === 'all' || event.status === statusFilter;

            // Default legacy events to 'planned' if status is missing
            const eventStatus = event.status || 'planned';
            const finalMatchesStatus = statusFilter === 'all' || eventStatus === statusFilter;

            return matchesDate && matchesStudent && finalMatchesStatus;
        }).sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()); // Sort desc
    }, [events, startDate, endDate, selectedStudentId, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: filteredEvents.length,
            completed: filteredEvents.filter(e => (e.status || 'planned') === 'completed').length,
            cancelled: filteredEvents.filter(e => (e.status || 'planned') === 'cancelled').length,
            planned: filteredEvents.filter(e => (e.status || 'planned') === 'planned').length,
        };
    }, [filteredEvents]);

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
            case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
            default: return 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800';
        }
    };

    const getStatusLabel = (status?: string) => {
        switch (status) {
            case 'completed': return 'Executada';
            case 'cancelled': return 'Cancelada';
            default: return 'Planejada';
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Relatórios de Aulas</h2>
                    <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Analise o histórico de atendimentos.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-6 space-y-4">



                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date Range */}
                    <div className="flex gap-2 items-center bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        <Calendar size={18} className="text-indigo-500 ml-2" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-0 w-full"
                        />
                        <span className="text-slate-400">-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-0 w-full"
                        />
                    </div>

                    {/* Student Filter */}
                    <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            value={selectedStudentId}
                            onChange={e => setSelectedStudentId(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 appearance-none"
                        >
                            <option value="all">Todos os Alunos</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-100 dark:border-slate-800">
                    {(['all', 'planned', 'completed', 'cancelled'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${statusFilter === status
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                                : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            {status === 'all' ? 'Todas' : status === 'planned' ? 'Planejadas' : status === 'completed' ? 'Executadas' : 'Canceladas'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-2 mb-6">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl text-center">
                    <p className="text-[10px] font-black uppercase text-indigo-400 mb-1">Total</p>
                    <p className="text-xl font-black text-indigo-700 dark:text-indigo-300">{stats.total}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl text-center">
                    <p className="text-[10px] font-black uppercase text-green-400 mb-1">Feitas</p>
                    <p className="text-xl font-black text-green-700 dark:text-green-300">{stats.completed}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-center">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Futuras</p>
                    <p className="text-xl font-black text-slate-700 dark:text-slate-300">{stats.planned}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl text-center">
                    <p className="text-[10px] font-black uppercase text-red-400 mb-1">Canc.</p>
                    <p className="text-xl font-black text-red-700 dark:text-red-300">{stats.cancelled}</p>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-600">
                        <Search size={32} className="mb-2 opacity-50" />
                        <p className="text-sm font-medium">Nenhuma aula encontrada.</p>
                    </div>
                ) : (
                    filteredEvents.map(event => (
                        <div key={event.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(event.status)}`}>
                                    {event.status === 'completed' ? <CheckCircle2 size={18} /> :
                                        event.status === 'cancelled' ? <XCircle size={18} /> :
                                            <Clock size={18} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{event.title}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                            <Calendar size={12} /> {format(parseISO(event.start), "dd/MM 'às' HH:mm", { locale: ptBR })}
                                        </span>
                                        {event.studentName && (
                                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded-md">
                                                {event.studentName}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${getStatusColor(event.status)}`}>
                                {getStatusLabel(event.status)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReportsScreen;
