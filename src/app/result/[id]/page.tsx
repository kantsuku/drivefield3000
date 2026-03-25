import namesData from '@/data/names-240.json';
import kataData from '@/data/l4-kata.json';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface NameEntry {
  id: string;
  kanji_name: string;
  reading: string;
  english_name: string;
  naming_reason: string;
  lead?: string;
}

interface KataEntry {
  id: string;
  rank1: string;
  bias: string;
  name: string;
  reading: string;
}

const namesMap: Record<string, NameEntry> = {};
for (const n of namesData as NameEntry[]) {
  namesMap[n.id] = n;
}

const kataMap: Record<string, KataEntry> = {};
for (const k of kataData as KataEntry[]) {
  kataMap[k.id] = k;
}

const NEURO_LABELS: Record<string, { jp: string; color: string }> = {
  D: { jp: 'ドーパミン', color: '#f87171' },
  S: { jp: 'セロトニン', color: '#60a5fa' },
  O: { jp: 'オキシトシン', color: '#4ade80' },
  N: { jp: 'ノルアドレナリン', color: '#facc15' },
  E: { jp: 'エンドルフィン', color: '#c084fc' },
};

function RadarChart({ scores }: { scores: Record<string, number> }) {
  const keys = ['D', 'S', 'O', 'N', 'E'];
  const maxScore = Math.max(...Object.values(scores), 1);
  const cx = 120;
  const cy = 120;
  const r = 90;
  const levels = 4;

  const angleFor = (i: number) => (Math.PI * 2 * i) / keys.length - Math.PI / 2;

  const pointAt = (i: number, ratio: number) => {
    const a = angleFor(i);
    return { x: cx + r * ratio * Math.cos(a), y: cy + r * ratio * Math.sin(a) };
  };

  // Grid lines
  const gridPaths = Array.from({ length: levels }, (_, lv) => {
    const ratio = (lv + 1) / levels;
    const points = keys.map((_, i) => pointAt(i, ratio));
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  });

  // Data polygon
  const dataPoints = keys.map((k, i) => pointAt(i, Math.max(scores[k] || 0, 0) / maxScore));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-[280px]">
      {/* Grid */}
      {gridPaths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      ))}
      {/* Axes */}
      {keys.map((_, i) => {
        const p = pointAt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
      })}
      {/* Data */}
      <path d={dataPath} fill="rgba(255,255,255,0.08)" stroke="white" strokeWidth="1.5" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={NEURO_LABELS[keys[i]].color} />
      ))}
      {/* Labels */}
      {keys.map((k, i) => {
        const p = pointAt(i, 1.22);
        return (
          <text
            key={k}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[11px] font-bold"
            fill={NEURO_LABELS[k].color}
          >
            {k}
          </text>
        );
      })}
    </svg>
  );
}

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const decodedId = decodeURIComponent(id);
  const entry = namesMap[decodedId];

  if (!entry) {
    notFound();
  }

  const parts = decodedId.split('-');
  const rank1 = parts[0];
  const bias = parts[3] ?? '';
  const coreCode = parts.slice(0, 3).join('-');

  // 型を引く
  const kata = kataMap[`${rank1}-${bias}`];

  // スコア (クエリパラメータから取得、なければnull)
  const hasScores = sp.D !== undefined;
  const scores = hasScores
    ? { D: Number(sp.D) || 0, S: Number(sp.S) || 0, O: Number(sp.O) || 0, N: Number(sp.N) || 0, E: Number(sp.E) || 0 }
    : null;

  const ignition = sp.ig || null;
  const timing = sp.tm || null;
  const output = sp.out || null;

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-16 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <p className="text-xs text-gray-600 tracking-[0.3em] mb-8">あなたの疾走領域</p>

        {/* 型の名前 */}
        {kata && (
          <p className="text-sm text-gray-400 tracking-[0.2em] mb-4">
            {kata.name}
          </p>
        )}

        {/* 真名 — 縦書き */}
        <h1
          className="text-8xl font-bold tracking-wider mb-3"
          style={{ writingMode: 'vertical-rl' }}
        >
          {entry.kanji_name}
        </h1>
        <p className="text-sm text-gray-500 mb-1 mt-3">{entry.reading}</p>
        <p className="text-base text-gray-400 mb-8">{entry.english_name}</p>

        {/* パラメータ */}
        {scores && (
          <div className="w-full mb-8">
            <div className="flex justify-center mb-4">
              <RadarChart scores={scores} />
            </div>

            {/* 数値 */}
            <div className="grid grid-cols-5 gap-1 mb-4">
              {(['D', 'S', 'O', 'N', 'E'] as const).map((k) => (
                <div key={k} className="flex flex-col items-center">
                  <span className="text-[10px] font-bold" style={{ color: NEURO_LABELS[k].color }}>{k}</span>
                  <span className="text-lg font-bold tabular-nums">{scores[k]}</span>
                  <span className="text-[9px] text-gray-600">{NEURO_LABELS[k].jp}</span>
                </div>
              ))}
            </div>

            {/* 属性タグ */}
            <div className="flex justify-center gap-2 flex-wrap">
              {ignition && (
                <span className="px-3 py-1 rounded-full border border-white/10 text-xs text-gray-400">{ignition}</span>
              )}
              {timing && (
                <span className="px-3 py-1 rounded-full border border-white/10 text-xs text-gray-400">{timing}</span>
              )}
              {output && (
                <span className="px-3 py-1 rounded-full border border-white/10 text-xs text-gray-400">出力: {output}</span>
              )}
            </div>
          </div>
        )}

        {/* リード文 */}
        {entry.lead && (
          <p className="text-sm text-gray-200 mb-8 leading-[1.9] text-left">
            {entry.lead}
          </p>
        )}

        <p className="text-xs text-gray-600 mb-12 leading-relaxed text-left">
          {entry.naming_reason}
        </p>

        <div className="flex justify-center gap-3 text-xs text-gray-700 mb-10 flex-wrap">
          <span>{coreCode}</span>
          {bias && <><span>·</span><span>{bias}</span></>}
        </div>

        <div className="space-y-3 w-full">
          <Link
            href="/diagnosis"
            className="block w-full py-3 border border-white/20 text-white text-sm hover:border-white transition-colors rounded-full"
          >
            もう一度診断する
          </Link>
          <Link
            href="/"
            className="block w-full py-3 text-gray-600 text-sm hover:text-gray-400 transition-colors"
          >
            トップへ
          </Link>
        </div>
      </div>
    </main>
  );
}
