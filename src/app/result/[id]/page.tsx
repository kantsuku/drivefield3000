import namesData from '@/data/names-240.json';
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

const namesMap: Record<string, NameEntry> = {};
for (const n of namesData as NameEntry[]) {
  namesMap[n.id] = n;
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const entry = namesMap[decodedId];

  if (!entry) {
    notFound();
  }

  const parts = decodedId.split('-');
  const coreCode = parts.slice(0, 3).join('-');
  const bias = parts[3] ?? '';

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <p className="text-xs text-gray-600 tracking-[0.3em] mb-10">あなたの疾走領域</p>

        <h1 className="text-8xl font-bold mb-3 tracking-wider">
          {entry.kanji_name}
        </h1>
        <p className="text-sm text-gray-500 mb-2">{entry.reading}</p>
        <p className="text-lg text-gray-400 mb-8">{entry.english_name}</p>

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
