import React, { useMemo, useState } from 'react';
import type { QuizStep } from '../types';
import { storage } from '../utils/storage';

interface Props {
  onClose: () => void;
}

type StepKey = QuizStep;

const STEP_LABELS: Record<StepKey, string> = {
  context: 'じょうきょうはあく',
  schema: 'ずかいせんたく',
  formula: 'りっしきせんたく',
};

const STEP_COLORS: Record<StepKey, string> = {
  context: '#42a5f5',
  schema: '#ab47bc',
  formula: '#26a69a',
};

function pct(c: number, t: number) {
  if (t === 0) return 0;
  return Math.round((c / t) * 100);
}

function generateAdvice(
  stepStats: Record<StepKey, { correct: number; total: number }>
): string[] {
  const advice: string[] = [];
  const cp = pct(stepStats.context.correct, stepStats.context.total);
  const sp = pct(stepStats.schema.correct, stepStats.schema.total);
  const fp = pct(stepStats.formula.correct, stepStats.formula.total);

  if (cp < 70) {
    advice.push(
      '💬 【じょうきょうはあく】が苦手なようです。文章を読んで「ふえた」「へった」「くらべた」を声に出して確認する練習をしましょう。'
    );
  }
  if (sp < 70) {
    advice.push(
      '🖼️ 【ずかいせんたく】が苦手なようです。ブロックや積み木を実際に動かして、合わせる・引く・比べる動作を体で覚えましょう。'
    );
  }
  if (fp < 70) {
    advice.push(
      '🔢 【りっしきせんたく（式）】が苦手なようです。状況と図が正しく選べていても式で迷うケースがあります。「合わせるなら＋、引くなら－」と繰り返し声に出して確認しましょう。'
    );
  }
  if (cp >= 70 && sp < 70) {
    advice.push(
      '💡 状況は読めているのに図解でつまずいています。文章→図のつながりを絵に描きながら一緒に考えてみてください。'
    );
  }
  if (sp >= 70 && fp < 70) {
    advice.push(
      '💡 図は正しく選べているのに式でミスしています。図を指さしながら「これはたし算？ひき算？」と声に出すと式と結びつきやすくなります。'
    );
  }
  if (cp >= 80 && sp >= 80 && fp >= 80) {
    advice.push(
      '🌟 すばらしい！3つのステップすべて高い正答率です。より難しい問題（2年生）にもチャレンジしてみましょう！'
    );
  }
  if (advice.length === 0) {
    advice.push('📖 まずは何度か問題に挑戦して、得意・苦手なパターンを確認しましょう。');
  }
  return advice;
}

