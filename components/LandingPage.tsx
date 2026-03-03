import React from 'react';
import { ArrowRight, ChevronRight, CheckCircle2, Zap, Dumbbell, Calendar, MessageCircle, BarChart3, Star, Play, Shield } from 'lucide-react';

interface LandingPageProps {
    onEnterApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-emerald-500/30">
            {/* Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 transition-colors">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="PersonalFlow" className="w-10 h-10 object-contain dark:hidden" />
                        <img src="/logo-dark.png" alt="PersonalFlow" className="w-10 h-10 object-contain hidden dark:block" />
                        <span className="font-extrabold text-xl text-zinc-900 dark:text-white tracking-tight">PersonalFlow</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="#features" className="hidden md:block text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Recursos</a>
                        <a href="#benefits" className="hidden md:block text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Vantagens</a>
                        <a href="#pricing" className="hidden md:block text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Planos</a>
                        <button
                            onClick={onEnterApp}
                            className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-zinc-900/20 dark:shadow-white/10"
                        >
                            Entrar
                        </button>
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden px-6">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

                    <div className="max-w-7xl mx-auto relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 mb-8 animate-in slide-in-from-bottom-4 duration-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            O futuro da consultoria fitness
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white tracking-tighter leading-[1.1] mb-8 max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
                            Evolua a forma como você <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">gerencia seus alunos.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed mb-12 animate-in slide-in-from-bottom-10 duration-700 delay-100">
                            Crie treinos incríveis, acompanhe a evolução e ofereça uma experiência premium. O PersonalFlow foi feito para transformar seu negócio.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-12 duration-700 delay-200">
                            <button
                                onClick={onEnterApp}
                                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-colors shadow-xl shadow-emerald-500/20"
                            >
                                Começar Agora <ArrowRight size={18} />
                            </button>
                            <a
                                href="#features"
                                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-3 transition-colors"
                            >
                                Ver Recursos
                            </a>
                        </div>
                    </div>
                </section>

                {/* Features Preview */}
                <section id="features" className="py-20 bg-white dark:bg-zinc-950 px-6 border-y border-zinc-100 dark:border-zinc-900">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white mb-4">Tudo que você precisa em um só lugar</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">Diga adeus às planilhas e mensagens perdidas. Otimize seu tempo com ferramentas poderosas de organização e gestão.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { icon: <Dumbbell className="text-emerald-500" size={32} />, title: "Criador de Treinos", desc: "Monte fichas de forma ágil com nossa biblioteca de exercícios ou adicione os seus vídeos customizados." },
                                { icon: <Calendar className="text-blue-500" size={32} />, title: "Agenda Inteligente", desc: "Controle as datas de vencimento, pagamentos mensais e horários das aulas presenciais com facilidade." },
                                { icon: <BarChart3 className="text-purple-500" size={32} />, title: "Acompanhamento", desc: "Registre anamneses, avaliações morfológicas e veja gráficos reais da evolução dos seus alunos ao longo do tempo." },
                                { icon: <Zap className="text-yellow-500" size={32} />, title: "Notificações Pelo WhatsApp", desc: "Gere links para enviar dados de login, metas, feedbacks e relatórios diretamente no chat do aluno." },
                                { icon: <MessageCircle className="text-pink-500" size={32} />, title: "Chat Integrado", desc: "Mantenha a comunicação organizada. Separe sua vida pessoal da profissional, respondendo às dúvidas direto no app." },
                                { icon: <Play className="text-red-500" size={32} />, title: "Vídeos e Referências", desc: "Sem dúvidas na execução: cada exercício pode ter o seu vídeo, garantindo mais segurança e resultado." }
                            ].map((feature, idx) => (
                                <div key={idx} className="bg-zinc-50 dark:bg-zinc-900 rounded-[32px] p-8 border border-zinc-100 dark:border-zinc-800 hover:-translate-y-2 transition-transform duration-300">
                                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-950 flex items-center justify-center shadow-sm mb-6">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{feature.title}</h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section id="benefits" className="py-24 px-6">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8">
                            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white leading-[1.1]">
                                Mais profissionalismo. <br />
                                <span className="text-zinc-400">Mais valor cobrado.</span>
                            </h2>
                            <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                Entregar uma planilha em PDF é passado. Ter um aplicativo próprio para seus alunos acessarem os treinos aumenta enormemente a percepção de valor do seu serviço. Quando a experiência é premium, o preço acompanha.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    "Aumento na retenção de alunos.",
                                    "Cobranças de mensalidades automatizadas via Stripe.",
                                    "Mais facilidade na renovação de treinos.",
                                    "Dashboard intuitivo para você focar no que dá resultado."
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 size={14} className="text-emerald-500" />
                                        </div>
                                        <span className="font-bold text-zinc-700 dark:text-zinc-300">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={onEnterApp}
                                className="mt-4 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors inline-flex items-center gap-2"
                            >
                                Experimentar o App <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="flex-1 w-full max-w-md lg:max-w-full relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-[48px] rotate-3 opacity-20 blur-xl"></div>
                            <img
                                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3"
                                alt="Trainer app view"
                                className="rounded-[40px] shadow-2xl relative z-10 border-8 border-white dark:border-zinc-900 object-cover h-[500px] w-full"
                            />

                            {/* Floating Badge */}
                            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 z-20 flex items-center gap-4 animate-in slide-in-from-left duration-700 delay-500">
                                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                    <Star size={24} className="text-yellow-500 fill-yellow-500" />
                                </div>
                                <div>
                                    <p className="font-black text-zinc-900 dark:text-white text-lg">5.0</p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Avaliação Média</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-24 px-6 bg-zinc-50 dark:bg-black border-t border-zinc-100 dark:border-zinc-900">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-4">Simples e Transparente</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">Sem taxas escondidas. Foque no resultado dos seus alunos.</p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 border-2 border-emerald-500 rounded-[32px] p-8 md:p-12 relative shadow-2xl shadow-emerald-500/10">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg">
                                Plano Único Pro
                            </div>

                            <div className="flex flex-col md:flex-row gap-12 items-center">
                                <div className="flex-1 space-y-6">
                                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white">Acesso Total ao PersonalFlow</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                                        Tenha todos os recursos liberados para sua consultoria, sem nenhum limite de alunos.
                                    </p>
                                    <ul className="space-y-4">
                                        {[
                                            'Gestão ilimitada de alunos',
                                            'Criação de treinos por IA',
                                            'Relatórios detalhados de evolução',
                                            'Agenda e agendamentos integrados',
                                            'Suporte prioritário via chat'
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300 font-bold text-sm bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                    <CheckCircle2 size={16} strokeWidth={3} />
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="w-full md:w-auto bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[24px] text-center shadow-inner">
                                    <div className="text-zinc-500 dark:text-zinc-400 font-bold mb-2 uppercase tracking-wide text-xs">Apenas</div>
                                    <div className="flex items-end justify-center gap-1 mb-8 text-zinc-900 dark:text-white">
                                        <span className="text-2xl font-black">R$</span>
                                        <span className="text-7xl font-black tracking-tighter">10</span>
                                        <span className="text-2xl font-bold text-zinc-500 dark:text-zinc-400 mb-1">,90</span>
                                    </div>
                                    <div className="text-zinc-500 dark:text-zinc-400 font-bold mb-6 text-sm">por mês</div>
                                    <button
                                        onClick={onEnterApp}
                                        className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                                    >
                                        Assinar Agora
                                    </button>
                                    <div className="mt-4 flex items-center justify-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-bold">
                                        <Shield size={14} className="text-emerald-500" />
                                        7 dias grátis. Cancele quando quiser.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-zinc-950 py-12 px-6 border-t border-zinc-200 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="PersonalFlow" className="w-8 h-8 object-contain grayscale opacity-70 dark:hidden" />
                        <img src="/logo-dark.png" alt="PersonalFlow" className="w-8 h-8 object-contain grayscale opacity-70 hidden dark:block" />
                        <span className="font-bold text-zinc-500 dark:text-zinc-400 tracking-tight">© {new Date().getFullYear()} PersonalFlow.</span>
                    </div>

                    <div className="flex items-center gap-8 text-sm font-bold text-zinc-400 dark:text-zinc-500">
                        <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Termos</a>
                        <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Privacidade</a>
                        <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Contato</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

