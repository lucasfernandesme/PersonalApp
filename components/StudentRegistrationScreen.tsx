
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, Calendar, Ruler, Weight, CheckCircle2 } from 'lucide-react';

interface StudentRegistrationScreenProps {
  onSave: (studentData: any) => void;
  onDelete?: (id: string) => void;
  onBack: () => void;
  initialData?: any;
}

const StudentRegistrationScreen: React.FC<StudentRegistrationScreenProps> = ({ onSave, onBack, initialData, onDelete }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    height: '',
    weight: '',
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
        height: initialData.height || '',
        weight: initialData.weight || '',
        goal: initialData.goal || 'Hipertrofia',
        experience: initialData.experience || 'beginner',
        isActive: initialData.isActive !== false
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(initialData ? { ...formData, id: initialData.id } : formData);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col animate-in slide-in-from-right duration-300">
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-slate-400">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-slate-900">{initialData ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}</h2>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Informações Pessoais</label>

          <div className="space-y-1">
            <div className="relative">
              <User className="absolute left-4 top-4 text-slate-300" size={20} />
              <input
                required
                type="text"
                placeholder="Nome completo"
                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-bold focus:ring-2 focus:ring-indigo-500"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-300" size={20} />
              <input
                required
                type="email"
                placeholder="E-mail"
                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-bold focus:ring-2 focus:ring-indigo-500"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-4 top-4 text-slate-300" size={20} />
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-bold focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Nascimento</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-4 text-slate-300" size={20} />
                <input
                  type="date"
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 font-bold focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={formData.birthDate}
                  onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Dados Antropométricos</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Altura (cm)</label>
              <div className="relative">
                <Ruler className="absolute left-4 top-4 text-slate-300" size={20} />
                <input
                  type="number"
                  placeholder="Ex: 175"
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-bold focus:ring-2 focus:ring-indigo-500"
                  value={formData.height}
                  onChange={e => setFormData({ ...formData, height: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Peso (kg)</label>
              <div className="relative">
                <Weight className="absolute left-4 top-4 text-slate-300" size={20} />
                <input
                  type="number"
                  placeholder="Ex: 80"
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-bold focus:ring-2 focus:ring-indigo-500"
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Objetivo principal</label>
            <div className="grid grid-cols-2 gap-3">
              {goals.map(g => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setFormData({ ...formData, goal: g })}
                  className={`p-4 rounded-2xl border-2 font-bold text-xs transition-all ${formData.goal === g ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nível de Experiência</label>
            <div className="grid grid-cols-3 gap-2">
              {levels.map(l => (
                <button
                  type="button"
                  key={l.id}
                  onClick={() => setFormData({ ...formData, experience: l.id })}
                  className={`p-3 rounded-2xl border-2 font-bold text-[10px] uppercase tracking-tighter transition-all ${formData.experience === l.id ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
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
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Status do Aluno</label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`w-full p-5 rounded-3xl border-2 flex items-center justify-between transition-all ${formData.isActive
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-slate-100 border-slate-200 text-slate-500'
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
              <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isActive ? 'right-1' : 'left-1'}`}></div>
              </div>
            </button>
          </div>
        )}
      </form>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 flex gap-4">
        {initialData && onDelete && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.')) {
                onDelete(initialData.id);
              }
            }}
            className="flex-1 bg-red-50 text-red-600 font-black uppercase text-xs tracking-widest py-5 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors"
          >
            Excluir
          </button>
        )}
        <button
          onClick={handleSubmit}
          className="flex-[2] bg-indigo-600 text-white font-black uppercase text-xs tracking-widest py-5 rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
        >
          {initialData ? 'Atualizar Aluno' : 'Salvar Aluno'}
          <CheckCircle2 size={18} />
        </button>
      </div>
    </div >
  );
};

export default StudentRegistrationScreen;
