'use client';

import { useState, useEffect, useRef } from 'react';
import namesData from '@/data/names-240.json';
import kataData from '@/data/l4-kata.json';

function getAdminHeaders(): Record<string, string> {
  const key = typeof window !== 'undefined' ? (sessionStorage.getItem('df3000-admin-key') || '') : '';
  return { 'Content-Type': 'application/json', 'x-admin-key': key };
}
const adminHeaders = typeof window !== 'undefined' ? getAdminHeaders() : { 'Content-Type': 'application/json' };

// ─── Types ───────────────────────────────────────────

interface ChangeLog {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}

// ─── Constants ───────────────────────────────────────

const NEURO: Record<string, string> = {
  D: 'ドーパミン', S: 'セロトニン', O: 'オキシトシン', N: 'ノルアドレナリン', E: 'エンドルフィン',
};
const BIAS_JP: Record<string, string> = {
  Single: '一点突破', Dual: '二軸駆動', Trinity: '三極共鳴', Flat: '万能拡散',
};
const RANK1_COLOR: Record<string, { text: string; bg: string; border: string; dot: string }> = {
  D: { text: 'text-red-400',    bg: 'bg-red-950/20',    border: 'border-red-900/40',  dot: 'bg-red-500' },
  S: { text: 'text-blue-400',   bg: 'bg-blue-950/20',   border: 'border-blue-900/40', dot: 'bg-blue-500' },
  O: { text: 'text-green-400',  bg: 'bg-green-950/20',  border: 'border-green-900/40', dot: 'bg-green-500' },
  N: { text: 'text-yellow-400', bg: 'bg-yellow-950/20', border: 'border-yellow-900/40', dot: 'bg-yellow-500' },
  E: { text: 'text-purple-400', bg: 'bg-purple-950/20', border: 'border-purple-900/40', dot: 'bg-purple-500' },
};

const FIELD_LABELS: Record<string, string> = {
  kanji_name: '領域名',
  reading: '読み',
  english_name: '英語名',
  lead: 'リード文',
};

// ─── Lookups ─────────────────────────────────────────

const kataMap: Record<string, { name: string; reading: string }> = {};
for (const k of kataData as any[]) kataMap[k.id] = { name: k.name, reading: k.reading };

function extractCatchphrase(namingReason: string): string {
  const raw = namingReason
    .split('。')
    .filter((s: string) => !s.includes('優先漢字') && !s.includes('使用漢字'))
    .map((s: string) => s.trim())
    .filter(Boolean)[0] || '';
  const match = raw.match(/[、。]([^、。]*$)/) || raw.match(/を[、]?(.+)/);
  return match ? match[1].replace(/として表現$/, '').replace(/を象徴$/, '').trim() : raw;
}

// ─── Component ───────────────────────────────────────

