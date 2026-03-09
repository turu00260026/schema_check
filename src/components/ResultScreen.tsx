import React from 'react';
import type { QuestionResult, QuizStep, TestRecord } from '../types';
import { storage } from '../utils/storage';

interface Props {
  results: QuestionResult[];
  grade: number;
  onRetry: () => void;
  onHome: () => void;
}

type StepKey = QuizStep;

const STEP_LABELS: Record<StepKey, string> = {
  context: 'じょうきょうはあく',
  schema: 'ずかいせんたく',
  formula: 'りっしきせんたく',
};

const STEP_EMOJI: Record<StepKey, string> = {
  context: '💬',
  schema: '🖼️',
  formula: '🔢',
};

function buildStepStats(results: QuestionResult[]) {
  const stats: Record<StepKey, { correct: number; total: number }> = {
    context: { correct: 0, total: 0 },
    schema: { correct: 0, total: 0 },
    formula: { correct: 0, total: 0 },
  };
  for (const qr of results) {
    for (const sr of qr.stepResults) {
      stats[sr.step].total++;
      if (sr.correct) stats[sr.step].correct++;
    }
  }
  return stats;
}

function pct(c: number, t: number) {
  if (t === 0) return 0;
  return Math.round((c / t) * 100);
}

function barColor(p: number) {
  if (p >= 80) return '#43a047';
  if (p >= 50) return '#ffa726';
  return '#ef5350';
}

export const ResultScreen: React.FC<Props> = ({ results, grade, onRetry, onHome }) => {
  const score = results.filter((r) => r.allCorrect).length;
  const total = results.length;
  const stepStats = buildStepStats(results);
  const steps: StepKey[] = ['context', 'schema', 'formula'];

  // Save record
  React.useEffect(() => {
    const record: TestRecord = {
      id: `${Date.now()}`,
      grade,
      date: new Date().toISOString(),
      results,
      score,
      totalQuestions: total,
      stepStats,
    };
    storage.saveTestRecord(record);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const starCount = score === total ? 3 : score >= total / 2 ? 2 : 1;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px', textAlign: 'center' }}>
      {/* Stars */}
      <div style={{ fontSize: 56, marginBottom: 8 }}>
        {'⭐'.repeat(starCount)}{'☆'.repeat(3 - starCount)}
      </div>

      <div
        style={{
          fontSize: 32,
          fontWeight: 'bold',
          color: '#1a237e',
          marginBottom: 8,
        }}
      >
        {score === total ? 'かんぺき！すごい！' : score >= total / 2 ? 'よくできました！' : 'もういちど がんばろう！'}
      </div>

      <div style={{ fontSize: 48, fontWeight: 'bold', color: '#e65100', marginBottom: 24 }}>
        {score} / {total} もんせいかい
      </div>

      {/* Step breakdown */}
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: 20,
          marginBottom: 24,
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{ fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16 }}
        >
          ステップべつ せいかいりつ
        </div>
        {steps.map((s) => {
          const { correct, total: t } = stepStats[s];
          const p = pct(correct, t);
          return (
            <div key={s} style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 18,
                  marginBottom: 4,
                }}
              >
                <span>
                  {STEP_EMOJI[s]} {STEP_LABELS[s]}
                </span>
                <span style={{ fontWeight: 'bold', color: barColor(p) }}>
                  {correct}/{t} ({p}%)
                </span>
              </div>
              <div
                style={{
                  height: 14,
                  background: '#e0e0e0',
                  borderRadius: 7,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${p}%`,
                    background: barColor(p),
                    borderRadius: 7,
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Individual question results */}
      <div
        style={{
          background: '#fafafa',
          borderRadius: 20,
          padding: 16,
          marginBottom: 24,
          textAlign: 'left',
        }}
      >
        <div
          style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 }}
        >
          もんだいべつ けっか
        </div>
        {results.map((r, i) => (
          <div
            key={r.questionId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 6,
              fontSize: 18,
            }}
          >
            <span style={{ color: '#888', minWidth: 32 }}>{i + 1}.</span>
            {r.stepResults.map((sr) => (
              <span key={sr.step} title={STEP_LABELS[sr.step]}>
                {sr.correct ? '⭕' : '❌'}
              </span>
            ))}
            <span style={{ fontSize: 14, color: '#888' }}>
              {r.allCorrect ? 'ぜんぶ○' : ''}
            </span>
          </div>
        ))}
        <div style={{ fontSize: 13, color: '#aaa', marginTop: 8 }}>
          ⭕/❌ の じゅんばん：じょうきょう → ず → しき
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={onRetry}
          style={{
            padding: '16px 40px',
            fontSize: 22,
            fontWeight: 'bold',
            borderRadius: 40,
            border: 'none',
            background: 'linear-gradient(135deg, #42a5f5, #1565c0)',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(21,101,192,0.4)',
          }}
        >
          🔄 もう一度
        </button>
        <button
          onClick={onHome}
          style={{
            padding: '16px 40px',
            fontSize: 22,
            fontWeight: 'bold',
            borderRadius: 40,
            border: '3px solid #1565c0',
            background: '#fff',
            color: '#1565c0',
            cursor: 'pointer',
          }}
        >
          🏠 ホームへ
        </button>
      </div>
    </div>
  );
};
