import React, { useState } from 'react';
import { ScheduleEvent, Student } from '../types';
import { Activity, BarChart3, ChevronRight, FileText } from 'lucide-react';
import ClassReportsScreen from './ClassReportsScreen';
import FinancialReportsScreen from './FinancialReportsScreen';

interface ReportsScreenProps {
    events: ScheduleEvent[];
    students: Student[];
    onClose: () => void;
}

const ReportsScreen: React.FC<ReportsScreenProps> = ({ events, students, onClose }) => {
    const [activeView, setActiveView] = useState<'menu' | 'classes' | 'financial'>('menu');

    if (activeView === 'classes') {
        return <ClassReportsScreen events={events} students={students} onBack={() => setActiveView('menu')} />;
    }

    if (activeView === 'financial') {
        return <FinancialReportsScreen onBack={() => setActiveView('menu')} />;
    }

    return (
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex flex-col min-h-full">
                {/* Standardized Brand Header */}
                <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 transition-all duration-300 relative flex-shrink-0 mb-4">
                    <div className="w-10"></div> {/* Placeholder for symmetry */}

                    <div className="flex items-center gap-2">
                        <img src="/logo.jpg" alt="PersonalFlow" className="w-8 h-8 rounded-full shadow-sm" />
                        <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">PersonalFlow</span>
                    </div>

                    <div className="w-10"></div> {/* Placeholder for symmetry */}
                </header>

                <div className="px-1 mb-8">
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Central de Relatórios</h2>
                    <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500">Selecione o tipo de relatório que deseja visualizar.</p>
                </div>

                <div className="grid gap-4 px-1">
                    <button
                        onClick={() => setActiveView('classes')}
                        className="group bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Activity size={28} />
                            </div>
                            <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                <ChevronRight size={20} />
                            </div>
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-1">Relatório de Aulas</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-snug">Visualizar histórico de atendimentos, presenças e cancelamentos.</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveView('financial')}
                        className="group bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BarChart3 size={28} />
                            </div>
                            <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <ChevronRight size={20} />
                            </div>
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-1">Relatório Financeiro</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-snug">Acompanhe receitas, despesas e fluxo de caixa detalhado.</p>
                        </div>
                    </button>

                    {/* Export Button Placeholder - Future Feature */}
                    {/* <button disabled className="opacity-50 group bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 border-dashed">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 bg-zinc-200 dark:bg-zinc-700 text-zinc-400 rounded-2xl flex items-center justify-center">
                                <FileText size={28} />
                            </div>
                        </div>
                         <div className="text-left">
                            <h3 className="text-xl font-black text-zinc-400 dark:text-zinc-500 mb-1">Exportar Dados</h3>
                            <p className="text-sm text-zinc-400 dark:text-zinc-600 leading-snug">Em breve: Exportação para PDF e Excel.</p>
                        </div>
                     </button> */}
                </div>
            </div>
        </div>
    );
};

export default ReportsScreen;
