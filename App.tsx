
import React, { useState, useCallback, useEffect } from 'react';
import { UserRole, Student, TrainingProgram, OnboardingData, AuthUser } from './types';
import Layout from './components/Layout';
import TrainerDashboard from './components/TrainerDashboard';
import StudentApp from './components/StudentApp';
import LoginScreen from './components/LoginScreen';
import OnboardingModal from './components/OnboardingModal';
import ManualWorkoutBuilder from './components/ManualWorkoutBuilder';
import StudentRegistrationScreen from './components/StudentRegistrationScreen';
import ExerciseManagerScreen from './components/ExerciseManagerScreen';
import EvolutionScreen from './components/EvolutionScreen';
import StudentProgressScreen from './components/StudentProgressScreen';
import ChatScreen from './components/ChatScreen';
import InstallPrompt from './components/InstallPrompt';
import { DataService } from './services/dataService';
import { LibraryExercise } from './constants/exercises';
import { ArrowLeft, Settings, Loader2, RefreshCw, CheckCircle2, X } from 'lucide-react';

const STORAGE_KEY_AUTH = 'fitai_pro_auth_session';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AUTH);
    return saved ? JSON.parse(saved) : null;
  });

  const [activeView, setActiveView] = useState<'dashboard' | 'register' | 'exercises' | 'edit-student' | 'student-stats'>('dashboard');
  const [activeTab, setActiveTab] = useState<'home' | 'students' | 'evolution' | 'chat'>('home');
  const [students, setStudents] = useState<Student[]>([]);
  const [customExercises, setCustomExercises] = useState<LibraryExercise[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isManualBuilderOpen, setIsManualBuilderOpen] = useState(false);
  const [pendingStudentData, setPendingStudentData] = useState<OnboardingData | null>(null);

  const reloadStudents = useCallback(async () => {
    try {
      const loadedStudents = await DataService.getStudents();
      setStudents(loadedStudents);

      // Atualiza o aluno selecionado com os dados novos se ele existir
      setSelectedStudent(prev => {
        if (!prev) return null;
        return loadedStudents.find(s => s.id === prev.id) || null;
      });
    } catch (err) {
      console.error("Erro ao recarregar alunos:", err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);


      try {
        await reloadStudents();
        const loadedExercises = await DataService.getLibraryExercises();
        setCustomExercises(loadedExercises);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (authUser) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(authUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }
  }, [authUser]);

  const handleLogin = (user: AuthUser) => {
    setAuthUser(user);
    setActiveTab('home');
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setAuthUser(null);
    setSelectedStudent(null);
    setActiveTab('home');
    setActiveView('dashboard');
  };

  const normalize = (str: string) => {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  };

  const enrichWithLibraryData = useCallback((program: TrainingProgram): TrainingProgram => {
    return {
      ...program,
      split: program.split.map(day => ({
        ...day,
        exercises: day.exercises.map(ex => {
          const normalizedInput = normalize(ex.name);
          let libEx = customExercises.find(l => normalize(l.name) === normalizedInput);
          if (!libEx) {
            libEx = customExercises.find(l => {
              const normLib = normalize(l.name);
              return normalizedInput.includes(normLib) || normLib.includes(normalizedInput);
            });
          }
          return libEx ? { ...ex, videoUrl: libEx.videoUrl || ex.videoUrl } : ex;
        })
      }))
    };
  }, [customExercises]);

  const handleNavigate = (tab: 'home' | 'students' | 'evolution' | 'chat') => {
    setActiveTab(tab);
    setActiveView('dashboard');
    setIsManualBuilderOpen(false);
    setIsOnboardingOpen(false);
    if (tab !== 'students' || !selectedStudent) {
      setSelectedStudent(null);
    }
  };

  const handleSaveWorkout = useCallback(async (program: TrainingProgram) => {
    setIsSaving(true);
    const enrichedProgram = enrichWithLibraryData(program);
    let updatedStudent: Student | null = null;

    try {
      if (pendingStudentData) {
        const newStudent: Student = {
          id: Math.random().toString(36).substring(2, 11),
          name: pendingStudentData.name,
          email: `${pendingStudentData.name.toLowerCase().replace(/\s/g, '.')}@email.com`,
          avatar: `https://picsum.photos/seed/${pendingStudentData.name}/100`,
          goal: pendingStudentData.goal,
          experience: pendingStudentData.experience as any || 'beginner',
          injuries: pendingStudentData.injuries ? [pendingStudentData.injuries] : [],
          equipment: [pendingStudentData.equipment],
          program: enrichedProgram,
          history: []
        };
        await DataService.saveStudent(newStudent, authUser?.id);
        setPendingStudentData(null);
      } else if (selectedStudent) {
        const updated = { ...selectedStudent, program: enrichedProgram };
        await DataService.saveStudent(updated, authUser?.id);
      }
      await reloadStudents();
    } catch (e) {
      alert("Erro ao salvar no banco. Verifique as chaves.");
    } finally {
      setIsSaving(false);
      setIsManualBuilderOpen(false);
      setActiveView('dashboard');
      showToast("Treino salvo com sucesso!");
    }
  }, [pendingStudentData, selectedStudent, enrichWithLibraryData, authUser]);

  const handleFinishWorkout = async (stats: { rpe_avg: number; completion: number; weights: Record<string, string>; duration: number }) => {
    if (!authUser || authUser.role !== UserRole.STUDENT) return;

    setIsSaving(true);
    const date = new Date().toISOString().split('T')[0];
    const currentStudent = students.find(s => s.id === authUser.id);
    if (!currentStudent) return;

    let updatedProgram = currentStudent.program;
    if (updatedProgram) {
      updatedProgram = {
        ...updatedProgram,
        split: updatedProgram.split.map(day => ({
          ...day,
          exercises: day.exercises.map(ex => {
            const newWeight = stats.weights[ex.name];
            return newWeight ? { ...ex, weight: newWeight } : ex;
          })
        }))
      };
    }

    const updatedStudent = {
      ...currentStudent,
      program: updatedProgram,
      history: [...currentStudent.history, { date, ...stats }]
    };

    try {
      await DataService.saveStudent(updatedStudent);
      await reloadStudents();
    } finally {
      setIsSaving(false);
      setTimeout(() => setActiveTab('evolution'), 2500);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Carregando FitAI...</p>
      </div>
    );
  }

  if (!authUser) {
    return <LoginScreen students={students} onLogin={handleLogin} />;
  }

  const renderTrainerContent = () => {
    if (activeView === 'register' || activeView === 'edit-student') {
      return (
        <StudentRegistrationScreen
          onSave={async (formData) => {
            setIsSaving(true);
            try {
              if (formData.id) {
                const studentToUpdate = students.find(s => s.id === formData.id);
                const updated = { ...studentToUpdate, ...formData };
                await DataService.saveStudent(updated, authUser?.id);
              } else {
                const newStudent: Student = {
                  ...formData,
                  id: Math.random().toString(36).substring(2, 11),
                  avatar: `https://picsum.photos/seed/${formData.name}/100`,
                  history: []
                };
                await DataService.saveStudent(newStudent, authUser?.id);
              }
              await reloadStudents();
            } finally {
              setIsSaving(false);
              setActiveView('dashboard');
              showToast(formData.id ? "Alterações salvas com sucesso!" : "Aluno cadastrado com sucesso!");
            }
          }}
          onDelete={async (id) => {
            if (!id) return;
            setIsSaving(true);
            try {
              await DataService.deleteStudent(id);
              await reloadStudents();
            } finally {
              setIsSaving(false);
              setActiveView('dashboard');
              showToast("Aluno excluído com sucesso!", "error");
            }
          }}
          onBack={() => setActiveView('dashboard')}
          initialData={activeView === 'edit-student' ? selectedStudent : undefined}
        />
      );
    }

    if (activeView === 'exercises') {
      return <ExerciseManagerScreen exercises={customExercises} onAdd={async (ex) => {
        setIsSaving(true);
        try {
          await DataService.saveExercise(ex, authUser?.id);
          setCustomExercises(prev => [ex, ...prev]);
        } finally {
          setIsSaving(false);
          showToast("Exercício adicionado à biblioteca!");
        }
      }} onBack={() => setActiveView('dashboard')} />;
    }

    switch (activeTab) {
      case 'chat': return <ChatScreen role={UserRole.TRAINER} />;
      case 'evolution': return <EvolutionScreen students={students} onSelectStudent={(s) => { setSelectedStudent(s); setActiveTab('students'); }} />;
      case 'home':
      case 'students':
        if (selectedStudent) {
          return (
            <div className="space-y-6 animate-in fade-in duration-300 pb-20">
              <div className="flex items-center justify-between">
                <button onClick={() => setSelectedStudent(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm">
                  <ArrowLeft size={18} /> Voltar
                </button>
                <button onClick={() => setActiveView('edit-student')} className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-colors">
                  <Settings size={20} />
                </button>
              </div>

              <div className="flex flex-col md:flex-row items-start justify-between gap-6 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-6">
                  <img src={selectedStudent.avatar} className="w-20 h-20 md:w-24 md:h-24 rounded-3xl object-cover shadow-xl border-4 border-white" />
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{selectedStudent.name}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded-full border border-indigo-100">{selectedStudent.goal}</span>
                      <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase rounded-full border border-slate-100">{selectedStudent.experience}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <button onClick={() => setIsManualBuilderOpen(true)} className="flex-1 md:flex-none px-5 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 text-sm active:scale-95 transition-all">
                    {selectedStudent.program ? 'Editar Treino' : 'Montar Treino'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest px-2">Ficha de Treino</h3>
                {selectedStudent.program ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedStudent.program.split.map((day, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm">
                        <h5 className="font-black text-slate-800 text-sm mb-4 uppercase">{day.day}: {day.label}</h5>
                        <div className="space-y-2">
                          {day.exercises.map((ex, exIdx) => (
                            <div key={exIdx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                              <span className="font-bold text-slate-600 truncate max-w-[150px]">{ex.name}</span>
                              <span className="text-slate-400 font-medium">{ex.sets}x{ex.reps}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold">Sem treino ativo.</p>
                  </div>
                )}
              </div>
            </div>
          );
        }
        return (
          <TrainerDashboard
            students={students}
            onSelectStudent={(s) => { setSelectedStudent(s); setActiveTab('students'); }}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onOpenExerciseManager={() => setActiveView('exercises')}
            onOpenStudentRegistration={() => setActiveView('register')}
            onlyList={activeTab === 'students'}
          />
        );
      default: return null;
    }
  };

  const renderStudentContent = () => {
    const loggedInStudent = students.find(s => s.id === authUser?.id);
    switch (activeTab) {
      case 'home':
        return (
          <StudentApp
            program={loggedInStudent?.program}
            students={students}
            currentStudentId={authUser!.id}
            onSelectStudent={() => { }}
            onFinishWorkout={handleFinishWorkout}
          />
        );
      case 'evolution': return loggedInStudent ? <StudentProgressScreen student={loggedInStudent} /> : null;
      case 'chat': return <ChatScreen role={UserRole.STUDENT} student={loggedInStudent || undefined} />;
      default: return null;
    }
  };

  return (
    <Layout
      role={authUser.role}
      onSwitchRole={handleLogout}
      onNavigate={handleNavigate}
      activeTab={activeTab}
      userName={authUser.name}
      userAvatar={authUser.avatar}
    >
      {/* Botão Flutuante de Status do Supabase */}


      {authUser.role === UserRole.TRAINER ? renderTrainerContent() : renderStudentContent()}

      <InstallPrompt />

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] animate-in slide-in-from-top duration-300">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-red-500 border-red-400 text-white'
            }`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <X size={20} />}
            <p className="font-bold text-sm">{toast.message}</p>
          </div>
        </div>
      )}

      {isOnboardingOpen && (
        <OnboardingModal
          students={students}
          onClose={() => setIsOnboardingOpen(false)}
          onProceedToManual={(data) => { setPendingStudentData(data); setIsOnboardingOpen(false); setIsManualBuilderOpen(true); }}
          onAISuccess={(prog, data) => {
            setPendingStudentData(data);
            handleSaveWorkout(prog);
          }}
        />
      )}

      {isManualBuilderOpen && (
        <ManualWorkoutBuilder
          studentName={pendingStudentData?.name || selectedStudent?.name || "Aluno"}
          studentGoal={pendingStudentData?.goal || selectedStudent?.goal || 'Hipertrofia'}
          studentInjuries={pendingStudentData?.injuries || selectedStudent?.injuries?.join(', ') || ''}
          initialProgram={selectedStudent?.program}
          onSave={handleSaveWorkout}
          onCancel={() => setIsManualBuilderOpen(false)}
        />
      )}
    </Layout>
  );
};

export default App;
