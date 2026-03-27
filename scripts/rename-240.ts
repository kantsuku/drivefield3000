/**
 * 240の疾走領域名とキャッチコピーを色テーマに合わせて一括リネーム
 *
 * Usage: ANTHROPIC_API_KEY=sk-xxx npx tsx scripts/rename-240.ts
 *   --dry-run  実行せずプレビューだけ表示
 *   --rank1=D  特定のrank1だけ処理（D/S/O/N/E）
 */

import Anthropic from "@anthropic-ai/sdk";
import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const FILE = path.resolve(__dirname, "../src/data/names-240.json");
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const rank1Only = args.find((a) => a.startsWith("--rank1="))?.split("=")[1];

// ─── 色テーマ定義 ─────────────────────────────────────

const COLOR_THEME: Record<string, { name: string; color: string; imagery: string; goodKanji: string; badKanji: string }> = {
  D: {
    name: "ドーパミン（新規・可能性）",
    color: "赤 / Red",
    imagery: "火、炎、紅、朱、焔、陽、灼、烈、熾、鳳、虎、獅、猛、闘、嵐、雷獣、炎獣、戦、征、覇",
    goodKanji: "虎拓（切り拓く猛虎の突破力）、焔渦（渦巻く焔の探求心）",
    badKanji: "桜弓（桜は緑テーマ）、星獣（星は紫テーマ）、霧閃（霧は青テーマ、閃は黄テーマ）",
  },
  S: {
    name: "セロトニン（理解・秩序）",
    color: "青 / Blue",
    imagery: "水、氷、蒼、碧、海、月、霧、雨、霜、鏡、泉、澄、潮、涼、冴、凛、鶴、銀河、深海、静水",
    goodKanji: "澄灯（澄んだ水面に灯る知性の光）、氷鏡（氷の鏡に映す構造の本質）",
    badKanji: "識炎（炎は赤テーマ）、翠沈（翠は緑テーマ）、雷華（雷は黄テーマ）",
  },
  O: {
    name: "オキシトシン（共感・接続）",
    color: "緑 / Green",
    imagery: "森、風、翠、葉、花、草、春、桜、絆、芽、蔦、苗、鳥、蝶、巣、園、実、種、藤棚、木漏れ日",
    goodKanji: "桜弓（桜の優美さと弓の精密性）、翠震（翠の共鳴が大地を震わせる）",
    badKanji: "海轟（海は青テーマ）、虎輪（虎は赤テーマ）、結炎（炎は赤テーマ）",
  },
  N: {
    name: "ノルアドレナリン（緊張・集中）",
    color: "黄 / Gold",
    imagery: "雷、光、金、土、閃、稲妻、砂、琥珀、陽光、黄金、電、鋼、剣、岩、鍛、砦、盾、矛、城壁、大地",
    goodKanji: "金剣（黄金の剣が闇を斬る集中力）、雷閃（一瞬の稲妻が戦場を照らす）",
    badKanji: "蒼舞（蒼は青テーマ）、紫環（紫は紫テーマ）、朱誓（朱は赤テーマ）",
  },
  E: {
    name: "エンドルフィン（快感・没入）",
    color: "紫 / Purple",
    imagery: "夜、星、夢、幻、紫、藤、菫、月影、深淵、闇、霊、魂、宵、朧、幽、妖、魔、黄昏、銀月、天鵞絨",
    goodKanji: "幽蝶（幽玄の蝶が舞う没入の園）、星渦（星の渦に呑まれる陶酔）",
    badKanji: "鳳熾（鳳は赤テーマ）、問火（火は赤テーマ）、雷流（雷は黄テーマ）",
  },
};

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

// ─── メイン処理 ───────────────────────────────────────

