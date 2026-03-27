'use client';

import { useState, useEffect } from 'react';

interface StickyHeroProps {
  kanjiName: string;
  reading: string;
  englishName: string;
  kataName: string;
  lead: string;
  copyText: string;
  bgColor: string;
  children: React.ReactNode;
  navItems: { href: string; label: string }[];
  rightLabel: string;
}

export function StickyHero({
  kanjiName, reading, englishName, kataName, lead, copyText, bgColor, children, navItems, rightLabel,
}: StickyHeroProps) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setCompact(window.scrollY > 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const serif = { fontFamily: '"Noto Serif JP", "游明朝", YuMincho, serif' };

  return (
    <>
      {/* フルヒーロー（通常表示） */}
      <section
        className="noise-overlay relative overflow-hidden border-b border-gray-200"
        style={{ backgroundColor: bgColor }}
      >
        <div className="absolute inset-0">{children}</div>

        <p
          className="absolute top-8 right-6 z-10 text-sm md:text-lg text-white font-bold tracking-[0.15em] leading-loose"
          style={{ writingMode: 'vertical-rl' }}
        >
          {rightLabel}
        </p>

        <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center px-6 py-16 text-center text-white">
          <p className="text-xl text-white tracking-[0.2em] mb-4" style={serif}>{kataName}</p>
          <h1 className="text-8xl font-bold tracking-wider mb-3" style={{ writingMode: 'vertical-rl', ...serif, letterSpacing: '0.3em' }}>
            {kanjiName}
          </h1>
          <p className="text-sm text-white mt-3 mb-10">{reading} / {englishName}</p>
          <p className="text-xl text-white mb-8 tracking-wider leading-relaxed" style={serif}>{copyText}</p>
          {lead && <p className="text-sm text-white mb-6 leading-[1.9] text-left">{lead}</p>}
        </div>
      </section>

      {/* コンパクトヘッダー（スクロール時に上部固定） */}
      <div
        className="fixed top-0 left-0 right-0 z-30 transition-transform duration-500 ease-out"
        style={{ transform: compact ? 'translateY(0)' : 'translateY(-100%)' }}
      >
        <div className="noise-overlay relative overflow-hidden" style={{ backgroundColor: bgColor }}>
          <div className="absolute inset-0 opacity-50">{children}</div>
          <div className="relative z-10 flex items-center justify-center h-14 px-4">
            <h1 className="text-lg font-bold text-white tracking-wider" style={serif}>
              {kanjiName}
            </h1>
            <span className="text-xs text-white/50 ml-3">{kataName}</span>
          </div>
        </div>
        {/* ナビバー */}
        <div className="bg-black/30 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto flex items-center gap-2 pl-14 md:pl-4 pr-4 py-1.5 overflow-x-auto">
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
      </div>

      {/* 通常時のナビバー（白背景） */}
      <nav
        className="sticky top-0 z-20 bg-white transition-opacity duration-300"
        style={{ opacity: compact ? 0 : 1 }}
      >
        <div className="max-w-3xl mx-auto flex items-center gap-3 pl-16 md:pl-4 pr-4 py-2.5">
          <span className="text-[10px] text-gray-400 tracking-wider shrink-0 hidden md:inline">目次</span>
          <div className="overflow-x-auto flex gap-2 min-w-0">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-400 transition-colors whitespace-nowrap shrink-0"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
