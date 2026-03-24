/**
 * L4タイプ名の読み仮名を生成してl4-types.jsonに追加
 * Usage: npx tsx scripts/add-l4-readings.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function main() {
  const file = path.resolve(__dirname, "../src/data/l4-types.json");
  const data = JSON.parse(fs.readFileSync(file, "utf-8"));

  const names = data.map((t: any) => t.name);
  const list = names.map((n: string, i: number) => `${i + 1}. ${n}`).join("\n");

  const res = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [{
      role: "user",
      content: `以下の漢字4文字の名称すべてにひらがなの読みをつけてください。
造語や当て字の場合は最も自然な音読みで読んでください。

${list}

出力形式: JSONのみ（配列）
[{"name":"一点突破","reading":"いってんとっぱ"}, ...]

注意: 番号順を保ち、全${names.length}件を出力すること。`
    }]
  });

  const text = res.content[0].type === "text" ? res.content[0].text : "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("JSON parse failed:\n" + text);
  const readings: { name: string; reading: string }[] = JSON.parse(match[0]);

  const readingMap: Record<string, string> = {};
  for (const r of readings) {
    readingMap[r.name] = r.reading;
  }

  let updated = 0;
  for (const entry of data) {
    if (readingMap[entry.name]) {
      entry.reading = readingMap[entry.name];
      updated++;
    }
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
  console.log(`完了! ${updated}件に読みを追加 → ${file}`);
  data.slice(0, 5).forEach((t: any) => console.log(`  ${t.name}（${t.reading}）`));
}

main().catch(console.error);
