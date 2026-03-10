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

  // 全体が優秀
  if (cp >= 80 && sp >= 80 && fp >= 80) {
    advice.push({
      title: '🌟 3ステップすべて高い正答率です！',
      why: '文章を読んで状況を把握し、図に変換し、式を選ぶという一連の流れをしっかり理解できています。文章題の構造理解という点では現時点の課題はほとんどありません。',
      tips: [
        '2年生レベルの問題（かけ算・長さ・かさ）にもチャレンジしてみましょう。',
        '今度は自分で問題を作ってもらうと、さらに深い理解につながります。',
      ],
    });
    return advice;
  }

  // 状況も図も両方弱い（根本的な理解の問題）
  if (cp < 60 && sp < 60) {
    advice.push({
      title: '📌 文章題の構造を理解するところから始めましょう',
      why: '「言葉の読み取り」と「イメージ化」の両方に課題があります。文章題に登場する出来事を「ふえた話・へった話・くらべる話」の3パターンに分けて捉える経験がまだ十分でない段階と考えられます。',
      tips: [
        '日常のできごとを3パターンに分けて声に出してみましょう。例：「ジュースが3本あって2本飲んだね。これは"へった話"だね」',
        '算数の問題より先に、絵本やおはなしで「何が起きたか」を確認するクイズを楽しんでみましょう。',
        '焦らず、まずは「ふえた／へった」の2パターンの区別から始めると着実に力がつきます。',
      ],
    });
  }

  // ステップ1（じょうきょうかくにん）が弱い
  if (cp < 70) {
    advice.push({
      title: '💬 問題文の言葉の意味を読み取るのが苦手なようです',
      why: '「きました・くわえました」→増えた、「たべました・あげました」→減った、「どちらがおおい」→比べる、というように、文章の動詞や状況語から"何が起きているか"を判断する力が育ちかけている段階です。計算力とは別の、文章を読む力の問題です。',
      tips: [
        '問題文を一緒に音読しながら、「ここで何が変わったの？」と問いかけてみましょう。',
        '「〜しました」「〜になりました」などの動詞に印をつけ、「これはふえた話？へった話？」と確認する習慣をつけましょう。',
        '日常会話でも「今のは"ふえた"ね」「これは"くらべてる"ね」と意識して声に出すと、語彙と状況認識がつながっていきます。',
        '絵本を読んだあとに「この場面、数は増えた？減った？」と問いかけるのも効果的です。',
      ],
    });
  }

  // ステップ2（ずをえらぶ）が弱い
  if (sp < 70) {
    advice.push({
      title: '🖼️ 問題の内容を頭の中でイメージするのが苦手なようです',
      why: '言葉で状況を理解できても、それを「たす図（2つを合わせる）・とる図（一部がなくなる）・くらべる図（横に並べる）」のどれかに変換するイメージ力が発展途上です。算数の苦手さの多くはここで起きています。',
      tips: [
        'おはじき・ブロック・折り紙など、実際に手で動かせるものを使って問題の状況を再現してみましょう。体の動きとイメージが結びつきます。',
        '問題文を読んだあと、紙に簡単な丸や棒で絵を描いてみましょう。「絵に描く→図を選ぶ」の順番が助けになります。',
        'おやつの時間などに「3個あって2個食べたら残りは？図で描くとどうなる？」と日常の場面で練習しましょう。',
        '「たす図は合わせる動き・とる図は取り出す動き・くらべる図は横に並べる動き」と体で表現させると記憶に残ります。',
      ],
    });
  }

  // ステップ3（しきをえらぶ）が弱い
  if (fp < 70) {
    advice.push({
      title: '🔢 式の作り方の仕組みがまだつかめていないようです',
      why: '状況や図は正しく理解できていても、それを「＋か－か」の式に変換するルールが自動化されていない段階です。計算自体はできていても「なぜこの式になるのか」の根拠が弱いと、複雑な問題でつまずきやすくなります。',
      tips: [
        '「合わせる・増やす→＋」「取る・減る・違い→－」という対応を、図を指さしながら毎回声に出す習慣をつけましょう。',
        '正解した後でも「なんでたし算だと思ったの？」と理由を説明させましょう。説明できると理解が定着します。',
        '小さな表を作って冷蔵庫に貼るのも効果的です：「ふえる話→＋」「へる話・ちがい→－」',
        '図と式を矢印で結んだノートを一緒に作ってみましょう。視覚的に整理することで結びつきが強まります。',
      ],
    });
  }

  // 状況は読めているが図が選べない（言葉→イメージの変換が弱点）
  if (cp >= 70 && sp < 70) {
    advice.push({
      title: '💡 言葉で理解できているのに、図に変換するところで止まっています',
      why: '「ふえた」とわかっていても、それがどんな「動き」の図に対応するかがピンときていない状態です。言語理解とイメージ化の間にギャップがある典型的なパターンです。',
      tips: [
        '問題文の状況を一緒に絵で描いてみましょう。「8人いて5人来たね、どう描く？」と手を動かすことでイメージが育ちます。',
        '3種類の図の「動き」を体で表現してみましょう。合わせるは両手を合わせるジェスチャー、取るは引っ張るジェスチャー、くらべるは手を横に並べるジェスチャーなど。',
      ],
    });
  }

  // 図は選べているが式が選べない（イメージ→式の変換が弱点）
  if (sp >= 70 && fp < 70) {
    advice.push({
      title: '💡 図は正しく選べているのに、式への変換でミスしています',
      why: '「合わせる図＝＋」「取る図＝－」という対応がまだ反射的につながっていない段階です。図の意味はわかっているので、あと一歩の練習で改善しやすいパターンです。',
      tips: [
        '正しく選んだ図を指さしながら「この図、2つ合わせてるね。合わせるって何算だっけ？」と毎回声に出して確認しましょう。',
        '図→式の変換を声に出す回数を増やすことが最短の解決策です。5回声に出すと自動化が始まります。',
      ],
    });
  }

  if (advice.length === 0) {
    advice.push({
      title: '📖 まずは問題に挑戦してみましょう',
      why: 'テスト結果が集まると、より詳しいアドバイスが表示されます。',
      tips: [],
    });
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
                  marginBottom: 12,
                  padding: '14px 16px',
                  background: '#fff',
                  borderRadius: 12,
                  borderLeft: '4px solid #43a047',
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1b5e20', marginBottom: 6 }}>
                  {a.title}
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.7, color: '#2e7d32', marginBottom: a.tips.length > 0 ? 8 : 0 }}>
                  {a.why}
                </div>
                {a.tips.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {a.tips.map((tip, j) => (
                      <li key={j} style={{ fontSize: 14, lineHeight: 1.7, color: '#388e3c', marginBottom: 4 }}>
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
