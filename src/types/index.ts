// ============================================================
// EmojiStack Schema types
// ============================================================
export type SchemaStyle =
  | 'merge' | 'remove' | 'compare' | 'reverse'
  | 'groups' | 'tape' | 'hitsuzan'
  | 'divide-equal' | 'divide-group' | 'remainder' | 'fraction' | 'decimal' | 'tape-reverse';

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
  removeLabel?: string;    // custom label for remove style
  unknownSide?: 'left' | 'right'; // used in reverse
  groupCount?: number;     // used in groups: number of groups
  multiplier?: number;     // used in tape: multiplication factor
  // used in hitsuzan:
  hitsuzanTop?: number;      // top number in column calc
  hitsuzanBottom?: number;   // bottom number
  hitsuzanOp?: '+' | '-';   // operation
  hitsuzanCarry?: boolean;   // show くり上がり mark (①) above tens
  hitsuzanBorrow?: boolean;  // show くり下がり mark above tens
  hitsuzanMisalign?: boolean;// bottom number misaligned (distractor)
  hitsuzanResult?: string;   // result to display (e.g. "61", "51", "？")
  // used in divide-equal / divide-group / remainder:
  divideTotal?: number;      // total items
  divideBy?: number;         // number of groups (equal) or group size (group)
  divideGroupSize?: number;  // items per group (for divide-group)
  divideQuotient?: number;   // quotient (for remainder)
  divideRemainder?: number;  // remainder (for remainder)
  divideEmoji?: string;      // emoji to display items
  divideShowEach?: number;   // override items per group shown
  // used in fraction:
  fractionNumerator?: number;
  fractionDenominator?: number;
  fractionEmoji?: string;
  fractionHighlight?: number; // how many cells to highlight
  // used in decimal:
  decimalValue?: string;     // e.g. "1.3"
  decimalMin?: string;       // number line left end
  decimalMax?: string;       // number line right end
  decimalWrong?: string;     // wrong value shown (distractor)
  // used in tape-reverse:
  tapeBase?: number;
  tapeBaseLabel?: string;
  tapeCompare?: number;
  tapeCompareLabel?: string;
  tapeUnit?: string;         // unit label (e.g. "cm")
  tapeTimes?: number;        // multiplier (how many times)
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
  correct: string[];   // 複数正解に対応（例：["7 ＋ 3", "3 ＋ 7"]）
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
