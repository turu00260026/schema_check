import React, { useMemo, useState } from 'react';
import type { QuizStep, TestRecord } from '../types';
import { storage } from '../utils/storage';
import { ALL_FEEDBACK, getFeedbackForGrade, type SchemaFeedback } from '../data/feedback';

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

// ─────────────────────────────────────────────────────────────────────
// Question → Schema mapping built from feedback data
// ─────────────────────────────────────────────────────────────────────
interface QSchemaInfo {
  grade: number;
  schemaIdx: number;
  schemaType: string;
}

const QUESTION_SCHEMA_MAP: Record<string, QSchemaInfo> = (() => {
  const map: Record<string, QSchemaInfo> = {};
  for (const gf of ALL_FEEDBACK) {
    gf.schemas.forEach((schema, idx) => {
      for (const qid of schema.questionIds) {
        map[qid] = { grade: gf.grade, schemaIdx: idx, schemaType: schema.schemaType };
      }
    });
  }
  return map;
})();

// ─────────────────────────────────────────────────────────────────────
// Per-schema performance aggregation
// ─────────────────────────────────────────────────────────────────────
interface SchemaPerf {
  schema: SchemaFeedback;
  total: number;
  correct: number;
  pct: number; // -1 = no data
  stepBreakdown: Record<StepKey, { correct: number; total: number }>;
}

function calcSchemaPerformance(history: TestRecord[], grade: number): SchemaPerf[] {
  const feedback = getFeedbackForGrade(grade);
  if (!feedback) return [];

  const counts = feedback.schemas.map(() => ({
    total: 0,
    correct: 0,
    stepBreakdown: {
      context: { correct: 0, total: 0 },
      schema: { correct: 0, total: 0 },
      formula: { correct: 0, total: 0 },
    } as Record<StepKey, { correct: number; total: number }>,
  }));

  for (const rec of history) {
    if (rec.grade !== grade) continue;
    for (const qr of rec.results) {
      const info = QUESTION_SCHEMA_MAP[qr.questionId];
      if (!info || info.grade !== grade) continue;
      const c = counts[info.schemaIdx];
      c.total++;
      if (qr.allCorrect) c.correct++;
      for (const sr of qr.stepResults) {
        const step = sr.step as StepKey;
        c.stepBreakdown[step].total++;
        if (sr.correct) c.stepBreakdown[step].correct++;
      }
    }
  }

  return feedback.schemas.map((schema, idx) => ({
    schema,
    total: counts[idx].total,
    correct: counts[idx].correct,
    pct: counts[idx].total > 0 ? Math.round((counts[idx].correct / counts[idx].total) * 100) : -1,
    stepBreakdown: counts[idx].stepBreakdown,
  }));
}

