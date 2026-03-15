/**
 * write_grade3.cjs
 * 3年生の問題データを生成して src/data/questions/grade3.json に書き出す
 *
 * 6スキーマ × 5問 = 30問
 *  1. divide-equal  (等分除)        Q01-Q05
 *  2. divide-group  (包含除)        Q06-Q10
 *  3. remainder     (あまりのあるわり算) Q11-Q15
 *  4. fraction      (分数)           Q16-Q20
 *  5. decimal       (小数)           Q21-Q25
 *  6. tape-reverse  (倍の逆算)       Q26-Q30
 */

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────
// Helper: divide-equal schema options
// correct: total/groups per group shown correctly
// wrong1: one too few per group
// wrong2: wrong total shown
// ─────────────────────────────────────────────
function divEqualOpts(total, groups, emoji) {
  const correct = total / groups;
  return [
    {
      style: 'divide-equal',
      description: `${total}こを${groups}つに等分 → 1つあたり${correct}こ（正しい）`,
      left: { base: emoji, count: total },
      divideTotal: total,
      divideBy: groups,
      divideEmoji: emoji,
      divideShowEach: correct,
    },
    {
      style: 'divide-equal',
      description: `${total}こを${groups}つに等分 → 1つあたり${correct - 1}こ（少なすぎる）`,
      left: { base: emoji, count: total },
      divideTotal: total,
      divideBy: groups,
      divideEmoji: emoji,
      divideShowEach: correct - 1,
    },
    {
      style: 'divide-equal',
      description: `${total}こを${groups}つに等分 → 1つあたり${correct + 1}こ（多すぎる）`,
      left: { base: emoji, count: total },
      divideTotal: total,
      divideBy: groups,
      divideEmoji: emoji,
      divideShowEach: correct + 1,
    },
  ];
}

// ─────────────────────────────────────────────
// Helper: divide-group schema options
// correct: total items split into groups of groupSize
// wrong: different groupSize
// ─────────────────────────────────────────────
function divGroupOpts(total, groupSize, emoji) {
  return [
    {
      style: 'divide-group',
      description: `${total}こを${groupSize}こずつ → ${total / groupSize}グループ（正しい）`,
      left: { base: emoji, count: total },
      divideTotal: total,
      divideGroupSize: groupSize,
      divideEmoji: emoji,
    },
    {
      style: 'divide-group',
      description: `${total}こを${groupSize + 1}こずつ → ${Math.floor(total / (groupSize + 1))}グループ（多い）`,
      left: { base: emoji, count: total },
      divideTotal: total,
      divideGroupSize: groupSize + 1,
      divideEmoji: emoji,
    },
    {
      style: 'divide-group',
      description: `${total}こを${groupSize - 1}こずつ → ${Math.floor(total / (groupSize - 1))}グループ（少ない）`,
      left: { base: emoji, count: total },
      divideTotal: total,
      divideGroupSize: groupSize - 1,
      divideEmoji: emoji,
    },
  ];
}

// ─────────────────────────────────────────────
// Helper: remainder options
// ─────────────────────────────────────────────
function remainderOpts(total, by, emoji) {
  const q = Math.floor(total / by);
  const r = total % by;
  // wrong1: quotient off by 1, remainder wrong
  const wrong1q = q - 1;
  const wrong1r = r + by;
  // wrong2: remainder = 0 (forgot remainder)
  const wrong2q = q + 1;
  const wrong2r = 0;
  return [
    {
      style: 'remainder',
      description: `${total}÷${by} = ${q}あまり${r}（正しい）`,
      left: { base: emoji, count: total },
      divideTotal: total,
      divideBy: by,
      divideQuotient: q,
      divideRemainder: r,
      divideEmoji: emoji,
    },
    {
      style: 'remainder',
      description: `${total}÷${by} = ${wrong1q}あまり${wrong1r}（商が少ない）`,
      left: { base: emoji, count: total },
      divideTotal: total,
      divideBy: by,
      divideQuotient: wrong1q,
      divideRemainder: wrong1r,
      divideEmoji: emoji,
    },
    {
      style: 'remainder',
      description: `${total}÷${by} = ${wrong2q}あまり${wrong2r}（あまりなし）`,
      left: { base: emoji, count: total },
      divideTotal: total,
      divideBy: by,
      divideQuotient: wrong2q,
      divideRemainder: wrong2r,
      divideEmoji: emoji,
    },
  ];
}

