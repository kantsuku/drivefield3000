/**
 * 漢字辞書 最終拡張候補を生成
 * Usage: npx tsx scripts/expand-kanji-final.ts
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
  console.log("最終拡張候補を生成中...\n");

  const resp = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: `疾走領域 / Drive Field 3000 の真名（漢字2文字）用の漢字辞書を最終確定したい。

既存235字:
${existing}

以下のカテゴリから「かっこいい真名になりそうな漢字」だけを選定してください。

## 確定カテゴリと方針

1. **数字・量**: 一二三七九百万無双 は確定。四五六八十は「真名に入ったときカッコいいか」で判断
2. **天候・気象**: 風雨雪氷霜露。嵐は既存の岚と被るので除外。雹は微妙
3. **時間・季節**: 春夏秋冬朝夜永瞬。刹黎も候補。昼夕は微妙かもだがカッコよければOK
4. **地形・自然**: 山川海谷野原湖滝崖。沼丘島峠はカッコよければ
5. **植物**: 桜梅竹松蓮楓椿菊蘭藤。杉柳は微妙か
6. **金属・鉱物**: 金銀鉄玉石珠。銅は微妙
7. **色彩**: 白黒蒼碧朱翠紫
8. **道具・武器**: 剣弓矢槍弦鈴琴笛鍵糸
9. **干支**: 映えるやつだけ（寅卯辰巳あたり？全12から選別）
10. **形・幾何**: 角弧点球方
11. **身体（映えるやつのみ）**: 息瞳眼
12. **建築・空間**: 城門橋窓庭路道堂殿廊（全部候補）
13. **煙**（単独追加）

さらに、上記カテゴリ以外で「真名に使ったらカッコいい」漢字が漏れていたら追加提案してください。例えば:
- 鬼、魔、闇 のようなダーク系
- 誓、徴 のような誓約系
- 舞、武、拳 のようなアクション系
- 天、地、人 のような根源系
- 焉、彗、曙 のようなレア映え系
- etc.

## 基準
- 「○○」という真名をもらったとき、テンションが上がるか？
- ダサい・スケールが小さい・怖すぎる → 除外
- 既存235字と重複 → 除外
- 読めない → 除外

## 出力形式
JSON配列で。全カテゴリまとめて1配列。JSONのみ出力、前後に説明不要:
[{"kanji":"一","reading":"いち","category":"数字・量","image":"唯一無二の一撃"}]`,
      },
    ],
  });

  const text =
    resp.content[0].type === "text" ? resp.content[0].text : "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) {
    console.log("JSONパースに失敗。レスポンス:");
    console.log(text);
    return;
  }

  const data = JSON.parse(match[0]);

  // 既存との重複チェック
  const existSet = new Set([...existing]);
  const filtered = data.filter((d: any) => !existSet.has(d.kanji));
  const dupes = data.filter((d: any) => existSet.has(d.kanji));

  // 重複漢字チェック（候補内）
  const seen = new Set<string>();
  const unique: any[] = [];
  for (const d of filtered) {
    if (!seen.has(d.kanji)) {
      seen.add(d.kanji);
      unique.push(d);
    }
  }

  const outPath = path.resolve(__dirname, "kanji-final-candidates.json");
  fs.writeFileSync(outPath, JSON.stringify(unique, null, 2), "utf-8");

  const cats: Record<string, any[]> = {};
  for (const d of unique) {
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

  if (dupes.length) {
    console.log(
      `※既存と重複して除外: ${dupes.map((d: any) => d.kanji).join("")}（${dupes.length}字）`
    );
  }

  console.log(`\n追加候補: ${total}字`);
  console.log(`既存235 + 追加${total} = ${235 + total}字`);
  console.log(`\n保存: ${outPath}`);
}

main().catch(console.error);
