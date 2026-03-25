'use client';

import { useState, useEffect, useCallback } from 'react';

interface Choice {
  id: string;
  text: string;
  score: Record<string, number>;
}

interface Question {
  id: string;
  type: '8択' | '2択';
  domain: string;
  question: string;
  instruction?: string;
  choices: Choice[];
}

const DOMAIN_COLORS: Record<string, string> = {
  '骨格': 'bg-red-900/30 text-red-300',
  '偏り': 'bg-blue-900/30 text-blue-300',
  '発動方向': 'bg-yellow-900/30 text-yellow-300',
  '時間特性': 'bg-green-900/30 text-green-300',
  '出力': 'bg-purple-900/30 text-purple-300',
  '旅行': 'bg-cyan-900/30 text-cyan-300',
  '仕事観': 'bg-orange-900/30 text-orange-300',
  '食': 'bg-pink-900/30 text-pink-300',
  '恋愛・愛': 'bg-rose-900/30 text-rose-300',
  '金': 'bg-amber-900/30 text-amber-300',
  '原体験': 'bg-teal-900/30 text-teal-300',
};

const SCORE_KEYS = ['D', 'S', 'O', 'N', 'E', 'concentration', 'ignition', 'timing', 'output'];

export default function QuestionsAdmin() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterDomain, setFilterDomain] = useState('');
  const [filterType, setFilterType] = useState('');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetch('/api/questions')
      .then((r) => r.json())
      .then((data) => { setQuestions(data); setLoading(false); });
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    await fetch('/api/questions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questions),
    });
    setSaving(false);
    setSaved(true);
    setDirty(false);
    setTimeout(() => setSaved(false), 2000);
  }, [questions]);

  const updateQuestion = (id: string, patch: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q))
    );
    setDirty(true);
  };

  const updateChoice = (qId: string, cId: string, patch: Partial<Choice>) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              choices: q.choices.map((c) =>
                c.id === cId ? { ...c, ...patch } : c
              ),
            }
          : q
      )
    );
    setDirty(true);
  };

  const updateScore = (qId: string, cId: string, key: string, value: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              choices: q.choices.map((c) => {
                if (c.id !== cId) return c;
                const newScore = { ...c.score };
                if (value === 0) {
                  delete newScore[key];
                } else {
                  newScore[key] = value;
                }
                return { ...c, score: newScore };
              }),
            }
          : q
      )
    );
    setDirty(true);
  };

  const moveQuestion = (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= questions.length) return;
    const newQ = [...questions];
    [newQ[index], newQ[newIndex]] = [newQ[newIndex], newQ[index]];
    setQuestions(newQ);
    setDirty(true);
  };

  const filtered = questions.filter((q) => {
    if (filterDomain && q.domain !== filterDomain) return false;
    if (filterType && q.type !== filterType) return false;
    return true;
  });

  const domains = [...new Set(questions.map((q) => q.domain))];
  const domainCounts = domains.map((d) => ({
    domain: d,
    count: questions.filter((q) => q.domain === d).length,
  }));

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">読み込み中...</p>
      </main>
    );
  }

  const previewQ = previewId ? questions.find((q) => q.id === previewId) : null;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-white/10 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/admin" className="text-xs text-gray-500 hover:text-gray-300">&larr; 管理TOP</a>
            <h1 className="text-lg font-bold">診断設問エディタ</h1>
            <span className="text-xs text-gray-500">{questions.length}問</span>
          </div>
          <div className="flex items-center gap-3">
            {dirty && <span className="text-xs text-yellow-400">未保存の変更あり</span>}
            {saved && <span className="text-xs text-green-400">保存完了</span>}
            <button
              onClick={save}
              disabled={saving || !dirty}
              className={`px-4 py-1.5 rounded text-sm font-bold transition-colors ${
                dirty
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-white/10 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Domain Summary */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => { setFilterDomain(''); setFilterType(''); }}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              !filterDomain && !filterType ? 'bg-white text-black' : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            全て ({questions.length})
          </button>
          {domainCounts.map(({ domain, count }) => (
            <button
              key={domain}
              onClick={() => setFilterDomain(filterDomain === domain ? '' : domain)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                filterDomain === domain
                  ? DOMAIN_COLORS[domain] || 'bg-white/20 text-white'
                  : 'bg-white/5 text-gray-500 hover:bg-white/10'
              }`}
            >
              {domain} ({count})
            </button>
          ))}
          <span className="border-l border-white/10 mx-1" />
          {['2択', '8択'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(filterType === t ? '' : t)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                filterType === t ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'
              }`}
            >
              {t} ({questions.filter((q) => q.type === t).length})
            </button>
          ))}
        </div>

        {/* Questions List */}
        <div className="space-y-2">
          {filtered.map((q, idx) => {
            const realIdx = questions.indexOf(q);
            const isEditing = editingId === q.id;

            return (
              <div
                key={q.id}
                className={`border rounded-lg transition-colors ${
                  isEditing ? 'border-white/30 bg-white/5' : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Row header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xs text-gray-600 tabular-nums w-8">{q.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${DOMAIN_COLORS[q.domain] || 'bg-white/10'}`}>
                    {q.domain}
                  </span>
                  <span className="text-[10px] text-gray-600">{q.type}</span>
                  <p className="flex-1 text-sm truncate">{q.question}</p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewId(previewId === q.id ? null : q.id)}
                      className="px-2 py-1 text-[10px] text-gray-500 hover:text-white border border-white/10 rounded hover:border-white/30 transition-colors"
                    >
                      {previewId === q.id ? '閉じる' : 'Preview'}
                    </button>
                    <button
                      onClick={() => setEditingId(isEditing ? null : q.id)}
                      className="px-2 py-1 text-[10px] text-gray-500 hover:text-white border border-white/10 rounded hover:border-white/30 transition-colors"
                    >
                      {isEditing ? '閉じる' : '編集'}
                    </button>
                    <button onClick={() => moveQuestion(realIdx, -1)} className="px-1 text-gray-600 hover:text-white text-xs">&uarr;</button>
                    <button onClick={() => moveQuestion(realIdx, 1)} className="px-1 text-gray-600 hover:text-white text-xs">&darr;</button>
                  </div>
                </div>

                {/* Preview */}
                {previewId === q.id && (
                  <div className="border-t border-white/10 p-6">
                    <div className="max-w-sm mx-auto">
                      <p className="text-[10px] text-gray-600 tracking-[0.25em] mb-4 text-center uppercase">{q.domain}</p>
                      <h2 className="text-lg font-bold leading-relaxed mb-2 text-center">{q.question}</h2>
                      {q.instruction && <p className="text-sm text-gray-500 mb-6 text-center">{q.instruction}</p>}
                      {!q.instruction && <div className="mb-6" />}
                      <div className={q.type === '2択' ? 'space-y-3' : 'space-y-2'}>
                        {q.choices.map((c) => (
                          <div
                            key={c.id}
                            className={`w-full text-left border border-white/20 rounded-${q.type === '2択' ? 'xl' : 'lg'} ${
                              q.type === '2択' ? 'px-5 py-5' : 'px-4 py-3 flex items-start gap-3'
                            }`}
                          >
                            {q.type === '8択' && (
                              <span className="mt-0.5 w-5 h-5 rounded-full border border-white/30 shrink-0 flex items-center justify-center text-[10px] font-bold text-white/30">
                                {c.id}
                              </span>
                            )}
                            <p className={q.type === '2択' ? 'text-base leading-relaxed' : 'text-sm leading-relaxed text-gray-200'}>
                              {c.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit panel */}
                {isEditing && (
                  <div className="border-t border-white/10 px-4 py-4 space-y-4">
                    <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                      <label className="text-xs text-gray-500">設問文</label>
                      <input
                        value={q.question}
                        onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-white/30"
                      />
                      <label className="text-xs text-gray-500">ドメイン</label>
                      <input
                        value={q.domain}
                        onChange={(e) => updateQuestion(q.id, { domain: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm w-48 focus:outline-none focus:border-white/30"
                      />
                      {q.instruction !== undefined && (
                        <>
                          <label className="text-xs text-gray-500">説明文</label>
                          <input
                            value={q.instruction || ''}
                            onChange={(e) => updateQuestion(q.id, { instruction: e.target.value || undefined })}
                            className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-white/30"
                          />
                        </>
                      )}
                    </div>

                    {/* Choices editor */}
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500">選択肢</p>
                      {q.choices.map((c) => (
                        <div key={c.id} className="border border-white/10 rounded p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 w-6">{c.id}</span>
                            <input
                              value={c.text}
                              onChange={(e) => updateChoice(q.id, c.id, { text: e.target.value })}
                              className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-white/30"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2 ml-6">
                            {SCORE_KEYS.map((key) => {
                              const val = c.score[key] ?? 0;
                              if (val === 0 && !Object.keys(c.score).includes(key)) return null;
                              return (
                                <div key={key} className="flex items-center gap-1">
                                  <span className="text-[10px] text-gray-500">{key}</span>
                                  <input
                                    type="number"
                                    value={val}
                                    onChange={(e) => updateScore(q.id, c.id, key, parseInt(e.target.value) || 0)}
                                    className="w-12 bg-white/5 border border-white/10 rounded px-1 py-0.5 text-xs text-center focus:outline-none focus:border-white/30"
                                  />
                                </div>
                              );
                            })}
                            {/* Add score button */}
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) updateScore(q.id, c.id, e.target.value, 1);
                              }}
                              className="bg-white/5 border border-white/10 rounded px-1 py-0.5 text-[10px] text-gray-500 focus:outline-none"
                            >
                              <option value="">+スコア</option>
                              {SCORE_KEYS.filter((k) => !(k in c.score)).map((k) => (
                                <option key={k} value={k}>{k}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
