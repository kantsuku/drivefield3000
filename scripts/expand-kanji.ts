/**
 * 漢字辞書拡張候補を生成
 * Usage: npx tsx scripts/expand-kanji.ts
 */
import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const existing =
  "火炎雷光牙刃爆烈奔衝静深森月影脈玄澄眠幽環輪流波巡旋渦紋潮躍鳴響奏和継縁結連歌契昇翔天空星雲翼華虹頂鎖律制界鋼圧縛軸壁封龍虎狼猫熊鳥狐蛇獅鯨心愛夢色幻灯詩核宙灯千先線仙戦鮮繊震迅芯真神紅煌航香霞琉晶鐘零玲嶺霊破羽覇円焔宴岬岚疾閃灼猛凱昂駆駈寂沈潜暁朧冥澪凪霧沁宵循紡綾渚滲廻湧綻詠盟祝慈祈絆融誘抱遥景越彼跳拓帆戒慎鋭盾圏軌矩衡冴錬稜整鷹鴉鹿蝶麟鷲蟲鮫鯱鸞凰猟獣燕鶴憧悠誠粋凛燈瑞雅走貫伸裂開揺創編刻知理識悟算計解研察観証問学究読測構析索王将司師衛隊陣塔門冠位格印章範権命";

async function main() {
  console.log("漢字拡張候補を生成中...\n");

  const resp = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: `疾走領域 / Drive Field 3000 という診断ツールの真名（漢字2文字の名前）に使う漢字辞書を拡張したい。

既存の漢字（235字、重複なし）:
${existing}

以下のカテゴリごとに、真名の素材として映える漢字を提案してください。

## 提案するカテゴリ

1. **数字・量**（一〜十、百千万など。「一虎」「三鷹」「千雷」のような組み合わせに使える）
2. **天候・気象**（風雨雪霜露氷など。既存と被らないもの）
3. **時間・季節**（春夏秋冬、朝昼夜、永遠、瞬間など）
4. **地形・自然**（山川海谷崖峠野原など）
5. **植物**（桜梅竹松藤蓮柳杉など）
6. **金属・鉱物**（金銀銅鉄玉石など。既存と被らないもの）
7. **色彩**（白黒蒼碧朱翠紫など。既存の紅と被らないもの）
8. **道具・武器**（剣弓矢槍盾鍵笛琴弦糸など）
9. **干支**（子丑寅卯辰巳午未申酉戌亥）
10. **形・幾何**（角弧面点柱など。既存の円・輪・線と被らないもの）

## ルール
- 既存の235字と重複しないこと
- 読めること（常用漢字＋人名用漢字の範囲。難読すぎるものは避ける）
- 真名に使ったとき映えること（「一虎」「蒼穹」「氷弦」のようにカッコいい組み合わせが想像できるもの）
- 各カテゴリ10〜20字程度

## 出力形式
カテゴリごとに以下のJSON配列で返してください。全カテゴリまとめて1つのJSON配列で。JSONのみ、説明不要:
[
  {"kanji": "一", "reading": "いち", "category": "数字・量", "image": "始まりの一手、唯一無二", "memo": "一虎、一閃などの組み合わせに強い"}
]`,
      },
    ],
  });

  const text =
    resp.content[0].type === "text" ? resp.content[0].text : "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) {
    console.log("JSONパースに失敗。生のレスポンス:");
    console.log(text);
    return;
  }

  const data = JSON.parse(match[0]);
  const outPath = path.resolve(__dirname, "kanji-expansion-candidates.json");
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf-8");

  // カテゴリ別集計
  const cats: Record<string, any[]> = {};
  for (const d of data) {
    if (!cats[d.category]) cats[d.category] = [];
    cats[d.category].push(d);
  }

  let total = 0;
  for (const [cat, items] of Object.entries(cats)) {
    console.log(`=== ${cat}（${items.length}字）===`);
    for (const item of items) {
      console.log(`  ${item.kanji}（${item.reading}）— ${item.image}`);
    }
    console.log();
    total += items.length;
  }

  console.log(`合計: ${total}字`);
  console.log(`既存235 + 追加${total} = ${235 + total}字`);
  console.log(`\n保存: ${outPath}`);
}

main().catch(console.error);
