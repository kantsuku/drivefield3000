/**
 * 解釈文生成シミュレーション v2
 *
 * 構造解析 + 構造解釈 + 詳細解釈を生成する。
 *
 * Usage: npx tsx scripts/simulate-generation.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// --- 辞書データ読み込み ---
const cores = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../src/data/core-60.json"), "utf-8")
);
const dicts = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../src/data/dictionaries.json"),
    "utf-8"
  )
);

// テスト対象: 異なる骨格で4パターン
const testPatterns = [
  { coreIdx: 0, bias: "Dual", output: "Over", ignition: "外燃", time: "瞬発" },
  { coreIdx: 0, bias: "Single", output: "Middle", ignition: "内燃", time: "熟成" },
  { coreIdx: 4, bias: "Trinity", output: "Light", ignition: "外燃", time: "熟成" },
  { coreIdx: 10, bias: "Flat", output: "Middle", ignition: "内燃", time: "瞬発" },
];

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

このシステムは性格診断ではありません。
ユーザーの能力が最も自然に、最も効果的に通る「疾走領域」を導き出すシステムです。

人は努力で動かない。フィールドで動く。
疾走領域とは、人生を楽しむための奥義であり、自分の能力を最も通す展開領域です。

## 神経系の意味
- D（ドーパミン）: 新規性・可能性 — 新しい刺激、未知への好奇心
- S（セロトニン）: 理解・秩序 — 構造化、手順、見通し
- O（オキシトシン）: 共感・接続 — 人との共鳴、関係性
- N（ノルアドレナリン）: 緊張・集中 — プレッシャー、切迫感
- E（エンドルフィン）: 快感・没入 — フロー状態、身体的快楽

## 偏りタイプの意味
- Single（単極型）: 1位特化。トップドライブが強烈で、入れば一気に回るが外すと止まりやすい
- Dual（二極型）: 1位と2位が高い。点火と推進の掛け算で強く回る、最も"らしさ"が出やすい型
- Trinity（三極型）: 上位3つが高い。複雑だがハマると強い。覚醒条件が揃うと一段深い回転に入る
- Flat（拡散型）: 全体が比較的近い。万能だが尖りづらい。環境適応力は高いが起動条件が曖昧になりやすい

## 発動方向の意味
- 外燃: 外部刺激・他者・環境変化で火がつく
- 内燃: 内側の納得・衝動・構想で火がつく

## 時間特性の意味
- 瞬発: 立ち上がりが速い。条件が揃えば即起動
- 熟成: じわじわ温まり、閾値を超えると深く回り出す

## 骨格の読み方
骨格は上位3つの神経系の順序で構成される。
- 1位 = 起動（何で火がつくか）
- 2位 = 加速（何で勢いが増すか）
- 3位 = 持続（何で循環するか）

## あなたの仕事
与えられたパターンに対し、以下の2層構造で解釈文を生成してください。

### 第1層: 構造解釈
この型の本質を、構造の組み合わせから読み解く短い文章。
以下の要素を含む:
- **この型は〜構造を持つ**: 骨格（起動→加速→持続）を1文で要約
- **起点と立ち上がり**: 発動方向と時間特性がどう影響するか
- **回り方の特徴**: 偏りタイプと出力レベルがどう影響するか
- **失速の構造**: 何が欠けると止まるか

文体は簡潔・構造的。「〜である」「〜する」調。詩的すぎず、分析的すぎず。
3〜5文程度。

### 第2層: 詳細解釈
パターン固有の具体的な解釈:
- **起動条件**: 何がきっかけで火がつくか（発動方向・時間特性の影響を反映）
- **加速条件**: 何があると勢いが増すか
- **持続条件**: 何が循環を支えるか
- **破綻条件**: 何で急速に失速するか
- **回復条件**: どうすれば再起動できるか（回復の順序も含む）
- **覚醒時の雰囲気**: 展開中の本人はどう見えるか（1文、映像的に）

重要なルール:
- テンプレート的な文章にしない。各パターンの組み合わせが生む「固有の質感」を描写する
- 発動方向と時間特性が解釈全体に貫通する（同じ骨格でも外燃×瞬発と内燃×熟成では全く違う人物像になる）
- 偏りタイプと出力レベルも全体に影響する（Dual×Overは激しく、Single×Lightは繊細に）
- 抽象的すぎず、具体的な行動やシーンが浮かぶように書く
- 肯定的だが甘くない。強みと表裏一体のリスクも描く
- 構造解釈と詳細解釈で内容が矛盾しないこと`;

async function generateInterpretation(
  core: any,
  bias: string,
  output: string,
  ignition: string,
  timeChar: string
): Promise<string> {
  const userPrompt = `以下のパターンの解釈文を生成してください。

## 構造解析（これはそのまま出力に含める）
- 骨格: ${core.core_code}
- 起動(1位): ${neuroLabels[core.rank1]}
- 加速(2位): ${neuroLabels[core.rank2]}
- 持続(3位): ${neuroLabels[core.rank3]}
- 偏りタイプ: ${biasLabels[bias]}
- 出力レベル: ${outputLabels[output]}
- 発動方向: ${ignition}
- 時間特性: ${timeChar}

## 骨格の基本構造
${core.drive_structure}

## 骨格の起動条件
${core.trigger_core}

## 骨格の加速条件
${core.accelerator_core}

## 骨格の持続条件
${core.sustain_core}

## 骨格のDrain条件
${core.drain_condition}

## 骨格の回復順序
${core.recovery_condition}

---
上記を踏まえ、このパターン**固有の**解釈文をJSON形式で返してください。
JSONのみ出力し、前後に説明文をつけないでください:

{
  "structural_interpretation": "構造解釈（3〜5文。この型の構造的本質を描写）",
  "trigger": "起動条件",
  "accelerator": "加速条件",
  "sustain": "持続条件",
  "breakdown": "破綻条件",
  "recovery": "回復条件",
  "awakened_vibe": "覚醒時の雰囲気（1文）"
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  return text;
}

async function main() {
  console.log("=== 解釈文生成シミュレーション v2 ===\n");

  for (const p of testPatterns) {
    const core = cores[p.coreIdx];
    const label = `${core.core_code} / ${biasLabels[p.bias]} / 出力${outputLabels[p.output]} / ${p.ignition} / ${p.time}`;

    console.log(`\n${"=".repeat(60)}`);
    console.log(`>>> ${label}`);
    console.log(`${"=".repeat(60)}`);

    console.log(`\n【構造解析】`);
    console.log(`  骨格: ${core.core_code}`);
    console.log(`  起動(1位): ${neuroLabels[core.rank1]}`);
    console.log(`  加速(2位): ${neuroLabels[core.rank2]}`);
    console.log(`  持続(3位): ${neuroLabels[core.rank3]}`);
    console.log(`  偏りタイプ: ${biasLabels[p.bias]}`);
    console.log(`  出力レベル: ${outputLabels[p.output]}`);
    console.log(`  発動方向: ${p.ignition}`);
    console.log(`  時間特性: ${p.time}`);

    console.log(`\n生成中...\n`);

    const result = await generateInterpretation(
      core,
      p.bias,
      p.output,
      p.ignition,
      p.time
    );

    // JSONをパースして見やすく表示
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log(`【構造解釈】`);
        console.log(parsed.structural_interpretation);
        console.log(`\n【起動条件】`);
        console.log(parsed.trigger);
        console.log(`\n【加速条件】`);
        console.log(parsed.accelerator);
        console.log(`\n【持続条件】`);
        console.log(parsed.sustain);
        console.log(`\n【破綻条件】`);
        console.log(parsed.breakdown);
        console.log(`\n【回復条件】`);
        console.log(parsed.recovery);
        console.log(`\n【覚醒時の雰囲気】`);
        console.log(parsed.awakened_vibe);
      } else {
        console.log(result);
      }
    } catch {
      console.log(result);
    }

    console.log("");
  }

  console.log("\nシミュレーション完了！");
}

main().catch(console.error);
