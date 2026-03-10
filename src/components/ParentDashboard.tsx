import React, { useMemo, useState } from 'react';
import type { QuizStep } from '../types';
import { storage } from '../utils/storage';

interface Props {
  onClose: () => void;
}

type StepKey = QuizStep;

const STEP_LABELS: Record<StepKey, string> = {
  context: 'じょうきょうかくにん',
  schema: 'ずをえらぶ',
  formula: 'しきをえらぶ',
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
  const hasData = stepStats.context.total > 0;

  if (!hasData) {
    advice.push('📖 まずは何度か問題に挑戦して、得意・苦手なパターンを確認しましょう。');
    return advice;
  }

  // 全体が優秀
  if (cp >= 80 && sp >= 80 && fp >= 80) {
    advice.push(
      '🌟 すばらしい成績です！「じょうきょうかくにん」「ずをえらぶ」「しきをえらぶ」の3ステップすべてで高い正答率を記録しています。文章題の構造をしっかり理解できている証拠です。より難しい問題（2年生）にもチャレンジしてみましょう！'
    );
    return advice;
  }

  // ステップ1（じょうきょうかくにん）が弱い
  if (cp < 70) {
    advice.push(
      '💬 【じょうきょうかくにん】の正答率が低めです。このステップでは「数が増えたのか、減ったのか、比べているのか」を文章から読み取る力を測っています。\n\n👨‍👩‍👧 フォロー方法：問題文を一緒に音読しながら、「ここで何が起きているの？」と声に出して確認してみましょう。「〜しました」「〜になりました」などの動詞に注目するクセをつけると理解が深まります。'
    );
  }

  // ステップ2（ずをえらぶ）が弱い
  if (sp < 70) {
    advice.push(
      '🖼️ 【ずをえらぶ】の正答率が低めです。このステップでは、文章の状況を「たす・とる・くらべる」のどの図で表せるかを判断する力を測っています。\n\n👨‍👩‍👧 フォロー方法：ブロックやおはじきなど、実際に手で動かせるものを使って状況を再現してみましょう。「2つを合わせる」「一部をとる」「長さを並べて比べる」の3パターンを体を使って体験することが効果的です。'
    );
  }

  // ステップ3（しきをえらぶ）が弱い
  if (fp < 70) {
    advice.push(
      '🔢 【しきをえらぶ】の正答率が低めです。このステップでは、状況や図を正しく式（＋か－）に変換する力を測っています。\n\n👨‍👩‍👧 フォロー方法：「ふえる・あわせる→＋」「へる・とる・ちがい→－」という対応を日常会話の中で繰り返し確認しましょう。図を見ながら「この図は合わせているから＋だね」と声に出すと、図と式が結びつきやすくなります。'
    );
  }

  // 状況は読めているが図が選べない
  if (cp >= 70 && sp < 70) {
    advice.push(
      '💡 文章の状況は正しく読めているのに、それを図に変換するところでつまずいています。「ふえた」とわかっても、それがどんな図になるかが結びついていない状態です。問題文の内容を一緒に絵で描いてみると、図との対応が見えてきます。'
    );
  }

  // 図は選べているが式が選べない
  if (sp >= 70 && fp < 70) {
    advice.push(
      '💡 図は正しく選べているのに、式の選択でミスしています。図と式の対応がまだ自動化されていない段階です。正しく選んだ図を指さしながら「この図はたし算かな？ひき算かな？」と毎回声に出す習慣をつけると、式と結びつきやすくなります。'
    );
  }

  // 状況も図も弱い（構造理解が根本から不足）
  if (cp < 60 && sp < 60) {
    advice.push(
      '📌 状況の読み取りと図の選択、両方に課題があります。これは文章題の構造理解がまだ発展途上であることを示しています。まずは「ふえた話」「へった話」「くらべる話」の3種類のお話を日常会話で意識的に区別する練習から始めると効果的です。'
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

          {/* 3-step explanation for parents */}
          <div
            style={{
              background: '#e8eaf6',
              borderRadius: 20,
              padding: 20,
              marginBottom: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <div
              style={{ fontSize: 20, fontWeight: 'bold', color: '#283593', marginBottom: 12 }}
            >
              📘 3つのステップについて
            </div>
            {[
              {
                icon: '💬',
                label: 'ステップ1：じょうきょうかくにん',
                color: '#42a5f5',
                body: '文章を読んで「数がふえた・へった・くらべている」のどの状況かを判断する力です。文章題を解く上で最初の入り口となる重要なスキルです。',
              },
              {
                icon: '🖼️',
                label: 'ステップ2：ずをえらぶ',
                color: '#ab47bc',
                body: '状況を「たす図・とる図・くらべる図」のどれで表すかを選ぶ力です。言葉のイメージを視覚化する力で、算数の概念理解の核心です。',
              },
              {
                icon: '🔢',
                label: 'ステップ3：しきをえらぶ',
                color: '#26a69a',
                body: '図に合った式（＋か－）を選ぶ力です。図から式への変換を正確にできることが、計算ミスを減らす鍵になります。',
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  display: 'flex',
                  gap: 12,
                  marginBottom: 10,
                  padding: '12px 14px',
                  background: '#fff',
                  borderRadius: 12,
                  borderLeft: `4px solid ${s.color}`,
                }}
              >
                <span style={{ fontSize: 24, flexShrink: 0 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 'bold', color: s.color, marginBottom: 4 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 14, color: '#444', lineHeight: 1.6 }}>{s.body}</div>
                </div>
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
