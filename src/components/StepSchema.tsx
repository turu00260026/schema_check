import React, { useMemo, useState } from 'react';
import { shuffleWithIndex } from '../utils/shuffle';
import { EmojiStack } from './EmojiStack';
import type { SchemaStep } from '../types';

interface Props {
  step: SchemaStep;
  onAnswer: (correct: boolean, chosen: string) => void;
}

export const StepSchema: React.FC<Props> = ({ step, onAnswer }) => {
  const { shuffled, originalIndices } = useMemo(
    () => shuffleWithIndex(step.options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step.question]
  );

  const [selectedNew, setSelectedNew] = useState<number | null>(null); // shuffled index
  const [confirmed, setConfirmed] = useState(false);

  const correctNewIndex = originalIndices.indexOf(step.correctIndex);

  const handleSelect = (newIdx: number) => {
    if (confirmed) return;
    setSelectedNew(newIdx);
  };

  const handleConfirm = () => {
    if (selectedNew === null) return;
    setConfirmed(true);
    const isCorrect = originalIndices[selectedNew] === step.correctIndex;
    setTimeout(() => {
      onAnswer(isCorrect, shuffled[selectedNew].description);
    }, 700);
  };

  const borderColor = (newIdx: number) => {
    if (!confirmed) return selectedNew === newIdx ? '#ff8f00' : '#e0e0e0';
    if (newIdx === correctNewIndex) return '#43a047';
    if (newIdx === selectedNew) return '#e53935';
    return '#e0e0e0';
  };

  const bgColor = (newIdx: number) => {
    if (!confirmed) return selectedNew === newIdx ? '#fff8e1' : '#fafafa';
    if (newIdx === correctNewIndex) return '#e8f5e9';
    if (newIdx === selectedNew) return '#ffebee';
    return '#fafafa';
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
        {shuffled.map((opt, newIdx) => (
          <button
            key={newIdx}
            onClick={() => handleSelect(newIdx)}
            disabled={confirmed}
            style={{
              padding: 12,
              borderRadius: 20,
              border: `3px solid ${borderColor(newIdx)}`,
              background: bgColor(newIdx),
              cursor: confirmed ? 'default' : 'pointer',
              transition: 'all 0.2s',
              boxShadow:
                selectedNew === newIdx
                  ? '0 4px 12px rgba(255,143,0,0.3)'
                  : '0 2px 6px rgba(0,0,0,0.08)',
            }}
          >
            <EmojiStack option={opt} compact />
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                color: '#555',
                maxWidth: 160,
                textAlign: 'center',
              }}
            >
              {opt.description}
            </div>
          </button>
        ))}
      </div>

      {selectedNew !== null && !confirmed && (
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
            color: originalIndices[selectedNew!] === step.correctIndex ? '#2e7d32' : '#c62828',
            marginTop: 8,
          }}
        >
          {originalIndices[selectedNew!] === step.correctIndex
            ? '⭕ せいかい！'
            : '❌ ちがうよ'}
        </div>
      )}
    </div>
  );
};
