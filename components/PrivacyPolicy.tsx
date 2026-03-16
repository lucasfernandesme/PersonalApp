import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

interface PrivacyPolicyProps {
    onBack: () => void;
    isDarkMode: boolean;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack, isDarkMode }) => {
    return (
        <div className={`min-h-screen ${isDarkMode ? 'dark bg-black text-white' : 'bg-zinc-50 text-zinc-900'} p-6 lg:p-12 transition-colors`}>
            <div className="max-w-4xl mx-auto space-y-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-zinc-500 font-bold hover:text-emerald-500 transition-colors mb-8 uppercase tracking-widest text-xs"
                >
                    <ArrowLeft size={16} />
                    Voltar
                </button>

                <div className="prose prose-zinc dark:prose-invert max-w-none">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                            <Shield className="text-emerald-500" size={28} />
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-black tracking-tight m-0">Política de Privacidade</h1>
                    </div>
                    
                    <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs mb-12">
                        Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold tracking-tight">1. Informações que Coletamos</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed text-lg">
                            Para oferecer uma experiência de gestão de treinos eficiente, o <strong>PersonalFlow</strong> coleta as seguintes informações:
                        </p>
                        <ul className="list-disc pl-6 space-y-4 text-zinc-600 dark:text-zinc-400 font-medium text-lg">
                            <li><strong>Dados do Treinador</strong>: Nome, e-mail, telefone (WhatsApp), CREF e fotos de perfil.</li>
                            <li><strong>Dados dos Alunos</strong>: Nome, e-mail, avaliações físicas, histórico de treinos e progresso.</li>
                            <li><strong>Comunicação</strong>: Mensagens trocadas dentro do chat integrado para acompanhamento técnico.</li>
                        </ul>
                    </section>

                    <section className="space-y-6 mt-12">
                        <h2 className="text-2xl font-bold tracking-tight">2. Uso dos Dados</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed text-lg">
                            Utilizamos seus dados estritamente para:
                        </p>
                        <ul className="list-disc pl-6 space-y-4 text-zinc-600 dark:text-zinc-400 font-medium text-lg">
                            <li>Personalização e entrega de planos de treinamento.</li>
                            <li>Notificações sobre atualizações de treinos e mensagens do treinador.</li>
                            <li>Processamento de assinaturas e gestão de mensalidades via parceiros de pagamento seguros.</li>
                            <li>Melhoria contínua das funcionalidades do aplicativo.</li>
                        </ul>
                    </section>

                    <section className="space-y-6 mt-12">
                        <h2 className="text-2xl font-bold tracking-tight">3. Segurança e Armazenamento</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed text-lg">
                            A segurança é nossa prioridade. Utilizamos infraestrutura de nuvem de última geração (via Supabase) com criptografia de ponta para garantir que seus dados e os de seus alunos estejam protegidos contra acessos não autorizados.
                        </p>
                    </section>

                    <section className="space-y-6 mt-12">
                        <h2 className="text-2xl font-bold tracking-tight">4. Seus Direitos</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed text-lg">
                            Você tem total controle sobre seus dados. A qualquer momento, pode:
                        </p>
                        <ul className="list-disc pl-6 space-y-4 text-zinc-600 dark:text-zinc-400 font-medium text-lg">
                            <li>Acessar, corrigir ou atualizar suas informações de perfil.</li>
                            <li>Solicitar a exclusão definitiva de sua conta e todos os dados associados.</li>
                            <li>Exportar dados de evolução e treinos para uso externo.</li>
                        </ul>
                    </section>

                    <section className="space-y-6 mt-12">
                        <h2 className="text-2xl font-bold tracking-tight">5. Contato</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed text-lg">
                            Dúvidas sobre como lidamos com sua privacidade? Fale conosco:
                            <br />
                            <span className="text-emerald-500 font-bold text-xl">flowapppro@gmail.com</span>
                        </p>
                    </section>
                </div>

                <div className="pt-12 border-t border-zinc-200 dark:border-zinc-800 text-center">
                    <p className="text-zinc-400 dark:text-zinc-600 text-xs font-bold uppercase tracking-widest italic">
                        © {new Date().getFullYear()} PersonalFlow. Transformando o fitness com tecnologia.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