export const ParentDashboard: React.FC<Props> = ({ onClose }) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const history = storage.getHistory();
  const childName = storage.get().childName;

  const aggregated = useMemo(() => {
    const steps: Record<StepKey, { correct: number; total: number }> = {
      context: { correct: 0, total: 0 },
      schema: { correct: 0, total: 0 },
      formula: { correct: 0, total: 0 },
    };
    let totalScore = 0;
    let totalQ = 0;
    for (const rec of history) {
      totalScore += rec.score;
      totalQ += rec.totalQuestions;
      for (const s of ['context', 'schema', 'formula'] as StepKey[]) {
        steps[s].correct += rec.stepStats[s].correct;
        steps[s].total += rec.stepStats[s].total;
      }
    }
    return { steps, totalScore, totalQ, testCount: history.length };
  }, [history]);

  const advice = useMemo(() => generateAdvice(aggregated.steps), [aggregated.steps]);

  const handleClearHistory = () => {
    storage.clearHistory();
    setConfirmClear(false);
    window.location.reload();
  };

  const overallPct = pct(aggregated.totalScore, aggregated.totalQ);
  const steps: StepKey[] = ['context', 'schema', 'formula'];

  return (
    <div
      style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: '24px 16px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1a237e' }}>
            👪 おや用 ダッシュボード
          </div>
          {childName && (
            <div style={{ fontSize: 18, color: '#555' }}>
              {childName} さんの がくしゅうきろく
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '10px 24px',
            fontSize: 18,
            borderRadius: 30,
            border: '2px solid #888',
            background: '#fff',
            cursor: 'pointer',
            color: '#555',
          }}
        >
          ✕ とじる
        </button>
      </div>

      {history.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 60,
            color: '#888',
            fontSize: 20,
          }}
        >
          まだ テストの きろくが ありません。<br />
          まず こどもに もんだいを やってもらいましょう！
        </div>
      ) : (
        <>
          {/* Overall stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              marginBottom: 24,
            }}
          >
            {[
              { label: 'テスト回数', value: `${aggregated.testCount}回`, icon: '📋' },
              {
                label: '総問題数',
                value: `${aggregated.totalQ}問`,
                icon: '📝',
              },
              {
                label: '総合正答率',
                value: `${overallPct}%`,
                icon: '🎯',
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: 16,
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <div style={{ fontSize: 32 }}>{s.icon}</div>
                <div
                  style={{ fontSize: 26, fontWeight: 'bold', color: '#1a237e' }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: 14, color: '#888' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Step breakdown */}
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 20,
              marginBottom: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <div
              style={{ fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16 }}
            >
              ステップ別 正答率
            </div>
            {steps.map((s) => {
              const { correct, total } = aggregated.steps[s];
              const p = pct(correct, total);
              return (
                <div key={s} style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 17,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontWeight: 'bold', color: STEP_COLORS[s] }}>
                      {STEP_LABELS[s]}
                    </span>
                    <span style={{ color: '#555' }}>
                      {correct}/{total} 問 ({p}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: 16,
                      background: '#eee',
                      borderRadius: 8,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${p}%`,
                        background: STEP_COLORS[s],
                        borderRadius: 8,
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color:
                        p >= 80
                          ? '#2e7d32'
                          : p >= 50
                          ? '#e65100'
                          : '#c62828',
                      marginTop: 3,
                      textAlign: 'right',
                    }}
                  >
                    {p >= 80 ? '✅ よくできています' : p >= 50 ? '⚠️ もう少し練習しましょう' : '❗ 重点的にフォローが必要です'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Advice */}
          <div
            style={{
              background: '#e8f5e9',
              borderRadius: 20,
              padding: 20,
              marginBottom: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <div
              style={{ fontSize: 20, fontWeight: 'bold', color: '#2e7d32', marginBottom: 12 }}
            >
              🌱 おや向け フォローアドバイス
            </div>
            {advice.map((a, i) => (
              <div
                key={i}
                style={{
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: '#1b5e20',
                  marginBottom: 10,
                  padding: '10px 14px',
                  background: '#fff',
                  borderRadius: 12,
                  borderLeft: '4px solid #43a047',
                }}
              >
                {a}
              </div>
            ))}
          </div>

          {/* Test history */}
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 20,
              marginBottom: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <div
              style={{ fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 12 }}
            >
              📅 テスト履歴（直近10回）
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', borderRadius: '8px 0 0 0' }}>
                      日付
                    </th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>学年</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>正解</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>状況</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>図解</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', borderRadius: '0 8px 0 0' }}>
                      式
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 10).map((rec) => (
                    <tr key={rec.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px 12px', color: '#555' }}>
                        {new Date(rec.date).toLocaleDateString('ja-JP', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        {rec.grade}年
                      </td>
                      <td
                        style={{
                          padding: '8px 12px',
                          textAlign: 'center',
                          fontWeight: 'bold',
                        }}
                      >
                        {rec.score}/{rec.totalQuestions}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        {pct(rec.stepStats.context.correct, rec.stepStats.context.total)}%
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        {pct(rec.stepStats.schema.correct, rec.stepStats.schema.total)}%
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        {pct(rec.stepStats.formula.correct, rec.stepStats.formula.total)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Danger zone */}
      <div
        style={{
          borderTop: '2px dashed #ffcdd2',
          paddingTop: 20,
          textAlign: 'center',
        }}
      >
        {!confirmClear ? (
          <button
            onClick={() => setConfirmClear(true)}
            style={{
              padding: '10px 24px',
              fontSize: 16,
              borderRadius: 20,
              border: '2px solid #ef9a9a',
              background: '#fff',
              color: '#c62828',
              cursor: 'pointer',
            }}
          >
            🗑️ きろくを すべて けす
          </button>
        ) : (
          <div>
            <div style={{ color: '#c62828', fontWeight: 'bold', marginBottom: 12 }}>
              本当に全ての学習記録を削除しますか？この操作は取り消せません。
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={handleClearHistory}
                style={{
                  padding: '10px 24px',
                  fontSize: 16,
                  borderRadius: 20,
                  border: 'none',
                  background: '#c62828',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                はい、けします
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                style={{
                  padding: '10px 24px',
                  fontSize: 16,
                  borderRadius: 20,
                  border: '2px solid #888',
                  background: '#fff',
                  color: '#555',
                  cursor: 'pointer',
                }}
              >
                やめる
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
