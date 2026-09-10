import fs from "node:fs";
import path from "node:path";
import { buildFeedHtml, renderPng } from "./render.js";
import { buildReelScript } from "./reel.js";

// 1通分の出力物を out/YYYY-MM-DD/ に全部書く。
export async function writeOutputs({ letter, day, dateLabel, config, outDir, wantPng }) {
  fs.mkdirSync(outDir, { recursive: true });
  const p = (f) => path.join(outDir, f);

  fs.writeFileSync(p("letter.json"), JSON.stringify({ day, ...letter }, null, 2));

  const caption = `${letter.caption}\n\n#${config.threadsTag}`;
  fs.writeFileSync(p("caption.txt"), caption);

  const reel = buildReelScript({ letter, dateLabel, config });
  fs.writeFileSync(p("reel.md"), reel);

  const html = buildFeedHtml({ letter, dateLabel, config });
  fs.writeFileSync(p("feed.html"), html);

  let png = { ok: false, reason: "PNG は作らない設定" };
  if (wantPng) png = await renderPng({ html, pngPath: p("feed.png"), config });

  const post = [
    `# ${dateLabel} 未来のユミ子から`,
    "",
    "## 1. フィード画像",
    png.ok ? "feed.png をそのまま貼る" : `feed.html をブラウザで開いてスクショ（PNG化できなかった理由：${png.reason}）`,
    "",
    "## 2. Threads キャプション（この下をそのままコピー）",
    "",
    caption,
    "",
    "## 3. 手紙全文（画像の文字起こし。ALTや返信用）",
    "",
    letter.message,
    "",
    `— 未来のユミ子`,
    "",
    "## 4. 今日の一手",
    "",
    letter.request,
    "",
    "## 5. リール",
    "",
    "台本は reel.md。テロップと読み上げは下の行をそのまま",
    "",
    `冒頭テロップ：${letter.hook}`,
    "",
    letter.reel_lines.join("\n"),
    "",
  ].join("\n");
  fs.writeFileSync(p("post.txt"), post);

  return { png };
}
