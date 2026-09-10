import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, OUTPUT_SCHEMA, buildUserPrompt } from "./persona.js";

const FALLBACK_BETA = "server-side-fallback-2026-07-01";

// 未来のユミ子に1通書かせる。戻り値は検証済みの letter オブジェクト。
export async function generateLetter({ config, dateLabel, recent }) {
  const client = new Anthropic();
  const seed = Math.floor(Math.random() * 1_000_000);
  const user = buildUserPrompt({ dateLabel, recent, seed });

  const base = {
    model: config.model,
    max_tokens: 4000,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: user }],
    output_config: {
      effort: config.effort ?? "medium",
      format: { type: "json_schema", schema: OUTPUT_SCHEMA },
    },
  };

  let response;
  try {
    // 安全分類での拒否時に別モデルへ自動で流す（サーバー側フォールバック）。
    response = await client.beta.messages.create({
      ...base,
      betas: [FALLBACK_BETA],
      fallbacks: "default",
    });
  } catch (err) {
    // フォールバックのベータが使えない組織・環境では通常経路で出し直す。
    if (err instanceof Anthropic.BadRequestError && /fallback|beta/i.test(err.message)) {
      response = await client.messages.create(base);
    } else {
      throw err;
    }
  }

  if (response.stop_reason === "refusal") {
    const why = response.stop_details?.explanation ?? "(理由なし)";
    throw new Error(`モデルが手紙を書くのを断りました：${why}`);
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error("出力が途中で切れました。もう一度実行してください。");
  }

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
  const letter = parseLetter(text);
  return { letter, usage: response.usage, model: response.model };
}

export function parseLetter(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("JSONが見つかりません：" + text.slice(0, 200));
  const d = JSON.parse(m[0]);
  return validateLetter(d);
}

// 生成物の最低限の形式チェック。文字数は「多少の超過は通す・壊れているものは落とす」方針。
export function validateLetter(d) {
  const must = ["scene", "message", "request", "caption", "reel_lines", "hook"];
  for (const k of must) {
    if (d[k] == null || (typeof d[k] === "string" && !d[k].trim())) {
      throw new Error(`手紙の「${k}」が空です`);
    }
  }
  if (!Array.isArray(d.reel_lines) || d.reel_lines.length < 3) {
    throw new Error("reel_lines が3行未満です");
  }
  const strip = (s) => String(s).replace(/\s/g, "");
  if (strip(d.message).length < 80) throw new Error("手紙本文が短すぎます");
  if (strip(d.message).length > 260) throw new Error("手紙本文が長すぎます");
  if ([...d.caption].length > 160) throw new Error("キャプションが長すぎます");
  return {
    scene: d.scene.trim(),
    message: d.message.replace(/\r\n/g, "\n").trim(),
    request: d.request.trim(),
    caption: d.caption.replace(/\r\n/g, "\n").trim(),
    reel_lines: d.reel_lines.map((s) => String(s).trim()).filter(Boolean),
    hook: d.hook.trim(),
  };
}
