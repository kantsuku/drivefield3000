'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [btnState, setBtnState] = useState<'idle' | 'hover' | 'leave'>('idle');
  const [ripples, setRipples] = useState<number[]>([]);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setBtnState('hover');
  };
  const handleLeave = () => {
    setBtnState('leave');
    leaveTimer.current = setTimeout(() => setBtnState('idle'), 600);
  };
  const handleClick = () => {
    const id = Date.now();
    setRipples((prev) => [...prev, id]);
    setTimeout(() => router.push('/diagnosis'), 600);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 relative">
      <div className="wave-bg"><div className="blob-3" /><div className="blob-4" /><div className="blob-5" /></div>
      {/* 右上コピー */}
      <p
        className="fixed top-8 right-6 z-10 text-sm md:text-lg text-gray-300 font-bold tracking-[0.15em] leading-loose"
        style={{ writingMode: 'vertical-rl' }}
      >
        「夢中」の極意を展開せよ。
      </p>

      <div className="relative z-10 flex flex-col items-center">
        <h1
          className="text-5xl md:text-6xl font-bold tracking-[0.15em] mb-6"
          style={{ writingMode: 'vertical-rl', fontFamily: '"Noto Serif JP", "游明朝", YuMincho, serif' }}
        >
          疾走領域
        </h1>
        <p className="text-sm text-gray-400 tracking-[0.3em] mb-12">
          DRIVE FIELD
        </p>
        <button
          onClick={handleClick}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          className={`ripple-btn is-${btnState}`}
        >
          {ripples.map((id) => (
            <span
              key={id}
              className="ripple-ring"
              onAnimationEnd={() => setRipples((prev) => prev.filter((r) => r !== id))}
            />
          ))}
          <span className="text-white font-bold text-sm tracking-wider leading-relaxed text-center">展開<br />する</span>
        </button>
      </div>
    </main>
  );
}
