import React, { useState } from 'react';
import { TrainingFrequencyCard } from './TrainingFrequencyCard';
import {
    Dumbbell,
    TrendingUp,
    DollarSign,
    Calendar,
    X,
    Upload,
    FileText,
    Loader2,
    Clock
} from 'lucide-react';
import { Student, StudentPayment } from '../types';
import { DataService } from '../services/dataService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StudentDashboardProps {
    student: Student;
    onNavigateToWorkout: () => void;
    onNavigateToProgress: () => void;
    onNavigateToAssessments: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
    student,
    onNavigateToWorkout,
    onNavigateToProgress,
    onNavigateToAssessments
}) => {
    // Calcular dias da semana com treino
    // const today = new Date().getDay(); // 0 = Domingo, 1 = Segunda, etc
    // const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    // const daysLabels = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    // Simular dias de treino (você pode ajustar baseado no programa do aluno)
    // const trainingDays = [1, 3, 5]; // Segunda, Quarta, Sexta
    // const completedDays = [1]; // Apenas segunda foi completada

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    const [activeModal, setActiveModal] = useState<'files' | 'assessments' | 'payments' | null>(null);
    const [fileToView, setFileToView] = useState<{ url: string; name: string; type: string } | null>(null);
    const [payments, setPayments] = useState<StudentPayment[]>([]);
    const [loadingPayments, setLoadingPayments] = useState(false);

    const loadPayments = async () => {
        setLoadingPayments(true);
        try {
            const data = await DataService.getStudentPayments(student.id);
            setPayments(data);
        } catch (error) {
            console.error("Erro ao carregar pagamentos:", error);
        } finally {
            setLoadingPayments(false);
        }
    };

    // Mock Avaliações
    const assessments = [
        { id: 1, date: '15/01/2026', weight: '75.5 kg', fat: '14.2%', notes: 'Ótima evolução de força. Aumento de carga no supino.' },
        { id: 2, date: '15/12/2025', weight: '76.2 kg', fat: '15.5%', notes: 'Início do protocolo de hipertrofia.' },
        { id: 3, date: '15/11/2025', weight: '77.8 kg', fat: '16.8%', notes: 'Avaliação inicial.' },
    ];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            // Em um app real, aqui faríamos o upload
            alert(`Arquivo "${e.target.files[0].name}" enviado com sucesso!`);
            setActiveModal(null);
        }
    };

    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-300">
            {/* Header com Avatar e Nome */}
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm transition-colors duration-300">
                <div className="flex flex-col">
                    {/* Trainer Info - Centralizado */}
                    <div className="flex flex-col items-center justify-center mb-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500 shadow-xl mb-3">
                            <img
                                src={student.trainerAvatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop'}
                                alt={student.trainerName || 'Personal Trainer'}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h2 className="text-lg font-black text-zinc-800 dark:text-white text-center">
                            {student.trainerName || 'Seu Personal'}
                        </h2>
                    </div>

                    {/* Student Greeting - À Esquerda */}
                    <div>
                        <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                            {getGreeting()}, {student.name ? student.name.split(' ')[0] : 'Aluno'}!
                        </p>
                    </div>
                </div>
            </div>

            {/* Frequência de Treinos */}
            <TrainingFrequencyCard student={student} />

            {/* Grid de Cards de Navegação */}
            <div className="grid grid-cols-2 gap-4">
                {/* Treinos */}
                <button
                    onClick={onNavigateToWorkout}
                    className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center gap-3 transition-all active:scale-95 col-span-2 group hover:border-emerald-200 dark:hover:border-emerald-800"
                >
                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <Dumbbell size={28} />
                    </div>
                    <span className="text-zinc-900 dark:text-white font-black text-lg">Meus Treinos</span>
                </button>

                {/* Avaliações */}
                <button
                    onClick={onNavigateToAssessments}
                    className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-start gap-4 hover:border-amber-200 dark:hover:border-amber-800 transition-all active:scale-95 group"
                >
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
                        <Calendar size={24} />
                    </div>
                    <div className="text-left">
                        <p className="font-black text-zinc-800 dark:text-white text-sm">Avaliações</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase mt-1">Histórico</p>
                    </div>
                </button>

                {/* Meu Progresso */}
                <button
                    onClick={onNavigateToProgress}
                    className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-start gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all active:scale-95 group"
                >
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-all">
                        <TrendingUp size={24} />
                    </div>
                    <div className="text-left">
                        <p className="font-black text-zinc-800 dark:text-white text-sm">Evolução</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase mt-1">Gráficos</p>
                    </div>
                </button>

                {/* Faturas */}
                <button
                    onClick={() => {
                        setActiveModal('payments');
                        loadPayments();
                    }}
                    className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-start gap-4 hover:border-amber-200 dark:hover:border-amber-800 transition-all active:scale-95 group"
                >
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
                        <DollarSign size={24} />
                    </div>
                    <div className="text-left">
                        <p className="font-black text-zinc-800 dark:text-white text-sm">Pagamentos</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase mt-1">Faturas</p>
                    </div>
                </button>

                {/* Arquivos */}
                <button
                    onClick={() => setActiveModal('files')}
                    className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-start gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all active:scale-95 group"
                >
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-all">
                        <FileText size={24} />
                    </div>
                    <div className="text-left">
                        <p className="font-black text-zinc-800 dark:text-white text-sm">Arquivos</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase mt-1">Documentos</p>
                    </div>
                </button>
            </div>

            {/* Modal de Arquivos */}
            {activeModal === 'files' && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-[32px] w-full max-w-sm shadow-2xl p-6 relative border dark:border-zinc-800">
                        <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"><X size={24} /></button>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">Enviar Arquivo</h3>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-6">Selecione um arquivo para enviar ao seu personal.</p>

                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-emerald-200 dark:border-emerald-900/50 rounded-2xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-sm font-black text-emerald-600 uppercase tracking-wide">Selecionar Arquivo</p>
                            </div>
                            <input type="file" className="hidden" onChange={handleFileUpload} />
                        </label>

                        {/* Listagem de Arquivos */}
                        <div className="mt-6 flex-1 overflow-y-auto space-y-3">
                            <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-3">Seus Arquivos</h4>
                            {(!student.files || !Array.isArray(student.files) || student.files.length === 0) ? (
                                <p className="text-xs text-zinc-400 text-center py-4">Nenhum arquivo enviado.</p>
                            ) : (
                                student.files.map((file) => (
                                    <div
                                        key={file.id}
                                        className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                        onClick={() => {
                                            console.log("Arquivo clicado:", file);
                                            if (file.url && file.url !== '#' && file.url.length > 10) {
                                                setFileToView(file);
                                            } else {
                                                alert("Este arquivo parece estar corrompido ou com URL inválida. Peça ao seu treinador para enviar novamente.");
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${file.type === 'pdf' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                                                <FileText size={22} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-0.5">{file.name}</p>
                                                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-wider">
                                                    {file.date} • {file.type.toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Avaliações */}
            {activeModal === 'assessments' && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-[32px] w-full max-w-md shadow-2xl p-6 relative h-[60vh] flex flex-col border dark:border-zinc-800">
                        <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"><X size={24} /></button>
                        <div className="mb-6">
                            <h3 className="text-xl font-black text-zinc-900 dark:text-white">Minhas Avaliações</h3>
                            <p className="text-xs font-bold text-zinc-400 mt-1">Acompanhe seus resultados</p>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            {assessments.map((assessment) => (
                                <div key={assessment.id} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700 hover:border-emerald-100 dark:hover:border-emerald-900 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-emerald-500" />
                                            <span className="text-xs font-black text-zinc-700 dark:text-zinc-300">{assessment.date}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <div className="bg-white dark:bg-zinc-900 p-2 rounded-xl">
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase">Peso</p>
                                            <p className="text-sm font-black text-zinc-800 dark:text-white">{assessment.weight}</p>
                                        </div>
                                        <div className="bg-white dark:bg-zinc-900 p-2 rounded-xl">
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase">Gordura</p>
                                            <p className="text-sm font-black text-zinc-800 dark:text-white">{assessment.fat}</p>
                                        </div>
                                    </div>
                                    {assessment.notes && (
                                        <div className="flex gap-2 items-start mt-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-700/50">
                                            <FileText size={12} className="text-zinc-400 mt-0.5 shrink-0" />
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">{assessment.notes}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Pagamentos */}
            {activeModal === 'payments' && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-[32px] w-full max-w-md shadow-2xl p-6 relative h-[60vh] flex flex-col border dark:border-zinc-800">
                        <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 pt-[calc(1rem+env(safe-area-inset-top))]"><X size={24} /></button>
                        <div className="mb-6 pt-[env(safe-area-inset-top)]">
                            <h3 className="text-xl font-black text-zinc-900 dark:text-white">Meus Pagamentos</h3>
                            <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-widest">Histórico de Mensalidades</p>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            {loadingPayments ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-amber-500" size={32} />
                                </div>
                            ) : payments.length === 0 ? (
                                <div className="text-center py-12">
                                    <Clock size={40} className="mx-auto text-zinc-300 mb-4 opacity-20" />
                                    <p className="text-sm font-bold text-zinc-400">Nenhum registro de pagamento encontrado.</p>
                                </div>
                            ) : (
                                payments.map((payment) => (
                                    <div key={payment.id} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-zinc-400" />
                                                <span className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase">
                                                    {format(new Date(payment.year, payment.month - 1), 'MMMM yyyy', { locale: ptBR })}
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${payment.status === 'paid'
                                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                }`}>
                                                {payment.status === 'paid' ? 'Pago' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className="text-[9px] font-bold text-zinc-400 uppercase">Valor</p>
                                                <p className="text-lg font-black text-zinc-800 dark:text-white">R$ {payment.amount.toFixed(2)}</p>
                                            </div>
                                            {payment.paidAt && (
                                                <div className="text-right">
                                                    <p className="text-[9px] font-bold text-zinc-400 uppercase">Pago em</p>
                                                    <p className="text-[11px] font-black text-zinc-600 dark:text-zinc-400">
                                                        {format(new Date(payment.paidAt), 'dd/MM/yyyy')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-center">
                            <p className="text-[10px] text-zinc-400 font-bold uppercase leading-relaxed">
                                Para pagamentos via PIX ou dinheiro, favor informar seu personal para atualização deste histórico.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Visualização de Arquivo */}
            {fileToView && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-[32px] w-full max-w-4xl h-[85vh] shadow-2xl relative flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                            <h3 className="font-bold text-zinc-900 dark:text-white truncate pr-8">{fileToView.name}</h3>
                            <button
                                onClick={() => setFileToView(null)}
                                className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                                <X size={20} className="text-zinc-600 dark:text-zinc-400" />
                            </button>
                        </div>
                        <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 p-4 flex items-center justify-center overflow-auto">
                            {fileToView.type === 'pdf' ? (
                                <iframe
                                    src={fileToView.url}
                                    className="w-full h-full rounded-xl border border-zinc-200 dark:border-zinc-800"
                                    title={fileToView.name}
                                />
                            ) : (
                                <img
                                    src={fileToView.url}
                                    alt={fileToView.name}
                                    className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
