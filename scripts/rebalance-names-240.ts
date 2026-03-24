/**
 * names-240.json の漢字バランスを整える
 *
 * - 使いすぎ漢字を含むエントリを洗い出し
 * - 未使用のかっこいい漢字を優先して再命名
 *
 * Usage: npx tsx scripts/rebalance-names-240.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const KANJI_MAX = 4; // 240件中の1漢字あたり上限

// 優先して使いたいかっこいい漢字（未使用 or 少ない）
const PRIORITY_KANJI = "風桜星鷲閃霜霧滝渦暁凛翼彗蒼嵐鴉蛇矢弓槍刃剣鉄獣幽玄霞";

const NEURO_LABELS: Record<string, string> = {
  D: "ドーパミン（新規・可能性）",
  S: "セロトニン（理解・秩序）",
  O: "オキシトシン（共感・接続）",
  N: "ノルアドレナリン（緊張・集中）",
  E: "エンドルフィン（快感・没入）",
};
const BIAS_LABELS: Record<string, string> = {
  Single: "一点突破（rank1が圧倒的）",
  Dual: "二軸駆動（rank1とrank2が拮抗）",
  Trinity: "三極共鳴（rank1〜rank3が均衡）",
  Flat: "万能拡散（全体バランス）",
};

// NG漢字（日常的すぎる）
const boringChars = new Set(
  "庭老温読書店室料理食飲茶酒昼育教習学研練訓培養児幼園校院病薬医患治療休眠寝起床洗浴職工根蔵歴典市蒸蓄案味索直線会記探変具語重着実軽歩友並普薄淡"
);

const kanjiDict = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../src/data/kanji-dictionary.json"), "utf-8")
);
const allAllowedKanji = new Set<string>(kanjiDict.map((k: any) => k.kanji));

// カテゴリ別漢字リスト（プロンプト用）
const kanjiByCategory: Record<string, string[]> = {};
for (const k of kanjiDict) {
  if (boringChars.has(k.kanji)) continue;
  if (!kanjiByCategory[k.main_category]) kanjiByCategory[k.main_category] = [];
  kanjiByCategory[k.main_category].push(k.kanji);
}
const kanjiCategoryStr = Object.entries(kanjiByCategory)
  .map(([cat, chars]) => `${cat}: ${chars.join(" ")}`)
  .join("\n");

async function renameBatch(
  entries: any[],
  usedNames: Set<string>,
  kanjiCount: Record<string, number>
): Promise<any[]> {
  const banned = Object.entries(kanjiCount)
    .filter(([, n]) => n >= KANJI_MAX)
    .map(([k]) => k)
    .join("");

  const freshCool = [...PRIORITY_KANJI]
    .filter((k) => allAllowedKanji.has(k) && (kanjiCount[k] || 0) < 2)
    .join(" ");

  const descriptions = entries.map((e) => {
    const parts = e.id.split("-");
    const [r1, r2, r3, bias] = parts;
    return `【${e.id}】
主衝動: ${NEURO_LABELS[r1] ?? r1}
副衝動: ${NEURO_LABELS[r2] ?? r2}
第三: ${NEURO_LABELS[r3] ?? r3}
偏り: ${BIAS_LABELS[bias] ?? bias}
旧名: ${e.kanji_name}（${e.reading}）
旧理由: ${e.naming_reason}`;
  }).join("\n\n---\n\n");

  const system = `あなたは「疾走領域 / Drive Field 3000」の命名師です。真名は**超必殺技の名前**。

## 絶対ルール
- 漢字2文字固定
- 必ず以下の許可漢字辞書から選ぶ（辞書外は禁止）
- テンションが上がること。もらったとき「おおっ」となること
- 日常的・説明的・既存の一般名詞はNG

## 良い例
龍牙、雷閃、深脈、狂華、蒼穹、焔舞、氷刃、魔眼、紫電、月虹、煌炎、虎砲、鷲爪、鯨轟、風刃、星穿、桜斬

## 使用禁止漢字（1文字でも含んだらアウト）
${[...boringChars].join("")}
上限到達（禁止）: 【${banned || "なし"}】

## 優先して使うかっこいい漢字（積極的に使え）
【${freshCool || "なし"}】

## 英語名
2〜3語でゲーム・アニメの技名風

## 使用可能な漢字辞書（カテゴリ別・この中からのみ選べ）
${kanjiCategoryStr}

## 出力形式（JSONのみ）
[{"id":"...","kanji_name":"...","reading":"...","romaji":"...","english_name":"...","naming_reason":"..."}]`;

  const res = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system,
    messages: [{
      role: "user",
      content: `以下${entries.length}エントリを再命名してください。全部かっこいい名前にすること。優先漢字を積極的に使うこと。\n\n${descriptions}\n\n## 使用済み名前（重複禁止）\n${[...usedNames].slice(-200).join("、")}`,
    }],
  });

  const text = res.content[0].type === "text" ? res.content[0].text : "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("JSON parse failed:\n" + text);
  return JSON.parse(match[0]);
}

async function main() {
  const names240File = path.resolve(__dirname, "../src/data/names-240.json");
  const entries: any[] = JSON.parse(fs.readFileSync(names240File, "utf-8"))
    .filter((e: any) => e.id && e.id.includes("-"));

  // 漢字使用回数を集計
  const kanjiCount: Record<string, number> = {};
  for (const e of entries) {
    for (const c of e.kanji_name) {
      kanjiCount[c] = (kanjiCount[c] || 0) + 1;
    }
  }

  console.log("=== 現在の漢字分布 ===");
  const overused = Object.entries(kanjiCount).filter(([, n]) => n > KANJI_MAX).sort((a, b) => b[1] - a[1]);
  overused.forEach(([k, n]) => console.log(`  ${k}: ${n}回（上限${KANJI_MAX}）`));

  // 再生成対象: KANJI_MAX超の漢字を含むエントリ
  const overusedSet = new Set(overused.map(([k]) => k));
  const toFix: any[] = [];
  const seen = new Map<string, string>(); // kanji_name → id (重複検出)

  for (const e of entries) {
    const chars = [...e.kanji_name];
    if (chars.some((c) => overusedSet.has(c))) {
      toFix.push(e);
    } else if (seen.has(e.kanji_name)) {
      toFix.push(e); // 重複名
    } else {
      seen.set(e.kanji_name, e.id);
    }
  }

  // 優先未使用漢字を含まないエントリも少し追加（多様性向上）
  const unusedPriority = [...PRIORITY_KANJI].filter((k) => allAllowedKanji.has(k) && (kanjiCount[k] || 0) === 0);
  console.log(`\n未使用の優先漢字: ${unusedPriority.join(" ")}`);

  console.log(`\n再生成対象: ${toFix.length}件`);
  if (toFix.length === 0) {
    console.log("バランスOK！");
    return;
  }

  // 再生成対象以外の名前セット
  const fixIds = new Set(toFix.map((e) => e.id));
  const usedNames = new Set(entries.filter((e) => !fixIds.has(e.id)).map((e) => e.kanji_name));

  // 漢字カウントも再生成対象を除いて再計算
  const baseKanjiCount: Record<string, number> = {};
  for (const e of entries) {
    if (!fixIds.has(e.id)) {
      for (const c of e.kanji_name) baseKanjiCount[c] = (baseKanjiCount[c] || 0) + 1;
    }
  }

  // id → entry マップ
  const entryMap: Record<string, any> = {};
  for (const e of entries) entryMap[e.id] = e;

  // バッチ処理（12件ずつ）
  const BATCH = 12;
  let fixed = 0;
  const currentKanjiCount = { ...baseKanjiCount };
  const currentUsedNames = new Set(usedNames);

  for (let i = 0; i < toFix.length; i += BATCH) {
    const batch = toFix.slice(i, i + BATCH);
    console.log(`\nバッチ ${Math.floor(i / BATCH) + 1}: ${batch.map((e) => e.id).join(", ")}`);

    try {
      const results = await renameBatch(batch, currentUsedNames, currentKanjiCount);
      for (const r of results) {
        if (!r.id || !r.kanji_name) continue;
        if (currentUsedNames.has(r.kanji_name)) {
          console.log(`  重複スキップ: ${r.kanji_name}`);
          continue;
        }
        if ([...r.kanji_name].some((c: string) => boringChars.has(c))) {
          console.log(`  NG漢字スキップ: ${r.kanji_name}`);
          continue;
        }
        if ([...r.kanji_name].some((c: string) => !allAllowedKanji.has(c))) {
          console.log(`  辞書外漢字スキップ: ${r.kanji_name}`);
          continue;
        }
        // 上限超え漢字チェック
        const overNew = [...r.kanji_name].filter((c: string) => (currentKanjiCount[c] || 0) >= KANJI_MAX);
        if (overNew.length > 0) {
          console.log(`  上限漢字スキップ: ${r.kanji_name} (${overNew.join("")})`);
          continue;
        }
        entryMap[r.id] = { ...entryMap[r.id], ...r };
        currentUsedNames.add(r.kanji_name);
        for (const c of r.kanji_name) currentKanjiCount[c] = (currentKanjiCount[c] || 0) + 1;
        fixed++;
        console.log(`  ✓ ${r.id}: ${r.kanji_name}（${r.reading}）`);
      }
    } catch (err: any) {
      console.error(`  バッチエラー: ${err.message}`);
    }
  }

  // 元の順序で書き出し
  const result = entries.map((e) => entryMap[e.id] ?? e);
  fs.writeFileSync(names240File, JSON.stringify(result, null, 2), "utf-8");
  console.log(`\n完了! ${fixed}件を再命名 → ${names240File}`);

  // 最終分布確認
  const finalCount: Record<string, number> = {};
  for (const e of result) for (const c of e.kanji_name) finalCount[c] = (finalCount[c] || 0) + 1;
  const stillOver = Object.entries(finalCount).filter(([, n]) => n > KANJI_MAX);
  if (stillOver.length > 0) {
    console.log(`\nまだ上限超え: ${stillOver.map(([k, n]) => `${k}:${n}`).join(", ")}`);
  } else {
    console.log("\n漢字バランスOK!");
  }
}

main().catch(console.error);
