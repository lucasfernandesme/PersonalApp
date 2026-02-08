import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  BookOpen,
  ChevronRight,
  PlusCircle,
  MessageCircle
} from 'lucide-react';
import { Student } from '../types';

interface TrainerDashboardProps {
  students: Student[]; // Lista agora vem de fora
  trainerName?: string;
  onSelectStudent: (student: Student) => void;
  onOpenOnboarding: () => void;
  onOpenExerciseManager: () => void;
  onOpenStudentRegistration: () => void;
  onOpenWorkoutLibrary: () => void;
  onlyList?: boolean;
}

const TrainerDashboard: React.FC<TrainerDashboardProps> = ({
  students,
  trainerName,
  onSelectStudent,
  onOpenOnboarding,
  onOpenExerciseManager,
  onOpenStudentRegistration,
  onOpenWorkoutLibrary,
  onlyList = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isStudentActive = s.isActive !== false;

    // Se estivermos apenas no Dashboard (não na lista completa), mostrar apenas ativos
    if (!onlyList) return matchesSearch && isStudentActive;

    // Na lista completa, filtrar pela aba selecionada
    const matchesTab = activeTab === 'active' ? isStudentActive : !isStudentActive;
    return matchesSearch && matchesTab;
  });

  const activeCount = students.filter(s => s.isActive !== false).length;
  const inactiveCount = students.filter(s => s.isActive === false).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500 pb-20">
      {/* Header */}
      {!onlyList && (
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            {(() => {
              const hour = new Date().getHours();
              if (hour < 12) return 'Bom dia';
              if (hour < 18) return 'Boa tarde';
              return 'Boa noite';
            })()}, {trainerName || 'Professor'}
          </h2>
        </div>
      )}

      {/* Título da Seção quando em modo Lista */}
      {onlyList && (
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Meus Alunos</h2>
          <p className="text-zinc-400 dark:text-zinc-500 font-medium">Gerencie sua base de clientes ({students.length}).</p>
        </div>
      )}

      {/* Quick Actions Grid */}
      {!onlyList && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onOpenStudentRegistration}
            className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-start gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all active:scale-95 group"
          >
            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-all">
              <UserPlus size={24} />
            </div>
            <div className="text-left">
              <p className="font-black text-zinc-800 dark:text-white text-sm">Novo Aluno</p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase mt-1">Cadastro Completo</p>
            </div>
          </button>

          <button
            onClick={onOpenExerciseManager}
            className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-start gap-4 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all active:scale-95 group"
          >
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <PlusCircle size={24} />
            </div>
            <div className="text-left">
              <p className="font-black text-zinc-800 dark:text-white text-sm">Exercícios</p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase mt-1">Biblioteca</p>
            </div>
          </button>

          <button
            onClick={onOpenWorkoutLibrary}
            className="col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-row items-center gap-6 hover:border-amber-200 dark:hover:border-amber-800 transition-all active:scale-95 group"
          >
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all transition-colors">
              <BookOpen size={28} />
            </div>
            <div className="text-left flex-1">
              <p className="font-black text-zinc-800 dark:text-white text-lg">Treinos Prontos</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-bold uppercase mt-1">Biblioteca de Treinos</p>
            </div>
            <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-300 dark:text-zinc-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
              <ChevronRight size={20} />
            </div>
          </button>
        </div>
      )}

      {/* Tabs - Só aparece na tela de Meus Alunos */}
      {onlyList && (
        <div className="flex bg-zinc-100/50 dark:bg-zinc-800/50 p-1.5 rounded-[24px] gap-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 px-4 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'active'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
          >
            Ativos
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'active' ? 'bg-zinc-100 dark:bg-zinc-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
              {activeCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`flex-1 py-3 px-4 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'inactive'
              ? 'bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-200 shadow-sm'
              : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
          >
            Inativos
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'inactive' ? 'bg-zinc-200 dark:bg-zinc-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
              {inactiveCount}
            </span>
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome do aluno..."
          className="w-full pl-12 pr-6 py-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[24px] text-sm font-bold shadow-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Student List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black text-zinc-400 dark:text-zinc-500 uppercase text-[10px] tracking-[0.2em]">
            {searchTerm ? `Resultados (${filteredStudents.length})` : 'Toque para gerenciar'}
          </h3>
        </div>

        {filteredStudents.length > 0 ? (
          filteredStudents.map(student => (
            <div
              key={student.id}
              onClick={() => onSelectStudent(student)}
              className="group bg-white dark:bg-zinc-900 p-5 rounded-[32px] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between active:scale-[0.98] transition-all shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={student.avatar} className={`w-16 h-16 rounded-[22px] object-cover shadow-sm group-hover:ring-4 group-hover:ring-zinc-100 dark:group-hover:ring-zinc-800 transition-all ${student.isActive === false ? 'grayscale opacity-60' : ''}`} alt="" />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-4 border-white dark:border-zinc-900 rounded-full ${student.isActive === false ? 'bg-zinc-300 dark:bg-zinc-600' : 'bg-emerald-500'}`}></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-zinc-800 dark:text-white text-lg group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors line-clamp-1">{student.name}</h4>
                    {student.phone && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const phoneNumber = student.phone?.replace(/\D/g, '');
                          window.open(`https://wa.me/55${phoneNumber}`, '_blank');
                        }}
                        className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-500 dark:hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
                        title="Enviar mensagem no WhatsApp"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="currentColor"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black uppercase text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded-md">{student.goal}</span>
                    <span className="w-1 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full"></span>
                    <span className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500">{student.experience}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden md:block text-[10px] font-black uppercase text-zinc-900 dark:text-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity">Ver Perfil</span>
                <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-300 dark:text-zinc-600 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-all shadow-sm">
                  <ChevronRight size={24} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center bg-white dark:bg-zinc-900 rounded-[32px] border border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-400 dark:text-zinc-500 font-bold">
              {activeTab === 'inactive' ? 'Nenhum aluno inativo.' : 'Nenhum aluno encontrado.'}
            </p>
            {activeTab === 'active' && (
              <button
                onClick={onOpenStudentRegistration}
                className="mt-4 text-zinc-900 dark:text-zinc-100 font-black text-xs uppercase tracking-widest hover:underline"
              >
                Cadastrar agora
              </button>
            )}
          </div>
        )}
      </div>


    </div>
  );
};

export default TrainerDashboard;
