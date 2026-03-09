import React, { useState } from 'react';
import type { Question, QuestionResult, StepResult, QuizStep } from '../types';
import { StepContext } from './StepContext';
import { StepSchema } from './StepSchema';
import { StepFormula } from './StepFormula';
import { EmojiStack } from './EmojiStack';

interface Props {
  questions: Question[];
  onComplete: (results: QuestionResult[]) => void;
}

type Phase = 'question' | 'explanation';

const STEP_LABELS: Record<QuizStep, string> = {
  context: 'ステップ1：じょうきょうはあく',
  schema: 'ステップ2：ずかいせんたく',
  formula: 'ステップ3：りっしきせんたく',
};

const STEP_ICONS: Record<QuizStep, string> = {
  context: '💬',
  schema: '🖼️',
  formula: '🔢',
};

export const QuizFlow: React.FC<Props> = ({ questions, onComplete }) => {
  const [qIdx, setQIdx] = useState(0);
  const [currentStep, setCurrentStep] = useState<QuizStep>('context');
  const [stepResults, setStepResults] = useState<StepResult[]>([]);
  const [phase, setPhase] = useState<Phase>('question');
  const [allResults, setAllResults] = useState<QuestionResult[]>([]);

  const q = questions[qIdx];
  const steps: QuizStep[] = ['context', 'schema', 'formula'];
  const stepIndex = steps.indexOf(currentStep);

  const handleStepAnswer = (correct: boolean, chosen: string) => {
    const result: StepResult = { step: currentStep, correct, chosen };
    const newStepResults = [...stepResults, result];
    setStepResults(newStepResults);

    // After the last step, show explanation
    if (stepIndex === steps.length - 1) {
      const questionResult: QuestionResult = {
        questionId: q.id,
        stepResults: newStepResults,
        allCorrect: newStepResults.every((r) => r.correct),
      };
      const updatedAll = [...allResults, questionResult];
      setAllResults(updatedAll);
      setTimeout(() => setPhase('explanation'), 400);
    } else {
      // Move to next step
      setTimeout(() => {
        setCurrentStep(steps[stepIndex + 1]);
      }, 800);
    }
  };

  const handleNext = () => {
    if (qIdx + 1 >= questions.length) {
      onComplete(allResults);
    } else {
      setQIdx(qIdx + 1);
      setCurrentStep('context');
      setStepResults([]);
      setPhase('question');
    }
  };

  const currentQuestionResult = allResults[allResults.length - 1];

  // ── Explanation screen ─────────────────────
  if (phase === 'explanation') {
    const allOk = currentQuestionResult?.allCorrect;
    return (
      <div
        style={{
          maxWidth: 680,
          margin: '0 auto',
          padding: '24px 16px',
        }}
      >
        {/* Result banner */}
        <div
          style={{
            textAlign: 'center',
            padding: '20px 0',
            marginBottom: 24,
            borderRadius: 20,
            background: allOk ? '#e8f5e9' : '#fff3e0',
            border: `3px solid ${allOk ? '#43a047' : '#fb8c00'}`,
          }}
        >
          <div style={{ fontSize: 48 }}>{allOk ? '🌟' : '📚'}</div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: allOk ? '#2e7d32' : '#e65100',
            }}
          >
            {allOk ? 'ぜんぶ せいかい！' : 'もんだいの かいせつ'}
          </div>
        </div>

        {/* Step summary */}
        <div
          style={{
            background: '#f5f5f5',
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div
            style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 }}
          >
            きみの こたえ：
          </div>
          {currentQuestionResult?.stepResults.map((r) => (
            <div
              key={r.step}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 8,
                fontSize: 18,
              }}
            >
              <span>{r.correct ? '⭕' : '❌'}</span>
              <span style={{ color: '#555' }}>
                {STEP_ICONS[r.step]} {STEP_LABELS[r.step]}
              </span>
            </div>
          ))}
        </div>

        {/* Explanation text */}
        <div
          style={{
            background: '#e3f2fd',
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            fontSize: 20,
            lineHeight: 1.8,
            color: '#0d47a1',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>📖 かいせつ</div>
          {q.explanation}
        </div>

        {/* Correct schema visual */}
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#555',
              marginBottom: 12,
            }}
          >
            ✅ ただしい ずかい
          </div>
          <div style={{ display: 'inline-block' }}>
            <EmojiStack option={q.steps.schema.options[q.steps.schema.correctIndex]} />
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 32,
              fontWeight: 'bold',
              fontFamily: 'monospace',
              color: '#1565c0',
              letterSpacing: 2,
            }}
          >
            {q.steps.formula.correct}
          </div>
        </div>

        {/* Next button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleNext}
            style={{
              padding: '18px 64px',
              fontSize: 26,
              fontWeight: 'bold',
              borderRadius: 40,
              border: 'none',
              background: 'linear-gradient(135deg, #66bb6a, #2e7d32)',
              color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(46,125,50,0.4)',
            }}
          >
            {qIdx + 1 >= questions.length ? '🏁 けっかをみる' : 'つぎの もんだい →'}
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz screen ────────────────────────────
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px' }}>
      {/* Progress */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 18, color: '#555' }}>
          もんだい {qIdx + 1} / {questions.length}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {steps.map((s, i) => (
            <div
              key={s}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background:
                  i < stepIndex
                    ? '#43a047'
                    : i === stepIndex
                    ? '#ff8f00'
                    : '#e0e0e0',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 8,
          background: '#e0e0e0',
          borderRadius: 4,
          marginBottom: 20,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${((qIdx * 3 + stepIndex) / (questions.length * 3)) * 100}%`,
            background: 'linear-gradient(90deg, #42a5f5, #1565c0)',
            borderRadius: 4,
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* Step label */}
      <div
        style={{
          textAlign: 'center',
          padding: '8px 20px',
          background: '#e3f2fd',
          borderRadius: 30,
          display: 'inline-block',
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1565c0',
          marginBottom: 20,
          marginLeft: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {STEP_ICONS[currentStep]} {STEP_LABELS[currentStep]}
      </div>

      {/* Question text */}
      <div
        style={{
          background: '#fffde7',
          border: '3px solid #ffe082',
          borderRadius: 20,
          padding: '20px 24px',
          fontSize: 24,
          lineHeight: 1.8,
          color: '#333',
          marginBottom: 28,
          fontWeight: 'bold',
        }}
      >
        {q.text}
      </div>

      {/* Step content */}
      {currentStep === 'context' && (
        <StepContext step={q.steps.context} onAnswer={handleStepAnswer} />
      )}
      {currentStep === 'schema' && (
        <StepSchema step={q.steps.schema} onAnswer={handleStepAnswer} />
      )}
      {currentStep === 'formula' && (
        <StepFormula step={q.steps.formula} onAnswer={handleStepAnswer} />
      )}
    </div>
  );
};
