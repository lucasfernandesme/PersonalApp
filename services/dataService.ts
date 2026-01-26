
import { createClient } from '@supabase/supabase-js';
import { Student } from "../types";
import { LibraryExercise, EXERCISES_DB } from "../constants/exercises";

// Estas variáveis serão injetadas pelo Vercel
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

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
    return data || [];
  },

  async saveStudent(student: Student): Promise<void> {
    if (!supabase) {
      const students = await this.getStudents();
      const index = students.findIndex(s => s.id === student.id);
      let updated = index >= 0 ? [...students] : [student, ...students];
      if (index >= 0) updated[index] = student;
      localStorage.setItem('fitai_pro_students', JSON.stringify(updated));
      return;
    }

    const { error } = await supabase
      .from('students')
      .upsert({
        id: student.id,
        name: student.name,
        email: student.email,
        avatar: student.avatar,
        goal: student.goal,
        experience: student.experience,
        injuries: student.injuries,
        equipment: student.equipment,
        program: student.program,
        history: student.history
      });

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
      return data ? JSON.parse(data) : EXERCISES_DB;
    }

    const { data } = await supabase.from('exercises').select('*');
    return data && data.length > 0 ? data : EXERCISES_DB;
  },

  async saveExercise(exercise: LibraryExercise): Promise<void> {
    if (!supabase) {
      const exercises = await this.getLibraryExercises();
      localStorage.setItem('fitai_pro_custom_exercises', JSON.stringify([...exercises, exercise]));
      return;
    }
    await supabase.from('exercises').insert(exercise);
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
  }
};
