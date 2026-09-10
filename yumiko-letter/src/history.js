import fs from "node:fs";
import path from "node:path";

// 直近の手紙の「場面」と「一手」だけを覚えておき、翌日以降の重複を避ける。
// つるさんが手で書くものではない。スクリプトが勝手に読み書きする。
export function loadRecent(outDir, n) {
  const file = path.join(outDir, "history.json");
  try {
    const all = JSON.parse(fs.readFileSync(file, "utf8"));
    return Array.isArray(all) ? all.slice(-n) : [];
  } catch {
    return [];
  }
}

export function appendHistory(outDir, entry, keep = 60) {
  const file = path.join(outDir, "history.json");
  let all = [];
  try {
    all = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!Array.isArray(all)) all = [];
  } catch {}
  all = all.filter((e) => !(e.day === entry.day && e.scene === entry.scene));
  all.push(entry);
  fs.writeFileSync(file, JSON.stringify(all.slice(-keep), null, 2));
}
