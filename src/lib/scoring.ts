import questionsData from '@/data/diagnosis-questions.json';

type Question = (typeof questionsData)[number];

interface Scores {
  D: number;
  S: number;
  O: number;
  N: number;
  E: number;
  concentration: number;
  ignition: number;
  timing: number;
  output: number;
}

export type BiasType = 'Single' | 'Dual' | 'Trinity' | 'Flat';

export interface DiagnosisResult {
  nameId: string;
  rank1: string;
  rank2: string;
  rank3: string;
  bias: BiasType;
  ignition: '外燃' | '内燃';
  timing: '瞬発' | '熟成';
  output: '高' | '中' | '低';
  scores: { D: number; S: number; O: number; N: number; E: number };
}

export function calculateResult(
  answers: Record<string, string>,
  questions: Question[]
): DiagnosisResult {
  const scores: Scores = {
    D: 0, S: 0, O: 0, N: 0, E: 0,
    concentration: 0, ignition: 0, timing: 0, output: 0,
  };

  for (const [qId, choiceId] of Object.entries(answers)) {
    const question = questions.find((q) => q.id === qId);
    const choice = question?.choices.find((c) => c.id === choiceId);
    if (!choice) continue;
    for (const [key, value] of Object.entries(choice.score as Record<string, number>)) {
      const k = key as keyof Scores;
      scores[k] = (scores[k] ?? 0) + value;
    }
  }

  // 神経系スコアを降順ソート → rank1/2/3 決定
  const neuro = (['D', 'S', 'O', 'N', 'E'] as const)
    .map((code) => ({ code, score: scores[code] }))
    .sort((a, b) => b.score - a.score);

  const rank1 = neuro[0].code;
  const rank2 = neuro[1].code;
  const rank3 = neuro[2].code;

  // concentration スコアで偏りタイプを判定
  // Q11-Q18: 5問（スコア±3〜±4）= 最大±16 の範囲
  const c = scores.concentration;
  let bias: BiasType;
  if (c >= 10) bias = 'Single';
  else if (c >= 2) bias = 'Dual';
  else if (c >= -6) bias = 'Trinity';
  else bias = 'Flat';

  const ignition = scores.ignition >= 0 ? '外燃' : '内燃';
  const timing = scores.timing >= 0 ? '瞬発' : '熟成';
  const output: '高' | '中' | '低' =
    scores.output >= 4 ? '高' : scores.output <= -4 ? '低' : '中';

  const nameId = `${rank1}-${rank2}-${rank3}-${bias}`;

  return {
    nameId, rank1, rank2, rank3, bias, ignition, timing, output,
    scores: { D: scores.D, S: scores.S, O: scores.O, N: scores.N, E: scores.E },
  };
}
