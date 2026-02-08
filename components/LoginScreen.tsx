
import React, { useState } from 'react';
import { UserRole, AuthUser, Student } from '../types';
import { Dumbbell, Mail, Lock, ChevronRight, UserCircle, Users, Loader2, Sparkles, UserPlus, ArrowLeft, Cloud } from 'lucide-react';
import { DataService } from '../services/dataService';
import { supabase } from '../services/supabase';

interface LoginScreenProps {
  students: Student[];
  onLogin: (user: AuthUser) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ students, onLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.TRAINER);
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isCloud = DataService.isCloudActive();

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

        // Busca dados extras na tabela de trainers
        const trainerData = await DataService.findTrainer(email.toLowerCase());

        onLogin({
          id: data.user.id,
          name: trainerData?.name || data.user.user_metadata.name || 'Personal Trainer',
          email: data.user.email!,
          role: UserRole.TRAINER,
          avatar: trainerData?.avatar || data.user.user_metadata.avatar || `https://picsum.photos/seed/${data.user.email}/100`,
          surname: trainerData?.surname || '',
          instagram: trainerData?.instagram || '',
          whatsapp: trainerData?.whatsapp || '',
          cref: trainerData?.cref || ''
        });

      } else {
        // Login de Aluno
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
          // Log detalhado para debug se necessário
          if (!student) {
            console.log("Tentativa de login: Aluno não encontrado.", inputEmail);
          } else {
            console.log("Tentativa de login: Senha incorreta.");
          }
          setError(`Aluno não encontrado ou senha incorreta. (Alunos carregados: ${students.length})`);
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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: {
            name,
            role: UserRole.TRAINER,
            avatar: `https://picsum.photos/seed/${email.toLowerCase()}/100`
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        // Calculate 7-day trial end date
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7);

        const initialProfile: AuthUser = {
          id: data.user.id,
          name: name,
          email: email.toLowerCase(),
          role: UserRole.TRAINER,
          avatar: `https://picsum.photos/seed/${email.toLowerCase()}/100`,
          subscriptionStatus: 'trial',
          subscriptionEndDate: trialEndDate.toISOString().split('T')[0]
        };

        // Salvar no banco customizado 'trainers' também
        await DataService.updateTrainer(initialProfile);

        onLogin(initialProfile);
      }

    } catch (err) {
      setError('Falha ao criar conta. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 transition-colors">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-2">
          <div className="mb-6 hover:scale-105 transition-transform duration-300">
            <img src="/logo.jpg" alt="PersonalFlow" className="w-24 h-24 rounded-full shadow-2xl shadow-zinc-900/20 dark:shadow-white/10 mx-auto" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors">PersonalFlow</h1>

        </div>

        {!isRegistering ? (
          <>
            <div className="bg-white dark:bg-zinc-900 p-2 rounded-[32px] shadow-sm border border-slate-100 dark:border-zinc-800 flex gap-1 transition-colors">
              <button
                onClick={() => setRole(UserRole.TRAINER)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all ${role === UserRole.TRAINER
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg'
                  : 'text-slate-400 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}
              >
                <Users size={16} />
                Personal
              </button>
              <button
                onClick={() => setRole(UserRole.STUDENT)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all ${role === UserRole.STUDENT
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg'
                  : 'text-slate-400 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}
              >
                <UserCircle size={16} />
                Aluno
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" size={20} />
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-zinc-800 border-2 border-slate-50 dark:border-zinc-800 rounded-[24px] pl-12 pr-6 py-5 font-bold text-slate-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" size={20} />
                  <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-zinc-800 border-2 border-slate-50 dark:border-zinc-800 rounded-[24px] pl-12 pr-6 py-5 font-bold text-slate-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {error && (
                <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest animate-in shake transition-colors">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 ${role === UserRole.TRAINER
                  ? 'bg-zinc-900 dark:bg-white shadow-zinc-900/20 dark:shadow-white/10 text-white dark:text-zinc-900'
                  : 'bg-zinc-900 dark:bg-white shadow-zinc-900/20 dark:shadow-white/10 text-white dark:text-zinc-900'
                  } disabled:opacity-50`}
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Entrar no App <ChevronRight size={18} /></>}
              </button>
            </form>

            <div className="text-center">
              {role === UserRole.TRAINER ? (
                <button
                  onClick={() => setIsRegistering(true)}
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white hover:underline transition-colors"
                >
                  Criar Conta Personal
                </button>
              ) : (
                <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest px-8 leading-relaxed transition-colors">
                  Senha padrão: 123456 <span className="opacity-50">(até que você mude no cadastro do aluno)</span>
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <button onClick={() => setIsRegistering(false)} className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 font-bold text-xs uppercase tracking-widest transition-colors">
              <ArrowLeft size={16} /> Voltar
            </button>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white transition-colors">Criar Conta</h2>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Seu Nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-zinc-800 border-2 border-slate-50 dark:border-zinc-800 rounded-[24px] px-6 py-4 font-bold text-slate-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
                />
                <input
                  type="email"
                  placeholder="E-mail profissional"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-zinc-800 border-2 border-slate-50 dark:border-zinc-800 rounded-[24px] px-6 py-4 font-bold text-slate-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
                />
                <input
                  type="password"
                  placeholder="Crie sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-zinc-800 border-2 border-slate-50 dark:border-zinc-800 rounded-[24px] px-6 py-4 font-bold text-slate-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
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
        {/* DEBUG INFO */}
      </div>
    </div>
  );
};

export default LoginScreen;
