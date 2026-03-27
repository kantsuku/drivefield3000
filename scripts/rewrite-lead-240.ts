/**
 * 240の疾走領域のリード文を一括リライト
 * 疾走領域の固有風景・情景ビジュアルとして描写
 *
 * Usage: npx tsx scripts/rewrite-lead-240.ts
 *   --rank1=D  特定のrank1だけ処理
 */

import Anthropic from "@anthropic-ai/sdk";
import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const FILE = path.resolve(__dirname, "../src/data/names-240.json");
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const args = process.argv.slice(2);
const rank1Only = args.find((a) => a.startsWith("--rank1="))?.split("=")[1];

const NEURO: Record<string, string> = {
  D: "新規・可能性・好奇心・冒険",
  S: "理解・秩序・構造化・論理",
  O: "共感・接続・信頼・絆",
  N: "緊張・集中・プレッシャー・研ぎ澄まし",
  E: "快感・没入・陶酔・こだわり",
};

const BIAS_DESC: Record<string, string> = {
  Single: "一つの力が圧倒的に突出した世界",
  Dual: "二つの力が拮抗・融合した世界",
  Trinity: "三つの力が均衡し共鳴する世界",
  Flat: "すべての力が広く満ちた世界",
};

const COLOR_THEME: Record<string, { color: string; landscape: string }> = {
  D: { color: "赤", landscape: "灼熱の荒野、紅い砂塵、炎の道、溶岩の河、赤い空、焔の嵐" },
  S: { color: "青", landscape: "氷の湖、蒼い深海、霧の谷、月光の平原、凍てつく結晶、静寂の水面" },
  O: { color: "緑", landscape: "花畑、深い森、木漏れ日の道、蔦に覆われた廃墟、桜吹雪、春の草原" },
  N: { color: "黄/金", landscape: "雷雲の荒野、黄金の砂漠、稲妻の走る大地、剣が突き刺さった丘、鍛冶の火花" },
  E: { color: "紫", landscape: "紫の霧の森、星空の海、夢と現の境界、月影の庭園、幽玄の闇、発光する蝶" },
};

async function main() {
  const data: any[] = JSON.parse(fs.readFileSync(FILE, "utf-8"));

  const groups: Record<string, any[]> = {};
  for (const entry of data) {
    const r1 = entry.id.split("-")[0];
    if (!groups[r1]) groups[r1] = [];
    groups[r1].push(entry);
  }

  const targetRank1s = rank1Only ? [rank1Only] : ["D", "S", "O", "N", "E"];
  let totalUpdated = 0;

  for (const r1 of targetRank1s) {
    const entries = groups[r1];
    if (!entries) continue;
    const theme = COLOR_THEME[r1];

    console.log(`\n${"═".repeat(60)}`);
    console.log(`${r1} — ${theme.color} — ${entries.length}件`);
    console.log(`${"═".repeat(60)}`);

    const batches = [entries.slice(0, 24), entries.slice(24)];

    for (let bi = 0; bi < batches.length; bi++) {
      const batch = batches[bi];
      if (batch.length === 0) continue;

      console.log(`  バッチ ${bi + 1}/2 (${batch.length}件)...`);

      const entriesDesc = batch.map((e) => {
        const [, r2, r3, bias] = e.id.split("-");
        return `- id: ${e.id} | 漢字名: ${e.kanji_name} | コピー: ${e.naming_reason} | rank2=${r2}(${NEURO[r2]}), rank3=${r3}(${NEURO[r3]}), bias=${bias}(${BIAS_DESC[bias]})`;
      }).join("\n");

      const prompt = `以下の疾走領域エントリの「lead」（リード文）を書いてください。
漢字名とコピーはそのまま使います。その世界観に準拠してください。

## 疾走領域とは
疾走領域とは「自分が夢中になれる条件が揃った固有の世界」。
領域展開すると、自分の内側に固有の風景が広がる。

## リード文の役割
疾走領域を展開したときに見える**固有の風景・情景**を描写する。
ユーザーが「自分の領域はこういう世界なんだ」と感じられるビジュアル。

## 色テーマ
${r1} = ${theme.color}
風景の素材: ${theme.landscape}

## 書き方ルール

### 形式
- **80〜100字**（厳守）
- 2〜3文
- 疾走領域の中に広がる風景を描く

### 良い例
「地平線まで続く灼熱の荒野。赤い砂塵の中に一筋の光の道が伸び、その先端で炎の矢が回り続けている。足を踏み入れた瞬間、体が勝手に走り出す。」

「果てのない氷の湖。鏡面のような水面に空も大地も映り込み、上下の区別がなくなる。吐く息だけが白い。静寂の中で、思考だけが澄んでいく。」

「一面の花畑の中心に、一輪だけ光を放つ花がある。風はなく、花弁は微動だにしない。けれどその花に近づくほど、胸の奥が温かくなっていく。」

「黄金色の雷雲が低く垂れ込める荒野。大地には無数の剣が突き刺さり、空気が帯電している。稲妻が走るたび、視界が一瞬だけ完璧に澄む。」

「薄紫の霧に包まれた森。光源は見えないのに、すべてが仄かに発光している。無数の蝶が舞い、羽ばたくたびに時間の感覚が溶けていく。」

### 禁止事項
- 診断用語（ドーパミン、セロトニン等）は使わない
- 現実の比喩（締め切り、オフィス等）は使わない
- 「領域内に入ると」等のメタ表現は使わない
- 説明的にならない。風景を描く。
- 他のエントリと風景が被らないようにする

### ポイント
- 漢字名のイメージを風景に反映する（虎→虎がいる、氷→氷がある、等）
- bias(偏り)で世界の質感を変える：
  - Single: 一点だけが際立つ風景（一本の道、一振りの剣、一輪の花）
  - Dual: 二つの要素が対峙・融合する風景（対岸、二つの月、交差する道）
  - Trinity: 三つの要素が調和する風景（三つの山、三重の虹、三つの音）
  - Flat: 広く満ちた風景（地平線、海原、大草原、満天の星）

## 対象エントリ
${entriesDesc}

## 出力形式
JSON配列で返してください：
\`\`\`json
[{"id":"X-X-X-Xxxx","lead":"リード文80〜100字。"}]
\`\`\`
JSON以外のテキストは出力しないでください。`;

      try {
        const msg = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 6000,
          messages: [{ role: "user", content: prompt }],
        });

        const text = (msg.content[0] as any).text;
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          console.error("  ❌ JSONが見つからない");
          continue;
        }

        const results = JSON.parse(jsonMatch[0]);
        let batchUpdated = 0;

        for (const result of results) {
          const original = data.find((d) => d.id === result.id);
          if (!original) continue;
          console.log(`  ${original.kanji_name} (${result.lead.length}字)`);
          console.log(`    ${result.lead}`);
          original.lead = result.lead;
          batchUpdated++;
        }

        totalUpdated += batchUpdated;
        console.log(`  ✅ ${batchUpdated}/${batch.length}件更新`);

        if (bi < batches.length - 1) {
          await new Promise((r) => setTimeout(r, 2000));
        }
      } catch (e: any) {
        console.error(`  ❌ API error: ${e.message}`);
      }
    }
  }

  if (totalUpdated > 0) {
    const backupFile = FILE.replace(".json", `-backup-lead-${Date.now()}.json`);
    fs.copyFileSync(FILE, backupFile);
    console.log(`\nバックアップ: ${backupFile}`);
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8");
    console.log(`✅ ${totalUpdated}件のリード文を更新しました`);
  } else {
    console.log("\n変更なし");
  }
}

main().catch(console.error);
