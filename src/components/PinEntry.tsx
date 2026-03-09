import React, { useState } from 'react';

interface Props {
  mode: 'set' | 'verify';
  onSuccess: (pin: string) => void;
  onCancel: () => void;
}

export const PinEntry: React.FC<Props> = ({ mode, onSuccess, onCancel }) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState('');

  const handleDigit = (d: string) => {
    setError('');
    const next = [...digits];
    const emptyIdx = next.findIndex((x) => x === '');
    if (emptyIdx === -1) return;
    next[emptyIdx] = d;
    setDigits(next);
    if (next.every((x) => x !== '')) {
      onSuccess(next.join(''));
    }
  };

  const handleDelete = () => {
    setError('');
    const next = [...digits];
    for (let i = next.length - 1; i >= 0; i--) {
      if (next[i] !== '') {
        next[i] = '';
        break;
      }
    }
    setDigits(next);
  };

  const filled = digits.filter((x) => x !== '').length;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 24,
        padding: 32,
        maxWidth: 360,
        margin: '0 auto',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
      <div style={{ fontSize: 22, fontWeight: 'bold', color: '#1a237e', marginBottom: 4 }}>
        {mode === 'set' ? '4けたの あんしょうばんごうを きめてください' : '4けたの あんしょうばんごうを にゅうりょく'}
      </div>
      {mode === 'set' && (
        <div style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>
          おや専用ダッシュボードに アクセスするための番号です
        </div>
      )}

      {/* Dots */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          margin: '24px 0',
        }}
      >
        {digits.map((d, i) => (
          <div
            key={i}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: `3px solid ${i < filled ? '#1565c0' : '#ccc'}`,
              background: i < filled ? '#e3f2fd' : '#fafafa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 'bold',
              color: '#1565c0',
            }}
          >
            {d !== '' ? '●' : ''}
          </div>
        ))}
      </div>

      {error && (
        <div style={{ color: '#c62828', fontSize: 18, marginBottom: 12 }}>{error}</div>
      )}

      {/* Numpad */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          maxWidth: 280,
          margin: '0 auto 20px',
        }}
      >
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((d, i) => (
          <button
            key={i}
            onClick={() => {
              if (d === '⌫') handleDelete();
              else if (d !== '') handleDigit(d);
            }}
            disabled={d === ''}
            style={{
              padding: '16px 0',
              fontSize: 28,
              fontWeight: 'bold',
              borderRadius: 14,
              border: '2px solid #e0e0e0',
              background: d === '' ? 'transparent' : '#f5f5f5',
              cursor: d === '' ? 'default' : 'pointer',
              color: '#333',
              visibility: d === '' ? 'hidden' : 'visible',
              transition: 'background 0.15s',
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#e3f2fd';
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f5';
            }}
          >
            {d}
          </button>
        ))}
      </div>

      <button
        onClick={onCancel}
        style={{
          background: 'none',
          border: 'none',
          color: '#888',
          fontSize: 18,
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
      >
        キャンセル
      </button>
    </div>
  );
};
