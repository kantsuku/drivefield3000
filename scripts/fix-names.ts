/**
 * ダサい名前の修正 + 未命名パターンの補完 + 漢字頻度均等化
 *
 * 1. NG漢字を含む名前を検出
 * 2. 重複名を検出
 * 3. 未命名パターンを検出
 * 4. 漢字使用回数が KANJI_MAX を超えているパターンを検出
 * 5. 修正版プロンプト（頻度制約付き）で再生成
 *
 * Usage: npx tsx scripts/fix-names.ts
 */

const KANJI_MAX = 20; // 1漢字あたりの最大使用回数

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
const namesFile = path.resolve(__dirname, "../src/data/names-2880.json");

const interpMap: Record<number, any> = {};
for (const r of interps) interpMap[r.pattern_id] = r;

// 漢字辞書からNG漢字を除外したリストを作る
const boringChars = new Set(
  "庭老温読書店室料理食飲茶酒昼育教習学研練訓培養児幼園校院病薬医患治療休眠寝起床洗浴職工根蔵歴典市蒸蓄案味索直線会記探変具語重着実軽歩友並普薄淡"
);

const kanjiByCategory: Record<string, string[]> = {};
for (const k of kanjiDict) {
  if (boringChars.has(k.kanji)) continue;
  if (!kanjiByCategory[k.main_category]) kanjiByCategory[k.main_category] = [];
  kanjiByCategory[k.main_category].push(k.kanji);
}

const kanjiCategoryStr = Object.entries(kanjiByCategory)
  .map(([cat, chars]) => `${cat}: ${chars.join(" ")}`)
  .join("\n");

// 未使用のかっこいい漢字（優先して使わせる）
const PRIORITY_KANJI =
  "鬼虎鷲鯨鴉鸞麟獣猛獅狐熊鮫燕槍盾弓凰凱城塔縛廻蛇鶴鹿黒冠渦滝廊";

const SYSTEM_PROMPT = `あなたは「疾走領域 / Drive Field 3000」の命名師です。

疾走領域とは、人生を楽しむための**奥義**であり**大技**である。
真名は**超必殺技の名前**だと思って命名せよ。

## 絶対ルール
- 漢字2文字固定
- 必ず以下の漢字辞書から選ぶ（辞書外の漢字は禁止）
- 日本語として読めること
- **テンションが上がる名前にしろ**。もらったとき「おおっ」となる名前にしろ
- 日常的・説明的な名前は禁止
- 既存の日本語の一般名詞・固有名詞に聞こえる組み合わせはNG（日記、国技、天台、家計、糸針のような既存語は禁止）

## 良い例
龍牙、雷閃、深脈、狂華、鬼弦、蒼穹、焔舞、氷刃、魔眼、鉄鎖、紫電、月虹、煌炎、虎砲、鷲爪、鯨轟

## 使用禁止漢字（1文字でも含んだら即アウト）
庭老温読書店室料理食飲茶酒昼育教習学研練訓培養児幼園校院病薬医患治療休眠寝起床洗浴職工根蔵歴典市蒸蓄案味索直線会記探変具語重着実軽歩友並普薄淡

## 悪い例（絶対ダメ）
温泉、庭語、老実、温読、育花、茶輪、昼流、酒豊、読案、室理、習継、培盟
→ 園芸・読書・料理・学校みたいな日常感のある名前は全部NG

## 英語名ルール
- 直訳でなくてよい
- 2〜3語でかっこいいこと
- ゲームやアニメの技名のような雰囲気

## ローマ字読み
- 読みをローマ字でも付けること（例: りゅうが → RyuuGa）
- 各漢字の頭文字を大文字に（CamelCase）

## 使用可能な漢字辞書（カテゴリ別）
${kanjiCategoryStr}

## 出力形式
JSON配列。JSONのみ、説明不要:
[{"pattern_id":1,"kanji_name":"龍牙","reading":"りゅうが","romaji":"RyuuGa","english_name":"Dragon Fang","naming_reason":"衝動を一点に集中させる破壊的な瞬発力の象徴"}]`;

