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
  // v2: 後天的スコア
  self_esteem: number;
  attachment: number;
  exp_study: number;
  exp_social: number;
  exp_physical: number;
  exp_creative: number;
  exp_adventure: number;
  talent_physical: number;
  talent_intuitive: number;
  talent_logical: number;
  talent_dexterity: number;
  talent_verbal: number;
  env_affluence: number;
  env_health: number;
}

export type BiasType = 'Single' | 'Dual' | 'Trinity' | 'Flat';

export interface Layer2Scores {
  selfEsteem: number;
  attachment: number;
}

export interface Layer3Scores {
  study: number;
  social: number;
  physical: number;
  creative: number;
  adventure: number;
}

export interface Layer4Scores {
  physical: number;
  intuitive: number;
  logical: number;
  dexterity: number;
  verbal: number;
}

export interface Layer5Scores {
  affluence: number;
  health: number;
}

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
  // v2: 5層モデル
  layer2: Layer2Scores;
  layer3: Layer3Scores;
  layer4: Layer4Scores;
  layer5: Layer5Scores;
}

export function calculateResult(
  answers: Record<string, string>,
  questions: Question[]
): DiagnosisResult {
  const scores: Scores = {
    D: 0, S: 0, O: 0, N: 0, E: 0,
    concentration: 0, ignition: 0, timing: 0, output: 0,
    self_esteem: 0, attachment: 0,
    exp_study: 0, exp_social: 0, exp_physical: 0, exp_creative: 0, exp_adventure: 0,
    talent_physical: 0, talent_intuitive: 0, talent_logical: 0, talent_dexterity: 0, talent_verbal: 0,
    env_affluence: 0, env_health: 0,
  };

  for (const [qId, choiceId] of Object.entries(answers)) {
    const question = questions.find((q) => q.id === qId);
    const choice = question?.choices.find((c) => c.id === choiceId);
    if (!choice) continue;
    for (const [key, value] of Object.entries(choice.score as Record<string, number>)) {
      const k = key as keyof Scores;
      if (k in scores) {
        scores[k] = (scores[k] ?? 0) + value;
      }
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
    layer2: {
      selfEsteem: scores.self_esteem,
      attachment: scores.attachment,
    },
    layer3: {
      study: scores.exp_study,
      social: scores.exp_social,
      physical: scores.exp_physical,
      creative: scores.exp_creative,
      adventure: scores.exp_adventure,
    },
    layer4: {
      physical: scores.talent_physical,
      intuitive: scores.talent_intuitive,
      logical: scores.talent_logical,
      dexterity: scores.talent_dexterity,
      verbal: scores.talent_verbal,
    },
    layer5: {
      affluence: scores.env_affluence,
      health: scores.env_health,
    },
  };
}
