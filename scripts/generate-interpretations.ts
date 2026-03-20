/**
 * 2880パターン解釈文バッチ生成
 *
 * 60骨格 × 48パターン = 2880件
 * 1骨格あたり12パターンずつ4回のAPI呼び出し（計240回）
 * 3並列で実行 → 約20分
 *
 * 中断・再開可能（進捗はJSONに保存）
 *
 * Usage: npx tsx scripts/generate-interpretations.ts
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
const dicts = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../src/data/dictionaries.json"),
    "utf-8"
  )
);

const PROGRESS_FILE = path.resolve(__dirname, "interpretation-progress.json");
const OUTPUT_FILE = path.resolve(
  __dirname,
  "../src/data/interpretations-2880.json"
);

const CONCURRENCY = 3;

const neuroLabels: Record<string, string> = {
  D: "ドーパミン（新規性・可能性）",
  S: "セロトニン（理解・秩序）",
  O: "オキシトシン（共感・接続）",
  N: "ノルアドレナリン（緊張・集中）",
  E: "エンドルフィン（快感・没入）",
};

const biasLabels: Record<string, string> = {
  Single: "単極型",
  Dual: "二極型",
  Trinity: "三極型",
  Flat: "拡散型",
};

const outputLabels: Record<string, string> = {
  Light: "低",
  Middle: "中",
  Over: "高",
};

const biasDict: Record<string, string> = {};
const outputDict: Record<string, string> = {};
for (const d of dicts) {
  if (d.Category === "Bias") biasDict[d.Code] = d.Description;
  if (d.Category === "Output") outputDict[d.Code] = d.Description;
}

const SYSTEM_PROMPT = `あなたは「疾走領域 / Drive Field 3000」の世界観設計者です。

このシステムは性格診断ではなく、ユーザーの能力が最も通る「疾走領域」を導き出すシステムです。
人は努力で動かない。フィールドで動く。

## 神経系
- D（ドーパミン）: 新規性・可能性
- S（セロトニン）: 理解・秩序
- O（オキシトシン）: 共感・接続
- N（ノルアドレナリン）: 緊張・集中
- E（エンドルフィン）: 快感・没入

## 骨格の読み方
1位=起動、2位=加速、3位=持続

## 偏りタイプ
- Single（単極型）: 1位特化。入れば一気に回るが外すと止まりやすい
- Dual（二極型）: 1位と2位の掛け算で強く回る
- Trinity（三極型）: 複雑だがハマると深い
- Flat（拡散型）: 万能だが尖りづらい

## 発動方向
- 外燃: 外部刺激で火がつく
- 内燃: 内側の衝動で火がつく

## 時間特性
- 瞬発: 即起動
- 熟成: じわじわ温まり閾値を超えると回り出す

## 出力
各パターンに対し、以下のJSON配列で解釈を返してください。
各パターンが固有の質感を持つこと。テンプレ的な文章は禁止。
発動方向×時間特性が全体に貫通すること（同じ骨格でも全く違う人物像になる）。

JSONのみ出力。前後に説明文をつけないこと。`;

interface InterpretationResult {
  pattern_id: number;
  structural_interpretation: string;
  symbolic_image: string;
  texture_keywords: string[];
  trigger: string;
  accelerator: string;
  sustain: string;
  breakdown: string;
  recovery: string;
  awakened_vibe: string;
}

function loadProgress(): Set<number> {
  if (fs.existsSync(PROGRESS_FILE)) {
    const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
    return new Set(data.completed_batches || []);
  }
  return new Set();
}

function saveProgress(completed: Set<number>) {
  fs.writeFileSync(
    PROGRESS_FILE,
    JSON.stringify({ completed_batches: [...completed] }),
    "utf-8"
  );
}

function loadResults(): Record<number, InterpretationResult> {
  if (fs.existsSync(OUTPUT_FILE)) {
    const arr = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
    const map: Record<number, InterpretationResult> = {};
    for (const r of arr) map[r.pattern_id] = r;
    return map;
  }
  return {};
}

function saveResults(results: Record<number, InterpretationResult>) {
  const arr = Object.values(results).sort(
    (a, b) => a.pattern_id - b.pattern_id
  );
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(arr, null, 2), "utf-8");
}

async function generateBatch(
  core: any,
  batchPatterns: any[]
): Promise<InterpretationResult[]> {
  const patternList = batchPatterns
    .map(
      (p) =>
        `- pattern_id:${p.pattern_id} / ${biasLabels[p.bias_type]} / 出力${outputLabels[p.output_level]} / ${p.ignition_label} / ${p.time_character_label}`
    )
    .join("\n");

  const userPrompt = `以下の骨格に属する${batchPatterns.length}パターンの解釈を生成してください。

## 骨格情報
- 骨格: ${core.core_code}（${core.rank1}→${core.rank2}→${core.rank3}）
- 起動(1位): ${neuroLabels[core.rank1]}
- 加速(2位): ${neuroLabels[core.rank2]}
- 持続(3位): ${neuroLabels[core.rank3]}
- 骨格構造: ${core.drive_structure}
- 起動条件: ${core.trigger_core}
- 加速条件: ${core.accelerator_core}
- 持続条件: ${core.sustain_core}
- Drain条件: ${core.drain_condition}
- 回復順序: ${core.recovery_condition}

## 生成対象パターン
${patternList}

## 出力形式
以下のJSON配列で返してください。各パターンの組み合わせが生む固有の質感を描写すること:

[
  {
    "pattern_id": 数値,
    "structural_interpretation": "構造解釈（3〜5文。この型の構造的本質）",
    "symbolic_image": "象徴イメージ（1〜2文。情景・温度・質感・速度感。二語命名の連想素材）",
    "texture_keywords": ["質感キーワード5つ"],
    "trigger": "起動条件",
    "accelerator": "加速条件",
    "sustain": "持続条件",
    "breakdown": "破綻条件",
    "recovery": "回復条件",
    "awakened_vibe": "覚醒時の雰囲気（1文、映像的に）"
  }
]`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error(`JSON parse failed for core ${core.core_code}`);

  return JSON.parse(match[0]);
}

async function processBatch(
  batchIndex: number,
  core: any,
  batchPatterns: any[],
  results: Record<number, InterpretationResult>,
  completed: Set<number>
): Promise<void> {
  if (completed.has(batchIndex)) return;

  try {
    const generated = await generateBatch(core, batchPatterns);
    for (const r of generated) {
      results[r.pattern_id] = r;
    }
    completed.add(batchIndex);
    saveProgress(completed);
    saveResults(results);
  } catch (err: any) {
    console.error(`  ✗ Batch ${batchIndex} failed: ${err.message}`);
  }
}

async function main() {
  console.log("=== 2880パターン解釈文バッチ生成 ===\n");

  const completed = loadProgress();
  const results = loadResults();

  console.log(
    `既存進捗: ${completed.size} バッチ完了, ${Object.keys(results).length} パターン生成済み\n`
  );

  // Build batches: 60 cores × 4 batches of 12 patterns = 240 batches
  const batches: { batchIndex: number; core: any; patterns: any[] }[] = [];
  let batchIndex = 0;

  for (const core of cores) {
    const corePatterns = patterns.filter(
      (p: any) => p.core_id === core.core_id
    );
    // Split into chunks of 12
    for (let i = 0; i < corePatterns.length; i += 12) {
      const chunk = corePatterns.slice(i, i + 12);
      batches.push({ batchIndex, core, patterns: chunk });
      batchIndex++;
    }
  }

  const totalBatches = batches.length;
  const remainingBatches = batches.filter((b) => !completed.has(b.batchIndex));

  console.log(
    `総バッチ数: ${totalBatches}, 残り: ${remainingBatches.length}\n`
  );

  if (remainingBatches.length === 0) {
    console.log("全バッチ完了済み！");
    return;
  }

  const startTime = Date.now();
  let processedCount = 0;

  // Process with concurrency
  for (let i = 0; i < remainingBatches.length; i += CONCURRENCY) {
    const chunk = remainingBatches.slice(i, i + CONCURRENCY);
    const promises = chunk.map((b) =>
      processBatch(b.batchIndex, b.core, b.patterns, results, completed)
    );

    await Promise.all(promises);
    processedCount += chunk.length;

    const elapsed = (Date.now() - startTime) / 1000;
    const rate = processedCount / elapsed;
    const remaining = (remainingBatches.length - processedCount) / rate;

    console.log(
      `  [${completed.size}/${totalBatches}] ${Object.keys(results).length} パターン完了 | ${elapsed.toFixed(0)}s経過 | 残り約${remaining.toFixed(0)}s`
    );
  }

  console.log(
    `\n完了！ ${Object.keys(results).length} / 2880 パターンの解釈を生成しました。`
  );
  console.log(`出力: ${OUTPUT_FILE}`);
}

main().catch(console.error);
