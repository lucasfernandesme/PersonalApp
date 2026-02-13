import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, CheckCircle2, XCircle, Clock, DollarSign, Calendar, ChevronLeft, ChevronRight, Loader2, Filter } from 'lucide-react';
import { DataService } from '../services/dataService';
import { Student, StudentPayment, AuthUser } from '../types';

interface FinanceScreenProps {
    user: AuthUser;
    onBack: () => void;
}

const FinanceScreen: React.FC<FinanceScreenProps> = ({ user, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [data, setData] = useState<{ payments: StudentPayment[], students: any[] }>({ payments: [], students: [] });

    useEffect(() => {
        loadData();
    }, [currentMonth, currentYear]);

    const loadData = async () => {
        setLoading(true);
        try {
            const summary = await DataService.getTrainerFinanceSummary(user.id, currentMonth, currentYear);
            setData(summary);
        } catch (error) {
            console.error("Erro ao carregar dados financeiros:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePayment = async (student: any) => {
        const existingPayment = data.payments.find(p => p.studentId === student.id);
        const newStatus = existingPayment?.status === 'paid' ? 'pending' : 'paid';

        setSaving(student.id);
        try {
            await DataService.recordPayment({
                studentId: student.id,
                trainerId: user.id,
                month: currentMonth,
                year: currentYear,
                amount: student.monthly_fee || 0,
                status: newStatus,
                paidAt: newStatus === 'paid' ? new Date().toISOString() : undefined
            });
            await loadData(); // Refresh
        } catch (error) {
            console.error("Erro ao registrar pagamento:", error);
            alert("Erro ao salvar pagamento.");
        } finally {
            setSaving(null);
        }
    };

    const changeMonth = (delta: number) => {
        let newMonth = currentMonth + delta;
        let newYear = currentYear;
        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        } else if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const filteredStudents = data.students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalExpected = data.students.reduce((acc, s) => acc + (s.monthly_fee || 0), 0);
    const totalReceived = data.payments
        .filter(p => p.status === 'paid')
        .reduce((acc, p) => acc + (p.amount || 0), 0);

    return (
        <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 animate-in fade-in duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6 pt-12 flex items-center justify-between sticky top-0 z-20">
                <button onClick={onBack} className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col items-center">
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Financeiro</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => changeMonth(-1)} className="p-1 hover:text-emerald-500 transition-colors"><ChevronLeft size={16} /></button>
                        <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">{monthNames[currentMonth - 1]} {currentYear}</span>
                        <button onClick={() => changeMonth(1)} className="p-1 hover:text-emerald-500 transition-colors"><ChevronRight size={16} /></button>
                    </div>
                </div>
                <div className="w-10"></div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <DollarSign size={48} className="text-emerald-500" />
                        </div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">Recebido</p>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">R$ {totalReceived.toFixed(2)}</p>
                        <div className="mt-2 w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div
                                className="bg-emerald-500 h-full transition-all duration-1000"
                                style={{ width: `${totalExpected > 0 ? (totalReceived / totalExpected) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Clock size={48} className="text-amber-500" />
                        </div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">Pendente</p>
                        <p className="text-2xl font-black text-amber-600 dark:text-amber-400">R$ {(totalExpected - totalReceived).toFixed(2)}</p>
                        <p className="text-[9px] font-bold text-zinc-400 mt-1 uppercase tracking-tighter">Total esperado: R$ {totalExpected.toFixed(2)}</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar aluno..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-6 py-4 font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                    />
                </div>

                {/* Students List */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-2 mb-2">
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Alunos ({filteredStudents.length})</h3>
                        <Filter size={16} className="text-zinc-300" />
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="animate-spin text-emerald-500" size={32} />
                            <p className="text-sm font-bold text-zinc-400 animate-pulse">Carregando finanças...</p>
                        </div>
                    ) : (
                        filteredStudents.map(student => {
                            const payment = data.payments.find(p => p.studentId === student.id);
                            const isPaid = payment?.status === 'paid';

                            return (
                                <div
                                    key={student.id}
                                    className={`bg-white dark:bg-zinc-900 p-5 rounded-[24px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between group hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all ${isPaid ? 'opacity-70' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${isPaid ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-zinc-900 dark:text-white">{student.name}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Vencimento: dia {student.billing_day || 10}</span>
                                                <span className="text-[10px] font-black text-emerald-600/60 dark:text-emerald-400/60">• R$ {student.monthly_fee?.toFixed(2) || '0.00'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleTogglePayment(student)}
                                        disabled={saving === student.id}
                                        className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex items-center gap-2 ${isPaid
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400'
                                            }`}
                                    >
                                        {saving === student.id ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : isPaid ? (
                                            <CheckCircle2 size={14} />
                                        ) : (
                                            <div className="w-3.5 h-3.5 rounded-full border-2 border-current opacity-30" />
                                        )}
                                        {isPaid ? 'Pago' : 'Marcar Pago'}
                                    </button>
                                </div>
                            );
                        })
                    )}

                    {!loading && filteredStudents.length === 0 && (
                        <div className="bg-white dark:bg-zinc-900 p-12 rounded-[32px] border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-300 dark:text-zinc-600 mb-4">
                                <Search size={32} />
                            </div>
                            <h3 className="font-black text-zinc-900 dark:text-white">Nenhum aluno encontrado</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Tente ajustar sua busca.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinanceScreen;
