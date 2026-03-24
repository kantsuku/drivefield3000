/**
 * names-2880.json の最新名前を patterns-2880.json へ書き戻す
 *
 * Usage: npx tsx scripts/sync-names.ts
 * デプロイ前に必ず実行すること。
 */

import * as fs from "fs";
import * as path from "path";

const patternsFile = path.resolve(__dirname, "../src/data/patterns-2880.json");
const namesFile = path.resolve(__dirname, "../src/data/names-2880.json");

const patterns: any[] = JSON.parse(fs.readFileSync(patternsFile, "utf-8"));
const names: any[] = JSON.parse(fs.readFileSync(namesFile, "utf-8"));

const namesMap: Record<number, any> = {};
for (const n of names) {
  namesMap[n.pattern_id] = n;
}

let updated = 0;
for (const p of patterns) {
  const n = namesMap[p.pattern_id];
  if (!n) continue;
  p.field_name_kanji = n.kanji_name;
  p.field_name_reading = n.reading;
  p.field_name_en = n.english_name;
  updated++;
}

fs.writeFileSync(patternsFile, JSON.stringify(patterns, null, 2), "utf-8");
console.log(`sync-names: ${updated}件を patterns-2880.json へ反映しました。`);
