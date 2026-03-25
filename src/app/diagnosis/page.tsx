'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import questionsData from '@/data/diagnosis-questions.json';
import { calculateResult } from '@/lib/scoring';

type Question = (typeof questionsData)[number];
type Phase = 'intro' | 'questions' | 'loading';

const questions = questionsData as Question[];
const TOTAL = questions.length;

export default function DiagnosisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewPhase = searchParams.get('phase') as Phase | null;
  const previewIndex = parseInt(searchParams.get('q') || '0');

  const [phase, setPhase] = useState<Phase>(previewPhase || 'intro');
  const [index, setIndex] = useState(previewPhase === 'questions' ? Math.min(previewIndex, TOTAL - 1) : 0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const current = questions[index];

  const advance = useCallback(
    (newAnswers: Record<string, string>) => {
      setTransitioning(true);
      setTimeout(() => {
        if (index + 1 >= TOTAL) {
          setPhase('loading');
          const result = calculateResult(newAnswers, questions);
          setTimeout(() => {
            const s = result.scores;
            const params = new URLSearchParams({
              D: String(s.D), S: String(s.S), O: String(s.O), N: String(s.N), E: String(s.E),
              ig: result.ignition, tm: result.timing, out: result.output,
            });
            router.push(`/result/${encodeURIComponent(result.nameId)}?${params}`);
          }, 1800);
        } else {
          setIndex((i) => i + 1);
          setSelected(null);
          setTransitioning(false);
        }
      }, 220);
    },
    [index, router]
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

  if (phase === 'intro') {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center relative">
        <div className="wave-bg"><div className="blob-3" /></div>
        <p className="text-xs text-gray-600 mb-10 tracking-[0.3em] relative z-10">DRIVE FIELD 3000</p>
        <h2 className="text-2xl font-bold mb-6 leading-relaxed">
          鏡は嘘をつかない。<br />
          ただ、お前が見ていなかった<br />
          領域を映すだけだ。
        </h2>
        <p className="text-sm text-gray-500 mb-12">
          問いに答えよ。考えるな。感じろ。
        </p>
        <button
          onClick={() => setPhase('questions')}
          className="px-8 py-4 border border-white/30 text-white font-bold text-base hover:border-white transition-colors rounded-full"
        >
          鏡に触れる
        </button>
      </main>
    );
  }

  if (phase === 'loading') {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <p className="text-sm text-gray-400 animate-pulse tracking-widest">
          疾走領域が開かれる...
        </p>
      </main>
    );
  }

  const progress = (index / TOTAL) * 100;
  const is2択 = current.type === '2択';

  return (
    <main className="min-h-screen flex flex-col">
      {/* プログレスバー */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-white/10 z-50">
        <div
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* カウンター */}
      <div className="fixed top-4 right-4 text-xs text-gray-600 tabular-nums z-50">
        {index + 1} / {TOTAL}
      </div>

      {/* 設問エリア */}
      <div
        className={`flex-1 flex flex-col items-center justify-center px-6 py-16 transition-opacity duration-200 ${
          transitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="w-full max-w-sm">
          {/* ドメインラベル */}
          <p className="text-[10px] text-gray-600 tracking-[0.25em] mb-4 text-center uppercase">
            {current.domain}
          </p>

          {/* 設問文 */}
          <h2 className="text-lg font-bold leading-relaxed mb-2 text-center">
            {current.question}
          </h2>

          {current.instruction && (
            <p className="text-sm text-gray-500 mb-6 text-center">{current.instruction}</p>
          )}

          {!current.instruction && <div className="mb-6" />}

          {/* 選択肢 */}
          {is2択 ? (
            <div className="space-y-3">
              {current.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleSelect(choice.id)}
                  className={`w-full text-left px-5 py-5 rounded-xl border transition-all duration-150 ${
                    selected === choice.id
                      ? 'border-white bg-white/10 scale-[0.99]'
                      : 'border-white/20 hover:border-white/50 active:scale-[0.98]'
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
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-150 flex items-start gap-3 ${
                      selected === choice.id
                        ? 'border-white bg-white/10'
                        : 'border-white/15 hover:border-white/40 active:scale-[0.99]'
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
                  className="mt-6 w-full py-3 bg-white text-black font-bold rounded-full text-sm hover:bg-gray-200 transition-colors"
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
