"use client";

import { useState, useEffect } from "react";
import coreData from "@/data/core-60.json";
import patternsData from "@/data/patterns-2880.json";
import interpData from "@/data/interpretations-2880.json";
import kanjiData from "@/data/kanji-dictionary.json";
import dictData from "@/data/dictionaries.json";
import synonymData from "@/data/synonym-groups.json";
import namesData from "@/data/names-2880.json";
import l4Data from "@/data/l4-types.json";
import l4KataData from "@/data/l4-kata.json";
import names240Data from "@/data/names-240.json";

type Tab = "overview" | "l4types" | "names" | "patterns" | "kanji";

// Build interpretation lookup
const interpMap: Record<number, any> = {};
for (const r of interpData as any[]) {
  interpMap[r.pattern_id] = r;
}

// Build names lookup
const namesMap: Record<number, any> = {};
for (const r of namesData as any[]) {
  namesMap[r.pattern_id] = r;
}

const L4_RANK_META: Record<string, { jp: string; color: string; border: string; bg: string; badge: string; cardBorder: string; cardBg: string; rowLeft: string; rowBg: string }> = {
  D: { jp: "ドーパミン主動型",       color: "text-red-400",    border: "border-red-900/50",    bg: "bg-red-950/30",    badge: "bg-red-900/40 text-red-300",    cardBorder: "border-red-900/40",    cardBg: "bg-red-950/20",    rowLeft: "border-l-2 border-l-red-600",    rowBg: "bg-red-950/10" },
  S: { jp: "セロトニン主動型",       color: "text-blue-400",   border: "border-blue-900/50",   bg: "bg-blue-950/30",   badge: "bg-blue-900/40 text-blue-300",  cardBorder: "border-blue-900/40",   cardBg: "bg-blue-950/20",   rowLeft: "border-l-2 border-l-blue-600",   rowBg: "bg-blue-950/10" },
  O: { jp: "オキシトシン主動型",     color: "text-green-400",  border: "border-green-900/50",  bg: "bg-green-950/30",  badge: "bg-green-900/40 text-green-300", cardBorder: "border-green-900/40",  cardBg: "bg-green-950/20",  rowLeft: "border-l-2 border-l-green-600",  rowBg: "bg-green-950/10" },
  N: { jp: "ノルアドレナリン主動型", color: "text-yellow-400", border: "border-yellow-900/50", bg: "bg-yellow-950/30", badge: "bg-yellow-900/40 text-yellow-300", cardBorder: "border-yellow-900/40", cardBg: "bg-yellow-950/20", rowLeft: "border-l-2 border-l-yellow-600", rowBg: "bg-yellow-950/10" },
  E: { jp: "エンドルフィン主動型",   color: "text-purple-400", border: "border-purple-900/50", bg: "bg-purple-950/30", badge: "bg-purple-900/40 text-purple-300", cardBorder: "border-purple-900/40", cardBg: "bg-purple-950/20", rowLeft: "border-l-2 border-l-purple-600", rowBg: "bg-purple-950/10" },
};

// core_code → rank1 ルックアップ
const coreRank1Map: Record<string, string> = {};
for (const c of coreData as any[]) {
  coreRank1Map[c.core_code] = c.rank1;
}

// L4 id → name ルックアップ
const l4NameMap: Record<string, string> = {};
for (const t of l4Data as any[]) {
  l4NameMap[t.id] = t.name;
}

const IGN_MAP: Record<string, string> = { external: "外燃", internal: "内燃" };
const TIME_MAP: Record<string, string> = { burst: "瞬発", mature: "熟成" };

function getL4Id(coreCode: string, biasType: string, ignition: string, timeChar: string) {
  const rank1 = coreRank1Map[coreCode];
  if (!rank1) return null;
  return `${rank1}-${biasType}-${IGN_MAP[ignition] ?? ignition}-${TIME_MAP[timeChar] ?? timeChar}`;
}

// 240疾走領域ルックアップ (rank1-bias → 領域リスト)
const names240Map: Record<string, any[]> = {};
for (const n of names240Data as any[]) {
  const parts = n.id.split("-"); // rank1-rank2-rank3-bias
  const kataKey = `${parts[0]}-${parts[parts.length - 1]}`; // rank1-bias
  if (!names240Map[kataKey]) names240Map[kataKey] = [];
  names240Map[kataKey].push(n);
}

// の型ルックアップ (rank1-bias → {name, reading})
const kataMap: Record<string, { name: string; reading: string }> = {};
for (const k of l4KataData as any[]) {
  kataMap[k.id] = { name: k.name, reading: k.reading };
}

