
import { createClient } from '@supabase/supabase-js';
import { Student, WorkoutFolder, WorkoutTemplate, AuthUser, UserRole } from "../types";
import { LibraryExercise, EXERCISES_DB } from "../constants/exercises";

// Estas variáveis serão injetadas pelo Vercel
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Inicializa o cliente apenas se as chaves existirem
const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

export const DataService = {
  isCloudActive(): boolean {
    return !!supabase;
  },

  // --- ALUNOS ---
  async getStudents(trainerId?: string): Promise<Student[]> {
    if (!supabase) {
      const data = localStorage.getItem('fitai_pro_students');
      return data ? JSON.parse(data) : [];
    }

    // Traz também dados do trainer (join)
    let query = supabase
      .from('students')
      .select('*, trainers:trainer_id(*)')
      .order('name');

    if (trainerId) {
      query = query.eq('trainer_id', trainerId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro Supabase:", error);
      return [];
    }

    return (data || []).map(s => {
      // Mapeia dados do trainer se existirem
      const trainer = s.trainers;

      return {
        ...s,
        phone: s.phone || '',
        birthDate: s.birth_date || '',
        gender: s.gender || '',
        isActive: s.is_active !== false,
        height: s.height || '',
        weight: s.weight || '',
        // Campos do Tainer no Aluno
        trainerName: trainer ? `${trainer.name} ${trainer.surname || ''}`.trim() : undefined,
        trainerAvatar: trainer?.avatar,
        trainerInstagram: trainer?.instagram,
        trainerWhatsapp: trainer?.whatsapp
      }
    });
  },

  async saveStudent(student: Student, trainerId?: string): Promise<void> {
    if (!supabase) {
      const students = await this.getStudents();
      const index = students.findIndex(s => s.id === student.id);
      let updated = index >= 0 ? [...students] : [student, ...students];
      if (index >= 0) updated[index] = student;
      localStorage.setItem('fitai_pro_students', JSON.stringify(updated));
      return;
    }

    const payload: any = {
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      birth_date: student.birthDate,
      height: student.height,
      weight: student.weight,
      avatar: student.avatar,
      goal: student.goal,
      gender: student.gender,
      is_active: student.isActive !== false,
      experience: student.experience,
      injuries: student.injuries,
      equipment: student.equipment,
      program: student.program,
      programs: student.programs, // only one instance please
      history: student.history,
      files: student.files
    };

    if (trainerId) {
      payload.trainer_id = trainerId;
    }

    const { error } = await supabase
      .from('students')
      .upsert(payload);

    if (error) throw error;
  },

  async deleteStudent(id: string): Promise<void> {
    if (!supabase) {
      const students = await this.getStudents();
      localStorage.setItem('fitai_pro_students', JSON.stringify(students.filter(s => s.id !== id)));
      return;
    }
    await supabase.from('students').delete().eq('id', id);
  },

  // --- EXERCÍCIOS ---
  async getLibraryExercises(trainerId?: string): Promise<LibraryExercise[]> {
    if (!supabase) {
      const data = localStorage.getItem('fitai_pro_custom_exercises');
      const custom = data ? JSON.parse(data) : [];
      return [...EXERCISES_DB, ...custom];
    }

    let query = supabase.from('exercises').select('*');
    if (trainerId) {
      query = query.or(`trainer_id.eq.${trainerId},trainer_id.is.null`);
    }

    const { data, error } = await query;
    if (error) {
      if (error.message?.includes('AbortError')) {
        console.warn("Busca de exercícios abortada (provável refresh).");
      } else {
        console.error("Erro ao buscar exercícios:", error);
      }
      return EXERCISES_DB;
    }

    // Mescla exercícios padrão com os do banco, removendo duplicatas pelo nome
    const cloudExercises = data || [];
    const combined = [...EXERCISES_DB];

    cloudExercises.forEach((cloudEx: LibraryExercise) => {
      const exists = combined.some(ex => ex.name.toLowerCase() === cloudEx.name.toLowerCase());
      if (!exists) {
        combined.unshift(cloudEx);
      }
    });

    return combined;
  },

  async saveExercise(exercise: LibraryExercise, trainerId?: string): Promise<void> {
    if (!supabase) {
      const exercises = await this.getLibraryExercises();
      if (exercise.id) {
        const index = exercises.findIndex(ex => ex.id === exercise.id);
        if (index >= 0) {
          exercises[index] = exercise;
          localStorage.setItem('fitai_pro_custom_exercises', JSON.stringify(exercises.filter(ex => !EXERCISES_DB.some(d => d.name === ex.name))));
          return;
        }
      }
      localStorage.setItem('fitai_pro_custom_exercises', JSON.stringify([...exercises, { ...exercise, id: Math.random().toString(36).substring(2, 11) }]));
      return;
    }

    const payload: any = {
      name: exercise.name,
      category: exercise.category,
      video_url: exercise.videoUrl
    };

    if (exercise.id) {
      payload.id = exercise.id;
    }

    if (trainerId) {
      payload.trainer_id = trainerId;
    }

    const { error } = await supabase.from('exercises').upsert(payload);
    if (error) throw error;
  },

  // --- TRAINERS / AUTH ---
  async registerTrainer(trainer: any): Promise<void> {
    if (!supabase) {
      const trainers = JSON.parse(localStorage.getItem('fitai_pro_trainers') || '[]');
      localStorage.setItem('fitai_pro_trainers', JSON.stringify([...trainers, trainer]));
      return;
    }
    await supabase.from('trainers').insert({
      id: trainer.id,
      name: trainer.name,
      email: trainer.email,
      password: trainer.password
    });
  },

  async findTrainer(email: string): Promise<any | null> {
    if (!supabase) {
      // Local mock could find by checking storage, but let's assume default flow
      const trainers = JSON.parse(localStorage.getItem('fitai_pro_trainers') || '[]');
      return trainers.find((t: any) => t.email === email) || null;
    }

    const { data } = await supabase
      .from('trainers')
      .select('*')
      .eq('email', email)
      .single();

    if (!data) return null;

    return {
      ...data,
      subscriptionStatus: data.subscription_status,
      subscriptionEndDate: data.subscription_end_date
    };
  },

  async updateTrainer(trainer: Partial<AuthUser>): Promise<void> {
    if (!supabase) {
      // Mock save
      const trainers = JSON.parse(localStorage.getItem('fitai_pro_trainers') || '[]');
      const index = trainers.findIndex((t: any) => t.id === trainer.id);
      if (index >= 0) {
        trainers[index] = { ...trainers[index], ...trainer };
        localStorage.setItem('fitai_pro_trainers', JSON.stringify(trainers));
      }
      return;
    }

    if (!trainer.id) return;

    // Remove campos que não são colunas do banco se existirem
    const { role, ...rest } = trainer as any;

    const { error } = await supabase
      .from('trainers')
      .upsert({ ...rest, id: trainer.id });

    if (error) {
      console.error("Erro ao atualizar trainer:", error);
      throw error;
    }
  },


  // --- TEMPLATES DE TREINO ---
  async getWorkoutFolders(trainerId?: string): Promise<WorkoutFolder[]> {
    if (!supabase) {
      const data = localStorage.getItem('fitai_pro_workout_folders');
      return data ? JSON.parse(data) : [];
    }
    let query = supabase.from('workout_folders').select('*');
    if (trainerId) {
      query = query.eq('trainer_id', trainerId);
    }
    const { data, error } = await query;
    if (error) return [];
    return data.map(f => ({
      id: f.id,
      name: f.name,
      trainerId: f.trainer_id,
      createdAt: f.created_at
    }));
  },

  async saveWorkoutFolder(folder: WorkoutFolder, trainerId?: string): Promise<void> {
    if (!supabase) {
      const folders = await this.getWorkoutFolders();
      const index = folders.findIndex(f => f.id === folder.id);
      let updated = index >= 0 ? [...folders] : [folder, ...folders];
      if (index >= 0) updated[index] = folder;
      localStorage.setItem('fitai_pro_workout_folders', JSON.stringify(updated));
      return;
    }
    const payload = {
      id: folder.id,
      name: folder.name,
      trainer_id: trainerId || folder.trainerId
    };
    const { error } = await supabase.from('workout_folders').upsert(payload);
    if (error) throw error;
  },

  async deleteWorkoutFolder(id: string): Promise<void> {
    if (!supabase) {
      const folders = await this.getWorkoutFolders();
      localStorage.setItem('fitai_pro_workout_folders', JSON.stringify(folders.filter(f => f.id !== id)));
      return;
    }
    // Primeiro limpamos o folder_id dos templates (ou deixamos o ON DELETE SET NULL agir)
    await supabase.from('workout_folders').delete().eq('id', id);
  },

  async getWorkoutTemplates(trainerId?: string): Promise<WorkoutTemplate[]> {
    if (!supabase) {
      const data = localStorage.getItem('fitai_pro_workout_templates');
      return data ? JSON.parse(data) : [];
    }
    let query = supabase.from('workout_templates').select('*');
    if (trainerId) {
      query = query.eq('trainer_id', trainerId);
    }
    const { data, error } = await query;
    if (error) return [];
    return data.map(t => ({
      ...t,
      folderId: t.folder_id,
      trainerId: t.trainer_id,
      difficulty: t.difficulty
    }));
  },

  async saveWorkoutTemplate(template: WorkoutTemplate, trainerId?: string): Promise<void> {
    if (!supabase) {
      const templates = await this.getWorkoutTemplates();
      const index = templates.findIndex(t => t.id === template.id);
      let updated = index >= 0 ? [...templates] : [template, ...templates];
      if (index >= 0) updated[index] = template;
      localStorage.setItem('fitai_pro_workout_templates', JSON.stringify(updated));
      return;
    }
    const payload = {
      id: template.id,
      name: template.name,
      category: template.category,
      trainer_id: trainerId || template.trainerId,
      folder_id: template.folderId,
      split: template.split,
      frequency: template.frequency,
      goal: template.goal,
      difficulty: template.difficulty,
      ai_suggested_changes: template.aiSuggestedChanges
    };
    const { error } = await supabase.from('workout_templates').upsert(payload);
    if (error) throw error;
  },

  async deleteWorkoutTemplate(id: string): Promise<void> {
    if (!supabase) {
      const templates = await this.getWorkoutTemplates();
      localStorage.setItem('fitai_pro_workout_templates', JSON.stringify(templates.filter(t => t.id !== id)));
      return;
    }
    await supabase.from('workout_templates').delete().eq('id', id);
  },

  // --- AGENDA ---
  async getScheduleEvents(trainerId: string): Promise<any[]> {
    if (!supabase) {
      const data = localStorage.getItem('fitai_pro_events');
      return data ? JSON.parse(data) : [];
    }

    const { data, error } = await supabase
      .from('schedule_events')
      .select('*')
      .eq('trainer_id', trainerId);

    if (error) {
      console.error("Erro Supabase (agenda):", error);
      return [];
    }

    return (data || []).map(e => ({
      id: e.id,
      trainerId: e.trainer_id,
      studentId: e.student_id,
      studentName: e.student_name,
      title: e.title,
      description: e.description,
      start: e.start_time,
      end: e.end_time,
      location: e.location,
      isRecurring: e.is_recurring,
      recurringDays: e.recurring_days,
      status: e.status
    }));
  },

  async saveScheduleEvent(event: any): Promise<void> {
    if (!supabase) {
      const data = localStorage.getItem('fitai_pro_events');
      const events = data ? JSON.parse(data) : [];
      const index = events.findIndex((e: any) => e.id === event.id);
      let updated = index >= 0 ? [...events] : [event, ...events];
      if (index >= 0) updated[index] = event;
      localStorage.setItem('fitai_pro_events', JSON.stringify(updated));
      return;
    }

    const payload = {
      id: event.id,
      trainer_id: event.trainerId,
      student_id: event.studentId,
      student_name: event.studentName,
      title: event.title,
      description: event.description,
      start_time: event.start,
      end_time: event.end,
      location: event.location,
      is_recurring: !!event.isRecurring,
      recurring_days: event.recurringDays || [],
      status: event.status || 'planned'
    };

    const { error } = await supabase.from('schedule_events').upsert(payload);
    if (error) throw error;
  },

  async deleteScheduleEvent(id: string): Promise<void> {
    if (!supabase) {
      const data = localStorage.getItem('fitai_pro_events');
      const events = data ? JSON.parse(data) : [];
      localStorage.setItem('fitai_pro_events', JSON.stringify(events.filter((e: any) => e.id !== id)));
      return;
    }
    await supabase.from('schedule_events').delete().eq('id', id);
  }
};
