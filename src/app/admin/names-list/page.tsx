import namesData from '@/data/names-240.json';

const NEURO: Record<string, string> = {
  D: 'ドーパミン',
  S: 'セロトニン',
  O: 'オキシトシン',
  N: 'ノルアドレナリン',
  E: 'エンドルフィン',
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
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* ヘッダー */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3">
          <a href="/admin" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">← 管理画面</a>
          <span className="text-xs text-gray-700">|</span>
          <span className="text-sm font-bold">疾走領域 一覧表</span>
          <span className="text-xs text-gray-600">{entries.length}件</span>
        </div>
      </div>

      {/* テーブル：残り全高さ・横スクロール */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-[1100px] w-full text-sm border-collapse">
          <thead className="sticky top-0 z-20 bg-gray-900">
            <tr className="border-b border-gray-700">
              {/* 真名：左固定 */}
              <th className="sticky left-0 z-30 bg-gray-900 text-left px-3 py-2 text-xs text-gray-500 font-normal w-24 border-r border-gray-700">
                真名
              </th>
              <th className="text-left px-3 py-2 text-xs text-gray-500 font-normal w-48">英語名</th>
              <th className="text-left px-3 py-2 text-xs text-gray-500 font-normal w-32">骨格</th>
              <th className="text-left px-3 py-2 text-xs text-gray-500 font-normal min-w-[280px]">リード文</th>
              <th className="text-left px-3 py-2 text-xs text-gray-500 font-normal w-52">命名理由</th>
              <th className="text-left px-3 py-2 text-xs text-gray-500 font-normal w-28">ID</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => {
              const parts = e.id.split('-');
              const [r1, r2, r3, bias] = parts;
              const rowBg = i % 2 === 0 ? 'bg-gray-950' : 'bg-gray-900/40';
              return (
                <tr
                  key={e.id}
                  className={`border-b border-gray-800/50 align-top ${rowBg}`}
                >
                  {/* 真名：左固定 */}
                  <td className={`sticky left-0 z-10 px-3 py-2 border-r border-gray-800 ${rowBg}`}>
                    <div className="font-bold text-base leading-tight whitespace-nowrap">{e.kanji_name}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{e.reading}</div>
                  </td>

                  {/* 英語名 */}
                  <td className="px-3 py-2">
                    <div className="text-xs text-gray-300">{e.english_name}</div>
                    <div className="text-[10px] text-gray-600 mt-0.5">{e.romaji}</div>
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
                  <td className="px-3 py-2 min-w-[280px] max-w-[400px]">
                    <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">{e.lead ?? '—'}</p>
                  </td>

                  {/* 命名理由 */}
                  <td className="px-3 py-2">
                    <p className="text-[10px] text-gray-600 leading-relaxed line-clamp-4">{e.naming_reason}</p>
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
