
import React, { useState } from 'react';
import {
    Dumbbell,
    ClipboardList,
    TrendingUp,
    DollarSign,
    Archive,
    Calendar,
    CheckCircle2,
    Clock
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 -m-4 md:-m-8 p-6 pb-24">
            {/* Header com Avatar e Nome */}
            <div className="flex flex-col items-center mb-8 pt-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 mb-4 shadow-xl">
                    <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-full h-full object-cover"
                    />
                </div>
                <h2 className="text-white text-lg font-bold mb-1">{student.name}</h2>
                <p className="text-slate-300 text-2xl font-light mb-6">{getGreeting()}, {student.name.split(' ')[0]}!</p>
            </div>

            {/* Frequência de Treinos */}
            <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
                <h3 className="text-slate-800 font-bold text-sm mb-4">Frequência de Treinos</h3>
                <div className="flex justify-between items-center">
                    {daysOfWeek.map((day, index) => {
                        const isTrainingDay = trainingDays.includes(index);
                        const isCompleted = completedDays.includes(index);
                        const isToday = index === today;

                        return (
                            <div key={index} className="flex flex-col items-center gap-2">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${isCompleted
                                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                            : isTrainingDay
                                                ? 'border-2 border-blue-400 text-blue-500'
                                                : isToday
                                                    ? 'bg-amber-400 text-white'
                                                    : 'border-2 border-slate-200 text-slate-300'
                                        }`}
                                >
                                    {isCompleted ? <CheckCircle2 size={20} /> : day}
                                </div>
                                {isToday && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Grid de Cards de Navegação */}
            <div className="grid grid-cols-2 gap-4">
                {/* Treinos */}
                <button
                    onClick={onNavigateToWorkout}
                    className="bg-slate-700 hover:bg-slate-600 rounded-3xl p-6 flex flex-col items-start gap-3 transition-all active:scale-95 shadow-lg"
                >
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Dumbbell size={24} className="text-white" />
                    </div>
                    <span className="text-white font-bold text-base">Treinos</span>
                </button>

                {/* Treinos Extra */}
                <button
                    className="bg-slate-700 hover:bg-slate-600 rounded-3xl p-6 flex flex-col items-start gap-3 transition-all active:scale-95 shadow-lg"
                >
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <ClipboardList size={24} className="text-white" />
                    </div>
                    <span className="text-white font-bold text-base">Treinos Extra</span>
                </button>

                {/* Avaliações */}
                <button
                    className="bg-slate-700 hover:bg-slate-600 rounded-3xl p-6 flex flex-col items-start gap-3 transition-all active:scale-95 shadow-lg"
                >
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Calendar size={24} className="text-white" />
                    </div>
                    <span className="text-white font-bold text-base">Avaliações</span>
                </button>

                {/* Meu Progresso */}
                <button
                    onClick={onNavigateToProgress}
                    className="bg-slate-700 hover:bg-slate-600 rounded-3xl p-6 flex flex-col items-start gap-3 transition-all active:scale-95 shadow-lg"
                >
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <TrendingUp size={24} className="text-white" />
                    </div>
                    <span className="text-white font-bold text-base">Meu Progresso</span>
                </button>

                {/* Faturas */}
                <button
                    className="bg-slate-700 hover:bg-slate-600 rounded-3xl p-6 flex flex-col items-start gap-3 transition-all active:scale-95 shadow-lg"
                >
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <DollarSign size={24} className="text-white" />
                    </div>
                    <span className="text-white font-bold text-base">Faturas</span>
                </button>

                {/* Arquivos */}
                <button
                    className="bg-slate-700 hover:bg-slate-600 rounded-3xl p-6 flex flex-col items-start gap-3 transition-all active:scale-95 shadow-lg"
                >
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Archive size={24} className="text-white" />
                    </div>
                    <span className="text-white font-bold text-base">Arquivos</span>
                </button>
            </div>
        </div>
    );
};

export default StudentDashboard;
