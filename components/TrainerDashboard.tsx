
import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Activity, 
  BookOpen,
  ChevronRight,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { Student } from '../types';

interface TrainerDashboardProps {
  students: Student[]; // Lista agora vem de fora
  onSelectStudent: (student: Student) => void;
  onOpenOnboarding: () => void;
  onOpenExerciseManager: () => void;
  onOpenStudentRegistration: () => void;
  onlyList?: boolean;
}

const TrainerDashboard: React.FC<TrainerDashboardProps> = ({ 
  students,
  onSelectStudent, 
  onOpenOnboarding, 
  onOpenExerciseManager,
  onOpenStudentRegistration,
  onlyList = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500 pb-20">
      {/* Header */}
      {!onlyList && (
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Olá, Lucas 👋</h2>
          <p className="text-slate-400 font-medium">Você tem {students.length} alunos cadastrados.</p>
        </div>
      )}

      {/* Título da Seção quando em modo Lista */}
      {onlyList && (
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Meus Alunos</h2>
          <p className="text-slate-400 font-medium">Gerencie sua base de clientes ({students.length}).</p>
        </div>
      )}

      {/* Quick Actions Grid */}
      {!onlyList && (
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onOpenStudentRegistration}
            className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col items-start gap-4 hover:border-indigo-200 transition-all active:scale-95 group"
          >
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <UserPlus size={24} />
            </div>
            <div className="text-left">
              <p className="font-black text-slate-800 text-sm">Novo Aluno</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Cadastro Completo</p>
            </div>
          </button>

          <button 
            onClick={onOpenExerciseManager}
            className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col items-start gap-4 hover:border-emerald-200 transition-all active:scale-95 group"
          >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <PlusCircle size={24} />
            </div>
            <div className="text-left">
              <p className="font-black text-slate-800 text-sm">Exercícios</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Gerenciar Biblioteca</p>
            </div>
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome do aluno..." 
          className="w-full pl-12 pr-6 py-5 bg-white border border-slate-200 rounded-[24px] text-sm font-bold shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Student List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">
            {searchTerm ? `Resultados (${filteredStudents.length})` : 'Toque para gerenciar'}
          </h3>
        </div>
        
        {filteredStudents.length > 0 ? (
          filteredStudents.map(student => (
            <div 
              key={student.id} 
              onClick={() => onSelectStudent(student)}
              className="group bg-white p-5 rounded-[32px] border border-slate-200 flex items-center justify-between active:scale-[0.98] transition-all shadow-sm hover:shadow-md hover:border-indigo-100 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={student.avatar} className="w-16 h-16 rounded-[22px] object-cover shadow-sm group-hover:ring-4 group-hover:ring-indigo-50 transition-all" alt="" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{student.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">{student.goal}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-[10px] font-black uppercase text-slate-400">{student.experience}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden md:block text-[10px] font-black uppercase text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">Ver Perfil</span>
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                  <ChevronRight size={24} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">Nenhum aluno encontrado.</p>
            <button 
              onClick={onOpenStudentRegistration}
              className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline"
            >
              Cadastrar agora
            </button>
          </div>
        )}
      </div>

      {!onlyList && (
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-[200px]">
            <h4 className="font-black text-xl mb-2 leading-tight">Gere treinos em segundos</h4>
            <p className="text-sm text-slate-400 font-medium mb-6">Use nossa inteligência para otimizar suas fichas.</p>
            <button 
              onClick={onOpenOnboarding}
              className="bg-white text-slate-900 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2"
            >
              Começar IA
              <ExternalLink size={14} />
            </button>
          </div>
          <Activity className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 rotate-12" />
          <div className="absolute top-0 right-0 p-8">
             <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
               <BookOpen className="text-indigo-400" size={24} />
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerDashboard;
