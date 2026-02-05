
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, Calendar, Ruler, Weight, CheckCircle2 } from 'lucide-react';

interface StudentRegistrationScreenProps {
  onSave: (studentData: any) => void;
  onDelete?: (id: string) => void;
  onBack: () => void;
  initialData?: any;
}

const StudentRegistrationScreen: React.FC<StudentRegistrationScreenProps> = ({ onSave, onBack, initialData, onDelete }) => {
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      let formatted = numbers;
      if (numbers.length > 2) {
        formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      }
      if (numbers.length > 7) {
        formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
      }
      return formatted;
    }
    return value.slice(0, 15); // Limita o tamanho visual
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '' as 'male' | 'female' | 'other',
    goal: 'Hipertrofia',
    experience: 'beginner',
    isActive: true
  });

  const levels = [
    { id: 'beginner', label: 'Iniciante' },
    { id: 'intermediate', label: 'Intermediário' },
    { id: 'advanced', label: 'Avançado' }
  ];

  const goals = ['Hipertrofia', 'Emagrecimento', 'Força', 'Saúde'];

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        birthDate: initialData.birthDate || '',
        gender: initialData.gender || '',
        goal: initialData.goal || 'Hipertrofia',
        experience: initialData.experience || 'beginner',
        isActive: initialData.isActive !== false
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação de campos obrigatórios
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!formData.name.trim() || !formData.email.trim() || !formData.birthDate || !formData.gender || !phoneDigits) {
      alert('Por favor, preencha todos os campos obrigatórios (Nome, E-mail, WhatsApp, Data de Nascimento e Gênero)');
      return;
    }

    if (phoneDigits.length < 11) {
      alert('Por favor, insira um número de WhatsApp válido com DDD (Ex: 11 99999-9999)');
      return;
    }

    onSave(initialData ? { ...formData, id: initialData.id } : formData);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-50 dark:bg-zinc-950 flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
      {/* Dynamic Header Standardized */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 transition-all duration-300 relative flex-shrink-0 mb-6">
        <button onClick={onBack} className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors z-10 w-10">
          <ArrowLeft size={24} />
        </button>

        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="PersonalFlow" className="w-8 h-8 rounded-full shadow-sm" />
          <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">PersonalFlow</span>
        </div>

        <div className="w-10"></div> {/* Placeholder for symmetry */}
      </header>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-6 pb-2">
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              {initialData ? 'Editar Aluno' : 'Novo Aluno'}
            </h2>
            <p className="text-zinc-400 dark:text-zinc-500 font-medium">
              {initialData ? 'Atualize os dados e as configurações do aluno.' : 'Cadastre um novo aluno para começar a prescrever treinos.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8 pb-32">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 ml-1">Informações Pessoais <span className="text-red-500">*</span></label>

            <div className="space-y-1">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600" size={20} />
                <input
                  required
                  type="text"
                  placeholder="Nome completo"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-6 py-4 font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-colors"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600" size={20} />
                <input
                  required
                  type="email"
                  placeholder="E-mail"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-6 py-4 font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-colors"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 ml-1">WhatsApp <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600" size={20} />
                  <input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-6 py-4 font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-sm transition-colors"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 ml-1">Nascimento <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600" size={20} />
                  <input
                    type="date"
                    required
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-sm transition-colors"
                    value={formData.birthDate}
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 ml-1">Gênero <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'male', label: 'Masculino' },
                  { id: 'female', label: 'Feminino' },
                  { id: 'other', label: 'Outro' }
                ].map(g => (
                  <button
                    type="button"
                    key={g.id}
                    onClick={() => setFormData({ ...formData, gender: g.id as any })}
                    className={`p-3 rounded-2xl border-2 font-bold text-[10px] uppercase tracking-tighter transition-all ${formData.gender === g.id
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-lg shadow-zinc-900/20 dark:shadow-zinc-100/10'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 ml-1">Objetivo principal</label>
              <div className="grid grid-cols-2 gap-3">
                {goals.map(g => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setFormData({ ...formData, goal: g })}
                    className={`p-4 rounded-2xl border-2 font-bold text-xs transition-all ${formData.goal === g
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-lg shadow-zinc-900/20 dark:shadow-zinc-100/10'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 ml-1">Nível de Experiência</label>
              <div className="grid grid-cols-3 gap-2">
                {levels.map(l => (
                  <button
                    type="button"
                    key={l.id}
                    onClick={() => setFormData({ ...formData, experience: l.id })}
                    className={`p-3 rounded-2xl border-2 font-bold text-[10px] uppercase tracking-tighter transition-all ${formData.experience === l.id
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-lg shadow-zinc-900/20 dark:shadow-zinc-100/10'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {initialData && (
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 ml-1">Status do Aluno</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`w-full p-5 rounded-3xl border-2 flex items-center justify-between transition-all ${formData.isActive
                  ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400'
                  : 'bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'
                  }`}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="font-black text-sm uppercase tracking-wider">
                    {formData.isActive ? 'Aluno Ativo' : 'Aluno Inativo'}
                  </span>
                  <span className="text-[10px] font-bold opacity-70 text-left">
                    {formData.isActive ? 'Recebe notificações e acessa treinos' : 'Acesso suspenso temporariamente'}
                  </span>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.isActive ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isActive ? 'right-1' : 'left-1'}`}></div>
                </div>
              </button>
            </div>
          )}
        </form>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex gap-4 transition-colors">
          {initialData && onDelete && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.')) {
                  onDelete(initialData.id);
                }
              }}
              className="flex-1 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-black uppercase text-xs tracking-widest py-5 rounded-2xl border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
            >
              Excluir
            </button>
          )}
          <button
            onClick={handleSubmit}
            className="flex-[2] bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-black uppercase text-xs tracking-widest py-5 rounded-2xl shadow-xl shadow-zinc-900/30 dark:shadow-zinc-100/10 flex items-center justify-center gap-2 transition-all"
          >
            {initialData ? 'Atualizar Aluno' : 'Salvar Aluno'}
            <CheckCircle2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistrationScreen;
