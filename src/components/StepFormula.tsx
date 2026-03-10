import React, { useMemo, useState } from 'react';
import { shuffleWithIndex } from '../utils/shuffle';
import type { FormulaStep } from '../types';

interface Props {
  step: FormulaStep;
  onAnswer: (correct: boolean, chosen: string) => void;
}

export const StepFormula: React.FC<Props> = ({ step, onAnswer }) => {
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
      onAnswer(step.correct.includes(selected), selected);
    }, 600);
  };

  const buttonStyle = (opt: string): React.CSSProperties => {
    let border = '3px solid #bbb';
    let bg = '#ffffff';
    let color = '#222';

    if (!confirmed) {
      if (selected === opt) {
        border = '3px solid #ff8f00';
        bg = '#fff8e1';
      }
    } else {
      if (step.correct.includes(opt)) {
        border = '3px solid #43a047';
        bg = '#e8f5e9';
      } else if (opt === selected) {
        border = '3px solid #e53935';
        bg = '#ffebee';
      }
    }

    return {
      padding: '16px 28px',
      fontSize: 30,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      borderRadius: 16,
      border,
      background: bg,
      color,
      cursor: confirmed ? 'default' : 'pointer',
      minWidth: 160,
      letterSpacing: 2,
      transition: 'all 0.2s',
      boxShadow:
        selected === opt
          ? '0 4px 12px rgba(255,143,0,0.3)'
          : '0 2px 6px rgba(0,0,0,0.08)',
    };
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
          <button key={opt} onClick={() => handleSelect(opt)} disabled={confirmed} style={buttonStyle(opt)}>
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
            color: step.correct.includes(selected ?? '') ? '#2e7d32' : '#c62828',
            marginTop: 8,
          }}
        >
          {step.correct.includes(selected ?? '') ? '⭕ せいかい！' : '❌ ちがうよ'}
        </div>
      )}
    </div>
  );
};
