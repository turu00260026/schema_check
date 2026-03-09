import React from 'react';
import type { SchemaOption, SchemaStyle } from '../types';

// ─────────────────────────────────────────────
// Single emoji cell with optional overlay
// ─────────────────────────────────────────────
interface EmojiCellProps {
  base: string;
  overlay?: string;
  size?: number;
}

const EmojiCell: React.FC<EmojiCellProps> = ({ base, overlay, size = 32 }) => (
  <span
    style={{
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      margin: 2,
    }}
  >
    <span style={{ fontSize: size * 0.8 }}>{base}</span>
    {overlay && (
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.9,
          lineHeight: 1,
        }}
      >
        {overlay}
      </span>
    )}
  </span>
);

// ─────────────────────────────────────────────
// Row of emojis (wrapping)
// ─────────────────────────────────────────────
interface EmojiRowProps {
  base: string;
  count: number;
  overlay?: string;
  overlayFrom?: number; // start overlaying from this index
  size?: number;
  label?: string;
}

const EmojiRow: React.FC<EmojiRowProps> = ({
  base,
  count,
  overlay,
  overlayFrom,
  size = 32,
  label,
}) => (
  <div style={{ textAlign: 'center' }}>
    {label && (
      <div style={{ fontSize: 14, color: '#555', marginBottom: 4, fontWeight: 'bold' }}>
        {label}
      </div>
    )}
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 2,
        maxWidth: 280,
        margin: '0 auto',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <EmojiCell
          key={i}
          base={base}
          overlay={
            overlay && overlayFrom !== undefined && i >= overlayFrom ? overlay : undefined
          }
          size={size}
        />
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────
// EmojiStack — main component
// ─────────────────────────────────────────────
interface EmojiStackProps {
  option: SchemaOption;
  compact?: boolean;
}

const CELL_SIZE = 28;

export const EmojiStack: React.FC<EmojiStackProps> = ({ option, compact = false }) => {
  const size = compact ? 22 : CELL_SIZE;
  const { style, left, right, removeCount, unknownSide } = option;

  const containerStyle: React.CSSProperties = {
    padding: compact ? 8 : 12,
    borderRadius: 12,
    background: '#fffde7',
    minWidth: compact ? 120 : 160,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  };

  // ── merge ─────────────────────────────────
  if (style === 'merge') {
    return (
      <div
        style={{
          ...containerStyle,
          border: '3px dashed #f9a825',
          background: '#fffde7',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <EmojiRow base={left.base} count={left.count} size={size} label={left.label} />
          {right && (
            <>
              <div
                style={{
                  alignSelf: 'center',
                  fontSize: 22,
                  fontWeight: 'bold',
                  color: '#f9a825',
                }}
              >
                ＋
              </div>
              <EmojiRow
                base={right.base}
                count={right.count}
                size={size}
                label={right.label}
              />
            </>
          )}
        </div>
        <div style={{ fontSize: 13, color: '#e65100', fontWeight: 'bold' }}>
          あわせる
        </div>
      </div>
    );
  }

  // ── remove ────────────────────────────────
  if (style === 'remove') {
    const crossStart = left.count - (removeCount ?? 0);
    return (
      <div
        style={{
          ...containerStyle,
          border: '3px solid #ef9a9a',
          background: '#fff8f8',
        }}
      >
        <EmojiRow
          base={left.base}
          count={left.count}
          overlay="❌"
          overlayFrom={crossStart}
          size={size}
          label={left.label}
        />
        <div style={{ fontSize: 13, color: '#c62828', fontWeight: 'bold' }}>
          {removeCount}こ へる
        </div>
      </div>
    );
  }

  // ── compare ───────────────────────────────
  if (style === 'compare') {
    return (
      <div
        style={{
          ...containerStyle,
          border: '3px solid #90caf9',
          background: '#e3f2fd',
          gap: 4,
        }}
      >
        <EmojiRow base={left.base} count={left.count} size={size} label={left.label} />
        <div
          style={{
            width: '80%',
            height: 2,
            background: '#1565c0',
            margin: '4px 0',
            borderRadius: 2,
          }}
        />
        {right && (
          <EmojiRow base={right.base} count={right.count} size={size} label={right.label} />
        )}
        <div style={{ fontSize: 13, color: '#0d47a1', fontWeight: 'bold' }}>
          くらべる
        </div>
      </div>
    );
  }

  // ── reverse ───────────────────────────────
  if (style === 'reverse') {
    const showQuestionLeft = unknownSide === 'left';
    return (
      <div
        style={{
          ...containerStyle,
          border: '3px dashed #ab47bc',
          background: '#f3e5f5',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {/* Left group */}
          <div style={{ textAlign: 'center' }}>
            {left.label && (
              <div style={{ fontSize: 12, color: '#7b1fa2', fontWeight: 'bold', marginBottom: 2 }}>
                {left.label}
              </div>
            )}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 2,
                maxWidth: 120,
              }}
            >
              {Array.from({ length: left.count }).map((_, i) => (
                <EmojiCell
                  key={i}
                  base={left.base}
                  overlay={showQuestionLeft ? '❓' : undefined}
                  size={size}
                />
              ))}
            </div>
          </div>

          <div style={{ alignSelf: 'center', fontSize: 18, color: '#7b1fa2' }}>＋</div>

          {/* Right group */}
          {right && (
            <div style={{ textAlign: 'center' }}>
              {right.label && (
                <div
                  style={{ fontSize: 12, color: '#7b1fa2', fontWeight: 'bold', marginBottom: 2 }}
                >
                  {right.label}
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 2,
                  maxWidth: 120,
                }}
              >
                {Array.from({ length: right.count }).map((_, i) => (
                  <EmojiCell
                    key={i}
                    base={right.base}
                    overlay={!showQuestionLeft ? '❓' : undefined}
                    size={size}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ fontSize: 13, color: '#6a1b9a', fontWeight: 'bold' }}>
          ❓ = はじめの かず
        </div>
      </div>
    );
  }

  return null;
};

// ─────────────────────────────────────────────
// Style label helper
// ─────────────────────────────────────────────
export function schemaStyleLabel(style: SchemaStyle): string {
  switch (style) {
    case 'merge':
      return 'あわせる（たし算）';
    case 'remove':
      return 'へらす（ひき算）';
    case 'compare':
      return 'くらべる（ひき算）';
    case 'reverse':
      return 'もとの かず（ぎゃく）';
  }
}
