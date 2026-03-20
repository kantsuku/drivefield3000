/**
 * Excel (720パターン) → JSON (2880パターン) 変換スクリプト
 *
 * 720パターン (60骨格 × 4偏り × 3出力) に
 * 発動方向(外燃/内燃) × 時間特性(瞬発/熟成) を掛けて 2880 に展開する。
 *
 * Usage: npx tsx scripts/convert-excel.ts
 */

import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

const EXCEL_PATH = path.resolve(
  __dirname,
  "../../requirements/drive_field_720_patterns_v9.xlsx"
);
const OUT_DIR = path.resolve(__dirname, "../src/data");

interface Row720 {
  Pattern_ID: number;
  Core_ID: number;
  Core_Code: string;
  Rank1: string;
  Rank2: string;
  Rank3: string;
  Bias_Type: string;
  Output_Level: string;
  Drive_Structure: string;
  Trigger_Core: string;
  Accelerator_Core: string;
  Sustain_Core: string;
  Bias_Interpretation: string;
  Output_Interpretation: string;
  Awakening_Condition: string;
  Drain_Condition: string;
  Recovery_Condition: string;
  Naming_Status: string;
  Field_Name: string;
  Meaning_Memo: string;
  Trigger_Memo: string;
  Drain_Memo: string;
  Recovery_Memo: string;
  "二語（漢字）": string;
  読み: string;
  英語: string;
  解釈: string;
}

interface CoreRow {
  Core_ID: number;
  Core_Code: string;
  Rank1: string;
  Rank2: string;
  Rank3: string;
  Drive_Structure: string;
  Trigger_Core: string;
  Accelerator_Core: string;
  Sustain_Core: string;
  Awakening_Condition: string;
  Drain_Condition: string;
  Recovery_Condition: string;
  Keywords: string;
}

interface KanjiRow {
  No: number;
  漢字: string;
  読み: string;
  主カテゴリ: string;
  副カテゴリ: string;
  発動方向: string;
  時間特性: string;
  音の強さ: string;
  イメージ: string;
  使用可否: string;
  使用回数: number;
  メモ: string;
}

const IGNITIONS = [
  { code: "external", label: "外燃", desc: "外部刺激・他者・環境変化で火がつく" },
  { code: "internal", label: "内燃", desc: "内側の納得・衝動・構想で火がつく" },
] as const;

const TIME_CHARS = [
  { code: "burst", label: "瞬発", desc: "立ち上がりが速い" },
  { code: "mature", label: "熟成", desc: "じわじわ温まり、閾値を超えると回り出す" },
] as const;

