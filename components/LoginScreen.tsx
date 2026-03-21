import React, { useState } from 'react';
import { UserRole, AuthUser, Student } from '../types';
import { Mail, Lock, ChevronRight, Users, Loader2, UserPlus, ArrowLeft, UserCircle, Sun, Moon } from 'lucide-react';
import { DataService } from '../services/dataService';
import { supabase } from '../services/supabase';
import { formatPhone } from '../utils/formatters';
import { useTheme } from '../contexts/ThemeContext';

interface LoginScreenProps {
  students: Student[];
  onLogin: (user: AuthUser) => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (v: boolean) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ students, onLogin, isDarkMode = false, setIsDarkMode }) => {
  const { theme } = useTheme();
  const [role, setRole] = useState<UserRole>(UserRole.TRAINER);
  const [view, setView] = useState<'login' | 'register' | 'forgot_password'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (role === UserRole.TRAINER) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password,
        });

        if (authError || !data.user) {
          setError('E-mail ou senha incorretos.');
          return;
        }

        const trainerData = await DataService.findTrainer(email.toLowerCase());

        onLogin({
          id: data.user.id,
          name: trainerData?.name || data.user.user_metadata.full_name || 'Personal Trainer',
          email: data.user.email!,
          role: UserRole.TRAINER,
          avatar: trainerData?.avatar || data.user.user_metadata.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=random`,
          surname: trainerData?.surname || '',
          instagram: trainerData?.instagram || '',
          whatsapp: trainerData?.whatsapp || '',
          cref: trainerData?.cref || ''
        });

      } else {
        const inputEmail = email.trim().toLowerCase();
        const student = students.find(s => s.email.toLowerCase() === inputEmail);
        const validPassword = student?.password || '123456';

        if (student && password === validPassword) {
          onLogin({
            id: student.id,
            name: student.name,
            email: student.email,
            role: UserRole.STUDENT,
            avatar: student.avatar
          });
        } else {
          setError(`Aluno não encontrado ou senha incorreta.`);
        }
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (email !== confirmEmail) {
        setError('Os e-mails não coincidem.');
        return;
      }

      if (!whatsapp) {
        setError('O telefone é obrigatório.');
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: {
            full_name: name,
            role: UserRole.TRAINER,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            whatsapp
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7);

        const initialProfile: AuthUser = {
          id: data.user.id,
          name: name,
          email: email.toLowerCase(),
          role: UserRole.TRAINER,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          whatsapp: whatsapp,
          subscriptionStatus: 'trial',
          subscriptionEndDate: trialEndDate.toISOString()
        };

        await DataService.updateTrainer(initialProfile);
        onLogin(initialProfile);
      }

    } catch (err: any) {
      setError(err.message || 'Falha ao criar conta. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert("Por favor, preencha seu e-mail para recuperar a senha.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      alert("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      setView('login');
    } catch (err: any) {
      alert(`Erro ao enviar e-mail: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 transition-colors relative">
      {/* Header removed as requested */}

      <div className="w-full max-w-md space-y-8 mt-12">
        <div className="text-center">
          <div className="flex justify-center">
            <img 
              src={theme === 'dark' ? "/logo10.png" : "/logo9.png"} 
              alt="Logo" 
              className="h-48 w-auto object-contain animate-in fade-in zoom-in duration-700" 
            />
          </div>
          <p className="text-center text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 -mt-12 animate-in slide-in-from-top-2">
            Gestão Inteligente de Treinos
          </p>
        </div>

        {view === 'login' && (
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl mb-8 border border-zinc-200 dark:border-zinc-800 shadow-inner">
            <button
              onClick={() => setRole(UserRole.TRAINER)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${role === UserRole.TRAINER
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-lg'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
            >
              Professor
            </button>
            <button
              onClick={() => setRole(UserRole.STUDENT)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${role === UserRole.STUDENT
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-lg'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
            >
              Aluno
            </button>
          </div>
        )}

        {view === 'login' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" size={20} />
                  <input
                    type="email"
                    placeholder="Seu E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-zinc-800 border-2 border-zinc-50 dark:border-zinc-800 rounded-[24px] pl-12 pr-6 py-5 font-bold text-zinc-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" size={20} />
                  <input
                    type="password"
                    placeholder="Sua Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-zinc-800 border-2 border-zinc-50 dark:border-zinc-800 rounded-[24px] pl-12 pr-6 py-5 font-bold text-zinc-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {error && (
                <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest animate-in shake transition-colors">{error}</p>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setView('forgot_password')}
                  className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-wide"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 bg-zinc-900 dark:bg-white shadow-zinc-900/20 dark:shadow-white/10 text-white dark:text-zinc-900 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Entrar no Sistema
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              {role === UserRole.TRAINER ? (
                <button
                  onClick={() => setView('register')}
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white hover:underline transition-colors"
                >
                  Não tenho uma conta
                </button>
              ) : (
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 text-center max-w-[280px] mx-auto leading-relaxed">
                  Utilize os dados de login fornecidos pelo seu <span className="text-zinc-900 dark:text-zinc-300 font-extrabold">Personal Trainer</span>.
                </p>
              )}
            </div>
          </div>
        )}

        {view === 'register' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <button onClick={() => setView('login')} className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 font-bold text-xs uppercase tracking-widest transition-colors">
              <ArrowLeft size={16} /> Voltar
            </button>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white transition-colors">Criar Nova Conta</h2>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nome Completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-zinc-800 border-2 border-zinc-50 dark:border-zinc-800 rounded-[24px] px-6 py-4 font-bold text-zinc-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
                />
                <input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-zinc-800 border-2 border-zinc-50 dark:border-zinc-800 rounded-[24px] px-6 py-4 font-bold text-zinc-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
                />
                <input
                  type="email"
                  placeholder="Confirme seu E-mail"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-zinc-800 border-2 border-zinc-50 dark:border-zinc-800 rounded-[24px] px-6 py-4 font-bold text-zinc-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
                />
                <input
                  type="tel"
                  placeholder="Telefone (WhatsApp)"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                  required
                  className="w-full bg-white dark:bg-zinc-800 border-2 border-zinc-50 dark:border-zinc-800 rounded-[24px] px-6 py-4 font-bold text-zinc-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
                />
                <input
                  type="password"
                  placeholder="Crie sua Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-zinc-800 border-2 border-zinc-50 dark:border-zinc-800 rounded-[24px] px-6 py-4 font-bold text-zinc-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
                />
              </div>

              {error && <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest animate-in shake transition-colors">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 bg-zinc-900 dark:bg-white shadow-zinc-900/20 dark:shadow-white/10 text-white dark:text-zinc-900 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Criar Conta <UserPlus size={18} /></>}
              </button>
            </form>
          </div>
        )}

        {view === 'forgot_password' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <button onClick={() => setView('login')} className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 font-bold text-xs uppercase tracking-widest transition-colors">
              <ArrowLeft size={16} /> Voltar
            </button>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white transition-colors">Recuperar Senha</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Digite seu e-mail para receber o link de redefinição de senha.
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Seu e-mail cadastrado"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-zinc-800 border-2 border-zinc-50 dark:border-zinc-800 rounded-[24px] px-6 py-4 font-bold text-zinc-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
                />
              </div>

              {error && <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest animate-in shake transition-colors">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 bg-zinc-900 dark:bg-white shadow-zinc-900/20 dark:shadow-white/10 text-white dark:text-zinc-900 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Enviar Link <Mail size={18} /></>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
