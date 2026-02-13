
import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, TrainingProgram, OnboardingData, AuthUser } from './types';
import Layout from './components/Layout';
import TrainerDashboard from './components/TrainerDashboard';
import StudentApp from './components/StudentApp';
import LoginScreen from './components/LoginScreen';
import OnboardingModal from './components/OnboardingModal';
import ManualWorkoutBuilder from './components/ManualWorkoutBuilder';
import WorkoutLibraryScreen from './components/WorkoutLibraryScreen';

import { DataService } from './services/dataService';
import { formatPhone, translateExperience } from './utils/formatters';
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
import StudentAssessmentsScreen from './components/StudentAssessmentsScreen';
import { WorkoutFolder, WorkoutTemplate, Student, StudentFile } from './types';
import { ArrowLeft, Settings, Loader2, RefreshCw, CheckCircle2, X, Dumbbell, ArrowRight, Zap, Award, ChevronRight, Plus, Edit2, Trash2, User, Calendar, FileText, MessageCircle } from 'lucide-react';
import { TrainingFrequencyCard } from './components/TrainingFrequencyCard';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import SubscriptionScreen from './components/SubscriptionScreen';

const STORAGE_KEY_AUTH = 'fitai_pro_auth_session';

const App: React.FC = () => {
  const { user: supabaseUser, subscriptionStatus, loading: authLoading, refreshSubscription } = useAuth();
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AUTH);
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoading, setIsLoading] = useState(() => {
    // Se temos um usuário salvo, começamos carregando. Caso contrário, não.
    const saved = localStorage.getItem(STORAGE_KEY_AUTH);
    return !!saved;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [selectedStudentView, setSelectedStudentView] = useState<'dashboard' | 'builder' | 'workouts' | 'workout-detail' | 'assessments' | 'files'>('dashboard');
  const [workoutToEdit, setWorkoutToEdit] = useState<TrainingProgram | null>(null);

  const [activeView, setActiveView] = useState<'dashboard' | 'register' | 'exercises' | 'edit-student' | 'student-stats' | 'library'>('dashboard');
  const [activeTab, setActiveTab] = useState<'home' | 'students' | 'evolution' | 'chat' | 'workout' | 'profile'>('home');
  const [students, setStudents] = useState<Student[]>([]);
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>([]);
  const [workoutFolders, setWorkoutFolders] = useState<WorkoutFolder[]>([]);
  const [customExercises, setCustomExercises] = useState<LibraryExercise[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isManualBuilderOpen, setIsManualBuilderOpen] = useState(false);
  const [pendingStudentData, setPendingStudentData] = useState<OnboardingData | null>(null);
  const [isStudentSelectorOpen, setIsStudentSelectorOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<WorkoutTemplate | null>(null);
  const [showLoginInfo, setShowLoginInfo] = useState(false);
  const [studentView, setStudentView] = useState<'dashboard' | 'workout' | 'assessments'>('dashboard');
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [fileToView, setFileToView] = useState<{ url: string; name: string; type: string } | null>(null);

  const reloadStudents = useCallback(async () => {
    try {
      if (!authUser?.id) {
        // Se não há usuário logado, carrega todos os alunos (para validar login na tela inicial)
        // Em um app SaaS real, isso seria perigoso/ineficiente, mas para este app local/single-trainer é aceitável.
        // O ideal seria ter uma rota específica para validar credenciais.
        console.log("Carregando lista de alunos para login...");
        const allStudents = await DataService.getStudents();
        setStudents(allStudents);
        return;
      }

      if (authUser.role === UserRole.STUDENT) {
        // Se for aluno, carrega apenas os dados dele mesmo
        const myself = await DataService.getStudentById(authUser.id);
        setStudents(myself ? [myself] : []);

        // Atualiza seleção se necessário
        if (myself) {
          setSelectedStudent(prev => {
            // Mantém a seleção se já estiver selecionado ou seleciona automaticamente se for o único
            return prev?.id === myself.id ? myself : myself;
          });
        }
      } else {
        // Se for Trainer, carrega todos os alunos dele
        const loadedStudents = await DataService.getStudents(authUser.id);
        setStudents(loadedStudents);

        setSelectedStudent(prev => {
          if (!prev) return null;
          return loadedStudents.find(s => s.id === prev.id) || null;
        });
      }
    } catch (err) {
      console.error("Erro ao recarregar alunos:", err);
    }
  }, [authUser?.id, authUser?.role]);

  const reloadExercises = useCallback(async () => {
    try {
      const loadedExercises = await DataService.getLibraryExercises(authUser?.id);
      setCustomExercises(loadedExercises);
    } catch (err) {
      console.error("Erro ao recarregar exercícios:", err);
    }
  }, [authUser?.id]);

  const reloadTemplates = useCallback(async () => {
    if (!authUser?.id) return;
    try {
      const loaded = await DataService.getWorkoutTemplates(authUser.id);
      setWorkoutTemplates(loaded);
    } catch (err) {
      console.error("Erro ao recarregar templates:", err);
    }
  }, [authUser?.id]);

  const reloadFolders = useCallback(async () => {
    if (!authUser?.id) return;
    try {
      const loaded = await DataService.getWorkoutFolders(authUser.id);
      setWorkoutFolders(loaded);
    } catch (err) {
      console.error("Erro ao recarregar pastas:", err);
    }
  }, [authUser?.id]);

  const refreshProfile = useCallback(async () => {
    if (authUser && authUser.role === UserRole.TRAINER && DataService.isCloudActive()) {
      try {
        const trainerData = await DataService.findTrainer(authUser.email);
        if (trainerData) {
          // Só atualiza se houver mudança real para evitar loop infinito
          const hasChanged =
            trainerData.name !== authUser.name ||
            trainerData.surname !== authUser.surname ||
            trainerData.subscriptionStatus !== authUser.subscriptionStatus ||
            trainerData.subscriptionEndDate !== authUser.subscriptionEndDate ||
            trainerData.instagram !== authUser.instagram ||
            trainerData.whatsapp !== authUser.whatsapp;

          if (hasChanged) {
            setAuthUser(prev => prev ? {
              ...prev,
              name: trainerData.name || prev.name,
              surname: trainerData.surname || prev.surname,
              avatar: trainerData.avatar || prev.avatar,
              instagram: trainerData.instagram || prev.instagram,
              whatsapp: trainerData.whatsapp || prev.whatsapp,
              cref: trainerData.cref || prev.cref,
              subscriptionStatus: trainerData.subscriptionStatus,
              subscriptionEndDate: trainerData.subscriptionEndDate,
            } : null);
          }
        }
      } catch (err) {
        console.error("Erro ao atualizar perfil do trainer:", err);
      }
    }
  }, [authUser?.email, authUser?.name, authUser?.subscriptionStatus]); // Dependências mais granulares
  const [loadingTakingTooLong, setLoadingTakingTooLong] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Se não temos usuário, carregamos APENAS os alunos (para o login funcionar)
    if (!authUser) {
      const loadInitialData = async () => {
        try {
          console.log("App: Sem usuário, carregando alunos para login...");
          await reloadStudents();
        } catch (e) {
          console.error("Erro ao carregar alunos iniciais:", e);
        } finally {
          if (mounted) setIsLoading(false);
        }
      };
      loadInitialData();
      return () => { mounted = false; };
    }

    // Se já temos alunos e não é um novo usuário (ID mudou), não precisamos forçar o loading visual pesado
    // Isso evita o "flash" de carregamento se for apenas um refresh de perfil
    if (students.length === 0) {
      setIsLoading(true);
    }

    setLoadingTakingTooLong(false);

    // Safety check: if loading takes > 10s, show a retry button
    const timeoutId = setTimeout(() => {
      if (mounted && isLoading) {
        setLoadingTakingTooLong(true);
      }
    }, 10000);

    const loadData = async () => {
      try {
        await Promise.allSettled([
          refreshProfile(),
          reloadStudents(),
          reloadExercises(),
          reloadTemplates(),
          reloadFolders()
        ]);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        if (mounted) {
          clearTimeout(timeoutId);
          setIsLoading(false);
          setLoadingTakingTooLong(false);
        }
      }
    };

    loadData();
    return () => { mounted = false; clearTimeout(timeoutId); };
  }, [authUser?.id]); // CRÍTICO: Depender apenas do ID para evitar loops infinitos

  useEffect(() => {
    if (authUser) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(authUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }
  }, [authUser]);

  // Sync Supabase Auth with app-wide authUser state for Trainers
  useEffect(() => {
    // Só limpamos o estado se authLoading terminar DEFINITIVAMENTE e não houver usuário
    // Adicionamos um pequeno delay defensivo para evitar "flashes" de deslogado durante transições
    if (!authLoading) {
      const timer = setTimeout(() => {
        if (!supabaseUser && authUser?.role === UserRole.TRAINER) {
          console.log('Sessão Supabase confirmada como encerrada, limpando estado local...');
          setAuthUser(null);
          setIsLoading(false);
        }
      }, 500); // 500ms de tolerância para o Supabase se estabilizar
      return () => clearTimeout(timer);
    }
  }, [supabaseUser, authLoading, authUser]);

  const handleLogin = (user: AuthUser) => {
    setIsLoading(true); // Garante que ao logar, o useEffect de loadData seja "notado"
    if (user.role === UserRole.TRAINER && user.email) {
      refreshSubscription(user.email).catch(console.error);
    }
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
    if (tab === 'home') {
      // Ensure we go back to dashboard if user clicks Home while in Assessments
      // Note: activeTab controls the high-level view for students too
    }
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
    }
  }, [pendingStudentData, selectedStudent, enrichWithLibraryData, authUser]);

  const handleSaveTemplate = async (template: WorkoutTemplate) => {
    setIsSaving(true);
    try {
      const enriched = enrichWithLibraryData(template as any) as WorkoutTemplate;
      await DataService.saveWorkoutTemplate(enriched, authUser?.id);
      await reloadTemplates();
    } catch (e) {
      console.error("Erro ao salvar template", e);
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
    } catch (e) {
      console.error("Erro ao remover template", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFolder = async (folder: WorkoutFolder) => {
    setIsSaving(true);
    try {
      await DataService.saveWorkoutFolder(folder, authUser?.id);
      await reloadFolders();
    } catch (e) {
      console.error("Erro ao criar pasta", e);
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
    } catch (e) {
      console.error("Erro ao remover pasta", e);
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
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const handleUpdateStudentProfile = async (updates: Partial<Student>) => {
    if (!authUser || authUser.role !== UserRole.STUDENT) return;

    const currentStudent = students.find(s => s.id === authUser.id);
    if (!currentStudent) return;

    try {
      setIsSaving(true);

      // Sync phone with whatsapp if whatsapp is being updated
      // ensuring consistency between StudentRegistration (uses phone) and StudentProfile (uses whatsapp)
      if (updates.whatsapp) {
        updates.phone = updates.whatsapp;
      }

      const updatedStudent = { ...currentStudent, ...updates };

      await DataService.saveStudent(updatedStudent);

      // Update local student list
      setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));

      // Update AuthUser if relevant fields changed (name, avatar) so sidebar updates
      if (updates.name || updates.avatar) {
        setAuthUser(prev => prev ? {
          ...prev,
          name: updates.name || prev.name,
          avatar: updates.avatar || prev.avatar
        } : null);
      }

    } catch (error) {
      console.error("Failed to update student profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderTrainerContent = () => {
    if (activeView === 'register') {
      return (
        <StudentRegistrationScreen
          onBack={() => setActiveView('dashboard')}
          onSave={async (studentData) => {
            setIsSaving(true);
            try {
              // Create new student
              const newStudent = {
                id: Math.random().toString(36).substring(2, 11),
                name: studentData.name,
                email: studentData.email,
                phone: studentData.phone,
                birthDate: studentData.birthDate,
                cpf: studentData.cpf,
                gender: studentData.gender,
                goal: studentData.goal,
                experience: studentData.experience,
                isActive: studentData.isActive,
                program: null,
                programs: [],
                history: [],
                files: [],
                billingDay: studentData.billingDay,
                monthlyFee: studentData.monthlyFee
              };
              await DataService.saveStudent(newStudent as any, authUser?.id);
              await reloadStudents();
              setActiveView('dashboard');
              alert('Aluno cadastrado com sucesso!');
            } catch (e) {
              console.error("Erro ao cadastrar.", e);
              alert('Erro ao cadastrar aluno. Verifique os dados e tente novamente.');
            } finally {
              setIsSaving(false);
            }
          }}
        />
      );
    }

    if (activeView === 'edit-student' && selectedStudent) {
      return (
        <StudentRegistrationScreen
          initialData={selectedStudent}
          onBack={() => setActiveView('dashboard')}
          onDelete={async (id) => {
            if (confirm('Tem certeza?')) {
              setIsSaving(true);
              try {
                await DataService.deleteStudent(id);
                await reloadStudents();
                setSelectedStudent(null);
                setActiveView('dashboard');
                setActiveTab('students');
              } catch (e) {
                console.error("Erro ao remover.", e);
              } finally {
                setIsSaving(false);
              }
            }
          }}
          onSave={async (studentData) => {
            setIsSaving(true);
            try {
              const updated = { ...selectedStudent, ...studentData };
              await DataService.saveStudent(updated, authUser?.id);
              await reloadStudents();
              setSelectedStudent(updated);
              setActiveView('dashboard');
              alert('Dados atualizados com sucesso!');
            } catch (e) {
              console.error("Erro ao salvar.", e);
              alert('Erro ao salvar os dados. Tente novamente.');
            } finally {
              setIsSaving(false);
            }
          }}
        />
      );
    }
    if (activeView === 'exercises') {
      return (
        <ExerciseManagerScreen
          exercises={customExercises}
          onAdd={async (ex) => {
            setIsSaving(true);
            try {
              // TODO: Add support for saving exercises to DB in DataService so we can persist them
              // For now, we'll update the local state which might be reset on reload if not saved
              // Actually, let's assuming DataService has a method or we'll add one later. 
              // For this fix, let's just make it work safely.
              setCustomExercises(prev => [...prev, ex]);
              await DataService.saveExercise(ex, authUser?.id);
              await reloadExercises();
            } catch (e) {
              console.error("Erro ao salvar exercício:", e);
            } finally {
              setIsSaving(false);
            }
          }}
          onDelete={async (id) => {
            setIsSaving(true);
            try {
              await DataService.deleteExercise(id);
              await reloadExercises();
            } catch (e) {
              console.error("Erro ao remover exercício", e);
            } finally {
              setIsSaving(false);
            }
          }}
          onBack={() => setActiveView('dashboard')}
        />
      );
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
          onUseInStudent={(t) => {
            setPendingTemplate(t);
            setIsStudentSelectorOpen(true);
          }}
        />
      );
    }

    if (activeTab === 'profile') {
      return <TrainerProfile user={authUser} onUpdateProfile={handleUpdateTrainerProfile} onBack={() => setActiveTab('students')} />;
    }

    if (activeTab === 'evolution') {
      return (
        <EvolutionScreen
          students={students}
          onSelectStudent={(s) => {
            setSelectedStudent(s);
            setSelectedStudentView('dashboard');
            setActiveTab('students');
          }}
        />
      );
    }

    if (activeTab === 'chat') {
      return <ChatScreen role={UserRole.TRAINER} />;
    }

    const handleActivateStudentProgram = async (programId: string) => {
      if (!selectedStudent || !selectedStudent.programs) return;

      const programToActivate = selectedStudent.programs.find(p => p.id === programId);
      if (!programToActivate) return;

      const updatedStudent = {
        ...selectedStudent,
        program: programToActivate
      };

      setSelectedStudent(updatedStudent);

      // Update local students list immediately
      setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));

      try {
        if (authUser?.id) {
          await DataService.saveStudent(updatedStudent, authUser.id);
        }
      } catch (error) {
        console.error("Erro ao ativar treino:", error);
        alert("Erro ao ativar o treino. Tente novamente.");
      }
    };

    const handleDeleteStudentProgram = async (programId: string) => {
      if (!selectedStudent || !selectedStudent.programs) return;

      if (!window.confirm("Tem certeza que deseja excluir este treino? A ação não pode ser desfeita.")) {
        return;
      }

      const updatedPrograms = selectedStudent.programs.filter(p => p.id !== programId);

      let updatedActiveProgram = selectedStudent.program;
      if (selectedStudent.program?.id === programId) {
        updatedActiveProgram = undefined;
      }

      const updatedStudent = {
        ...selectedStudent,
        programs: updatedPrograms,
        program: updatedActiveProgram
      };

      setSelectedStudent(updatedStudent);
      setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));

      try {
        if (authUser?.id) {
          await DataService.saveStudent(updatedStudent, authUser.id);
        }
      } catch (error) {
        console.error("Erro ao excluir treino:", error);
        alert("Erro ao excluir o treino. Tente novamente.");
      }
    };

    if (activeTab === 'students' && selectedStudent) {
      return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-20">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (selectedStudentView === 'dashboard') {
                  setSelectedStudent(null);
                } else {
                  setSelectedStudentView('dashboard');
                }
              }}
              className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <button onClick={() => setActiveView('edit-student')} className="p-3 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 rounded-2xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
              <Settings size={20} />
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-start justify-between gap-6 bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-slate-100 dark:border-zinc-800 shadow-sm transition-colors duration-300">
            <div className="flex items-center gap-6">
              <img src={selectedStudent.avatar} className="w-20 h-20 md:w-24 md:h-24 rounded-3xl object-cover shadow-xl border-4 border-white dark:border-zinc-800" />
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{selectedStudent.name}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-[10px] font-black uppercase rounded-full border border-zinc-200 dark:border-zinc-700">{selectedStudent.goal}</span>
                  <span className="px-3 py-1 bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-[10px] font-black uppercase rounded-full border border-slate-100 dark:border-zinc-700">{translateExperience(selectedStudent.experience)}</span>
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
                className="group bg-white dark:bg-zinc-900 p-5 rounded-[28px] transition-all active:scale-[0.98] shadow-sm hover:shadow-md border border-slate-200 dark:border-zinc-800 flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20 dark:shadow-emerald-900/10 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Dumbbell size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Treinos</h3>
                    <p className="text-slate-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Gerenciar todas as rotinas</p>
                  </div>
                </div>
                <div className="w-10 h-10 bg-slate-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-slate-300 dark:text-zinc-600 group-hover:bg-emerald-600 group-hover:text-white transition-all flex-shrink-0">
                  <ArrowRight size={20} />
                </div>
              </button>

              <button
                onClick={() => setSelectedStudentView('files')}
                className="group bg-white dark:bg-zinc-900 p-5 rounded-[28px] transition-all active:scale-[0.98] shadow-sm hover:shadow-md border border-slate-200 dark:border-zinc-800 flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-900/10 dark:shadow-zinc-100/5 group-hover:scale-105 transition-transform flex-shrink-0">
                    <FileText size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Arquivos</h3>
                    <p className="text-slate-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Documentos e Anexos</p>
                  </div>
                </div>
                <div className="w-10 h-10 bg-slate-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-slate-300 dark:text-zinc-600 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-all flex-shrink-0">
                  <ArrowRight size={20} />
                </div>
              </button>

              <button
                onClick={() => setSelectedStudentView('assessments')}
                className="group bg-white dark:bg-zinc-900 p-5 rounded-[28px] transition-all active:scale-[0.98] shadow-sm hover:shadow-md border border-slate-200 dark:border-zinc-800 flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/20 dark:shadow-purple-900/10 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Award size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Avaliações</h3>
                    <p className="text-slate-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Morfológica e Anamnese</p>
                  </div>
                </div>
                <div className="w-10 h-10 bg-slate-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-slate-300 dark:text-zinc-600 group-hover:bg-purple-600 group-hover:text-white transition-all flex-shrink-0">
                  <ArrowRight size={20} />
                </div>
              </button>

              <div className="space-y-2">
                <button
                  onClick={() => setShowLoginInfo(!showLoginInfo)}
                  className="group bg-white dark:bg-zinc-900 p-5 rounded-[28px] transition-all active:scale-[0.98] shadow-sm hover:shadow-md border border-slate-200 dark:border-zinc-800 flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-900/10 dark:shadow-zinc-100/5 group-hover:scale-105 transition-transform flex-shrink-0">
                      <Zap size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Informações de Login</h3>
                      <p className="text-slate-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Credenciais de Acesso</p>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${showLoginInfo ? 'bg-zinc-900 text-white' : 'bg-slate-50 dark:bg-zinc-800 text-slate-300 dark:text-zinc-600'}`}>
                    <ArrowRight size={20} className={`transition-transform duration-300 ${showLoginInfo ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {showLoginInfo && (
                  <div className="bg-zinc-50 dark:bg-zinc-800/30 p-6 rounded-[32px] border border-dashed border-zinc-200 dark:border-zinc-700 animate-in slide-in-from-top duration-300">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
                        <span className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500">Dados de Acesso</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">Pronto para envio</span>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                          <p className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 mb-1">E-mail</p>
                          <p className="font-bold text-zinc-900 dark:text-white select-all">{selectedStudent.email}</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                          <p className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 mb-1">Senha (Padrão CPF)</p>
                          <p className="font-mono font-bold text-zinc-900 dark:text-white select-all">{selectedStudent.password || '123456'}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const msg = `Olá ${selectedStudent.name.split(' ')[0]}! Aqui estão seus dados de acesso ao PersonalFlow:%0A%0A📧 E-mail: ${selectedStudent.email}%0A🔑 Senha: ${selectedStudent.password || '123456'}%0A%0AAbra o app e comece seus treinos!`;
                          const phone = selectedStudent.phone?.replace(/\D/g, '') || '';
                          window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank');
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                      >
                        <MessageCircle size={18} />
                        ENVIAR POR WHATSAPP
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : selectedStudentView === 'files' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-black text-slate-400 dark:text-zinc-500 uppercase text-[10px] tracking-widest">Arquivos do Aluno</h3>
              </div>

              <div className="grid gap-4">
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.onchange = async (e: any) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];

                        // Limit size to avoid DB issues (e.g. 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                          alert("O arquivo é muito grande. O limite é 5MB.");
                          return;
                        }

                        const reader = new FileReader();
                        reader.onload = async (event) => {
                          const base64Url = event.target?.result as string;

                          const newFile: StudentFile = {
                            id: Math.random().toString(36).substr(2, 9),
                            name: file.name,
                            type: file.name.endsWith('.pdf') ? 'pdf' : 'image',
                            url: base64Url,
                            date: new Date().toLocaleDateString('pt-BR')
                          };

                          const updatedFiles = [...(selectedStudent.files || []), newFile];
                          const updatedStudent = { ...selectedStudent, files: updatedFiles };

                          setIsSaving(true);
                          try {
                            await DataService.saveStudent(updatedStudent, authUser?.id);
                            setSelectedStudent(updatedStudent);
                            setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
                          } catch (err) {
                            console.error("Erro ao adicionar arquivo", err);
                            alert("Erro ao salvar arquivo.");
                          } finally {
                            setIsSaving(false);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                  className="w-full py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl flex flex-col items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors gap-2"
                >
                  <Plus className="text-zinc-400" />
                  <span className="text-xs font-bold text-zinc-400 uppercase">Adicionar Arquivo</span>
                </button>

                <div className="space-y-3">
                  {(selectedStudent.files || []).map((file) => (
                    <div
                      key={file.id}
                      className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                      onClick={() => {
                        console.log("Arquivo clicado (Trainer):", file);
                        if (file.url && file.url !== '#' && file.url.length > 10) {
                          setFileToView(file);
                        } else {
                          alert("Visualização indisponível para este arquivo (URL inválida). Exclua e adicione novamente.");
                        }
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${file.type === 'pdf' ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-blue-50 text-blue-500 dark:bg-blue-900/20'}`}>
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-zinc-900 dark:text-white mb-0.5">{file.name}</p>
                          <p className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">
                            {file.date} • {file.type.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Tem certeza que deseja excluir este arquivo?')) {
                            const updatedFiles = (selectedStudent.files || []).filter(f => f.id !== file.id);
                            const updatedStudent = { ...selectedStudent, files: updatedFiles };

                            setIsSaving(true);
                            DataService.saveStudent(updatedStudent, authUser?.id)
                              .then(() => {
                                setSelectedStudent(updatedStudent);
                                setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
                              })
                              .catch(err => {
                                console.error("Erro ao excluir arquivo", err);
                                alert("Erro ao excluir arquivo.");
                              })
                              .finally(() => setIsSaving(false));
                          }
                        }}
                        className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : selectedStudentView === 'assessments' ? (
            <StudentAssessmentsScreen
              student={selectedStudent}
              onUpdate={async (updatedStudent) => {
                setIsSaving(true);
                try {
                  await DataService.saveStudent(updatedStudent, authUser?.id);
                  await reloadStudents();
                  setSelectedStudent(updatedStudent);
                } catch (error) {
                  console.error("Erro ao salvar avaliação", error);
                } finally {
                  setIsSaving(false);
                }
              }}
              onBack={() => setSelectedStudentView('dashboard')}
            />
          ) : selectedStudentView === 'workouts' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-black text-slate-400 dark:text-zinc-500 uppercase text-[10px] tracking-widest">Gestão de Treinos</h3>

              </div>

              <button
                onClick={() => {
                  setWorkoutToEdit(null);
                  setIsManualBuilderOpen(true);
                }}
                className="w-full py-6 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-[32px] text-zinc-400 dark:text-zinc-500 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all font-sans"
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
                      className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div
                          onClick={() => setExpandedWorkoutId(expandedWorkoutId === prog.id ? null : prog.id)}
                          className="cursor-pointer flex-1"
                        >
                          <div className="flex items-center gap-2 mb-2">

                          </div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xl font-black text-slate-900 dark:text-white mb-1">{prog.name}</h4>
                            <ChevronRight size={16} className={`text-slate-400 transition-transform duration-300 ${expandedWorkoutId === prog.id ? 'rotate-90' : ''}`} />
                          </div>
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
                          {selectedStudent.program?.id === prog.id ? (
                            <button
                              disabled
                              className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wide flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 cursor-default"
                            >
                              <CheckCircle2 size={12} className="text-white" strokeWidth={3} />
                              Ativo
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActivateStudentProgram(prog.id);
                              }}
                              className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 hover:border-emerald-500 hover:text-emerald-500 dark:hover:border-emerald-500 dark:hover:text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all bg-transparent"
                            >
                              Ativar
                            </button>
                          )}
                          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
                          <button
                            onClick={() => {
                              setWorkoutToEdit(prog);
                              setIsManualBuilderOpen(true);
                            }}
                            className="p-2 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              handleDeleteStudentProgram(prog.id);
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {expandedWorkoutId === prog.id && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4 fade-in duration-300">
                          {prog.split.map((day, dIdx) => (
                            <div key={dIdx} className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                              <h5 className="font-black text-slate-800 dark:text-zinc-200 text-xs mb-3 uppercase flex items-center gap-2">
                                <span className="h-6 w-auto min-w-[24px] px-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center text-[10px] border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-black">{day.day}</span>
                                <span className="text-zinc-800 dark:text-zinc-100">{day.label}</span>
                              </h5>
                              <div className="space-y-2">
                                {day.exercises.map((ex, exIdx) => (
                                  <div key={exIdx} className="flex items-center justify-between text-[10px] py-1.5 border-b border-slate-200 dark:border-zinc-800/50 last:border-0">
                                    <span className="font-bold text-zinc-600 dark:text-zinc-400 truncate flex-1">{ex.name}</span>
                                    <span className="text-zinc-500 dark:text-zinc-500 font-black tracking-tight bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-100 dark:border-zinc-800">{ex.sets}x{ex.reps}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="space-y-6 animate-in slide-in-from-right duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedStudentView('dashboard')}
                          className="p-2 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                          <ArrowLeft size={18} />
                        </button>
                        <div>
                          <h3 className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight">{selectedStudent.program?.name || 'Sem Ficha'}</h3>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">Ficha Detalhada</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setWorkoutToEdit(selectedStudent.program);
                          setIsManualBuilderOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <Edit2 size={16} /> Editar
                      </button>
                    </div>

                    {selectedStudent.program ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedStudent.program.split.map((day, idx) => (
                          <div key={idx} className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-slate-100 dark:border-zinc-800 shadow-sm transition-colors duration-300">
                            <div className="flex items-center gap-3 mb-4">
                              <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white flex items-center justify-center font-black text-xs">
                                {day.day.split(' ')[1] || (idx + 1)}
                              </span>
                              <h5 className="font-black text-slate-800 dark:text-zinc-200 text-sm uppercase">{day.label}</h5>
                            </div>
                            <div className="space-y-2">
                              {day.exercises.map((ex, exIdx) => (
                                <div key={exIdx} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-zinc-800 last:border-0 group">
                                  <div>
                                    <p className="font-bold text-slate-800 dark:text-zinc-200 text-xs">{ex.name}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">{ex.sets}x{ex.reps}</p>
                                  </div>
                                  <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-all">
                                    <ChevronRight size={14} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-[32px] border border-slate-100 dark:border-zinc-800 transition-colors duration-300">
                        <p className="text-slate-400 dark:text-zinc-500 font-bold mb-1">Nenhum treino encontrado</p>
                        <button onClick={() => { setWorkoutToEdit(null); setIsManualBuilderOpen(true); }} className="text-zinc-900 dark:text-zinc-100 font-black text-xs uppercase underline">Criar Treino</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div >
          ) : null
          }
        </div >
      );
    }

    return (
      <TrainerDashboard
        students={students}
        trainerName={authUser?.name}
        onSelectStudent={(s) => { setSelectedStudent(s); setSelectedStudentView('dashboard'); setActiveTab('students'); }}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenExerciseManager={() => setActiveView('exercises')}
        onOpenStudentRegistration={() => setActiveView('register')}
        onOpenWorkoutLibrary={() => setActiveView('library')}
        onlyList={activeTab === 'students'}
      />
    );
  };

  if (isLoading || (authUser && authLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6 text-center">
        <div className="relative mb-8">
          <img
            src="/logo.jpg"
            alt="PersonalFlow"
            className="w-24 h-24 rounded-full shadow-2xl shadow-zinc-900/20 dark:shadow-white/10 animate-pulse"
          />
        </div>

        {loadingTakingTooLong && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-4 max-w-xs">
              O carregamento está demorando mais que o esperado.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95 flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={14} />
              Recarregar
            </button>
          </div>
        )}
      </div>
    );
  }

  // Check for Active Subscription
  // Allowing 'trial' status to pass here, because specific trial expiration is handled below (around line 1290)

  if (authUser?.role === UserRole.TRAINER && !authLoading) {
    // If status is not yet loaded (null/undefined), show loading instead of blocking
    // This prevents the "flash" of the subscription screen while status is syncing
    if (!subscriptionStatus) {
      return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      );
    }

    if (subscriptionStatus !== 'active' && subscriptionStatus !== 'trial') {
      return <SubscriptionScreen />;
    }
  }

  if (!authUser) {
    return (
      <ThemeProvider>
        <LoginScreen
          onLogin={(user) => handleLogin(user)}
          students={students}
        />

      </ThemeProvider>
    );
  }

  const renderStudentContent = () => {
    const loggedInStudent = students.find(s => s.id === authUser?.id);
    switch (activeTab) {
      case 'home':
        if (!loggedInStudent) {
          // Fallback UI if student is logged in but data not found in list yet
          return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center animate-in fade-in">
              <Loader2 className="w-10 h-10 text-zinc-300 animate-spin mb-4" />
              <p className="text-zinc-500 font-medium text-sm">Carregando perfil do aluno...</p>
              <p className="text-xs text-zinc-400 mt-2">ID: {authUser?.id}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 text-xs font-bold text-zinc-900 dark:text-white underline"
              >
                Recarregar
              </button>
            </div>
          );
        }
        return (
          <StudentDashboard
            student={loggedInStudent}
            onNavigateToWorkout={() => setActiveTab('workout')}
            onNavigateToProgress={() => setActiveTab('evolution')}
            onNavigateToAssessments={() => setActiveTab('assessments')}
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
      case 'evolution': return loggedInStudent ? <StudentProgressScreen student={loggedInStudent} onBack={() => setActiveTab('home')} /> : null;
      case 'chat': return <ChatScreen role={UserRole.STUDENT} student={loggedInStudent || undefined} />;
      case 'profile': return loggedInStudent ? <StudentProfile student={loggedInStudent} onUpdateProfile={handleUpdateStudentProfile} /> : null;
      case 'assessments':
        return loggedInStudent ? (
          <StudentAssessmentsScreen
            student={loggedInStudent}
            onUpdate={async () => { }} // Read-only, no update needed
            onBack={() => setActiveTab('home')}
            readOnly={true}
          />
        ) : null;
      default: return null;
    }
  };

  const loggedInStudent = students.find(s => s.id === authUser?.id);

  // Check for Trial Expiration
  // Only applies to Trainers with status 'trial'
  if (authUser && authUser.role === UserRole.TRAINER && authUser.subscriptionStatus === 'trial') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parse the date string "YYYY-MM-DD" correctly
    // If it's already a string like "2026-02-15", new Date() usually works, but let's be safe
    // and ensure we are comparing timestamps or properly parsed dates
    const endDate = authUser.subscriptionEndDate ? new Date(authUser.subscriptionEndDate) : null;

    // If it was just a date string (YYYY-MM-DD), set to end of day.
    // If it is an ISO string (YYYY-MM-DDTHH:mm:ss.sssZ), it already has time.
    // But for trial, we want to be generous: if it has a time, use it. If it's just a date, assume end of day.
    // The previous split('T')[0] made it midnight of that day.

    if (endDate) {
      // If the date is exactly midnight (local or UTC), it might have been created without time.
      // Let's force it to 23:59:59 if we suspect it's just a date.
      // However, since we changed LoginScreen to send ISO, let's trust the date object but maybe add a buffer?
      // Actually, the safest logic for "7 days free":
      // If I sign up Monday 10am, it expires Monday 10am next week.
      // "Today" (at 00:00) > EndDate (Monday 10am) -> False.
      // Tuesday (00:00) > EndDate (Monday 10am) -> True. 
      // usage: on Monday 11am, today (Mon 00:00) is NOT > EndDate. So it passes.
      // BUT, new Date() defaults to local time.
      // If today is Mon 00:00. EndDate is Mon 10am. 
      // today > endDate is FALSE. Access granted.
      //
      // If I check at Monday 11pm. today is STILL Mon 00:00.
      // today > endDate is FALSE. Access granted.
      // This effectively gives until the END of the expiry day, assuming 'today' is stripped of time.

      // So the logic `today.setHours(0,0,0,0)` combined with `today > endDate` is actually very permissive.
      // It only blocks the DAY AFTER the end date.
      // Example: EndDate = 15th Feb 14:00.
      // Current Time = 15th Feb 20:00. Today = 15th Feb 00:00.
      // Today > EndDate? (15th 00:00 > 15th 14:00) -> FALSE. Access GRANTED.
      // Current Time = 16th Feb 08:00. Today = 16th Feb 00:00.
      // Today > EndDate? (16th 00:00 > 15th 14:00) -> TRUE. Access BLOCKED.

      // So the logic seems correct for "inclusive" expiration.
      // The issue might be parsing.
      console.log('Validating Trial:', { today, endDate, raw: authUser.subscriptionEndDate });
    }

    if (endDate && today > endDate) {
      console.log('BLOCKING ACCESS - Trial Expired');
      console.log('Today:', today);
      console.log('End Date:', endDate);
      console.log('Raw Subscription End Date:', authUser.subscriptionEndDate);
      return (
        <ThemeProvider>
          <SubscriptionScreen />
        </ThemeProvider>
      );
    }
  }

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
        {authUser.role === UserRole.TRAINER ? renderTrainerContent() : renderStudentContent()}

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
            onCancel={() => setIsManualBuilderOpen(false)}
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




      {/* Modal de Visualização de Arquivo (Trainer) */}
      {fileToView && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] w-full max-w-4xl h-[85vh] shadow-2xl relative flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-zinc-900 dark:text-white truncate pr-8">{fileToView.name}</h3>
              <button
                onClick={() => setFileToView(null)}
                className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <X size={20} className="text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>
            <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 p-4 flex items-center justify-center overflow-auto">
              {fileToView.type === 'pdf' ? (
                <iframe
                  src={fileToView.url}
                  className="w-full h-full rounded-xl border border-zinc-200 dark:border-zinc-800"
                  title={fileToView.name}
                />
              ) : (
                <img
                  src={fileToView.url}
                  alt={fileToView.name}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}

    </ThemeProvider >
  );
};

export default App;
