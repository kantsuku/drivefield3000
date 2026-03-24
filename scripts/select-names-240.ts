/**
 * 2880候補から240パターン分の真名を厳選する
 * Usage: npx tsx scripts/select-names-240.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const NEURO: Record<string, string> = {
  D: "ドーパミン（新規性・可能性）",
  S: "セロトニン（理解・秩序）",
  O: "オキシトシン（共感・接続）",
  N: "ノルアドレナリン（緊張・集中）",
  E: "エンドルフィン（快感・没入）",
};
const BIAS: Record<string, string> = {
  Single: "1位特化（rank1が圧倒的に突出）",
  Dual: "2強型（rank1とrank2が拮抗）",
  Trinity: "3強型（rank1〜rank3が均衡）",
  Flat: "均等型（全体的にバランス）",
};

const SYSTEM_PROMPT = `あなたは「疾走領域 / Drive Field 3000」の命名審査員です。
与えられた候補の中から、そのドライブ構造に最もふさわしい真名を1つ選びます。

## 選定基準
- 力強く記憶に残る
- ドライブ構造の本質を体現している
- 二字熟語として完結している
- 「かっこいい」と直感的に感じられる

## 出力形式
JSONのみ: [{"id":"...","pattern_id":数字,"kanji_name":"...","reading":"...","romaji":"...","english_name":"...","naming_reason":"..."}]`;

async function selectBatch(
  groups: { id: string; rank1: string; rank2: string; rank3: string; bias: string; candidates: any[] }[]
): Promise<any[]> {
  const descriptions = groups.map((g) => {
    const candidateList = g.candidates
      .map((c, i) => `  ${i + 1}. ${c.kanji_name}（${c.reading}）— ${c.naming_reason}`)
      .join("\n");
    return `【${g.id}】
主神経: ${NEURO[g.rank1]}
副神経: ${NEURO[g.rank2]}
第三: ${NEURO[g.rank3]}
偏り: ${BIAS[g.bias]}
候補:
${candidateList}`;
  }).join("\n\n---\n\n");

  const res = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: `以下${groups.length}グループそれぞれから最もふさわしい真名を1つ選んでください。\n\n${descriptions}`,
    }],
  });

  const text = res.content[0].type === "text" ? res.content[0].text : "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("JSON parse failed:\n" + text);
  return JSON.parse(match[0]);
}

async function main() {
  const namesData: any[] = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../src/data/names-2880.json"), "utf-8")
  );
  const patternsData: any[] = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../src/data/patterns-2880.json"), "utf-8")
  );

  // pattern_id → pattern ルックアップ
  const patMap: Record<number, any> = {};
  for (const p of patternsData) patMap[p.pattern_id] = p;

  // 240グループに振り分け
  const groupMap: Record<string, { id: string; rank1: string; rank2: string; rank3: string; bias: string; candidates: any[] }> = {};
  for (const n of namesData) {
    const p = patMap[n.pattern_id];
    if (!p) continue;
    const [rank1, rank2, rank3] = p.core_code.split("-");
    const id = `${p.core_code}-${p.bias_type}`;
    if (!groupMap[id]) {
      groupMap[id] = { id, rank1, rank2, rank3, bias: p.bias_type, candidates: [] };
    }
    groupMap[id].candidates.push(n);
  }

  const groups = Object.values(groupMap);
  console.log(`グループ数: ${groups.length}`);

  // 20件ずつバッチ処理
  const BATCH_SIZE = 20;
  const results: any[] = [];

  for (let i = 0; i < groups.length; i += BATCH_SIZE) {
    const batch = groups.slice(i, i + BATCH_SIZE);
    console.log(`バッチ処理中: ${i + 1}〜${Math.min(i + BATCH_SIZE, groups.length)} / ${groups.length}`);
    try {
      const selected = await selectBatch(batch);
      results.push(...selected);
      console.log(`  → ${selected.length}件選定完了`);
    } catch (e) {
      console.error(`  バッチエラー:`, e);
      // フォールバック: 各グループの先頭候補を使う
      for (const g of batch) {
        const fallback = g.candidates[0];
        results.push({ id: g.id, ...fallback });
        console.log(`  フォールバック: ${g.id} → ${fallback.kanji_name}`);
      }
    }
    // レート制限対策
    if (i + BATCH_SIZE < groups.length) await new Promise(r => setTimeout(r, 1000));
  }

  // id でソート
  results.sort((a, b) => a.id < b.id ? -1 : 1);

  const outPath = path.resolve(__dirname, "../src/data/names-240.json");
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`\n完了! ${results.length}件 → ${outPath}`);

  // 未選定チェック
  const selectedIds = new Set(results.map(r => r.id));
  const missing = groups.filter(g => !selectedIds.has(g.id));
  if (missing.length > 0) {
    console.warn(`未選定: ${missing.length}件`);
    missing.forEach(m => console.warn(" ", m.id));
  }
}

main().catch(console.error);
