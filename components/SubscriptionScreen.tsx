import React from 'react';
import { CreditCard, Rocket, CheckCircle2, ShieldCheck, Zap, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Capacitor } from '@capacitor/core';
import { useRevenueCat } from '../hooks/useRevenueCat';

const SubscriptionScreen: React.FC = () => {
    const { user, subscriptionStatus, subscriptionEndDate, signOut, session, refreshSubscription, subscriptionSource } = useAuth();
    const { purchasePackage, offerings } = useRevenueCat();
    const [isRedirecting, setIsRedirecting] = React.useState(false);
    const [isRefreshing, setIsRefreshing] = React.useState(false);



    const handleSubscribe = async () => {
        setIsRedirecting(true);

        if (Capacitor.isNativePlatform()) {
            try {
                if (offerings?.current?.monthly) {
                    const result = await purchasePackage(offerings.current.monthly);
                    if (result) {
                        await refreshSubscription();
                        alert("Assinatura realizada com sucesso!");
                    }
                } else {
                    alert("Nenhum plano disponível na loja. Tente novamente mais tarde.");
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsRedirecting(false);
            }
            return;
        }

        console.log('Iniciando handleSubscribe via Direct Fetch...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

        try {
            // Força a atualização da sessão para garantir token válido
            const { data: { session: freshSession }, error: refreshError } = await supabase.auth.refreshSession();

            if (refreshError) {
                console.warn('Falha no refreshSession, buscando getSession...', refreshError);
            }

            const { data: { session: currentSession } } = await supabase.auth.getSession();
            const sessionToUse = freshSession || currentSession || session;

            if (!sessionToUse) throw new Error('Sessão expirada. Por favor, saia e entre novamente.');

            const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`;
            const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToUse.access_token}`,
                    'apikey': anonKey
                },
                body: JSON.stringify({ priceId: 'price_1SxYEd2ZxwvErFzHuO5bLQLA' }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro do servidor (Status: ${response.status})`);
            }

            const data = await response.json();
            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error('Não recebi o link de pagamento do servidor.');
            }
        } catch (err: any) {
            clearTimeout(timeoutId);
            console.error('Erro detalhado no checkout:', err);

            let message = 'Não conseguimos iniciar o pagamento.';
            if (err.name === 'AbortError') {
                message = 'A conexão demorou muito. Verifique sua internet.';
            } else if (err.message) {
                if (err.message.includes('401') || err.message.includes('Sessão expirada')) {
                    message = 'Sua sessão expirou (Erro 401). Por favor, clique em "Sair da conta" e entre novamente.';
                } else {
                    message = err.message;
                }
            }

            alert(`[ERRO] ${message}`);
            setIsRedirecting(false);
        }
    };

    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
        'active': { label: 'Assinatura Ativa', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20', icon: ShieldCheck },
        'trial': { label: 'Teste Grátis (7 dias)', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20', icon: Rocket },
        'past_due': { label: 'Pagamento Pendente', color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20', icon: Zap },
        'canceled': { label: 'Assinatura Cancelada', color: 'text-red-500 bg-red-50 dark:bg-red-900/20', icon: Zap },
        'unpaid': { label: 'Aguardando Pagamento', color: 'text-zinc-500 bg-zinc-50 dark:bg-zinc-800', icon: CreditCard },
    };

    const currentStatus = subscriptionStatus && statusMap[subscriptionStatus] ? statusMap[subscriptionStatus] : statusMap['unpaid'];
    const StatusIcon = currentStatus.icon;

    const handleManageSubscription = async () => {
        setIsRefreshing(true);
        try {
            const { data: { session: freshSession } } = await supabase.auth.refreshSession();
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            const sessionToUse = freshSession || currentSession || session;

            if (!sessionToUse) throw new Error('Sessão expirada. Por favor, saia e faça login novamente.');

            const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`;
            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToUse.access_token}`,
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Erro ao abrir portal de gerenciamento');
            }

            const data = await response.json();
            if (data?.url) {
                window.location.href = data.url;
            }
        } catch (err: any) {
            alert(`[ERRO] ${err.message || 'Erro ao abrir portal'}`);
        } finally {
            setIsRefreshing(false);
        }
    };

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

                    {subscriptionStatus === 'trial' && subscriptionEndDate && (
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                            {(() => {
                                const daysRemaining = Math.ceil((new Date(subscriptionEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                if (daysRemaining <= 0) {
                                    return (
                                        <>
                                            <p className="text-sm text-red-600 dark:text-red-400 font-bold mb-1">Seu teste grátis expirou</p>
                                            <div className="text-3xl font-black text-red-700 dark:text-red-300">
                                                0 dias
                                            </div>
                                            <p className="text-[10px] text-red-500/70 dark:text-red-400/70 mt-1 font-bold uppercase tracking-widest">Assine agora para continuar usando</p>
                                        </>
                                    );
                                }
                                return (
                                    <>
                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-bold mb-1">Seu teste expira em</p>
                                        <div className="text-3xl font-black text-blue-700 dark:text-blue-300">
                                            {daysRemaining} dias
                                        </div>
                                        <p className="text-[10px] text-blue-500/70 dark:text-blue-400/70 mt-1 font-bold uppercase tracking-widest">Aproveite todos os recursos</p>
                                    </>
                                );
                            })()}
                        </div>
                    )}

                    {(!subscriptionStatus || subscriptionStatus !== 'active') ? (
                        <>
                            {/* Hide the direct Stripe subscribe button on native platforms to comply with Apple/Google guidelines */}
                            {!Capacitor.isNativePlatform() ? (
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
                                <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl mb-4 text-sm text-zinc-600 dark:text-zinc-400 font-medium text-center">
                                    Para assinar o PersonalFlow Pro, por favor, acesse nosso site oficial pelo navegador do seu computador.
                                </div>
                            )}


                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-zinc-400 dark:text-zinc-500 text-xs font-bold">
                                Próxima renovação em {subscriptionEndDate ? new Date(subscriptionEndDate).toLocaleDateString('pt-BR') : '...'}
                            </div>

                            <button
                                onClick={handleManageSubscription}
                                disabled={isRefreshing}
                                className="w-full py-4 font-black rounded-3xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                            >
                                {isRefreshing ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Zap size={16} />
                                )}
                                {isRefreshing ? 'Abrindo...' : 'GERENCIAR ASSINATURA'}
                            </button>
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
            <div className="mt-8 max-w-md w-full">
                <div className="bg-zinc-50 dark:bg-zinc-950 rounded-[32px] p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-center items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center mb-2 shadow-sm border border-zinc-100 dark:border-zinc-800">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <h4 className="font-black text-zinc-950 dark:text-white uppercase tracking-tight">
                        Pagamento Seguro
                    </h4>
                    <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        A gestão da assinatura é processada em ambiente seguro do Stripe. O aplicativo não armazena dados de cartão de crédito.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionScreen;
