/**
 * フィードバックデータの一括エクスポート
 */

export type { GradeFeedback, SchemaFeedback } from './grade1Feedback';
export { default as grade1Feedback } from './grade1Feedback';
export { default as grade2Feedback } from './grade2Feedback';
export { default as grade3Feedback } from './grade3Feedback';

import grade1Feedback from './grade1Feedback';
import grade2Feedback from './grade2Feedback';
import grade3Feedback from './grade3Feedback';
import type { GradeFeedback } from './grade1Feedback';

export const ALL_FEEDBACK: GradeFeedback[] = [grade1Feedback, grade2Feedback, grade3Feedback];

export function getFeedbackForGrade(grade: number): GradeFeedback | undefined {
  return ALL_FEEDBACK.find((f) => f.grade === grade);
}