async function main() {
  const data: any[] = JSON.parse(fs.readFileSync(FILE, "utf-8"));

  // rank1ごとにグループ化
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
    console.log(`${r1} (${theme.name}) — ${theme.color} — ${entries.length}件`);
    console.log(`${"═".repeat(60)}`);

    // 48件を24件×2バッチに分割
    const batches = [entries.slice(0, 24), entries.slice(24)];

    for (let bi = 0; bi < batches.length; bi++) {
      const batch = batches[bi];
      if (batch.length === 0) continue;

      console.log(`  バッチ ${bi + 1}/2 (${batch.length}件)...`);

      const entriesDesc = batch.map((e) => {
        const [, r2, r3, bias] = e.id.split("-");
        return `- id: ${e.id} | 現在: ${e.kanji_name}(${e.reading}/${e.english_name}) | rank2=${r2}(${NEURO[r2]}), rank3=${r3}(${NEURO[r3]}), bias=${bias}(${BIAS[bias]})`;
      }).join("\n");

      const prompt = `以下の疾走領域エントリの「漢字名」「読み」「英語名」「命名理由」を書き直してください。

## 色テーマ規則（最重要）
このグループは **${r1}（${theme.name}）** = **${theme.color}** です。
漢字名に使う漢字は、この色のイメージに合うものから選んでください。

### 使って良い漢字イメージ
${theme.imagery}

### 良い例
${theme.goodKanji}

### 悪い例（他の色テーマの漢字を使っている）
${theme.badKanji}

## 命名理由の書き方（キャッチコピーになる）
命名理由は1文で、以下の形式にしてください：
「[風景・情景の描写]、[短いキャッチコピー]。」

キャッチコピー部分（最後の「、」以降）は10〜20文字程度。

### 良いキャッチコピー例
- 桜の優美さと弓の精密性
- 切り拓く猛虎の突破力
- 精密な調整と高揚する生命力
- 星の輝きと獣の野性
- 静水に宿る鶴の洞察力
- 黄金の稲妻が闇を裂く集中力

### 悪いキャッチコピー例（絶対に書かないこと）
- ドーパミン1位特化にノルアドレナリンが加わる構造の鋭さ（←神経系名を直接使うな）
- 著書にまとめ上げる深い森の巨木のような威厳完成力（←長すぎる、意味不明）
- 見事に表現している（←選定メモであってコピーではない）
- 緊張の中で影のように疾走する二軸の駆動力（←診断構造の説明）

## ルール
1. 漢字名は必ず2文字
2. rank2, rank3の神経系の性質を名前に反映してよいが、色テーマは必ずrank1に合わせる
3. 48件の中で漢字名が重複しないこと
4. 読みはひらがな、英語名はその漢字名の英訳
5. 命名理由に「神経系」「ドーパミン」「セロトニン」等の診断用語を絶対に含めない
6. 命名理由に「表現」「象徴」「最適」「力強く」等の選定メモ的表現を含めない
7. bias(偏り)の特徴を名前の雰囲気に反映する：
   - Single: 一極集中、鋭い、特化した印象
   - Dual: 二つの力の融合・拮抗
   - Trinity: 三つの力の調和・共鳴
   - Flat: 広がり・万能・拡散

## 対象エントリ
${entriesDesc}

## 出力形式
JSON配列で返してください。各要素は以下の形式：
\`\`\`json
[
  { "id": "X-X-X-Xxxx", "kanji_name": "XX", "reading": "xx", "english_name": "Xxx Xxx", "naming_reason": "ここに1文の命名理由。" }
]
\`\`\`
JSON以外のテキストは出力しないでください。`;

      if (dryRun) {
        console.log(`  [DRY RUN] prompt length: ${prompt.length}`);
        continue;
      }

      try {
        const msg = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8000,
          messages: [{ role: "user", content: prompt }],
        });

        const text = (msg.content[0] as any).text;
        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          console.error("  ❌ JSONが見つからない");
          console.error(text.slice(0, 200));
          continue;
        }

        const results = JSON.parse(jsonMatch[0]);
        let batchUpdated = 0;

        for (const result of results) {
          const original = data.find((d) => d.id === result.id);
          if (!original) {
            console.warn(`  ⚠ id not found: ${result.id}`);
            continue;
          }
          const changed = original.kanji_name !== result.kanji_name ||
                          original.naming_reason !== result.naming_reason;
          if (changed) {
            console.log(`  ${original.kanji_name} → ${result.kanji_name}(${result.reading}/${result.english_name})`);
            console.log(`    旧理由: ${(original.naming_reason || '').slice(0, 50)}...`);
            console.log(`    新理由: ${result.naming_reason}`);
            original.kanji_name = result.kanji_name;
            original.reading = result.reading;
            original.english_name = result.english_name;
            original.naming_reason = result.naming_reason;
            batchUpdated++;
          }
        }

        totalUpdated += batchUpdated;
        console.log(`  ✅ ${batchUpdated}/${batch.length}件更新`);

        // Rate limit protection
        if (bi < batches.length - 1) {
          await new Promise((r) => setTimeout(r, 2000));
        }
      } catch (e: any) {
        console.error(`  ❌ API error: ${e.message}`);
      }
    }
  }

  if (!dryRun && totalUpdated > 0) {
    // Backup
    const backupFile = FILE.replace(".json", `-backup-${Date.now()}.json`);
    fs.copyFileSync(FILE, backupFile);
    console.log(`\nバックアップ: ${backupFile}`);

    // Save
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8");
    console.log(`✅ ${totalUpdated}件を更新して保存しました`);
  } else if (dryRun) {
    console.log("\n[DRY RUN] 実際の変更は行いません");
  } else {
    console.log("\n変更なし");
  }
}

main().catch(console.error);
