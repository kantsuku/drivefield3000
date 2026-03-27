'use client';

import { useState } from 'react';
import namesData from '@/data/names-240.json';
import kataData from '@/data/l4-kata.json';

interface NameEntry { id: string; kanji_name: string; reading: string; english_name: string; }
interface KataEntry { id: string; rank1: string; bias: string; name: string; }

const kataMap: Record<string, KataEntry> = {};
for (const k of kataData as KataEntry[]) kataMap[k.id] = k;

const NEURO_JP: Record<string, string> = {
  D: 'ドーパミン', S: 'セロトニン', O: 'オキシトシン', N: 'ノルアドレナリン', E: 'エンドルフィン',
};
const BIAS_JP: Record<string, string> = {
  Single: '一点突破', Dual: '二軸駆動', Trinity: '三極共鳴', Flat: '万能拡散',
};
const RANK1_COLOR: Record<string, string> = {
  D: 'text-red-400', S: 'text-blue-400', O: 'text-green-400', N: 'text-yellow-400', E: 'text-purple-400',
};
const RANK1_BORDER: Record<string, string> = {
  D: 'border-red-800', S: 'border-blue-800', O: 'border-green-800', N: 'border-yellow-800', E: 'border-purple-800',
};

const names = namesData as NameEntry[];

export default function OgpPreviewPage() {
  const [filterRank1, setFilterRank1] = useState<string>('all');
  const [filterBias, setFilterBias] = useState<string>('all');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = names.filter((n) => {
    const parts = n.id.split('-');
    if (filterRank1 !== 'all' && parts[0] !== filterRank1) return false;
    if (filterBias !== 'all' && parts[3] !== filterBias) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">OGP画像プレビュー</h1>
            <p className="text-sm text-gray-400 mt-1">240の疾走領域のシェア画像を確認</p>
          </div>
          <a href="/admin" className="text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg px-4 py-2">
            ← 管理画面に戻る
          </a>
        </div>

        {/* フィルター */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">神経系:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setFilterRank1('all')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  filterRank1 === 'all' ? 'border-white text-white' : 'border-gray-700 text-gray-500 hover:text-gray-300'
                }`}
              >
                全て
              </button>
              {['D', 'S', 'O', 'N', 'E'].map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRank1(r)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    filterRank1 === r ? 'border-white text-white' : 'border-gray-700 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">偏り:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setFilterBias('all')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  filterBias === 'all' ? 'border-white text-white' : 'border-gray-700 text-gray-500 hover:text-gray-300'
                }`}
              >
                全て
              </button>
              {['Single', 'Dual', 'Trinity', 'Flat'].map((b) => (
                <button
                  key={b}
                  onClick={() => setFilterBias(b)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    filterBias === b ? 'border-white text-white' : 'border-gray-700 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {BIAS_JP[b]}
                </button>
              ))}
            </div>
          </div>
          <div className="ml-auto text-xs text-gray-500">
            {filtered.length} / 240
          </div>
        </div>

        {/* 選択中のプレビュー（大きく表示） */}
        {selected && (() => {
          const entry = names.find((n) => n.id === selected);
          if (!entry) return null;
          const parts = selected.split('-');
          const kata = kataMap[`${parts[0]}-${parts[3]}`];
          return (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold">{entry.kanji_name}（{entry.reading}）</h2>
                  {kata && <span className="text-sm text-gray-400">{kata.name}</span>}
                  <span className="text-xs text-gray-500">{selected}</span>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-xs text-gray-500 hover:text-white"
                >
                  閉じる
                </button>
              </div>
              {/* OGP実寸プレビュー（縮小表示） */}
              <div className="border border-gray-700 rounded-xl overflow-hidden bg-gray-900 p-4">
                <p className="text-[10px] text-gray-500 mb-2">1200 × 630 — X / LINE / Facebook シェア画像</p>
                <div className="w-full" style={{ maxWidth: '720px' }}>
                  <div style={{ position: 'relative', paddingBottom: '52.5%' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/og?id=${encodeURIComponent(selected)}`}
                      alt={`OGP: ${entry.kanji_name}`}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <a
                    href={`/api/og?id=${encodeURIComponent(selected)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-white border border-gray-700 rounded px-3 py-1"
                  >
                    原寸で開く
                  </a>
                  <a
                    href={`/result/${encodeURIComponent(selected)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-white border border-gray-700 rounded px-3 py-1"
                  >
                    結果ページを開く
                  </a>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 一覧グリッド */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {filtered.map((n) => {
            const parts = n.id.split('-');
            const rank1 = parts[0];
            const bias = parts[3];
            const kata = kataMap[`${rank1}-${bias}`];
            const isSelected = selected === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setSelected(n.id)}
                className={`text-left border rounded-lg p-3 transition-all ${
                  isSelected
                    ? `${RANK1_BORDER[rank1]} bg-white/5`
                    : 'border-gray-800 hover:border-gray-600 hover:bg-white/3'
                }`}
              >
                <p className={`text-lg font-bold ${RANK1_COLOR[rank1]}`}>{n.kanji_name}</p>
                <p className="text-[10px] text-gray-500">{n.reading} / {n.english_name}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  {kata && <span className="text-[10px] text-gray-400">{kata.name}</span>}
                  <span className="text-[10px] text-gray-600">{BIAS_JP[bias]}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
