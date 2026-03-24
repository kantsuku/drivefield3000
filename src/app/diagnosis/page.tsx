'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import patternsData from '@/data/patterns-2880.json';

type NeuroCode = 'D' | 'S' | 'O' | 'N' | 'E';
type BiasType = 'Single' | 'Dual' | 'Trinity' | 'Flat';
type OutputLevel = 'Light' | 'Middle' | 'Over';
type IgnitionDirection = 'external' | 'internal';
type TimeCharacter = 'burst' | 'mature';

interface PatternRecord {
  pattern_id: number;
  rank1: NeuroCode;
  rank2: NeuroCode;
  rank3: NeuroCode;
  bias_type: BiasType;
  output_level: OutputLevel;
  ignition: IgnitionDirection;
  time_character: TimeCharacter;
}

const patterns = patternsData as PatternRecord[];

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

const OUTPUT_OPTIONS = [
  { value: 'Light' as OutputLevel, label: '持続型', desc: '省エネで長く回る。小さく起動しやすい' },
  { value: 'Middle' as OutputLevel, label: 'バランス型', desc: '再現性と推進力を両立する' },
  { value: 'Over' as OutputLevel, label: '爆発型', desc: 'ハマると圧倒的。外すとDrainも大きい' },
];

const IGNITION_OPTIONS = [
  { value: 'external' as IgnitionDirection, label: '外燃', desc: '外の刺激・他者・環境の変化で点火する' },
  { value: 'internal' as IgnitionDirection, label: '内燃', desc: '内なる確信・衝動・構想から燃え上がる' },
];

const TIME_OPTIONS = [
  { value: 'burst' as TimeCharacter, label: '瞬発', desc: '条件が揃うと、一瞬で最速に達する' },
  { value: 'mature' as TimeCharacter, label: '熟成', desc: 'じわじわ温まり、閾値を超えると深く回る' },
];

type Step = 'intro' | 'neuro' | 'bias' | 'output' | 'ignition' | 'time' | 'loading';

const STEP_LABELS: Partial<Record<Step, string>> = {
  neuro: '1 / 5',
  bias: '2 / 5',
  output: '3 / 5',
  ignition: '4 / 5',
  time: '5 / 5',
};

export default function DiagnosisPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('intro');
  const [neuro, setNeuro] = useState<NeuroCode[]>([]);
  const [bias, setBias] = useState<BiasType | null>(null);
  const [output, setOutput] = useState<OutputLevel | null>(null);
  const [ignition, setIgnition] = useState<IgnitionDirection | null>(null);

  const tapNeuro = (code: NeuroCode) => {
    if (neuro.includes(code)) {
      setNeuro(neuro.filter((c) => c !== code));
    } else if (neuro.length < 3) {
      setNeuro([...neuro, code]);
    }
  };

  const findAndNavigate = (tc: TimeCharacter) => {
    if (!bias || !output || !ignition || neuro.length < 3) return;
    const [r1, r2, r3] = neuro;
    const pattern = patterns.find(
      (p) =>
        p.rank1 === r1 &&
        p.rank2 === r2 &&
        p.rank3 === r3 &&
        p.bias_type === bias &&
        p.output_level === output &&
        p.ignition === ignition &&
        p.time_character === tc
    );
    if (pattern) {
      router.push(`/result/${pattern.pattern_id}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      {STEP_LABELS[step] && (
        <div className="fixed top-4 right-4 text-xs text-gray-600 tracking-widest z-50">
          {STEP_LABELS[step]}
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
            5つの問いに答えよ。考えるな。感じろ。
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
                  setBias(opt.value);
                  setStep('output');
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

      {step === 'output' && (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 py-16">
          <p className="text-xs text-gray-500 mb-2 tracking-widest text-center">出力スタイル</p>
          <h3 className="text-lg font-bold mb-8 text-center">あなたの出力は？</h3>
          <div className="w-full max-w-sm space-y-3">
            {OUTPUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setOutput(opt.value);
                  setStep('ignition');
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

      {step === 'ignition' && (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 py-16">
          <p className="text-xs text-gray-500 mb-2 tracking-widest text-center">発動</p>
          <h3 className="text-lg font-bold mb-8 text-center">火のつき方は？</h3>
          <div className="w-full max-w-sm space-y-3">
            {IGNITION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setIgnition(opt.value);
                  setStep('time');
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

      {step === 'time' && (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 py-16">
          <p className="text-xs text-gray-500 mb-2 tracking-widest text-center">時間特性</p>
          <h3 className="text-lg font-bold mb-8 text-center">立ち上がり方は？</h3>
          <div className="w-full max-w-sm space-y-3">
            {TIME_OPTIONS.map((opt) => (
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
