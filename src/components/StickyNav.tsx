'use client';

import { useEffect, useRef, useState } from 'react';

const ITEMS = [
  { href: '#sec-result', label: '診断結果' },
  { href: '#sec-type', label: 'あなたの型' },
  { href: '#sec-profile', label: 'あなたの人物像' },
  { href: '#sec-startup', label: '起動マニュアル' },
  { href: '#sec-awakening', label: '覚醒の条件' },
  { href: '#sec-drain', label: '弱退化条件' },
  { href: '#sec-recovery', label: '回復マニュアル' },
];

export function StickyNav() {
  const navRef = useRef<HTMLElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([e]) => setStuck(!e.isIntersecting),
      { threshold: [1], rootMargin: '-1px 0px 0px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-40 bg-white transition-all duration-300"
    >
      <div
        className={`max-w-3xl mx-auto px-4 py-2 transition-all duration-300 ${
          stuck ? 'pl-16 md:pl-4' : ''
        }`}
      >
        <p
          className={`text-[10px] text-gray-400 tracking-wider mb-1.5 transition-all duration-300 ${
            stuck ? 'text-left pl-1' : 'text-center'
          }`}
        >
          目次
        </p>
        <div
          className={`overflow-x-auto flex gap-2 transition-all duration-300 ${
            stuck ? 'justify-start' : 'justify-center'
          }`}
        >
          {ITEMS.map((item) => (
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
  );
}
