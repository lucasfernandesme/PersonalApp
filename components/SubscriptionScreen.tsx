import React from 'react';
import { CreditCard, Rocket, CheckCircle2, ShieldCheck, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

const SubscriptionScreen: React.FC = () => {
    const { user, subscriptionStatus, subscriptionEndDate, signOut } = useAuth();
    const [isRedirecting, setIsRedirecting] = React.useState(false);

    const handleSubscribe = async () => {
        setIsRedirecting(true);
        try {
            // Here we would call the Supabase Edge Function to create a checkout session
            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                body: { priceId: 'price_1SxYEd2ZxwvErFzHuO5bLQLA' },
            });

            if (error) throw error;
            if (data?.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error('Erro ao iniciar checkout:', err);
            alert('Ocorreu um erro ao iniciar o checkout. Por favor, tente novamente.');
        } finally {
            setIsRedirecting(false);
        }
    };

    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
        'active': { label: 'Assinatura Ativa', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20', icon: ShieldCheck },
        'past_due': { label: 'Pagamento Pendente', color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20', icon: Zap },
        'canceled': { label: 'Assinatura Cancelada', color: 'text-red-500 bg-red-50 dark:bg-red-900/20', icon: Zap },
        'unpaid': { label: 'Aguardando Pagamento', color: 'text-zinc-500 bg-zinc-50 dark:bg-zinc-800', icon: CreditCard },
    };

    const currentStatus = subscriptionStatus && statusMap[subscriptionStatus] ? statusMap[subscriptionStatus] : statusMap['unpaid'];
    const StatusIcon = currentStatus.icon;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-6 flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-[40px] p-8 shadow-2xl border border-zinc-100 dark:border-zinc-800 text-center relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl opacity-50"></div>

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl transform -rotate-6">
                        <Rocket size={40} />
                    </div>

                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">PersonalFlow Pro</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8">Libere ferramentas avançadas para impulsionar seu trabalho como personal.</p>

                    <div className="space-y-4 mb-10 text-left">
                        {[
                            'Gestão ilimitada de alunos',
                            'Criação de treinos por IA',
                            'Relatórios detalhados de evolução',
                            'Agenda e agendamentos integrados',
                            'Suporte prioritário via chat'
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 size={14} />
                                </div>
                                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className={`p-4 rounded-2xl flex items-center gap-4 mb-8 ${currentStatus.color}`}>
                        <div className="w-10 h-10 rounded-xl bg-white/50 dark:bg-black/20 flex items-center justify-center">
                            <StatusIcon size={20} />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Status Atual</p>
                            <p className="font-black text-sm uppercase">{currentStatus.label}</p>
                        </div>
                    </div>

                    {(!subscriptionStatus || subscriptionStatus !== 'active') ? (
                        <button
                            onClick={handleSubscribe}
                            disabled={isRedirecting}
                            className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-3xl shadow-xl shadow-zinc-900/20 dark:shadow-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                        >
                            {isRedirecting ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    Redirecionando...
                                </>
                            ) : (
                                <>
                                    ASSINAR POR R$ 10,90/MÊS
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="text-zinc-400 dark:text-zinc-500 text-xs font-bold">
                            Próxima renovação em {new Date(subscriptionEndDate!).toLocaleDateString('pt-BR')}
                        </div>
                    )}

                    <button
                        onClick={() => signOut()}
                        className="mt-8 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 text-xs font-black uppercase tracking-widest transition-colors"
                    >
                        Sair da conta
                    </button>
                </div>
            </div>

            <p className="mt-8 text-zinc-400 dark:text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                PersonalFlow App © 2026 • Seguro via Stripe
            </p>
        </div>
    );
};

export default SubscriptionScreen;
