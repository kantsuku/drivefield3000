/**
 * リード文章シミュレーション
 *
 * 各疾走領域の「開眼リード文」を数件生成してクオリティ確認する。
 * 真名に含まれる漢字を必ず使い、エモく・技名っぽく仕上げる。
 *
 * Usage: npx tsx scripts/simulate-lead.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const patterns = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../src/data/patterns-2880.json"), "utf-8"));
const interps = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../src/data/interpretations-2880.json"), "utf-8"));
const names = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../src/data/names-2880.json"), "utf-8"));

const interpMap: Record<number, any> = {};
for (const r of interps) interpMap[r.pattern_id] = r;
const nameMap: Record<number, any> = {};
for (const r of names) nameMap[r.pattern_id] = r;

const SYSTEM_PROMPT = `あなたは「疾走領域 / Drive Field 3000」の言霊師です。
各疾走領域に「開眼リード文」を書く。

## 開眼リード文とは
- 結果ページの冒頭に表示される、3〜5文のエモい文章
- ユーザーが「これ、おれのことだ」と震えるやつ
- 分類の説明ではなく、**その人の動き方・火のつき方・加速の感触**を描写する
- 詩的でいい。断言でいい。「あなたは〜」で語りかけてもいい
- ラスト1文で真名の2文字（漢字）を必ず自然に使う

## 禁止事項
- 「このタイプは〜」みたいな分類説明
- 「〜でしょう」「〜かもしれません」みたいな曖昧な語尾
- 長すぎる（5文以内）
- 英語まじり
- 「疾走領域」という言葉をそのまま使う

## 良い例（イメージ）
「火は、外から来る。
誰かの言葉、偶然の出会い、予期せぬ景色。
お前の起動スイッチは、内側にはない。
だから、環境を選べ。場を選べ。
その閃光が鴉のように走るとき、お前は止まれない。」

## 使うデータ
- 骨格（rank1/2/3）: 起動・加速・持続の神経系
- 発動方向（外燃/内燃）
- 時間特性（瞬発/熟成）
- 偏りタイプ・出力レベル
- 解釈文・象徴イメージ
- 真名（漢字2文字）← ラスト1文で必ず使う

## 神経系の感触
- D (ドーパミン): 新規性・可能性・突破・興奮
- S (セロトニン): 秩序・理解・整合・安定
- O (オキシトシン): 共感・接続・共鳴・温かさ
- N (ノルアドレナリン): 緊張・危機・集中・研ぎ澄まし
- E (エンドルフィン): 没入・持続・達成・陶酔

## 偏りタイプの感触
- Single（単極）: 1位が強烈。入れば全開、外すと急停止
- Double（二極）: 2軸が絡み合う。どちらかが欠けると半減
- Triple（三極）: 3つが連動。バランスが整うと回転が始まる
- Diffuse（拡散）: 広く薄く。環境全体が整ったとき静かに動き出す

## 出力レベルの感触
- Light: 小さく静かに起動する。無理なく、継続しやすい
- Medium: 中程度の強度で動く。波があるが安定している
- Heavy: 大きく激しく動く。爆発的だが消耗も大きい

## 出力形式（JSON）
{"pattern_id": 1, "lead_text": "ここに3〜5文のリード文"}`;

async function generateLeads(samplePatterns: any[]): Promise<any[]> {
  const descriptions = samplePatterns.map((p) => {
    const interp = interpMap[p.pattern_id];
    const name = nameMap[p.pattern_id];
    return `---
pattern_id: ${p.pattern_id}
真名: ${name.kanji_name}（${name.reading}）
骨格: ${p.rank1}(起動) → ${p.rank2}(加速) → ${p.rank3}(持続)
発動: ${p.ignition_label} / 時間: ${p.time_character_label}
偏り: ${p.bias_type} / 出力: ${p.output_level}
起動条件: ${p.trigger_core}
加速条件: ${p.accelerator_core}
持続条件: ${p.sustain_core}
象徴イメージ: ${interp?.symbolic_image || ""}
質感キーワード: ${(interp?.texture_keywords || []).join(", ")}
覚醒時の雰囲気: ${interp?.awakened_vibe || ""}`;
  }).join("\n\n");

  const res = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: `以下${samplePatterns.length}パターンのリード文を書いてください。
各pattern_idに対して1つ、JSON配列で返してください。

${descriptions}

JSON配列のみ返してください。`
    }],
  });

  const text = res.content[0].type === "text" ? res.content[0].text : "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("JSON parse failed:\n" + text);
  return JSON.parse(match[0]);
}

async function main() {
  // バラエティのあるサンプル5件を選ぶ
  const sampleIds = [1, 100, 500, 1440, 2880];
  const samplePatterns = sampleIds.map(id => patterns.find((p: any) => p.pattern_id === id)).filter(Boolean);

  console.log("=== リード文シミュレーション ===\n");
  console.log("対象パターン:");
  for (const p of samplePatterns) {
    const name = nameMap[p.pattern_id];
    console.log(`  #${p.pattern_id} ${name.kanji_name} | ${p.rank1}→${p.rank2}→${p.rank3} | ${p.ignition_label}/${p.time_character_label} | ${p.bias_type}/${p.output_level}`);
  }
  console.log("");

  const results = await generateLeads(samplePatterns);

  console.log("=== 生成結果 ===\n");
  for (const r of results) {
    const p = patterns.find((p: any) => p.pattern_id === r.pattern_id);
    const name = nameMap[r.pattern_id];
    console.log(`【#${r.pattern_id} ${name.kanji_name}（${name.reading}）】`);
    console.log(`骨格: ${p.rank1}→${p.rank2}→${p.rank3} | ${p.ignition_label}/${p.time_character_label} | ${p.bias_type}/${p.output_level}`);
    console.log("");
    console.log(r.lead_text);
    console.log("\n" + "─".repeat(60) + "\n");
  }
}

main().catch(console.error);
