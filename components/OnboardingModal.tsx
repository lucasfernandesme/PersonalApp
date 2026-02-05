
import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Dumbbell,
  Sparkles,
  Search,
  User,
  Loader2,
  BrainCircuit,
  Zap,
  MessageSquareQuote,
  Target,
  Check,
  ArrowLeft
} from 'lucide-react';
import { OnboardingData, Student, TrainingProgram } from '../types';
import { generateWorkout } from '../services/geminiService';

interface OnboardingModalProps {
  students: Student[];
  onClose: () => void;
  onProceedToManual: (data: OnboardingData) => void;
  onAISuccess: (program: TrainingProgram, studentData: OnboardingData) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ students, onClose, onProceedToManual, onAISuccess }) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<OnboardingData>({
    name: '',
    goal: 'Hipertrofia',
    experience: 'beginner',
    injuries: '',
    frequency: 3,
    equipment: 'Academia Completa',
    observations: ''
  });

  const filteredStudents = students.filter(s =>
    searchTerm.length > 0 && s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectExistingStudent = (student: Student) => {
    setFormData({
      ...formData,
      name: student.name,
      goal: student.goal,
      experience: student.experience,
      injuries: student.injuries.join(', '),
      frequency: student.program?.frequency || 3,
      equipment: student.equipment.join(', ') || 'Academia Completa'
    });
    setSearchTerm(student.name);
    // Avança automaticamente para o passo 2 ao selecionar aluno existente para agilizar
    setStep(2);
  };

  const handleGenerateWithAI = async () => {
    if (!formData.name && !searchTerm) {
      setStep(1);
      alert("Por favor, identifique o aluno primeiro.");
      return;
    }

    // Garante que o nome no formData seja o que está no campo de busca caso não tenha selecionado da lista
    const finalName = formData.name || searchTerm;

    setIsGenerating(true);
    try {
      const generated = await generateWorkout({ ...formData, name: finalName });

      const program: TrainingProgram = {
        id: Math.random().toString(36).substring(2, 11),
        name: generated.programName || `Treino IA - ${formData.goal}`,
        goal: formData.goal,
        frequency: formData.frequency,
        startDate: new Date().toISOString().split('T')[0],
        split: generated.split.map((s: any) => ({
          day: s.day,
          label: s.label,
          exercises: s.exercises.map((ex: any) => ({
            id: Math.random().toString(36).substring(2, 7),
            name: ex.name,
            sets: ex.sets || 3,
            reps: ex.reps || '12',
            rest: ex.rest || '60s',
            notes: ex.notes || ''
          }))
        }))
      };

      onAISuccess(program, { ...formData, name: finalName });
    } catch (error) {
      console.error(error);
      alert("Houve um erro ao gerar o treino com IA. Verifique sua conexão ou tente o modo manual.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="fixed inset-0 z-[70] bg-slate-900 dark:bg-slate-950 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 transition-colors">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-indigo-600 dark:bg-indigo-500 rounded-[32px] flex items-center justify-center animate-bounce shadow-2xl shadow-indigo-600/50 transition-colors">
            <BrainCircuit size={48} className="text-white" />
          </div>
          <Sparkles className="absolute -top-4 -right-4 text-indigo-400 dark:text-indigo-300 animate-pulse" size={32} />
        </div>
        <h2 className="text-3xl font-black text-white mb-4">PersonalFlow está processando...</h2>
        <div className="space-y-4 max-w-xs">
          <p className="text-indigo-300 dark:text-indigo-400 font-bold text-xs uppercase tracking-[0.2em] animate-pulse">Personalizando Planilha</p>
          <div className="bg-white/5 dark:bg-slate-900/50 p-4 rounded-2xl border border-white/10 dark:border-slate-800 text-left transition-colors">
            <p className="text-[10px] text-slate-500 dark:text-slate-600 uppercase font-black mb-1">Foco Detectado:</p>
            <p className="text-white dark:text-slate-200 text-xs font-medium italic">"{formData.observations || 'Equilíbrio muscular completo'}"</p>
          </div>
        </div>
        <div className="mt-12 flex items-center gap-2 px-6 py-3 bg-white/5 dark:bg-slate-900/50 rounded-full border border-white/10 dark:border-slate-800 transition-colors">
          <Loader2 size={16} className="animate-spin text-indigo-400 dark:text-indigo-500" />
          <span className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest">IA Gemini 1.5 Pro Engine</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-zinc-50 dark:bg-zinc-950 flex flex-col md:inset-4 md:rounded-[40px] md:shadow-2xl md:max-w-md md:mx-auto md:overflow-hidden animate-in slide-in-from-bottom duration-300 transition-all overflow-hidden">
      {/* Dynamic Header Standardized */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 pt-4 pb-4 transition-all duration-300 relative flex-shrink-0 -mx-4 -mt-4 mb-6">
        <button onClick={step === 1 ? onClose : () => setStep(s => s - 1)} className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-white transition-colors z-10 w-10">
          <ArrowLeft size={24} />
        </button>

        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="PersonalFlow" className="w-8 h-8 rounded-full shadow-sm" />
          <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">PersonalFlow</span>
        </div>

        <button onClick={onClose} className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-red-500 transition-colors z-10 w-10 flex justify-end">
          <X size={24} />
        </button>
      </header>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Gerador IA</h2>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-1 rounded-full transition-all ${step === i ? 'w-4 bg-indigo-600 dark:bg-indigo-500' : 'w-1.5 bg-zinc-200 dark:bg-zinc-800'}`}></div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-8 no-scrollbar">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Identificação</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Digite o nome ou selecione um aluno da lista.</p>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Nome do Aluno..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-[24px] pl-12 pr-6 py-5 font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
                    value={searchTerm}
                    onChange={e => {
                      setSearchTerm(e.target.value);
                      setFormData({ ...formData, name: e.target.value });
                    }}
                  />
                </div>

                {/* Sugestões de Alunos Existentes */}
                {filteredStudents.length > 0 && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-2 tracking-wider">Alunos Encontrados</p>
                    <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {filteredStudents.map(s => (
                        <button
                          key={s.id}
                          onClick={() => selectExistingStudent(s)}
                          className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-indigo-600 dark:hover:border-indigo-500 hover:shadow-md transition-all text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <img src={s.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                            <div>
                              <p className="font-black text-slate-800 dark:text-white text-sm">{s.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{s.goal}</p>
                            </div>
                          </div>
                          <div className="w-8 h-8 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            <Check size={16} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Objetivo</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Hipertrofia', 'Emagrecimento', 'Força', 'Saúde'].map(g => (
                    <button
                      key={g}
                      onClick={() => setFormData({ ...formData, goal: g })}
                      className={`p-4 rounded-3xl border-2 font-bold text-xs transition-all ${formData.goal === g
                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500 shadow-lg shadow-indigo-600/20'
                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-indigo-200 dark:hover:border-indigo-900/30'
                        }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight transition-colors">Perfil de Treino</h3>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 transition-colors">Experiência</label>
                <div className="grid grid-cols-3 gap-2">
                  {['beginner', 'intermediate', 'advanced'].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setFormData({ ...formData, experience: lvl as any })}
                      className={`py-4 rounded-xl border-2 font-bold text-[10px] uppercase transition-all ${formData.experience === lvl
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg shadow-slate-900/20 dark:shadow-white/10'
                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-indigo-200 dark:hover:border-indigo-900/30'
                        }`}
                    >
                      {lvl === 'beginner' ? 'Iniciante' : lvl === 'intermediate' ? 'Interm.' : 'Avançado'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 transition-colors">Restrições ou Lesões</label>
                <textarea
                  placeholder="Ex: Condromalácia, Hérnia de disco, Dor no ombro..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-[24px] px-6 py-4 font-bold min-h-[120px] text-sm text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
                  value={formData.injuries}
                  onChange={e => setFormData({ ...formData, injuries: e.target.value })}
                ></textarea>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-2xl font-black text-slate-900 leading-tight">Estrutura</h3>

              <div className="space-y-5">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 transition-colors">Treinos por Semana</label>
                  <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums transition-colors">{formData.frequency}</span>
                </div>
                <input
                  type="range" min="1" max="7"
                  className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none accent-indigo-600 dark:accent-indigo-500 cursor-pointer transition-colors"
                  value={formData.frequency}
                  onChange={e => setFormData({ ...formData, frequency: parseInt(e.target.value) })}
                />
                <div className="flex justify-between text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase px-1 transition-colors">
                  <span>1 dia</span>
                  <span>7 dias</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 transition-colors">Equipamento</label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-[24px] px-6 py-4 font-bold text-slate-700 dark:text-slate-200 focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
                  value={formData.equipment}
                  onChange={e => setFormData({ ...formData, equipment: e.target.value })}
                >
                  <option value="Academia Completa">Academia Completa</option>
                  <option value="Somente Halteres">Somente Halteres</option>
                  <option value="Calistenia / Peso do Corpo">Peso do Corpo</option>
                  <option value="Home Gym Básica">Home Gym Básica</option>
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight transition-colors">Observações IA</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">O que a inteligência deve focar neste treino?</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <MessageSquareQuote className="absolute left-4 top-4 text-indigo-200 dark:text-indigo-900/50 transition-colors" size={24} />
                  <textarea
                    placeholder="Ex: Focar em quadríceps e glúteo. Adicionar exercícios de mobilidade no início. Treinos curtos de 45 min..."
                    className="w-full bg-indigo-50/50 dark:bg-indigo-950/30 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-[32px] pl-14 pr-6 py-6 font-bold text-slate-800 dark:text-slate-200 min-h-[180px] text-sm focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    value={formData.observations}
                    onChange={e => setFormData({ ...formData, observations: e.target.value })}
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: <Target size={14} />, text: 'Foco em Glúteo' },
                    { icon: <Dumbbell size={14} />, text: 'Foco em Superiores' },
                    { icon: <Zap size={14} />, text: 'Treino Rápido' },
                    { icon: <BrainCircuit size={14} />, text: 'Reabilitação' }
                  ].map((tag, i) => (
                    <button
                      key={i}
                      onClick={() => setFormData({
                        ...formData,
                        observations: formData.observations ? `${formData.observations}. ${tag.text}` : tag.text
                      })}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                    >
                      {tag.icon}
                      {tag.text}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-indigo-600 dark:bg-indigo-500 rounded-[32px] text-white flex gap-4 shadow-xl shadow-indigo-600/20 transition-colors">
                <div className="p-2 bg-white/20 rounded-xl h-fit">
                  <Sparkles size={20} />
                </div>
                <p className="text-[11px] font-medium leading-relaxed">
                  Nossa IA usará essas notas para selecionar os melhores exercícios e a ordem ideal para o aluno {formData.name || searchTerm}.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-slate-50 dark:border-slate-800 flex flex-col gap-3 transition-colors">
          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && !searchTerm}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-xs tracking-widest py-5 rounded-[24px] flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 dark:shadow-white/10 disabled:opacity-50 transition-all active:scale-95"
            >
              Próximo
              <ChevronRight size={18} />
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleGenerateWithAI}
                className="w-full bg-indigo-600 dark:bg-indigo-500 text-white font-black uppercase text-xs tracking-[0.15em] py-5 rounded-[24px] flex items-center justify-center gap-2 shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all group"
              >
                <Sparkles size={18} className="group-hover:animate-pulse" />
                Gerar Treino Agora ✨
              </button>
              <button
                onClick={() => onProceedToManual({ ...formData, name: formData.name || searchTerm })}
                className="w-full text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest py-2 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                Ou montar manualmente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
