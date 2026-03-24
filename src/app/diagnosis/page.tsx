'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import namesData from '@/data/names-240.json';

type NeuroCode = 'D' | 'S' | 'O' | 'N' | 'E';
type BiasType = 'Single' | 'Dual' | 'Trinity' | 'Flat';

interface NameEntry {
  id: string;
  kanji_name: string;
}

const names = namesData as NameEntry[];

const NEURO_OPTIONS = [
  { code: 'D' as NeuroCode, label: '新規・可能性', desc: 'まだ見ぬ可能性に触れると、衝動が走る' },
  { code: 'S' as NeuroCode, label: '理解・秩序', desc: '仕組みを解き、全体が見えたとき、力が出る' },
  { code: 'O' as NeuroCode, label: '共感・接続', desc: '人とわかり合えたとき、循環が始まる' },
  { code: 'N' as NeuroCode, label: '緊張・集中', desc: '追い詰められ、研ぎ澄まされるとき、本領が開く' },
  { code: 'E' as NeuroCode, label: '快感・没入', desc: '好きなことへ溶け込むとき、止まれなくなる' },
];

const BIAS_OPTIONS = [
  { value: 'Single' as BiasType, label: '一点突破', desc: '火がつく条件は絞られている。入れば一気に回る' },
  { value: 'Dual' as BiasType, label: '二軸駆動', desc: '2つの核が合わさったとき、最大化する' },
  { value: 'Trinity' as BiasType, label: '三極共鳴', desc: '3つが揃ったとき、深い回転に入る' },
  { value: 'Flat' as BiasType, label: '万能拡散', desc: 'どこからでも起動できる。その分、尖りにくい' },
];

type Step = 'intro' | 'neuro' | 'bias' | 'loading';

export default function DiagnosisPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('intro');
  const [neuro, setNeuro] = useState<NeuroCode[]>([]);

  const tapNeuro = (code: NeuroCode) => {
    if (neuro.includes(code)) {
      setNeuro(neuro.filter((c) => c !== code));
    } else if (neuro.length < 3) {
      setNeuro([...neuro, code]);
    }
  };

  const findAndNavigate = (bias: BiasType) => {
    if (neuro.length < 3) return;
    const [r1, r2, r3] = neuro;
    const id = `${r1}-${r2}-${r3}-${bias}`;
    const entry = names.find((n) => n.id === id);
    if (entry) {
      router.push(`/result/${encodeURIComponent(id)}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      {(step === 'neuro' || step === 'bias') && (
        <div className="fixed top-4 right-4 text-xs text-gray-600 tracking-widest z-50">
          {step === 'neuro' ? '1 / 2' : '2 / 2'}
        </div>
      )}

      {step === 'intro' && (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <p className="text-xs text-gray-600 mb-10 tracking-[0.3em]">DRIVE FIELD 3000</p>
          <h2 className="text-2xl font-bold mb-6 leading-relaxed">
            鏡は嘘をつかない。<br />
            ただ、お前が見ていなかった<br />
            領域を映すだけだ。
          </h2>
          <p className="text-sm text-gray-500 mb-12">
            2つの問いに答えよ。考えるな。感じろ。
          </p>
          <button
            onClick={() => setStep('neuro')}
            className="px-8 py-4 border border-white/30 text-white font-bold text-base hover:border-white transition-colors rounded-full"
          >
            鏡に触れる
          </button>
        </div>
      )}

      {step === 'neuro' && (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 py-16">
          <p className="text-xs text-gray-500 mb-2 tracking-widest text-center">あなたの衝動</p>
          <h3 className="text-lg font-bold mb-2 text-center">強い順に、3つ選べ</h3>
          <p className="text-xs text-gray-600 mb-8 text-center">1番目に強いものから順にタップせよ</p>
          <div className="w-full max-w-sm space-y-3">
            {NEURO_OPTIONS.map((opt) => {
              const rank = neuro.indexOf(opt.code);
              const selected = rank >= 0;
              return (
                <button
                  key={opt.code}
                  onClick={() => tapNeuro(opt.code)}
                  className={`w-full text-left px-4 py-4 rounded-lg border transition-colors ${
                    selected ? 'border-white bg-white/10' : 'border-white/20 hover:border-white/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                        selected ? 'border-white bg-white text-black' : 'border-white/30 text-gray-600'
                      }`}
                    >
                      {selected ? rank + 1 : ''}
                    </span>
                    <div>
                      <p className="font-bold text-sm">{opt.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {neuro.length === 3 && (
            <button
              onClick={() => setStep('bias')}
              className="mt-8 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
            >
              次へ
            </button>
          )}
        </div>
      )}

      {step === 'bias' && (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 py-16">
          <p className="text-xs text-gray-500 mb-2 tracking-widest text-center">起動パターン</p>
          <h3 className="text-lg font-bold mb-8 text-center">あなたのドライブの形は？</h3>
          <div className="w-full max-w-sm space-y-3">
            {BIAS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setStep('loading');
                  findAndNavigate(opt.value);
                }}
                className="w-full text-left px-5 py-4 rounded-lg border border-white/20 hover:border-white hover:bg-white/5 transition-colors"
              >
                <p className="font-bold text-sm">{opt.label}</p>
                <p className="text-xs text-gray-400 mt-1">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'loading' && (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <p className="text-sm text-gray-400 animate-pulse">疾走領域が開かれる...</p>
        </div>
      )}
    </main>
  );
}
