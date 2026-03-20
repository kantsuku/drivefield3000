/** 神経系コード */
export type NeuroCode = "D" | "S" | "O" | "N" | "E";

/** 偏りタイプ */
export type BiasType = "Single" | "Dual" | "Trinity" | "Flat";

/** 出力レベル */
export type OutputLevel = "Light" | "Middle" | "Over";

/** 発動方向 */
export type IgnitionDirection = "external" | "internal";

/** 時間特性 */
export type TimeCharacter = "burst" | "mature";

/** 骨格（60パターン） */
export interface Core60 {
  core_id: number;
  core_code: string;
  rank1: NeuroCode;
  rank2: NeuroCode;
  rank3: NeuroCode;
  drive_structure: string;
  trigger_core: string;
  accelerator_core: string;
  sustain_core: string;
  awakening_condition: string;
  drain_condition: string;
  recovery_condition: string;
  keywords: string;
}

/** 2880パターン */
export interface Pattern {
  pattern_id: number;
  core_id: number;
  core_code: string;
  rank1: NeuroCode;
  rank2: NeuroCode;
  rank3: NeuroCode;
  bias_type: BiasType;
  output_level: OutputLevel;
  ignition: IgnitionDirection;
  time_character: TimeCharacter;
  drive_structure: string;
  trigger_core: string;
  accelerator_core: string;
  sustain_core: string;
  bias_interpretation: string;
  output_interpretation: string;
  awakening_condition: string;
  drain_condition: string;
  recovery_condition: string;
  field_name_kanji: string;
  field_name_reading: string;
  field_name_en: string;
  interpretation: string;
}

/** 漢字辞書エントリ */
export interface KanjiEntry {
  no: number;
  kanji: string;
  reading: string;
  main_category: string;
  sub_category: string;
  ignition: IgnitionDirection | "";
  time_character: TimeCharacter | "";
  sound_strength: string;
  image: string;
  usable: boolean;
  use_count: number;
  memo: string;
}
