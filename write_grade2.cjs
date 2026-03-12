// write_grade2.cjs — CommonJS script to generate grade2.json
// Grade 2 structure:
//   Q01-Q07: かけ算（groups × 7）
//   Q08-Q10: 倍（tape × 3）
//   Q11-Q15: くり上がりのたし算（hitsuzan × 5）
//   Q16-Q20: くり下がりのひき算（hitsuzan × 5）

const fs = require('fs');
const path = require('path');

// Helper to build hitsuzan schema options
// correct:  carry/borrow mark shown, correct result
// noMark:   no mark shown, wrong result (forgot carry/borrow)
// misalign: bottom number shifted (place-value error)
function hitsuzanOpts(top, bottom, op, carryResult, noMarkResult) {
  const markKey = op === '+' ? 'hitsuzanCarry' : 'hitsuzanBorrow';
  return [
    {
      style: 'hitsuzan',
      description: op === '+' ? 'くり上がりあり' : 'くり下がりあり',
      left: { base: '', count: 0 },
      hitsuzanTop: top, hitsuzanBottom: bottom, hitsuzanOp: op,
      [markKey]: true,
      hitsuzanResult: carryResult,
    },
    {
      style: 'hitsuzan',
      description: op === '+' ? 'くり上がりなし？' : 'くり下がりなし？',
      left: { base: '', count: 0 },
      hitsuzanTop: top, hitsuzanBottom: bottom, hitsuzanOp: op,
      [markKey]: false,
      hitsuzanResult: noMarkResult,
    },
    {
      style: 'hitsuzan',
      description: 'くらいがちがう？',
      left: { base: '', count: 0 },
      hitsuzanTop: top, hitsuzanBottom: bottom, hitsuzanOp: op,
      hitsuzanMisalign: true,
      hitsuzanResult: '？',
    },
  ];
}

