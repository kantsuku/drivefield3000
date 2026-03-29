/**
 * 240の疾走領域のリード文を一括リライト（v2）
 * 「領域」を最終文に織り込むルールに統一
 * 手修正済みの14件（焔王〜炎連）はスキップ
 *
 * Usage: npx tsx scripts/rewrite-lead-240-v2.ts
 *   --rank1=D  特定のrank1だけ処理
 *   --dry      実際には書き込まない
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
const dryRun = args.includes("--dry");

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

// 手修正済みエントリのID（スキップ対象）
const SKIP_IDS = new Set([
  "D-S-O-Single", "D-S-O-Dual", "D-S-O-Trinity", "D-S-O-Flat",
  "D-S-N-Single", "D-S-N-Dual", "D-S-N-Trinity", "D-S-N-Flat",
  "D-S-E-Single", "D-S-E-Dual", "D-S-E-Trinity", "D-S-E-Flat",
  "D-O-S-Single", "D-O-S-Dual",
]);

// 手修正済みの実例（few-shot用）
const EXAMPLES = `
「焔王」(D-S-O-Single): 「地平線まで続く紅い荒野。溶岩の河が大地を割り、その中央に一本だけ炎の道が真っ直ぐ伸びている。赤い空から焔の嵐が降り注ぐ中、炎の道は領域となり、遥か彼方の頂へと続いていく。」
「炎順」(D-S-O-Dual): 「二つの溶岩の流れが穏やかに合流する地点。赤き流面が鏡のように空を映し、炎の粒子が静かに舞い踊る。二つの流れが一つになる領域で、心が熱く満たされる。」
「烈環」(D-S-O-Trinity): 「三つの炎の竜巻が規則正しく回転する荒野の大地。それぞれが異なる高さで螺旋を描き、完全なる調和を保っている。この領域の中心で全てが理解される。」
「火散」(D-S-O-Flat): 「果てしない紅い荒野に無数の火花が散らばっている。一粒一粒が星のように輝き、風に乗って舞い踊る。その美しい散華の領域は、心も同時に沸き踊る。」
「虎拓」(D-S-N-Single): 「岩山の頂に一頭の炎の虎が佇んでいる。赤き眼光が暗闇を切り裂き、未踏の道を照らし出す。その威厳ある佇まいは領域そのものであり、恐れすらも力に変わる。」
「炎氷」(D-S-N-Dual): 「灼熱の荒野に炎が舞い上がる。大地の裂け目から、透明な氷塊が湧き出し続ける。相反する二つの力が交差する領域で、新たな道筋が舞い降りる。」
「猛渦」(D-S-N-Trinity): 「三つの炎の渦が互いを追いかけながら螺旋を描く。猛烈な回転が生み出す風圧が肌を刺激し、空気が震える。渦の中心は領域となり、極限の思考を生む。」
「紅野」(D-S-N-Flat): 「地平線まで続く紅い荒野。風は吹かず、音もない完全な静寂の中で、空気だけが熱く震えている。この張り詰めた領域で、意識が極限まで研ぎ澄まされる。」
「炎連」(D-O-S-Dual): 「二つの炎の玉が鎖で繋がれ、互いの周りを回転している。熱い連鎖反応が空間に響き、赤い光の軌跡を描く。この結びつきは領域となり、心を熱く、そして温かくする。」
`.trim();

async function main() {
  const data: any[] = JSON.parse(fs.readFileSync(FILE, "utf-8"));

  // スキップ対象を除外
  const targets = data.filter((d) => d.id?.includes("-") && !SKIP_IDS.has(d.id));

  const groups: Record<string, any[]> = {};
  for (const entry of targets) {
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

    // 20件ずつバッチ処理
    const batchSize = 20;
    const batches: any[][] = [];
    for (let i = 0; i < entries.length; i += batchSize) {
      batches.push(entries.slice(i, i + batchSize));
    }

    for (let bi = 0; bi < batches.length; bi++) {
      const batch = batches[bi];
      console.log(`  バッチ ${bi + 1}/${batches.length} (${batch.length}件)...`);

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
- **65〜85字**（厳守）
- 2〜3文
- 疾走領域の中に広がる風景を描く

### 最終文のルール（最重要）
- **最終文に「領域」という言葉を必ず入れる**
- 使い方のパターン：
  - 「〜は領域となり、〜」
  - 「この領域で、〜」
  - 「〜は領域そのものであり、〜」
  - 「〜の領域では、〜」
  - 「この〜の領域で、〜」
- **「足を踏み入れた瞬間〜」等の体験者視点は使わない**
- 風景そのものが領域であるという描写にする
- 領域の性質が感覚や力に変わる形で締める

### 手修正済みの実例（このトーンと構造に完全に合わせること）
${EXAMPLES}

### 禁止事項
- 診断用語（ドーパミン、セロトニン等）は使わない
- 現実の比喩（締め切り、オフィス等）は使わない
- 「領域内に入ると」「領域を展開すると」等のメタ表現は使わない
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
[{"id":"X-X-X-Xxxx","lead":"リード文65〜85字。"}]
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
          if (!dryRun) {
            original.lead = result.lead;
          }
          batchUpdated++;
        }

        totalUpdated += batchUpdated;
        console.log(`  ✅ ${batchUpdated}/${batch.length}件更新`);

        // API rate limit対策
        if (bi < batches.length - 1) {
          await new Promise((r) => setTimeout(r, 2000));
        }
      } catch (e: any) {
        console.error(`  ❌ API error: ${e.message}`);
      }
    }
  }

  if (totalUpdated > 0 && !dryRun) {
    const backupFile = FILE.replace(".json", `-backup-lead-${Date.now()}.json`);
    fs.copyFileSync(FILE, backupFile);
    console.log(`\nバックアップ: ${backupFile}`);
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8");
    console.log(`✅ ${totalUpdated}件のリード文を更新しました`);
  } else if (dryRun) {
    console.log(`\n[DRY RUN] ${totalUpdated}件が対象（書き込みなし）`);
  } else {
    console.log("\n変更なし");
  }
}

main().catch(console.error);
