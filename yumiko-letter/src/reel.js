// リール台本。便箋の静止画＋テロップ、ナレーションは手紙の読み上げ、という前提で組む。
// 秒数は文字数から機械的に出す（AI音声でもつるさんの声でも、目安として使う）。

const fmt = (s) => s.toFixed(1).padStart(4, " ");
const countChars = (s) => [...String(s).replace(/\s/g, "")].length;

function timeline(lines, { secondsPerChar, pauseSeconds }, startAt = 0) {
  let t = startAt;
  const rows = [];
  for (const line of lines) {
    const dur = Math.max(1.4, countChars(line) * secondsPerChar + pauseSeconds);
    rows.push({ start: t, end: t + dur, text: line });
    t += dur;
  }
  return { rows, total: t };
}

export function buildReelScript({ letter, dateLabel, config }) {
  const opt = config.reel;
  const hookSec = 1.8;

  // 短い版：reel_lines をそのまま読む
  const short = timeline(letter.reel_lines, opt, hookSec);
  // 全文版：手紙本文を句点ごとの行で読む
  const fullLines = letter.message.split("\n").map((s) => s.trim()).filter(Boolean);
  const full = timeline(fullLines, opt, hookSec);

  const shortOk = short.total <= opt.maxSeconds;
  const fullOk = full.total <= opt.maxSeconds;
  const recommend = fullOk ? "全文版" : "短い版";

  const render = (title, tl, lines) => {
    const out = [];
    out.push(`## ${title}（約${Math.ceil(tl.total)}秒）`);
    out.push("");
    out.push("| 秒 | 字幕テロップ | 画面 |");
    out.push("|---|---|---|");
    out.push(`| ${fmt(0)}〜${fmt(hookSec)} | ${letter.hook} | 便箋を閉じた状態。封の色（差し色）だけ見える |`);
    tl.rows.forEach((r, i) => {
      const screen = i === 0 ? "便箋が開く。以降は本文が1行ずつ浮かぶ" : i === tl.rows.length - 1 ? "最後の行だけ少し大きく。署名「— 未来のユミ子」が下に出る" : "";
      out.push(`| ${fmt(r.start)}〜${fmt(r.end)} | ${r.text} | ${screen} |`);
    });
    out.push("");
    out.push("### ナレーション（このまま読む）");
    out.push("");
    out.push(lines.join("\n"));
    out.push("");
    return out.join("\n");
  };

  const parts = [];
  parts.push(`# リール台本 ${dateLabel}`);
  parts.push("");
  parts.push(`- 尺の目安：${opt.maxSeconds}秒以内。おすすめは「${recommend}」`);
  parts.push(`- 短い版 約${Math.ceil(short.total)}秒${shortOk ? "" : "（超過。1行削る）"} ／ 全文版 約${Math.ceil(full.total)}秒${fullOk ? "" : "（超過。短い版を使う）"}`);
  parts.push("- 絵：便箋の静止画（feed.png）＋テロップ。アバターの口パクは使わない");
  parts.push("- 声：AI音声でもつるさんの声でも可。読む速さは1文字0.24秒を目安に秒数を出している");
  parts.push("- BGM：小さめ。生活音（給湯室、キーボード）が乗っていると空気が出る");
  parts.push("");
  parts.push(render("短い版", short, letter.reel_lines));
  parts.push(render("全文版", full, fullLines));
  parts.push("### 最後の1枚（両方共通）");
  parts.push("");
  parts.push(`「で、今日はこれ」→「${letter.request}」を1.5秒。署名「— 未来のユミ子」。`);
  parts.push("");
  return parts.join("\n");
}
