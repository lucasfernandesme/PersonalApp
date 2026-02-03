
import React, { useState, useCallback, useEffect } from 'react';
import { UserRole, TrainingProgram, OnboardingData, AuthUser } from './types';
import Layout from './components/Layout';
import TrainerDashboard from './components/TrainerDashboard';
import StudentApp from './components/StudentApp';
import LoginScreen from './components/LoginScreen';
import OnboardingModal from './components/OnboardingModal';
import ManualWorkoutBuilder from './components/ManualWorkoutBuilder';
import WorkoutLibraryScreen from './components/WorkoutLibraryScreen';
import InstallPrompt from './components/InstallPrompt';
import { DataService } from './services/dataService';
import { LibraryExercise } from './constants/exercises';
import StudentRegistrationScreen from './components/StudentRegistrationScreen';
import ExerciseManagerScreen from './components/ExerciseManagerScreen';
import EvolutionScreen from './components/EvolutionScreen';
import StudentProgressScreen from './components/StudentProgressScreen';
import ChatScreen from './components/ChatScreen';
import TrainerProfile from './components/TrainerProfile';
import StudentProfile from './components/StudentProfile';
import StudentSelectorModal from './components/StudentSelectorModal';
import StudentDashboard from './components/StudentDashboard';
import { WorkoutFolder, WorkoutTemplate, Student } from './types';
import { ArrowLeft, Settings, Loader2, RefreshCw, CheckCircle2, X, Dumbbell, ArrowRight, Zap, Award, ChevronRight, Plus, Edit2, Trash2, User, Calendar } from 'lucide-react';
import { TrainingFrequencyCard } from './components/TrainingFrequencyCard';
import { ThemeProvider } from './contexts/ThemeContext';

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

  const [activeView, setActiveView] = useState<'dashboard' | 'register' | 'exercises' | 'edit-student' | 'student-stats' | 'library'>('dashboard');
  const [activeTab, setActiveTab] = useState<'home' | 'students' | 'evolution' | 'chat' | 'workout' | 'profile'>('home');
  const [students, setStudents] = useState<Student[]>([]);
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>([]);
  const [workoutFolders, setWorkoutFolders] = useState<WorkoutFolder[]>([]);
  const [customExercises, setCustomExercises] = useState<LibraryExercise[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudentView, setSelectedStudentView] = useState<'dashboard' | 'workouts' | 'workout-detail'>('dashboard');
  const [workoutToEdit, setWorkoutToEdit] = useState<TrainingProgram | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isManualBuilderOpen, setIsManualBuilderOpen] = useState(false);
  const [pendingStudentData, setPendingStudentData] = useState<OnboardingData | null>(null);
  const [isStudentSelectorOpen, setIsStudentSelectorOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<WorkoutTemplate | null>(null);
  const [studentView, setStudentView] = useState<'dashboard' | 'workout'>('dashboard');

  const reloadStudents = useCallback(async () => {
    try {
      const loadedStudents = await DataService.getStudents();
      setStudents(loadedStudents);

      setSelectedStudent(prev => {
        if (!prev) return null;
        return loadedStudents.find(s => s.id === prev.id) || null;
      });
    } catch (err) {
      console.error("Erro ao recarregar alunos:", err);
    }
  }, []);

  const reloadExercises = useCallback(async () => {
    try {
      const loadedExercises = await DataService.getLibraryExercises();
      setCustomExercises(loadedExercises);
    } catch (err) {
      console.error("Erro ao recarregar exercícios:", err);
    }
  }, []);

  const reloadTemplates = useCallback(async () => {
    try {
      const loaded = await DataService.getWorkoutTemplates();
      setWorkoutTemplates(loaded);
    } catch (err) {
      console.error("Erro ao recarregar templates:", err);
    }
  }, []);

  const reloadFolders = useCallback(async () => {
    try {
      const loaded = await DataService.getWorkoutFolders();
      setWorkoutFolders(loaded);
    } catch (err) {
      console.error("Erro ao recarregar pastas:", err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await reloadStudents();
        await reloadExercises();
        await reloadTemplates();
        await reloadFolders();
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

  const handleNavigate = (tab: 'home' | 'students' | 'evolution' | 'chat' | 'workout' | 'profile') => {
    setActiveTab(tab);
    setActiveView('dashboard');
    setIsManualBuilderOpen(false);
    setIsOnboardingOpen(false);
    setStudentView('dashboard');
    if (tab !== 'students' || !selectedStudent) {
      setSelectedStudent(null);
    }
  };

  const handleSaveWorkout = useCallback(async (program: TrainingProgram, targetStudent?: Student) => {
    setIsSaving(true);
    const enrichedProgram = enrichWithLibraryData(program);

    try {
      if (pendingStudentData) {
        const newStudent: Student = {
          id: Math.random().toString(36).substring(2, 11),
          name: pendingStudentData.name,
          email: `${pendingStudentData.name.toLowerCase().replace(/\s/g, '.')}@email.com`,
          avatar: `https://picsum.photos/seed/${pendingStudentData.name}/100`,
          goal: pendingStudentData.goal,
          gender: 'other',
          experience: pendingStudentData.experience as any || 'beginner',
          injuries: pendingStudentData.injuries ? [pendingStudentData.injuries] : [],
          equipment: [pendingStudentData.equipment],
          program: enrichedProgram,
          history: []
        };
        await DataService.saveStudent(newStudent, authUser?.id);
        setPendingStudentData(null);
      } else if (targetStudent || selectedStudent) {
        const studentToUpdate = targetStudent || selectedStudent;
        if (!studentToUpdate) return; // Should not happen given check

        const existingPrograms = studentToUpdate.programs || [];
        const isExisting = existingPrograms.some(p => p.id === enrichedProgram.id);

        const updatedPrograms = isExisting
          ? existingPrograms.map(p => p.id === enrichedProgram.id ? enrichedProgram : p)
          : [enrichedProgram, ...existingPrograms];

        const updated = {
          ...studentToUpdate,
          program: enrichedProgram,
          programs: updatedPrograms
        };
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

  const handleSaveTemplate = async (template: WorkoutTemplate) => {
    setIsSaving(true);
    try {
      const enriched = enrichWithLibraryData(template as any) as WorkoutTemplate;
      await DataService.saveWorkoutTemplate(enriched, authUser?.id);
      await reloadTemplates();
      showToast("Template salvo na biblioteca!");
    } catch (e) {
      showToast("Erro ao salvar template", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Excluir este template para sempre?")) return;
    setIsSaving(true);
    try {
      await DataService.deleteWorkoutTemplate(id);
      await reloadTemplates();
      showToast("Template removido", "error");
    } catch (e) {
      showToast("Erro ao remover template", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFolder = async (folder: WorkoutFolder) => {
    setIsSaving(true);
    try {
      await DataService.saveWorkoutFolder(folder, authUser?.id);
      await reloadFolders();
      showToast("Pasta criada com sucesso!");
    } catch (e) {
      showToast("Erro ao criar pasta", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFolder = async (id: string) => {
    setIsSaving(true);
    try {
      await DataService.deleteWorkoutFolder(id);
      await reloadFolders();
      await reloadTemplates();
      showToast("Pasta removida", "error");
    } catch (e) {
      showToast("Erro ao remover pasta", "error");
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleUpdateTrainerProfile = async (updates: Partial<AuthUser>) => {
    if (!authUser) return;
    try {
      await DataService.updateTrainer({ ...updates, id: authUser.id });
      setAuthUser({ ...authUser, ...updates });
      await reloadStudents(); // To ensure linked data is refreshed if applicable
      showToast("Perfil atualizado e salvo!");
    } catch (error) {
      console.error("Failed to update profile", error);
      showToast("Erro ao salvar perfil. Tente novamente.", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest">Carregando FitAI...</p>
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
                  id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11), // Try to use UUID
                  avatar: `https://picsum.photos/seed/${formData.name}/100`,
                  history: []
                };
                await DataService.saveStudent(newStudent, authUser?.id);
              }
              await reloadStudents();
              setActiveView('dashboard');
              showToast(formData.id ? "Alterações salvas com sucesso!" : "Aluno cadastrado com sucesso!");
            } catch (error) {
              console.error("Erro ao salvar aluno:", error);
              showToast("Erro ao salvar aluno. Verifique os dados.", "error");
            } finally {
              setIsSaving(false);
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
          await reloadExercises();
        } finally {
          setIsSaving(false);
          showToast("Exercício adicionado à biblioteca!");
        }
      }} onBack={() => setActiveView('dashboard')} />;
    }

    if (activeView === 'library') {
      return (
        <WorkoutLibraryScreen
          templates={workoutTemplates}
          folders={workoutFolders}
          onSaveTemplate={handleSaveTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          onSaveFolder={handleSaveFolder}
          onDeleteFolder={handleDeleteFolder}
          onBack={() => setActiveView('dashboard')}
          onUseInStudent={(template) => {
            setPendingTemplate(template);
            setIsStudentSelectorOpen(true);
          }}
        />
      );
    }

    switch (activeTab) {
      case 'chat': return <ChatScreen role={UserRole.TRAINER} />;
      case 'evolution': return <EvolutionScreen students={students} onSelectStudent={(s) => { setSelectedStudent(s); setSelectedStudentView('dashboard'); setActiveTab('students'); }} />;
      case 'home':
      case 'students':
        if (selectedStudent) {
          return (
            <div className="space-y-6 animate-in fade-in duration-300 pb-20">
              <div className="flex items-center justify-end">
                <button onClick={() => setActiveView('edit-student')} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <Settings size={20} />
                </button>
              </div>

              <div className="flex flex-col md:flex-row items-start justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                <div className="flex items-center gap-6">
                  <img src={selectedStudent.avatar} className="w-20 h-20 md:w-24 md:h-24 rounded-3xl object-cover shadow-xl border-4 border-white dark:border-slate-800" />
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{selectedStudent.name}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase rounded-full border border-indigo-100 dark:border-indigo-800">{selectedStudent.goal}</span>
                      <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase rounded-full border border-slate-100 dark:border-slate-700">{selectedStudent.experience}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedStudentView === 'dashboard' ? (
                <div className="space-y-4">
                  {/* Frequency Card for Trainer */}
                  <TrainingFrequencyCard student={selectedStudent} />

                  <button
                    onClick={() => setSelectedStudentView('workouts')}
                    className="group relative bg-gradient-to-r from-indigo-600 to-indigo-700 p-5 rounded-[24px] overflow-hidden transition-all active:scale-[0.98] shadow-xl shadow-indigo-600/20 text-left border border-white/10 flex items-center justify-between w-full"
                  >
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                        <Dumbbell size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white leading-tight">Treinos</h3>
                        <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-wider opacity-80">Gerenciar todas as rotinas</p>
                      </div>
                    </div>
                    <ArrowRight className="text-white/40 group-hover:text-white transition-colors" size={24} />
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 blur-2xl rounded-full -mr-16 -mt-16"></div>
                  </button>

                  {selectedStudent.program && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">Treino em Uso: {selectedStudent.program.name}</h3>
                        <button
                          onClick={() => {
                            setWorkoutToEdit(selectedStudent.program || null);
                            setIsManualBuilderOpen(true);
                          }}
                          className="text-[10px] font-black uppercase text-indigo-600"
                        >
                          Editar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedStudent.program.split.map((day, idx) => (
                          <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                            <h5 className="font-black text-slate-800 dark:text-slate-200 text-sm mb-4 uppercase">{day.day}: {day.label}</h5>
                            <div className="space-y-2">
                              {day.exercises.map((ex, exIdx) => (
                                <div key={exIdx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                  <span className="font-bold text-slate-600 dark:text-slate-400 truncate max-w-[150px]">{ex.name}</span>
                                  <span className="text-slate-400 dark:text-slate-500 font-bold tracking-tight">{ex.sets}x{ex.reps}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                      <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-1">Status</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${selectedStudent.isActive !== false ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                        {selectedStudent.isActive !== false ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : selectedStudentView === 'workouts' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest">Gestão de Treinos</h3>
                    <button
                      onClick={() => setSelectedStudentView('dashboard')}
                      className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800"
                    >
                      Voltar Dashboard
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setWorkoutToEdit(null);
                      setIsManualBuilderOpen(true);
                    }}
                    className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[32px] text-slate-400 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:border-indigo-300 hover:text-indigo-600 transition-all font-sans"
                  >
                    <Plus size={20} />
                    Criar Novo Treino
                  </button>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Histórico e biblioteca do Aluno</h4>
                    {(selectedStudent.programs || (selectedStudent.program ? [selectedStudent.program] : [])).length > 0 ? (
                      (selectedStudent.programs || [selectedStudent.program]).map((prog, pIdx) => (
                        <div
                          key={prog.id || pIdx}
                          className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div
                              onClick={() => setSelectedStudentView('workout-detail')}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {selectedStudent.program?.id === prog.id && (
                                  <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase rounded-md border border-emerald-100 dark:border-emerald-800">Ativo</span>
                                )}
                              </div>
                              <h4 className="text-xl font-black text-slate-900 dark:text-white mb-1">{prog.name}</h4>
                              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase">
                                <span>{prog.goal}</span>
                                {prog.endDate && (
                                  <>
                                    <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full"></span>
                                    <span className="text-red-400">Expira em: {prog.endDate}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setWorkoutToEdit(prog);
                                  setIsManualBuilderOpen(true);
                                }}
                                className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={async () => {
                                  // ... delete confirm ...
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 transition-colors duration-300">
                        <p className="text-slate-400 dark:text-slate-500 font-bold mb-1">Nenhum treino encontrado</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedStudentView('workouts')}
                        className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">{selectedStudent.program?.name}</h3>
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Ficha Detalhada</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsManualBuilderOpen(true)}
                      className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100"
                    >
                      Editar Ficha
                    </button>
                  </div>



                  {selectedStudent.program && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {selectedStudent.program.split.map((day, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center font-black text-xs">
                              {day.day.split(' ')[1]}
                            </span>
                            <h5 className="font-black text-slate-800 dark:text-slate-200 text-sm uppercase">{day.label}</h5>
                          </div>
                          <div className="space-y-2">
                            {day.exercises.map((ex, exIdx) => (
                              <div key={exIdx} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0 group">
                                <div>
                                  <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{ex.name}</p>
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{ex.sets}x{ex.reps} • {ex.rest} rec.</p>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all">
                                  <ChevronRight size={14} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }
        return (
          <TrainerDashboard
            students={students}
            onSelectStudent={(s) => { setSelectedStudent(s); setSelectedStudentView('dashboard'); setActiveTab('students'); }}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onOpenExerciseManager={() => setActiveView('exercises')}
            onOpenStudentRegistration={() => setActiveView('register')}
            onOpenWorkoutLibrary={() => setActiveView('library')}
            onlyList={activeTab === 'students'}
          />
        );
      case 'profile':
        return <TrainerProfile user={authUser} onUpdateProfile={handleUpdateTrainerProfile} />;
      default: return null;
    }
  };

  const renderStudentContent = () => {
    const loggedInStudent = students.find(s => s.id === authUser?.id);
    switch (activeTab) {
      case 'home':
        if (!loggedInStudent) return null;
        return (
          <StudentDashboard
            student={loggedInStudent}
            onNavigateToWorkout={() => setActiveTab('workout')}
            onNavigateToProgress={() => setActiveTab('evolution')}
          />
        );
      case 'workout':
        return (
          <StudentApp
            program={loggedInStudent?.program}
            students={students}
            currentStudentId={authUser!.id}
            onSelectStudent={() => { }}
            onFinishWorkout={handleFinishWorkout}
            onBack={() => setActiveTab('home')}
          />
        );
      case 'evolution': return loggedInStudent ? <StudentProgressScreen student={loggedInStudent} /> : null;
      case 'chat': return <ChatScreen role={UserRole.STUDENT} student={loggedInStudent || undefined} />;
      case 'profile': return loggedInStudent ? <StudentProfile student={loggedInStudent} onUpdateProfile={(updates) => setAuthUser({ ...authUser, ...updates } as AuthUser)} /> : null;
      default: return null;
    }
  };

  const loggedInStudent = students.find(s => s.id === authUser?.id);

  return (
    <ThemeProvider>
      <Layout
        role={authUser.role}
        onSwitchRole={handleLogout}
        onNavigate={handleNavigate}
        activeTab={activeTab}
        userName={authUser.name}
        userAvatar={authUser.avatar}
        trainerSocials={loggedInStudent ? {
          instagram: loggedInStudent.trainerInstagram,
          whatsapp: loggedInStudent.trainerWhatsapp
        } : undefined}
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

        {/* Modal Genérico de Onboarding */}
        {isOnboardingOpen && (
          <OnboardingModal
            onClose={() => setIsOnboardingOpen(false)}
            onFinish={(data) => {
              setPendingStudentData(data);
              setIsOnboardingOpen(false);
              setWorkoutToEdit(null); // Reset para garantir que é um treino novo
              setIsManualBuilderOpen(true);
            }}
          />
        )}

        {/* Manual Workout Builder */}
        {isManualBuilderOpen && (
          <ManualWorkoutBuilder
            initialProgram={workoutToEdit || (pendingStudentData ? {
              id: Math.random().toString(36).substring(2, 11),
              name: `${pendingStudentData.goal} - ${pendingStudentData.experience}`,
              split: [], // Será preenchido pelo builder
              frequency: pendingStudentData.frequency,
              goal: pendingStudentData.goal
            } : undefined)}
            onSave={handleSaveWorkout}
            onClose={() => setIsManualBuilderOpen(false)}
          />
        )}

        {/* Modal de Seleção de Aluno para aplicar template */}
        {isStudentSelectorOpen && (
          <StudentSelectorModal
            students={students}
            onSelect={async (student) => {
              if (pendingTemplate) {
                // 1. Save the workout to the target student
                await handleSaveWorkout({
                  ...pendingTemplate,
                  id: Math.random().toString(36).substring(2, 9),
                  startDate: new Date().toISOString().split('T')[0]
                } as TrainingProgram, student);

                // 2. Fetch fresh data to ensure we have the updated workout
                // Although handleSaveWorkout calls reloadStudents, we want to be sure and get the reference here
                const freshStudents = await DataService.getStudents();
                setStudents(freshStudents);

                // 3. Find the updated student object
                const freshStudent = freshStudents.find(s => s.id === student.id);

                // 4. Update selection and navigate
                if (freshStudent) {
                  setSelectedStudent(freshStudent);
                  setSelectedStudentView('dashboard');
                  setActiveTab('students');
                }

                setIsStudentSelectorOpen(false);
                setPendingTemplate(null);
              }
            }}
            onClose={() => setIsStudentSelectorOpen(false)}
            onAddStudent={() => { }} // Not needed here
            onDeleteStudent={() => { }} // Not needed here
          />
        )}
      </Layout>
    </ThemeProvider>
  );
};

export default App;
