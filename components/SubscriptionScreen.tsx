import React from 'react';
import { CreditCard, Rocket, CheckCircle2, ShieldCheck, Zap, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

const SubscriptionScreen: React.FC = () => {
    const { user, subscriptionStatus, subscriptionEndDate, signOut, session, refreshSubscription } = useAuth();
    const [isRedirecting, setIsRedirecting] = React.useState(false);
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    console.log('SubscriptionScreen Debug:', { subscriptionStatus, subscriptionEndDate });

    const handleSubscribe = async () => {
        console.log('Iniciando handleSubscribe...');
        setIsRedirecting(true);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

        try {
            console.log('Garantindo sessão fresca...');
            // Tenta dar um refresh na sessão para evitar 401 (token expirado)
            const { data: { session: freshSession }, error: refreshError } = await supabase.auth.refreshSession();

            if (refreshError) {
                console.warn('Não foi possível dar refresh na sessão, tentando usar a atual:', refreshError);
            }

            const sessionToUse = freshSession || session;

            if (!sessionToUse) {
                throw new Error('Sessão não encontrada. Por favor, saia e entre novamente no app.');
            }

            console.log('Invocando função create-checkout-session via Direct Fetch...');
            const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`;
            const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            console.log('[DEBUG] URL:', functionUrl);
            console.log('[DEBUG] Key Prefix:', anonKey?.substring(0, 10));
            console.log('[DEBUG] Token Prefix:', sessionToUse.access_token.substring(0, 10));

            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToUse.access_token}`,
                    'apikey': anonKey
                },
                body: JSON.stringify({ priceId: 'price_1SxYEd2ZxwvErFzHuO5bLQLA' })
            });

            clearTimeout(timeoutId);
            console.log('Status da resposta:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Erro na resposta:', errorData);
                throw new Error(errorData.error || `Erro do servidor (Status: ${response.status})`);
            }

            const data = await response.json();
            console.log('Resposta completa:', data);

            if (data?.url) {
                console.log('Redirecionando para Stripe:', data.url);
                window.location.href = data.url;
            } else if (data?.error) {
                throw new Error(data.error);
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
                if (err.message.includes('401')) {
                    message = 'Sua sessão expirou (Erro 401). Por favor, clique em "Sair da conta" e entre novamente.';
                } else {
                    message = err.message;
                }
            }

            alert(`[DIRECT FETCH] ${message}`);
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
            const sessionToUse = freshSession || session;

            if (!sessionToUse) throw new Error('Sessão não encontrada');

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
            alert(err.message);
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
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-bold mb-1">Seu teste expira em</p>
                            <div className="text-3xl font-black text-blue-700 dark:text-blue-300">
                                {Math.ceil((new Date(subscriptionEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias
                            </div>
                            <p className="text-[10px] text-blue-500/70 dark:text-blue-400/70 mt-1 font-bold uppercase tracking-widest">Aproveite todos os recursos</p>
                        </div>
                    )}

                    {(!subscriptionStatus || subscriptionStatus !== 'active') ? (
                        <>
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

                            <button
                                onClick={async () => {
                                    if (isRefreshing) return;
                                    console.log('Verificando status manualmente...');
                                    setIsRefreshing(true);
                                    try {
                                        let data = await refreshSubscription();

                                        if (data?.subscription_status === 'active') {
                                            alert('Sucesso! Sua assinatura Pro está ativa. Aproveite!');
                                        } else {
                                            // SELF-HEALING: Tenta forçar a sincronização via Edge Function
                                            console.log('Status local inativo. Tentando Self-Healing com Stripe...');

                                            const { data: { session: currentSession } } = await supabase.auth.getSession();
                                            if (currentSession) {
                                                const syncResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-subscription`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'Authorization': `Bearer ${currentSession.access_token}`,
                                                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
                                                    }
                                                });

                                                const syncData = await syncResponse.json();
                                                console.log('Self-Healing result:', syncData);

                                                if (syncData.fixed && syncData.status === 'active') {
                                                    // Sincronização forçada funcionou! Atualiza local.
                                                    data = await refreshSubscription();
                                                    if (data?.subscription_status === 'active') {
                                                        alert('Sucesso! Pagamento confirmado e ativado automaticamente.');
                                                        return;
                                                    }
                                                }
                                            }

                                            alert('Status verificado, mas o pagamento ainda não foi processado pelo Stripe. Se você já pagou, pode levar alguns minutos para atualizar automaticamente.');
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        alert('Não conseguimos verificar o status agora. Tente novamente em alguns instantes.');
                                    } finally {
                                        setIsRefreshing(false);
                                    }
                                }}
                                disabled={isRefreshing || isRedirecting}
                                className="w-full mt-4 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-black rounded-3xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest disabled:opacity-50"
                            >
                                {isRefreshing ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <RefreshCw size={16} />
                                )}
                                {isRefreshing ? 'Verificando...' : 'Já paguei, verificar status'}
                            </button>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-zinc-400 dark:text-zinc-500 text-xs font-bold">
                                Próxima renovação em {subscriptionEndDate ? new Date(subscriptionEndDate).toLocaleDateString('pt-BR') : '...'}
                            </div>

                            <button
                                onClick={handleManageSubscription}
                                disabled={isRefreshing}
                                className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-3xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                            >
                                {isRefreshing ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Zap size={16} />
                                )}
                                {isRefreshing ? 'Abrindo...' : 'Gerenciar Assinatura'}
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

            <p className="mt-8 text-zinc-400 dark:text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                PersonalFlow App © 2026 • Seguro via Stripe
            </p>
        </div>
    );
};

export default SubscriptionScreen;
