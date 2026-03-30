import * as fs from 'fs';
import * as path from 'path';

// ─── Types ────────────────────────────────────────────

export interface NameEntry { id: string; pattern_id: number; kanji_name: string; reading: string; english_name: string; naming_reason: string; lead?: string; }
export interface PatternEntry { pattern_id: number; core_code: string; rank1: string; rank2: string; rank3: string; bias_type: string; output_level: string; ignition: string; ignition_label: string; ignition_desc: string; time_character: string; time_character_label: string; time_character_desc: string; drive_structure: string; trigger_core: string; accelerator_core: string; sustain_core: string; bias_interpretation: string; output_interpretation: string; awakening_condition: string; drain_condition: string; recovery_condition: string; field_name_kanji: string; field_name_reading: string; field_name_en: string; interpretation: string; }
export interface InterpEntry { pattern_id: number; structural_interpretation: string; symbolic_image: string; texture_keywords: string[]; trigger: string; accelerator: string; sustain: string; breakdown: string; recovery: string; awakened_vibe: string; }
export interface KataEntry { id: string; rank1: string; bias: string; name: string; reading: string; }

// ─── Lazy loaders with module-level cache ─────────────

let _patterns: PatternEntry[] | null = null;
let _interps: Record<number, InterpEntry> | null = null;

function loadPatterns(): PatternEntry[] {
  if (!_patterns) {
    const file = path.resolve(process.cwd(), 'src/data/patterns-2880.json');
    _patterns = JSON.parse(fs.readFileSync(file, 'utf-8'));
  }
  return _patterns!;
}

function loadInterps(): Record<number, InterpEntry> {
  if (!_interps) {
    const file = path.resolve(process.cwd(), 'src/data/interpretations-2880.json');
    const raw: InterpEntry[] = JSON.parse(fs.readFileSync(file, 'utf-8'));
    _interps = {};
    for (const r of raw) _interps[r.pattern_id] = r;
  }
  return _interps!;
}

// ─── Public API ───────────────────────────────────────

export function findPattern(coreCode: string, bias: string, ignition: string, timing: string, output: string): PatternEntry | undefined {
  const patterns = loadPatterns();
  return patterns.find(
    (p) => p.core_code === coreCode && p.bias_type === bias && p.ignition === ignition && p.time_character === timing && p.output_level === output
  );
}

export function getInterpretation(patternId: number): InterpEntry | undefined {
  const interps = loadInterps();
  return interps[patternId];
}
