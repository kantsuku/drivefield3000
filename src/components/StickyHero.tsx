'use client';

import { useState, useEffect, useRef } from 'react';

interface StickyHeroProps {
  kanjiName: string;
  reading: string;
  englishName: string;
  kataName: string;
  lead: string;
  copyText: string;
  bgColor: string;
  children: React.ReactNode;  // グラデblob
  navItems: { href: string; label: string }[];
  rightLabel: string;
}

export function StickyHero({
  kanjiName, reading, englishName, kataName, lead, copyText, bgColor, children, navItems, rightLabel,
}: StickyHeroProps) {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 200);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const serif = { fontFamily: '"Noto Serif JP", "游明朝", YuMincho, serif' };

  return (
    <div
      ref={heroRef}
      className="sticky top-0 z-30 transition-all duration-700 ease-out overflow-hidden border-b border-gray-200 noise-overlay"
      style={{ backgroundColor: bgColor, height: scrolled ? 60 : 500 }}
    >
      {/* グラデblob */}
      <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: scrolled ? 0.5 : 1 }}>
        {children}
      </div>

      {/* 右上ラベル */}
      <p
        className="absolute top-4 right-6 z-10 text-sm text-white font-bold tracking-[0.15em] leading-loose transition-opacity duration-500"
        style={{ writingMode: 'vertical-rl', opacity: scrolled ? 0 : 1 }}
      >
        {rightLabel}
      </p>

      {/* フルヒーロー（スクロール前） */}
      <div
        className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center px-6 text-center text-white transition-all duration-700"
        style={{
          paddingTop: scrolled ? 0 : 64,
          paddingBottom: scrolled ? 0 : 64,
          opacity: scrolled ? 0 : 1,
          pointerEvents: scrolled ? 'none' : 'auto',
        }}
      >
        <p className="text-xl text-white tracking-[0.2em] mb-4" style={serif}>{kataName}</p>
        <h1 className="text-8xl font-bold tracking-wider mb-3" style={{ writingMode: 'vertical-rl', ...serif, letterSpacing: '0.3em' }}>
          {kanjiName}
        </h1>
        <p className="text-sm text-white mt-3 mb-10">{reading} / {englishName}</p>
        <p className="text-xl text-white mb-8 tracking-wider leading-relaxed" style={serif}>{copyText}</p>
        {lead && <p className="text-sm text-white mb-6 leading-[1.9] text-left">{lead}</p>}
      </div>

      {/* 縮小ヒーロー（スクロール後） */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-700"
        style={{ opacity: scrolled ? 1 : 0, pointerEvents: scrolled ? 'auto' : 'none' }}
      >
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white" style={{ ...serif, letterSpacing: '0.15em' }}>
            {kanjiName}
          </h1>
          <span className="text-xs text-white/60">{kataName}</span>
        </div>
      </div>

      {/* アンカーリンクバー（スクロール後に下部に表示） */}
      {scrolled && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/20">
          <div className="max-w-3xl mx-auto flex items-center gap-2 pl-4 pr-4 py-1.5 overflow-x-auto">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[10px] text-white/70 hover:text-white px-2 py-1 rounded-full border border-white/10 hover:border-white/30 transition-colors whitespace-nowrap shrink-0"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
