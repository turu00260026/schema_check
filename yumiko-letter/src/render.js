import fs from "node:fs";
import path from "node:path";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// 便箋デザインのフィード画像（1080×1350）。HTML を組んで、Playwright があれば PNG にする。
export function buildFeedHtml({ letter, dateLabel, config }) {
  const im = config.image;
  const lines = letter.message.split("\n").map((s) => s.trim()).filter(Boolean);
  const head = lines[0] ?? "";
  let body = lines.slice(1);
  // 末尾の「で、今日はこれ。」は下の枠が引き受けるので、画像では二重に出さない
  if (body.length && /^で、今日はこれ/.test(body[body.length - 1])) body = body.slice(0, -1);
  const footer = config.handle ? esc(config.handle) : esc(`#${config.threadsTag}`);

  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>未来のユミ子から ${esc(dateLabel)}</title>
<style>
  :root{--paper:${im.paper};--ink:${im.ink};--soft:${im.soft};--rule:${im.rule};--accent:${im.accent}}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:${im.width}px;height:${im.height}px;overflow:hidden;background:var(--paper)}
  body{font-family:${im.fontFamily};color:var(--ink);position:relative;
    background-image:repeating-linear-gradient(to bottom,transparent 0 63px,var(--rule) 63px 64px);
    background-position:0 226px}
  .seal{position:absolute;top:0;left:0;right:0;height:14px;background:var(--accent)}
  .stamp{position:absolute;top:58px;right:84px;width:150px;height:150px;border:2px solid var(--accent);
    border-radius:50%;opacity:.55;display:flex;align-items:center;justify-content:center;flex-direction:column;
    color:var(--accent);font-size:20px;letter-spacing:.12em;transform:rotate(-8deg)}
  .stamp b{font-size:26px;font-weight:600;margin-top:4px}
  .wrap{position:absolute;inset:0;padding:96px 96px 88px}
  .date{color:var(--soft);font-size:26px;letter-spacing:.06em}
  .scene{margin-top:56px;color:var(--soft);font-size:27px;line-height:1.7;padding-left:22px;
    border-left:3px solid var(--accent);max-width:760px}
  .msg{margin-top:44px;font-size:36px;line-height:1.78;letter-spacing:.02em}
  .msg .head{font-weight:600;margin-bottom:.35em}
  .msg p{margin:0}
  .req{margin-top:48px;background:rgba(255,255,255,.55);border:1px solid var(--rule);border-radius:16px;padding:26px 30px}
  .req small{display:block;color:var(--accent);font-size:22px;letter-spacing:.14em;margin-bottom:6px}
  .req p{font-size:34px;font-weight:600;line-height:1.5}
  .sig{position:absolute;right:96px;bottom:126px;font-size:30px;color:var(--soft);letter-spacing:.08em}
  .foot{position:absolute;left:96px;bottom:60px;font-size:22px;color:var(--soft);opacity:.85}
</style>
</head>
<body>
<div class="seal"></div>
<div class="stamp"><span>未来から</span><b>${esc(dateLabel.slice(0, 4))}</b></div>
<div class="wrap">
  <div class="date">${esc(dateLabel)}</div>
  <div class="scene">${esc(letter.scene)}</div>
  <div class="msg" id="msg">
    <p class="head">${esc(head)}</p>
    ${body.map((l) => `<p>${esc(l)}</p>`).join("\n    ")}
  </div>
  <div class="req" id="req"><small>で、今日はこれ</small><p>${esc(letter.request)}</p></div>
</div>
<div class="sig">— 未来のユミ子</div>
<div class="foot">${footer}</div>
<script>
  // 本文が長い日は、署名に当たらないところまで文字を少しずつ小さくする
  (function(){
    var msg=document.getElementById('msg'),req=document.getElementById('req');
    var limit=${im.height}-200;
    var size=36,guard=0;
    while(req.getBoundingClientRect().bottom>limit && size>24 && guard++<30){
      size-=1; msg.style.fontSize=size+'px';
    }
    document.documentElement.setAttribute('data-fitted',size);
  })();
</script>
</body>
</html>`;
}

export async function renderPng({ html, pngPath, config }) {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    return { ok: false, reason: "playwright が入っていません（npm install で入ります）" };
  }
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: config.image.width, height: config.image.height }, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts?.ready);
    await page.screenshot({ path: pngPath, type: "png", fullPage: false });
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e.message };
  } finally {
    await browser?.close();
  }
}
