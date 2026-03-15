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
  const {
    style, left, right, removeCount, removeLabel, unknownSide, groupCount, multiplier,
    hitsuzanTop, hitsuzanBottom, hitsuzanOp, hitsuzanCarry, hitsuzanBorrow,
    hitsuzanMisalign, hitsuzanResult,
    divideTotal, divideBy, divideGroupSize, divideQuotient, divideRemainder, divideEmoji, divideShowEach,
    fractionNumerator, fractionDenominator, fractionEmoji, fractionHighlight,
    decimalValue, decimalMin, decimalMax, decimalWrong,
    tapeBase, tapeBaseLabel, tapeCompare, tapeCompareLabel, tapeUnit, tapeTimes,
  } = option;

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
          たす
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
          {removeLabel ?? `${removeCount}こ へる`}
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

  // ── groups (かけ算) ───────────────────────
  if (style === 'groups') {
    const groups = groupCount ?? 1;
    const perGroup = left.count;
    return (
      <div
        style={{
          ...containerStyle,
          border: '3px solid #a5d6a7',
          background: '#f1f8e9',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {Array.from({ length: groups }).map((_, gi) => (
            <div
              key={gi}
              style={{
                border: '2px dashed #66bb6a',
                borderRadius: 8,
                padding: 4,
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 2,
                minWidth: 40,
              }}
            >
              {Array.from({ length: perGroup }).map((_, ei) => (
                <EmojiCell key={ei} base={left.base} size={size} />
              ))}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: '#2e7d32', fontWeight: 'bold' }}>
          {groups}グループ × {perGroup}こ
        </div>
      </div>
    );
  }

  // ── tape (倍) ─────────────────────────────
  if (style === 'tape') {
    const times = multiplier ?? 1;
    const base = left.count;
    return (
      <div
        style={{
          ...containerStyle,
          border: '3px solid #ffcc80',
          background: '#fff8e1',
        }}
      >
        {/* Base row */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#e65100', fontWeight: 'bold', marginBottom: 2 }}>
            {left.label ?? 'もと'}
          </div>
          <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            {Array.from({ length: base }).map((_, i) => (
              <EmojiCell key={i} base={left.base} size={size} />
            ))}
          </div>
        </div>
        <div style={{ fontSize: 14, color: '#e65100', fontWeight: 'bold' }}>
          × {times} ばい
        </div>
        {/* Result row */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#e65100', fontWeight: 'bold', marginBottom: 2 }}>
            {right?.label ?? 'こたえ'}
          </div>
          <div style={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 200 }}>
            {Array.from({ length: base * times }).map((_, i) => (
              <EmojiCell key={i} base={left.base} size={size} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── hitsuzan (ひっ算) ─────────────────────
  if (style === 'hitsuzan') {
    const hTop = hitsuzanTop ?? 0;
    const hBottom = hitsuzanBottom ?? 0;
    const hOp = hitsuzanOp ?? '+';
    const hCarry = hitsuzanCarry ?? false;
    const hBorrow = hitsuzanBorrow ?? false;
    const hMisalign = hitsuzanMisalign ?? false;
    const hResult = hitsuzanResult ?? '？';

    const topTens = Math.floor(hTop / 10);
    const topOnes = hTop % 10;
    const bottomTens = Math.floor(hBottom / 10);
    const bottomOnes = hBottom % 10;

    const W = 28;
    const H = 32;
    const numSt: React.CSSProperties = {
      width: W, height: H,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 22, fontWeight: 'bold', color: '#212121',
    };
    const opSt: React.CSSProperties = {
      width: W, height: H,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, fontWeight: 'bold', color: '#1565c0',
    };

    return (
      <div style={{ ...containerStyle, border: '3px solid #78909c', background: '#f5f5f5', gap: 2 }}>
        <div style={{ fontSize: 11, color: '#546e7a', marginBottom: 2 }}>ひっ算</div>

        {/* Mark row (carry / borrow) */}
        <div style={{ display: 'flex', height: 18 }}>
          <div style={{ width: W }} />
          <div style={{ width: W, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#e53935', fontWeight: 'bold' }}>
            {hOp === '+' && hCarry ? '①' : hOp === '-' && hBorrow ? '↙' : '\u00a0'}
          </div>
          <div style={{ width: W }} />
        </div>

        {/* Top number */}
        <div style={{ display: 'flex' }}>
          <div style={{ width: W }} />
          <div style={numSt}>{topTens}</div>
          <div style={numSt}>{topOnes}</div>
        </div>

        {/* Op + bottom number (misalign shifts bottom 1 col right) */}
        <div style={{ display: 'flex' }}>
          {hMisalign ? (
            <>
              <div style={{ width: W }} />
              <div style={opSt}>{hOp === '+' ? '＋' : '－'}</div>
              <div style={numSt}>{bottomTens}</div>
              <div style={numSt}>{bottomOnes}</div>
            </>
          ) : (
            <>
              <div style={opSt}>{hOp === '+' ? '＋' : '－'}</div>
              <div style={numSt}>{bottomTens}</div>
              <div style={numSt}>{bottomOnes}</div>
            </>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: hMisalign ? W * 4 : W * 3, borderTop: '2px solid #37474f', margin: '1px 0' }} />

        {/* Result */}
        <div style={{ display: 'flex' }}>
          <div style={{ width: W }} />
          {hResult === '？' ? (
            <div style={{ ...numSt, width: W * 2, color: '#9e9e9e' }}>？</div>
          ) : hResult.length >= 2 ? (
            <>
              <div style={numSt}>{hResult.charAt(hResult.length - 2)}</div>
              <div style={numSt}>{hResult.charAt(hResult.length - 1)}</div>
            </>
          ) : (
            <div style={{ ...numSt, width: W * 2 }}>{hResult}</div>
          )}
        </div>
      </div>
    );
  }

  // ── divide-equal (等分除) ────────────────────
  if (style === 'divide-equal') {
    const total = divideTotal ?? 12;
    const groups = divideBy ?? 3;
    const perGroup = divideShowEach ?? Math.floor(total / groups);
    const emoji = divideEmoji ?? '🍎';
    return (
      <div style={{ ...containerStyle, border: '3px solid #80cbc4', background: '#e0f2f1' }}>
        <div style={{ fontSize: 12, color: '#00695c', fontWeight: 'bold' }}>
          {total}こを {groups}つに わけると？
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {Array.from({ length: groups }).map((_, gi) => (
            <div
              key={gi}
              style={{
                border: '2px dashed #26a69a',
                borderRadius: 8,
                padding: '4px 6px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 2,
                minWidth: 40,
              }}
            >
              {Array.from({ length: perGroup }).map((_, ei) => (
                <span key={ei} style={{ fontSize: size * 0.85 }}>{emoji}</span>
              ))}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: '#004d40', fontWeight: 'bold' }}>
          1つあたり {perGroup}こ
        </div>
      </div>
    );
  }

  // ── divide-group (包含除) ────────────────────
  if (style === 'divide-group') {
    const total = divideTotal ?? 12;
    const perGroup = divideGroupSize ?? 4;
    const groups = Math.floor(total / perGroup);
    const emoji = divideEmoji ?? '🍎';
    return (
      <div style={{ ...containerStyle, border: '3px solid #ffb74d', background: '#fff3e0' }}>
        <div style={{ fontSize: 12, color: '#e65100', fontWeight: 'bold' }}>
          {total}こを {perGroup}こずつ わけると？
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {Array.from({ length: groups }).map((_, gi) => (
            <div
              key={gi}
              style={{
                border: '2px dashed #ff9800',
                borderRadius: 8,
                padding: '4px 6px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 2,
                minWidth: 40,
              }}
            >
              {Array.from({ length: perGroup }).map((_, ei) => (
                <span key={ei} style={{ fontSize: size * 0.85 }}>{emoji}</span>
              ))}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: '#bf360c', fontWeight: 'bold' }}>
          {groups}つの グループ
        </div>
      </div>
    );
  }

  // ── remainder (あまりのあるわり算) ───────────
  if (style === 'remainder') {
    const total = divideTotal ?? 13;
    const by = divideBy ?? 4;
    const quotient = divideQuotient ?? Math.floor(total / by);
    const rem = divideRemainder ?? (total % by);
    const emoji = divideEmoji ?? '🍎';
    return (
      <div style={{ ...containerStyle, border: '3px solid #ce93d8', background: '#f3e5f5' }}>
        <div style={{ fontSize: 12, color: '#6a1b9a', fontWeight: 'bold' }}>
          {total}こを {by}こずつ わけると？
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {Array.from({ length: quotient }).map((_, gi) => (
            <div
              key={gi}
              style={{
                border: '2px dashed #ab47bc',
                borderRadius: 8,
                padding: '4px 6px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 2,
                minWidth: 36,
              }}
            >
              {Array.from({ length: by }).map((_, ei) => (
                <span key={ei} style={{ fontSize: size * 0.8 }}>{emoji}</span>
              ))}
            </div>
          ))}
          {rem > 0 && (
            <div style={{
              border: '2px dotted #e91e63',
              borderRadius: 8,
              padding: '4px 6px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 2,
              minWidth: 36,
              background: '#fce4ec',
            }}>
              {Array.from({ length: rem }).map((_, ei) => (
                <span key={ei} style={{ fontSize: size * 0.8 }}>{emoji}</span>
              ))}
            </div>
          )}
        </div>
        <div style={{ fontSize: 13, color: '#4a148c', fontWeight: 'bold' }}>
          {quotient}つ あまり {rem}こ
        </div>
      </div>
    );
  }

  // ── fraction (分数) ──────────────────────────
  if (style === 'fraction') {
    const numer = fractionNumerator ?? 1;
    const denom = fractionDenominator ?? 4;
    const highlight = fractionHighlight ?? numer;
    const emoji = fractionEmoji ?? '⬜';
    const highlightEmoji = '🟦';
    return (
      <div style={{ ...containerStyle, border: '3px solid #81d4fa', background: '#e1f5fe' }}>
        <div style={{ fontSize: 12, color: '#01579b', fontWeight: 'bold' }}>
          {denom}つに わけた うちの {highlight}つ
        </div>
        <div style={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
          {Array.from({ length: denom }).map((_, i) => (
            <span key={i} style={{ fontSize: size * 1.1 }}>
              {i < highlight ? highlightEmoji : emoji}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#0277bd', borderBottom: '2px solid #0277bd', lineHeight: 1.2 }}>
              {numer}
            </div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#0277bd', lineHeight: 1.2 }}>
              {denom}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── decimal (小数) ───────────────────────────
  if (style === 'decimal') {
    const val = decimalValue ?? '1.3';
    const minV = decimalMin ?? '0';
    const maxV = decimalMax ?? '2';
    const wrong = decimalWrong;
    const minNum = parseFloat(minV);
    const maxNum = parseFloat(maxV);
    const valNum = parseFloat(val);
    const wrongNum = wrong ? parseFloat(wrong) : null;
    const range = maxNum - minNum;
    const valPct = ((valNum - minNum) / range) * 100;
    const wrongPct = wrongNum !== null ? ((wrongNum - minNum) / range) * 100 : null;
    const BAR_W = 180;
    return (
      <div style={{ ...containerStyle, border: '3px solid #a5d6a7', background: '#f1f8e9' }}>
        <div style={{ fontSize: 12, color: '#2e7d32', fontWeight: 'bold' }}>すうちせん</div>
        <div style={{ position: 'relative', width: BAR_W, height: 36 }}>
          {/* axis */}
          <div style={{ position: 'absolute', top: 18, left: 0, right: 0, height: 2, background: '#388e3c' }} />
          {/* ticks and labels */}
          {[minV, maxV].map((lbl, idx) => {
            const pct = idx === 0 ? 0 : 100;
            return (
              <div key={idx} style={{ position: 'absolute', left: `${(pct / 100) * BAR_W}px`, top: 10, transform: 'translateX(-50%)' }}>
                <div style={{ width: 2, height: 16, background: '#388e3c', margin: '0 auto' }} />
                <div style={{ fontSize: 11, color: '#1b5e20', textAlign: 'center', marginTop: 2 }}>{lbl}</div>
              </div>
            );
          })}
          {/* marker */}
          {wrongPct !== null ? (
            <div style={{ position: 'absolute', left: `${(wrongPct / 100) * BAR_W}px`, top: 4, transform: 'translateX(-50%)' }}>
              <div style={{ fontSize: 16, color: '#e53935' }}>▼</div>
              <div style={{ fontSize: 12, color: '#e53935', fontWeight: 'bold', textAlign: 'center' }}>{wrong}</div>
            </div>
          ) : (
            <div style={{ position: 'absolute', left: `${(valPct / 100) * BAR_W}px`, top: 4, transform: 'translateX(-50%)' }}>
              <div style={{ fontSize: 16, color: '#1565c0' }}>▼</div>
              <div style={{ fontSize: 12, color: '#1565c0', fontWeight: 'bold', textAlign: 'center' }}>{val}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── tape-reverse (倍の逆算) ──────────────────
  if (style === 'tape-reverse') {
    const base = tapeBase ?? 4;
    const compare = tapeCompare ?? 12;
    const baseLabel = tapeBaseLabel ?? 'もとの かず';
    const compareLabel = tapeCompareLabel ?? 'くらべる かず';
    const unit = tapeUnit ?? '';
    const times = tapeTimes;
    const REF = 120; // reference width for base bar (px)
    const compareW = (compare / base) * REF;
    return (
      <div style={{ ...containerStyle, border: '3px solid #ffcc80', background: '#fff8e1', alignItems: 'flex-start', minWidth: 200 }}>
        <div style={{ fontSize: 12, color: '#e65100', fontWeight: 'bold', alignSelf: 'center' }}>テープ図</div>
        {/* Base bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 11, color: '#5d4037', width: 72, textAlign: 'right', flexShrink: 0 }}>{baseLabel}</div>
          <div style={{
            width: REF,
            height: 24,
            background: '#ff8f00',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 'bold',
            color: '#fff',
          }}>
            {base}{unit}
          </div>
        </div>
        {/* Compare bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 11, color: '#5d4037', width: 72, textAlign: 'right', flexShrink: 0 }}>{compareLabel}</div>
          <div style={{
            width: Math.min(compareW, 240),
            height: 24,
            background: '#42a5f5',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 'bold',
            color: '#fff',
          }}>
            {compare}{unit}
          </div>
        </div>
        {times !== undefined && (
          <div style={{ fontSize: 13, color: '#e65100', fontWeight: 'bold', alignSelf: 'center' }}>
            {compare}{unit} ÷ {base}{unit} ＝ {times}ばい
          </div>
        )}
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
    case 'groups':
      return 'グループにわける（かけ算）';
    case 'tape':
      return 'テープ図（何倍）';
    case 'hitsuzan':
      return 'ひっ算';
    case 'divide-equal':
      return 'わり算（等分除）';
    case 'divide-group':
      return 'わり算（包含除）';
    case 'remainder':
      return 'あまりのある わり算';
    case 'fraction':
      return 'ぶんすう';
    case 'decimal':
      return 'しょうすう';
    case 'tape-reverse':
      return 'テープ図（何倍か）';
  }
}
