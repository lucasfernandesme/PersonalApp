
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

export interface StudentFile {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'doc';
  url: string;
  date: string;
}

export interface Student {
  id: string;
  files?: StudentFile[];
  name: string;
  email: string;
  cpf?: string;
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
  notes?: string;
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
  files?: StudentFile[];
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
  recurringDays?: number[]; // 0=Sunday, 1=Monday...
  recurringMonths?: number[]; // 0=January...
  status: 'planned' | 'completed' | 'cancelled';
}
