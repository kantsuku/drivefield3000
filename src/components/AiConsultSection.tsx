'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';

interface Props {
  prompt: string;
}

export function AiConsultSection({ prompt }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section className="w-full mb-12 relative overflow-hidden rounded-2xl">
      {/* 黒背景 + グラデ */}
      <div className="bg-black px-6 py-10 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.4 }}>
          <div className="absolute" style={{ width: '60vmax', height: '60vmax', top: '-30%', left: '-20%', borderRadius: '50%', background: 'radial-gradient(circle, #922b21, transparent 65%)', filter: 'blur(80px)', animation: 'blob-drift-1 12s ease-in-out infinite' }} />
          <div className="absolute" style={{ width: '50vmax', height: '50vmax', bottom: '-30%', right: '-10%', borderRadius: '50%', background: 'radial-gradient(circle, #5b3d8f, transparent 65%)', filter: 'blur(90px)', animation: 'blob-drift-2 16s ease-in-out infinite' }} />
        </div>

        <div className="relative z-10 max-w-lg mx-auto text-center">
          <MessageCircle size={32} className="text-white/60 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-3">AIに相談してみよう</h3>
          <p className="text-sm text-white/70 leading-[1.9] mb-3">
            お使いのChatGPTやGeminiなどのAIに、この診断内容について相談できます。自分の今の環境をどうすれば改善できるか、どうすれば疾走領域を展開できるか、聞いてみましょう。
          </p>
          <p className="text-xs text-white/40 mb-6">
            コピーした内容に診断結果と前提となるプロンプトが含まれています。お使いのAIに貼り付けるだけで相談を始められます。
          </p>
          <button
            onClick={handleCopy}
            className="btn-float inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-bold text-sm rounded-full"
          >
            <MessageCircle size={16} />
            {copied ? 'コピーしました' : '診断内容をコピーする'}
          </button>
        </div>
      </div>
    </section>
  );
}
