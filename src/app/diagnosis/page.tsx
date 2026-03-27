'use client';

import { Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import questionsData from '@/data/diagnosis-questions.json';
import namesData from '@/data/names-240.json';
import kataData from '@/data/l4-kata.json';
import { calculateResult, type DiagnosisResult } from '@/lib/scoring';

type Question = (typeof questionsData)[number];
type Phase = 'intro' | 'questions' | 'detected' | 'reveal' | 'loading';

const questions = questionsData as Question[];
const TOTAL = questions.length;

const namesMap: Record<string, { kanji_name: string; reading: string }> = {};
for (const n of namesData as any[]) {
  namesMap[n.id] = n;
}

const kataMap: Record<string, { name: string; reading: string }> = {};
for (const k of kataData as any[]) {
  kataMap[k.id] = k;
}

const NEURO_META: Record<string, { jp: string; desc: string; poetry: string; color: string; gradient: string; spirit: string }> = {
  D: { jp: 'ドーパミン', desc: '新規性・可能性', poetry: '未知への渇望', color: '#c0392b', gradient: 'radial-gradient(circle, #922b21, transparent 65%)', spirit: '未踏の焔' },
  S: { jp: 'セロトニン', desc: '理解・秩序', poetry: '静謐なる洞察', color: '#2e6b8a', gradient: 'radial-gradient(circle, #1a4d6b, transparent 65%)', spirit: '深淵の燈' },
  O: { jp: 'オキシトシン', desc: '共感・接続', poetry: '魂の共鳴', color: '#27806a', gradient: 'radial-gradient(circle, #1a5c4b, transparent 65%)', spirit: '共鳴の潮' },
  N: { jp: 'ノルアドレナリン', desc: '緊張・集中', poetry: '研ぎ澄まされた覚醒', color: '#b8860b', gradient: 'radial-gradient(circle, #8b6914, transparent 65%)', spirit: '研ぎ澄まされた刃' },
  E: { jp: 'エンドルフィン', desc: '快感・没入', poetry: '深淵への没入', color: '#7b5ea7', gradient: 'radial-gradient(circle, #5b3d8f, transparent 65%)', spirit: '溺れる悦楽' },
};

function DiagnosisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewPhase = searchParams.get('phase') as Phase | null;
  const previewIndex = Math.max(0, parseInt(searchParams.get('q') || '0') || 0);

  // プレビュー用ダミー結果
  const previewResult: DiagnosisResult | null =
    (previewPhase === 'detected' || previewPhase === 'reveal')
      ? { nameId: 'D-E-N-Dual', rank1: 'D', rank2: 'E', rank3: 'N', bias: 'Dual', ignition: '外燃', timing: '瞬発', output: '中', scores: { D: 10, S: 3, O: 2, N: 6, E: 8 }, layer2: { selfEsteem: 5, attachment: 3 }, layer3: { study: 2, social: 3, physical: 1, creative: 3, adventure: 2 }, layer4: { physical: 1, intuitive: 3, logical: 2, dexterity: 1, verbal: 2 }, layer5: { affluence: 0, health: 3 }, segment: 'meta' as const }
      : null;

  const [phase, setPhase] = useState<Phase>(previewPhase || 'intro');
  const [index, setIndex] = useState(previewPhase === 'questions' ? Math.min(previewIndex, TOTAL - 1) : 0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(previewResult);
  const [revealStep, setRevealStep] = useState(0);
  const [revealFading, setRevealFading] = useState(false);

  const current = questions[index];

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(
    (newAnswers: Record<string, string>) => {
      setTransitioning(true);
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => {
        if (index + 1 >= TOTAL) {
          const r = calculateResult(newAnswers, questions);
          setResult(r);
          setPhase('detected');
        } else {
          setIndex((i) => i + 1);
          setSelected(null);
          setTransitioning(false);
        }
      }, 220);
    },
    [index]
  );

  const handleSelect = (choiceId: string) => {
    if (transitioning) return;
    setSelected(choiceId);
    const newAnswers = { ...answers, [current.id]: choiceId };
    setAnswers(newAnswers);
    if (current.type === '2択') {
      advance(newAnswers);
    }
  };

  const handleNext = () => {
    if (!selected || transitioning) return;
    advance(answers);
  };

  // --- Reveal sequence ---
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advanceReveal = useCallback(() => {
    setRevealFading(true);
    setTimeout(() => {
      setRevealStep((s) => s + 1);
      setRevealFading(false);
    }, 1200);
  }, []);

  useEffect(() => {
    if (phase !== 'reveal') return;
    // Auto-advance steps 1-7, step 8 (final) waits for button
    const durations: Record<number, number> = {
      0: 4000,   // 黒 + 波紋
      1: 5000,   // あなたの能力を最大限に発揮できる環境
      2: 4500,   // それは努力では決して届かない
      3: 4000,   // 「夢中」の領域
      4: 5500,   // それを疾走領域（ドライブフィールド）と呼ぶ
      5: 5500,   // あなたには〇〇が宿っている
      6: 5000,   // それは〇〇で広がり
      7: 5000,   // 〇〇によって疾走領域となる
      8: 5000,   // あなたの疾走領域、その名は。
      9: 3500,   // 〇〇の型
      // 10: final — no auto advance
    };
    const d = durations[revealStep];
    if (d != null) {
      revealTimer.current = setTimeout(advanceReveal, d);
    }
    return () => { if (revealTimer.current) clearTimeout(revealTimer.current); };
  }, [phase, revealStep, advanceReveal]);


  const navigateToResult = () => {
    if (!result) return;
    const s = result.scores;
    const params = new URLSearchParams({
      D: String(s.D), S: String(s.S), O: String(s.O), N: String(s.N), E: String(s.E),
      ig: result.ignition, tm: result.timing, out: result.output,
      seg: result.segment,
    });
    router.push(`/result/${encodeURIComponent(result.nameId)}?${params}`);
  };

  // --- Intro ripple button ---
  const [ripples, setRipples] = useState<number[]>([]);
  const [btnState, setBtnState] = useState<'idle' | 'hover' | 'leave'>('idle');
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rippleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setBtnState('hover');
  };
  const handleLeave = () => {
    setBtnState('leave');
    leaveTimer.current = setTimeout(() => setBtnState('idle'), 600);
  };
  const handleRippleClick = () => {
    const id = Date.now();
    setRipples((prev) => [...prev, id]);
    if (rippleTimeout.current) clearTimeout(rippleTimeout.current);
    rippleTimeout.current = setTimeout(() => setPhase('questions'), 600);
  };

  // Detected screen also uses ripple button
  const [detectedBtnState, setDetectedBtnState] = useState<'idle' | 'hover' | 'leave'>('idle');
  const detectedLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [detectedRipples, setDetectedRipples] = useState<number[]>([]);

  const handleDetectedEnter = () => {
    if (detectedLeaveTimer.current) clearTimeout(detectedLeaveTimer.current);
    setDetectedBtnState('hover');
  };
  const handleDetectedLeave = () => {
    setDetectedBtnState('leave');
    detectedLeaveTimer.current = setTimeout(() => setDetectedBtnState('idle'), 600);
  };
  const [detectedFading, setDetectedFading] = useState(false);

  const handleDetectedClick = () => {
    const id = Date.now();
    setDetectedRipples((prev) => [...prev, id]);
    // 波紋 → フェードアウト → reveal
    setTimeout(() => setDetectedFading(true), 400);
    setTimeout(() => {
      setRevealStep(0);
      setRevealFading(false);
      setPhase('reveal');
    }, 1800);
  };

  // Final screen ripple button
  const [finalBtnState, setFinalBtnState] = useState<'idle' | 'hover' | 'leave'>('idle');
  const finalLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [finalRipples, setFinalRipples] = useState<number[]>([]);

  const handleFinalEnter = () => {
    if (finalLeaveTimer.current) clearTimeout(finalLeaveTimer.current);
    setFinalBtnState('hover');
  };
  const handleFinalLeave = () => {
    setFinalBtnState('leave');
    finalLeaveTimer.current = setTimeout(() => setFinalBtnState('idle'), 600);
  };
  const handleFinalClick = () => {
    const id = Date.now();
    setFinalRipples((prev) => [...prev, id]);
    setTimeout(navigateToResult, 600);
  };

  // ==================== RENDER ====================

  // --- INTRO ---
  if (phase === 'intro') {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center relative">
        <div className="wave-bg"><div className="blob-3" /><div className="blob-4" /><div className="blob-5" /></div>
        <p className="text-xs text-gray-400 mb-10 tracking-[0.3em] relative z-10">DRIVE FIELD</p>
        <h2 className="text-2xl font-bold mb-6 leading-relaxed relative z-10">
          日々の衝動から<br />
          精神の駆動パターンを解析する
        </h2>
        <p className="text-sm text-gray-300 mb-3 relative z-10">
          問いに答えよ。考えるな。感じろ。
        </p>
        <p className="text-xs text-gray-500 mb-16 relative z-10">
          全90問 / 所要時間 約15〜20分
        </p>
        <button
          onClick={handleRippleClick}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          className={`ripple-btn is-${btnState} relative z-10`}
        >
          {ripples.map((id) => (
            <span key={id} className="ripple-ring" onAnimationEnd={() => setRipples((prev) => prev.filter((r) => r !== id))} />
          ))}
          <span className="text-white font-bold text-sm tracking-wider leading-relaxed text-center">波紋に<br />触れる</span>
        </button>
      </main>
    );
  }

  // --- DETECTED (全問終了) ---
  if (phase === 'detected') {
    return (
      <main
        className="flex flex-col items-center justify-center min-h-screen px-6 text-center relative transition-opacity duration-1000"
        style={{ opacity: detectedFading ? 0 : 1 }}
      >
        <div className="wave-bg"><div className="blob-3" /><div className="blob-4" /><div className="blob-5" /></div>
        <p className="text-xs text-gray-400 mb-10 tracking-[0.3em] relative z-10">DRIVE FIELD</p>
        <h2 className="text-2xl font-bold mb-6 leading-relaxed relative z-10">
          すべての<br />
          精神の駆動パターンを<br />
          検出しました
        </h2>
        <p className="text-sm text-gray-300 mb-16 relative z-10">
          あなたの疾走領域を解析します
        </p>
        <button
          onClick={handleDetectedClick}
          onMouseEnter={handleDetectedEnter}
          onMouseLeave={handleDetectedLeave}
          className={`ripple-btn is-${detectedBtnState} relative z-10`}
        >
          {detectedRipples.map((id) => (
            <span key={id} className="ripple-ring" onAnimationEnd={() => setDetectedRipples((prev) => prev.filter((r) => r !== id))} />
          ))}
          <span className="text-white font-bold text-sm tracking-wider leading-relaxed text-center">解析<br />する</span>
        </button>
      </main>
    );
  }

  // --- REVEAL (演出シーケンス) ---
  if (phase === 'reveal' && result) {
    const r1 = NEURO_META[result.rank1];
    const r2 = NEURO_META[result.rank2];
    const r3 = NEURO_META[result.rank3];
    const name = namesMap[result.nameId];
    const kata = kataMap[`${result.rank1}-${result.bias}`];

    // フェーズごとの色セット
    const isFinal = revealStep >= 8;
    const isTypeColor = revealStep >= 5; // Step 5でぬるっと型カラーへ

    // デフォルトグラデ色（オープニングと同じ）
    const defaultColors = {
      blob1: 'radial-gradient(circle, #e11d48, transparent 65%)',
      blob2: 'radial-gradient(circle, #7c3aed, transparent 65%)',
      blob3: 'radial-gradient(circle, #2563eb, transparent 65%)',
    };

    // 型カラーのグラデ色
    const typeGradient = r1.gradient;
    const typeDarker = r1.gradient.replace('#dc2626', '#991b1b').replace('#2563eb', '#1e40af').replace('#16a34a', '#166534').replace('#ca8a04', '#a16207').replace('#9333ea', '#7e22ce');

    return (
      <main
        className="noise-overlay flex flex-col items-center justify-center min-h-screen px-6 text-center relative overflow-hidden"
        style={{
          backgroundColor: isFinal ? '#8b2520' : '#000',
          transition: 'background-color 3s ease',
        }}
      >
        {/* デフォルトグラデ — Step0から仕込み、Step1で3秒かけてフェードイン、Step3でフェードアウト */}
        {revealStep >= 0 && (
          <div
            className="fixed inset-0 overflow-hidden pointer-events-none"
            style={{
              opacity: (revealStep >= 1 && !isTypeColor) ? 0.4 : 0,
              transition: 'opacity 3s ease',
            }}
          >
            <div className="absolute" style={{ width: '80vmax', height: '80vmax', top: '-20%', left: '-15%', borderRadius: '50%', background: defaultColors.blob1, filter: 'blur(80px)', animation: 'blob-drift-1 10s ease-in-out infinite' }} />
            <div className="absolute" style={{ width: '70vmax', height: '70vmax', bottom: '-25%', right: '-10%', borderRadius: '50%', background: defaultColors.blob2, filter: 'blur(90px)', animation: 'blob-drift-2 14s ease-in-out infinite' }} />
            <div className="absolute" style={{ width: '60vmax', height: '60vmax', top: '30%', left: '40%', borderRadius: '50%', background: defaultColors.blob3, filter: 'blur(100px)', animation: 'blob-drift-3 18s ease-in-out infinite' }} />
          </div>
        )}

        {/* 型カラーグラデ — Step4でフェードイン、最終で全開 */}
        {revealStep >= 4 && (
          <div
            className="fixed inset-0 overflow-hidden pointer-events-none"
            style={{
              opacity: isFinal ? 1 : isTypeColor ? 0.7 : 0,
              transition: 'opacity 3s ease',
            }}
          >
            <div className="absolute" style={{ width: '80vmax', height: '80vmax', top: '-20%', left: '-15%', borderRadius: '50%', background: typeGradient, filter: 'blur(80px)', animation: 'blob-drift-1 10s ease-in-out infinite' }} />
            <div className="absolute" style={{ width: '70vmax', height: '70vmax', bottom: '-25%', right: '-10%', borderRadius: '50%', background: typeDarker, filter: 'blur(90px)', animation: 'blob-drift-2 14s ease-in-out infinite' }} />
            <div className="absolute" style={{ width: '60vmax', height: '60vmax', top: '30%', left: '40%', borderRadius: '50%', background: typeGradient.replace('transparent 65%', 'transparent 50%'), filter: 'blur(100px)', animation: 'blob-drift-3 18s ease-in-out infinite' }} />
            <div className="absolute" style={{ width: '50vmax', height: '50vmax', top: '10%', right: '20%', borderRadius: '50%', background: 'radial-gradient(circle, #b8860b, transparent 65%)', filter: 'blur(90px)', animation: 'blob-drift-1 18s ease-in-out infinite reverse', opacity: 0.6 }} />
          </div>
        )}

        {/* Step 0: 黒画面 + 中央から波紋 */}
        {revealStep === 0 && (
          <div className={revealFading ? 'reveal-text-out' : 'reveal-text'}>
            <div className="reveal-ripple-dot" />
            <div className="reveal-ripple-dot" style={{ animationDelay: '0.6s' }} />
            <div className="reveal-ripple-dot" style={{ animationDelay: '1.2s' }} />
            <div className="reveal-ripple-dot" style={{ animationDelay: '1.8s' }} />
          </div>
        )}

        {/* Step 1 */}
        {revealStep === 1 && (
          <div className={revealFading ? 'reveal-text-out' : 'reveal-text'}>
            <h2 className="text-2xl font-bold leading-loose text-white">
              あなたの<br />
              能力を最大限に発揮できる環境
            </h2>
          </div>
        )}

        {/* Step 2 */}
        {revealStep === 2 && (
          <div className={revealFading ? 'reveal-text-out' : 'reveal-text'}>
            <h2 className="text-2xl font-bold leading-loose text-white">
              それは努力では決して届かない
            </h2>
          </div>
        )}

        {/* Step 3 */}
        {revealStep === 3 && (
          <div className={revealFading ? 'reveal-text-out' : 'reveal-text'}>
            <h2 className="text-3xl font-bold tracking-wider text-white">
              「夢中」の領域
            </h2>
          </div>
        )}

        {/* Step 4: それを疾走領域と呼ぶ */}
        {revealStep === 4 && (
          <div className={revealFading ? 'reveal-text-out' : 'reveal-text'}>
            <h2 className="text-2xl font-bold leading-loose text-white">
              それを<ruby className="text-3xl" style={{ rubyPosition: 'over' }}>疾走領域<rp>(</rp><rt className="text-xs font-normal text-white/60" style={{ paddingBottom: '0.3em' }}>ドライブフィールド</rt><rp>)</rp></ruby>と呼ぶ
            </h2>
          </div>
        )}

        {/* Step 5: 「〇〇が宿っている」 */}
        {revealStep === 5 && (
          <div className={revealFading ? 'reveal-text-out' : 'reveal-text'}>
            <h2 className="text-2xl font-bold leading-loose text-white">
              あなたには<br />
              {r1.spirit}が宿っている
            </h2>
          </div>
        )}

        {/* Step 6: 広がり */}
        {revealStep === 6 && (
          <div className={revealFading ? 'reveal-text-out' : 'reveal-text'}>
            <h2 className="text-2xl font-bold leading-loose text-white">
              それは{r2.poetry}で広がり
            </h2>
          </div>
        )}

        {/* Step 7: 疾走領域となる */}
        {revealStep === 7 && (
          <div className={revealFading ? 'reveal-text-out' : 'reveal-text'}>
            <h2 className="text-2xl font-bold leading-loose text-white">
              {r3.poetry}によって<br />
              疾走領域となる
            </h2>
          </div>
        )}

        {/* Step 8: あなたの疾走領域、その名は。 */}
        {revealStep === 8 && (
          <div className={revealFading ? 'reveal-text-out' : 'reveal-text'}>
            <h2 className="text-xl font-bold leading-loose text-white">
              あなたの疾走領域、その名は。
            </h2>
          </div>
        )}

        {/* Step 9: 型名 */}
        {revealStep === 9 && kata && (
          <div className={`${revealFading ? 'reveal-text-out' : 'reveal-text'} flex flex-col items-center`}>
            <h2
              className="text-3xl font-bold tracking-wider text-white"
              style={{ writingMode: 'vertical-rl', fontFamily: '"Noto Serif JP", "游明朝", YuMincho, serif' }}
            >
              {kata.name}
            </h2>
            <p className="text-xs text-white/60 mt-3">{kata.reading}</p>
          </div>
        )}

        {/* Step 10: 最終 — 疾走領域名（明朝体）+ 型名 */}
        {revealStep >= 10 && name && (
          <div className="reveal-text flex flex-col items-center">
            {kata && (
              <p
                className="text-lg text-white/70 tracking-[0.2em] mb-4 font-bold"
                style={{ fontFamily: '"Noto Serif JP", "游明朝", YuMincho, serif' }}
              >
                {kata.name}
              </p>
            )}
            <h1
              className="text-8xl font-bold mb-4 text-white"
              style={{ writingMode: 'vertical-rl', fontFamily: '"Noto Serif JP", "游明朝", YuMincho, serif', letterSpacing: '0.3em' }}
            >
              {name.kanji_name}
            </h1>
            <p className="text-sm text-white/70">{name.reading}</p>
          </div>
        )}

        {/* 解析を見るボタン — 右下固定、2秒後フェードイン */}
        {revealStep >= 10 && (
          <div
            className="fixed bottom-8 right-8 z-50"
            style={{ opacity: 0, animation: 'reveal-fadein 1.5s ease-out 2s forwards' }}
          >
            <button
              onClick={handleFinalClick}
              onMouseEnter={handleFinalEnter}
              onMouseLeave={handleFinalLeave}
              className={`ripple-btn is-${finalBtnState}`}
              style={{ background: '#fff' }}
            >
              {finalRipples.map((id) => (
                <span key={id} className="ripple-ring" style={{ borderColor: 'rgba(0,0,0,0.3)' }} onAnimationEnd={() => setFinalRipples((prev) => prev.filter((r) => r !== id))} />
              ))}
              <span className="text-black font-bold text-sm tracking-wider leading-relaxed text-center">解析を<br />見る</span>
            </button>
          </div>
        )}
      </main>
    );
  }

  // --- LOADING fallback (for preview) ---
  if (phase === 'loading') {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <p className="text-sm text-gray-400 animate-pulse tracking-widest">
          疾走領域が開かれる...
        </p>
      </main>
    );
  }

  // --- QUESTIONS ---
  const progress = (index / TOTAL) * 100;
  const is2択 = current.type === '2択';

  // フェーズ定義（セクション区切り用）
  const PHASE_MAP: Record<string, { phase: string; label: string }> = {
    '原体験': { phase: '1/7', label: 'ウォームアップ' },
    '食': { phase: '1/7', label: 'ウォームアップ' },
    '骨格': { phase: '2/7', label: 'エンジン診断' },
    '偏り': { phase: '3/7', label: '駆動特性' },
    '発動方向': { phase: '3/7', label: '駆動特性' },
    '時間特性': { phase: '3/7', label: '駆動特性' },
    '出力': { phase: '3/7', label: '駆動特性' },
    '旅行': { phase: '4/7', label: '場面別' },
    'クロス検証': { phase: '4/7', label: '場面別' },
    '仕事観': { phase: '4/7', label: '場面別' },
    '恋愛・愛': { phase: '4/7', label: '場面別' },
    '自己肯定': { phase: '5/7', label: 'あなた自身について' },
    '対人基盤': { phase: '5/7', label: 'あなた自身について' },
    '経験値': { phase: '6/7', label: '経験と才能' },
    '才能': { phase: '6/7', label: '経験と才能' },
    '環境逆推定': { phase: '7/7', label: '環境と未来' },
    '未来思考': { phase: '7/7', label: '環境と未来' },
    '金': { phase: '4/7', label: '場面別' },
  };
  const currentPhase = PHASE_MAP[current.domain];
  const prevPhase = index > 0 ? PHASE_MAP[questions[index - 1]?.domain] : null;
  const isNewPhase = !prevPhase || prevPhase.label !== currentPhase?.label;

  return (
    <main className="min-h-screen flex flex-col relative">
      <div className="wave-bg"><div className="blob-3" /><div className="blob-4" /><div className="blob-5" /></div>
      {/* プログレス */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => {
              if (index > 0) {
                setIndex((i) => i - 1);
                setSelected(answers[questions[index - 1]?.id] || null);
              }
            }}
            disabled={index === 0}
            className="btn-float w-10 h-10 rounded-full border border-white/20 flex flex-col items-center justify-center text-gray-400 hover:text-white hover:border-white/50 disabled:text-gray-700 disabled:border-white/5 disabled:cursor-not-allowed disabled:hover:transform-none shrink-0"
          >
            <span className="text-[9px] leading-none">戻る</span>
            <span className="text-xs leading-none">&larr;</span>
          </button>
          <div className="flex-1 h-2 bg-black rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-300 tabular-nums shrink-0">
            {index + 1} / {TOTAL}
          </span>
        </div>
      </div>

      {/* 設問エリア */}
      <div
        className={`flex-1 flex flex-col items-center justify-center px-6 py-16 transition-opacity duration-200 ${
          transitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="w-full max-w-sm">
          {/* フェーズラベル */}
          {currentPhase && (
            <div className="text-center mb-4">
              {isNewPhase && (
                <p className="text-xs text-white font-bold mb-1">{currentPhase.label}</p>
              )}
              <p className="text-[10px] text-gray-500 tracking-wider">{currentPhase.phase}</p>
            </div>
          )}

          <h2 className="text-lg font-bold leading-relaxed mb-2 text-center text-balance">
            {current.question}
          </h2>

          {current.instruction && (
            <p className="text-sm text-gray-500 mb-6 text-center">{current.instruction}</p>
          )}

          {!current.instruction && <div className="mb-6" />}

          {is2択 ? (
            <div className="space-y-3">
              {current.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleSelect(choice.id)}
                  className={`btn-float w-full text-left px-5 py-5 rounded-xl border ${
                    selected === choice.id
                      ? 'border-white bg-white/10'
                      : 'border-white/20 bg-black/60 backdrop-blur-sm'
                  }`}
                >
                  <p className="text-base leading-relaxed">{choice.text}</p>
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {current.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleSelect(choice.id)}
                    className={`btn-float w-full text-left px-4 py-3 rounded-lg border flex items-start gap-3 ${
                      selected === choice.id
                        ? 'border-white bg-white/10'
                        : 'border-white/15 bg-black/60 backdrop-blur-sm'
                    }`}
                  >
                    <span
                      className={`mt-0.5 w-5 h-5 rounded-full border shrink-0 flex items-center justify-center text-[10px] font-bold transition-colors ${
                        selected === choice.id
                          ? 'border-white bg-white text-black'
                          : 'border-white/30 text-transparent'
                      }`}
                    >
                      {choice.id}
                    </span>
                    <p className="text-sm leading-relaxed text-gray-200">{choice.text}</p>
                  </button>
                ))}
              </div>

              {selected && (
                <button
                  onClick={handleNext}
                  className="btn-float mt-6 w-full py-3 bg-white text-black font-bold rounded-full text-sm"
                >
                  次へ
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function DiagnosisPage() {
  return (
    <Suspense fallback={<main className="flex items-center justify-center min-h-screen"><p className="text-sm text-gray-400 animate-pulse">読み込み中...</p></main>}>
      <DiagnosisContent />
    </Suspense>
  );
}