export default function NamesListPage() {
  const [entries, setEntries] = useState<any[]>((namesData as any[]).filter((d) => d.id?.includes('-')));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editField, setEditField] = useState<string>('');
  const [editValue, setEditValue] = useState<string>('');
  const editRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [rank1Filter, setRank1Filter] = useState('all');
  const [biasFilter, setBiasFilter] = useState('all');
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Load change logs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('df3000-change-logs');
    if (stored) try { setChangeLogs(JSON.parse(stored)); } catch {}
  }, []);

  const saveLogs = (logs: ChangeLog[]) => {
    setChangeLogs(logs);
    localStorage.setItem('df3000-change-logs', JSON.stringify(logs));
  };

  const startEdit = (id: string, field: string, value: string) => {
    setEditingId(id);
    setEditField(field);
    setEditValue(value);
    setSuggestions([]);
  };

  const fetchSuggestions = async (id: string, field: string, current: string) => {
    setLoadingSuggestions(true);
    setSuggestions([]);
    const entry = entries.find((e) => e.id === id);
    try {
      const res = await fetch('/api/suggest-names', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ id, field, current, kanjiName: entry?.kanji_name }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      }
    } catch {} finally {
      setLoadingSuggestions(false);
    }
  };

  const applySuggestion = (suggestion: any) => {
    if (editField === 'kanji_name' && suggestion.kanji_name) {
      setEditValue(suggestion.kanji_name);
      if (editRef.current) editRef.current.value = suggestion.kanji_name;
      const entry = entries.find((e) => e.id === editingId);
      if (entry) {
        entry._pendingReading = suggestion.reading;
        entry._pendingEnglish = suggestion.english_name;
      }
    } else if (editField === 'naming_reason' && suggestion.naming_reason) {
      setEditValue(suggestion.naming_reason);
      if (editRef.current) editRef.current.value = suggestion.naming_reason;
    }
  };

  const [cascading, setCascading] = useState(false);
  const [cascadingId, setCascadingId] = useState<string | null>(null);

  const runCascade = async (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    setCascadingId(id);
    setCascading(true);
    try {
      const res = await fetch('/api/suggest-names', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ id, field: 'cascade', kanjiName: entry.kanji_name }),
      });
      if (res.ok) {
        const { result } = await res.json();
        const updates: Record<string, string> = {};
        const fields = ['reading', 'english_name', 'naming_reason', 'lead'] as const;
        for (const f of fields) {
          if (result?.[f]) {
            updates[f] = result[f];
            await patchField(id, f, result[f]);
          }
        }
        setEntries((prev) => prev.map((e) => e.id === id ? { ...e, ...updates } : e));
      }
    } catch {} finally {
      setCascading(false);
      setCascadingId(null);
    }
  };

  const patchField = (id: string, field: string, value: string) =>
    fetch('/api/update-name240', { method: 'PATCH', headers: adminHeaders, body: JSON.stringify({ id, field, value }) });

  const saveEdit = async () => {
    if (!editingId || !editField) return;
    const currentValue = editRef.current?.value ?? editValue;
    setSaving(true);
    const entry = entries.find((e) => e.id === editingId);
    const oldValue = entry?.[editField] ?? '';
    try {
      const res = await patchField(editingId, editField, currentValue);
      if (res.ok) {
        const updates: Record<string, string> = { [editField]: currentValue };

        // kanji_name変更時はreading/english_nameも保存＋コピー＆リード連動生成
        if (editField === 'kanji_name' && entry?._pendingReading) {
          updates.reading = entry._pendingReading;
          updates.english_name = entry._pendingEnglish;
          await patchField(editingId, 'reading', entry._pendingReading);
          await patchField(editingId, 'english_name', entry._pendingEnglish);

          // cascade: コピー＋リード文を連動生成
          setCascading(true);
          try {
            const cascadeRes = await fetch('/api/suggest-names', {
              method: 'POST',
              headers: adminHeaders,
              body: JSON.stringify({ id: editingId, field: 'cascade', kanjiName: currentValue }),
            });
            if (cascadeRes.ok) {
              const { result } = await cascadeRes.json();
              if (result?.naming_reason) {
                updates.naming_reason = result.naming_reason;
                await patchField(editingId, 'naming_reason', result.naming_reason);
              }
              if (result?.lead) {
                updates.lead = result.lead;
                await patchField(editingId, 'lead', result.lead);
              }
            }
          } catch {} finally {
            setCascading(false);
          }
        }

        setEntries((prev) => prev.map((e) => e.id === editingId ? { ...e, ...updates, _pendingReading: undefined, _pendingEnglish: undefined } : e));
        const log: ChangeLog = { id: editingId, field: editField, oldValue, newValue: currentValue, timestamp: new Date().toISOString() };
        saveLogs([log, ...changeLogs]);
      }
    } catch {} finally {
      setSaving(false);
      setEditingId(null);
      setSuggestions([]);
    }
  };

  const cancelEdit = () => setEditingId(null);

  const reEdit = (log: ChangeLog) => {
    const entry = entries.find((e) => e.id === log.id);
    if (entry) startEdit(log.id, log.field, entry[log.field] ?? '');
    setShowLogs(false);
  };

  const filtered = entries.filter((e) => {
    const parts = e.id.split('-');
    if (rank1Filter !== 'all' && parts[0] !== rank1Filter) return false;
    if (biasFilter !== 'all' && parts[3] !== biasFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.id.toLowerCase().includes(q) ||
        e.kanji_name.includes(search) ||
        e.reading.includes(search) ||
        (e.lead || '').includes(search) ||
        e.english_name.toLowerCase().includes(q);
    }
    return true;
  });

  const canSuggest = (field: string) => field === 'kanji_name' || field === 'naming_reason';

  const renderEditableCell = (id: string, field: string, value: string, className = '', multiline = false) => {
    const isEditing = editingId === id && editField === field;
    if (isEditing) {
      return (
        <div className="space-y-2">
          {multiline ? (
            <textarea
              ref={editRef as React.RefObject<HTMLTextAreaElement>}
              defaultValue={editValue}
              className="w-full bg-gray-800 border border-blue-500 rounded p-2 text-xs text-gray-200 leading-relaxed resize-y min-h-[100px] focus:outline-none"
              autoFocus
            />
          ) : (
            <input
              ref={editRef as React.RefObject<HTMLInputElement>}
              defaultValue={editValue}
              className="w-full bg-gray-800 border border-blue-500 rounded px-2 py-1 text-sm text-gray-200 focus:outline-none"
              autoFocus
              onKeyDown={(ev) => { if (ev.key === 'Enter') saveEdit(); if (ev.key === 'Escape') cancelEdit(); }}
            />
          )}
          <div className="flex items-center gap-2">
            <button onClick={saveEdit} disabled={saving} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50">
              {saving ? '保存中...' : '保存'}
            </button>
            <button onClick={cancelEdit} className="text-xs text-gray-500 hover:text-gray-300 px-3 py-1">取消</button>
            {canSuggest(field) && (
              <button
                onClick={() => fetchSuggestions(id, field, value)}
                disabled={loadingSuggestions}
                className="text-xs bg-purple-700 hover:bg-purple-600 text-white px-3 py-1 rounded disabled:opacity-50 ml-auto"
              >
                {loadingSuggestions ? '生成中...' : '🎲 候補を生成'}
              </button>
            )}
          </div>
          {/* 候補リスト */}
          {suggestions.length > 0 && editingId === id && editField === field && (
            <div className="border border-purple-800/50 rounded-lg bg-purple-950/20 p-2 space-y-1">
              <p className="text-[10px] text-purple-400 mb-1">クリックで選択:</p>
              {suggestions.map((s: any, i: number) => (
                <button
                  key={i}
                  onClick={() => applySuggestion(s)}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors hover:bg-purple-900/30 ${
                    (editRef.current?.value ?? editValue) === (s.kanji_name || s.naming_reason) ? 'bg-purple-900/40 text-white' : 'text-gray-300'
                  }`}
                >
                  {field === 'kanji_name' ? (
                    <span><strong>{s.kanji_name}</strong> <span className="text-gray-500">({s.reading} / {s.english_name})</span></span>
                  ) : (
                    <span>{s.naming_reason}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }
    return (
      <div
        className={`cursor-pointer hover:bg-white/5 rounded px-1 py-0.5 -mx-1 transition-colors ${className}`}
        onClick={() => startEdit(id, field, value)}
        title="クリックで編集"
      >
        {value || '—'}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* ヘッダー */}
      <div className="shrink-0 px-4 py-3 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-xs text-gray-500 hover:text-gray-300">← 管理画面</a>
            <span className="text-xs text-gray-700">|</span>
            <span className="text-sm font-bold">疾走領域 一覧・編集</span>
            <span className="text-xs text-gray-600">{filtered.length}/{entries.length}件</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className={`text-xs px-3 py-1 rounded border transition-colors ${
                showLogs ? 'border-blue-500 text-blue-400' : 'border-gray-700 text-gray-500 hover:text-gray-300'
              }`}
            >
              変更履歴 {changeLogs.length > 0 && `(${changeLogs.length})`}
            </button>
            <a href="/admin/ogp" className="text-xs text-gray-500 hover:text-gray-300 border border-gray-700 rounded px-3 py-1">
              OGPプレビュー
            </a>
          </div>
        </div>
        {/* フィルター */}
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="検索..."
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm w-48 focus:outline-none focus:border-gray-500"
          />
          <div className="flex gap-1">
            <button onClick={() => setRank1Filter('all')} className={`px-2 py-0.5 text-[10px] rounded-full border ${rank1Filter === 'all' ? 'border-white/40 text-white' : 'border-gray-700 text-gray-500'}`}>全て</button>
            {['D', 'S', 'O', 'N', 'E'].map((r) => (
              <button key={r} onClick={() => setRank1Filter(r)} className={`px-2 py-0.5 text-[10px] rounded-full border ${rank1Filter === r ? 'border-white/40 text-white' : 'border-gray-700 text-gray-500'}`}>{r}</button>
            ))}
          </div>
          <div className="flex gap-1">
            <button onClick={() => setBiasFilter('all')} className={`px-2 py-0.5 text-[10px] rounded-full border ${biasFilter === 'all' ? 'border-white/40 text-white' : 'border-gray-700 text-gray-500'}`}>全て</button>
            {['Single', 'Dual', 'Trinity', 'Flat'].map((b) => (
              <button key={b} onClick={() => setBiasFilter(b)} className={`px-2 py-0.5 text-[10px] rounded-full border ${biasFilter === b ? 'border-white/40 text-white' : 'border-gray-700 text-gray-500'}`}>{BIAS_JP[b]}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 変更履歴パネル */}
      {showLogs && (
        <div className="shrink-0 border-b border-gray-800 bg-gray-900/50 max-h-60 overflow-y-auto">
          <div className="px-4 py-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-300">変更履歴</span>
              {changeLogs.length > 0 && (
                <button onClick={() => saveLogs([])} className="text-[10px] text-gray-600 hover:text-gray-400">クリア</button>
              )}
            </div>
            {changeLogs.length === 0 ? (
              <p className="text-xs text-gray-600">まだ変更履歴はありません</p>
            ) : (
              <div className="space-y-1">
                {changeLogs.map((log, i) => {
                  const parts = log.id.split('-');
                  const rank1 = parts[0];
                  const entry = entries.find((e) => e.id === log.id);
                  const colors = RANK1_COLOR[rank1] || RANK1_COLOR.D;
                  return (
                    <div key={i} className="flex items-start gap-3 text-[10px] py-1.5 border-b border-gray-800/50">
                      <span className="text-gray-600 shrink-0 w-32">{new Date(log.timestamp).toLocaleString('ja-JP')}</span>
                      <span className={`shrink-0 ${colors.text}`}>{entry?.kanji_name || log.id}</span>
                      <span className="text-gray-500 shrink-0">{FIELD_LABELS[log.field] || log.field}</span>
                      <span className="text-gray-600 truncate max-w-[200px]">{log.oldValue || '(空)'}</span>
                      <span className="text-gray-600">→</span>
                      <span className="text-gray-300 truncate max-w-[200px]">{log.newValue || '(空)'}</span>
                      <button onClick={() => reEdit(log)} className="text-blue-500 hover:text-blue-400 shrink-0 ml-auto">再編集</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* cascade中のオーバーレイ */}
      {cascading && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-900 border border-purple-700 rounded-xl px-6 py-4 text-center">
            <p className="text-sm text-purple-300 mb-1">コピー＆リード文を連動生成中...</p>
            <p className="text-[10px] text-gray-500">名称に合わせて自動生成しています</p>
          </div>
        </div>
      )}

      {/* テーブル */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-[500px] w-full text-sm border-collapse">
          <thead className="sticky top-0 z-20 bg-gray-900">
            <tr className="border-b border-gray-700">
              <th className="sticky left-0 z-30 bg-gray-900 text-left px-3 py-2 text-xs text-gray-500 font-normal w-[60px] border-r border-gray-700">領域名</th>
              <th className="text-left px-3 py-2 text-xs text-gray-500 font-normal w-[100px]">キャッチコピー</th>
              <th className="text-left px-3 py-2 text-xs text-gray-500 font-normal w-[150px]">リード文</th>
              <th className="text-left px-3 py-2 text-xs text-gray-500 font-normal w-28">ID</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => {
              const parts = e.id.split('-');
              const [r1, , , bias] = parts;
              const kata = kataMap[`${r1}-${bias}`];
              const colors = RANK1_COLOR[r1] || RANK1_COLOR.D;
              const rowBg = i % 2 === 0 ? '' : 'bg-gray-900/30';
              const catchphrase = extractCatchphrase(e.naming_reason || '');

              return (
                <tr key={e.id} className={`border-b border-gray-800/50 align-top ${rowBg} border-l-2 ${colors.border}`}>
                  {/* 領域名（sticky固定） */}
                  <td className={`sticky left-0 z-10 px-3 py-2 border-r border-gray-800 ${rowBg || 'bg-gray-950'}`}>
                    {renderEditableCell(e.id, 'kanji_name', e.kanji_name, `font-bold text-lg ${colors.text}`)}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
                      <span className={`text-[10px] font-bold ${colors.text}`}>{r1}</span>
                      {kata && <span className="text-[10px] text-gray-400">{kata.name}</span>}
                      <span className="text-[10px] text-gray-600">{BIAS_JP[bias]}</span>
                    </div>
                    {renderEditableCell(e.id, 'reading', e.reading, 'text-[10px] text-gray-400 mt-0.5')}
                    {renderEditableCell(e.id, 'english_name', e.english_name, 'text-[10px] text-gray-500')}
                    <button
                      onClick={() => runCascade(e.id)}
                      disabled={cascading}
                      className="mt-1 text-[9px] bg-purple-800 hover:bg-purple-700 text-purple-200 px-2 py-0.5 rounded disabled:opacity-50"
                    >
                      {cascadingId === e.id ? '生成中...' : '🔄 他項目を生成'}
                    </button>
                  </td>

                  {/* キャッチコピー（編集可能＋候補生成） */}
                  <td className="px-3 py-2 w-[100px]">
                    {renderEditableCell(e.id, 'naming_reason', e.naming_reason || '', 'text-xs text-gray-300')}
                    {!(editingId === e.id && editField === 'naming_reason') && catchphrase && (
                      <p className="text-[10px] text-gray-500 mt-1 italic">→ {catchphrase}</p>
                    )}
                  </td>

                  {/* リード文 */}
                  <td className="px-3 py-2 w-[150px]">
                    {renderEditableCell(e.id, 'lead', e.lead ?? '', 'text-xs text-gray-300 leading-relaxed', true)}
                  </td>

                  {/* ID */}
                  <td className="px-3 py-2">
                    <span className="text-[10px] text-gray-700 font-mono">{e.id}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
