#!/usr/bin/env node
// 未来のユミ子から、今日の1通を出す。
//   node make_letter.js            今日の分（既にあれば同じ手紙をもう一度出力）
//   node make_letter.js --again    今日の分を書き直す
//   node make_letter.js --sample   APIを呼ばずに見本で配線確認
//   node make_letter.js --no-png   画像PNGを作らない（feed.html だけ）
//   node make_letter.js --date 2026-09-10   日付を指定（テスト用）
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateLetter, validateLetter } from "./src/generate.js";
import { loadRecent, appendHistory } from "./src/history.js";
import { writeOutputs } from "./src/outputs.js";
import { SAMPLE_LETTER } from "./src/sample.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = new Set(process.argv.slice(2));
const argValue = (name) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const config = JSON.parse(fs.readFileSync(path.join(here, "config.json"), "utf8"));
const outRoot = argValue("--out") ?? path.join(here, "out");

function todayParts(override) {
  const d = override ? new Date(`${override}T12:00:00`) : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const w = "日月火水木金土"[d.getDay()];
  return { day: `${y}-${m}-${dd}`, dateLabel: `${y}年${d.getMonth() + 1}月${d.getDate()}日（${w}）` };
}

async function main() {
  const { day, dateLabel } = todayParts(argValue("--date"));
  const outDir = path.join(outRoot, day);
  const letterFile = path.join(outDir, "letter.json");
  const again = args.has("--again");
  const wantPng = !args.has("--no-png");

  let letter;
  let source;
  if (!again && fs.existsSync(letterFile)) {
    letter = validateLetter(JSON.parse(fs.readFileSync(letterFile, "utf8")));
    source = "今日の分はもう届いていたので、同じ手紙を出し直しました（書き直すなら --again）";
  } else if (args.has("--sample")) {
    letter = validateLetter(SAMPLE_LETTER);
    source = "見本の手紙（--sample）";
  } else {
    const recent = loadRecent(outRoot, config.recentScenesToAvoid);
    process.stdout.write("向こうから届くまで少し…\n");
    const r = await generateLetter({ config, dateLabel, recent });
    letter = r.letter;
    source = `${r.model} が書いた新しい手紙（入力${r.usage.input_tokens} / 出力${r.usage.output_tokens} トークン）`;
  }

  const { png } = await writeOutputs({ letter, day, dateLabel, config, outDir, wantPng });
  appendHistory(outRoot, { day, scene: letter.scene, request: letter.request });

  console.log("");
  console.log(`■ ${dateLabel} 未来のユミ子から`);
  console.log(`  ${source}`);
  console.log("");
  console.log(letter.message.split("\n").map((l) => "  " + l).join("\n"));
  console.log("");
  console.log(`  で、今日はこれ → ${letter.request}`);
  console.log("");
  console.log(`  出力先: ${outDir}`);
  console.log(`    feed.png     ${png.ok ? "フィード画像（貼るだけ）" : "作れず → feed.html を開いてスクショ（" + png.reason + "）"}`);
  console.log(`    caption.txt  Threads キャプション（コピーして貼るだけ）`);
  console.log(`    reel.md      リール台本（秒数つき）`);
  console.log(`    post.txt     全部入り`);
}

main().catch((e) => {
  console.error("届かなかった：", e.message);
  process.exit(1);
});
