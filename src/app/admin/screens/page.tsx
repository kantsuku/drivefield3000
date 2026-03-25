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

// 8択・2択それぞれの最初のインデックスを取得
const first8 = questions.findIndex((q) => q.type === '8択');
const first2 = questions.findIndex((q) => q.type === '2択');

interface PhoneFrameProps {
  title: string;
  src: string;
  description?: string;
}

function PhoneFrame({ title, src, description }: PhoneFrameProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm font-bold mb-1">{title}</p>
      {description && <p className="text-xs text-gray-500 mb-3">{description}</p>}
      <div
        className={`border border-white/20 rounded-[2rem] overflow-hidden bg-black shadow-2xl transition-all duration-300 cursor-pointer ${
          expanded ? 'w-[390px] h-[844px]' : 'w-[195px] h-[422px]'
        }`}
        onClick={() => setExpanded(!expanded)}
        title={expanded ? 'クリックで縮小' : 'クリックで拡大'}
      >
        <iframe
          src={src}
          className="w-[390px] h-[844px] border-0"
          style={{
            transform: expanded ? 'scale(1)' : 'scale(0.5)',
            transformOrigin: 'top left',
          }}
        />
      </div>
      <p className="text-[10px] text-gray-600 mt-2">
        {expanded ? 'クリックで縮小' : 'クリックで拡大'}
      </p>
    </div>
  );
}

type ViewMode = 'flow' | 'result';

export default function ScreensAdmin() {
  const [viewMode, setViewMode] = useState<ViewMode>('flow');
  const [resultId, setResultId] = useState(names[0]?.id || '');
  const [resultSearch, setResultSearch] = useState('');
  const [questionIdx, setQuestionIdx] = useState(0);

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
          {/* Question selector for questions phase */}
          <div className="mb-6 flex items-center gap-4 flex-wrap">
            <span className="text-xs text-gray-500">設問プレビュー:</span>
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
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8">
            {/* Arrow helper */}
            <PhoneFrame
              title="1. トップ"
              description="/"
              src="/"
            />
            <div className="flex items-center text-gray-600 text-2xl shrink-0">&rarr;</div>
            <PhoneFrame
              title="2. イントロ"
              description="/diagnosis?phase=intro"
              src="/diagnosis?phase=intro"
            />
            <div className="flex items-center text-gray-600 text-2xl shrink-0">&rarr;</div>
            <PhoneFrame
              title={`3. 設問 (${questions[questionIdx]?.type || ''})`}
              description={`${questions[questionIdx]?.id} [${questions[questionIdx]?.domain}]`}
              src={`/diagnosis?phase=questions&q=${questionIdx}`}
              key={`q-${questionIdx}`}
            />
            <div className="flex items-center text-gray-600 text-2xl shrink-0">&rarr;</div>
            <PhoneFrame
              title="4. ローディング"
              description="/diagnosis?phase=loading"
              src="/diagnosis?phase=loading"
            />
            <div className="flex items-center text-gray-600 text-2xl shrink-0">&rarr;</div>
            <PhoneFrame
              title="5. 結果"
              description={`/result/${names[0]?.id}`}
              src={`/result/${encodeURIComponent(names[0]?.id || '')}`}
            />
          </div>
        </div>
      )}

      {viewMode === 'result' && (
        <div className="max-w-[1800px] mx-auto px-4 py-8">
          <div className="flex gap-6">
            {/* Name selector */}
            <div className="w-72 shrink-0">
              <input
                value={resultSearch}
                onChange={(e) => setResultSearch(e.target.value)}
                placeholder="検索（ID / 真名 / 読み）"
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

            {/* Result preview */}
            <div className="flex-1 flex justify-center">
              <PhoneFrame
                title={names.find((n) => n.id === resultId)?.kanji_name || ''}
                description={resultId}
                src={`/result/${encodeURIComponent(resultId)}`}
                key={resultId}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
