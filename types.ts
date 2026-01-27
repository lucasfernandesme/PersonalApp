
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
  startDate?: string;
  aiSuggestedChanges?: string;
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
  experience: 'beginner' | 'intermediate' | 'advanced';
  injuries: string[];
  equipment: string[];
  program?: TrainingProgram;
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
