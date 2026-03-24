/**
 * L4 80タイプの〇〇型名称を生成
 * Usage: npx tsx scripts/generate-l4-types.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const NEURO: Record<string, { jp: string; desc: string }> = {
  D: { jp: "ドーパミン", desc: "新規性・可能性" },
  S: { jp: "セロトニン", desc: "理解・秩序" },
  O: { jp: "オキシトシン", desc: "共感・接続" },
  N: { jp: "ノルアドレナリン", desc: "緊張・集中" },
  E: { jp: "エンドルフィン", desc: "快感・没入" },
};

const BIAS: Record<string, string> = {
  Single:  "1位特化（1つのドライブが圧倒的に強い）",
  Dual:    "2強型（1・2位が拮抗して強い）",
  Trinity: "3強型（上位3つが均等に強い）",
  Flat:    "均等型（5つがほぼ均等）",
};

const IGNITION: Record<string, string> = {
  外燃: "外部の刺激・他者・環境変化で火がつく",
  内燃: "内側からじわじわ燃え上がる",
};

const TIME: Record<string, string> = {
  瞬発: "立ち上がりが速く、すぐ全開になる",
  熟成: "じっくり時間をかけて深まる",
};

const SYSTEM_PROMPT = `あなたは「疾走領域 / Drive Field 3000」の命名師です。
人間のドライブ構造を表す**四字熟語＋型**の名称を考えます。

## フォーマット
**漢字4文字 + 型**（合計5文字）。例外なし。

## コンセプト
四字熟語のような力強い言葉で、そのタイプのエネルギーの本質を一言で表す。
もらった人が「これだ」と感じる、詩的でかっこいい名前。
MBTIのように共有したくなる、流儀・流派の名前。

## 絶対ルール
- 漢字4文字 + 型（必ず5文字+型）
- 既存の四字熟語でも、造語でも可
- 説明的・機能的な言葉は禁止（育成・反応・醸造・培養・点火・熟成 などNG）
- 80種全部重複禁止
- 各タイプの「エネルギーの質感・方向性」を体現すること

## 良い例（このスタイルで）
一点突破型、万象流転型、孤狼閃滅型、烈火昇龍型、深淵無明型、
風林火山型、天地開闢型、月下独行型、虚空大道型、修羅羅刹型、
蒼穹霹靂型、暗渦潜流型、獄炎獄炎型、閃光雷鳴型、黒曜無双型

## 悪い例（絶対ダメ）
総合育成型、外圧熟成型、双極点火型、三角共振型、全面育成型

## 出力形式
JSONのみ:
[{"id":"D-Single-外燃-瞬発","name":"一点突破型","tagline":"一言キャッチ（10字以内・詩的に）"}]`;

async function generateBatch(types: any[]): Promise<any[]> {
  const descriptions = types.map((t) => {
    const n = NEURO[t.rank1];
    return `id: "${t.id}"
  主神経: ${t.rank1}（${n.jp} / ${n.desc}）
  偏り: ${t.bias}（${BIAS[t.bias]}）
  発火: ${t.ignition}（${IGNITION[t.ignition]}）
  時間: ${t.time}（${TIME[t.time]}）`;
  }).join("\n\n");

  const res = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: `以下の${types.length}タイプに名前をつけてください。\n\n${descriptions}` }],
  });

  const text = res.content[0].type === "text" ? res.content[0].text : "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("JSON parse failed:\n" + text);
  return JSON.parse(match[0]);
}

async function main() {
  const ranks = ["D", "S", "O", "N", "E"];
  const biases = ["Single", "Dual", "Trinity", "Flat"];
  const ignitions = ["外燃", "内燃"];
  const times = ["瞬発", "熟成"];

  const allTypes = [];
  for (const rank1 of ranks)
    for (const bias of biases)
      for (const ignition of ignitions)
        for (const time of times)
          allTypes.push({ id: `${rank1}-${bias}-${ignition}-${time}`, rank1, bias, ignition, time });

  console.log(`生成対象: ${allTypes.length}タイプ\n`);

  const results: any[] = [];
  const BATCH = 20;

  for (let i = 0; i < allTypes.length; i += BATCH) {
    const batch = allTypes.slice(i, i + BATCH);
    try {
      const res = await generateBatch(batch);
      results.push(...res);
      console.log(`  [${Math.min(i + BATCH, allTypes.length)}/${allTypes.length}] 完了`);
    } catch (e: any) {
      console.error(`  バッチ失敗: ${e.message}`);
    }
  }

  const outFile = path.resolve(__dirname, "../src/data/l4-types.json");
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2), "utf-8");
  console.log(`\n完了! ${results.length}件 → ${outFile}`);
  console.log("\nサンプル:");
  results.slice(0, 5).forEach(r => console.log(`  ${r.id} → ${r.name}「${r.tagline}」`));
}

main().catch(console.error);
