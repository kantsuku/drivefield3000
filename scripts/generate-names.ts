/**
 * 2880パターン二語命名バッチ生成
 *
 * 解釈文 + 象徴イメージ + 漢字辞書 → 二語（真名）+ 読み + 英語名
 * 骨格単位（60骨格 × 48パターン）でバッチ処理
 * 1骨格あたり48パターンを一括で命名（骨格内の多様性を確保）
 *
 * Usage: npx tsx scripts/generate-names.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const cores = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../src/data/core-60.json"), "utf-8")
);
const patterns = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../src/data/patterns-2880.json"),
    "utf-8"
  )
);
const interps = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../src/data/interpretations-2880.json"),
    "utf-8"
  )
);
const kanjiDict = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../src/data/kanji-dictionary.json"),
    "utf-8"
  )
);

const PROGRESS_FILE = path.resolve(__dirname, "naming-progress.json");
const OUTPUT_FILE = path.resolve(__dirname, "../src/data/names-2880.json");
const CONCURRENCY = 2; // 命名は重いので2並列

// 解釈マップ
const interpMap: Record<number, any> = {};
for (const r of interps) interpMap[r.pattern_id] = r;

// 漢字リスト
const kanjiList = kanjiDict.map((k: any) => k.kanji).join("");
const kanjiByCategory: Record<string, string[]> = {};
for (const k of kanjiDict) {
  if (!kanjiByCategory[k.main_category]) kanjiByCategory[k.main_category] = [];
  kanjiByCategory[k.main_category].push(k.kanji);
}

const kanjiCategoryStr = Object.entries(kanjiByCategory)
  .map(([cat, chars]) => `${cat}: ${chars.join(" ")}`)
  .join("\n");

interface NameResult {
  pattern_id: number;
  kanji_name: string;
  reading: string;
  english_name: string;
  naming_reason: string;
}

function loadProgress(): Set<number> {
  if (fs.existsSync(PROGRESS_FILE)) {
    const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
    return new Set(data.completed_cores || []);
  }
  return new Set();
}

function saveProgress(completed: Set<number>) {
  fs.writeFileSync(
    PROGRESS_FILE,
    JSON.stringify({ completed_cores: [...completed] }),
    "utf-8"
  );
}

function loadResults(): Record<number, NameResult> {
  if (fs.existsSync(OUTPUT_FILE)) {
    const arr = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
    const map: Record<number, NameResult> = {};
    for (const r of arr) map[r.pattern_id] = r;
    return map;
  }
  return {};
}

function saveResults(results: Record<number, NameResult>) {
  const arr = Object.values(results).sort(
    (a, b) => a.pattern_id - b.pattern_id
  );
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(arr, null, 2), "utf-8");
}

const SYSTEM_PROMPT = `あなたは「疾走領域 / Drive Field 3000」の命名師です。

各パターンの解釈文と象徴イメージから、**漢字2文字の真名**を生み出してください。

## 命名ルール
- 漢字2文字固定
- 必ず以下の漢字辞書から選ぶこと（辞書外の漢字は使用禁止）
- 日本語として読めることを優先
- 二語の組み合わせで**新しい意味や映像**が立ち上がること
- 構造の直訳ではなく、**象徴**として機能すること
- 既存の一般名詞そのまま（温泉、天気、電車、図書館など）は禁止
- 同じバッチ内で同じ二語を使わないこと
- 近い印象の二語が量産されないよう、バリエーションを意識すること

## 英語名ルール
- 二語の直訳でなくてよい
- 世界観として自然でかっこいいことを優先
- 2〜3語程度に収める

## 使用可能な漢字辞書（カテゴリ別）
${kanjiCategoryStr}

## 出力形式
JSON配列で返してください。JSONのみ、前後に説明不要:
[{"pattern_id":1,"kanji_name":"龍牙","reading":"りゅうが","english_name":"Dragon Fang","naming_reason":"衝動を一点に集中させる破壊的な瞬発力の象徴"}]`;

async function generateNamesForCore(
  coreId: number,
  corePatterns: any[],
  existingNames: Set<string>
): Promise<NameResult[]> {
  const core = cores.find((c: any) => c.core_id === coreId);

  const patternDescriptions = corePatterns
    .map((p) => {
      const interp = interpMap[p.pattern_id];
      if (!interp) return null;
      return `- pattern_id:${p.pattern_id} | ${p.bias_type}/${p.output_level}/${p.ignition_label}/${p.time_character_label}
  象徴: ${interp.symbolic_image}
  質感: ${(interp.texture_keywords || []).join(", ")}
  構造: ${interp.structural_interpretation?.substring(0, 80)}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const existingStr =
    existingNames.size > 0
      ? `\n\n## 既に使用済みの二語（これらと同じ組み合わせは禁止）\n${[...existingNames].join("、")}`
      : "";

  const userPrompt = `以下の骨格 ${core.core_code}（${core.rank1}→${core.rank2}→${core.rank3}）に属する${corePatterns.length}パターンに真名をつけてください。

骨格の構造: ${core.drive_structure}

## 各パターン
${patternDescriptions}
${existingStr}

全${corePatterns.length}パターンの真名をJSON配列で返してください。`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match)
    throw new Error(`JSON parse failed for core ${core.core_code}`);

  return JSON.parse(match[0]);
}

async function processCore(
  coreId: number,
  results: Record<number, NameResult>,
  completed: Set<number>,
  usedNames: Set<string>
): Promise<void> {
  if (completed.has(coreId)) return;

  const corePatterns = patterns.filter((p: any) => p.core_id === coreId);

  try {
    const generated = await generateNamesForCore(
      coreId,
      corePatterns,
      usedNames
    );

    let dupeCount = 0;
    for (const r of generated) {
      if (usedNames.has(r.kanji_name)) {
        dupeCount++;
        continue; // skip dupes
      }
      results[r.pattern_id] = r;
      usedNames.add(r.kanji_name);
    }

    if (dupeCount > 0) {
      const core = cores.find((c: any) => c.core_id === coreId);
      console.log(
        `  ! Core ${core?.core_code}: ${dupeCount} dupes skipped`
      );
    }

    completed.add(coreId);
    saveProgress(completed);
    saveResults(results);
  } catch (err: any) {
    const core = cores.find((c: any) => c.core_id === coreId);
    console.error(`  x Core ${core?.core_code} failed: ${err.message}`);
  }
}

async function main() {
  console.log("=== 2880 naming batch ===\n");

  const completed = loadProgress();
  const results = loadResults();
  const usedNames = new Set(
    Object.values(results).map((r) => r.kanji_name)
  );

  console.log(
    `progress: ${completed.size}/60 cores, ${Object.keys(results).length} named, ${usedNames.size} unique names\n`
  );

  const coreIds = cores
    .map((c: any) => c.core_id)
    .filter((id: number) => !completed.has(id));

  if (coreIds.length === 0) {
    console.log("all cores done!");
    return;
  }

  const startTime = Date.now();
  let processed = 0;

  for (let i = 0; i < coreIds.length; i += CONCURRENCY) {
    const chunk = coreIds.slice(i, i + CONCURRENCY);
    const promises = chunk.map((id: number) =>
      processCore(id, results, completed, usedNames)
    );
    await Promise.all(promises);
    processed += chunk.length;

    const elapsed = (Date.now() - startTime) / 1000;
    const rate = processed / elapsed;
    const remaining = (coreIds.length - processed) / rate;

    console.log(
      `  [${completed.size}/60] ${Object.keys(results).length} named | ${usedNames.size} unique | ${elapsed.toFixed(0)}s elapsed | ~${remaining.toFixed(0)}s left`
    );
  }

  // Final stats
  const finalNames = Object.values(results);
  const uniqueNames = new Set(finalNames.map((r) => r.kanji_name));
  console.log(
    `\ndone! ${finalNames.length}/2880 named, ${uniqueNames.size} unique names`
  );

  // Check for any remaining dupes
  const nameCounts: Record<string, number> = {};
  for (const r of finalNames) {
    nameCounts[r.kanji_name] = (nameCounts[r.kanji_name] || 0) + 1;
  }
  const dupes = Object.entries(nameCounts).filter(([, c]) => c > 1);
  if (dupes.length > 0) {
    console.log(`\nWARNING: ${dupes.length} duplicate names found:`);
    for (const [name, count] of dupes) {
      console.log(`  ${name}: ${count}x`);
    }
  }

  console.log(`\noutput: ${OUTPUT_FILE}`);
}

main().catch(console.error);