// ─────────────────────────────────────────────
// Helper: fraction options
// ─────────────────────────────────────────────
function fractionOpts(numer, denom, emoji) {
  const wrongHighlight1 = numer + 1 <= denom ? numer + 1 : numer - 1;
  const wrongHighlight2 = numer - 1 >= 1 ? numer - 1 : numer + 1;
  return [
    {
      style: 'fraction',
      description: `${denom}分の${numer}（正しい）`,
      left: { base: '', count: 0 },
      fractionNumerator: numer,
      fractionDenominator: denom,
      fractionEmoji: emoji,
      fractionHighlight: numer,
    },
    {
      style: 'fraction',
      description: `${denom}分の${wrongHighlight1}（${wrongHighlight1}つ着色：多い）`,
      left: { base: '', count: 0 },
      fractionNumerator: wrongHighlight1,
      fractionDenominator: denom,
      fractionEmoji: emoji,
      fractionHighlight: wrongHighlight1,
    },
    {
      style: 'fraction',
      description: `${denom}分の${wrongHighlight2}（${wrongHighlight2}つ着色：少ない）`,
      left: { base: '', count: 0 },
      fractionNumerator: wrongHighlight2,
      fractionDenominator: denom,
      fractionEmoji: emoji,
      fractionHighlight: wrongHighlight2,
    },
  ];
}

// ─────────────────────────────────────────────
// Helper: decimal options
// ─────────────────────────────────────────────
function decimalOpts(val, minV, maxV) {
  // parse to find neighbors
  const v = parseFloat(val);
  const step = 0.1;
  const wrong1 = (v + step).toFixed(1);
  const wrong2 = (v - step).toFixed(1);
  return [
    {
      style: 'decimal',
      description: `${val}（正しい位置）`,
      left: { base: '', count: 0 },
      decimalValue: val,
      decimalMin: minV,
      decimalMax: maxV,
    },
    {
      style: 'decimal',
      description: `${wrong1}（0.1大きい位置：誤り）`,
      left: { base: '', count: 0 },
      decimalValue: val,
      decimalMin: minV,
      decimalMax: maxV,
      decimalWrong: wrong1,
    },
    {
      style: 'decimal',
      description: `${wrong2}（0.1小さい位置：誤り）`,
      left: { base: '', count: 0 },
      decimalValue: val,
      decimalMin: minV,
      decimalMax: maxV,
      decimalWrong: wrong2,
    },
  ];
}

// ─────────────────────────────────────────────
// Helper: tape-reverse options
// tapeBase: もとの数, tapeCompare: くらべる数
// tapeTimes: 正しい倍数
// ─────────────────────────────────────────────
function tapeRevOpts(base, compare, baseLabel, compareLabel, unit) {
  const times = compare / base;
  return [
    {
      style: 'tape-reverse',
      description: `${compare}${unit} ÷ ${base}${unit} = ${times}ばい（正しい）`,
      left: { base: '', count: 0 },
      tapeBase: base,
      tapeBaseLabel: baseLabel,
      tapeCompare: compare,
      tapeCompareLabel: compareLabel,
      tapeUnit: unit,
      tapeTimes: times,
    },
    {
      style: 'tape-reverse',
      description: `${compare}${unit} ÷ ${base}${unit} = ${times + 1}ばい（1多い：誤り）`,
      left: { base: '', count: 0 },
      tapeBase: base,
      tapeBaseLabel: baseLabel,
      tapeCompare: base * (times + 1),
      tapeCompareLabel: compareLabel,
      tapeUnit: unit,
      tapeTimes: times + 1,
    },
    {
      style: 'tape-reverse',
      description: `${compare}${unit} ÷ ${base}${unit} = ${times - 1}ばい（1少ない：誤り）`,
      left: { base: '', count: 0 },
      tapeBase: base,
      tapeBaseLabel: baseLabel,
      tapeCompare: base * (times - 1),
      tapeCompareLabel: compareLabel,
      tapeUnit: unit,
      tapeTimes: times - 1,
    },
  ];
}

