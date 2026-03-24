/**
 * names-240.json の各エントリにリード文を生成する
 *
 * Usage: npx tsx scripts/generate-leads-240.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const NEURO: Record<string, string> = {
  D: "ドーパミン（新規・可能性）",
  S: "セロトニン（理解・秩序）",
  O: "オキシトシン（共感・接続）",
  N: "ノルアドレナリン（緊張・集中）",
  E: "エンドルフィン（快感・没入）",
};
const BIAS: Record<string, string> = {
  Single: "一点突破——rank1の衝動が圧倒的に突出",
  Dual:   "二軸駆動——rank1とrank2が拮抗・融合",
  Trinity:"三極共鳴——rank1〜rank3が均衡して回転",
  Flat:   "万能拡散——五衝動がフラットに分散",
};

const SYSTEM = `あなたは「疾走領域 / Drive Field 3000」のコピーライターです。
各パターンに200字程度のリード文を書いてください。

## 条件
- その真名（漢字2文字）に含まれる漢字を文中に自然に使うこと
- 骨子（神経系・バイアス）の意味合いに準じた内容にすること
- 「あなたの」で始めないこと
- 詩的・力強い文体。説明的にならず、情景や感覚で表現する
- 句読点含め180〜220字が理想
- 改行なし、一続きの文章

## 出力形式（JSONのみ・説明不要）
[{"id":"...","lead":"..."}]`;

async function generateBatch(entries: any[]): Promise<{ id: string; lead: string }[]> {
  const content = entries.map((e) => {
    const parts = e.id.split("-");
    const [r1, r2, r3, bias] = parts;
    return `【${e.id}】真名: ${e.kanji_name}（${e.reading}）
主衝動: ${NEURO[r1]} / 副: ${NEURO[r2]} / 第三: ${NEURO[r3]}
バイアス: ${BIAS[bias]}
命名理由: ${e.naming_reason}`;
  }).join("\n\n---\n\n");

  const res = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: SYSTEM,
    messages: [{ role: "user", content: content + "\n\n以上" + entries.length + "件をJSON配列で。" }],
  });

  const text = res.content[0].type === "text" ? res.content[0].text : "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("JSON parse failed:\n" + text.slice(0, 300));
  return JSON.parse(match[0]);
}

async function main() {
  const file = path.resolve(__dirname, "../src/data/names-240.json");
  const entries: any[] = JSON.parse(fs.readFileSync(file, "utf-8"));

  // すでにlead済みのものはスキップ
  const todo = entries.filter((e) => !e.lead);
  const done = entries.filter((e) => e.lead);
  console.log(`対象: ${todo.length}件 / スキップ(既存): ${done.length}件`);

  const entryMap: Record<string, any> = {};
  for (const e of entries) entryMap[e.id] = { ...e };

  const BATCH = 20;
  let generated = 0;

  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH);
    console.log(`\nバッチ ${Math.floor(i / BATCH) + 1}: ${i + 1}〜${Math.min(i + BATCH, todo.length)} / ${todo.length}`);

    try {
      const results = await generateBatch(batch);
      for (const r of results) {
        if (!r.id || !r.lead) continue;
        if (!entryMap[r.id]) continue;
        entryMap[r.id].lead = r.lead;
        generated++;
        const len = [...r.lead].length;
        console.log(`  ✓ ${r.id}: ${r.lead.slice(0, 20)}… (${len}字)`);
      }
    } catch (err: any) {
      console.error(`  x バッチエラー: ${err.message}`);
    }

    // 中間保存
    const current = entries.map((e) => entryMap[e.id] ?? e);
    fs.writeFileSync(file, JSON.stringify(current, null, 2), "utf-8");
  }

  console.log(`\n完了! ${generated}件を生成 → ${file}`);

  // 未生成チェック
  const missing = entries.filter((e) => !entryMap[e.id]?.lead);
  if (missing.length > 0) {
    console.warn(`未生成: ${missing.length}件`);
    missing.forEach((e) => console.warn(" ", e.id));
  }
}

main().catch(console.error);
