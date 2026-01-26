
export interface LibraryExercise {
  name: string;
  category: string;
  videoUrl?: string; 
}

export const EXERCISES_DB: LibraryExercise[] = [
  // Peito
  { 
    name: 'Supino Reto com Barra', 
    category: 'Peito', 
    videoUrl: 'https://media.giphy.com/media/l3q2K8vT2KzNf1WKs/giphy.gif' 
  },
  { 
    name: 'Supino Inclinado com Halteres', 
    category: 'Peito', 
    videoUrl: 'https://media.giphy.com/media/3o7TKL9p7S0wI8uB9y/giphy.gif' 
  },
  { 
    name: 'Crucifixo Reto', 
    category: 'Peito',
    videoUrl: 'https://media.giphy.com/media/l3q2K8vT2KzNf1WKs/giphy.gif'
  },
  { 
    name: 'Peck Deck (Voador)', 
    category: 'Peito', 
    videoUrl: 'https://media.giphy.com/media/l3q2K8vT2KzNf1WKs/giphy.gif' 
  },

  // Costas
  { 
    name: 'Puxada Aberta na Frente', 
    category: 'Costas', 
    videoUrl: 'https://media.giphy.com/media/3o7TKL8S72yW2yW2yW/giphy.gif' 
  },
  { 
    name: 'Remada Curvada com Barra', 
    category: 'Costas',
    videoUrl: 'https://media.giphy.com/media/3o7TKL9p7S0wI8uB9y/giphy.gif'
  },
  { 
    name: 'Remada Baixa (Triângulo)', 
    category: 'Costas', 
    videoUrl: 'https://media.giphy.com/media/3o7TKL8S72yW2yW2yW/giphy.gif' 
  },

  // Pernas
  { 
    name: 'Agachamento Livre', 
    category: 'Pernas', 
    videoUrl: 'https://media.giphy.com/media/3o7TKL9p7S0wI8uB9y/giphy.gif' 
  },
  { 
    name: 'Leg Press 45', 
    category: 'Pernas',
    videoUrl: 'https://media.giphy.com/media/l3q2K8vT2KzNf1WKs/giphy.gif'
  },
  { 
    name: 'Cadeira Extensora', 
    category: 'Pernas', 
    videoUrl: 'https://media.giphy.com/media/l3q2K8vT2KzNf1WKs/giphy.gif' 
  },

  // Ombros
  { 
    name: 'Desenvolvimento com Halteres', 
    category: 'Ombros', 
    videoUrl: 'https://media.giphy.com/media/l3q2K8vT2KzNf1WKs/giphy.gif' 
  },
  { 
    name: 'Elevação Lateral', 
    category: 'Ombros', 
    videoUrl: 'https://media.giphy.com/media/l3q2K8vT2KzNf1WKs/giphy.gif' 
  },

  // Braços
  { 
    name: 'Tríceps Corda', 
    category: 'Braços', 
    videoUrl: 'https://media.giphy.com/media/l3q2K8vT2KzNf1WKs/giphy.gif' 
  },
  { 
    name: 'Rosca Direta com Barra', 
    category: 'Braços', 
    videoUrl: 'https://media.giphy.com/media/3o7TKL9p7S0wI8uB9y/giphy.gif' 
  },

  // Core
  { 
    name: 'Prancha Isométrica', 
    category: 'Core', 
    videoUrl: 'https://media.giphy.com/media/3o7TKL8S72yW2yW2yW/giphy.gif' 
  },
];

export const CATEGORIES = ['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core'];