function main() {
  console.log("Reading Excel:", EXCEL_PATH);
  const wb = XLSX.readFile(EXCEL_PATH);

  // --- Core_60 ---
  const coreSheet = wb.Sheets["Core_60"];
  const cores: CoreRow[] = XLSX.utils.sheet_to_json(coreSheet);
  console.log(`Core_60: ${cores.length} rows`);

  // --- Patterns_720 ---
  const patSheet = wb.Sheets["Patterns_720"];
  const patterns720: Row720[] = XLSX.utils.sheet_to_json(patSheet);
  console.log(`Patterns_720: ${patterns720.length} rows`);

  // --- 漢字辞書 ---
  const kanjiSheet = wb.Sheets["漢字辞書"];
  const kanjiRows: KanjiRow[] = XLSX.utils.sheet_to_json(kanjiSheet);
  console.log(`漢字辞書: ${kanjiRows.length} rows`);

  // --- 類義語群 ---
  const groupSheet = wb.Sheets["類義語群"];
  const groups = XLSX.utils.sheet_to_json(groupSheet);
  console.log(`類義語群: ${groups.length} rows`);

  // --- Dictionaries ---
  const dictSheet = wb.Sheets["Dictionaries"];
  const dicts = XLSX.utils.sheet_to_json(dictSheet);

  // === 720 → 2880 展開 ===
  const patterns2880: any[] = [];
  let id = 1;

  for (const p of patterns720) {
    for (const ign of IGNITIONS) {
      for (const tc of TIME_CHARS) {
        patterns2880.push({
          pattern_id: id++,
          core_id: p.Core_ID,
          core_code: p.Core_Code,
          rank1: p.Rank1,
          rank2: p.Rank2,
          rank3: p.Rank3,
          bias_type: p.Bias_Type,
          output_level: p.Output_Level,
          ignition: ign.code,
          ignition_label: ign.label,
          ignition_desc: ign.desc,
          time_character: tc.code,
          time_character_label: tc.label,
          time_character_desc: tc.desc,
          drive_structure: p.Drive_Structure,
          trigger_core: p.Trigger_Core,
          accelerator_core: p.Accelerator_Core,
          sustain_core: p.Sustain_Core,
          bias_interpretation: p.Bias_Interpretation,
          output_interpretation: p.Output_Interpretation,
          awakening_condition: p.Awakening_Condition,
          drain_condition: p.Drain_Condition,
          recovery_condition: p.Recovery_Condition,
          field_name_kanji: p["二語（漢字）"] || "",
          field_name_reading: p["読み"] || "",
          field_name_en: p["英語"] || "",
          interpretation: p["解釈"] || "",
        });
      }
    }
  }

  console.log(`\n2880展開完了: ${patterns2880.length} patterns`);

  // === 出力 ===
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Core_60
  const coreOut = cores.map((c) => ({
    core_id: c.Core_ID,
    core_code: c.Core_Code,
    rank1: c.Rank1,
    rank2: c.Rank2,
    rank3: c.Rank3,
    drive_structure: c.Drive_Structure,
    trigger_core: c.Trigger_Core,
    accelerator_core: c.Accelerator_Core,
    sustain_core: c.Sustain_Core,
    awakening_condition: c.Awakening_Condition,
    drain_condition: c.Drain_Condition,
    recovery_condition: c.Recovery_Condition,
    keywords: c.Keywords,
  }));
  fs.writeFileSync(
    path.join(OUT_DIR, "core-60.json"),
    JSON.stringify(coreOut, null, 2),
    "utf-8"
  );
  console.log("Wrote core-60.json");

  // Patterns 2880
  fs.writeFileSync(
    path.join(OUT_DIR, "patterns-2880.json"),
    JSON.stringify(patterns2880, null, 2),
    "utf-8"
  );
  console.log("Wrote patterns-2880.json");

  // 漢字辞書
  const kanjiOut = kanjiRows.map((k) => ({
    no: k.No,
    kanji: k["漢字"],
    reading: k["読み"],
    main_category: k["主カテゴリ"],
    sub_category: k["副カテゴリ"],
    ignition: k["発動方向"] === "外燃" ? "external" : k["発動方向"] === "内燃" ? "internal" : "",
    time_character: k["時間特性"] === "瞬発" ? "burst" : k["時間特性"] === "熟成" ? "mature" : "",
    sound_strength: k["音の強さ"],
    image: k["イメージ"],
    usable: k["使用可否"] === "可",
    use_count: k["使用回数"] || 0,
    memo: k["メモ"] || "",
  }));
  fs.writeFileSync(
    path.join(OUT_DIR, "kanji-dictionary.json"),
    JSON.stringify(kanjiOut, null, 2),
    "utf-8"
  );
  console.log("Wrote kanji-dictionary.json");

  // 類義語群
  fs.writeFileSync(
    path.join(OUT_DIR, "synonym-groups.json"),
    JSON.stringify(groups, null, 2),
    "utf-8"
  );
  console.log("Wrote synonym-groups.json");

  // Dictionaries
  fs.writeFileSync(
    path.join(OUT_DIR, "dictionaries.json"),
    JSON.stringify(dicts, null, 2),
    "utf-8"
  );
  console.log("Wrote dictionaries.json");

  console.log("\nDone! All JSON files written to src/data/");
}

main();
