export interface Player {
  id: string;
  name: string;
  avatar: string; // Corresponds to key in avatars map
  score: number;
}

export interface TriviaQuestion {
  question: string;
  answer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GameHistoryEntry {
  question: string;
  category: string;
  correctAnswer: string;
  players: {
    name: string;
    answer: string;
    isCorrect: boolean;
  }[];
}

export interface Game {
  id: string;
  players: Player[];
  questions: TriviaQuestion[];
  history: GameHistoryEntry[];
  status: 'in-progress' | 'finished';
  createdAt: { seconds: number; nanoseconds: number }; // Serialized Firestore Timestamp
}
