import React, { useMemo, useState } from 'react';
import { shuffleWithIndex } from '../utils/shuffle';
import type { ContextStep } from '../types';

interface Props {
  step: ContextStep;
  onAnswer: (correct: boolean, chosen: string) => void;
}

export const StepContext: React.FC<Props> = ({ step, onAnswer }) => {
  const { shuffled } = useMemo(
    () => shuffleWithIndex(step.options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step.question]
  );

  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleSelect = (opt: string) => {
    if (confirmed) return;
    setSelected(opt);
  };

  const handleConfirm = () => {
    if (!selected) return;
    setConfirmed(true);
    setTimeout(() => {
      onAnswer(selected === step.correct, selected);
    }, 600);
  };

  const buttonColor = (opt: string) => {
    if (!confirmed) {
      return selected === opt ? '#ff8f00' : '#ffffff';
    }
    if (opt === step.correct) return '#66bb6a';
    if (opt === selected) return '#ef5350';
    return '#ffffff';
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <p
        style={{
          fontSize: 22,
          fontWeight: 'bold',
          color: '#1a237e',
          marginBottom: 24,
          lineHeight: 1.6,
        }}
      >
        {step.question}
      </p>

      <div
        style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: 24,
        }}
      >
        {shuffled.map((opt) => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            disabled={confirmed}
            style={{
              padding: '16px 32px',
              fontSize: 26,
              fontWeight: 'bold',
              borderRadius: 16,
              border: `3px solid ${selected === opt ? '#ff8f00' : '#bbb'}`,
              background: buttonColor(opt),
              color: '#222',
              cursor: confirmed ? 'default' : 'pointer',
              minWidth: 140,
              transition: 'all 0.2s',
              boxShadow: selected === opt ? '0 4px 12px rgba(255,143,0,0.4)' : '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      {selected && !confirmed && (
        <button
          onClick={handleConfirm}
          style={{
            padding: '14px 48px',
            fontSize: 24,
            fontWeight: 'bold',
            borderRadius: 40,
            border: 'none',
            background: 'linear-gradient(135deg, #42a5f5, #1565c0)',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(21,101,192,0.4)',
          }}
        >
          これにする！
        </button>
      )}

      {confirmed && (
        <div
          style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: selected === step.correct ? '#2e7d32' : '#c62828',
            marginTop: 8,
          }}
        >
          {selected === step.correct ? '⭕ せいかい！' : '❌ ちがうよ'}
        </div>
      )}
    </div>
  );
};
