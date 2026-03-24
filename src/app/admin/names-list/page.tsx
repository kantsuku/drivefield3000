'use client';

import namesData from '@/data/names-240.json';

const NEURO: Record<string, string> = {
  D: 'ドーパミン',
  S: 'セロトニン',
  O: 'オキシトシン',
  N: 'ノルアドレナリン',
  E: 'エンドルフィン',
};
const NEURO_SHORT: Record<string, string> = {
  D: 'D dopamine',
  S: 'S serotonin',
  O: 'O oxytocin',
  N: 'N noradrenaline',
  E: 'E endorphin',
};
const BIAS_JP: Record<string, string> = {
  Single: '一点突破',
  Dual: '二軸駆動',
  Trinity: '三極共鳴',
  Flat: '万能拡散',
};
const NEURO_COLOR: Record<string, string> = {
  D: 'text-red-400',
  S: 'text-blue-400',
  O: 'text-green-400',
  N: 'text-yellow-400',
  E: 'text-purple-400',
};

const entries = (namesData as any[]).filter((d) => d.id && d.id.includes('-'));

export default function NamesListPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">疾走領域 一覧</h1>
          <p className="text-xs text-gray-500 mt-0.5">{entries.length}件</p>
        </div>
        <a href="/admin" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
          ← 管理画面
        </a>
      </div>

      {/* 横スクロール + 縦5行 */}
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(5 * 88px)' }}>
          <table className="min-w-[1100px] w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-900">
              <tr className="border-b border-gray-700">
                <th className="text-left px-3 py-2 text-xs text-gray-500 font-normal w-28">ID</th>
                <th className="text-left px-3 py-2 text-xs text-gray-500 font-normal w-28">真名</th>
                <th className="text-left px-3 py-2 text-xs text-gray-500 font-normal w-48">英語名</th>
                <th className="text-left px-3 py-2 text-xs text-gray-500 font-normal w-32">骨格</th>
                <th className="text-left px-3 py-2 text-xs text-gray-500 font-normal">リード文</th>
                <th className="text-left px-3 py-2 text-xs text-gray-500 font-normal w-56">命名理由</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => {
                const parts = e.id.split('-');
                const [r1, r2, r3, bias] = parts;
                return (
                  <tr
                    key={e.id}
                    className={`border-b border-gray-800/60 align-top hover:bg-white/5 transition-colors ${
                      i % 2 === 0 ? 'bg-gray-950' : 'bg-gray-900/30'
                    }`}
                  >
                    {/* ID */}
                    <td className="px-3 py-2">
                      <span className="text-[10px] text-gray-600 font-mono">{e.id}</span>
                    </td>

                    {/* 真名 */}
                    <td className="px-3 py-2">
                      <div className="font-bold text-base leading-tight">{e.kanji_name}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{e.reading}</div>
                    </td>

                    {/* 英語名 */}
                    <td className="px-3 py-2">
                      <div className="text-xs text-gray-300">{e.english_name}</div>
                      <div className="text-[10px] text-gray-600 mt-0.5">{e.romaji}</div>
                    </td>

                    {/* 骨格（縦積み小文字） */}
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-[10px] font-mono ${NEURO_COLOR[r1]}`}>
                          1 {r1} {NEURO[r1]}
                        </span>
                        <span className={`text-[10px] font-mono ${NEURO_COLOR[r2]} opacity-70`}>
                          2 {r2} {NEURO[r2]}
                        </span>
                        <span className={`text-[10px] font-mono ${NEURO_COLOR[r3]} opacity-50`}>
                          3 {r3} {NEURO[r3]}
                        </span>
                        <span className="text-[10px] text-gray-500 mt-0.5">
                          {BIAS_JP[bias]} ({bias})
                        </span>
                      </div>
                    </td>

                    {/* リード文 */}
                    <td className="px-3 py-2 min-w-[280px] max-w-[400px]">
                      <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                        {e.lead ?? '—'}
                      </p>
                    </td>

                    {/* 命名理由 */}
                    <td className="px-3 py-2">
                      <p className="text-[10px] text-gray-600 leading-relaxed line-clamp-4">
                        {e.naming_reason}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
