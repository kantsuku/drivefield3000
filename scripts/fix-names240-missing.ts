/**
 * names-240.jsonの欠けエントリを2880プールから再選定する
 * Usage: npx tsx scripts/fix-names240-missing.ts
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
- 既存の真名との重複禁止

## 出力形式
JSONのみ: [{"id":"...","pattern_id":数字,"kanji_name":"...","reading":"...","romaji":"...","english_name":"...","naming_reason":"..."}]`;

async function selectBatch(
  groups: { id: string; rank1: string; rank2: string; rank3: string; bias: string; candidates: any[] }[],
  existingNames: Set<string>
): Promise<any[]> {
  const descriptions = groups.map((g) => {
    const candidateList = g.candidates
      .filter(c => !existingNames.has(c.kanji_name))
      .map((c, i) => `  ${i + 1}. ${c.kanji_name}（${c.reading}）— ${c.naming_reason}`)
      .join("\n");
    return `【${g.id}】
主神経: ${NEURO[g.rank1]}
副神経: ${NEURO[g.rank2]}
第三: ${NEURO[g.rank3]}
偏り: ${BIAS[g.bias]}
候補:
${candidateList || "  （候補なし）"}`;
  }).join("\n\n---\n\n");

  const res = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: `以下${groups.length}グループそれぞれから最もふさわしい真名を1つ選んでください。\n既存との重複禁止: ${[...existingNames].join("、")}\n\n${descriptions}`,
    }],
  });

  const text = res.content[0].type === "text" ? res.content[0].text : "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("JSON parse failed:\n" + text);
  return JSON.parse(match[0]);
}

async function main() {
  const names240Path = path.resolve(__dirname, "../src/data/names-240.json");
  const names240: any[] = JSON.parse(fs.readFileSync(names240Path, "utf-8"));
  const namesData: any[] = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../src/data/names-2880.json"), "utf-8")
  );
  const patternsData: any[] = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../src/data/patterns-2880.json"), "utf-8")
  );

  const existing = new Set(names240.map(n => n.id));
  const existingNames = new Set(names240.map(n => n.kanji_name));

  // 全240IDを生成
  const ranks = ["D","S","O","N","E"];
  const biases = ["Single","Dual","Trinity","Flat"];
  const allIds: string[] = [];
  for (const r of ranks) {
    for (const r2 of ranks.filter(x => x !== r)) {
      for (const r3 of ranks.filter(x => x !== r && x !== r2)) {
        for (const b of biases) {
          allIds.push(`${r}-${r2}-${r3}-${b}`);
        }
      }
    }
  }

  const missing = allIds.filter(id => !existing.has(id));
  if (missing.length === 0) {
    console.log("欠けているエントリなし");
    return;
  }
  console.log(`欠けているエントリ: ${missing.length}件`);
  missing.forEach(id => console.log(" ", id));

  // 2880プールからグループ化
  const patMap: Record<number, any> = {};
  for (const p of patternsData) patMap[p.pattern_id] = p;

  const groups = missing.map(id => {
    const [rank1, rank2, rank3, bias] = id.split("-");
    const candidates = namesData.filter(n => {
      const p = patMap[n.pattern_id];
      return p && p.core_code === `${rank1}-${rank2}-${rank3}` && p.bias_type === bias;
    });
    return { id, rank1, rank2, rank3, bias, candidates };
  });

  // バッチ処理
  const BATCH_SIZE = 20;
  const results: any[] = [];
  for (let i = 0; i < groups.length; i += BATCH_SIZE) {
    const batch = groups.slice(i, i + BATCH_SIZE);
    console.log(`処理中: ${i + 1}〜${Math.min(i + BATCH_SIZE, groups.length)} / ${groups.length}`);
    try {
      const selected = await selectBatch(batch, existingNames);
      results.push(...selected);
      selected.forEach(s => { existingNames.add(s.kanji_name); });
    } catch (e) {
      console.error("バッチエラー:", e);
      for (const g of batch) {
        const fallback = g.candidates[0];
        if (fallback) {
          results.push({ id: g.id, ...fallback });
          existingNames.add(fallback.kanji_name);
        }
      }
    }
    if (i + BATCH_SIZE < groups.length) await new Promise(r => setTimeout(r, 1000));
  }

  // マージしてソート
  const merged = [...names240, ...results];
  merged.sort((a, b) => a.id < b.id ? -1 : 1);

  fs.writeFileSync(names240Path, JSON.stringify(merged, null, 2), "utf-8");
  console.log(`\n完了! 合計${merged.length}件`);
}

main().catch(console.error);
