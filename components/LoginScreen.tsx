
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

        onLogin({
          id: data.user.id,
          name: data.user.user_metadata.name || 'Personal Trainer',
          email: data.user.email!,
          role: UserRole.TRAINER,
          avatar: data.user.user_metadata.avatar || `https://picsum.photos/seed/${data.user.email}/100`
        });

      } else {
        // Login de Aluno
        const student = students.find(s => s.email.toLowerCase() === email.toLowerCase());
        if (student && password === '123456') {
          onLogin({
            id: student.id,
            name: student.name,
            email: student.email,
            role: UserRole.STUDENT,
            avatar: student.avatar
          });
        } else {
          setError('Aluno não encontrado ou senha padrão (123456) incorreta.');
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
        // Opcional: Salvar no banco customizado 'trainers' também, se necessário
        // Mas por enquanto vamos confiar só no Auth
        onLogin({
          id: data.user.id,
          name: name,
          email: data.user.email!,
          role: UserRole.TRAINER,
          avatar: `https://picsum.photos/seed/${email.toLowerCase()}/100`
        });
      }

    } catch (err) {
      setError('Falha ao criar conta. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 bg-indigo-600 rounded-[28px] shadow-xl shadow-indigo-600/30 mb-4 animate-bounce">
            <Dumbbell className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">FitAI <span className="text-indigo-600">Pro</span></h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
            {isCloud ? 'Cloud Database Connected' : 'High Performance Management'}
          </p>
        </div>

        {!isRegistering ? (
          <>
            <div className="bg-white p-2 rounded-[32px] shadow-sm border border-slate-100 flex gap-1">
              <button
                onClick={() => setRole(UserRole.TRAINER)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all ${role === UserRole.TRAINER ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <Users size={16} />
                Personal
              </button>
              <button
                onClick={() => setRole(UserRole.STUDENT)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all ${role === UserRole.STUDENT ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <UserCircle size={16} />
                Aluno
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white border-2 border-slate-100 rounded-[24px] pl-12 pr-6 py-5 font-bold focus:border-indigo-600 focus:bg-white transition-all outline-none"
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white border-2 border-slate-100 rounded-[24px] pl-12 pr-6 py-5 font-bold focus:border-indigo-600 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              {error && (
                <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest animate-in shake">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 ${role === UserRole.TRAINER ? 'bg-slate-900 shadow-slate-900/20' : 'bg-indigo-600 shadow-indigo-600/20'} text-white disabled:opacity-50`}
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Entrar no App <ChevronRight size={18} /></>}
              </button>
            </form>

            <div className="text-center">
              {role === UserRole.TRAINER ? (
                <button
                  onClick={() => setIsRegistering(true)}
                  className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline"
                >
                  Criar Conta Personal
                </button>
              ) : (
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-8 leading-relaxed">
                  Senha padrão: 123456 (até que você mude no cadastro do aluno)
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <button onClick={() => setIsRegistering(false)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest">
              <ArrowLeft size={16} /> Voltar
            </button>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Cadastro Cloud</h2>
              <p className="text-slate-400 text-xs font-medium">Sua conta será salva no banco de dados do Supabase.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Seu Nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-white border-2 border-slate-100 rounded-[24px] px-6 py-4 font-bold focus:border-indigo-600 transition-all outline-none"
                />
                <input
                  type="email"
                  placeholder="E-mail profissional"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white border-2 border-slate-100 rounded-[24px] px-6 py-4 font-bold focus:border-indigo-600 transition-all outline-none"
                />
                <input
                  type="password"
                  placeholder="Crie sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white border-2 border-slate-100 rounded-[24px] px-6 py-4 font-bold focus:border-indigo-600 transition-all outline-none"
                />
              </div>

              {error && <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Criar Conta na Nuvem <Cloud size={18} /></>}
              </button>
            </form>
          </div>
        )}


      </div>
    </div>
  );
};

export default LoginScreen;
