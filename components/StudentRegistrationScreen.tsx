
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, Calendar, Ruler, Weight, CheckCircle2 } from 'lucide-react';

interface StudentRegistrationScreenProps {
  onSave: (studentData: any) => void;
  onBack: () => void;
  initialData?: any;
}

const StudentRegistrationScreen: React.FC<StudentRegistrationScreenProps> = ({ onSave, onBack, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    height: '',
    weight: '',
    goal: 'Hipertrofia',
    level: 'beginner'
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
        level: initialData.experience || 'beginner'
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
                onChange={e => setFormData({...formData, name: e.target.value})}
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
                onChange={e => setFormData({...formData, email: e.target.value})}
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
                  onChange={e => setFormData({...formData, phone: e.target.value})}
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
                  onChange={e => setFormData({...formData, birthDate: e.target.value})}
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
                  onChange={e => setFormData({...formData, height: e.target.value})}
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
                  onChange={e => setFormData({...formData, weight: e.target.value})}
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
                  onClick={() => setFormData({...formData, goal: g})}
                  className={`p-4 rounded-2xl border-2 font-bold text-xs transition-all ${
                    formData.goal === g ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
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
                  onClick={() => setFormData({...formData, level: l.id})}
                  className={`p-3 rounded-2xl border-2 font-bold text-[10px] uppercase tracking-tighter transition-all ${
                    formData.level === l.id ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </form>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100">
        <button 
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white font-black uppercase text-xs tracking-widest py-5 rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
        >
          {initialData ? 'Atualizar Aluno' : 'Salvar Aluno'}
          <CheckCircle2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default StudentRegistrationScreen;
