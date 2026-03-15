import type { GradeData } from '../types';

/**
 * Statically import all grade JSON files.
 * To add a new grade: drop a gradeN.json into src/data/questions/
 * and add it to the GRADE_FILES map below — no other changes needed.
 */
import grade1 from '../data/questions/grade1.json';
import grade2 from '../data/questions/grade2.json';
import grade3 from '../data/questions/grade3.json';

const GRADE_FILES: Record<string, GradeData> = {
  grade1: grade1 as GradeData,
  grade2: grade2 as GradeData,
  grade3: grade3 as GradeData,
};

export function loadAllGrades(): GradeData[] {
  return Object.values(GRADE_FILES).sort((a, b) => a.grade - b.grade);
}

export function loadGrade(grade: number): GradeData | undefined {
  return Object.values(GRADE_FILES).find((g) => g.grade === grade);
}
