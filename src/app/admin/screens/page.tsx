'use client';

import { useState, useMemo } from 'react';
import namesData from '@/data/names-240.json';
import questionsData from '@/data/diagnosis-questions.json';

interface NameEntry {
  id: string;
  kanji_name: string;
  reading: string;
}

const names = namesData as NameEntry[];
const questions = questionsData as { id: string; type: string; domain: string }[];

type DeviceSize = 'sp' | 'pc';

const DEVICE: Record<DeviceSize, { w: number; h: number; label: string; radius: string }> = {
  sp: { w: 390, h: 844, label: 'スマホ', radius: 'rounded-[2rem]' },
  pc: { w: 1280, h: 800, label: 'PC', radius: 'rounded-lg' },
};

interface DeviceFrameProps {
  title: string;
  src: string;
  description?: string;
  device?: DeviceSize;
  defaultExpanded?: boolean;
}

function DeviceFrame({ title, src, description, device = 'sp', defaultExpanded = false }: DeviceFrameProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const d = DEVICE[device];
  const scale = expanded ? (device === 'pc' ? 0.8 : 1) : 0.5;
  const frameW = d.w * scale;
  const frameH = d.h * scale;

  return (
    <div className="flex flex-col items-center shrink-0">
      <p className="text-sm font-bold mb-1">{title}</p>
      {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] px-2 py-1 rounded border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors"
        >
          {expanded ? '縮小' : '拡大'}
        </button>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] px-2 py-1 rounded border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors"
        >
          別タブで開く
        </a>
      </div>
      <div
        className={`border border-white/20 ${d.radius} overflow-hidden bg-black shadow-2xl transition-all duration-300`}
        style={{ width: frameW, height: frameH }}
      >
        <iframe
          src={src}
          className="border-0 pointer-events-none"
          style={{
            width: d.w,
            height: d.h,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        />
      </div>
    </div>
  );
}

type ViewMode = 'flow' | 'result';

export default function ScreensAdmin() {
  const [viewMode, setViewMode] = useState<ViewMode>('flow');
  const [resultId, setResultId] = useState(names[0]?.id || '');
  const [resultSearch, setResultSearch] = useState('');
  const [questionIdx, setQuestionIdx] = useState(0);
  const [resultDevice, setResultDevice] = useState<DeviceSize>('sp');
  const [flowDevice, setFlowDevice] = useState<DeviceSize>('sp');

  const filteredNames = useMemo(() => {
    if (!resultSearch) return names;
    const s = resultSearch.toLowerCase();
    return names.filter(
      (n) =>
        n.id.toLowerCase().includes(s) ||
        n.kanji_name.includes(s) ||
        n.reading.includes(s)
    );
  }, [resultSearch]);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-white/10 px-4 py-3">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/admin" className="text-xs text-gray-500 hover:text-gray-300">
              &larr; 管理TOP
            </a>
            <h1 className="text-lg font-bold">画面プレビュー</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('flow')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                viewMode === 'flow' ? 'bg-white text-black font-bold' : 'bg-white/10 text-gray-400'
              }`}
            >
              診断フロー
            </button>
            <button
              onClick={() => setViewMode('result')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                viewMode === 'result' ? 'bg-white text-black font-bold' : 'bg-white/10 text-gray-400'
              }`}
            >
              結果ページ
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'flow' && (
        <div className="max-w-[1800px] mx-auto px-4 py-8">
          {/* Controls */}
          <div className="mb-6 flex items-center gap-4 flex-wrap">
            <span className="text-xs text-gray-500">設問:</span>
            <select
              value={questionIdx}
              onChange={(e) => setQuestionIdx(parseInt(e.target.value))}
              className="bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-white/30"
            >
              {questions.map((q, i) => (
                <option key={q.id} value={i}>
                  {q.id} [{q.domain}] {q.type}
                </option>
              ))}
            </select>
            <div className="flex gap-1 ml-auto">
              {(['sp', 'pc'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setFlowDevice(d)}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    flowDevice === d ? 'bg-white text-black font-bold' : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {DEVICE[d].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8">
            <DeviceFrame title="1. トップ" description="/" src="/" device={flowDevice} />
            <div className="flex items-center text-gray-600 text-2xl shrink-0">&rarr;</div>
            <DeviceFrame title="2. イントロ" description="/diagnosis?phase=intro" src="/diagnosis?phase=intro" device={flowDevice} />
            <div className="flex items-center text-gray-600 text-2xl shrink-0">&rarr;</div>
            <DeviceFrame
              title={`3. 設問 (${questions[questionIdx]?.type || ''})`}
              description={`${questions[questionIdx]?.id} [${questions[questionIdx]?.domain}]`}
              src={`/diagnosis?phase=questions&q=${questionIdx}`}
              key={`q-${questionIdx}`}
              device={flowDevice}
            />
            <div className="flex items-center text-gray-600 text-2xl shrink-0">&rarr;</div>
            <DeviceFrame title="4. 検出完了" description="/diagnosis?phase=detected" src="/diagnosis?phase=detected" device={flowDevice} />
            <div className="flex items-center text-gray-600 text-2xl shrink-0">&rarr;</div>
            <DeviceFrame title="5. 演出" description="/diagnosis?phase=reveal" src="/diagnosis?phase=reveal" device={flowDevice} />
            <div className="flex items-center text-gray-600 text-2xl shrink-0">&rarr;</div>
            <DeviceFrame
              title="6. 結果"
              description={`/result/${names[0]?.id}`}
              src={`/result/${encodeURIComponent(names[0]?.id || '')}`}
              device={flowDevice}
            />
          </div>
        </div>
      )}

      {viewMode === 'result' && (
        <div className="max-w-[1800px] mx-auto px-4 py-8">
          {/* Device toggle */}
          <div className="flex gap-1 mb-6">
            {(['sp', 'pc'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setResultDevice(d)}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  resultDevice === d ? 'bg-white text-black font-bold' : 'bg-white/10 text-gray-400'
                }`}
              >
                {DEVICE[d].label}
              </button>
            ))}
          </div>

          <div className="flex gap-6">
            {/* Selector */}
            <div className="w-72 shrink-0">
              <input
                value={resultSearch}
                onChange={(e) => setResultSearch(e.target.value)}
                placeholder="検索（ID / 領域名 / 読み）"
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm mb-3 focus:outline-none focus:border-white/30"
              />
              <div className="h-[700px] overflow-y-auto space-y-0.5 border border-white/10 rounded">
                {filteredNames.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setResultId(n.id)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      resultId === n.id
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <span className="font-bold">{n.kanji_name}</span>
                    <span className="text-xs text-gray-600 ml-2">{n.reading}</span>
                    <span className="text-[10px] text-gray-700 block">{n.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex-1 flex justify-center">
              <DeviceFrame
                title={names.find((n) => n.id === resultId)?.kanji_name || ''}
                description={resultId}
                src={`/result/${encodeURIComponent(resultId)}`}
                key={`${resultId}-${resultDevice}`}
                device={resultDevice}
                defaultExpanded={resultDevice === 'pc'}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
