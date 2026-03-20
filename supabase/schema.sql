-- Drive Field 3000 - Supabase Schema
-- ユーザー診断結果の保存用（パターンデータ自体は静的JSON配信）

create table if not exists diagnosis_results (
  id uuid primary key default gen_random_uuid(),
  pattern_id integer not null,
  core_code text not null,
  bias_type text not null,
  output_level text not null,
  ignition text not null,
  time_character text not null,
  field_name_kanji text,
  field_name_en text,
  share_token text unique default encode(gen_random_bytes(8), 'hex'),
  created_at timestamptz default now()
);

-- シェアトークンでの高速検索用
create index if not exists idx_diagnosis_share_token
  on diagnosis_results (share_token);

-- パターンIDでの集計用
create index if not exists idx_diagnosis_pattern_id
  on diagnosis_results (pattern_id);
