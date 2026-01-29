
import { createClient } from '@supabase/supabase-js';
import { Student, WorkoutFolder, WorkoutTemplate } from "../types";
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
  async getStudents(): Promise<Student[]> {
    if (!supabase) {
      const data = localStorage.getItem('fitai_pro_students');
      return data ? JSON.parse(data) : [];
    }

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('name');

    if (error) {
      console.error("Erro Supabase:", error);
      return [];
    }
    return (data || []).map(s => ({
      ...s,
      phone: s.phone || '',
      birthDate: s.birth_date || '',
      gender: s.gender || '',
      isActive: s.is_active !== false,
      height: s.height || '',
      weight: s.weight || ''
    }));
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
      programs: student.programs,
      history: student.history
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
  async getLibraryExercises(): Promise<LibraryExercise[]> {
    if (!supabase) {
      const data = localStorage.getItem('fitai_pro_custom_exercises');
      const custom = data ? JSON.parse(data) : [];
      return [...EXERCISES_DB, ...custom];
    }

    const { data, error } = await supabase.from('exercises').select('*');
    if (error) {
      console.error("Erro ao buscar exercícios:", error);
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
      const trainers = JSON.parse(localStorage.getItem('fitai_pro_trainers') || '[]');
      return trainers.find((t: any) => t.email === email) || null;
    }

    const { data } = await supabase
      .from('trainers')
      .select('*')
      .eq('email', email)
      .single();

    return data;
  },

  // --- TEMPLATES DE TREINO ---
  async getWorkoutFolders(): Promise<WorkoutFolder[]> {
    if (!supabase) {
      const data = localStorage.getItem('fitai_pro_workout_folders');
      return data ? JSON.parse(data) : [];
    }
    const { data, error } = await supabase.from('workout_folders').select('*');
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

  async getWorkoutTemplates(): Promise<WorkoutTemplate[]> {
    if (!supabase) {
      const data = localStorage.getItem('fitai_pro_workout_templates');
      return data ? JSON.parse(data) : [];
    }
    const { data, error } = await supabase.from('workout_templates').select('*');
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
  }
};
