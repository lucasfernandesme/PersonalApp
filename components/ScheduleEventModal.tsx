import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, User, CheckCircle2, Repeat, Trash2 } from 'lucide-react';
import { ScheduleEvent, Student } from '../types';
import { format, addHours } from 'date-fns';

interface ScheduleEventModalProps {
    initialDate: Date;
    existingEvent?: ScheduleEvent;
    students: Student[];
    onSave: (event: Partial<ScheduleEvent> & { recurringDays?: number[], recurrenceDuration?: number }) => void;
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
    const [recurrenceDuration, setRecurrenceDuration] = useState<number>(1);
    const [status, setStatus] = useState<'planned' | 'completed' | 'cancelled'>('planned');

    useEffect(() => {
        if (existingEvent) {
            setTitle(existingEvent.title);
            setSelectedStudentId(existingEvent.studentId || '');
            setDate(existingEvent.start.split('T')[0]);
            setStartTime(existingEvent.start.split('T')[1].substring(0, 5));
            setEndTime(existingEvent.end.split('T')[1].substring(0, 5));
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

        const startISO = `${date}T${startTime}:00`;
        const endISO = `${date}T${endTime}:00`;

        if (startISO >= endISO) {
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
            recurrenceDuration: isRecurring ? recurrenceDuration : undefined,
            status
        });
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-lg shadow-2xl p-6 relative border dark:border-slate-800 transition-colors animate-in slide-in-from-bottom-10 duration-300">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    <X size={24} />
                </button>

                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
                    {existingEvent ? 'Editar Aula' : 'Nova Aula'}
                </h3>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">

                    {/* Student Selector */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1.5 ml-1">Aluno (Opcional)</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
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
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1.5 ml-1">Título da Aula</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={selectedStudentId ? "Preenchido automaticamente" : "Ex: Treino de Pernas"}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1.5 ml-1">Data</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1.5 ml-1">Início</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full px-2 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold text-slate-800 dark:text-white text-center focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1.5 ml-1">Fim</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full px-2 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold text-slate-800 dark:text-white text-center focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1.5 ml-1">Local (Opcional)</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Ex: Academia Smart Fit"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1.5 ml-1">Observações</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Detalhes adicionais..."
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                    </div>

                    {/* Status Selector */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1.5 ml-1">Status da Aula</label>
                        <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl">
                            {(['planned', 'completed', 'cancelled'] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatus(s)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-all ${status === s
                                        ? s === 'planned' ? 'bg-white shadow-sm text-slate-900 border border-slate-200'
                                            : s === 'completed' ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-red-100 text-red-700 border border-red-200'
                                        : 'text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {s === 'planned' ? 'Planejada' : s === 'completed' ? 'Executada' : 'Cancelada'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recurring Options */}
                    <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl transition-all">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsRecurring(!isRecurring)}>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isRecurring ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600'}`}>
                                {isRecurring && <CheckCircle2 size={14} className="text-white" />}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-slate-800 dark:text-white text-sm">Repetir Aula</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">Criar agendamentos recorrentes.</p>
                            </div>
                            <Repeat size={20} className={isRecurring ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
                        </div>

                        {isRecurring && (
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-4 animate-in slide-in-from-top-2 duration-200">

                                {/* Days of Week */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Dias da Semana</label>
                                    <div className="flex gap-2 justify-between">
                                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => {
                                            const isSelected = recurringDays.includes(idx);
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setRecurringDays(prev => prev.filter(d => d !== idx));
                                                        } else {
                                                            setRecurringDays(prev => [...prev, idx]);
                                                        }
                                                    }}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isSelected
                                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105'
                                                        : 'bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-slate-600'
                                                        }`}
                                                >
                                                    {day}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Repetir por</label>
                                    <div className="relative">
                                        <select
                                            value={recurrenceDuration}
                                            onChange={(e) => setRecurrenceDuration(parseInt(e.target.value))}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-none rounded-2xl font-bold text-slate-800 dark:text-white appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(months => (
                                                <option key={months} value={months}>
                                                    {months} {months === 1 ? 'Mês' : 'Meses'}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <Repeat size={16} />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>

                </div>

                <div className="pt-6 mt-2 flex gap-3">
                    {existingEvent && onDelete && (
                        <button
                            onClick={() => {
                                if (confirm("Tem certeza que deseja excluir esta aula?")) {
                                    onDelete(existingEvent.id);
                                }
                            }}
                            className="px-4 py-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-black hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}

                    <button
                        onClick={handleSave}
                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {existingEvent ? 'Salvar Alterações' : 'Agendar Aula'} <CheckCircle2 size={18} />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ScheduleEventModal;
