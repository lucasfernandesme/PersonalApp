import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ScheduleEvent } from '../types';

interface ClassDetailsModalProps {
    event: ScheduleEvent;
    onUpdate: (updates: Partial<ScheduleEvent>) => void;
    onEdit: () => void; // Opens full edit modal
    onDelete: () => void;
    onClose: () => void;
}

const ClassDetailsModal: React.FC<ClassDetailsModalProps> = ({ event, onUpdate, onEdit, onDelete, onClose }) => {
    const [status, setStatus] = useState<'planned' | 'completed' | 'cancelled'>(event.status);
    const [location, setLocation] = useState(event.location || '');
    const [observation, setObservation] = useState(event.description || '');
    const [executionDate, setExecutionDate] = useState(
        event.status === 'completed' && event.start
            ? new Date(event.start).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    );
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        setLoading(true);
        try {
            await onUpdate({
                status,
                location: location || undefined,
                description: observation || undefined,
                // If status is completed, update the start time to execution date
                ...(status === 'completed' && executionDate ? {
                    start: `${executionDate}T${new Date(event.start).toISOString().split('T')[1]}`
                } : {})
            });
            onClose();
        } catch (error) {
            console.error('Erro ao atualizar:', error);
            alert('Erro ao atualizar a aula.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white dark:bg-zinc-900 rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col border dark:border-zinc-800"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header: Título */}
                <div className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                            <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight leading-none mb-1">
                                {event.title}
                            </h2>
                            {event.studentName && (
                                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
                                    {event.studentName}
                                </p>
                            )}
                        </div>
                        <button onClick={onClose} className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">

                    {/* Local */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                            Local
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Digite o local da aula..."
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-xl py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-500 transition-colors placeholder:text-zinc-400 placeholder:font-normal"
                        />
                    </div>

                    {/* Observação */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                            Observação
                        </label>
                        <textarea
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                            placeholder="Adicione observações sobre esta aula..."
                            rows={4}
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-xl p-4 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-500 transition-colors resize-none placeholder:text-zinc-400 placeholder:font-normal"
                        />
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                            Status
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setStatus('planned')}
                                className={`py-4 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all ${status === 'planned'
                                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 shadow-lg'
                                    : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'}`}
                            >
                                Planejada
                            </button>
                            <button
                                onClick={() => setStatus('completed')}
                                className={`py-4 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all ${status === 'completed'
                                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg'
                                    : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:border-emerald-200 hover:text-emerald-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'}`}
                            >
                                Executada
                            </button>
                            <button
                                onClick={() => setStatus('cancelled')}
                                className={`py-4 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all ${status === 'cancelled'
                                    ? 'border-red-500 bg-red-500 text-white shadow-lg'
                                    : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:border-red-200 hover:text-red-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'}`}
                            >
                                Cancelada
                            </button>
                        </div>

                        {/* Data de Execução - Aparece quando status é "Executada" */}
                        {status === 'completed' && (
                            <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                                <label className="block text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider mb-2">
                                    Data de Execução
                                </label>
                                <input
                                    type="date"
                                    value={executionDate}
                                    onChange={(e) => setExecutionDate(e.target.value)}
                                    className="w-full bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-700 rounded-xl py-3 px-4 text-sm font-bold text-emerald-900 dark:text-emerald-100 focus:outline-none focus:border-emerald-500 transition-colors"
                                />
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer: Ações */}
                <div className="p-6 pt-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3">
                    {/* Atualizar - Botão Principal */}
                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:scale-100"
                    >
                        {loading ? 'Salvando...' : 'Atualizar'}
                    </button>

                    {/* Editar e Excluir */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={onEdit}
                            className="py-3.5 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold uppercase text-xs tracking-widest hover:bg-white hover:border-zinc-300 dark:hover:bg-zinc-800 dark:hover:border-zinc-600 transition-colors"
                        >
                            Editar
                        </button>
                        <button
                            onClick={() => {
                                if (confirm('Tem certeza que deseja excluir esta aula?')) {
                                    onDelete();
                                }
                            }}
                            className="py-3.5 rounded-xl border-2 border-red-200 dark:border-red-900/30 text-red-500 font-bold uppercase text-xs tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            Excluir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassDetailsModal;
