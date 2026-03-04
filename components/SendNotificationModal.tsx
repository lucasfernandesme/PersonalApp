
import React, { useState, useEffect } from 'react';
import { Send, X, Search, Loader2, CheckCircle2 } from 'lucide-react';
import { Student } from '../types';
import { DataService } from '../services/dataService';

interface SendNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    students: Student[];
    selectedStudent: Student | null;
    onSuccess: (message: string) => void;
}

const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
    isOpen,
    onClose,
    students,
    selectedStudent,
    onSuccess,
}) => {
    const [notificationMsgTitle, setNotificationMsgTitle] = useState('');
    const [notificationMsgBody, setNotificationMsgBody] = useState('');
    const [notificationTarget, setNotificationTarget] = useState<'single' | 'all' | 'specific'>('all');
    const [bulkActiveIds, setBulkActiveIds] = useState<string[]>([]);
    const [notificationSearchTerm, setNotificationSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // Initialize selection mode and IDs when modal opens
    useEffect(() => {
        if (isOpen && !initialized) {
            if (selectedStudent) {
                setNotificationTarget('single');
                setBulkActiveIds([String(selectedStudent.id)]);
            } else {
                setNotificationTarget('all');
                setBulkActiveIds(students.map(s => String(s.id)));
            }
            setInitialized(true);
        }
        if (!isOpen && initialized) {
            setInitialized(false);
        }
    }, [isOpen, initialized, selectedStudent, students]);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!notificationMsgTitle || !notificationMsgBody) {
            alert("Preencha o título e a mensagem.");
            return;
        }
        if (bulkActiveIds.length === 0) {
            alert("Selecione pelo menos um destinatário.");
            return;
        }

        setIsSaving(true);
        try {
            const promises = bulkActiveIds.map(id =>
                DataService.sendCustomNotification(
                    id,
                    'STUDENT',
                    notificationMsgTitle,
                    notificationMsgBody
                )
            );
            await Promise.all(promises);

            onSuccess(bulkActiveIds.length === 1
                ? 'Notificação enviada com sucesso! 🚀'
                : `${bulkActiveIds.length} notificações enviadas com sucesso! 🚀`
            );

            // Reset and close
            setNotificationMsgTitle('');
            setNotificationMsgBody('');
            setNotificationSearchTerm('');
            onClose();
        } catch (e) {
            console.error(e);
            alert("Erro ao enviar notificações.");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(notificationSearchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <Send size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-zinc-900 dark:text-white text-lg tracking-tight">Enviar Notificação</h3>
                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                {notificationTarget === 'single' ? `Para: ${selectedStudent?.name}` :
                                    notificationTarget === 'all' ? `Para: Todos os ${students.length} alunos` :
                                        `Para: ${bulkActiveIds.length} alunos selecionados`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                    >
                        <X size={20} className="text-zinc-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {!selectedStudent && (
                        <div className="space-y-4">
                            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (notificationTarget !== 'all') {
                                            setNotificationTarget('all');
                                            setBulkActiveIds(students.map(s => String(s.id)));
                                        }
                                    }}
                                    className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${notificationTarget === 'all' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400'}`}
                                >
                                    Todos
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (notificationTarget !== 'specific') {
                                            setNotificationTarget('specific');
                                            setBulkActiveIds([]);
                                        }
                                    }}
                                    className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${notificationTarget === 'specific' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400'}`}
                                >
                                    Selecionar
                                </button>
                            </div>

                            {notificationTarget === 'specific' && (
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                        <input
                                            type="text"
                                            value={notificationSearchTerm}
                                            onChange={(e) => setNotificationSearchTerm(e.target.value)}
                                            placeholder="Buscar aluno..."
                                            className="w-full pl-12 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-xs font-bold text-zinc-800 dark:text-white focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setBulkActiveIds(students.map(s => String(s.id)));
                                            }}
                                            className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700"
                                        >
                                            Selecionar Todos
                                        </button>
                                        <span className="text-zinc-300 dark:text-zinc-700">|</span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setBulkActiveIds([]);
                                            }}
                                            className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-500"
                                        >
                                            Desmarcar Todos
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                                        {filteredStudents.length === 0 ? (
                                            <div className="col-span-full py-4 text-center text-zinc-400 text-xs font-medium italic">
                                                Nenhum aluno encontrado.
                                            </div>
                                        ) : (
                                            filteredStudents.map(s => {
                                                const studentId = String(s.id);
                                                const isSelected = bulkActiveIds.includes(studentId);
                                                return (
                                                    <button
                                                        key={studentId}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setBulkActiveIds(prev =>
                                                                prev.includes(studentId)
                                                                    ? prev.filter(id => id !== studentId)
                                                                    : [...prev, studentId]
                                                            );
                                                        }}
                                                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors text-left ${isSelected
                                                            ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/10 dark:border-indigo-800'
                                                            : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700'
                                                            }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-200 dark:border-zinc-700'}`}>
                                                            {isSelected && <CheckCircle2 size={12} />}
                                                        </div>
                                                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">{s.name}</span>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Título</label>
                            <input
                                type="text"
                                value={notificationMsgTitle}
                                onChange={(e) => setNotificationMsgTitle(e.target.value)}
                                placeholder="Ex: Aviso Importante"
                                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Mensagem</label>
                            <textarea
                                value={notificationMsgBody}
                                onChange={(e) => setNotificationMsgBody(e.target.value)}
                                placeholder="Escreva sua mensagem aqui..."
                                rows={4}
                                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-zinc-50/50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                        onClick={handleSend}
                        disabled={isSaving || bulkActiveIds.length === 0}
                        className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-2xl shadow-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <Send size={18} />
                                {bulkActiveIds.length === 1 ? 'Enviar Agora' : `Enviar para ${bulkActiveIds.length} Alunos`}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SendNotificationModal;