// ─────────────────────────────────────────────────────────────────────
// SchemaCard component
// ─────────────────────────────────────────────────────────────────────
const SchemaCard: React.FC<{ perf: SchemaPerf; defaultOpen?: boolean }> = ({
  perf,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const { schema, total, correct, pct: p, stepBreakdown } = perf;

  const noData = p === -1;
  const isGood = !noData && p >= 80;
  const isMid = !noData && p >= 60 && p < 80;

  const barColor = noData ? '#bdbdbd' : isGood ? '#43a047' : isMid ? '#fb8c00' : '#e53935';
  const bgColor = noData ? '#fafafa' : isGood ? '#f1f8e9' : isMid ? '#fff8e1' : '#fff8f8';
  const borderColor = noData ? '#e0e0e0' : isGood ? '#a5d6a7' : isMid ? '#ffcc80' : '#ef9a9a';
  const badge = noData ? '— 未受験' : isGood ? '✅ 得意' : isMid ? '⚠️ もう少し' : '❗ 要フォロー';
  const badgeColor = noData ? '#9e9e9e' : isGood ? '#2e7d32' : isMid ? '#e65100' : '#c62828';

  // weakest step
  const weakStep = (['context', 'schema', 'formula'] as StepKey[])
    .filter((s) => stepBreakdown[s].total > 0)
    .sort(
      (a, b) =>
        pct(stepBreakdown[a].correct, stepBreakdown[a].total) -
        pct(stepBreakdown[b].correct, stepBreakdown[b].total)
    )[0];

  return (
    <div
      style={{
        background: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: 14,
        marginBottom: 10,
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '14px 16px',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 'bold', color: '#333', flex: 1 }}>
            {schema.schemaName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 'bold', color: badgeColor }}>{badge}</span>
            {!noData && (
              <span style={{ fontSize: 15, color: '#555' }}>
                {correct}/{total}問 ({p}%)
              </span>
            )}
            <span style={{ fontSize: 16, color: '#888' }}>{open ? '▲' : '▼'}</span>
          </div>
        </div>

        {/* Progress bar */}
        {!noData && (
          <div
            style={{
              height: 10,
              background: '#e0e0e0',
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${p}%`,
                background: barColor,
                borderRadius: 6,
                transition: 'width 0.6s ease',
              }}
            />
          </div>
        )}

        {/* Weak step hint */}
        {!noData && !isGood && weakStep && (
          <div style={{ fontSize: 12, color: '#888' }}>
            最も苦手なステップ：
            <span
              style={{
                fontWeight: 'bold',
                color: STEP_COLORS[weakStep],
              }}
            >
              {STEP_LABELS[weakStep]}（
              {pct(stepBreakdown[weakStep].correct, stepBreakdown[weakStep].total)}%）
            </span>
          </div>
        )}
      </button>

      {/* Expanded details */}
      {open && (
        <div style={{ padding: '0 16px 16px' }}>
          {/* What it tests */}
          <div
            style={{
              fontSize: 13,
              color: '#555',
              lineHeight: 1.7,
              background: '#fff',
              borderRadius: 8,
              padding: '10px 12px',
              marginBottom: 10,
              borderLeft: '3px solid #90caf9',
            }}
          >
            <span style={{ fontWeight: 'bold', color: '#1565c0' }}>📐 このスキーマが測るもの：</span>
            <br />
            {schema.whatItTests}
          </div>

          {/* Step breakdown */}
          {!noData && (
            <div
              style={{
                background: '#fff',
                borderRadius: 8,
                padding: '10px 12px',
                marginBottom: 10,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 'bold', color: '#333', marginBottom: 6 }}>
                ステップ別の結果
              </div>
              {(['context', 'schema', 'formula'] as StepKey[]).map((s) => {
                const sd = stepBreakdown[s];
                const sp = sd.total > 0 ? pct(sd.correct, sd.total) : -1;
                return (
                  <div key={s} style={{ marginBottom: 6 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 13,
                        marginBottom: 3,
                      }}
                    >
                      <span style={{ color: STEP_COLORS[s], fontWeight: 'bold' }}>
                        {STEP_LABELS[s]}
                      </span>
                      <span style={{ color: '#555' }}>
                        {sp === -1 ? '—' : `${sd.correct}/${sd.total}問 (${sp}%)`}
                      </span>
                    </div>
                    {sp !== -1 && (
                      <div
                        style={{
                          height: 7,
                          background: '#eee',
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${sp}%`,
                            background: STEP_COLORS[s],
                            borderRadius: 4,
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* If correct message or diagnosis + tips */}
          {isGood ? (
            <div
              style={{
                background: '#e8f5e9',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 13,
                color: '#2e7d32',
                lineHeight: 1.7,
              }}
            >
              🌟 {schema.ifCorrect}
            </div>
          ) : (
            <>
              {/* Diagnosis */}
              <div
                style={{
                  background: '#fff3e0',
                  borderRadius: 8,
                  padding: '10px 12px',
                  marginBottom: 10,
                  borderLeft: '3px solid #fb8c00',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 'bold', color: '#e65100', marginBottom: 4 }}>
                  🔍 つまずきの診断
                </div>
                <div style={{ fontSize: 13, color: '#5d4037', lineHeight: 1.75 }}>
                  {schema.diagnosis}
                </div>
              </div>
              {/* Tips */}
              <div
                style={{
                  background: '#e8f5e9',
                  borderRadius: 8,
                  padding: '10px 12px',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 'bold', color: '#1b5e20', marginBottom: 6 }}>
                  💡 おうちでできるサポート
                </div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {schema.tips.map((tip, i) => (
                    <li
                      key={i}
                      style={{ fontSize: 13, color: '#2e7d32', lineHeight: 1.75, marginBottom: 4 }}
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* No data */}
          {noData && (
            <div style={{ fontSize: 13, color: '#888', fontStyle: 'italic' }}>
              この学年のテストをまだ受けていないため、データがありません。
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// SchemaAnalysisSection component
// ─────────────────────────────────────────────────────────────────────
const SchemaAnalysisSection: React.FC<{ history: TestRecord[] }> = ({ history }) => {
  const gradesWithResults = [...new Set(history.map((r) => r.grade))].sort();
  const [selectedGrade, setSelectedGrade] = useState(gradesWithResults[0] ?? 1);

  if (gradesWithResults.length === 0) return null;

  const feedback = getFeedbackForGrade(selectedGrade);
  const perfs = calcSchemaPerformance(history, selectedGrade);

  if (!feedback) return null;

  // Auto-open schemas with pct < 70 or no data (first time)
  const weakSchemas = new Set(
    perfs.filter((p) => p.pct !== -1 && p.pct < 70).map((_, i) => i)
  );

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>
        🔬 スキーマ別 詳細分析
      </div>
      <div style={{ fontSize: 13, color: '#777', marginBottom: 16, lineHeight: 1.6 }}>
        テスト結果をもとに、どのスキーマが得意・苦手かを分析しています。
        苦手なスキーマをタップすると診断とサポートヒントが表示されます。
      </div>

      {/* Grade selector */}
      {gradesWithResults.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {gradesWithResults.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              style={{
                padding: '6px 18px',
                borderRadius: 20,
                border: `2px solid ${selectedGrade === g ? '#1a237e' : '#ccc'}`,
                background: selectedGrade === g ? '#1a237e' : '#fff',
                color: selectedGrade === g ? '#fff' : '#555',
                fontWeight: 'bold',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              {g}年生
            </button>
          ))}
        </div>
      )}

      {/* Grade overview */}
      <div
        style={{
          background: '#e8eaf6',
          borderRadius: 12,
          padding: '12px 16px',
          marginBottom: 16,
          fontSize: 13,
          color: '#283593',
          lineHeight: 1.75,
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
          📘 {selectedGrade}年生で身につけるスキーマについて
        </div>
        {feedback.overview}
      </div>

      {/* Schema cards */}
      {perfs.map((perf, idx) => (
        <SchemaCard key={idx} perf={perf} defaultOpen={weakSchemas.has(idx)} />
      ))}

      {/* Cross-cutting advice */}
      <details style={{ marginTop: 12 }}>
        <summary
          style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: '#555',
            cursor: 'pointer',
            padding: '8px 4px',
          }}
        >
          📋 学年横断アドバイスを見る
        </summary>
        <div style={{ paddingTop: 8 }}>
          {feedback.crossCuttingAdvice.map((adv, i) => (
            <div
              key={i}
              style={{
                fontSize: 13,
                color: '#444',
                lineHeight: 1.75,
                padding: '8px 12px',
                background: '#fafafa',
                borderRadius: 8,
                marginBottom: 6,
                borderLeft: '3px solid #90caf9',
              }}
            >
              {adv}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Existing generateAdvice (kept for step-level summary)
// ─────────────────────────────────────────────────────────────────────
interface AdviceItem {
  title: string;
  why: string;
  tips: string[];
}

function generateAdvice(
  stepStats: Record<StepKey, { correct: number; total: number }>
): AdviceItem[] {
  const advice: AdviceItem[] = [];
  const cp = pct(stepStats.context.correct, stepStats.context.total);
  const sp = pct(stepStats.schema.correct, stepStats.schema.total);
  const fp = pct(stepStats.formula.correct, stepStats.formula.total);
  const hasData = stepStats.context.total > 0;

  if (!hasData) {
    advice.push({
      title: '📖 まずは問題に挑戦してみましょう',
      why: 'テスト結果がまだありません。お子さんに一度取り組んでもらうと、3つのステップそれぞれの得意・苦手が数値で確認できます。',
      tips: [],
    });
    return advice;
  }

  if (cp >= 80 && sp >= 80 && fp >= 80) {
    advice.push({
      title: '🌟 3ステップすべて高い正答率です！',
      why: '文章を読んで状況を把握し、図に変換し、式を選ぶという一連の流れをしっかり理解できています。',
      tips: [
        '次の学年レベルの問題にもチャレンジしてみましょう。',
        '今度は自分で問題を作ってもらうと、さらに深い理解につながります。',
      ],
    });
    return advice;
  }

  if (cp < 60 && sp < 60) {
    advice.push({
      title: '📌 文章題の構造を理解するところから始めましょう',
      why: '「言葉の読み取り」と「イメージ化」の両方に課題があります。文章題に登場する出来事をパターンに分けて捉える経験がまだ十分でない段階と考えられます。',
      tips: [
        '日常のできごとを声に出して「これは"ふえた話"だね」と言語化しましょう。',
        '算数の問題より先に、絵本やおはなしで「何が起きたか」を確認するクイズを楽しんでみましょう。',
      ],
    });
  }

  if (cp < 70) {
    advice.push({
      title: '💬 問題文の言葉の意味を読み取るのが苦手なようです',
      why: '文章の動詞や状況語から"何が起きているか"を判断する力が育ちかけている段階です。計算力とは別の、文章を読む力の問題です。',
      tips: [
        '問題文を一緒に音読しながら、「ここで何が変わったの？」と問いかけてみましょう。',
        '日常会話でも「今のは"ふえた"ね」と意識して声に出すと、語彙と状況認識がつながっていきます。',
      ],
    });
  }

  if (sp < 70) {
    advice.push({
      title: '🖼️ 問題の内容を頭の中でイメージするのが苦手なようです',
      why: '言葉で状況を理解できても、それを図に変換するイメージ力が発展途上です。算数の苦手さの多くはここで起きています。',
      tips: [
        'おはじき・ブロックなど、実際に手で動かせるものを使って問題の状況を再現してみましょう。',
        '問題文を読んだあと、紙に簡単な丸や棒で絵を描いてみましょう。',
      ],
    });
  }

  if (fp < 70) {
    advice.push({
      title: '🔢 式の作り方の仕組みがまだつかめていないようです',
      why: '状況や図は正しく理解できていても、それを式に変換するルールが自動化されていない段階です。',
      tips: [
        '「合わせる・増やす→＋」「取る・減る→－」という対応を、図を指さしながら毎回声に出す習慣をつけましょう。',
        '正解した後でも「なんでこの式だと思ったの？」と理由を説明させましょう。',
      ],
    });
  }

  if (cp >= 70 && sp < 70) {
    advice.push({
      title: '💡 言葉で理解できているのに、図に変換するところで止まっています',
      why: 'わかっていても、それがどんな「動き」の図に対応するかがピンときていない状態です。',
      tips: [
        '問題文の状況を一緒に絵で描いてみましょう。',
        '図の「動き」を体で表現してみましょう。合わせるは両手を合わせるジェスチャーなど。',
      ],
    });
  }

  if (sp >= 70 && fp < 70) {
    advice.push({
      title: '💡 図は正しく選べているのに、式への変換でミスしています',
      why: '図の意味はわかっているので、あと一歩の練習で改善しやすいパターンです。',
      tips: [
        '正しく選んだ図を指さしながら「この図、何算だっけ？」と毎回声に出して確認しましょう。',
        '図→式の変換を声に出す回数を増やすことが最短の解決策です。',
      ],
    });
  }

  if (advice.length === 0) {
    advice.push({
      title: '📈 3つのステップともバランスよく取り組めています',
      why: 'すべてのステップで70%前後の正答率です。大きな苦手はありませんが、どのステップもまだ伸びしろがある段階です。',
      tips: [
        '間違えた問題の「どのステップでミスしたか」を一緒に確認してみましょう。',
        '正解した問題でも「なぜこの式にしたの？」と理由を説明させてみましょう。',
      ],
    });
  }
  return advice;
}

// ─────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────
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
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px' }}>
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
            👪 ほごしゃ用 ダッシュボード
          </div>
          {childName && (
            <div style={{ fontSize: 18, color: '#555' }}>{childName} さんの がくしゅうきろく</div>
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
        <div style={{ textAlign: 'center', padding: 60, color: '#888', fontSize: 20 }}>
          まだ テストの きろくが ありません。
          <br />
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
              { label: '総問題数', value: `${aggregated.totalQ}問`, icon: '📝' },
              { label: '総合正答率', value: `${overallPct}%`, icon: '🎯' },
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
                <div style={{ fontSize: 26, fontWeight: 'bold', color: '#1a237e' }}>
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
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16 }}>
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
                    style={{ height: 16, background: '#eee', borderRadius: 8, overflow: 'hidden' }}
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
                      color: p >= 80 ? '#2e7d32' : p >= 50 ? '#e65100' : '#c62828',
                      marginTop: 3,
                      textAlign: 'right',
                    }}
                  >
                    {p >= 80
                      ? '✅ よくできています'
                      : p >= 50
                      ? '⚠️ もう少し練習しましょう'
                      : '❗ 重点的にフォローが必要です'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── 案B: スキーマ別詳細分析（結果連動） ── */}
          <SchemaAnalysisSection history={history} />

          {/* Step-level advice */}
          <div
            style={{
              background: '#e8f5e9',
              borderRadius: 20,
              padding: 20,
              marginBottom: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#2e7d32', marginBottom: 12 }}>
              🌱 ほごしゃ向け フォローアドバイス
            </div>
            {advice.map((a, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 12,
                  padding: '14px 16px',
                  background: '#fff',
                  borderRadius: 12,
                  borderLeft: '4px solid #43a047',
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#1b5e20',
                    marginBottom: 6,
                  }}
                >
                  {a.title}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: '#2e7d32',
                    marginBottom: a.tips.length > 0 ? 8 : 0,
                  }}
                >
                  {a.why}
                </div>
                {a.tips.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {a.tips.map((tip, j) => (
                      <li
                        key={j}
                        style={{
                          fontSize: 14,
                          lineHeight: 1.7,
                          color: '#388e3c',
                          marginBottom: 4,
                        }}
                      >
                        {tip}
                      </li>
                    ))}
                  </ul>
                )}
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
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#283593', marginBottom: 12 }}>
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
                body: '状況を図のどれで表すかを選ぶ力です。言葉のイメージを視覚化する力で、算数の概念理解の核心です。',
              },
              {
                icon: '🔢',
                label: 'ステップ3：しきをえらぶ',
                color: '#26a69a',
                body: '図に合った式を選ぶ力です。図から式への変換を正確にできることが、計算ミスを減らす鍵になります。',
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
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 'bold',
                      color: s.color,
                      marginBottom: 4,
                    }}
                  >
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
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 12 }}>
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
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>{rec.grade}年</td>
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
      <div style={{ borderTop: '2px dashed #ffcdd2', paddingTop: 20, textAlign: 'center' }}>
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
