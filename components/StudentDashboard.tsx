
import React, { useState } from 'react';
import { TrainingFrequencyCard } from './TrainingFrequencyCard';
import {
    Dumbbell,
    ClipboardList,
    TrendingUp,
    DollarSign,
    Archive,
    Calendar,
    CheckCircle2,
    Clock,
    X,
    Upload,
    FileText,
    ChevronRight,
    Play
} from 'lucide-react';
import { Student } from '../types';

interface StudentDashboardProps {
    student: Student;
    onNavigateToWorkout: () => void;
    onNavigateToProgress: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
    student,
    onNavigateToWorkout,
    onNavigateToProgress
}) => {
    // Calcular dias da semana com treino
    const today = new Date().getDay(); // 0 = Domingo, 1 = Segunda, etc
    const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    const daysLabels = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    // Simular dias de treino (você pode ajustar baseado no programa do aluno)
    const trainingDays = [1, 3, 5]; // Segunda, Quarta, Sexta
    const completedDays = [1]; // Apenas segunda foi completada

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    const [activeModal, setActiveModal] = useState<'files' | 'assessments' | null>(null);

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
            <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
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
                        <h2 className="text-lg font-black text-slate-800 text-center">
                            {student.trainerName || 'Seu Personal'}
                        </h2>
                    </div>

                    {/* Student Greeting - À Esquerda */}
                    <div>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">
                            {getGreeting()}, {student.name.split(' ')[0]}!
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
                    className="bg-white hover:bg-slate-50 rounded-[28px] p-6 flex flex-col items-center justify-center gap-3 transition-all active:scale-95 border border-slate-100 shadow-sm col-span-2"
                >
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                        <Dumbbell size={24} className="text-emerald-600" />
                    </div>
                    <span className="text-slate-900 font-black text-base">Treinos</span>
                </button>

                {/* Avaliações */}
                <button
                    onClick={() => setActiveModal('assessments')}
                    className="bg-white hover:bg-slate-50 rounded-[28px] p-6 flex flex-col items-start gap-3 transition-all active:scale-95 border border-slate-100 shadow-sm"
                >
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                        <Calendar size={24} className="text-emerald-600" />
                    </div>
                    <span className="text-slate-900 font-black text-base">Avaliações</span>
                </button>

                {/* Meu Progresso */}
                <button
                    onClick={onNavigateToProgress}
                    className="bg-white hover:bg-slate-50 rounded-[28px] p-6 flex flex-col items-start gap-3 transition-all active:scale-95 border border-slate-100 shadow-sm"
                >
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                        <TrendingUp size={24} className="text-emerald-600" />
                    </div>
                    <span className="text-slate-900 font-black text-base">Meu Progresso</span>
                </button>

                {/* Faturas */}
                <button
                    className="bg-white hover:bg-slate-50 rounded-[28px] p-6 flex flex-col items-start gap-3 transition-all active:scale-95 border border-slate-100 shadow-sm"
                >
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                        <DollarSign size={24} className="text-emerald-600" />
                    </div>
                    <span className="text-slate-900 font-black text-base">Faturas</span>
                </button>

                {/* Arquivos */}
                <button
                    onClick={() => setActiveModal('files')}
                    className="bg-white hover:bg-slate-50 rounded-[28px] p-6 flex flex-col items-start gap-3 transition-all active:scale-95 border border-slate-100 shadow-sm"
                >
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                        <Archive size={24} className="text-emerald-600" />
                    </div>
                    <span className="text-slate-900 font-black text-base">Arquivos</span>
                </button>
            </div>

            {/* Modal de Arquivos */}
            {activeModal === 'files' && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl p-6 relative">
                        <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Enviar Arquivo</h3>
                        <p className="text-sm font-medium text-slate-500 mb-6">Selecione um arquivo para enviar ao seu personal.</p>

                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-emerald-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-sm font-black text-emerald-600 uppercase tracking-wide">Selecionar Arquivo</p>
                            </div>
                            <input type="file" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </div>
                </div>
            )}

            {/* Modal de Avaliações */}
            {activeModal === 'assessments' && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl p-6 relative h-[60vh] flex flex-col">
                        <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        <div className="mb-6">
                            <h3 className="text-xl font-black text-slate-900">Minhas Avaliações</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1">Acompanhe seus resultados</p>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            {assessments.map((assessment) => (
                                <div key={assessment.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-100 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-emerald-500" />
                                            <span className="text-xs font-black text-slate-700">{assessment.date}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <div className="bg-white p-2 rounded-xl">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Peso</p>
                                            <p className="text-sm font-black text-slate-800">{assessment.weight}</p>
                                        </div>
                                        <div className="bg-white p-2 rounded-xl">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Gordura</p>
                                            <p className="text-sm font-black text-slate-800">{assessment.fat}</p>
                                        </div>
                                    </div>
                                    {assessment.notes && (
                                        <div className="flex gap-2 items-start mt-2 pt-2 border-t border-slate-200/50">
                                            <FileText size={12} className="text-slate-400 mt-0.5 shrink-0" />
                                            <p className="text-xs text-slate-600 leading-snug">{assessment.notes}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
