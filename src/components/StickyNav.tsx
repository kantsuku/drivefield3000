'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  const [activeId, setActiveId] = useState<string>('');

  // sticky検知
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

  // スクロールスパイ：各セクションを監視
  useEffect(() => {
    const ids = ITEMS.map((item) => item.href.replace('#', ''));
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 画面内に見えているセクションのうち、最も上にあるものをactiveにする
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-10% 0px -60% 0px', threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // activeなボタンを自動スクロールで見える位置に
  const scrollToActive = useCallback((id: string) => {
    if (!scrollRef.current) return;
    const activeBtn = scrollRef.current.querySelector(`[data-section="${id}"]`) as HTMLElement | null;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, []);

  useEffect(() => {
    if (activeId) scrollToActive(activeId);
  }, [activeId, scrollToActive]);

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
          ref={scrollRef}
          className={`overflow-x-auto flex gap-2 transition-all duration-300 ${
            stuck ? 'justify-start' : 'justify-center'
          }`}
        >
          {ITEMS.map((item) => {
            const sectionId = item.href.replace('#', '');
            const isActive = activeId === sectionId;
            return (
              <a
                key={item.href}
                href={item.href}
                data-section={sectionId}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-white bg-gray-900 border-gray-900'
                    : 'text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-400'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