async function fixBatch(
  batchPatterns: any[],
  usedNames: Set<string>,
  kanjiCount: Record<string, number>
): Promise<any[]> {
  const patternDescriptions = batchPatterns
    .map((p) => {
      const interp = interpMap[p.pattern_id];
      if (!interp) return null;
      return `- pattern_id:${p.pattern_id} | ${p.core_code} | ${p.bias_type}/${p.output_level}/${p.ignition_label}/${p.time_character_label}
  象徴: ${interp.symbolic_image}
  質感: ${(interp.texture_keywords || []).join(", ")}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const existingStr = `\n\n## 使用済みの二語（同じ組み合わせは禁止）\n${[...usedNames].slice(-300).join("、")}`;

  // 上限到達漢字（使用禁止）
  const banned = Object.entries(kanjiCount)
    .filter(([, cnt]) => cnt >= KANJI_MAX)
    .map(([k]) => k)
    .join("");

  // 残り少ない漢字（なるべく避ける）
  const nearLimit = Object.entries(kanjiCount)
    .filter(([, cnt]) => cnt >= KANJI_MAX - 3 && cnt < KANJI_MAX)
    .map(([k, cnt]) => `${k}(残${KANJI_MAX - cnt})`)
    .join(" ");

  // まだほぼ使われていないかっこいい漢字
  const freshCool = [...PRIORITY_KANJI]
    .filter((k) => (kanjiCount[k] || 0) < 5)
    .join(" ");

  const kanjiConstraintStr = `
## 頻度制限（超重要）
- 上限到達・使用禁止: 【${banned || "なし"}】
- 残り少ない（なるべく避けよ）: ${nearLimit || "なし"}
- 優先して使うかっこいい漢字（まだ空き多い）: 【${freshCool || "なし"}】
→ 優先漢字を積極的に使え。上限漢字は1文字でも使うな。`;

  const userPrompt = `以下の${batchPatterns.length}パターンに真名をつけてください。
全部かっこいい名前にしろ。日常感・既存語は一切禁止。

${patternDescriptions}
${kanjiConstraintStr}
${existingStr}

全${batchPatterns.length}パターンのJSON配列を返せ。`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("JSON parse failed");
  return JSON.parse(match[0]);
}

async function main() {
  console.log("=== naming fix batch ===\n");

  const existingNames: any[] = fs.existsSync(namesFile)
    ? JSON.parse(fs.readFileSync(namesFile, "utf-8"))
    : [];

  const namesMap: Record<number, any> = {};
  for (const n of existingNames) namesMap[n.pattern_id] = n;

  // Find patterns to fix
  const allPatternIds = new Set(patterns.map((p: any) => p.pattern_id));
  const namedIds = new Set(existingNames.map((n: any) => n.pattern_id));

  const toFix: number[] = [];

  // 1. Boring names (NG漢字)
  for (const n of existingNames) {
    if ([...n.kanji_name].some((c: string) => boringChars.has(c))) {
      toFix.push(n.pattern_id);
    }
  }

  // 2. Duplicates (keep first, re-generate the rest)
  const seenNames = new Map<string, number>();
  for (const n of existingNames) {
    if (seenNames.has(n.kanji_name)) {
      toFix.push(n.pattern_id);
    } else {
      seenNames.set(n.kanji_name, n.pattern_id);
    }
  }

  // 3. Unnamed patterns
  for (const pid of allPatternIds) {
    if (!namedIds.has(pid)) {
      toFix.push(pid);
    }
  }

  // 4. Overused kanji (漢字頻度超過)
  const kanjiFreq: Record<string, number> = {};
  for (const n of existingNames) {
    for (const c of n.kanji_name) {
      kanjiFreq[c] = (kanjiFreq[c] || 0) + 1;
    }
  }
  const overusedChars = new Set(
    Object.entries(kanjiFreq)
      .filter(([, cnt]) => cnt > KANJI_MAX)
      .map(([k]) => k)
  );
  if (overusedChars.size > 0) {
    console.log(`過剰漢字 (>${KANJI_MAX}回): ${[...overusedChars].join("")}`);
    for (const n of existingNames) {
      if ([...n.kanji_name].some((c) => overusedChars.has(c))) {
        toFix.push(n.pattern_id);
      }
    }
  }

  const uniqueToFix = [...new Set(toFix)];
  console.log(
    `to fix: ${uniqueToFix.length} patterns (boring + duplicates + unnamed + overused)\n`
  );

  if (uniqueToFix.length === 0) {
    console.log("nothing to fix!");
    return;
  }

  // Collect used names (excluding ones we'll fix)
  const fixSet = new Set(uniqueToFix);
  const usedNames = new Set(
    existingNames
      .filter((n: any) => !fixSet.has(n.pattern_id))
      .map((n: any) => n.kanji_name)
  );

  // Build running kanji count from names NOT being fixed
  const kanjiCount: Record<string, number> = {};
  for (const n of existingNames) {
    if (!fixSet.has(n.pattern_id)) {
      for (const c of n.kanji_name) {
        kanjiCount[c] = (kanjiCount[c] || 0) + 1;
      }
    }
  }

  // Process in batches of 24
  const fixPatterns = uniqueToFix
    .map((pid) => patterns.find((p: any) => p.pattern_id === pid))
    .filter(Boolean);

  const startTime = Date.now();
  let processed = 0;
  let fixed = 0;

  for (let i = 0; i < fixPatterns.length; i += 24) {
    const batch = fixPatterns.slice(i, i + 24);

    try {
      const results = await fixBatch(batch, usedNames, kanjiCount);
      for (const r of results) {
        if (!r.pattern_id || !r.kanji_name || typeof r.kanji_name !== 'string') continue;
        if (usedNames.has(r.kanji_name)) continue;
        if ([...r.kanji_name].some((c: string) => boringChars.has(c))) continue; // NG漢字フィルタ
        namesMap[r.pattern_id] = r;
        usedNames.add(r.kanji_name);
        // Update kanji count with the newly accepted name
        for (const c of r.kanji_name) {
          kanjiCount[c] = (kanjiCount[c] || 0) + 1;
        }
        fixed++;
      }
    } catch (err: any) {
      console.error(`  x batch failed: ${err.message}`);
    }

    processed += batch.length;
    const elapsed = (Date.now() - startTime) / 1000;
    console.log(
      `  [${processed}/${fixPatterns.length}] ${fixed} fixed | ${elapsed.toFixed(0)}s`
    );
  }

  // Save
  const finalNames = Object.values(namesMap).sort(
    (a: any, b: any) => a.pattern_id - b.pattern_id
  );
  fs.writeFileSync(namesFile, JSON.stringify(finalNames, null, 2), "utf-8");

  const uniqueNames = new Set(finalNames.map((n: any) => n.kanji_name));
  console.log(
    `\ndone! ${finalNames.length} named, ${uniqueNames.size} unique`
  );
  console.log(`saved: ${namesFile}`);
}

main().catch(console.error);
