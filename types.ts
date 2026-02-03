
export enum UserRole {
  TRAINER = 'TRAINER',
  STUDENT = 'STUDENT'
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  surname?: string;
  instagram?: string;
  whatsapp?: string;
  cref?: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string | number;
  rpe?: number;
  rest: string;
  notes?: string;
  videoUrl?: string;
}

export interface WorkoutDay {
  day: string;
  label: string;
  exercises: Exercise[];
}

export interface TrainingProgram {
  id: string;
  name: string;
  split: WorkoutDay[];
  frequency: number;
  goal: string;
  difficulty?: 'adaptation' | 'beginner' | 'intermediate' | 'advanced';
  startDate?: string;
  endDate?: string;
  aiSuggestedChanges?: string;
  observations?: string;
}

export interface WorkoutFolder {
  id: string;
  name: string;
  trainerId?: string;
  createdAt?: string;
}

export interface WorkoutTemplate extends Omit<TrainingProgram, 'startDate'> {
  // Templates de treinos para a biblioteca
  category?: string;
  folderId?: string | null;
  trainerId?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  birthDate?: string;
  height?: string;
  weight?: string;
  avatar: string;
  goal: string;
  gender: 'male' | 'female' | 'other';
  experience: 'beginner' | 'intermediate' | 'advanced';
  injuries: string[];
  equipment: string[];
  program?: TrainingProgram;
  programs?: TrainingProgram[];
  isActive?: boolean;
  trainerId?: string;
  trainerName?: string;
  trainerAvatar?: string;
  trainerInstagram?: string;
  trainerWhatsapp?: string;
  history: {
    date: string;
    rpe_avg: number;
    completion: number;
    weights?: Record<string, string>;
  }[];
}

export interface OnboardingData {
  name: string;
  goal: string;
  experience: string;
  injuries: string;
  frequency: number;
  equipment: string;
  observations?: string;
}

export interface ScheduleEvent {
  id: string;
  trainerId: string;
  studentId?: string; // Optional link to a registered student
  studentName?: string; // For searching/displaying if not fully linked or just a name
  title: string;
  description?: string;
  start: string; // ISO string
  end: string; // ISO string
  location?: string;
  isRecurring?: boolean;
  status: 'planned' | 'completed' | 'cancelled';
}
