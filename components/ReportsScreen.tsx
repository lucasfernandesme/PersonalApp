import React, { useState, useMemo } from 'react';
import { ScheduleEvent, Student } from '../types';
import { format, isWithinInterval, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Download, Filter, Search, Calendar, User, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, X, ArrowLeft } from 'lucide-react';

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
            default: return 'text-zinc-600 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-800';
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
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex flex-col min-h-full">
                {/* Standardized Brand Header */}
                <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 py-3 transition-all duration-300 relative flex-shrink-0 mb-4">
                    <div className="w-10"></div> {/* Placeholder for symmetry */}

                    <div className="flex items-center gap-2">
                        <img src="/logo.jpg" alt="PersonalFlow" className="w-8 h-8 rounded-full shadow-sm" />
                        <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">PersonalFlow</span>
                    </div>

                    <div className="w-10"></div> {/* Placeholder for symmetry */}
                </header>

                <div className="px-1 mb-4">
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Relatórios de Aulas</h2>
                    <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500">Analise o histórico de atendimentos.</p>
                </div>

                {/* Filters */}
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl mb-4 space-y-4">



                    <div className="space-y-3">
                        {/* Date Range - Stacked on mobile, side-by-side on desktop */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col gap-1">
                                <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 ml-1">Início</label>
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-zinc-900 dark:text-zinc-100" />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="bg-transparent border-none text-xs font-black text-zinc-800 dark:text-zinc-200 focus:ring-0 p-0 w-full"
                                    />
                                </div>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col gap-1">
                                <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 ml-1">Fim</label>
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-zinc-900 dark:text-zinc-100" />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="bg-transparent border-none text-xs font-black text-zinc-800 dark:text-zinc-200 focus:ring-0 p-0 w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Student Filter */}
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                                <User size={16} className="text-zinc-400" />
                            </div>
                            <select
                                value={selectedStudentId}
                                onChange={e => setSelectedStudentId(e.target.value)}
                                className="w-full pl-12 pr-10 py-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-bold text-zinc-700 dark:text-zinc-200 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white appearance-none transition-all shadow-sm"
                            >
                                <option value="all">Todos os Alunos</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Status Tabs */}
                    <div className="flex bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 gap-1">
                        {(['all', 'planned', 'completed', 'cancelled'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`flex-1 py-2.5 text-[10px] sm:text-xs font-black uppercase rounded-xl transition-all tracking-tighter sm:tracking-normal ${statusFilter === status
                                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg shadow-zinc-900/20'
                                    : 'text-zinc-400 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                    }`}
                            >
                                {status === 'all' ? 'Todas' : status === 'planned' ? 'Plan.' : status === 'completed' ? 'Exec.' : 'Canc.'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                        <p className="text-[10px] font-black uppercase text-zinc-900 dark:text-zinc-100 mb-1 tracking-wider">Total</p>
                        <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{stats.total}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100/50 dark:border-green-500/10">
                        <p className="text-[10px] font-black uppercase text-green-400 dark:text-green-500 mb-1 tracking-wider">Feitas</p>
                        <p className="text-2xl font-black text-green-700 dark:text-green-300">{stats.completed}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-700/50">
                        <p className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 mb-1 tracking-wider">Futuras</p>
                        <p className="text-2xl font-black text-zinc-700 dark:text-zinc-300">{stats.planned}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100/50 dark:border-red-500/10">
                        <p className="text-[10px] font-black uppercase text-red-400 dark:text-red-500 mb-1 tracking-wider">Canc.</p>
                        <p className="text-2xl font-black text-red-700 dark:text-red-300">{stats.cancelled}</p>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-3 pb-6">
                    {filteredEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-zinc-400 dark:text-zinc-600">
                            <Search size={32} className="mb-2 opacity-50" />
                            <p className="text-sm font-medium">Nenhuma aula encontrada.</p>
                        </div>
                    ) : (
                        filteredEvents.map(event => (
                            <div
                                key={event.id}
                                className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between group hover:shadow-lg hover:shadow-zinc-900/5 dark:hover:shadow-zinc-100/5 transition-all duration-300 active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${getStatusColor(event.status)}`}>
                                        {event.status === 'completed' ? <CheckCircle2 size={22} /> :
                                            event.status === 'cancelled' ? <XCircle size={22} /> :
                                                <Clock size={22} />}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-zinc-900 dark:text-white text-base leading-tight">
                                            {event.title}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                                                <Calendar size={13} className="text-zinc-400 opacity-70" />
                                                <span className="capitalize">{format(parseISO(event.start), "eeee, dd 'de' MMM", { locale: ptBR })}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px] font-black text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg">
                                                <Clock size={11} />
                                                <span>{format(parseISO(event.start), "HH:mm")}</span>
                                            </div>
                                            {event.studentName && event.title !== event.studentName && (
                                                <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 border border-zinc-100 dark:border-zinc-800 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                                                    {event.studentName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm border ${event.status === 'completed' ? 'border-green-200 dark:border-green-800/50' :
                                        event.status === 'cancelled' ? 'border-red-200 dark:border-red-800/50' :
                                            'border-zinc-200 dark:border-zinc-700/50'
                                        } ${getStatusColor(event.status)}`}>
                                        {getStatusLabel(event.status)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsScreen;