function getKata(coreCode: string, biasType: string) {
  const rank1 = coreRank1Map[coreCode];
  if (!rank1) return null;
  return kataMap[`${rank1}-${biasType}`] ?? null;
}

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [coreFilter, setCoreFilter] = useState("");
  const [biasFilter, setBiasFilter] = useState("");
  const [ignitionFilter, setIgnitionFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [namedOnly, setNamedOnly] = useState(false);
  const [interpOnly, setInterpOnly] = useState(false);
  const [kanjiCatFilter, setKanjiCatFilter] = useState("");
  const [kanjiSearch, setKanjiSearch] = useState("");
  const [namesCoreFilter, setNamesCoreFilter] = useState("");
  const [namesBiasFilter, setNamesBiasFilter] = useState("");
  const [namesRank1Filter, setNamesRank1Filter] = useState("");
  const [namesIgnitionFilter, setNamesIgnitionFilter] = useState("");
  const [namesTimeFilter, setNamesTimeFilter] = useState("");
  const [namesShowUnnamed, setNamesShowUnnamed] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<number | null>(null);
  const [flaggedIds, setFlaggedIds] = useState<Set<number>>(new Set());
  const [regenStatus, setRegenStatus] = useState<string>("");
  const [regenPolling, setRegenPolling] = useState(false);
  const [deployStatus, setDeployStatus] = useState<string>("");
  const [deploying, setDeploying] = useState(false);
  const [namesShowFlaggedOnly, setNamesShowFlaggedOnly] = useState(false);
  const [l4FlaggedIds, setL4FlaggedIds] = useState<Set<string>>(new Set());
  const [l4RegenStatus, setL4RegenStatus] = useState<string>("");
  const [l4Overrides, setL4Overrides] = useState<Record<string, string>>({});
  const [editingL4Id, setEditingL4Id] = useState<string | null>(null);
  const [editingL4Value, setEditingL4Value] = useState("");
  const [editingL4ReadingId, setEditingL4ReadingId] = useState<string | null>(null);
  const [editingL4ReadingValue, setEditingL4ReadingValue] = useState("");
  const [l4ReadingOverrides, setL4ReadingOverrides] = useState<Record<string, string>>({});
  const [editingReadingId, setEditingReadingId] = useState<number | null>(null);
  const [editingReadingValue, setEditingReadingValue] = useState("");
  const [nameOverrides, setNameOverrides] = useState<Record<number, string>>({});
  const [names240FlaggedIds, setNames240FlaggedIds] = useState<Set<string>>(new Set());
  const [names240RegenStatus, setNames240RegenStatus] = useState<string>("");
  const [names240Overrides, setNames240Overrides] = useState<Record<string, string>>({});

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const saved = localStorage.getItem("df3000-flagged");
    if (saved) setFlaggedIds(new Set(JSON.parse(saved)));
    const savedL4 = localStorage.getItem("df3000-l4-flagged");
    if (savedL4) setL4FlaggedIds(new Set(JSON.parse(savedL4)));
    const saved240 = localStorage.getItem("df3000-names240-flagged");
    if (saved240) setNames240FlaggedIds(new Set(JSON.parse(saved240)));
    // ページロード時に生成中なら自動でポーリング再開
    fetch("/api/fix-names-status")
      .then((r) => r.json())
      .then((d) => { if (d.status === "running") setRegenPolling(true); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!regenPolling) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/fix-names-status");
        const data = await res.json();
        if (data.status === "done") {
          setRegenStatus("✅ 生成完了！ページをリロードして確認してください。");
          setRegenPolling(false);
        } else if (data.status === "error") {
          setRegenStatus(`❌ エラー: ${data.message}`);
          setRegenPolling(false);
        }
      } catch { /* ignore */ }
    }, 4000);
    return () => clearInterval(interval);
  }, [regenPolling]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);


  const toggleFlag = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("df3000-flagged", JSON.stringify([...next]));
      return next;
    });
  };

  const sendRegenRequest = async () => {
    const ids = [...flaggedIds];
    setRegenStatus("送信中...");
    try {
      const res = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patternIds: ids }),
      });
      const data = await res.json();
      if (data.success) {
        setFlaggedIds(new Set());
        localStorage.removeItem("df3000-flagged");
        await fetch("/api/run-fix-names", { method: "POST" });
        setRegenStatus(`⏳ ${data.removed}件の再生成中...`);
        setRegenPolling(true);
      } else {
        setRegenStatus("❌ エラー: " + data.error);
      }
    } catch {
      setRegenStatus("❌ API接続エラー（ローカルのみ）");
    }
  };

  const syncDeploy = async () => {
    setDeploying(true);
    setDeployStatus("同期・デプロイ中...");
    try {
      const res = await fetch("/api/sync-deploy", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setDeployStatus(`✅ ${data.message}`);
      } else {
        setDeployStatus(`❌ ${data.error}`);
      }
    } catch {
      setDeployStatus("❌ API接続エラー（ローカルのみ）");
    } finally {
      setDeploying(false);
    }
  };

  const toggleL4Flag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setL4FlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("df3000-l4-flagged", JSON.stringify([...next]));
      return next;
    });
  };

  const sendL4RegenRequest = async () => {
    const ids = [...l4FlaggedIds];
    setL4RegenStatus("送信中...");
    try {
      const res = await fetch("/api/update-l4type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.success) {
        setL4RegenStatus(`⏳ ${data.removed}件削除完了。再生成中...`);
        setL4FlaggedIds(new Set());
        localStorage.removeItem("df3000-l4-flagged");
        await fetch("/api/run-fix-l4types", { method: "POST" });
        setL4RegenStatus(`✅ ${data.removed}件の再生成を開始しました。数分後にリロードしてください。`);
      } else setL4RegenStatus("❌ " + data.error);
    } catch { setL4RegenStatus("❌ API接続エラー（ローカルのみ）"); }
  };

  const toggleNames240Flag = (id: string) => {
    setNames240FlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("df3000-names240-flagged", JSON.stringify([...next]));
      return next;
    });
  };

  const sendNames240RegenRequest = async () => {
    const ids = [...names240FlaggedIds];
    setNames240RegenStatus("送信中...");
    try {
      const res = await fetch("/api/update-name240", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.success) {
        setNames240RegenStatus(`⏳ ${data.removed}件削除完了。再選定中...`);
        setNames240FlaggedIds(new Set());
        localStorage.removeItem("df3000-names240-flagged");
        await fetch("/api/run-fix-names240", { method: "POST" });
        setNames240RegenStatus(`✅ ${data.removed}件の差し替えを開始しました。数分後にリロードしてください。`);
      } else setNames240RegenStatus("❌ " + data.error);
    } catch { setNames240RegenStatus("❌ API接続エラー"); }
  };

  const saveL4Reading = async (id: string) => {
    const newVal = editingL4ReadingValue.trim();
    setEditingL4ReadingId(null);
    if (!newVal) return;
    setL4ReadingOverrides((prev) => ({ ...prev, [id]: newVal }));
    try {
      await fetch("/api/update-l4type", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, field: "reading", value: newVal }),
      });
    } catch {}
  };

  const saveL4Name = async (id: string) => {
    const newVal = editingL4Value.trim();
    setEditingL4Id(null);
    if (!newVal) return;
    setL4Overrides((prev) => ({ ...prev, [id]: newVal }));
    try {
      await fetch("/api/update-l4type", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, field: "name", value: newVal }),
      });
    } catch {}
  };

  const saveReading = async (patternId: number) => {
    const newVal = editingReadingValue.trim();
    setEditingReadingId(null);
    if (!newVal || newVal === (nameOverrides[patternId] ?? namesMap[patternId]?.reading)) return;
    setNameOverrides((prev) => ({ ...prev, [patternId]: newVal }));
    try {
      await fetch("/api/update-name", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pattern_id: patternId, field: "reading", value: newVal }),
      });
    } catch {}
  };

  const patterns = patternsData as any[];
  const cores = coreData as any[];
  const kanji = kanjiData as any[];
  const dicts = dictData as any[];
  const synonyms = synonymData as any[];
  const interps = interpData as any[];
  const names = namesData as any[];

  // Stats
  const namedCount = names.length;
  const interpCount = interps.length;
  const kanjiCategories = [
    ...new Set(kanji.map((k) => k.main_category)),
  ].sort();
  const coreCodes = [...new Set(cores.map((c) => c.core_code))];
  const biasTypes = [...new Set(patterns.map((p) => p.bias_type))];

  // Filtered patterns
  const filteredPatterns = patterns.filter((p) => {
    if (coreFilter && p.core_code !== coreFilter) return false;
    if (biasFilter && p.bias_type !== biasFilter) return false;
    if (ignitionFilter && p.ignition !== ignitionFilter) return false;
    if (timeFilter && p.time_character !== timeFilter) return false;
    if (namedOnly && !namesMap[p.pattern_id]) return false;
    if (interpOnly && !interpMap[p.pattern_id]) return false;
    return true;
  });

  // Filtered kanji
  const filteredKanji = kanji.filter((k) => {
    if (kanjiCatFilter && k.main_category !== kanjiCatFilter) return false;
    if (
      kanjiSearch &&
      !k.kanji.includes(kanjiSearch) &&
      !k.reading.includes(kanjiSearch) &&
      !k.image.includes(kanjiSearch)
    )
      return false;
    return true;
  });

  // Selected pattern detail
  const selectedInterp = selectedPattern
    ? interpMap[selectedPattern]
    : null;
  const selectedPat = selectedPattern
    ? patterns.find((p) => p.pattern_id === selectedPattern)
    : null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "概要" },
    { key: "l4types", label: names240FlaggedIds.size > 0 ? `疾走領域管理 🚩${names240FlaggedIds.size}` : "疾走領域管理" },
  ];

  // Modal state (names tab用)
  const [modalPatternId, setModalPatternId] = useState<number | null>(null);
  const modalPattern = modalPatternId ? patterns.find((p) => p.pattern_id === modalPatternId) : null;
  const modalInterp = modalPatternId ? interpMap[modalPatternId] : null;
  const modalName = modalPatternId ? namesMap[modalPatternId] : null;

  if (!mounted) return <main className="min-h-screen bg-gray-950" />;

  return (
    <>
    <main className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">
          Drive Field — 管理ダッシュボード
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <a
            href="/admin/names-list"
            className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-2 rounded transition-colors"
          >
            一覧表
          </a>
          <a
            href="/admin/questions"
            className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-2 rounded transition-colors"
          >
            診断設問
          </a>
          <a
            href="/admin/screens"
            className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-2 rounded transition-colors"
          >
            画面プレビュー
          </a>
          <button
            onClick={syncDeploy}
            disabled={deploying || regenPolling}
            className="bg-blue-700 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded font-bold"
          >
            {deploying ? "デプロイ中..." : "🚀 Vercelにデプロイ"}
          </button>
          {deployStatus && (
            <p className={`text-sm ${deployStatus.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>
              {deployStatus}
            </p>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 border-b border-gray-800 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onPointerDown={(e) => { e.preventDefault(); setTab(t.key); }}
            style={{ touchAction: "manipulation" }}
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

      {/* Names Review */}
      <div style={{ display: tab === "names" ? undefined : "none" }}>
      {(() => {
        const filtered = patterns.filter((p) => {
          if (namesCoreFilter && p.core_code !== namesCoreFilter) return false;
          if (namesBiasFilter && p.bias_type !== namesBiasFilter) return false;
          if (namesRank1Filter && coreRank1Map[p.core_code] !== namesRank1Filter) return false;
          if (namesIgnitionFilter && p.ignition !== namesIgnitionFilter) return false;
          if (namesTimeFilter && p.time_character !== namesTimeFilter) return false;
          if (!namesShowUnnamed && !namesMap[p.pattern_id]) return false;
          if (namesShowFlaggedOnly && !flaggedIds.has(p.pattern_id)) return false;
          return true;
        });
        return (
          <div>
            {/* Flagged panel */}
            {flaggedIds.size > 0 && (
              <div className="bg-orange-950/40 border border-orange-800/40 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <span className="font-bold text-orange-400">🚩 再生成フラグ: {flaggedIds.size}件</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setFlaggedIds(new Set()); localStorage.removeItem("df3000-flagged"); setRegenStatus(""); }}
                      className="text-xs text-gray-500 hover:text-gray-300 border border-gray-700 rounded px-2 py-1"
                    >
                      全解除
                    </button>
                    <button
                      onClick={sendRegenRequest}
                      className="bg-orange-600 hover:bg-orange-500 text-white text-sm px-4 py-1.5 rounded font-bold"
                    >
                      再生成リクエスト送信
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[...flaggedIds].sort((a, b) => a - b).map((id) => {
                    const n = namesMap[id];
                    return n ? (
                      <span key={id} className="text-sm bg-gray-900 border border-orange-900/50 px-2 py-0.5 rounded flex items-center gap-1">
                        <span className="font-bold">{n.kanji_name}</span>
                        <span className="text-gray-600 text-xs">#{id}</span>
                        <button onClick={(e) => toggleFlag(id, e)} className="text-gray-600 hover:text-red-400 ml-0.5">×</button>
                      </span>
                    ) : null;
                  })}
                </div>
                {regenStatus && (
                  <p className={`text-sm mt-3 rounded p-2 flex items-center gap-2 ${
                    regenPolling ? "bg-yellow-950/40 text-yellow-300 border border-yellow-900/50" :
                    regenStatus.startsWith("✅") ? "bg-green-950/40 text-green-300 border border-green-900/50" :
                    "bg-gray-900 text-gray-300"
                  }`}>
                    {regenPolling && <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />}
                    {regenStatus}
                  </p>
                )}
              </div>
            )}

            {/* Deploy */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <button
                onClick={syncDeploy}
                disabled={deploying || regenPolling}
                className="bg-blue-700 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm px-4 py-1.5 rounded font-bold"
              >
                {deploying ? "デプロイ中..." : "🚀 Vercelにデプロイ"}
              </button>
              {deployStatus && (
                <p className={`text-sm ${deployStatus.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>
                  {deployStatus}
                </p>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4 sticky top-0 bg-gray-950 py-2 z-10">
              {/* L4 主神経カラーボタン */}
              <div className="flex gap-1">
                {(["D","S","O","N","E"] as const).map((r) => {
                  const m = L4_RANK_META[r];
                  const active = namesRank1Filter === r;
                  return (
                    <button
                      key={r}
                      onPointerDown={(e) => { e.preventDefault(); setNamesRank1Filter(active ? "" : r); }}
                      className={`w-7 h-7 rounded-full text-xs font-bold border transition-all ${
                        active ? `${m.bg} ${m.border} ${m.color}` : "bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-500"
                      }`}
                      title={m.jp}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
              <select
                value={namesBiasFilter}
                onChange={(e) => setNamesBiasFilter(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm"
              >
                <option value="">全bias</option>
                {biasTypes.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <select
                value={namesIgnitionFilter}
                onChange={(e) => setNamesIgnitionFilter(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm"
              >
                <option value="">全発火</option>
                <option value="external">外燃</option>
                <option value="internal">内燃</option>
              </select>
              <select
                value={namesTimeFilter}
                onChange={(e) => setNamesTimeFilter(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm"
              >
                <option value="">全時間</option>
                <option value="burst">瞬発</option>
                <option value="mature">熟成</option>
              </select>
              <select
                value={namesCoreFilter}
                onChange={(e) => setNamesCoreFilter(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm"
              >
                <option value="">全骨格</option>
                {coreCodes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <label className="flex items-center gap-1 text-sm bg-gray-900 border border-gray-700 rounded px-2 py-1">
                <input type="checkbox" checked={namesShowUnnamed} onChange={(e) => setNamesShowUnnamed(e.target.checked)} />
                未命名も表示
              </label>
              <label className="flex items-center gap-1 text-sm bg-gray-900 border border-orange-800/60 rounded px-2 py-1">
                <input type="checkbox" checked={namesShowFlaggedOnly} onChange={(e) => setNamesShowFlaggedOnly(e.target.checked)} />
                🚩のみ表示
              </label>
              <span className="text-gray-500 text-sm self-center">{filtered.length}件</span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {filtered.map((p) => {
                const n = namesMap[p.pattern_id];
                const flagged = flaggedIds.has(p.pattern_id);
                const rank1 = coreRank1Map[p.core_code];
                const rankMeta = rank1 ? L4_RANK_META[rank1] : null;
                return (
                  <div
                    key={p.pattern_id}
                    className={`relative rounded-lg p-2 text-center cursor-pointer transition-colors border ${
                      flagged
                        ? "bg-orange-950/60 border-orange-700/60 hover:bg-orange-950/80"
                        : n && rankMeta
                        ? `${rankMeta.cardBg} ${rankMeta.cardBorder} hover:brightness-125`
                        : n
                        ? "bg-gray-900 border-gray-800 hover:bg-gray-800"
                        : "bg-gray-950 border-gray-800 opacity-40"
                    }`}
                    onClick={() => setModalPatternId(p.pattern_id)}
                  >
                    <button
                      className={`absolute top-1 right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center leading-none transition-colors ${
                        flagged
                          ? "bg-orange-600 text-white"
                          : "bg-gray-800 text-gray-600 hover:bg-gray-700 hover:text-gray-400"
                      }`}
                      onClick={(e) => toggleFlag(p.pattern_id, e)}
                      title={flagged ? "フラグ解除" : "再生成フラグ"}
                    >
                      🚩
                    </button>
                    <div className="text-3xl font-bold leading-tight">
                      {n ? n.kanji_name : "—"}
                    </div>
                    {n && editingReadingId === p.pattern_id ? (
                      <input
                        className="text-xs w-full bg-gray-800 text-center rounded px-1 mt-1 outline-none"
                        value={editingReadingValue}
                        autoFocus
                        onChange={(e) => setEditingReadingValue(e.target.value)}
                        onBlur={() => saveReading(p.pattern_id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveReading(p.pattern_id);
                          if (e.key === "Escape") setEditingReadingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div
                        className="text-xs text-gray-500 mt-1 leading-tight hover:text-gray-300 cursor-text"
                        onClick={(e) => {
                          if (!n) return;
                          e.stopPropagation();
                          setEditingReadingId(p.pattern_id);
                          setEditingReadingValue(nameOverrides[p.pattern_id] ?? n.reading ?? "");
                        }}
                        title="クリックで読みを編集"
                      >
                        {nameOverrides[p.pattern_id] ?? (n ? n.reading : "")}
                      </div>
                    )}
                    <div className="text-xs text-gray-700 mt-0.5">
                      #{p.pattern_id}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 構造サマリー */}
          <StatCard label="神経系" value={5} sub="D · S · O · N · E" />
          <StatCard label="骨格" value={cores.length} sub="上位3の順列" />
          <StatCard label="型" value={(l4KataData as any[]).length} sub="主神経系 × 偏り" />
          <StatCard label="疾走領域" value={(names240Data as any[]).length} sub="骨格 × 偏り" />

          {/* データ資産 */}
          <StatCard label="漢字辞書" value={`${kanji.length}字`} />
          <StatCard label="類義語群" value={synonyms.length} />
          <StatCard label="カテゴリ数" value={kanjiCategories.length} />
          <StatCard label="パターンDB" value={patterns.length} sub="内部処理用" />

          {/* 疾走領域一覧 */}
          <div className="col-span-2 md:col-span-4 mt-4">
            <h3 className="text-lg font-bold mb-3">
              疾走領域一覧（{(names240Data as any[]).length}）
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {(names240Data as any[]).slice(0, 60).map((n: any) => {
                const nameParts = n.id.split("-");
                const rank1 = nameParts[0];
                const rm = rank1 ? L4_RANK_META[rank1] : null;
                return (
                  <div
                    key={n.id}
                    className={`rounded p-3 text-center border ${rm ? `${rm.cardBg} ${rm.cardBorder}` : "bg-gray-900 border-gray-800"}`}
                  >
                    <div className="text-2xl font-bold">{n.kanji_name}</div>
                    <div className="text-xs text-gray-400">{n.reading}</div>
                    <div className="text-xs text-gray-500">{n.english_name}</div>
                    <div className="text-xs text-gray-600 mt-1">{n.id}</div>
                  </div>
                );
              })}
            </div>
            {(names240Data as any[]).length > 60 && (
              <p className="text-gray-600 text-sm mt-2">
                ※ 最初の60件を表示中（全{(names240Data as any[]).length}件）
              </p>
            )}
          </div>
        </div>
      )}

      {/* Patterns */}
      {tab === "patterns" && (
        <div>
          {/* Detail panel */}
          {selectedPattern && selectedInterp && (
            <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    {namesMap[selectedPattern!] && (
                      <div className="text-center mr-2">
                        <span className="text-4xl font-bold">
                          {namesMap[selectedPattern!].kanji_name}
                        </span>
                        <div className="text-xs text-gray-400">
                          {namesMap[selectedPattern!].reading}
                        </div>
                        <div className="text-xs text-gray-500">
                          {namesMap[selectedPattern!].english_name}
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="font-mono text-lg">
                        {selectedPat?.core_code}
                      </span>
                      <span className="text-gray-400 text-sm ml-2">
                        #{selectedPattern}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[
                      selectedPat?.bias_type,
                      selectedPat?.output_level,
                      selectedPat?.ignition_label,
                      selectedPat?.time_character_label,
                    ].map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-800 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPattern(null)}
                  className="text-gray-500 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {namesMap[selectedPattern!] && (
                  <div className="bg-yellow-900/20 border border-yellow-800/30 rounded p-3">
                    <h4 className="text-xs text-yellow-600 mb-1">命名理由</h4>
                    <p className="text-sm">{namesMap[selectedPattern!].naming_reason}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-xs text-gray-500 mb-1">構造解釈</h4>
                  <p className="text-sm">{selectedInterp.structural_interpretation}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 mb-1">象徴イメージ</h4>
                  <p className="text-sm italic text-gray-300">
                    {selectedInterp.symbolic_image}
                  </p>
                </div>
                {selectedInterp.texture_keywords && (
                  <div className="flex gap-1">
                    {selectedInterp.texture_keywords.map(
                      (kw: string, i: number) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-800 px-2 py-1 rounded"
                        >
                          {kw}
                        </span>
                      )
                    )}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <DetailBlock label="起動条件" text={selectedInterp.trigger} />
                  <DetailBlock
                    label="加速条件"
                    text={selectedInterp.accelerator}
                  />
                  <DetailBlock label="持続条件" text={selectedInterp.sustain} />
                  <DetailBlock
                    label="破綻条件"
                    text={selectedInterp.breakdown}
                  />
                  <DetailBlock label="回復条件" text={selectedInterp.recovery} />
                  <DetailBlock
                    label="覚醒時の雰囲気"
                    text={selectedInterp.awakened_vibe}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
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
            <select
              value={ignitionFilter}
              onChange={(e) => setIgnitionFilter(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-sm"
            >
              <option value="">全発動</option>
              <option value="external">外燃</option>
              <option value="internal">内燃</option>
            </select>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-sm"
            >
              <option value="">全時間</option>
              <option value="burst">瞬発</option>
              <option value="mature">熟成</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={namedOnly}
                onChange={(e) => setNamedOnly(e.target.checked)}
              />
              命名済み
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={interpOnly}
                onChange={(e) => setInterpOnly(e.target.checked)}
              />
              解釈あり
            </label>
            <span className="text-gray-500 text-sm self-center">
              {filteredPatterns.length} / {patterns.length} 件
            </span>
          </div>

          <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
            <table className="min-w-[720px] w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-left">
                  <th className="p-2 w-10">ID</th>
                  <th className="p-2 w-24">骨格</th>
                  <th className="p-2 w-16">偏り</th>
                  <th className="p-2 w-14">出力</th>
                  <th className="p-2 w-14">発動</th>
                  <th className="p-2 w-14">時間</th>
                  <th className="p-2 w-28">流派</th>
                  <th className="p-2 w-16">領域名</th>
                  <th className="p-2">象徴イメージ</th>
                  <th className="p-2 w-32">質感</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatterns.slice(0, 200).map((p) => {
                  const interp = interpMap[p.pattern_id];
                  const rank1 = coreRank1Map[p.core_code];
                  const rm = rank1 ? L4_RANK_META[rank1] : null;
                  const kata = getKata(p.core_code, p.bias_type);
                  return (
                    <tr
                      key={p.pattern_id}
                      className={`border-b border-gray-900 cursor-pointer ${
                        selectedPattern === p.pattern_id
                          ? "bg-gray-800"
                          : rm ? `${rm.rowBg} ${rm.rowLeft} hover:brightness-110` : "hover:bg-gray-900/50"
                      }`}
                      onClick={() =>
                        setSelectedPattern(
                          selectedPattern === p.pattern_id
                            ? null
                            : p.pattern_id
                        )
                      }
                    >
                      <td className="p-2 text-gray-600">{p.pattern_id}</td>
                      <td className="p-2 font-mono">{p.core_code}</td>
                      <td className="p-2">{p.bias_type}</td>
                      <td className="p-2">{p.output_level}</td>
                      <td className="p-2">{p.ignition_label}</td>
                      <td className="p-2">{p.time_character_label}</td>
                      <td className="p-2 text-xs">
                        {kata ? (
                          <div>
                            <span className={`font-bold ${rm?.color ?? "text-gray-400"}`}>{kata.name}</span>
                            <div className="text-gray-600 text-xs">{kata.reading}</div>
                          </div>
                        ) : <span className="text-gray-700">—</span>}
                      </td>
                      <td className="p-2 font-bold text-lg">
                        {namesMap[p.pattern_id]?.kanji_name || (
                          <span className="text-gray-700">—</span>
                        )}
                      </td>
                      <td className="p-2 text-gray-400 text-xs">
                        <div className="line-clamp-3">
                          {interp?.symbolic_image || (
                            <span className="text-gray-700">—</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        {interp?.texture_keywords ? (
                          <div className="flex gap-1 flex-wrap">
                            {interp.texture_keywords
                              .slice(0, 3)
                              .map((kw: string, i: number) => (
                                <span
                                  key={i}
                                  className="text-xs bg-gray-800 px-1.5 py-0.5 rounded"
                                >
                                  {kw}
                                </span>
                              ))}
                          </div>
                        ) : (
                          <span className="text-gray-700">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredPatterns.length > 200 && (
              <p className="text-gray-600 text-sm mt-2">
                ※ 最初の200件を表示中（全{filteredPatterns.length}件）
              </p>
            )}
          </div>

          <h3 className="text-lg font-bold mb-3 mt-10">骨格一覧 ({cores.length})</h3>
          <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
            <table className="min-w-[640px] w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-left">
                  <th className="p-2 w-10">ID</th>
                  <th className="p-2 w-24">骨格</th>
                  <th className="p-2 w-14">起動</th>
                  <th className="p-2 w-14">加速</th>
                  <th className="p-2 w-14">持続</th>
                  <th className="p-2">構造</th>
                  <th className="p-2 w-32">キーワード</th>
                </tr>
              </thead>
              <tbody>
                {cores.map((c) => {
                  const rm = L4_RANK_META[c.rank1];
                  return (
                  <tr
                    key={c.core_id}
                    className={`border-b border-gray-900 cursor-pointer ${rm ? `${rm.rowBg} ${rm.rowLeft} hover:brightness-110` : "hover:bg-gray-900/50"}`}
                    onClick={() => { setCoreFilter(c.core_code); window.scrollTo(0, 0); }}
                  >
                    <td className="p-2 text-gray-600">{c.core_id}</td>
                    <td className="p-2 font-mono font-bold">{c.core_code}</td>
                    <td className="p-2">{c.rank1}</td>
                    <td className="p-2">{c.rank2}</td>
                    <td className="p-2">{c.rank3}</td>
                    <td className="p-2 text-gray-400"><div className="line-clamp-3">{c.drive_structure}</div></td>
                    <td className="p-2 text-gray-500"><div className="line-clamp-3">{c.keywords}</div></td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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

          <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-15 gap-1 mb-6">
            {filteredKanji.map((k) => (
              <div
                key={k.no}
                className="bg-gray-900 rounded p-2 text-center hover:bg-gray-800 cursor-default"
                title={`${k.reading} — ${k.image}`}
              >
                <div className="text-xl font-bold">{k.kanji}</div>
                <div className="text-xs text-gray-500">{k.reading}</div>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-bold mb-3 mt-8">カテゴリ別分布</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {kanjiCategories.map((cat) => {
              const count = kanji.filter(
                (k) => k.main_category === cat
              ).length;
              return (
                <button
                  key={cat}
                  onClick={() =>
                    setKanjiCatFilter(cat === kanjiCatFilter ? "" : cat)
                  }
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

          <h3 className="text-lg font-bold mb-3 mt-10">類義語群 ({synonyms.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {synonyms.map((s: any, i: number) => (
              <div key={i} className="bg-gray-900 rounded p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold">{s["語群"] || s.No}</span>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{s["主カテゴリ"]}</span>
                </div>
                <p className="text-sm text-gray-400 mb-2">{s["中核イメージ"]}</p>
                <p className="text-sm">{s["候補漢字"]}</p>
                <p className="text-xs text-gray-600 mt-1">{s["読み候補"]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 疾走領域管理 */}
      {tab === "l4types" && (
          <div>
            {/* 差し替えフラグパネル */}
            {names240FlaggedIds.size > 0 && (
              <div className="bg-orange-950/40 border border-orange-800/40 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <span className="font-bold text-orange-400">🚩 差し替え申請: {names240FlaggedIds.size}件</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setNames240FlaggedIds(new Set()); localStorage.removeItem("df3000-names240-flagged"); setNames240RegenStatus(""); }}
                      className="text-xs text-gray-500 hover:text-gray-300 border border-gray-700 rounded px-2 py-1"
                    >全解除</button>
                    <button
                      onClick={sendNames240RegenRequest}
                      className="bg-orange-600 hover:bg-orange-500 text-white text-sm px-4 py-1.5 rounded font-bold"
                    >差し替え申請を送信</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[...names240FlaggedIds].sort().map((id) => {
                    const entry = (names240Data as any[]).find((n: any) => n.id === id);
                    return entry ? (
                      <span key={id} className="text-sm bg-gray-900 border border-orange-900/50 px-2 py-0.5 rounded flex items-center gap-1">
                        <span className="font-bold">{names240Overrides[id] ?? entry.kanji_name}</span>
                        <span className="text-gray-600 text-xs">{id}</span>
                        <button onClick={() => toggleNames240Flag(id)} className="text-gray-600 hover:text-red-400 ml-0.5">×</button>
                      </span>
                    ) : null;
                  })}
                </div>
                {names240RegenStatus && (
                  <p className="text-sm mt-3 text-gray-300 bg-gray-900 rounded p-2">{names240RegenStatus}</p>
                )}
              </div>
            )}
            {/* 旧L4フラグパネル（非表示可） */}
            {l4FlaggedIds.size > 0 && (
              <div className="bg-orange-950/40 border border-orange-800/40 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <span className="font-bold text-orange-400">🚩 再生成フラグ: {l4FlaggedIds.size}件</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setL4FlaggedIds(new Set()); localStorage.removeItem("df3000-l4-flagged"); setL4RegenStatus(""); }}
                      className="text-xs text-gray-500 hover:text-gray-300 border border-gray-700 rounded px-2 py-1"
                    >
                      全解除
                    </button>
                    <button
                      onClick={sendL4RegenRequest}
                      className="bg-orange-600 hover:bg-orange-500 text-white text-sm px-4 py-1.5 rounded font-bold"
                    >
                      再生成リクエスト送信
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[...l4FlaggedIds].map((id) => {
                    const entry = (l4Data as any[]).find((t: any) => t.id === id);
                    return entry ? (
                      <span key={id} className="text-sm bg-gray-900 border border-orange-900/50 px-2 py-0.5 rounded flex items-center gap-1">
                        <span className="font-bold">{l4Overrides[id] ?? entry.name}</span>
                        <span className="text-gray-600 text-xs">{id}</span>
                        <button onClick={(e) => toggleL4Flag(id, e)} className="text-gray-600 hover:text-red-400 ml-0.5">×</button>
                      </span>
                    ) : null;
                  })}
                </div>
                {l4RegenStatus && (
                  <p className="text-sm mt-3 text-gray-300 bg-gray-900 rounded p-2">{l4RegenStatus}</p>
                )}
              </div>
            )}

            {/* 20型 + 240疾走領域グリッド */}
            {["D", "S", "O", "N", "E"].map((rank) => {
              const meta = L4_RANK_META[rank];
              const kataItems = (l4KataData as any[]).filter((k: any) => k.rank1 === rank);
              return (
                <div key={rank} className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className={`text-xl font-bold ${meta.color}`}>{rank}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded ${meta.badge}`}>{meta.jp}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kataItems.map((k: any) => {
                      const truenames = names240Map[`${k.rank1}-${k.bias}`] ?? [];
                      return (
                        <div key={k.id} className={`rounded-xl border ${meta.bg} ${meta.border}`}>
                          {/* 型ヘッダー */}
                          <div className="p-4 border-b border-white/10">
                            <div className={`text-xl font-bold ${meta.color}`}>{k.name}</div>
                            <div className="text-xs text-gray-500">{k.reading}</div>
                            <div className={`text-xs px-1.5 py-0.5 rounded inline-block mt-1 ${meta.badge}`}>{k.bias}</div>
                          </div>
                          {/* 疾走領域12個 */}
                          <div className="p-3 grid grid-cols-3 gap-1.5">
                            {truenames.map((n: any) => {
                              const flagged240 = names240FlaggedIds.has(n.id);
                              return (
                                <div
                                  key={n.id}
                                  className={`relative rounded-lg p-2 text-center cursor-pointer transition-colors ${
                                    flagged240 ? "bg-orange-950/60 border border-orange-700/60" : "bg-gray-900/60 hover:bg-gray-800/60"
                                  }`}
                                  title={`${n.reading} — ${n.naming_reason}`}
                                  onClick={() => toggleNames240Flag(n.id)}
                                >
                                  <div className={`text-lg font-bold ${flagged240 ? "text-orange-400" : meta.color}`}>
                                    {names240Overrides[n.id] ?? n.kanji_name}
                                  </div>
                                  <div className="text-xs text-gray-600">{n.reading}</div>
                                  {flagged240 && (
                                    <div className="absolute top-0.5 right-0.5 text-xs text-orange-500">🚩</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
      )}
    </main>

    {/* 名前詳細モーダル */}
    {modalPatternId && modalPattern && (
      <div
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-16 overflow-y-auto"
        onClick={() => setModalPatternId(null)}
      >
        {(() => {
          const modalRank1 = coreRank1Map[modalPattern.core_code];
          const modalRm = modalRank1 ? L4_RANK_META[modalRank1] : null;
          const modalKata = getKata(modalPattern.core_code, modalPattern.bias_type);
          return (
        <div
          className={`border rounded-xl p-6 w-full max-w-lg ${modalRm ? `bg-gray-900 ${modalRm.border}` : "bg-gray-900 border-gray-700"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 型バッジ */}
          {modalKata && modalRm && (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded mb-3 ${modalRm.badge}`}>
              <span className="font-bold text-sm">{modalKata.name}</span>
              <span className="text-xs opacity-70">{modalKata.reading}</span>
            </div>
          )}
          {/* ヘッダー */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              {modalName && (
                <div className="text-center">
                  <div className="text-5xl font-bold">{modalName.kanji_name}</div>
                  <div className="text-sm text-gray-400 mt-1">{nameOverrides[modalPatternId] ?? modalName.reading}</div>
                  <div className="text-xs text-gray-500">{modalName.english_name}</div>
                </div>
              )}
              <div>
                <div className="font-mono text-lg">{modalPattern.core_code}</div>
                <div className="text-gray-500 text-sm">#{modalPatternId}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {[modalPattern.bias_type, modalPattern.output_level, modalPattern.ignition_label, modalPattern.time_character_label].map((tag, i) => (
                    <span key={i} className="text-xs bg-gray-800 px-2 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setModalPatternId(null)} className="text-gray-500 hover:text-white text-xl ml-2">✕</button>
          </div>

          <div className="space-y-3">
            {modalName && (
              <div className="bg-yellow-900/20 border border-yellow-800/30 rounded p-3">
                <h4 className="text-xs text-yellow-600 mb-1">命名理由</h4>
                <p className="text-sm">{modalName.naming_reason}</p>
              </div>
            )}
            {modalInterp && (
              <>
                <div>
                  <h4 className="text-xs text-gray-500 mb-1">構造解釈</h4>
                  <p className="text-sm">{modalInterp.structural_interpretation}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 mb-1">象徴イメージ</h4>
                  <p className="text-sm italic text-gray-300">{modalInterp.symbolic_image}</p>
                </div>
                {modalInterp.texture_keywords && (
                  <div className="flex gap-1 flex-wrap">
                    {modalInterp.texture_keywords.map((kw: string, i: number) => (
                      <span key={i} className="text-xs bg-gray-800 px-2 py-1 rounded">{kw}</span>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {[
                    ["起動条件", modalInterp.trigger],
                    ["加速条件", modalInterp.accelerator],
                    ["持続条件", modalInterp.sustain],
                    ["破綻条件", modalInterp.breakdown],
                    ["回復条件", modalInterp.recovery],
                    ["覚醒時の雰囲気", modalInterp.awakened_vibe],
                  ].filter(([, v]) => v).map(([label, text]) => (
                    <div key={label} className="bg-gray-800/50 rounded p-2">
                      <h4 className="text-xs text-gray-500 mb-0.5">{label}</h4>
                      <p className="text-sm">{text}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
          );
        })()}
      </div>
    )}
    </>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-4 ${highlight ? "bg-green-900/30 border border-green-800" : "bg-gray-900"}`}
    >
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
  color = "bg-white",
}: {
  label: string;
  current: number;
  total: number;
  color?: string;
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
          className={`${color} rounded-full h-2 transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function DetailBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="bg-gray-800/50 rounded p-3">
      <h4 className="text-xs text-gray-500 mb-1">{label}</h4>
      <p className="text-sm">{text}</p>
    </div>
  );
}
