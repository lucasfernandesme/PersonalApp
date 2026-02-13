import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Lock, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

interface ResetPasswordScreenProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onSuccess, onCancel }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    React.useEffect(() => {
        // Parse hash for errors (e.g. #error=access_denied&error_code=otp_expired)
        const hash = window.location.hash;
        if (hash && hash.includes('error=')) {
            const params = new URLSearchParams(hash.substring(1)); // remove #
            const errorCode = params.get('error_code');
            const errorDescription = params.get('error_description');

            if (errorCode === 'otp_expired') {
                setError('O link de recuperação expirou. Por favor, solicite um novo.');
            } else if (errorDescription) {
                setError(errorDescription.replace(/\+/g, ' '));
            } else {
                setError('Link inválido ou expirado.');
            }
        }
    }, []);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 2000); // Wait a bit so user sees the success message
        } catch (err: any) {
            setError(err.message || 'Erro ao redefinir a senha.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 transition-colors">
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] shadow-xl border border-slate-100 dark:border-zinc-800 w-full max-w-md text-center space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Senha Atualizada!</h2>
                    <p className="text-slate-500 dark:text-zinc-400">
                        Sua senha foi alterada com sucesso. Você será redirecionado para o login.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 transition-colors">
            <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
                <div className="text-center space-y-2">
                    <div className="mb-6 hover:scale-105 transition-transform duration-300">
                        <img src="/logo.jpg" alt="PersonalFlow" className="w-24 h-24 rounded-full shadow-2xl shadow-zinc-900/20 dark:shadow-white/10 mx-auto" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors">Nova Senha</h1>
                    <p className="text-center text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mt-2">
                        Defina sua nova senha de acesso
                    </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] shadow-sm border border-slate-100 dark:border-zinc-800 relative">
                    <button
                        onClick={onCancel}
                        className="absolute top-8 left-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                        title="Voltar para login"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <form onSubmit={handleReset} className="space-y-6 mt-8">
                        <div className="space-y-4">
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" size={20} />
                                <input
                                    type="password"
                                    placeholder="Nova senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 dark:bg-zinc-800 border-2 border-slate-100 dark:border-zinc-800 rounded-[24px] pl-12 pr-6 py-4 font-bold text-slate-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" size={20} />
                                <input
                                    type="password"
                                    placeholder="Confirme a nova senha"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 dark:bg-zinc-800 border-2 border-slate-100 dark:border-zinc-800 rounded-[24px] pl-12 pr-6 py-4 font-bold text-slate-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl animate-in shake">
                                <AlertCircle size={20} />
                                <p className="text-xs font-bold uppercase tracking-wide">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 bg-zinc-900 dark:bg-white shadow-zinc-900/20 dark:shadow-white/10 text-white dark:text-zinc-900 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Redefinir Senha'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordScreen;