// ─────────────────────────────────────────────
// Question builders
// ─────────────────────────────────────────────

const questions = [
  // ══════════════════════════════════════════
  // Q01-Q05  divide-equal（等分除）
  // ══════════════════════════════════════════
  {
    id: 'g3-q01',
    text: 'りんごが12こあります。3つのかごに同じかずずつ入れると、1つのかごに何こ入りますか？',
    intent: '等分除スキーマ：全体÷グループ数＝1グループあたり',
    explanation: '「同じかずずつ」は等分除。12÷3＝4。',
    steps: {
      context: {
        question: 'この もんだいでは、りんごを どのように わけますか？',
        correct: '3つのかごに同じかずずつ入れる',
        options: [
          '3つのかごに同じかずずつ入れる',
          '1つのかごに3こずつ入れる',
          '12このかごに入れる',
        ],
      },
      schema: {
        question: 'どの図が この もんだいに あっていますか？',
        correctIndex: 0,
        options: divEqualOpts(12, 3, '🍎'),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['12 ÷ 3'],
        options: ['12 ÷ 3', '12 ÷ 4', '12 × 3'],
      },
    },
  },
  {
    id: 'g3-q02',
    text: 'あめが20こあります。4人に同じかずずつ配ると、1人に何こずつ配れますか？',
    intent: '等分除スキーマ：全体÷人数＝1人あたり',
    explanation: '「同じかずずつ」は等分除。20÷4＝5。',
    steps: {
      context: {
        question: 'この もんだいでは、あめを どのように わけますか？',
        correct: '4人に同じかずずつ配る',
        options: [
          '4人に同じかずずつ配る',
          '1人に4こずつ配る',
          '20人に配る',
        ],
      },
      schema: {
        question: 'どの図が この もんだいに あっていますか？',
        correctIndex: 0,
        options: divEqualOpts(20, 4, '🍬'),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['20 ÷ 4'],
        options: ['20 ÷ 4', '20 ÷ 5', '20 × 4'],
      },
    },
  },
  {
    id: 'g3-q03',
    text: 'クッキーが18まいあります。6人に同じかずずつ配ると、1人に何まいずつになりますか？',
    intent: '等分除スキーマ：全体÷人数＝1人あたり',
    explanation: '18÷6＝3。',
    steps: {
      context: {
        question: 'どのように わけますか？',
        correct: '6人に同じかずずつ',
        options: [
          '6人に同じかずずつ',
          '1人に6まいずつ',
          '18人に配る',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: divEqualOpts(18, 6, '🍪'),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['18 ÷ 6'],
        options: ['18 ÷ 6', '18 ÷ 3', '18 × 6'],
      },
    },
  },
  {
    id: 'g3-q04',
    text: 'みかんが24こあります。8つのかごに同じかずずつ入れると、1かごに何こになりますか？',
    intent: '等分除スキーマ：24÷8＝3',
    explanation: '24÷8＝3。',
    steps: {
      context: {
        question: 'どのように わけますか？',
        correct: '8つのかごに同じかずずつ',
        options: [
          '8つのかごに同じかずずつ',
          '1つのかごに8こずつ',
          '24のかごに分ける',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: divEqualOpts(24, 8, '🍊'),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['24 ÷ 8'],
        options: ['24 ÷ 8', '24 ÷ 3', '24 × 8'],
      },
    },
  },
  {
    id: 'g3-q05',
    text: 'チョコレートが30こあります。5人に同じかずずつ配ると、1人何こになりますか？',
    intent: '等分除スキーマ：30÷5＝6',
    explanation: '30÷5＝6。',
    steps: {
      context: {
        question: 'どのように わけますか？',
        correct: '5人に同じかずずつ',
        options: [
          '5人に同じかずずつ',
          '1人に5こずつ',
          '30人に配る',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: divEqualOpts(30, 5, '🍫'),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['30 ÷ 5'],
        options: ['30 ÷ 5', '30 ÷ 6', '30 × 5'],
      },
    },
  },

  // ══════════════════════════════════════════
  // Q06-Q10  divide-group（包含除）
  // ══════════════════════════════════════════
  {
    id: 'g3-q06',
    text: 'ボールが12こあります。1箱に4こずつ入れると、何箱いりますか？',
    intent: '包含除スキーマ：全体÷1グループあたり＝グループ数',
    explanation: '「4こずつ」は包含除。12÷4＝3箱。',
    steps: {
      context: {
        question: 'この もんだいは どんな わけかたですか？',
        correct: '4こずつ箱に入れる',
        options: [
          '4こずつ箱に入れる',
          '4箱に同じかずずつ',
          '12箱に1こずつ',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: divGroupOpts(12, 4, '⚽'),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['12 ÷ 4'],
        options: ['12 ÷ 4', '12 ÷ 3', '12 × 4'],
      },
    },
  },
  {
    id: 'g3-q07',
    text: '花が15本あります。1つの花びんに3本ずつ入れると、花びんは何本いりますか？',
    intent: '包含除スキーマ：15÷3＝5',
    explanation: '「3本ずつ」は包含除。15÷3＝5。',
    steps: {
      context: {
        question: 'どんな わけかたですか？',
        correct: '3本ずつ花びんに入れる',
        options: [
          '3本ずつ花びんに入れる',
          '5つの花びんに同じかずずつ',
          '15の花びんに入れる',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: divGroupOpts(15, 3, '🌸'),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['15 ÷ 3'],
        options: ['15 ÷ 3', '15 ÷ 5', '15 × 3'],
      },
    },
  },
  {
    id: 'g3-q08',
    text: 'みかんが24こあります。1ふくろに6こずつ入れると、何ふくろになりますか？',
    intent: '包含除スキーマ：24÷6＝4',
    explanation: '24÷6＝4ふくろ。',
    steps: {
      context: {
        question: 'どんな わけかたですか？',
        correct: '6こずつふくろに入れる',
        options: [
          '6こずつふくろに入れる',
          '4ふくろに同じかずずつ',
          '24ふくろに1こずつ',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: divGroupOpts(24, 6, '🍊'),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['24 ÷ 6'],
        options: ['24 ÷ 6', '24 ÷ 4', '24 × 6'],
      },
    },
  },
  {
    id: 'g3-q09',
    text: 'えんぴつが18本あります。1人に2本ずつ配ると、何人に配れますか？',
    intent: '包含除スキーマ：18÷2＝9',
    explanation: '18÷2＝9人。',
    steps: {
      context: {
        question: 'どんな わけかたですか？',
        correct: '1人に2本ずつ配る',
        options: [
          '1人に2本ずつ配る',
          '2人に同じかずずつ',
          '18人に1本ずつ',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: divGroupOpts(18, 2, '✏️'),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['18 ÷ 2'],
        options: ['18 ÷ 2', '18 ÷ 9', '18 × 2'],
      },
    },
  },
  {
    id: 'g3-q10',
    text: 'いちごが30こあります。1パックに5こずつ入れると、何パックになりますか？',
    intent: '包含除スキーマ：30÷5＝6',
    explanation: '30÷5＝6パック。',
    steps: {
      context: {
        question: 'どんな わけかたですか？',
        correct: '5こずつパックに入れる',
        options: [
          '5こずつパックに入れる',
          '6パックに同じかずずつ',
          '30パックに1こずつ',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: divGroupOpts(30, 5, '🍓'),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['30 ÷ 5'],
        options: ['30 ÷ 5', '30 ÷ 6', '30 × 5'],
      },
    },
  },

  // ══════════════════════════════════════════
  // Q11-Q15  remainder（あまりのあるわり算）
  // ══════════════════════════════════════════
  {
    id: 'g3-q11',
    text: 'あめが13こあります。1人に4こずつ配ると、何人に配れて、何こあまりますか？',
    intent: 'あまりのあるわり算：13÷4＝3あまり1',
    explanation: '13÷4＝3あまり1。あまりは4より小さい。',
    steps: {
      context: {
        question: 'どんな わけかたですか？',
        correct: '4こずつ配って、あまりが出る',
        options: [
          '4こずつ配って、あまりが出る',
          '3人に同じかずずつ配る',
          '13人に4こずつ配る',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: remainderOpts(13, 4, '🍬'),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['13 ÷ 4'],
        options: ['13 ÷ 4', '13 ÷ 3', '13 × 4'],
      },
    },
  },
  {
    id: 'g3-q12',
    text: 'みかんが17こあります。1袋に5こずつ入れると、何袋できて、何こあまりますか？',
    intent: 'あまりのあるわり算：17÷5＝3あまり2',
    explanation: '17÷5＝3あまり2。',
    steps: {
      context: {
        question: 'どんな わけかたですか？',
        correct: '5こずつ入れて、あまりが出る',
        options: [
          '5こずつ入れて、あまりが出る',
          '3袋に同じかずずつ',
          '17袋に5こずつ',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: remainderOpts(17, 5, '🍊'),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['17 ÷ 5'],
        options: ['17 ÷ 5', '17 ÷ 3', '17 × 5'],
      },
    },
  },
  {
    id: 'g3-q13',
    text: 'クッキーが22まいあります。1人に3まいずつ配ると、何人に配れて、何まいあまりますか？',
    intent: 'あまりのあるわり算：22÷3＝7あまり1',
    explanation: '22÷3＝7あまり1。',
    steps: {
      context: {
        question: 'どんな わけかたですか？',
        correct: '3まいずつ配って、あまりが出る',
        options: [
          '3まいずつ配って、あまりが出る',
          '7人に同じかずずつ',
          '22人に3まいずつ',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: remainderOpts(22, 3, '🍪'),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['22 ÷ 3'],
        options: ['22 ÷ 3', '22 ÷ 7', '22 × 3'],
      },
    },
  },
  {
    id: 'g3-q14',
    text: 'カードが25まいあります。1人に4まいずつ配ると、何人に配れて、何まいあまりますか？',
    intent: 'あまりのあるわり算：25÷4＝6あまり1',
    explanation: '25÷4＝6あまり1。',
    steps: {
      context: {
        question: 'どんな わけかたですか？',
        correct: '4まいずつ配って、あまりが出る',
        options: [
          '4まいずつ配って、あまりが出る',
          '6人に同じかずずつ',
          '25人に4まいずつ',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: remainderOpts(25, 4, '🃏'),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['25 ÷ 4'],
        options: ['25 ÷ 4', '25 ÷ 6', '25 × 4'],
      },
    },
  },
  {
    id: 'g3-q15',
    text: 'おはじきが19こあります。1人に6こずつ配ると、何人に配れて、何こあまりますか？',
    intent: 'あまりのあるわり算：19÷6＝3あまり1',
    explanation: '19÷6＝3あまり1。',
    steps: {
      context: {
        question: 'どんな わけかたですか？',
        correct: '6こずつ配って、あまりが出る',
        options: [
          '6こずつ配って、あまりが出る',
          '3人に同じかずずつ',
          '19人に6こずつ',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: remainderOpts(19, 6, '⚪'),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['19 ÷ 6'],
        options: ['19 ÷ 6', '19 ÷ 3', '19 × 6'],
      },
    },
  },

  // ══════════════════════════════════════════
  // Q16-Q20  fraction（分数）
  // ══════════════════════════════════════════
  {
    id: 'g3-q16',
    text: 'テープを4等分した1つぶんの長さを、分数で書くとどれですか？',
    intent: '分数スキーマ：4等分の1＝1/4',
    explanation: '4等分のうち1つは1/4。',
    steps: {
      context: {
        question: 'テープをどのように分けましたか？',
        correct: '4等分した1つぶん',
        options: [
          '4等分した1つぶん',
          '4等分した3つぶん',
          '1等分した4つぶん',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: fractionOpts(1, 4, ''),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['1 ÷ 4'],
        options: ['1 ÷ 4', '4 ÷ 1', '1 ÷ 3'],
      },
    },
  },
  {
    id: 'g3-q17',
    text: 'ピザを6等分したうちの2まいを食べました。食べた量を分数で書くとどれですか？',
    intent: '分数スキーマ：6等分の2＝2/6',
    explanation: '6等分のうち2つは2/6（1/3と同じ）。',
    steps: {
      context: {
        question: 'ピザをどのように分けて、何まい食べましたか？',
        correct: '6等分して2まい食べた',
        options: [
          '6等分して2まい食べた',
          '2等分して6まい食べた',
          '6等分して4まい食べた',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: fractionOpts(2, 6, ''),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['2 ÷ 6'],
        options: ['2 ÷ 6', '6 ÷ 2', '2 ÷ 4'],
      },
    },
  },
  {
    id: 'g3-q18',
    text: 'リボンを5等分した3つぶんの長さを、分数で書くとどれですか？',
    intent: '分数スキーマ：5等分の3＝3/5',
    explanation: '5等分のうち3つは3/5。',
    steps: {
      context: {
        question: 'リボンをどのように分けましたか？',
        correct: '5等分した3つぶん',
        options: [
          '5等分した3つぶん',
          '5等分した2つぶん',
          '3等分した5つぶん',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: fractionOpts(3, 5, ''),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['3 ÷ 5'],
        options: ['3 ÷ 5', '5 ÷ 3', '3 ÷ 2'],
      },
    },
  },
  {
    id: 'g3-q19',
    text: '水が1dL入る入れものを8等分したうちの3つぶん入っています。水の量を分数で書くとどれですか？',
    intent: '分数スキーマ：8等分の3＝3/8dL',
    explanation: '8等分のうち3つは3/8。',
    steps: {
      context: {
        question: 'どのように分けましたか？',
        correct: '8等分した3つぶん',
        options: [
          '8等分した3つぶん',
          '3等分した8つぶん',
          '8等分した5つぶん',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: fractionOpts(3, 8, ''),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['3 ÷ 8'],
        options: ['3 ÷ 8', '8 ÷ 3', '3 ÷ 5'],
      },
    },
  },
  {
    id: 'g3-q20',
    text: 'チョコレートを9等分した4つぶんを食べました。食べた量を分数で書くとどれですか？',
    intent: '分数スキーマ：9等分の4＝4/9',
    explanation: '9等分のうち4つは4/9。',
    steps: {
      context: {
        question: 'どのように分けて、何つぶん食べましたか？',
        correct: '9等分して4つぶん食べた',
        options: [
          '9等分して4つぶん食べた',
          '4等分して9つぶん食べた',
          '9等分して5つぶん食べた',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: fractionOpts(4, 9, ''),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['4 ÷ 9'],
        options: ['4 ÷ 9', '9 ÷ 4', '4 ÷ 5'],
      },
    },
  },

  // ══════════════════════════════════════════
  // Q21-Q25  decimal（小数）
  // ══════════════════════════════════════════
  {
    id: 'g3-q21',
    text: 'ジュースが1.3dLあります。数直線のどの位置ですか？',
    intent: '小数スキーマ：1と0.1の3こぶん＝1.3',
    explanation: '1.3は1より0.1大きい数が3つぶん。',
    steps: {
      context: {
        question: '1.3dLは 1dLとくらべてどうですか？',
        correct: '1dLより少し多い',
        options: [
          '1dLより少し多い',
          '1dLより少し少ない',
          '2dLよりも多い',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: decimalOpts('1.3', '0', '2'),
      },
      formula: {
        question: '1.3をしきで書くとどれですか？',
        correct: ['1 ＋ 0.3'],
        options: ['1 ＋ 0.3', '1 ＋ 0.4', '1.3 ＋ 1'],
      },
    },
  },
  {
    id: 'g3-q22',
    text: 'リボンが0.7mあります。数直線のどの位置ですか？',
    intent: '小数スキーマ：0と1の間、0.1×7',
    explanation: '0.7は0より0.1大きい数が7つぶん。',
    steps: {
      context: {
        question: '0.7mは どの2つの数の間にありますか？',
        correct: '0mと1mの間',
        options: [
          '0mと1mの間',
          '1mと2mの間',
          '0.5mより小さい',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: decimalOpts('0.7', '0', '1'),
      },
      formula: {
        question: '0.7をしきで書くとどれですか？',
        correct: ['0.1 × 7'],
        options: ['0.1 × 7', '0.1 × 8', '0.7 × 0'],
      },
    },
  },
  {
    id: 'g3-q23',
    text: '水が2.5Lあります。数直線のどの位置ですか？',
    intent: '小数スキーマ：2と3の間、2.5',
    explanation: '2.5は2と3のちょうど真ん中。',
    steps: {
      context: {
        question: '2.5Lは どの2つの数の間にありますか？',
        correct: '2Lと3Lの間',
        options: [
          '2Lと3Lの間',
          '1Lと2Lの間',
          '3Lと4Lの間',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: decimalOpts('2.5', '2', '3'),
      },
      formula: {
        question: '2.5をしきで書くとどれですか？',
        correct: ['2 ＋ 0.5'],
        options: ['2 ＋ 0.5', '2 ＋ 0.6', '2.5 ＋ 2'],
      },
    },
  },
  {
    id: 'g3-q24',
    text: 'なわの長さが3.8mです。数直線のどの位置ですか？',
    intent: '小数スキーマ：3と4の間、3.8',
    explanation: '3.8は3より0.1大きい数が8つぶん。',
    steps: {
      context: {
        question: '3.8mは どの2つの数の間にありますか？',
        correct: '3mと4mの間',
        options: [
          '3mと4mの間',
          '2mと3mの間',
          '4mと5mの間',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: decimalOpts('3.8', '3', '4'),
      },
      formula: {
        question: '3.8をしきで書くとどれですか？',
        correct: ['3 ＋ 0.8'],
        options: ['3 ＋ 0.8', '3 ＋ 0.7', '3.8 ＋ 3'],
      },
    },
  },
  {
    id: 'g3-q25',
    text: 'お茶が1.6dLあります。数直線のどの位置ですか？',
    intent: '小数スキーマ：1と2の間、1.6',
    explanation: '1.6は1より0.1大きい数が6つぶん。',
    steps: {
      context: {
        question: '1.6dLは どの2つの数の間にありますか？',
        correct: '1dLと2dLの間',
        options: [
          '1dLと2dLの間',
          '0dLと1dLの間',
          '2dLと3dLの間',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: decimalOpts('1.6', '1', '2'),
      },
      formula: {
        question: '1.6をしきで書くとどれですか？',
        correct: ['1 ＋ 0.6'],
        options: ['1 ＋ 0.6', '1 ＋ 0.5', '1.6 ＋ 1'],
      },
    },
  },

  // ══════════════════════════════════════════
  // Q26-Q30  tape-reverse（倍の逆算）
  // ══════════════════════════════════════════
  {
    id: 'g3-q26',
    text: 'あかいリボンの長さは4cmです。あおいリボンはあかいリボンの3ばいです。あおいリボンは何cmですか？',
    intent: '倍の逆算スキーマ：4×3＝12',
    explanation: '4×3＝12cm。テープ図でもとの4cmの3ばいが12cm。',
    steps: {
      context: {
        question: 'あおいリボンはあかいリボンとくらべてどうですか？',
        correct: 'あかいリボンの3ばい',
        options: [
          'あかいリボンの3ばい',
          'あかいリボンより3cm長い',
          'あかいリボンより3cm短い',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: tapeRevOpts(4, 12, 'あかい', 'あおい', 'cm'),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['4 × 3'],
        options: ['4 × 3', '4 ＋ 3', '4 ÷ 3'],
      },
    },
  },
  {
    id: 'g3-q27',
    text: 'しろいテープは5cmです。くろいテープはしろいテープの4ばいです。くろいテープは何cmですか？',
    intent: '倍の逆算スキーマ：5×4＝20',
    explanation: '5×4＝20cm。',
    steps: {
      context: {
        question: 'くろいテープはしろいテープとくらべてどうですか？',
        correct: 'しろいテープの4ばい',
        options: [
          'しろいテープの4ばい',
          'しろいテープより4cm長い',
          'しろいテープの4つ分',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: tapeRevOpts(5, 20, 'しろい', 'くろい', 'cm'),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['5 × 4'],
        options: ['5 × 4', '5 ＋ 4', '5 ÷ 4'],
      },
    },
  },
  {
    id: 'g3-q28',
    text: 'みじかいリボンは6cmです。長いリボンはみじかいリボンの何ばいでしょうか？長いリボンは18cmです。',
    intent: '倍の逆算スキーマ（何倍か）：18÷6＝3',
    explanation: '18÷6＝3ばい。',
    steps: {
      context: {
        question: '長いリボンはみじかいリボンとどんな関係ですか？',
        correct: 'みじかいリボンの何ばいかを求める',
        options: [
          'みじかいリボンの何ばいかを求める',
          'みじかいリボンより何cm長いかを求める',
          'みじかいリボンをいくつかに分ける',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: tapeRevOpts(6, 18, 'みじかい', '長い', 'cm'),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['18 ÷ 6'],
        options: ['18 ÷ 6', '18 ＋ 6', '18 × 6'],
      },
    },
  },
  {
    id: 'g3-q29',
    text: 'きいろいリボンは3cmです。あかいリボンはきいろいリボンの何ばいかを求めましょう。あかいリボンは15cmです。',
    intent: '倍の逆算スキーマ：15÷3＝5',
    explanation: '15÷3＝5ばい。',
    steps: {
      context: {
        question: 'あかいリボンはきいろいリボンとどんな関係ですか？',
        correct: 'きいろいリボンの何ばいかを求める',
        options: [
          'きいろいリボンの何ばいかを求める',
          'きいろいリボンより何cm長いかを求める',
          'きいろいリボンをいくつかに分ける',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: tapeRevOpts(3, 15, 'きいろい', 'あかい', 'cm'),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['15 ÷ 3'],
        options: ['15 ÷ 3', '15 ＋ 3', '15 × 3'],
      },
    },
  },
  {
    id: 'g3-q30',
    text: 'みどりのロープは7mです。あおいロープはみどりのロープの何ばいでしょうか？あおいロープは28mです。',
    intent: '倍の逆算スキーマ：28÷7＝4',
    explanation: '28÷7＝4ばい。',
    steps: {
      context: {
        question: 'あおいロープはみどりのロープとどんな関係ですか？',
        correct: 'みどりのロープの何ばいかを求める',
        options: [
          'みどりのロープの何ばいかを求める',
          'みどりのロープより何m長いかを求める',
          'みどりのロープをいくつかに分ける',
        ],
      },
      schema: {
        question: 'どの図が あっていますか？',
        correctIndex: 0,
        options: tapeRevOpts(7, 28, 'みどり', 'あおい', 'm'),
      },
      formula: {
        question: 'しきは どれですか？',
        correct: ['28 ÷ 7'],
        options: ['28 ÷ 7', '28 ＋ 7', '28 × 7'],
      },
    },
  },
];

const grade3Data = {
  grade: 3,
  label: '3年生',
  questions,
};

const outPath = path.join(__dirname, 'src', 'data', 'questions', 'grade3.json');
fs.writeFileSync(outPath, JSON.stringify(grade3Data, null, 2), 'utf8');
console.log(`✅ ${questions.length}問を書き出しました → ${outPath}`);
