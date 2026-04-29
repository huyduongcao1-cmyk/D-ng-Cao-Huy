export type Difficulty = 'nhan_biet' | 'thong_hieu' | 'van_dung';
export type QuestionType = 'ly_thuyet' | 'thi_nghiem';
export type Chapter = 'chuong_4' | 'chuong_5' | 'chuong_6' | 'mixed';
export type GameMode = 'single' | '1v1' | '2v2';

export interface UserInfo {
  fullName: string;
  className: string;
}

export interface LabConfig {
  chemical_1: string;
  chemical_2?: string;
  effect: 'color_change' | 'precipitate' | 'gas' | 'none';
  color?: string; // Color hex for result
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correct: string;
  explanation?: string;
  type: QuestionType;
  difficulty: Difficulty;
  chapter: Chapter;
  lab?: LabConfig;
}

export type GodId = 'wisdom' | 'gamble' | 'speed' | 'protect' | 'destroy' | 'chaos' | 'freeze' | 'luck' | 'vampire' | 'prophecy';

export interface GodConfig {
  id: GodId;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface PlayerState {
  id: string;
  name: string;
  gold: number;
  score: number;
  correctAnswers: number;
  totalAnswered: number;
  activeGods: GodId[];
  isFrozen?: boolean;
}

export interface GameState {
  mode: GameMode;
  chapter: Chapter;
  round: number;
  turnIndex: number; // For hotseat mode, 0 = p1, 1 = p2
  players: PlayerState[];
  status: 'menu' | 'playing' | 'god_selection' | 'finished';
  remainingQuestions: Record<string, Question[]>; // Player ID -> Queue of questions
  currentQuestion?: Question;
  questionsAnsweredThisRound: number; // Counter for current turn
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  className: string;
  gold: number;
  correct: number;
  accuracy: number;
  mode: GameMode;
  chapter: Chapter;
  date: number;
}
