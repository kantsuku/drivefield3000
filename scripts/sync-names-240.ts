/**
 * names-2880.json の最新候補を names-240.json へ反映する
 *
 * - 既存の names-240.json エントリは保持（良い名前はそのまま）
 * - 欠けているエントリだけ names-2880.json から補完
 *
 * Usage: npx tsx scripts/sync-names-240.ts
 */

import * as fs from "fs";
import * as path from "path";

const names2880File = path.resolve(__dirname, "../src/data/names-2880.json");
const patternsFile = path.resolve(__dirname, "../src/data/patterns-2880.json");
const names240File = path.resolve(__dirname, "../src/data/names-240.json");

const NEURO_CODES = ["D", "S", "O", "N", "E"];
const BIAS_TYPES = ["Single", "Dual", "Trinity", "Flat"];

function permutations3(arr: string[]): [string, string, string][] {
  const result: [string, string, string][] = [];
  for (const a of arr) {
    for (const b of arr) {
      if (b === a) continue;
      for (const c of arr) {
        if (c === a || c === b) continue;
        result.push([a, b, c]);
      }
    }
  }
  return result;
}

function allExpectedIds(): string[] {
  const ids: string[] = [];
  for (const [a, b, c] of permutations3(NEURO_CODES)) {
    for (const bias of BIAS_TYPES) {
      ids.push(`${a}-${b}-${c}-${bias}`);
    }
  }
  return ids;
}

function main() {
  const names2880: any[] = JSON.parse(fs.readFileSync(names2880File, "utf-8"));
  const patterns: any[] = JSON.parse(fs.readFileSync(patternsFile, "utf-8"));
  const names240: any[] = JSON.parse(fs.readFileSync(names240File, "utf-8"));

  // pattern_id → pattern
  const patMap: Record<number, any> = {};
  for (const p of patterns) patMap[p.pattern_id] = p;

  // core_code-bias_type → candidates (names-2880 から)
  const candidateMap: Record<string, any[]> = {};
  for (const n of names2880) {
    const p = patMap[n.pattern_id];
    if (!p) continue;
    const key = `${p.core_code}-${p.bias_type}`;
    if (!candidateMap[key]) candidateMap[key] = [];
    candidateMap[key].push(n);
  }

  // 現在の names-240 を id でインデックス（"-" を含む文字列IDのみ）
  const existing240: Record<string, any> = {};
  for (const n of names240) {
    if (n.id && typeof n.id === "string" && n.id.includes("-")) {
      existing240[n.id] = n;
    }
  }

  const expectedIds = allExpectedIds();
  let added = 0;
  const result: any[] = [];

  for (const id of expectedIds) {
    if (existing240[id]) {
      result.push(existing240[id]);
    } else {
      const candidates = candidateMap[id];
      if (candidates && candidates.length > 0) {
        const c = candidates[0];
        result.push({
          id,
          pattern_id: c.pattern_id,
          kanji_name: c.kanji_name,
          reading: c.reading,
          romaji: c.romaji ?? "",
          english_name: c.english_name,
          naming_reason: c.naming_reason,
        });
        added++;
        console.log(`  補完: ${id} → ${c.kanji_name}`);
      } else {
        console.warn(`  候補なし（スキップ）: ${id}`);
      }
    }
  }

  fs.writeFileSync(names240File, JSON.stringify(result, null, 2), "utf-8");
  console.log(`\nsync-names-240: ${result.length}件 (新規補完: ${added}件) → ${names240File}`);
}

main();
