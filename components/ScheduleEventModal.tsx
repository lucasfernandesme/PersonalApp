import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, User, CheckCircle2, Repeat, Trash2 } from 'lucide-react';
import { ScheduleEvent, Student } from '../types';
import { format, addHours, parse } from 'date-fns';

interface ScheduleEventModalProps {
    initialDate: Date;
    existingEvent?: ScheduleEvent;
    students: Student[];
    onSave: (event: Partial<ScheduleEvent> & { recurringDays?: number[], recurringMonths?: number[], recurrenceDuration?: number }) => void;
    onDelete?: (eventId: string) => void;
    onClose: () => void;
}

const ScheduleEventModal: React.FC<ScheduleEventModalProps> = ({ initialDate, existingEvent, students, onSave, onDelete, onClose }) => {
    const [title, setTitle] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringDays, setRecurringDays] = useState<number[]>([]);
    const [recurringMonths, setRecurringMonths] = useState<number[]>([]);
    const [recurrenceDuration, setRecurrenceDuration] = useState<number>(1);
    const [status, setStatus] = useState<'planned' | 'completed' | 'cancelled'>('planned');

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    useEffect(() => {
        if (existingEvent) {
            setTitle(existingEvent.title);
            setSelectedStudentId(existingEvent.studentId || '');

            // Fix: Parse ISO string to Date object to handle timezone correctly
            const startDate = new Date(existingEvent.start);
            const endDate = new Date(existingEvent.end);

            setDate(format(startDate, 'yyyy-MM-dd'));
            setStartTime(format(startDate, 'HH:mm'));
            setEndTime(format(endDate, 'HH:mm'));

            setLocation(existingEvent.location || '');
            setDescription(existingEvent.description || '');
            setIsRecurring(existingEvent.isRecurring || false);
            setStatus(existingEvent.status || 'planned');
        } else {
            // Default new event
            setDate(format(initialDate, 'yyyy-MM-dd'));
            const now = new Date();
            now.setMinutes(0);
            setStartTime(format(now, 'HH:mm'));
            setEndTime(format(addHours(now, 1), 'HH:mm'));
            setStatus('planned');
        }
    }, [existingEvent, initialDate]);

    const handleSave = () => {
        if (!title && !selectedStudentId) {
            alert("Por favor, informe um título ou selecione um aluno.");
            return;
        }

        if (!date || !startTime || !endTime) {
            alert("Por favor, preencha a data e os horários.");
            return;
        }

        // Se selecionou aluno e não tem título, usa o nome do aluno como título
        let finalTitle = title;
        let studentName = undefined;

        if (selectedStudentId) {
            const student = students.find(s => s.id === selectedStudentId);
            if (student) {
                studentName = student.name;
                if (!finalTitle) finalTitle = `Aula com ${student.name.split(' ')[0]}`;
            }
        }

        // Create Date objects from local input values to ensure correct timezone handling
        // Use parse from date-fns to explicitly parse as local time
        const startDateTime = parse(`${date} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
        const endDateTime = parse(`${date} ${endTime}`, 'yyyy-MM-dd HH:mm', new Date());

        const startISO = startDateTime.toISOString();
        const endISO = endDateTime.toISOString();

        if (startDateTime >= endDateTime) {
            alert("O horário de término deve ser depois do início.");
            return;
        }

        onSave({
            id: existingEvent?.id,
            title: finalTitle,
            studentId: selectedStudentId || undefined,
            studentName,
            start: startISO,
            end: endISO,
            location,
            description,
            isRecurring,
            recurringDays: isRecurring ? recurringDays : undefined,
            recurringMonths: isRecurring ? recurringMonths : undefined,
            recurrenceDuration: isRecurring ? recurrenceDuration : undefined,
            status
        });
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] w-full max-w-lg shadow-2xl p-6 relative border dark:border-zinc-800 transition-colors animate-in slide-in-from-bottom-10 duration-300">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                    <X size={24} />
                </button>

                <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-6">
                    {existingEvent ? 'Editar Aula' : 'Nova Aula'}
                </h3>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">

                    {/* Student Selector */}
                    <div>
                        <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 ml-1">Aluno (Opcional)</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                            <select
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white appearance-none cursor-pointer"
                            >
                                <option value="">Selecione um aluno...</option>
                                {students.map(student => (
                                    <option key={student.id} value={student.id}>{student.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 ml-1">Título da Aula</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={selectedStudentId ? "Preenchido automaticamente" : "Ex: Treino de Pernas"}
                            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                        />
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 ml-1">Data</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 ml-1">Início</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full px-2 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white text-center focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 ml-1">Fim</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full px-2 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white text-center focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 ml-1">Local (Opcional)</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Ex: Academia Smart Fit"
                                className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 ml-1">Observações</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Detalhes adicionais..."
                            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white resize-none"
                        />
                    </div>

                    {/* Status Selector */}
                    <div>
                        <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 ml-1">Status da Aula</label>
                        <div className="flex bg-zinc-50 dark:bg-zinc-800 p-1 rounded-2xl">
                            {(['planned', 'completed', 'cancelled'] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatus(s)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-all ${status === s
                                        ? s === 'planned' ? 'bg-white shadow-sm text-zinc-900 border border-zinc-200'
                                            : s === 'completed' ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-red-100 text-red-700 border border-red-200'
                                        : 'text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-700'
                                        }`}
                                >
                                    {s === 'planned' ? 'Planejada' : s === 'completed' ? 'Executada' : 'Cancelada'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recurring Options - Only show when creating new event */}
                    {!existingEvent && (
                        <div className="space-y-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <h4 className="font-black text-sm text-zinc-900 dark:text-white mb-2">Replicar aulas</h4>

                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="recurrence"
                                        checked={!isRecurring}
                                        onChange={() => setIsRecurring(false)}
                                        className="w-4 h-4 text-zinc-900 focus:ring-zinc-900 dark:text-zinc-100 dark:focus:ring-white border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800"
                                    />
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Não replicar</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="recurrence"
                                        checked={isRecurring}
                                        onChange={() => setIsRecurring(true)}
                                        className="w-4 h-4 text-zinc-900 focus:ring-zinc-900 dark:text-zinc-100 dark:focus:ring-white border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800"
                                    />
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Replicar</span>
                                </label>
                            </div>

                            {isRecurring && (
                                <div className="pt-2 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                    {/* Days of Week */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-2">Replicar para os seguintes dias da semana</label>
                                        <div className="flex flex-wrap gap-2 p-2 border border-blue-400 rounded-lg min-h-[40px] bg-white dark:bg-zinc-950">
                                            {recurringDays.length === 0 && <span className="text-xs text-zinc-400 p-1">Selecione os dias abaixo...</span>}
                                            {recurringDays.map((dayIdx) => (
                                                <span key={dayIdx} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-700 text-white text-xs font-bold">
                                                    {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dayIdx]}
                                                    <button
                                                        onClick={() => {
                                                            setRecurringDays(prev => prev.filter(d => d !== dayIdx));
                                                        }}
                                                        className="hover:text-red-300"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        {/* Day Selector Buttons */}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((label, idx) => {
                                                if (recurringDays.includes(idx)) return null; // Don't show if already selected (or maybe show disabled?)
                                                // Actually typical tag UI shows available options to add.
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setRecurringDays(prev => [...prev, idx].sort((a, b) => a - b))}
                                                        className="px-2 py-1 text-[10px] font-bold uppercase rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                    >
                                                        {label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Months Selector */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-2">Nos meses</label>
                                        <div className="flex flex-wrap gap-2 p-2 border border-slate-300 dark:border-zinc-700 rounded-lg min-h-[40px] bg-white dark:bg-zinc-950">
                                            {recurringMonths.length === 0 && <span className="text-xs text-zinc-400 p-1">Selecione os meses abaixo...</span>}
                                            {recurringMonths.map((monthIdx) => (
                                                <span key={monthIdx} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-700 text-white text-xs font-bold">
                                                    {monthNames[monthIdx]}
                                                    <button
                                                        onClick={() => {
                                                            setRecurringMonths(prev => prev.filter(m => m !== monthIdx));
                                                        }}
                                                        className="hover:text-red-300"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {monthNames.map((label, idx) => {
                                                if (recurringMonths.includes(idx)) return null;
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            setRecurringMonths(prev => [...prev, idx].sort((a, b) => a - b));
                                                        }}
                                                        className="px-2 py-1 text-[10px] font-bold uppercase rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                    >
                                                        {label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>



                                </div>
                            )}
                        </div>
                    )}

                </div>

                <div className="pt-6 mt-2">
                    <button
                        onClick={handleSave}
                        className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-zinc-900/20 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {existingEvent ? 'Salvar Alterações' : 'Agendar Aula'} <CheckCircle2 size={18} />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ScheduleEventModal;
