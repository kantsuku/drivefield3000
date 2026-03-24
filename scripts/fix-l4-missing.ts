/**
 * 欠けているL4タイプだけを生成してマージする
 * Usage: npx tsx scripts/fix-l4-missing.ts
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
  Single: "1位特化", Dual: "2強型", Trinity: "3強型", Flat: "均等型",
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
漢字4文字（「型」は付けない）。絶対ルール：4文字のみ。

## コンセプト
四字熟語のような力強い言葉で、エネルギーの本質を体現する。
「一点突破」「万象流転」「孤狼閃滅」「烈火昇龍」スタイル。

## 絶対ルール
- 漢字4文字のみ（「型」禁止）
- 説明的・機能的な言葉は禁止
- 既存との重複禁止
- JSONのみ出力: [{"id":"...","name":"...","tagline":"...","reading":"..."}]`;

async function main() {
  const file = path.resolve(__dirname, "../src/data/l4-types.json");
  const data: any[] = JSON.parse(fs.readFileSync(file, "utf-8"));
  const existing = new Set(data.map((t) => t.id));
  const existingNames = new Set(data.map((t) => t.name));

  const ranks = ["D","S","O","N","E"];
  const biases = ["Single","Dual","Trinity","Flat"];
  const ignitions = ["外燃","内燃"];
  const times = ["瞬発","熟成"];

  const missing: any[] = [];
  for (const r of ranks) for (const b of biases) for (const i of ignitions) for (const t of times) {
    const id = `${r}-${b}-${i}-${t}`;
    if (!existing.has(id)) missing.push({ id, rank1: r, bias: b, ignition: i, time: t });
  }

  if (missing.length === 0) { console.log("欠けているエントリなし"); return; }
  console.log(`欠けているエントリ: ${missing.length}件`);
  missing.forEach(m => console.log(" ", m.id));

  const descriptions = missing.map((t) => {
    const n = NEURO[t.rank1];
    return `id: "${t.id}"
  主神経: ${t.rank1}（${n.jp} / ${n.desc}）
  偏り: ${t.bias}（${BIAS[t.bias]}）
  発火: ${t.ignition}（${IGNITION[t.ignition]}）
  時間: ${t.time}（${TIME[t.time]}）
  既存名との重複禁止: ${[...existingNames].join("、")}`;
  }).join("\n\n");

  const res = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: `以下の${missing.length}タイプに名前と読みをつけてください。\n\n${descriptions}` }],
  });

  const text = res.content[0].type === "text" ? res.content[0].text : "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("JSON parse failed:\n" + text);
  const generated: any[] = JSON.parse(match[0]);

  // マージ
  for (const g of generated) {
    const name = g.name.startsWith("流派・") ? g.name : `流派・${g.name}`;
    data.push({ id: g.id, name, tagline: g.tagline, reading: g.reading ?? "" });
    console.log(`  追加: ${g.id} → ${name}（${g.reading}）「${g.tagline}」`);
  }

  // ソート
  const order = ["D","S","O","N","E"];
  const biasOrder = ["Single","Dual","Trinity","Flat"];
  const ignOrder = ["外燃","内燃"];
  const timeOrder = ["瞬発","熟成"];
  data.sort((a, b) => {
    const [ar, ab, ai, at] = a.id.split("-");
    const [br, bb, bi, bt] = b.id.split("-");
    return (order.indexOf(ar) - order.indexOf(br)) ||
           (biasOrder.indexOf(ab) - biasOrder.indexOf(bb)) ||
           (ignOrder.indexOf(ai) - ignOrder.indexOf(bi)) ||
           (timeOrder.indexOf(at) - timeOrder.indexOf(bt));
  });

  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
  console.log(`\n完了! 合計${data.length}件`);
}

main().catch(console.error);
