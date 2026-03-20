"use client";

import { useState } from "react";
import coreData from "@/data/core-60.json";
import patternsData from "@/data/patterns-2880.json";
import kanjiData from "@/data/kanji-dictionary.json";
import dictData from "@/data/dictionaries.json";
import synonymData from "@/data/synonym-groups.json";

type Tab = "overview" | "patterns" | "cores" | "kanji" | "synonyms";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [coreFilter, setCoreFilter] = useState("");
  const [biasFilter, setBiasFilter] = useState("");
  const [namedOnly, setNamedOnly] = useState(false);
  const [kanjiCatFilter, setKanjiCatFilter] = useState("");
  const [kanjiSearch, setKanjiSearch] = useState("");

  const patterns = patternsData as any[];
  const cores = coreData as any[];
  const kanji = kanjiData as any[];
  const dicts = dictData as any[];
  const synonyms = synonymData as any[];

  // Stats
  const namedCount = patterns.filter((p) => p.field_name_kanji).length;
  const withInterpretation = patterns.filter((p) => p.interpretation).length;
  const kanjiCategories = [
    ...new Set(kanji.map((k) => k.main_category)),
  ].sort();
  const coreCodes = [...new Set(cores.map((c) => c.core_code))];
  const biasTypes = [...new Set(patterns.map((p) => p.bias_type))];

  // Filtered patterns
  const filteredPatterns = patterns.filter((p) => {
    if (coreFilter && p.core_code !== coreFilter) return false;
    if (biasFilter && p.bias_type !== biasFilter) return false;
    if (namedOnly && !p.field_name_kanji) return false;
    return true;
  });

  // Filtered kanji
  const filteredKanji = kanji.filter((k) => {
    if (kanjiCatFilter && k.main_category !== kanjiCatFilter) return false;
    if (kanjiSearch && !k.kanji.includes(kanjiSearch) && !k.reading.includes(kanjiSearch) && !k.image.includes(kanjiSearch))
      return false;
    return true;
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "概要" },
    { key: "patterns", label: "パターン (2880)" },
    { key: "cores", label: "骨格 (60)" },
    { key: "kanji", label: "漢字辞書" },
    { key: "synonyms", label: "類義語群" },
  ];

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">
        Drive Field 3000 — 管理ダッシュボード
      </h1>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 border-b border-gray-800 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              tab === t.key
                ? "border-b-2 border-white text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="総パターン数" value={patterns.length} />
          <StatCard
            label="命名済み"
            value={namedCount}
            sub={`${((namedCount / patterns.length) * 100).toFixed(1)}%`}
          />
          <StatCard
            label="解釈文あり"
            value={withInterpretation}
            sub={`${((withInterpretation / patterns.length) * 100).toFixed(1)}%`}
          />
          <StatCard label="骨格数" value={cores.length} />
          <StatCard label="漢字辞書" value={`${kanji.length}字`} />
          <StatCard label="類義語群" value={synonyms.length} />
          <StatCard
            label="カテゴリ数"
            value={kanjiCategories.length}
          />
          <StatCard
            label="神経系定義"
            value={dicts.filter((d) => d.Category === "Neuro").length}
          />

          {/* Progress bars */}
          <div className="col-span-2 md:col-span-4 mt-4">
            <h3 className="text-lg font-bold mb-3">進捗</h3>
            <ProgressBar
              label="命名進捗"
              current={namedCount}
              total={patterns.length}
            />
            <ProgressBar
              label="解釈文進捗"
              current={withInterpretation}
              total={patterns.length}
            />
          </div>

          {/* Named patterns list */}
          {namedCount > 0 && (
            <div className="col-span-2 md:col-span-4 mt-4">
              <h3 className="text-lg font-bold mb-3">
                命名済みパターン ({namedCount})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {patterns
                  .filter((p) => p.field_name_kanji)
                  .map((p) => (
                    <div
                      key={p.pattern_id}
                      className="bg-gray-900 rounded p-3 text-center"
                    >
                      <div className="text-2xl font-bold">
                        {p.field_name_kanji}
                      </div>
                      <div className="text-xs text-gray-400">
                        {p.field_name_reading}
                      </div>
                      <div className="text-xs text-gray-500">
                        {p.field_name_en}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {p.core_code} / {p.bias_type} / {p.output_level}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Patterns */}
      {tab === "patterns" && (
        <div>
          <div className="flex flex-wrap gap-3 mb-4">
            <select
              value={coreFilter}
              onChange={(e) => setCoreFilter(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-sm"
            >
              <option value="">全骨格</option>
              {coreCodes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={biasFilter}
              onChange={(e) => setBiasFilter(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-sm"
            >
              <option value="">全偏り</option>
              {biasTypes.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={namedOnly}
                onChange={(e) => setNamedOnly(e.target.checked)}
              />
              命名済みのみ
            </label>
            <span className="text-gray-500 text-sm self-center">
              {filteredPatterns.length} / {patterns.length} 件
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-left">
                  <th className="p-2">ID</th>
                  <th className="p-2">骨格</th>
                  <th className="p-2">偏り</th>
                  <th className="p-2">出力</th>
                  <th className="p-2">発動</th>
                  <th className="p-2">時間</th>
                  <th className="p-2">真名</th>
                  <th className="p-2">読み</th>
                  <th className="p-2">EN</th>
                  <th className="p-2">解釈</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatterns.slice(0, 200).map((p) => (
                  <tr
                    key={p.pattern_id}
                    className="border-b border-gray-900 hover:bg-gray-900/50"
                  >
                    <td className="p-2 text-gray-600">{p.pattern_id}</td>
                    <td className="p-2 font-mono">{p.core_code}</td>
                    <td className="p-2">{p.bias_type}</td>
                    <td className="p-2">{p.output_level}</td>
                    <td className="p-2">{p.ignition_label}</td>
                    <td className="p-2">{p.time_character_label}</td>
                    <td className="p-2 font-bold text-lg">
                      {p.field_name_kanji || (
                        <span className="text-gray-700">—</span>
                      )}
                    </td>
                    <td className="p-2 text-gray-400">
                      {p.field_name_reading || ""}
                    </td>
                    <td className="p-2 text-gray-400">
                      {p.field_name_en || ""}
                    </td>
                    <td className="p-2 text-gray-500 max-w-xs truncate">
                      {p.interpretation || (
                        <span className="text-gray-700">未生成</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPatterns.length > 200 && (
              <p className="text-gray-600 text-sm mt-2">
                ※ 最初の200件を表示中（全{filteredPatterns.length}件）
              </p>
            )}
          </div>
        </div>
      )}

      {/* Cores */}
      {tab === "cores" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-left">
                <th className="p-2">ID</th>
                <th className="p-2">骨格</th>
                <th className="p-2">起動(1位)</th>
                <th className="p-2">加速(2位)</th>
                <th className="p-2">持続(3位)</th>
                <th className="p-2">構造</th>
                <th className="p-2">キーワード</th>
              </tr>
            </thead>
            <tbody>
              {cores.map((c) => (
                <tr
                  key={c.core_id}
                  className="border-b border-gray-900 hover:bg-gray-900/50"
                >
                  <td className="p-2 text-gray-600">{c.core_id}</td>
                  <td className="p-2 font-mono font-bold">{c.core_code}</td>
                  <td className="p-2">{c.rank1}</td>
                  <td className="p-2">{c.rank2}</td>
                  <td className="p-2">{c.rank3}</td>
                  <td className="p-2 text-gray-400 max-w-md">
                    {c.drive_structure}
                  </td>
                  <td className="p-2 text-gray-500">{c.keywords}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Kanji Dictionary */}
      {tab === "kanji" && (
        <div>
          <div className="flex flex-wrap gap-3 mb-4">
            <select
              value={kanjiCatFilter}
              onChange={(e) => setKanjiCatFilter(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-sm"
            >
              <option value="">全カテゴリ</option>
              {kanjiCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="漢字・読み・イメージ検索"
              value={kanjiSearch}
              onChange={(e) => setKanjiSearch(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-sm w-60"
            />
            <span className="text-gray-500 text-sm self-center">
              {filteredKanji.length} / {kanji.length} 字
            </span>
          </div>

          {/* Kanji grid view */}
          <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-15 gap-1 mb-6">
            {filteredKanji.map((k) => (
              <div
                key={k.no}
                className="bg-gray-900 rounded p-2 text-center hover:bg-gray-800 cursor-default group relative"
                title={`${k.reading} — ${k.image}`}
              >
                <div className="text-xl font-bold">{k.kanji}</div>
                <div className="text-xs text-gray-500">{k.reading}</div>
              </div>
            ))}
          </div>

          {/* Category summary */}
          <h3 className="text-lg font-bold mb-3 mt-8">カテゴリ別分布</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {kanjiCategories.map((cat) => {
              const count = kanji.filter(
                (k) => k.main_category === cat
              ).length;
              return (
                <button
                  key={cat}
                  onClick={() => setKanjiCatFilter(cat === kanjiCatFilter ? "" : cat)}
                  className={`text-left p-3 rounded text-sm ${
                    cat === kanjiCatFilter
                      ? "bg-white text-black"
                      : "bg-gray-900 hover:bg-gray-800"
                  }`}
                >
                  <span className="font-bold">{cat}</span>
                  <span className="text-gray-400 ml-2">{count}字</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Synonyms */}
      {tab === "synonyms" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {synonyms.map((s: any, i: number) => (
            <div key={i} className="bg-gray-900 rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold">{s["語群"] || s.No}</span>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                  {s["主カテゴリ"]}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-2">
                {s["中核イメージ"]}
              </p>
              <p className="text-sm">
                {s["候補漢字"]}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {s["読み候補"]}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function ProgressBar({
  label,
  current,
  total,
}: {
  label: string;
  current: number;
  total: number;
}) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-500">
          {current} / {total} ({pct.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className="bg-white rounded-full h-2 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
