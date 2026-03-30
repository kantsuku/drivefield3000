'use client';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <p className="text-[120px] font-bold text-white/10 leading-none">500</p>
      <h1 className="text-xl font-bold text-white mt-4 mb-2">エラーが発生しました</h1>
      <p className="text-sm text-gray-500 mb-8">{error.message || '予期しないエラーが発生しました。'}</p>
      <div className="flex gap-4">
        <button onClick={reset} className="text-sm text-white border border-white/20 rounded-full px-6 py-2 hover:bg-white/10 transition-colors">
          再試行
        </button>
        <a href="/" className="text-sm text-gray-400 border border-white/10 rounded-full px-6 py-2 hover:bg-white/5 transition-colors">
          トップへ戻る
        </a>
      </div>
    </main>
  );
}
