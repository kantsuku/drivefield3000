import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <p className="text-[120px] font-bold text-white/10 leading-none">404</p>
      <h1 className="text-xl font-bold text-white mt-4 mb-2">このページは存在しません</h1>
      <p className="text-sm text-gray-500 mb-8">URLが間違っているか、ページが移動した可能性があります。</p>
      <Link href="/" className="text-sm text-white border border-white/20 rounded-full px-6 py-2 hover:bg-white/10 transition-colors">
        トップへ戻る
      </Link>
    </main>
  );
}
