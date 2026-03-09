// ============================================================
// EmojiStack Schema types
// ============================================================
export type SchemaStyle = 'merge' | 'remove' | 'compare' | 'reverse';

export interface EmojiGroup {
  base: string;
  count: number;
  overlay?: string;
  label?: string;
}

export interface SchemaOption {
  style: SchemaStyle;
  description: string;
  left: EmojiGroup;
  right?: EmojiGroup;      // used in merge / compare
  removeCount?: number;    // used in remove: how many to cross out
  unknownSide?: 'left' | 'right'; // used in reverse
}

// ============================================================
// Quiz question structure
// ============================================================
export interface ContextStep {
  question: string;
  correct: string;
  options: string[];
}

export interface SchemaStep {
  question: string;
  correctIndex: number; // index into options array
  options: SchemaOption[];
}

export interface FormulaStep {
  question: string;
  correct: string;
  options: string[];
}

export interface Question {
  id: string;
  text: string;
  intent: string;
  explanation: string;
  steps: {
    context: ContextStep;
    schema: SchemaStep;
    formula: FormulaStep;
  };
}

export interface GradeData {
  grade: number;
  label: string;
  questions: Question[];
}

// ============================================================
// Quiz session / progress
// ============================================================
export type QuizStep = 'context' | 'schema' | 'formula';

export interface StepResult {
  step: QuizStep;
  correct: boolean;
  chosen: string;
}

export interface QuestionResult {
  questionId: string;
  stepResults: StepResult[];
  allCorrect: boolean;
}

export interface TestRecord {
  id: string;
  grade: number;
  date: string; // ISO string
  results: QuestionResult[];
  score: number;          // number of fully correct questions
  totalQuestions: number;
  stepStats: {
    context: { correct: number; total: number };
    schema: { correct: number; total: number };
    formula: { correct: number; total: number };
  };
}

// ============================================================
// LocalStorage shape
// ============================================================
export interface AppStorage {
  childName: string;
  pin: string | null;          // 4-digit PIN for parent dashboard
  testHistory: TestRecord[];
}
