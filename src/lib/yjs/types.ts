export type Difficulty = 1 | 2 | 3 | 4 | 5;

export enum GamePhase {
  Waiting = "waiting",
  Settings = "settings",
  Question = "question",
  Results = "results",
  Finished = "finished",
}

export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  joinedAt: number;
}

export interface Answer {
  playerId: string;
  value: number;
  submittedAt: number;
}

export interface Question {
  id: string;
  text: string;
  correctAnswer: number;
  theme: string;
  difficulty: Difficulty;
  generatedAt: number;
}

export interface GameState {
  pin: string;
  phase: GamePhase;
  hostId: string;
  theme: string | null;
  difficulty: Difficulty | null;
  currentQuestion: Question | null;
  roundNumber: number;
  nextPickerId: string | null;
}
