
export enum AppState {
  AUTH,
  DASHBOARD,
  HISTORY,
  SETUP,
  GENERATING,
  INTERVIEW,
  ANALYZING,
  FEEDBACK,
  COMPLETE,
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export enum InterviewType {
  HR = "Human Resources",
  TECHNICAL = "Technical",
  PANEL = "Panel Interview",
}

export enum InterviewDifficulty {
  EASY = "Easy",
  MEDIUM = "Medium",
  HARD = "Hard",
  EXPERT = "Expert",
}

export enum SupportedLanguage {
  ENGLISH = "English",
  HINDI = "Hindi",
  SPANISH = "Spanish",
  FRENCH = "French",
  GERMAN = "German",
  CHINESE = "Chinese",
  JAPANESE = "Japanese",
}

export interface JobDetails {
  jobTitle: string;
  skills: string[];
  responsibilities: string[];
}

export interface InterviewQuestion {
  question: string;
  persona: string;
  keywords: string[];
}

export interface AnswerFeedback {
  strengths: string[];
  weaknesses: string[];
  idealAnswer: string;
  spokenFeedback: string;
  score: number;
  rating: 'Beginner' | 'Intermediate' | 'Advanced';
  matchedKeywords: string[];
  missedKeywords: string[];
}

export interface InterviewResult {
  question: InterviewQuestion;
  answer: string;
  feedback: AnswerFeedback;
  isSkipped?: boolean;
}

export interface SavedInterviewSession {
  id: string;
  userId: string;
  date: string;
  jobTitle: string;
  interviewType: InterviewType;
  difficulty: InterviewDifficulty;
  language: SupportedLanguage;
  results: InterviewResult[];
}