const grade2 = {
  grade: 2,
  label: '2年生',
  questions: [

    // ─── Q01: かけ算 4×5 ────────────────────────────────────────────
    {
      id: 'g2-q01',
      text: 'おさらに みかんが 4こずつ のっています。おさらが 5まい あります。みかんは ぜんぶで なんこ ですか？',
      intent: '等しい量のまとまり（4×5）かけ算のスキーマ理解',
      explanation: '同じ数ずつのまとまりを合わせるかけ算の場面です。',
      steps: {
        context: {
          question: 'この もんだいは どんな ばめん？',
          correct: 'おなじかずの まとまり',
          options: ['ふえた', 'おなじかずの まとまり', 'なんばい'],
        },
        schema: {
          question: 'どの ずが あっている？',
          correctIndex: 0,
          options: [
            { style: 'groups', description: 'グループ', left: { base: '🍊', count: 4, label: '4こずつ' }, groupCount: 5 },
            { style: 'merge',  description: 'たす',    left: { base: '🍊', count: 4, label: '4こ' }, right: { base: '🍊', count: 5, label: '5こ' } },
            { style: 'compare',description: 'くらべる',left: { base: '🍊', count: 4, label: '4こ' }, right: { base: '🍊', count: 5, label: '5こ' } },
          ],
        },
        formula: {
          question: 'しきは どれ？',
          correct: ['4 × 5'],
          options: ['4 × 5', '4 ＋ 5', '5 × 4'],
        },
      },
    },

    // ─── Q02: かけ算 6×3 ────────────────────────────────────────────
    {
      id: 'g2-q02',
      text: 'ふくろに あめが 6こずつ はいっています。3ふくろ あります。あめは ぜんぶで なんこ ですか？',
      intent: '等しい量のまとまり（6×3）かけ算のスキーマ理解',
      explanation: '同じ数ずつのまとまりを合わせるかけ算の場面です。',
      steps: {
        context: {
          question: 'この もんだいは どんな ばめん？',
          correct: 'おなじかずの まとまり',
          options: ['へった', 'おなじかずの まとまり', 'どちらが おおい'],
        },
        schema: {
          question: 'どの ずが あっている？',
          correctIndex: 0,
          options: [
            { style: 'groups', description: 'グループ', left: { base: '🍬', count: 6, label: '6こずつ' }, groupCount: 3 },
            { style: 'remove', description: 'へらす',   left: { base: '🍬', count: 8, label: '6こ' }, removeCount: 3 },
            { style: 'merge',  description: 'たす',     left: { base: '🍬', count: 6, label: '6こ' }, right: { base: '🍬', count: 3, label: '3こ' } },
          ],
        },
        formula: {
          question: 'しきは どれ？',
          correct: ['6 × 3'],
          options: ['6 × 3', '6 ＋ 3', '3 × 6'],
        },
      },
    },

    // ─── Q03: かけ算 3×7 ────────────────────────────────────────────
    {
      id: 'g2-q03',
      text: '1れつに 3人が すわっています。7れつ あります。みんなで なん人 ですか？',
      intent: '等しい量のまとまり（3×7）かけ算のスキーマ理解',
      explanation: '1列ごとに同じ人数がいる、かけ算の場面です。',
      steps: {
        context: {
          question: 'この もんだいは どんな ばめん？',
          correct: 'おなじかずの まとまり',
          options: ['ふえた', 'おなじかずの まとまり', 'なんばい'],
        },
        schema: {
          question: 'どの ずが あっている？',
          correctIndex: 0,
          options: [
            { style: 'groups', description: 'グループ', left: { base: '🧑', count: 3, label: '3人ずつ' }, groupCount: 7 },
            { style: 'compare',description: 'くらべる', left: { base: '🧑', count: 3, label: '3人' }, right: { base: '🧑', count: 7, label: '7れつ' } },
            { style: 'merge',  description: 'たす',     left: { base: '🧑', count: 3, label: '3人' }, right: { base: '🧑', count: 7, label: '7人' } },
          ],
        },
        formula: {
          question: 'しきは どれ？',
          correct: ['3 × 7'],
          options: ['3 × 7', '3 ＋ 7', '7 × 3'],
        },
      },
    },

    // ─── Q04: かけ算 4×6 ────────────────────────────────────────────
    {
      id: 'g2-q04',
      text: 'かごに たまごが 4こずつ はいっています。かごが 6こ あります。たまごは ぜんぶで なんこ ですか？',
      intent: '等しい量のまとまり（4×6）かけ算のスキーマ理解',
      explanation: '同じ数ずつのまとまりを合わせるかけ算の場面です。',
      steps: {
        context: {
          question: 'この もんだいは どんな ばめん？',
          correct: 'おなじかずの まとまり',
          options: ['ふえた', 'おなじかずの まとまり', 'どちらが おおい'],
        },
        schema: {
          question: 'どの ずが あっている？',
          correctIndex: 0,
          options: [
            { style: 'groups', description: 'グループ', left: { base: '🥚', count: 4, label: '4こずつ' }, groupCount: 6 },
            { style: 'merge',  description: 'たす',     left: { base: '🥚', count: 4, label: '4こ' }, right: { base: '🥚', count: 6, label: '6こ' } },
            { style: 'remove', description: 'へらす',   left: { base: '🥚', count: 8, label: '4こ' }, removeCount: 3 },
          ],
        },
        formula: {
          question: 'しきは どれ？',
          correct: ['4 × 6'],
          options: ['4 × 6', '4 ＋ 6', '6 × 4'],
        },
      },
    },

    // ─── Q05: かけ算 5×6 ────────────────────────────────────────────
    {
      id: 'g2-q05',
      text: 'じどうしゃが 1だんに 5だい ならんでいます。6だん あります。ぜんぶで なんだい ですか？',
      intent: '等しい量のまとまり（5×6）かけ算のスキーマ理解',
      explanation: '同じ台数ずつの列がある、かけ算の場面です。',
      steps: {
        context: {
          question: 'この もんだいは どんな ばめん？',
          correct: 'おなじかずの まとまり',
          options: ['ふえた', 'おなじかずの まとまり', 'なんばい'],
        },
        schema: {
          question: 'どの ずが あっている？',
          correctIndex: 0,
          options: [
            { style: 'groups', description: 'グループ', left: { base: '🚗', count: 5, label: '5だいずつ' }, groupCount: 6 },
            { style: 'compare',description: 'くらべる', left: { base: '🚗', count: 5, label: '5だい' }, right: { base: '🚗', count: 6, label: '6だん' } },
            { style: 'merge',  description: 'たす',     left: { base: '🚗', count: 5, label: '5だい' }, right: { base: '🚗', count: 6, label: '6だい' } },
          ],
        },
        formula: {
          question: 'しきは どれ？',
          correct: ['5 × 6'],
          options: ['5 × 6', '5 ＋ 6', '6 × 5'],
        },
      },
    },

    // ─── Q06: かけ算 7×4 ────────────────────────────────────────────
    {
      id: 'g2-q06',
      text: 'はこに チョコレートが 7こずつ はいっています。4はこ あります。チョコレートは ぜんぶで なんこ ですか？',
      intent: '等しい量のまとまり（7×4）かけ算のスキーマ理解',
      explanation: '同じ数ずつのまとまりを合わせるかけ算の場面です。',
      steps: {
        context: {
          question: 'この もんだいは どんな ばめん？',
          correct: 'おなじかずの まとまり',
          options: ['ふえた', 'おなじかずの まとまり', 'なんばい'],
        },
        schema: {
          question: 'どの ずが あっている？',
          correctIndex: 0,
          options: [
            { style: 'groups', description: 'グループ', left: { base: '🍫', count: 7, label: '7こずつ' }, groupCount: 4 },
            { style: 'tape',   description: 'テープ図', left: { base: '🍫', count: 7, label: '7こ' }, right: { label: '？こ' }, multiplier: 4 },
            { style: 'compare',description: 'くらべる', left: { base: '🍫', count: 7, label: '7こ' }, right: { base: '🍫', count: 4, label: '4はこ' } },
          ],
        },
        formula: {
          question: 'しきは どれ？',
          correct: ['7 × 4'],
          options: ['7 × 4', '7 ＋ 4', '4 × 7'],
        },
      },
    },

    // ─── Q07: かけ算 3×8 ────────────────────────────────────────────
    {
      id: 'g2-q07',
      text: '1つの テーブルに いすが 3きゃく あります。テーブルが 8つ あります。いすは ぜんぶで なんきゃく ですか？',
      intent: '等しい量のまとまり（3×8）かけ算のスキーマ理解',
      explanation: '同じ数ずつのまとまりを合わせるかけ算の場面です。',
      steps: {
        context: {
          question: 'この もんだいは どんな ばめん？',
          correct: 'おなじかずの まとまり',
          options: ['ふえた', 'おなじかずの まとまり', 'どちらが おおい'],
        },
        schema: {
          question: 'どの ずが あっている？',
          correctIndex: 0,
          options: [
            { style: 'groups', description: 'グループ', left: { base: '🪑', count: 3, label: '3きゃくずつ' }, groupCount: 8 },
            { style: 'merge',  description: 'たす',     left: { base: '🪑', count: 3, label: '3きゃく' }, right: { base: '🪑', count: 8, label: '8きゃく' } },
            { style: 'compare',description: 'くらべる', left: { base: '🪑', count: 3, label: '3きゃく' }, right: { base: '🪑', count: 8, label: '8つ' } },
          ],
        },
        formula: {
          question: 'しきは どれ？',
          correct: ['3 × 8'],
          options: ['3 × 8', '3 ＋ 8', '8 × 3'],
        },
      },
    },

    // ─── Q08: 倍 7×3 (テープ図) ─────────────────────────────────────
    {
      id: 'g2-q08',
      text: 'あかい リボンが 7cm あります。あおい リボンは あかい リボンの 3ばい です。あおい リボンは なんcm ですか？',
      intent: '「何倍」テープ図で表す（7×3）のスキーマ理解',
      explanation: '基準の量の「3倍」を求めるかけ算の場面です。',
      steps: {
        context: {
          question: 'この もんだいは どんな ばめん？',
          correct: 'なんばい',
          options: ['ふえた', 'おなじかずの まとまり', 'なんばい'],
        },
        schema: {
          question: 'どの ずが あっている？',
          correctIndex: 0,
          options: [
            { style: 'tape',   description: 'テープ図', left: { base: '🔴', count: 7, label: 'あか 7cm' }, right: { label: 'あお ？cm' }, multiplier: 3 },
            { style: 'groups', description: 'グループ', left: { base: '🔴', count: 7, label: '7cm' }, groupCount: 3 },
            { style: 'compare',description: 'くらべる', left: { base: '🔴', count: 7, label: '7cm' }, right: { base: '🔵', count: 5, label: '？cm' } },
          ],
        },
        formula: {
          question: 'しきは どれ？',
          correct: ['7 × 3'],
          options: ['7 × 3', '7 ＋ 3', '7 － 3'],
        },
      },
    },

    // ─── Q09: 倍 8×2 (テープ図) ─────────────────────────────────────
    {
      id: 'g2-q09',
      text: 'ねこが 8ひき います。いぬは ねこの 2ばい います。いぬは なんびき ですか？',
      intent: '「何倍」テープ図で表す（8×2）のスキーマ理解',
      explanation: '基準の量の「2倍」を求めるかけ算の場面です。',
      steps: {
        context: {
          question: 'この もんだいは どんな ばめん？',
          correct: 'なんばい',
          options: ['ふえた', 'なんばい', 'どちらが おおい'],
        },
        schema: {
          question: 'どの ずが あっている？',
          correctIndex: 0,
          options: [
            { style: 'tape',   description: 'テープ図', left: { base: '🐱', count: 8, label: 'ねこ 8ひき' }, right: { label: 'いぬ ？ひき' }, multiplier: 2 },
            { style: 'merge',  description: 'たす',     left: { base: '🐱', count: 8, label: 'ねこ' }, right: { base: '🐶', count: 2, label: '2ばい' } },
            { style: 'compare',description: 'くらべる', left: { base: '🐱', count: 6, label: 'ねこ 8' }, right: { base: '🐶', count: 4, label: 'いぬ ？' } },
          ],
        },
        formula: {
          question: 'しきは どれ？',
          correct: ['8 × 2'],
          options: ['8 × 2', '8 ＋ 2', '8 － 2'],
        },
      },
    },

    // ─── Q10: 倍 6×4 (テープ図) ─────────────────────────────────────
    {
      id: 'g2-q10',
      text: 'きいろい かみが 6まい あります。あかい かみは きいろい かみの 4ばい あります。あかい かみは なんまい ですか？',
      intent: '「何倍」テープ図で表す（6×4）のスキーマ理解',
      explanation: '基準の量の「4倍」を求めるかけ算の場面です。',
      steps: {
        context: {
          question: 'この もんだいは どんな ばめん？',
          correct: 'なんばい',
          options: ['ふえた', 'なんばい', 'おなじかずの まとまり'],
        },
        schema: {
          question: 'どの ずが あっている？',
          correctIndex: 0,
          options: [
            { style: 'tape',   description: 'テープ図', left: { base: '💛', count: 6, label: 'きいろ 6まい' }, right: { label: 'あか ？まい' }, multiplier: 4 },
            { style: 'merge',  description: 'たす',     left: { base: '💛', count: 6, label: '6まい' }, right: { base: '❤️', count: 4, label: '4ばい' } },
            { style: 'groups', description: 'グループ', left: { base: '💛', count: 6, label: '6まい' }, groupCount: 4 },
          ],
        },
        formula: {
          question: 'しきは どれ？',
          correct: ['6 × 4'],
          options: ['6 × 4', '6 ＋ 4', '4 × 6'],
        },
      },
    },

    // ─── Q11: くり上がりのたし算 36+25=61 ────────────────────────────
    // 一の位: 6+5=11 → 書く1、十の位に①くり上げる → 3+2+1=6
    // 間違い（くり上がりなし）: 一の位1書くが十の位に①足さない → 51
    {
      id: 'g2-q11',
      text: '36＋25 の ひっ算を します。一の位は 6＋5＝11 になります。どのように けいさんすれば いいでしょう？',
      intent: 'くり上がりのあるたし算（36+25）ひっ算の理解',
      explanation: '一の位が10以上になったとき、十の位に1くり上げます。',
      steps: {
        context: {
          question: '一の位を たすと どうなる？',
          correct: 'くり上がる',
          options: ['くり上がる', 'そのまま書ける', 'くり下がる'],
        },
        schema: {
          question: 'どのひっ算が ただしい？',
          correctIndex: 0,
          options: hitsuzanOpts(36, 25, '+', '61', '51'),
        },
        formula: {
          question: '一の位の けいさんは どれが ただしい？',
          correct: ['6 ＋ 5 ＝ 11（くり上がる）'],
          options: ['6 ＋ 5 ＝ 11（くり上がる）', '6 ＋ 5 ＝ 1（そのまま）', '6 － 5 ＝ 1'],
        },
      },
    },

    // ─── Q12: くり上がりのたし算 47+38=85 ────────────────────────────
    // 一の位: 7+8=15 → 一の位5、①くり上げ → 4+3+1=8
    // 間違い: 一の位5書いて①足さない → 75
    {
      id: 'g2-q12',
      text: '47＋38 の ひっ算を します。一の位は 7＋8＝15 になります。どのように けいさんすれば いいでしょう？',
      intent: 'くり上がりのあるたし算（47+38）ひっ算の理解',
      explanation: '一の位が10以上になったとき、十の位に1くり上げます。',
      steps: {
        context: {
          question: '一の位を たすと どうなる？',
          correct: 'くり上がる',
          options: ['くり上がる', 'そのまま書ける', 'くり下がる'],
        },
        schema: {
          question: 'どのひっ算が ただしい？',
          correctIndex: 0,
          options: hitsuzanOpts(47, 38, '+', '85', '75'),
        },
        formula: {
          question: '一の位の けいさんは どれが ただしい？',
          correct: ['7 ＋ 8 ＝ 15（くり上がる）'],
          options: ['7 ＋ 8 ＝ 15（くり上がる）', '7 ＋ 8 ＝ 5（そのまま）', '8 － 7 ＝ 1'],
        },
      },
    },

    // ─── Q13: くり上がりのたし算 54+29=83 ────────────────────────────
    // 一の位: 4+9=13 → 一の位3、①くり上げ → 5+2+1=8
    // 間違い: 一の位3で①なし → 73
    {
      id: 'g2-q13',
      text: '54＋29 の ひっ算を します。一の位は 4＋9＝13 になります。どのように けいさんすれば いいでしょう？',
      intent: 'くり上がりのあるたし算（54+29）ひっ算の理解',
      explanation: '一の位が10以上になったとき、十の位に1くり上げます。',
      steps: {
        context: {
          question: '一の位を たすと どうなる？',
          correct: 'くり上がる',
          options: ['くり上がる', 'そのまま書ける', 'くり下がる'],
        },
        schema: {
          question: 'どのひっ算が ただしい？',
          correctIndex: 0,
          options: hitsuzanOpts(54, 29, '+', '83', '73'),
        },
        formula: {
          question: '一の位の けいさんは どれが ただしい？',
          correct: ['4 ＋ 9 ＝ 13（くり上がる）'],
          options: ['4 ＋ 9 ＝ 13（くり上がる）', '4 ＋ 9 ＝ 3（そのまま）', '9 － 4 ＝ 5'],
        },
      },
    },

    // ─── Q14: くり上がりのたし算 28+56=84 ────────────────────────────
    // 一の位: 8+6=14 → 一の位4、①くり上げ → 2+5+1=8
    // 間違い: ①なし → 74
    {
      id: 'g2-q14',
      text: '28＋56 の ひっ算を します。一の位は 8＋6＝14 になります。どのように けいさんすれば いいでしょう？',
      intent: 'くり上がりのあるたし算（28+56）ひっ算の理解',
      explanation: '一の位が10以上になったとき、十の位に1くり上げます。',
      steps: {
        context: {
          question: '一の位を たすと どうなる？',
          correct: 'くり上がる',
          options: ['くり上がる', 'そのまま書ける', 'くり下がる'],
        },
        schema: {
          question: 'どのひっ算が ただしい？',
          correctIndex: 0,
          options: hitsuzanOpts(28, 56, '+', '84', '74'),
        },
        formula: {
          question: '一の位の けいさんは どれが ただしい？',
          correct: ['8 ＋ 6 ＝ 14（くり上がる）'],
          options: ['8 ＋ 6 ＝ 14（くり上がる）', '8 ＋ 6 ＝ 4（そのまま）', '8 － 6 ＝ 2'],
        },
      },
    },

    // ─── Q15: くり上がりのたし算 63+29=92 ────────────────────────────
    // 一の位: 3+9=12 → 一の位2、①くり上げ → 6+2+1=9
    // 間違い: ①なし → 82
    {
      id: 'g2-q15',
      text: '63＋29 の ひっ算を します。一の位は 3＋9＝12 になります。どのように けいさんすれば いいでしょう？',
      intent: 'くり上がりのあるたし算（63+29）ひっ算の理解',
      explanation: '一の位が10以上になったとき、十の位に1くり上げます。',
      steps: {
        context: {
          question: '一の位を たすと どうなる？',
          correct: 'くり上がる',
          options: ['くり上がる', 'そのまま書ける', 'くり下がる'],
        },
        schema: {
          question: 'どのひっ算が ただしい？',
          correctIndex: 0,
          options: hitsuzanOpts(63, 29, '+', '92', '82'),
        },
        formula: {
          question: '一の位の けいさんは どれが ただしい？',
          correct: ['3 ＋ 9 ＝ 12（くり上がる）'],
          options: ['3 ＋ 9 ＝ 12（くり上がる）', '3 ＋ 9 ＝ 2（そのまま）', '9 － 3 ＝ 6'],
        },
      },
    },

    // ─── Q16: くり下がりのひき算 53-27=26 ────────────────────────────
    // 一の位: 3<7 → 十の位から借りて13-7=6、十の位: 5-1-2=2
    // 間違い（逆に引く）: 7-3=4、十の位5-2=3 → 34
    {
      id: 'g2-q16',
      text: '53－27 の ひっ算を します。一の位は 3 から 7 は ひけません。どのように けいさんすれば いいでしょう？',
      intent: 'くり下がりのあるひき算（53-27）ひっ算の理解',
      explanation: '一の位が足りないとき、十の位から10を借りてひきます。',
      steps: {
        context: {
          question: '一の位を ひくと どうなる？',
          correct: 'くり下がる',
          options: ['くり下がる', 'そのまま引ける', 'くり上がる'],
        },
        schema: {
          question: 'どのひっ算が ただしい？',
          correctIndex: 0,
          options: hitsuzanOpts(53, 27, '-', '26', '34'),
        },
        formula: {
          question: '一の位の けいさんは どれが ただしい？',
          correct: ['13 ー 7 ＝ 6（くり下がる）'],
          options: ['13 ー 7 ＝ 6（くり下がる）', '3 ー 7 はできない', '7 ー 3 ＝ 4'],
        },
      },
    },

    // ─── Q17: くり下がりのひき算 72-45=27 ────────────────────────────
    // 一の位: 2<5 → 12-5=7、十の位: 7-1-4=2
    // 間違い（逆）: 5-2=3、十の位7-4=3 → 33
    {
      id: 'g2-q17',
      text: '72－45 の ひっ算を します。一の位は 2 から 5 は ひけません。どのように けいさんすれば いいでしょう？',
      intent: 'くり下がりのあるひき算（72-45）ひっ算の理解',
      explanation: '一の位が足りないとき、十の位から10を借りてひきます。',
      steps: {
        context: {
          question: '一の位を ひくと どうなる？',
          correct: 'くり下がる',
          options: ['くり下がる', 'そのまま引ける', 'くり上がる'],
        },
        schema: {
          question: 'どのひっ算が ただしい？',
          correctIndex: 0,
          options: hitsuzanOpts(72, 45, '-', '27', '33'),
        },
        formula: {
          question: '一の位の けいさんは どれが ただしい？',
          correct: ['12 ー 5 ＝ 7（くり下がる）'],
          options: ['12 ー 5 ＝ 7（くり下がる）', '2 ー 5 はできない', '5 ー 2 ＝ 3'],
        },
      },
    },

    // ─── Q18: くり下がりのひき算 84-37=47 ────────────────────────────
    // 一の位: 4<7 → 14-7=7、十の位: 8-1-3=4
    // 間違い（逆）: 7-4=3、十の位8-3=5 → 53
    {
      id: 'g2-q18',
      text: '84－37 の ひっ算を します。一の位は 4 から 7 は ひけません。どのように けいさんすれば いいでしょう？',
      intent: 'くり下がりのあるひき算（84-37）ひっ算の理解',
      explanation: '一の位が足りないとき、十の位から10を借りてひきます。',
      steps: {
        context: {
          question: '一の位を ひくと どうなる？',
          correct: 'くり下がる',
          options: ['くり下がる', 'そのまま引ける', 'くり上がる'],
        },
        schema: {
          question: 'どのひっ算が ただしい？',
          correctIndex: 0,
          options: hitsuzanOpts(84, 37, '-', '47', '53'),
        },
        formula: {
          question: '一の位の けいさんは どれが ただしい？',
          correct: ['14 ー 7 ＝ 7（くり下がる）'],
          options: ['14 ー 7 ＝ 7（くり下がる）', '4 ー 7 はできない', '7 ー 4 ＝ 3'],
        },
      },
    },

    // ─── Q19: くり下がりのひき算 91-37=54 ────────────────────────────
    // 一の位: 1<7 → 11-7=4、十の位: 9-1-3=5
    // 間違い（逆）: 7-1=6、十の位9-3=6 → 66
    {
      id: 'g2-q19',
      text: '91－37 の ひっ算を します。一の位は 1 から 7 は ひけません。どのように けいさんすれば いいでしょう？',
      intent: 'くり下がりのあるひき算（91-37）ひっ算の理解',
      explanation: '一の位が足りないとき、十の位から10を借りてひきます。',
      steps: {
        context: {
          question: '一の位を ひくと どうなる？',
          correct: 'くり下がる',
          options: ['くり下がる', 'そのまま引ける', 'くり上がる'],
        },
        schema: {
          question: 'どのひっ算が ただしい？',
          correctIndex: 0,
          options: hitsuzanOpts(91, 37, '-', '54', '66'),
        },
        formula: {
          question: '一の位の けいさんは どれが ただしい？',
          correct: ['11 ー 7 ＝ 4（くり下がる）'],
          options: ['11 ー 7 ＝ 4（くり下がる）', '1 ー 7 はできない', '7 ー 1 ＝ 6'],
        },
      },
    },

    // ─── Q20: くり下がりのひき算 64-28=36 ────────────────────────────
    // 一の位: 4<8 → 14-8=6、十の位: 6-1-2=3
    // 間違い（逆）: 8-4=4、十の位6-2=4 → 44
    {
      id: 'g2-q20',
      text: '64－28 の ひっ算を します。一の位は 4 から 8 は ひけません。どのように けいさんすれば いいでしょう？',
      intent: 'くり下がりのあるひき算（64-28）ひっ算の理解',
      explanation: '一の位が足りないとき、十の位から10を借りてひきます。',
      steps: {
        context: {
          question: '一の位を ひくと どうなる？',
          correct: 'くり下がる',
          options: ['くり下がる', 'そのまま引ける', 'くり上がる'],
        },
        schema: {
          question: 'どのひっ算が ただしい？',
          correctIndex: 0,
          options: hitsuzanOpts(64, 28, '-', '36', '44'),
        },
        formula: {
          question: '一の位の けいさんは どれが ただしい？',
          correct: ['14 ー 8 ＝ 6（くり下がる）'],
          options: ['14 ー 8 ＝ 6（くり下がる）', '4 ー 8 はできない', '8 ー 4 ＝ 4'],
        },
      },
    },

  ],
};

const outPath = path.join(__dirname, 'src', 'data', 'questions', 'grade2.json');
fs.writeFileSync(outPath, JSON.stringify(grade2, null, 2), 'utf-8');
console.log('Written:', outPath);
