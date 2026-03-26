'use client';

import { useState } from 'react';
import namesData from '@/data/names-240.json';

const NEURO: Record<string, string> = {
  D: 'ドーパミン', S: 'セロトニン', O: 'オキシトシン', N: 'ノルアドレナリン', E: 'エンドルフィン',
};
const BIAS_JP: Record<string, string> = {
  Single: '一点突破', Dual: '二軸駆動', Trinity: '三極共鳴', Flat: '万能拡散',
};
const NEURO_COLOR: Record<string, string> = {
  D: 'text-red-400', S: 'text-blue-400', O: 'text-green-400', N: 'text-yellow-400', E: 'text-purple-400',
};

export default function NamesListPage() {
  const [entries, setEntries] = useState<any[]>((namesData as any[]).filter((d) => d.id?.includes('-')));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editField, setEditField] = useState<string>('');
  const [editValue, setEditValue] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const startEdit = (id: string, field: string, value: string) => {
    setEditingId(id);
    setEditField(field);
    setEditValue(value);
  };

  const saveEdit = async () => {
    if (!editingId || !editField) return;
    setSaving(true);
    try {
      const res = await fetch('/api/update-name240', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, field: editField, value: editValue }),
      });
      if (res.ok) {
        setEntries((prev) => prev.map((e) => e.id === editingId ? { ...e, [editField]: editValue } : e));
      }
    } catch {} finally {
      setSaving(false);
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const filtered = search
    ? entries.filter((e) =>
        e.id.toLowerCase().includes(search.toLowerCase()) ||
        e.kanji_name.includes(search) ||
        e.reading.includes(search) ||
        (e.lead || '').includes(search)
      )
    : entries;

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* ヘッダー */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900 gap-3">
        <div className="flex items-center gap-3">
          <a href="/admin" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">← 管理画面</a>
          <span className="text-xs text-gray-700">|</span>
          <span className="text-sm font-bold">疾走領域 一覧表</span>
          <span className="text-xs text-gray-600">{filtered.length}/{entries.length}件</span>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="検索..."
          className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm w-48 focus:outline-none focus:border-gray-500"
        />
      </div>

      {/* テーブル */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-[1200px] w-full text-sm border-collapse">
          <thead className="sticky top-0 z-20 bg-gray-900">
            <tr className="border-b border-gray-700">
              <th className="sticky left-0 z-30 bg-gray-900 text-left px-3 py-2 text-xs text-gray-500 font-normal w-24 border-r border-gray-700">領域名</th>
              <th className="text-left px-3 py-2 text-xs text-gray-500 font-normal w-32">骨格</th>
              <th className="text-left px-3 py-2 text-xs text-gray-500 font-normal min-w-[350px]">リード文 <span className="text-gray-700">(クリックで編集)</span></th>
              <th className="text-left px-3 py-2 text-xs text-gray-500 font-normal min-w-[250px]">命名理由 <span className="text-gray-700">(クリックで編集)</span></th>
              <th className="text-left px-3 py-2 text-xs text-gray-500 font-normal w-28">ID</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => {
              const parts = e.id.split('-');
              const [r1, r2, r3, bias] = parts;
              const rowBg = i % 2 === 0 ? 'bg-gray-950' : 'bg-gray-900/40';
              const isEditingLead = editingId === e.id && editField === 'lead';
              const isEditingReason = editingId === e.id && editField === 'naming_reason';

              return (
                <tr key={e.id} className={`border-b border-gray-800/50 align-top ${rowBg}`}>
                  {/* 領域名 */}
                  <td className={`sticky left-0 z-10 px-3 py-2 border-r border-gray-800 ${rowBg}`}>
                    <div className="font-bold text-base leading-tight whitespace-nowrap">{e.kanji_name}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{e.reading}</div>
                    <div className="text-[10px] text-gray-600 mt-0.5">{e.english_name}</div>
                  </td>

                  {/* 骨格 */}
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-[10px] font-mono ${NEURO_COLOR[r1]}`}>1 {r1} {NEURO[r1]}</span>
                      <span className={`text-[10px] font-mono ${NEURO_COLOR[r2]} opacity-70`}>2 {r2} {NEURO[r2]}</span>
                      <span className={`text-[10px] font-mono ${NEURO_COLOR[r3]} opacity-50`}>3 {r3} {NEURO[r3]}</span>
                      <span className="text-[10px] text-gray-500 mt-0.5">{BIAS_JP[bias]}</span>
                    </div>
                  </td>

                  {/* リード文 */}
                  <td className="px-3 py-2 min-w-[350px]">
                    {isEditingLead ? (
                      <div className="space-y-2">
                        <textarea
                          value={editValue}
                          onChange={(ev) => setEditValue(ev.target.value)}
                          className="w-full bg-gray-800 border border-blue-500 rounded p-2 text-xs text-gray-200 leading-relaxed resize-y min-h-[120px] focus:outline-none"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button onClick={saveEdit} disabled={saving} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50">
                            {saving ? '保存中...' : '保存'}
                          </button>
                          <button onClick={cancelEdit} className="text-xs text-gray-500 hover:text-gray-300 px-3 py-1">キャンセル</button>
                        </div>
                      </div>
                    ) : (
                      <p
                        className="text-xs text-gray-300 leading-relaxed cursor-pointer hover:bg-gray-800/50 rounded p-1 -m-1 transition-colors"
                        onClick={() => startEdit(e.id, 'lead', e.lead ?? '')}
                        title="クリックで編集"
                      >
                        {e.lead ?? '—'}
                      </p>
                    )}
                  </td>

                  {/* 命名理由 */}
                  <td className="px-3 py-2 min-w-[250px]">
                    {isEditingReason ? (
                      <div className="space-y-2">
                        <textarea
                          value={editValue}
                          onChange={(ev) => setEditValue(ev.target.value)}
                          className="w-full bg-gray-800 border border-blue-500 rounded p-2 text-xs text-gray-200 leading-relaxed resize-y min-h-[80px] focus:outline-none"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button onClick={saveEdit} disabled={saving} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50">
                            {saving ? '保存中...' : '保存'}
                          </button>
                          <button onClick={cancelEdit} className="text-xs text-gray-500 hover:text-gray-300 px-3 py-1">キャンセル</button>
                        </div>
                      </div>
                    ) : (
                      <p
                        className="text-[10px] text-gray-600 leading-relaxed cursor-pointer hover:bg-gray-800/50 rounded p-1 -m-1 transition-colors"
                        onClick={() => startEdit(e.id, 'naming_reason', e.naming_reason ?? '')}
                        title="クリックで編集"
                      >
                        {e.naming_reason}
                      </p>
                    )}
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
