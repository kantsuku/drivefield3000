import patternsData from '@/data/patterns-2880.json';
import namesData from '@/data/names-2880.json';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PatternBase {
  pattern_id: number;
  core_code: string;
  interpretation: string;
  drive_structure: string;
  awakening_condition: string;
  drain_condition: string;
  recovery_condition: string;
  bias_type: string;
  output_level: string;
  ignition_label: string;
  time_character_label: string;
}

interface NameEntry {
  pattern_id: number;
  kanji_name: string;
  reading: string;
  english_name: string;
}

const namesMap: Record<number, NameEntry> = {};
for (const n of namesData as NameEntry[]) {
  namesMap[n.pattern_id] = n;
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patternId = parseInt(id, 10);
  const pattern = (patternsData as PatternBase[]).find(
    (p) => p.pattern_id === patternId
  );
  const nameEntry = namesMap[patternId];

  if (!pattern || !nameEntry) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <p className="text-xs text-gray-600 tracking-[0.3em] mb-10">あなたの疾走領域</p>

        <h1 className="text-8xl font-bold mb-3 tracking-wider">
          {nameEntry.kanji_name}
        </h1>
        <p className="text-sm text-gray-500 mb-2">{nameEntry.reading}</p>
        <p className="text-lg text-gray-400 mb-8">{nameEntry.english_name}</p>

        <p className="text-sm text-gray-300 mb-12 leading-relaxed">
          {pattern.interpretation}
        </p>

        <div className="text-left space-y-5 border-t border-white/10 pt-8 mb-10">
          <div>
            <p className="text-xs text-gray-600 tracking-widest mb-1">構造</p>
            <p className="text-sm text-gray-300 leading-relaxed">{pattern.drive_structure}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 tracking-widest mb-1">覚醒条件</p>
            <p className="text-sm text-gray-300 leading-relaxed">{pattern.awakening_condition}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 tracking-widest mb-1">ドレイン条件</p>
            <p className="text-sm text-gray-300 leading-relaxed">{pattern.drain_condition}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 tracking-widest mb-1">回復</p>
            <p className="text-sm text-gray-300 leading-relaxed">{pattern.recovery_condition}</p>
          </div>
        </div>

        <div className="flex justify-center gap-3 text-xs text-gray-700 mb-10 flex-wrap">
          <span>{pattern.core_code}</span>
          <span>·</span>
          <span>{pattern.bias_type}</span>
          <span>·</span>
          <span>{pattern.output_level}</span>
          <span>·</span>
          <span>{pattern.ignition_label}</span>
          <span>·</span>
          <span>{pattern.time_character_label}</span>
        </div>

        <div className="space-y-3">
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
