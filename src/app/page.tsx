import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 relative">
      <div className="wave-bg"><div className="blob-3" /></div>
      <div className="relative z-10 flex flex-col items-center">
        <h1
          className="text-6xl md:text-8xl font-bold tracking-[0.15em] mb-6"
          style={{ writingMode: 'vertical-rl' }}
        >
          疾走領域
        </h1>
        <p className="text-sm text-gray-500 tracking-[0.3em] mb-12">
          DRIVE FIELD 3000
        </p>
        <Link
          href="/diagnosis"
          className="px-8 py-4 border border-white/30 text-white font-bold text-base hover:border-white transition-colors rounded-full"
        >
          開眼する
        </Link>
      </div>
    </main>
  );
}
