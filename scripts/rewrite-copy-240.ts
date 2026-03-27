/**
 * 240の疾走領域のキャッチコピー（naming_reason）だけを一括リライト
 * 漢字名はそのまま。体言止めのかっこいいコピーに統一。
 *
 * Usage: npx tsx scripts/rewrite-copy-240.ts
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
  D: "ドーパミン（新規・可能性）",
  S: "セロトニン（理解・秩序）",
  O: "オキシトシン（共感・接続）",
  N: "ノルアドレナリン（緊張・集中）",
  E: "エンドルフィン（快感・没入）",
};

const BIAS: Record<string, string> = {
  Single: "一点突破——1位の衝動が圧倒的に突出",
  Dual: "二軸駆動——1位と2位が拮抗・融合",
  Trinity: "三極共鳴——1位〜3位が均衡して回転",
  Flat: "万能拡散——五衝動がフラットに分散",
};

const COLOR_THEME: Record<string, { color: string; imagery: string }> = {
  D: { color: "赤", imagery: "火、炎、紅、朱、焔、虎、鳳、猛、烈" },
  S: { color: "青", imagery: "水、氷、蒼、碧、月、霧、霜、鏡、泉、鶴" },
  O: { color: "緑", imagery: "森、風、翠、花、桜、蝶、蔦、鳥、園、芽" },
  N: { color: "黄/金", imagery: "雷、光、金、閃、稲妻、鋼、剣、砦、琥珀" },
  E: { color: "紫", imagery: "夜、星、夢、幽、紫、月影、霊、魂、朧、幻" },
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
        return `- id: ${e.id} | 漢字名: ${e.kanji_name} | rank2=${r2}, rank3=${r3}, bias=${bias}(${BIAS[bias]})`;
      }).join("\n");

      const prompt = `以下の疾走領域エントリの「naming_reason」（キャッチコピー）だけを書き直してください。
漢字名はそのまま使います。漢字名の意味・イメージに準拠してください。

## 色テーマ
${r1} = ${theme.color}（${theme.imagery}）

## コピーの書き方（最重要ルール）

### 形式
「[情景や動作の描写]、[体言止めのキャッチコピー]。」

### 文体ルール
- **体言止め（名詞で終わる）こと。動詞で文を閉じない。**
- 読点「、」で情景と結論を繋ぐ
- 全体で20〜35文字程度
- 短くかっこよく

### 良い例
- 未踏を裂く、猛虎の爪痕。
- すべてを統べる、炎の頂点。
- 曇りなき氷面が映す、構造の本質。
- 静寂から研ぎ出された、最も鋭い一手。
- 三つの知性が重なる、深い共鳴。
- 一点に宿る、揺るぎない愛の芯。
- 一閃に全てを賭ける、極限の集中。
- 幽玄を舞う蝶、三つの感性の共鳴。
- 深淵に研ぎ澄まされた、没入の牙。

### 悪い例（絶対にやらないこと）
- ❌ 「三つの知性が重なり、深い共鳴を生む。」（動詞で終わってる）
- ❌ 「猛虎が荒野を切り拓いていく。」（動詞で終わってる）
- ❌ 「ドーパミン1位特化にノルアドレナリンが加わる構造の鋭さ」（診断用語）
- ❌ 「見事に表現している」（選定メモ）
- ❌ 「著書にまとめ上げる深い森の巨木のような威厳完成力」（長すぎ、意味不明）

### 禁止ワード
ドーパミン、セロトニン、オキシトシン、ノルアドレナリン、エンドルフィン、神経系、表現、象徴、最適、力強く

## 対象エントリ
${entriesDesc}

## 出力形式
JSON配列で返してください。各要素は：
\`\`\`json
[{"id":"X-X-X-Xxxx","naming_reason":"ここにコピー1文。"}]
\`\`\`
JSON以外のテキストは出力しないでください。`;

      try {
        const msg = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
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
          if (original.naming_reason !== result.naming_reason) {
            const oldCopy = (original.naming_reason || "").slice(0, 40);
            console.log(`  ${original.kanji_name} | ${oldCopy}...`);
            console.log(`    → ${result.naming_reason}`);
            original.naming_reason = result.naming_reason;
            batchUpdated++;
          }
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
    const backupFile = FILE.replace(".json", `-backup-copy-${Date.now()}.json`);
    fs.copyFileSync(FILE, backupFile);
    console.log(`\nバックアップ: ${backupFile}`);
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8");
    console.log(`✅ ${totalUpdated}件のコピーを更新しました`);
  } else {
    console.log("\n変更なし");
  }
}

main().catch(console.error);
