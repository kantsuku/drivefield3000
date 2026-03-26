import namesData from '@/data/names-240.json';
import kataData from '@/data/l4-kata.json';
import patternsData from '@/data/patterns-2880.json';
import interpData from '@/data/interpretations-2880.json';
import dictionariesData from '@/data/dictionaries.json';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AboutMenu } from '@/components/AboutMenu';
import { ActionMenu } from '@/components/ActionMenu';
import { AiConsultSection } from '@/components/AiConsultSection';
import { Sparkles, AlertTriangle, Wrench, Briefcase, Home, RefreshCw, Flame, Clock, Zap, Activity, Rocket, Users, Coffee, CheckCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────

interface NameEntry { id: string; pattern_id: number; kanji_name: string; reading: string; english_name: string; naming_reason: string; lead?: string; }
interface PatternEntry { pattern_id: number; core_code: string; rank1: string; rank2: string; rank3: string; bias_type: string; output_level: string; ignition: string; ignition_label: string; ignition_desc: string; time_character: string; time_character_label: string; time_character_desc: string; drive_structure: string; trigger_core: string; accelerator_core: string; sustain_core: string; bias_interpretation: string; output_interpretation: string; awakening_condition: string; drain_condition: string; recovery_condition: string; field_name_kanji: string; field_name_reading: string; field_name_en: string; interpretation: string; }
interface InterpEntry { pattern_id: number; structural_interpretation: string; symbolic_image: string; texture_keywords: string[]; trigger: string; accelerator: string; sustain: string; breakdown: string; recovery: string; awakened_vibe: string; }
interface KataEntry { id: string; rank1: string; bias: string; name: string; reading: string; }

// ─── Lookups ──────────────────────────────────────────

const namesMap: Record<string, NameEntry> = {};
for (const n of namesData as NameEntry[]) namesMap[n.id] = n;

const kataMap: Record<string, KataEntry> = {};
for (const k of kataData as KataEntry[]) kataMap[k.id] = k;

const patterns = patternsData as PatternEntry[];

const interpMap: Record<number, InterpEntry> = {};
for (const r of interpData as InterpEntry[]) interpMap[r.pattern_id] = r;

const neuroDict: Record<string, { jp: string; desc: string }> = {};
const biasDict: Record<string, string> = {};
for (const d of dictionariesData) {
  if (d.Category === 'Neuro') neuroDict[d.Code] = { jp: d.Label_JP, desc: d.Description };
  if (d.Category === 'Bias') biasDict[d.Code] = d.Description;
}

// ─── Helpers ──────────────────────────────────────────

const NEURO_LABELS: Record<string, { jp: string; color: string; gradient: string; gradientDark: string }> = {
  D: { jp: 'ドーパミン', color: '#c0392b', gradient: 'radial-gradient(circle, #922b21, transparent 65%)', gradientDark: 'radial-gradient(circle, #641e16, transparent 65%)' },
  S: { jp: 'セロトニン', color: '#2e6b8a', gradient: 'radial-gradient(circle, #1a4d6b, transparent 65%)', gradientDark: 'radial-gradient(circle, #0e3347, transparent 65%)' },
  O: { jp: 'オキシトシン', color: '#27806a', gradient: 'radial-gradient(circle, #1a5c4b, transparent 65%)', gradientDark: 'radial-gradient(circle, #0f3d32, transparent 65%)' },
  N: { jp: 'ノルアドレナリン', color: '#b8860b', gradient: 'radial-gradient(circle, #8b6914, transparent 65%)', gradientDark: 'radial-gradient(circle, #5c4510, transparent 65%)' },
  E: { jp: 'エンドルフィン', color: '#7b5ea7', gradient: 'radial-gradient(circle, #5b3d8f, transparent 65%)', gradientDark: 'radial-gradient(circle, #3d2766, transparent 65%)' },
};

const BIAS_STYLE: Record<string, { trait: string; strength: string; risk: string }> = {
  Single: { trait: '1位の神経系に極端にエネルギーが集中する一点突破型', strength: 'ハマったときの爆発力は全型中最高で、1位の衝動が全てを貫く圧倒的な推進力を持つ', risk: 'その反面、1位の欲求が満たされない環境では急速に失速し、他の神経系では代替が効きにくい' },
  Dual: { trait: '1位と2位の神経系が強く連動する二軸駆動型', strength: '2つの衝動が掛け算で回るため「らしさ」が最も出やすく、安定した推進力と個性の両立を実現する', risk: '2軸の間で優先順位が揺れると内部葛藤が生じやすく、どちらを優先すべきか迷う瞬間がある' },
  Trinity: { trait: '上位3つの神経系がバランスよく機能する三位一体型', strength: '3つの回路が同時に回ると深い没入状態に入り、複雑な課題ほど真価を発揮する', risk: '覚醒条件が3つ同時に揃う必要があるため起動が重く、エンジンがかかるまでに時間を要する' },
  Flat: { trait: '5つの神経系が比較的均等に分布する万能拡散型', strength: 'どんな環境にも適応できる柔軟性を持ち、多様な刺激から少しずつエネルギーを引き出せる', risk: '突出した衝動がないため「これだ」という起動トリガーが曖昧になりやすく、器用貧乏に陥るリスクがある' },
};

const BIAS_JP: Record<string, string> = {
  Single: '一点突破型',
  Dual: '二軸駆動型',
  Trinity: '三位一体型',
  Flat: '万能拡散型',
};

const OUTPUT_JP: Record<string, string> = {
  Light: '低出力',
  Middle: '中出力',
  Over: '高出力',
};

function buildKataDescription(rank1: string, rank2: string, rank3: string, bias: string): string {
  const n1 = neuroDict[rank1], n2 = neuroDict[rank2], n3 = neuroDict[rank3], b = BIAS_STYLE[bias];
  if (!n1 || !n2 || !n3 || !b) return '';
  return `この型は、${n1.jp}（${n1.desc}）を最上位に持ち、${n2.jp}（${n2.desc}）が加速装置、${n3.jp}（${n3.desc}）が循環装置として機能する${b.trait}の骨格である。${b.strength}。${b.risk}。この3つの神経系の優先順位と偏りの組み合わせが、あなたの「動き方の癖」そのものを形作っている。これは性格ではなく「駆動構造」——あなたが夢中になれる条件の設計図だ。`;
}

function findPattern(coreCode: string, bias: string, ig: string | null, tm: string | null, out: string | null): PatternEntry | undefined {
  const ignitionMap: Record<string, string> = { '外燃': 'external', '内燃': 'internal' };
  const timingMap: Record<string, string> = { '瞬発': 'burst', '熟成': 'mature' };
  const outputMap: Record<string, string> = { '低': 'Light', '中': 'Middle', '高': 'Over' };
  if (ig && tm && out) {
    return patterns.find((p) => p.core_code === coreCode && p.bias_type === bias && p.ignition === (ignitionMap[ig] || ig) && p.time_character === (timingMap[tm] || tm) && p.output_level === (outputMap[out] || out));
  }
  return patterns.find((p) => p.core_code === coreCode && p.bias_type === bias);
}

// ─── アドバイス生成 ──────────────────────────────────

const WORK_ADVICE: Record<string, { trigger: string; accelerator: string; sustain: string; awakening: string; drain: string; recovery: string }> = {
  D: {
    trigger: '新規プロジェクトや未知の領域への挑戦を積極的に引き受けよう。ルーティンワークが続いたら、自ら企画を立ち上げるのが吉。',
    accelerator: '仮説検証のサイクルを短く回せる環境を選べ。小さく試して早く結果を見ることで加速する。',
    sustain: 'プロジェクトの「次の展開」を常に視界に入れておくこと。ゴールが見えると失速する。次の地平を用意せよ。',
    awakening: '裁量権のあるポジションで、未踏の課題に取り組んでいるとき。「誰もやったことがない」が最大の燃料。',
    drain: '変化のない定型業務、マニュアル通りの反復、意思決定権のない状態が続くと急速に枯渇する。',
    recovery: 'まず小さな「新しいこと」を一つ始めよ。新しいツール、新しい手法、新しい人との会話。小さな刺激が再起動のスイッチになる。',
  },
  S: {
    trigger: '情報を整理し、構造化する仕事を引き受けよう。混沌としたプロジェクトに秩序を持ち込む役割が天職。',
    accelerator: 'ドキュメントやフレームワークを整備する時間を確保せよ。「見通しが立つ」感覚が最大の加速装置。',
    sustain: '定期的な振り返りと改善のサイクルを回すこと。PDCAが回っている実感が持続力になる。',
    awakening: '複雑な問題の構造が見えた瞬間、全体を俯瞰して最適解を導き出せる状態。静かだが最も深い集中。',
    drain: '論理が通らない意思決定、場当たり的な方針転換、根拠なき精神論に長時間さらされると消耗する。',
    recovery: '一人で静かに情報を整理する時間を確保せよ。ノートに書き出す、マインドマップを描く、構造化する行為そのものが回復になる。',
  },
  O: {
    trigger: 'チームで取り組む仕事、顧客と直接関わる仕事を選べ。「誰かのために」が最大のエンジン。',
    accelerator: '信頼できるチームメンバーとの関係構築に時間を使え。心理的安全性が確保されると一気に加速する。',
    sustain: '定期的なフィードバックと感謝の交換を仕組み化せよ。1on1、チーム振り返り、感謝の場が燃料になる。',
    awakening: 'チーム全体が同じ方向を向き、互いを信頼して動いている状態。全員の力が掛け算になる瞬間。',
    drain: '孤立した作業、競争的な環境、人間関係の対立が放置された状態が続くと深刻に消耗する。',
    recovery: '信頼できる人と率直に話す時間を作れ。業務の話でなくていい。「聴いてもらえた」感覚が回復の起点になる。',
  },
  N: {
    trigger: '締切や高い基準が明確に設定された環境で力を発揮する。適度なプレッシャーを自ら設定せよ。',
    accelerator: '集中できる環境を死守せよ。通知オフ、ブロック時間の確保、没頭できる空間が加速装置。',
    sustain: '達成した小さな成果を可視化すること。チェックリスト、進捗グラフ、完了の儀式が持続力になる。',
    awakening: '高い集中状態で、困難な課題に全神経を注いでいるとき。周囲の音が消え、時間の感覚がなくなる瞬間。',
    drain: '緊張感のない環境、曖昧な目標、中途半端な状態が続くと集中力が拡散して消耗する。',
    recovery: '明確で達成可能な小さなタスクを一つ完了させよ。「やり切った」感覚が集中力を取り戻すトリガーになる。',
  },
  E: {
    trigger: '自分が心から楽しめる要素がある仕事を選べ。「面白い」と感じられるかどうかが全ての起点。',
    accelerator: '没頭できる環境と十分な時間を確保せよ。中断されない長い作業時間がフロー状態への入口。',
    sustain: '成果物の質にこだわり続けること。「もっと良くできる」という探求心そのものが燃料になる。',
    awakening: '好きなことに完全に没頭し、時間を忘れている状態。質へのこだわりが極限まで研ぎ澄まされる瞬間。',
    drain: '興味のない作業、質より量を求められる環境、表面的な成果だけが評価される状態が続くと枯渇する。',
    recovery: '純粋に楽しめることに短時間でも没頭せよ。仕事と関係なくていい。「楽しい」の感覚を取り戻すことが最優先。',
  },
};

const LIFE_ADVICE: Record<string, { trigger: string; accelerator: string; sustain: string; awakening: string; drain: string; recovery: string }> = {
  D: {
    trigger: '休日に「行ったことのない場所」「やったことのないこと」を一つ入れよ。旅行、新しい趣味、知らない店。',
    accelerator: '興味を持ったことはすぐに試してみること。「いつかやろう」ではなく「今週末やる」。スピード感が加速の鍵。',
    sustain: '日常に小さな冒険を仕込み続けること。通勤ルートを変える、知らないジャンルの本を読む、新しい人と話す。',
    awakening: '未知の体験に飛び込み、興奮と発見が連鎖している状態。「次は何だ」と目が輝いている瞬間。',
    drain: '同じ日常の繰り返し、変化のない人間関係、新しい刺激が一切ない生活が続くと生気を失う。',
    recovery: 'まず「外に出る」こと。新しい場所、新しい景色、新しい空気。物理的な環境変化が最も効く。',
  },
  S: {
    trigger: '知的好奇心を満たす時間を確保せよ。読書、学習、考察の時間が生活の質を決定的に変える。',
    accelerator: '学んだことをノートやメモに整理する時間を作れ。「分かった」感覚を言語化することで理解が加速する。',
    sustain: '生活リズムの安定と、思考を整理する習慣を持つこと。日記、瞑想、散歩しながらの内省が燃料になる。',
    awakening: '複雑な問題の本質が見えた瞬間、知識が繋がって新しい理解が生まれる瞬間。静かで深い充実感。',
    drain: '無秩序な生活、計画が立てられない状態、理不尽な出来事の連続が続くと精神的に疲弊する。',
    recovery: '生活の一部を整理整頓せよ。部屋、スケジュール、思考——何でもいい。「整った」感覚が安定の起点になる。',
  },
  O: {
    trigger: '大切な人との質の高い時間を優先的に確保せよ。量より深さ。心を開ける相手との対話が最大の燃料。',
    accelerator: '誰かと一緒に何かをする体験を増やせ。一緒に料理する、散歩する、映画を観る。共有体験が加速装置になる。',
    sustain: '定期的に「一緒にいて心地いい人」と過ごす時間を仕組み化すること。月一の食事会、週末の散歩、何でもいい。',
    awakening: '深い信頼関係の中で、互いに支え合っていると実感できる瞬間。一人では到達できない温かさ。',
    drain: '孤独な時間が長すぎる、表面的な人間関係しかない、大切な人との関係が悪化している状態が続くと深刻。',
    recovery: '一人で抱え込まず、信頼できる人に「助けて」と言え。弱さを見せることは回復の第一歩。',
  },
  N: {
    trigger: '目標を設定し、それに向かって計画的に動く時間を作れ。資格取得、トレーニング、スキルアップ。',
    accelerator: '自分との約束を守る仕組みを作れ。締切を決める、人に宣言する、記録をつける。適度なプレッシャーが加速を生む。',
    sustain: '日々の小さな達成を記録すること。習慣トラッカー、トレーニングログ、学習記録が持続力になる。',
    awakening: '全神経を研ぎ澄まして、困難な課題に立ち向かっている瞬間。スポーツ、ゲーム、知的挑戦の最中。',
    drain: '目標のない漫然とした日常、だらだらと過ぎる時間、緊張感のない生活が続くと気力を失う。',
    recovery: '体を動かせ。ランニング、筋トレ、何でもいい。身体的な緊張と集中が精神を引き戻す。',
  },
  E: {
    trigger: '「好き」「心地いい」と感じることに罪悪感なく時間を使え。趣味、芸術鑑賞、美味しい食事。',
    accelerator: '好きなことに没頭できる「中断されない時間」を確保せよ。30分でもいい。邪魔が入らない集中タイムが没入を深める。',
    sustain: '日常の中に「味わう」時間を意識的に作ること。急がない食事、好きな音楽、丁寧な暮らし。',
    awakening: '好きなことに完全に没入し、外界が消えている瞬間。創作、鑑賞、体験の中に溶けている状態。',
    drain: '楽しみのない義務ばかりの生活、感性を否定される環境、効率だけが求められる日常が続くと枯渇する。',
    recovery: '五感を刺激せよ。美しい景色、好きな音楽、美味しいもの。頭ではなく体で「いい」と感じることが回復の起点。',
  },
};

// ─── 人物像テキスト生成 ──────────────────────────────

const NEURO_WORK_STYLE: Record<string, string> = {
  D: 'まだ誰もやっていないこと、前例のない課題に取り組んでいるとき、最もパフォーマンスが上がる。アイデアの量が多く、着手が速い。ただし同じ作業の反復は苦手で、新鮮さが失われると急速にモチベーションが下がる傾向がある。',
  S: '情報を構造化し、複雑な問題をシンプルに整理する力に秀でている。計画を立て、手順を最適化し、全体の見通しを示す役割で真価を発揮する。ただし、論理が通らない環境や場当たり的な進行には強いストレスを感じやすい。',
  O: 'チームワークを通じて最大の力を発揮する。メンバーの気持ちを汲み取り、信頼関係を築くことで、個人では到達できない成果を引き出す。ただし、孤立した環境や競争的な文化の中では力が出にくい。',
  N: '明確な目標と適度なプレッシャーがある環境で最も集中力が高まる。困難な課題に全神経を注ぎ込み、周囲が驚くような成果を出すことがある。ただし、目標が曖昧な状態や緊張感のない環境では力を持て余しやすい。',
  E: '自分が心から面白いと感じる仕事に出会ったとき、時間を忘れて没頭し、質の高い成果を生み出す。こだわりの強さが武器になる。ただし、興味のない仕事を強いられると著しくパフォーマンスが落ちる。',
};

const NEURO_RELATIONSHIP: Record<string, string> = {
  D: '好奇心旺盛で、新しい出会いや刺激的な会話を好む。一緒にいると「面白そうなこと」が次々と生まれるが、深い関係を維持するには意識的な努力が必要になることもある。パートナーには「一緒に冒険できる人」を求める傾向がある。',
  S: '信頼できる少数の人と深い関係を築くことを好む。表面的な付き合いより、知的な対話や価値観の共有を重視する。パートナーには「互いの考えを尊重し合える人」を求める傾向がある。',
  O: '人との繋がりそのものがエネルギー源。相手の感情に敏感で、自然と周囲の人を支える役割を担うことが多い。ただし、相手に尽くしすぎて自分を見失うことがある。パートナーには「安心して素の自分でいられる人」を求める。',
  N: '信頼関係を築くまでに時間がかかるが、一度認めた相手には非常に誠実。互いに高め合える関係を重視する。パートナーには「自分の挑戦を理解し、支えてくれる人」を求める傾向がある。',
  E: '感性が合う人との関係を深く大切にする。一緒にいて「心地いい」と感じられるかどうかが全ての判断基準。パートナーには「同じものに感動できる人」を求める傾向がある。',
};

const NEURO_DAILY: Record<string, string> = {
  D: '日常に変化がないと息苦しくなる。通勤ルートを変える、知らない店に入る、新しいことを試す——小さな冒険の積み重ねが生活の質を決定的に左右する。「同じ毎日」が最大の敵だと心得よ。',
  S: '生活にリズムと秩序があるほど安定する。朝のルーティン、整理された空間、計画的な時間の使い方が精神の土台になる。逆に、無秩序な環境にいると気づかぬうちに消耗していく。',
  O: '大切な人との時間が生活の軸になる。一人で過ごす時間が長すぎると、理由なく不安になったり活力を失ったりする。意識的に「人と過ごす時間」をスケジュールに入れることが重要。',
  N: '何かに挑戦し続けている状態が最も生き生きする。目標のない漫然とした日々を送ると、次第にエネルギーが枯渇していく。小さくてもいいので、常に「次の挑戦」を持っておくこと。',
  E: '五感を満たす体験を日常に組み込むことが重要。美味しい食事、好きな音楽、美しい景色——効率では測れない「味わう時間」が、あなたのエネルギーの源泉になっている。',
};

const IGNITION_STYLE: Record<string, string> = {
  external: 'あなたの火は「外」から点く。新しい人との出会い、環境の変化、予想外の出来事——外部からの刺激がスイッチになる。つまり、同じ環境に閉じこもっていると点火が起きにくい。意識的に外の世界と接点を作ることが重要だ。',
  internal: 'あなたの火は「内」から点く。自分の中で湧き上がる衝動、納得感、ビジョンが起動のスイッチになる。外からの刺激より、内なる声に従った方がうまくいく。「なぜそれをやりたいのか」を自分に問いかける時間が必要だ。',
};

const TIMING_STYLE: Record<string, string> = {
  burst: 'エンジンがかかるのが速い。新しい環境や刺激に触れると、すぐに動き出せる。その反面、持続力が課題になりやすい。短期集中で成果を出し、休息を挟んでまた次へ——というリズムが合っている。長期プロジェクトでは、マイルストーンを細かく切って「小さな瞬発」を繰り返すのがコツだ。',
  mature: 'エンジンがかかるまでに時間がかかる。最初はゆっくりだが、一度回り始めると深く安定した推進力を発揮する。周囲から「遅い」と見られることがあるが、そこで焦ってはいけない。あなたの本領は、十分に温まった後にやってくる。助走期間を確保し、自分のペースを守ることが最も重要だ。',
};

function buildPersonProfile(rank1: string, rank2: string, rank3: string, bias: string, ignition: string, timing: string): {
  workStyle: string; relationship: string; daily: string; ignitionStyle: string; timingStyle: string; comboInsight: string;
} {
  const n1 = neuroDict[rank1], n2 = neuroDict[rank2], n3 = neuroDict[rank3];
  const comboInsight = n1 && n2 && n3
    ? `あなたの駆動は、${n1.jp}の「${n1.desc}」を原動力に、${n2.jp}の「${n2.desc}」で形を整え、${n3.jp}の「${n3.desc}」で回し続ける構造になっている。この組み合わせは、${
        rank1 === 'D' && rank2 === 'S' ? '創造的なアイデアを論理的に実装できる稀有なバランスを持つ' :
        rank1 === 'D' && rank2 === 'E' ? '興奮と没入が掛け合わさり、好きなことに爆発的なエネルギーを注げる' :
        rank1 === 'D' && rank2 === 'O' ? '新しい挑戦を人と共に進める力があり、チームに熱量を注入できる' :
        rank1 === 'D' && rank2 === 'N' ? '挑戦と集中が噛み合い、困難な課題に果敢に飛び込める' :
        rank1 === 'S' && rank2 === 'D' ? '秩序の中に革新を持ち込める——既存の仕組みを壊さずに進化させる力がある' :
        rank1 === 'S' && rank2 === 'O' ? '論理と共感の両方を持ち、チームの知恵を構造化するファシリテーターになれる' :
        rank1 === 'S' && rank2 === 'N' ? '分析力と集中力が噛み合い、複雑な問題を粘り強く解き明かせる' :
        rank1 === 'S' && rank2 === 'E' ? '理解と没入が組み合わさり、深い専門性を楽しみながら築ける' :
        rank1 === 'O' && rank2 === 'D' ? '人との繋がりの中から新しい可能性を発見し、共感をエンジンに革新を起こせる' :
        rank1 === 'O' && rank2 === 'S' ? '人の気持ちを理解しながら、それを仕組みや秩序に変換できる架け橋になれる' :
        rank1 === 'O' && rank2 === 'N' ? '共感と集中が融合し、大切な人のために全力を注ぐ強靭な献身性を持つ' :
        rank1 === 'O' && rank2 === 'E' ? '心の通った体験を生み出す力があり、人を感動させるクリエイティビティを持つ' :
        rank1 === 'N' && rank2 === 'D' ? '集中力と冒険心が組み合わさり、ハイリスクな挑戦にも冷静に取り組める' :
        rank1 === 'N' && rank2 === 'S' ? '集中と分析が融合し、極限状態でも正確な判断を下せるクールな実行者になれる' :
        rank1 === 'N' && rank2 === 'O' ? '集中力を人のために使える——チームの危機に最も頼りになる存在になり得る' :
        rank1 === 'N' && rank2 === 'E' ? '集中と没入の相乗効果で、ゾーン状態に入りやすく、驚異的な成果を出す瞬間がある' :
        rank1 === 'E' && rank2 === 'D' ? '快感と好奇心が融合し、楽しいことを見つける嗅覚と、それに全力で没頭する力を兼ね備える' :
        rank1 === 'E' && rank2 === 'S' ? '美的感覚と論理が共存し、感性に裏付けされた精緻な仕事ができる' :
        rank1 === 'E' && rank2 === 'O' ? '心地よい空間や体験を人と共有することで、何倍もの喜びに変える力がある' :
        rank1 === 'E' && rank2 === 'N' ? '没入と集中の掛け算で、一つのことを極限まで極めるクラフトマンシップを持つ' :
        '独自のバランスでエネルギーを回す構造を持つ'
      }。ただし、3位の${n3.jp}が弱る環境では循環が途切れやすいことに注意せよ。`
    : '';

  return {
    workStyle: NEURO_WORK_STYLE[rank1] || '',
    relationship: NEURO_RELATIONSHIP[rank1] || '',
    daily: NEURO_DAILY[rank1] || '',
    ignitionStyle: IGNITION_STYLE[ignition] || IGNITION_STYLE['external'],
    timingStyle: TIMING_STYLE[timing] || TIMING_STYLE['burst'],
    comboInsight,
  };
}

// ─── 覚醒・ドレイン・回復の複合アドバイス生成 ─────────

function buildAwakeningAdvice(r1: string, r2: string, r3: string, bias: string, ignition: string, timing: string) {
  const n1 = neuroDict[r1], n2 = neuroDict[r2], n3 = neuroDict[r3];
  if (!n1 || !n2 || !n3) return { work: '', life: '', daily: '' };

  const ignExt = ignition === 'external';
  const isBurst = timing === 'burst';

  const work = `あなたが仕事で覚醒するには、まず${n1.jp}が求める「${n1.desc}」が満たされる環境を選ぶことが大前提だ。${
    ignExt ? '外からの刺激——新しいプロジェクト、初対面のクライアント、未経験の領域——がスイッチになる。自分から動くより「巻き込まれる」方が点火しやすい。' :
    '自分の内側から湧き上がる「これだ」という確信が必要だ。他人に言われて動くより、自分で意味を見出したときに初めて本気になれる。'
  }${
    isBurst ? 'エンジンがかかったら一気に走れ。短期集中で成果を出すスタイルがあなたに合っている。会議よりも「やる時間」を確保することが覚醒の鍵だ。' :
    'ただし、すぐには全開にならない。最初の助走期間を周囲に理解してもらうことが重要だ。「まだ本気出してない」のではなく「温まっている最中」であることを自覚し、焦らないこと。'
  }そこに${n2.jp}の「${n2.desc}」が加わると加速し、さらに${n3.jp}の「${n3.desc}」が循環装置として回り始めると、あなたの疾走領域は全開になる。${
    bias === 'Single' ? '一点突破型のあなたは、1位の衝動に全てを賭けられる環境が最重要。分散するタスクは覚醒を妨げる。' :
    bias === 'Dual' ? '二軸駆動型のあなたは、1位と2位の両方が同時に満たされる仕事を見つけることが覚醒の近道だ。どちらか一方だけでは物足りなさを感じるはず。' :
    bias === 'Trinity' ? '三位一体型のあなたは覚醒条件が複雑だが、3つが揃ったときの推進力は圧倒的だ。環境を整えるのに時間がかかることを受け入れ、焦らず条件を揃えていけ。' :
    '万能拡散型のあなたは、多様な刺激がある環境で覚醒しやすい。一つに絞るより、複数の活動を並行させることで各神経系がバランスよく回り始める。'
  }`;

  const life = `プライベートでの覚醒は、仕事とは異なるアプローチが有効だ。${n1.jp}を満たすには${
    r1 === 'D' ? '「行ったことのない場所」「やったことのないこと」を定期的に生活に入れること。旅行でなくてもいい——知らない路地に入る、新しいジャンルの映画を観る、初対面の人が集まるイベントに顔を出す。小さな「初めて」の積み重ねが、あなたの精神を活性化させる。' :
    r1 === 'S' ? '知的な深掘りの時間を確保すること。ずっと気になっていたテーマについて本を読む、ドキュメンタリーを観る、静かな場所で考えを巡らせる。「理解が深まった」という実感が、あなたの精神を最も満たす。' :
    r1 === 'O' ? '大切な人と過ごす「質の高い時間」を意識的に作ること。スマホを置いて向き合う食事、散歩しながらの会話、一緒に何かを作る体験。「繋がっている」実感があなたのエネルギー源だ。' :
    r1 === 'N' ? '自分に挑戦を課すこと。マラソンの記録を縮める、新しいスキルを習得する、難しいパズルを解く。「自分の限界を超えた」実感が、あなたの精神を最も燃え上がらせる。' :
    '五感を満たす体験に没頭すること。美術館で時間を忘れる、好きな音楽のライブに行く、手の込んだ料理を作る。「味わい尽くした」という充足感があなたのエネルギー源だ。'
  }${
    ignExt ? 'あなたは外部刺激で火が点くタイプだから、一人で家にこもりがちな生活は避けるべきだ。意識的に「外」に出る予定を入れよう。' :
    'あなたは内燃型だから、一人で過ごす質の高い時間も大切にせよ。ただし「孤独」と「一人の時間」は別物だ。充電のための孤独は積極的に確保し、消耗するだけの孤立は避けろ。'
  }`;

  const daily = `日常の中で覚醒状態を持続させるには、3つの神経系を「少しずつ、毎日」満たす仕組みが必要だ。${n1.jp}のために${
    r1 === 'D' ? '毎日一つ「小さな新しいこと」を試すルールを作れ。' :
    r1 === 'S' ? '毎日15分の「整理の時間」を確保せよ。' :
    r1 === 'O' ? '毎日一人以上と「意味のある会話」をする習慣を作れ。' :
    r1 === 'N' ? '毎日一つ「小さな目標」を達成するサイクルを回せ。' :
    '毎日「心地いい」と感じる時間を意識的に作れ。'
  }${n2.jp}のために${
    r2 === 'D' ? '週に一度は新しい情報や体験に触れる時間を確保し、' :
    r2 === 'S' ? '週末に一週間の振り返りと翌週の計画を立て、' :
    r2 === 'O' ? '週に一度は大切な人とゆっくり話す時間を設け、' :
    r2 === 'N' ? '週に一度はチャレンジングな活動に取り組み、' :
    '週に一度は好きなことにじっくり没頭する時間を確保し、'
  }${n3.jp}のために${
    r3 === 'D' ? '月に一度は全く新しい環境に身を置く体験をしよう。この3層構造が「日常の中の覚醒」を持続させる。' :
    r3 === 'S' ? '月に一度は学びを体系化するまとまった時間を取ろう。この3層構造が「日常の中の覚醒」を持続させる。' :
    r3 === 'O' ? '月に一度は深い対話や共同体験の機会を作ろう。この3層構造が「日常の中の覚醒」を持続させる。' :
    r3 === 'N' ? '月に一度は大きめの挑戦や目標に取り組もう。この3層構造が「日常の中の覚醒」を持続させる。' :
    '月に一度は特別な体験——旅行、イベント、新しい趣味——を入れよう。この3層構造が「日常の中の覚醒」を持続させる。'
  }`;

  return { work, life, daily };
}

// ─── Radar Chart ──────────────────────────────────────

// ─── グラデーションblob生成（型ごとに異なる形状） ─────

interface BlobConfig {
  width: string; height: string; top?: string; bottom?: string; left?: string; right?: string;
  gradient: string; blur: string; animation: string; opacity?: number;
}

function generateBlobs(rank1: string, bias: string, gradients: { main: string; dark: string }, rank2?: string, rank3?: string): { blobs: BlobConfig[]; edges: EdgeConfig[]; baseColor: string } {
  const mainColor = NEURO_LABELS[rank1]?.color || '#c0392b';
  const secondColor = NEURO_LABELS[rank2 || '']?.color || '#b8860b';
  const thirdColor = NEURO_LABELS[rank3 || '']?.color || '#2e6b8a';

  // 速度: D=速い N=やや速い E=遅い S=中 O=やや遅い
  const speed: Record<string, number> = { D: 8, S: 14, O: 16, N: 10, E: 20 };
  const s = speed[rank1] || 12;

  // エッジグラデ（角からの放射 — rank1/2/3の色を使い分け）
  const edges: EdgeConfig[] = [
    { position: '0 0', color: mainColor, animation: `edge-drift-1 ${s + 2}s ease-in-out infinite`, size: '80vmax' },
    { position: '100% 100%', color: secondColor, animation: `edge-drift-2 ${s + 4}s ease-in-out infinite`, size: '70vmax' },
    { position: '100% 0', color: thirdColor, animation: `edge-drift-3 ${s + 6}s ease-in-out infinite`, size: '50vmax' },
  ];

  // 偏りでblob構成を変える
  if (bias === 'Single') {
    return { baseColor: mainColor, edges, blobs: [
      { width: '100vmax', height: '100vmax', top: '-30%', left: '-20%', gradient: gradients.main, blur: 'blur(70px)', animation: `blob-drift-1 ${s}s ease-in-out infinite` },
      { width: '50vmax', height: '50vmax', bottom: '-10%', right: '10%', gradient: `radial-gradient(circle, ${secondColor}, transparent 65%)`, blur: 'blur(90px)', animation: `blob-drift-2 ${s + 6}s ease-in-out infinite`, opacity: 0.5 },
    ]};
  }
  if (bias === 'Dual') {
    return { baseColor: mainColor, edges, blobs: [
      { width: '75vmax', height: '75vmax', top: '-25%', left: '-15%', gradient: gradients.main, blur: 'blur(80px)', animation: `blob-drift-1 ${s}s ease-in-out infinite` },
      { width: '70vmax', height: '70vmax', bottom: '-20%', right: '-10%', gradient: `radial-gradient(circle, ${secondColor}, transparent 65%)`, blur: 'blur(80px)', animation: `blob-drift-2 ${s + 2}s ease-in-out infinite` },
      { width: '40vmax', height: '40vmax', top: '50%', left: '30%', gradient: `radial-gradient(circle, ${thirdColor}, transparent 65%)`, blur: 'blur(100px)', animation: `blob-drift-3 ${s + 8}s ease-in-out infinite reverse`, opacity: 0.3 },
    ]};
  }
  if (bias === 'Trinity') {
    return { baseColor: mainColor, edges, blobs: [
      { width: '60vmax', height: '60vmax', top: '-15%', left: '-10%', gradient: gradients.main, blur: 'blur(80px)', animation: `blob-drift-1 ${s}s ease-in-out infinite` },
      { width: '55vmax', height: '55vmax', bottom: '-20%', right: '-5%', gradient: gradients.dark, blur: 'blur(85px)', animation: `blob-drift-2 ${s + 3}s ease-in-out infinite` },
      { width: '55vmax', height: '55vmax', top: '25%', left: '35%', gradient: gradients.main.replace('transparent 65%', 'transparent 50%'), blur: 'blur(90px)', animation: `blob-drift-3 ${s + 6}s ease-in-out infinite` },
    ]};
  }
  // Flat
  return { baseColor: mainColor, edges, blobs: [
    { width: '50vmax', height: '50vmax', top: '-15%', left: '-10%', gradient: gradients.main, blur: 'blur(90px)', animation: `blob-drift-1 ${s}s ease-in-out infinite`, opacity: 0.8 },
    { width: '45vmax', height: '45vmax', bottom: '-15%', right: '-5%', gradient: gradients.dark, blur: 'blur(90px)', animation: `blob-drift-2 ${s + 2}s ease-in-out infinite`, opacity: 0.7 },
    { width: '40vmax', height: '40vmax', top: '30%', left: '40%', gradient: gradients.main.replace('transparent 65%', 'transparent 55%'), blur: 'blur(95px)', animation: `blob-drift-3 ${s + 4}s ease-in-out infinite`, opacity: 0.6 },
    { width: '35vmax', height: '35vmax', top: '60%', left: '-5%', gradient: gradients.dark, blur: 'blur(100px)', animation: `blob-drift-1 ${s + 8}s ease-in-out infinite reverse`, opacity: 0.5 },
  ]};
}

interface EdgeConfig {
  position: string; // CSS background position like "0 0" or "100% 100%"
  color: string;
  animation: string;
  size?: string;
}

function BlobBackground({ blobs, edges, baseColor }: { blobs: BlobConfig[]; edges?: EdgeConfig[]; baseColor?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* ベースのradial-gradient（エッジ効果） */}
      {baseColor && (
        <div className="absolute inset-0" style={{
          background: `radial-gradient(farthest-corner at 0 0, ${baseColor} 0%, ${baseColor} 40%, transparent 80%)`,
          opacity: 0.3,
        }} />
      )}
      {/* エッジグラデーション */}
      {edges?.map((e, i) => (
        <div key={`edge-${i}`} className="absolute inset-0" style={{
          background: `radial-gradient(${e.size || '80vmax'} at ${e.position}, ${e.color}40 0%, transparent 70%)`,
          animation: e.animation,
          filter: 'blur(40px)',
          opacity: 0.4,
        }} />
      ))}
      {/* 従来のblob */}
      {blobs.map((b, i) => (
        <div key={i} className="absolute" style={{
          width: b.width, height: b.height,
          top: b.top, bottom: b.bottom, left: b.left, right: b.right,
          borderRadius: '50%', background: b.gradient,
          filter: b.blur, animation: b.animation,
          opacity: b.opacity ?? 1,
        }} />
      ))}
    </div>
  );
}

function RadarChart({ scores }: { scores: Record<string, number> }) {
  const keys = ['D', 'S', 'O', 'N', 'E'];
  const maxScore = Math.max(...Object.values(scores), 1);
  const cx = 120, cy = 120, r = 90, levels = 4;
  const angleFor = (i: number) => (Math.PI * 2 * i) / keys.length - Math.PI / 2;
  const pointAt = (i: number, ratio: number) => {
    const a = angleFor(i);
    return { x: cx + r * ratio * Math.cos(a), y: cy + r * ratio * Math.sin(a) };
  };
  const gridPaths = Array.from({ length: levels }, (_, lv) => {
    const ratio = (lv + 1) / levels;
    const points = keys.map((_, i) => pointAt(i, ratio));
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  });
  const dataPoints = keys.map((k, i) => pointAt(i, Math.max(scores[k] || 0, 0) / maxScore));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // rank1の色でデータ塗りつぶし
  const r1Color = NEURO_LABELS[keys[0]]?.color || '#6b7280';

  return (
    <svg viewBox="-20 -10 280 280" className="w-full max-w-[240px]">
      {/* Grid */}
      {gridPaths.map((d, i) => <path key={i} d={d} fill="none" stroke="#e5e7eb" strokeWidth="1" />)}
      {/* Axes */}
      {keys.map((_, i) => { const p = pointAt(i, 1); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth="1" />; })}
      {/* Data fill + stroke */}
      <path d={dataPath} fill={`${r1Color}18`} stroke={r1Color} strokeWidth="2" />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill={NEURO_LABELS[keys[i]].color} />
          <circle cx={p.x} cy={p.y} r="3" fill="white" />
        </g>
      ))}
      {/* Labels with name */}
      {keys.map((k, i) => {
        const p = pointAt(i, 1.32);
        const nl = NEURO_LABELS[k];
        return (
          <g key={k}>
            <text x={p.x} y={p.y - 6} textAnchor="middle" dominantBaseline="middle" className="text-[12px] font-bold" fill={nl.color}>{k}</text>
            <text x={p.x} y={p.y + 7} textAnchor="middle" dominantBaseline="middle" className="text-[8px]" fill="#9ca3af">{nl.jp}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Section Components ───────────────────────────────

function Chapter({ id, num, title, en, children }: { id?: string; num: string; title: string; en?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="w-full mb-16 text-left scroll-mt-16">
      <div className="mb-8 border-b border-gray-200 pb-4 text-center">
        <span className="text-xs text-gray-400 tracking-wider">{num}</span>
        {en && <p className="text-3xl font-bold text-gray-200 tracking-wider mt-1">{en}</p>}
        <h2 className="text-lg font-bold text-gray-900 mt-1">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function AdviceCard({ icon, label, color, children }: { icon?: React.ReactNode; label: string; color: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 pl-4 mb-6" style={{ borderColor: color }}>
      <p className="text-[10px] tracking-wider mb-2 font-bold flex items-center gap-1.5" style={{ color }}>
        {icon}
        {label}
      </p>
      <div className="text-sm text-gray-700 leading-[1.9]">{children}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────

export default async function ResultPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const decodedId = decodeURIComponent(id);
  const entry = namesMap[decodedId];
  if (!entry) notFound();

  const parts = decodedId.split('-');
  const rank1 = parts[0];
  const bias = parts[3] ?? '';
  const coreCode = parts.slice(0, 3).join('-');
  const kata = kataMap[`${rank1}-${bias}`];

  const hasScores = sp.D !== undefined;
  const scores = hasScores
    ? { D: Number(sp.D) || 0, S: Number(sp.S) || 0, O: Number(sp.O) || 0, N: Number(sp.N) || 0, E: Number(sp.E) || 0 }
    : (() => {
        const allKeys = ['D', 'S', 'O', 'N', 'E'];
        const ranks = [parts[0], parts[1], parts[2]];
        const rest = allKeys.filter((k) => !ranks.includes(k));
        const biasScores: Record<string, number[]> = { Single: [85, 35, 20], Dual: [70, 60, 30], Trinity: [55, 50, 45], Flat: [45, 40, 38] };
        const top = biasScores[bias] || [55, 40, 30];
        const base: Record<string, number> = {};
        ranks.forEach((k, i) => { base[k] = top[i]; });
        rest.forEach((k, i) => { base[k] = i === 0 ? 15 : 12; });
        return base;
      })();

  const ignition = sp.ig || null;
  const timing = sp.tm || null;
  const output = sp.out || null;
  const pattern = findPattern(coreCode, bias, ignition, timing, output);

  // interpretationデータ取得
  const interp = pattern ? interpMap[pattern.pattern_id] : null;

  // 人物像データ
  const profile = buildPersonProfile(
    rank1, parts[1], parts[2], bias,
    pattern?.ignition || 'external',
    pattern?.time_character || 'burst',
  );

  // アドバイスデータ
  const workAdv = WORK_ADVICE[rank1];
  const lifeAdv = LIFE_ADVICE[rank1];

  // 複合アドバイス
  const awakeningAdvice = buildAwakeningAdvice(
    rank1, parts[1], parts[2], bias,
    pattern?.ignition || 'external',
    pattern?.time_character || 'burst',
  );

  const serif = { fontFamily: '"Noto Serif JP", "游明朝", YuMincho, serif' };

  return (
    <>
    {/* ハンバーガーメニュー */}
    <AboutMenu />


    {/* ═══ ヒーローゾーン（黒+グラデ） ═══ */}
    <section className="noise-overlay relative overflow-hidden border-b border-gray-200" style={{ backgroundColor: {
      D: '#8b2520',
      S: '#1a3a4a',
      O: '#1a3d32',
      N: '#3d3010',
      E: '#2d1f45',
    }[rank1] || '#8b2520' }}>
      {/* 型カラーうねうねグラデ背景（rank1+biasで動的生成） */}
      {(() => {
        const bg = generateBlobs(rank1, bias, { main: NEURO_LABELS[rank1]?.gradient, dark: NEURO_LABELS[rank1]?.gradientDark }, parts[1], parts[2]);
        return <BlobBackground blobs={bg.blobs} edges={bg.edges} baseColor={bg.baseColor} />;
      })()}

      <p
        className="absolute top-8 right-6 z-10 text-sm md:text-lg text-white font-bold tracking-[0.15em] leading-loose"
        style={{ writingMode: 'vertical-rl' }}
      >
        疾走領域 {entry.kanji_name}
      </p>

      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center px-6 py-16 text-center text-white">
        {kata && <p className="text-xl text-white tracking-[0.2em] mb-4" style={serif}>{kata.name}</p>}
        <h1 className="text-8xl font-bold tracking-wider mb-3" style={{ writingMode: 'vertical-rl', ...serif, letterSpacing: '0.3em' }}>
          {entry.kanji_name}
        </h1>
        <p className="text-sm text-white mt-3 mb-10">{entry.reading} / {entry.english_name}</p>

        <p className="text-xl text-white mb-8 tracking-wider leading-relaxed" style={{ fontFamily: '"Noto Serif JP", "游明朝", YuMincho, serif' }}>
          {(() => {
            const raw = entry.naming_reason
              .split('。')
              .filter((s) => !s.includes('優先漢字') && !s.includes('使用漢字'))
              .map((s) => s.trim())
              .filter(Boolean)[0] || '';
            // 「〜を、〜として表現」→後半だけ抽出、なければ「〜を〜として」の後を取る
            const match = raw.match(/[、。]([^、。]*$)/) || raw.match(/を[、]?(.+)/);
            return match ? match[1].replace(/として表現$/, '').replace(/を象徴$/, '').trim() : raw;
          })()}
        </p>

        {entry.lead && (
          <p className="text-sm text-white mb-6 leading-[1.9] text-left">{entry.lead}</p>
        )}

      </div>
    </section>

    {/* ═══ アンカーメニュー（sticky） ═══ */}
    <nav className="sticky top-0 z-40 bg-white">
      <div className="max-w-3xl mx-auto flex items-center gap-3 pl-16 md:pl-4 pr-4 py-2.5">
        <span className="text-[10px] text-gray-400 tracking-wider shrink-0 hidden md:inline">目次</span>
        <div className="overflow-x-auto flex gap-2 min-w-0">
          {[
            { href: '#sec-result', label: '診断結果' },
            { href: '#sec-type', label: 'あなたの型' },
            { href: '#sec-profile', label: 'あなたの人物像' },
            { href: '#sec-startup', label: '起動マニュアル' },
            { href: '#sec-awakening', label: '覚醒の条件' },
            { href: '#sec-drain', label: 'ドレイン警告' },
            { href: '#sec-recovery', label: '回復マニュアル' },
          ].map((item) => (
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

    {/* ═══ コンテンツゾーン（白背景） ═══ */}
    <main className="bg-white text-gray-900 min-h-screen pb-16 md:pb-0">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center px-6 py-12">

        {/* ═══ 第二章：診断結果 ═══ */}
        <Chapter id="sec-result" num="01" title="診断結果" en="DIAGNOSIS">
          {/* 神経系スコア（2カラム: 左レーダー / 右スコア） */}
          <p className="text-[10px] text-gray-400 leading-relaxed mb-4">本診断は科学的根拠に基づくものではなく、行動パターンから神経系の傾向を推測したものです。</p>
          <div className="w-full flex flex-col md:grid md:grid-cols-[auto_1fr] gap-4 mb-6 items-start">
            {/* 左: レーダー */}
            <div className="w-full md:w-auto flex justify-center">
              <RadarChart scores={scores} />
            </div>

            {/* 右: スコア縦並び（シンプル） */}
            <div className="w-full space-y-2 min-w-0">
              {(['D','S','O','N','E'] as const).map((k) => {
                const maxVal = Math.max(...Object.values(scores));
                const pct = maxVal > 0 ? (scores[k] / maxVal) * 100 : 0;
                return (
                  <div key={k} className="flex items-center gap-2">
                    <span className="text-xs font-bold w-4 shrink-0" style={{ color: NEURO_LABELS[k].color }}>{k}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5 mb-0.5">
                        <span className="text-xs text-gray-900">{NEURO_LABELS[k].jp}</span>
                        <span className="text-sm font-bold tabular-nums ml-auto" style={{ color: NEURO_LABELS[k].color }}>{scores[k]}</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: NEURO_LABELS[k].color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 神経系優先順位カード（1st/2nd/3rd + 解説） */}
          <h3 className="text-sm font-bold text-gray-900 mb-3">あなたの神経系優先順位</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {[
              { rank: '1st', code: parts[0], role: '点火', comment: 'あなたの最も強い駆動源。この衝動が全ての起点になります。' },
              { rank: '2nd', code: parts[1], role: '加速', comment: '2番目に強い神経系。点火した衝動を形にし、推進力を与えます。' },
              { rank: '3rd', code: parts[2], role: '持続', comment: '3番目の神経系。駆動を循環させ、走り続ける力を支えます。' },
            ].map((r) => {
              const desc = r.code === 'D' ? '新しいことへの好奇心、未知への挑戦、可能性を追い求める衝動。' :
                r.code === 'S' ? '物事を理解し、秩序立てて整理する力。論理と計画性。' :
                r.code === 'O' ? '人との繋がり、共感、信頼関係を築く力。' :
                r.code === 'N' ? '集中力と緊張感。プレッシャーの中で力を発揮する。' :
                '快感と没入。好きなことへの没頭力と感性。';
              return (
                <div key={r.rank} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 text-center">
                  <p className="text-2xl font-bold text-gray-200 mb-1">{r.rank}</p>
                  <p className="text-lg font-bold" style={{ color: NEURO_LABELS[r.code]?.color }}>{scores[r.code]}</p>
                  <p className="text-base font-bold mb-1" style={{ color: NEURO_LABELS[r.code]?.color }}>{neuroDict[r.code]?.jp}</p>
                  <p className="text-[10px] text-gray-500 mb-2">{neuroDict[r.code]?.desc}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full mb-2 inline-block" style={{ color: NEURO_LABELS[r.code]?.color, backgroundColor: `${NEURO_LABELS[r.code]?.color}15` }}>{r.role}</span>
                  <p className="text-[10px] text-gray-500 leading-relaxed mt-2">{desc}</p>
                  <p className="text-[10px] font-bold leading-relaxed mt-1" style={{ color: NEURO_LABELS[r.code]?.color }}>{r.comment}</p>
                </div>
              );
            })}
          </div>

          {/* 属性タグ */}
          <h3 className="text-base font-bold text-gray-900 mb-3">駆動特性</h3>
          <p className="text-xs text-gray-500 mb-4">
            同じ骨格・同じ型でも、エンジンのかかり方と出力の大きさは人によって異なる。以下の3つの特性があなたの「走り方」を決定する。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 発動方向 */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
              <p className="text-[10px] text-gray-400 mb-2 flex items-center gap-1"><Flame size={12} />発動方向</p>
              {(() => {
                const isExternal = (pattern?.ignition || 'external') === 'external';
                return (
                  <>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className={`text-base font-bold ${isExternal ? 'text-gray-900' : 'text-gray-300'}`}>外燃</span>
                      <span className="text-gray-300">/</span>
                      <span className={`text-base font-bold ${!isExternal ? 'text-gray-900' : 'text-gray-300'}`}>内燃</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">{
                      isExternal
                        ? '外部の刺激や環境変化でエンジンがかかる。巻き込まれた方が火が点きやすい。'
                        : '内側の納得感やビジョンでエンジンがかかる。自分で決めたら止まらない。'
                    }</p>
                  </>
                );
              })()}
            </div>

            {/* 時間特性 */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
              <p className="text-[10px] text-gray-400 mb-2 flex items-center gap-1"><Clock size={12} />時間特性</p>
              {(() => {
                const isBurst = (pattern?.time_character || 'burst') === 'burst';
                return (
                  <>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className={`text-base font-bold ${isBurst ? 'text-gray-900' : 'text-gray-300'}`}>瞬発</span>
                      <span className="text-gray-300">/</span>
                      <span className={`text-base font-bold ${!isBurst ? 'text-gray-900' : 'text-gray-300'}`}>熟成</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">{
                      isBurst
                        ? '立ち上がりが速い。短期集中で成果を出し、休んでまた走るリズム。'
                        : 'じわじわ温まるが、回り始めると深く安定。助走期間の確保が鍵。'
                    }</p>
                  </>
                );
              })()}
            </div>

            {/* 出力 */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
              <p className="text-[10px] text-gray-400 mb-2 flex items-center gap-1"><Zap size={12} />出力</p>
              {(() => {
                const level = pattern?.output_level || 'Middle';
                return (
                  <>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className={`text-base font-bold ${level === 'Light' ? 'text-gray-900' : 'text-gray-300'}`}>低</span>
                      <span className="text-gray-300">/</span>
                      <span className={`text-base font-bold ${level === 'Middle' ? 'text-gray-900' : 'text-gray-300'}`}>中</span>
                      <span className="text-gray-300">/</span>
                      <span className={`text-base font-bold ${level === 'Over' ? 'text-gray-900' : 'text-gray-300'}`}>高</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">{
                      level === 'Light'
                        ? '小さく起動しやすく安定。爆発力より持続性に優れる。' :
                      level === 'Over'
                        ? 'ハマると圧倒的だがドレインも大きい。エネルギー管理が重要。'
                        : '再現性と推進力のバランスが良い。最もコントロールしやすい。'
                    }</p>
                  </>
                );
              })()}
            </div>
          </div>

          {/* 診断結果の総括 */}
          <h3 className="text-sm font-bold text-gray-900 mt-8 mb-3">あなたの駆動構造</h3>
          <p className="text-sm text-gray-600 leading-[1.9] mb-4">
            あなたの診断では、{neuroDict[parts[0]]?.jp}（{neuroDict[parts[0]]?.desc}）が最も高いスコアを記録しました。これがあなたの駆動の起点——点火装置です。{neuroDict[parts[1]]?.jp}（{neuroDict[parts[1]]?.desc}）が2番目に高く加速装置として機能し、{neuroDict[parts[2]]?.jp}（{neuroDict[parts[2]]?.desc}）が3番目に続いて駆動を循環させます。
          </p>
          <p className="text-sm text-gray-600 leading-[1.9] mb-4">
            偏りは「{BIAS_JP[bias] || bias}」。{BIAS_STYLE[bias]?.strength}。一方で、{BIAS_STYLE[bias]?.risk}。
          </p>
          <p className="text-sm text-gray-600 leading-[1.9] mb-4">
            発動方向は{pattern?.ignition_label}——{pattern?.ignition_desc}。時間特性は{pattern?.time_character_label}で、{pattern?.time_character_desc}。出力は{OUTPUT_JP[pattern?.output_level || ''] || pattern?.output_level}。
          </p>
          <p className="text-sm text-gray-600 leading-[1.9]">
            この神経系の優先順位、偏り、駆動特性の組み合わせが、あなたの「動き方の癖」そのものを形作っています。これは性格ではなく「駆動構造」——あなたが何に夢中になり、何によって走り続け、何によって止まるかの設計図です。
          </p>
        </Chapter>

        {/* ═══ 第三章：あなたの型 ═══ */}
        {kata && pattern && (
          <Chapter id="sec-type" num="02" title={`${kata.name} — ${entry.kanji_name}`} en="YOUR TYPE">
            <p className="text-lg font-bold text-gray-800 leading-relaxed mb-6 border-l-4 pl-4" style={{ borderColor: NEURO_LABELS[rank1]?.color }}>
              {pattern?.interpretation || `${neuroDict[parts[0]]?.desc}を起点に${neuroDict[parts[1]]?.desc}で加速する${BIAS_JP[bias] || bias}ドライブ`}
            </p>

            <p className="text-sm text-gray-600 leading-[1.9] mb-4">
              {kata.name}には12の疾走領域が存在します。同じ型でも、2位と3位に何が入るかで駆動の質が大きく変わるからです。
            </p>
            <p className="text-sm text-gray-600 leading-[1.9] mb-4">
              あなたの場合、加速装置に<span className="font-bold" style={{ color: NEURO_LABELS[parts[1]]?.color }}>{neuroDict[parts[1]]?.jp}（{neuroDict[parts[1]]?.desc}）</span>、持続装置に<span className="font-bold" style={{ color: NEURO_LABELS[parts[2]]?.color }}>{neuroDict[parts[2]]?.jp}（{neuroDict[parts[2]]?.desc}）</span>が入ります。{neuroDict[parts[0]]?.jp}で点火した衝動を、{neuroDict[parts[1]]?.jp}が形にし、{neuroDict[parts[2]]?.jp}が回し続ける——この固有の駆動サイクルが「{entry.kanji_name}」という疾走領域を生み出しています。
            </p>
            <p className="text-sm text-gray-600 leading-[1.9] mb-8">
              もし2位が{neuroDict[parts[1]]?.jp}ではなく別の神経系だったなら、加速の仕方が変わり、全く異なる疾走領域になっていました。同様に、3位が{neuroDict[parts[2]]?.jp}でなければ、持続の仕組みが変わり、走り方の質そのものが違っていたはずです。
            </p>


            {/* 診断のプロセスフロー */}
            <h3 className="text-base font-bold text-gray-900 mb-3">診断のプロセス</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              疾走領域（Drive Field）は、5つの神経系スコアから段階的にあなた固有の疾走領域を絞り込みます。各段階で何が決まるかを以下に示します。
            </p>

            <div className="mb-4 border border-gray-200 rounded-xl p-5 bg-gray-50/50">
              {[
                {
                  num: '01', title: '5つの神経系を診断', color: '#6b7280',
                  content: (
                    <>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {['D','S','O','N','E'].map((k) => (
                          <span key={k} className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: NEURO_LABELS[k].color, backgroundColor: `${NEURO_LABELS[k].color}15` }}>{k} {NEURO_LABELS[k].jp}</span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">52の問いから5つの神経系スコアを算出します。</p>
                    </>
                  ),
                  connector: 'スコア上位3つの順列で骨格が決まる',
                },
                {
                  num: '02', title: '全60の骨格から選定', color: NEURO_LABELS[parts[0]]?.color || '#6b7280',
                  content: (
                    <>
                      <div className="flex items-center gap-3 mb-2">
                        {[parts[0], parts[1], parts[2]].map((k, i) => (
                          <span key={k} className="flex items-center gap-1">
                            {i > 0 && <span className="text-gray-300">-</span>}
                            <span className="text-base font-bold" style={{ color: NEURO_LABELS[k]?.color }}>{k}</span>
                            <span className="text-xs text-gray-500">{neuroDict[k]?.jp}</span>
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">1位が点火、2位が加速、3位が持続。この順番が駆動構造を決定します。</p>
                    </>
                  ),
                  connector: 'スコアの偏り方で型が決まる',
                },
                {
                  num: '03', title: '全20種の型から選定', color: NEURO_LABELS[parts[0]]?.color || '#6b7280',
                  content: (
                    <>
                      <p className="text-base font-bold text-gray-900 mb-1">{kata?.name}</p>
                      <p className="text-xs text-gray-500">{
                        bias === 'Single' ? '1位に極端に集中している「一点突破型」' :
                        bias === 'Dual' ? '1位と2位が突出している「二軸駆動型」' :
                        bias === 'Trinity' ? '上位3つがバランスよく高い「三位一体型」' :
                        '全体的に均等に分布している「万能拡散型」'
                      }——偏りパターンは「{BIAS_JP[bias] || bias}」。</p>
                    </>
                  ),
                  connector: `${neuroDict[parts[1]]?.jp}（加速）と${neuroDict[parts[2]]?.jp}（持続）の組み合わせで確定`,
                },
                {
                  num: '04', title: 'あなたの疾走領域', color: NEURO_LABELS[parts[0]]?.color || '#6b7280',
                  content: (
                    <>
                      <p className="text-base font-bold text-gray-900">{entry.kanji_name}</p>
                      <p className="text-xs text-gray-500 mb-2">{entry.reading} / {entry.english_name}</p>
                      <p className="text-xs text-gray-500">{neuroDict[parts[0]]?.jp}（{neuroDict[parts[0]]?.desc}）を点火に、{neuroDict[parts[1]]?.jp}（{neuroDict[parts[1]]?.desc}）で加速、{neuroDict[parts[2]]?.jp}（{neuroDict[parts[2]]?.desc}）で持続する{BIAS_JP[bias] || bias}の駆動構造から導出。</p>
                    </>
                  ),
                  connector: null,
                },
              ].map((step, i, arr) => (
                <div key={step.num} className="flex gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white" style={{ borderColor: step.color, backgroundColor: step.color }}>{step.num}</div>
                    {i < arr.length - 1 && <div className="w-px flex-1 min-h-[24px] bg-gray-200" />}
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="text-base font-bold text-gray-900 mb-3 mt-1.5">{step.title}</p>
                    {step.content}
                    {step.connector && <p className="text-[10px] text-gray-400 mt-3">{step.connector}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Chapter>
        )}

        {/* ═══ 第四章：あなたの人物像 ═══ */}
        {interp && (
          <Chapter id="sec-profile" num="03" title="あなたの人物像" en="PROFILE">
            <p className="text-lg font-bold text-gray-800 leading-relaxed mb-6 border-l-4 pl-4" style={{ borderColor: NEURO_LABELS[rank1]?.color }}>
              {interp.awakened_vibe}
            </p>

            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2"><Activity size={20} className="text-gray-400" />あなたの駆動の特徴</h3>
            <p className="text-sm text-gray-800 leading-[1.9] mb-6">{interp.structural_interpretation}</p>

            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2"><Rocket size={20} className="text-gray-400" />発動スタイル</h3>
            <p className="text-sm text-gray-600 leading-[1.9] mb-4">{profile.ignitionStyle}</p>
            <p className="text-sm text-gray-600 leading-[1.9] mb-8">{profile.timingStyle}</p>

            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2"><Briefcase size={20} className="text-gray-400" />仕事での傾向</h3>
            <p className="text-sm text-gray-600 leading-[1.9] mb-8">{profile.workStyle}</p>

            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2"><Users size={20} className="text-gray-400" />人間関係の傾向</h3>
            <p className="text-sm text-gray-600 leading-[1.9] mb-8">{profile.relationship}</p>

            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2"><Coffee size={20} className="text-gray-400" />日常生活の傾向</h3>
            <p className="text-sm text-gray-600 leading-[1.9] mb-8">{profile.daily}</p>

          </Chapter>
        )}

        {/* ═══ 第五章：起動マニュアル ═══ */}
        {pattern && interp && (
          <Chapter id="sec-startup" num="04" title={`${entry.kanji_name}の起動マニュアル`} en="IGNITION">
            <p className="text-sm text-gray-600 leading-[1.9] mb-6">
              あなたの疾走領域は、{neuroDict[parts[0]]?.jp}の「{neuroDict[parts[0]]?.desc}」で点火し、{neuroDict[parts[1]]?.jp}の「{neuroDict[parts[1]]?.desc}」で加速し、{neuroDict[parts[2]]?.jp}の「{neuroDict[parts[2]]?.desc}」で持続する。この3ステップが揃ったとき、あなたは夢中状態に入り、駆動は最も自然に、最も力強く回り始める。逆に言えば、どれか一つが欠けるだけで夢中にはなれない。
            </p>

            {[
              { label: 'TRIGGER', role: '点火', neuro: parts[0], core: pattern.trigger_core, example: interp.trigger, work: workAdv?.trigger, life: lifeAdv?.trigger },
              { label: 'ACCELERATOR', role: '加速', neuro: parts[1], core: pattern.accelerator_core, example: interp.accelerator, work: workAdv?.accelerator, life: lifeAdv?.accelerator },
              { label: 'SUSTAIN', role: '持続', neuro: parts[2], core: pattern.sustain_core, example: interp.sustain, work: workAdv?.sustain, life: lifeAdv?.sustain },
            ].map((step) => (
              <div key={step.label} className="border border-gray-200 rounded-xl bg-gray-50/50 p-5 mb-4">
                {/* ヘッダー */}
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={22} style={{ color: NEURO_LABELS[step.neuro]?.color }} />
                  <p className="text-sm font-bold text-gray-900">{step.label} — {step.role}（{neuroDict[step.neuro]?.jp}）</p>
                </div>

                {/* 概要 */}
                <p className="text-sm text-gray-700 leading-[1.9] mb-4">{step.core}</p>

                {/* 具体例 */}
                <p className="text-xs text-gray-500 leading-relaxed mb-4 border-l-2 pl-3" style={{ borderColor: NEURO_LABELS[step.neuro]?.color }}>
                  {step.example}
                </p>

                {/* 仕事 / プライベート 2カラム */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-2"><Briefcase size={12} />仕事で{step.role}するには</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{step.work}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-2"><Home size={12} />プライベートで{step.role}するには</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{step.life}</p>
                  </div>
                </div>
              </div>
            ))}
          </Chapter>
        )}

        {/* ═══ 第六章：覚醒条件 ═══ */}
        {pattern && workAdv && lifeAdv && (
          <Chapter id="sec-awakening" num="05" title={`${entry.kanji_name}の覚醒条件`} en="AWAKENING">
            <p className="text-lg font-bold text-gray-800 leading-relaxed mb-6 border-l-4 pl-4" style={{ borderColor: NEURO_LABELS[rank1]?.color }}>
              {pattern.awakening_condition}
            </p>

            <p className="text-sm text-gray-600 leading-[1.9] mb-6">
              覚醒とは、あなたが完全な夢中状態に入ること——{neuroDict[parts[0]]?.jp}・{neuroDict[parts[1]]?.jp}・{neuroDict[parts[2]]?.jp}の3つの神経系が同時に最大出力で回っている状態だ。夢中になっているとき、あなたは普段の数倍のパフォーマンスを発揮し、時間の感覚さえ失う。夢中になれる環境があれば、人は無限に成長する。問題は、その環境を意識的に作れるかどうかだ。
            </p>

            <p className="text-sm text-gray-600 leading-[1.9] mb-6">
              {neuroDict[parts[0]]?.jp}が求める「{neuroDict[parts[0]]?.desc}」、{neuroDict[parts[1]]?.jp}が求める「{neuroDict[parts[1]]?.desc}」、{neuroDict[parts[2]]?.jp}が求める「{neuroDict[parts[2]]?.desc}」——この3つが一つでも欠けると、駆動は最大出力に達しない。覚醒は偶然ではなく、環境設計で再現できる。
            </p>

            {[
              {
                icon: <Briefcase size={20} className="text-gray-400" />,
                title: '仕事で覚醒するには',
                summary: `${neuroDict[parts[0]]?.desc}が満たされる環境で${pattern?.time_character_label === '瞬発' ? '短期集中' : 'じっくり没頭'}するスタイルが覚醒の鍵`,
                body: awakeningAdvice.work,
              },
              {
                icon: <Home size={20} className="text-gray-400" />,
                title: 'プライベートで覚醒するには',
                summary: `${pattern?.ignition_label === '外燃' ? '外に出て新しい刺激を取り入れる' : '内なる衝動に従い質の高い時間をつくる'}ことが起点`,
                body: awakeningAdvice.life,
              },
              {
                icon: <RefreshCw size={20} className="text-gray-400" />,
                title: '日常で持続させるには',
                summary: `${neuroDict[parts[0]]?.jp}・${neuroDict[parts[1]]?.jp}・${neuroDict[parts[2]]?.jp}を「毎日・毎週・毎月」の3層で満たす`,
                body: awakeningAdvice.daily,
              },
            ].map((item) => (
              <div key={item.title} className="border border-gray-200 rounded-xl bg-gray-50/50 p-5 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  {item.icon}
                  <p className="text-sm font-bold text-gray-900">{item.title}</p>
                </div>
                <p className="text-xs font-bold mb-3" style={{ color: NEURO_LABELS[rank1]?.color }}>{item.summary}</p>
                <p className="text-sm text-gray-700 leading-[1.9]">{item.body}</p>
              </div>
            ))}
          </Chapter>
        )}

        {/* ═══ 第七章：ドレイン条件 ═══ */}
        {pattern && interp && workAdv && lifeAdv && (
          <Chapter id="sec-drain" num="06" title={`${entry.kanji_name}のドレイン条件`} en="DRAIN">
            <p className="text-lg font-bold text-gray-800 leading-relaxed mb-6 border-l-4 pl-4" style={{ borderColor: NEURO_LABELS[rank1]?.color }}>
              {pattern.drain_condition}
            </p>

            <p className="text-sm text-gray-600 leading-[1.9] mb-6">
              ドレインとは、夢中になれない状態が続くこと——あなたの{neuroDict[parts[0]]?.jp}が求めるものが長期間得られず、駆動が空回りし続ける状態のことだ。最初は「なんとなく調子が出ない」程度だが、放置すると{neuroDict[parts[1]]?.jp}と{neuroDict[parts[2]]?.jp}の機能まで連鎖的に低下し、やがて何にも夢中になれなくなる。以下の兆候に心当たりがあるなら、すでにドレインが始まっている可能性がある。
            </p>

            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2"><AlertTriangle size={20} className="text-gray-400" />破綻のシナリオ</h3>
            <p className="text-sm text-gray-600 leading-[1.9] mb-6">{interp.breakdown}</p>

            {[
              {
                icon: <Briefcase size={20} className="text-gray-400" />,
                title: '仕事でのドレイン兆候と対策',
                summary: `${neuroDict[parts[0]]?.jp}の枯渇が最初のサイン——我慢せず環境を見直せ`,
                body: <><p className="mb-3">{workAdv.drain}</p><p className="text-xs text-gray-500 mb-1">こんな状態が2週間以上続いたら危険信号：</p><p>朝の出勤が異常に辛い、得意だったはずの仕事に手がつかない、同僚との会話が億劫になる——これらは{neuroDict[parts[0]]?.jp}の枯渇サインだ。</p></>,
              },
              {
                icon: <Home size={20} className="text-gray-400" />,
                title: 'プライベートでのドレイン兆候と対策',
                summary: `休日に何もできない状態は${neuroDict[parts[2]]?.jp}の循環停止のサイン`,
                body: <><p className="mb-3">{lifeAdv.drain}</p><p className="text-xs text-gray-500 mb-1">こんな状態が続いたら要注意：</p><p>休日なのに何もする気が起きない、好きだったことに興味が持てない、人と会うのが面倒になる——これらは{neuroDict[parts[0]]?.jp}だけでなく、{neuroDict[parts[2]]?.jp}の循環も止まっているサインだ。</p></>,
              },
            ].map((item) => (
              <div key={item.title} className="border border-gray-200 rounded-xl bg-gray-50/50 p-5 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  {item.icon}
                  <p className="text-sm font-bold text-gray-900">{item.title}</p>
                </div>
                <p className="text-xs font-bold mb-3" style={{ color: NEURO_LABELS[rank1]?.color }}>{item.summary}</p>
                <div className="text-sm text-gray-700 leading-[1.9]">{item.body}</div>
              </div>
            ))}
          </Chapter>
        )}

        {/* ═══ 第八章：回復マニュアル ═══ */}
        {pattern && interp && workAdv && lifeAdv && (
          <Chapter id="sec-recovery" num="07" title={`${entry.kanji_name}の回復マニュアル`} en="RECOVERY">
            <p className="text-lg font-bold text-gray-800 leading-relaxed mb-6 border-l-4 pl-4" style={{ borderColor: NEURO_LABELS[rank1]?.color }}>
              {pattern.recovery_condition}
            </p>

            <p className="text-sm text-gray-600 leading-[1.9] mb-6">
              夢中を取り戻すには順番がある。まず{neuroDict[parts[0]]?.jp}（{neuroDict[parts[0]]?.desc}）を回復させ、次に{neuroDict[parts[1]]?.jp}（{neuroDict[parts[1]]?.desc}）を立ち上げ、最後に{neuroDict[parts[2]]?.jp}（{neuroDict[parts[2]]?.desc}）を繋げる。この順番を間違えると回復が遅れる。2位や3位からいくら頑張っても、1位の{neuroDict[parts[0]]?.jp}が枯れたままでは、夢中は戻ってこない。
            </p>

            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2"><Wrench size={20} className="text-gray-400" />回復の起点</h3>
            <p className="text-sm text-gray-600 leading-[1.9] mb-6">{interp.recovery}</p>

            {[
              {
                icon: <CheckCircle size={20} style={{ color: NEURO_LABELS[parts[0]]?.color }} />,
                title: `ステップ1：まず${neuroDict[parts[0]]?.jp}を回復させる`,
                summary: `最優先は${neuroDict[parts[0]]?.desc}の回復——ここが全ての起点`,
                body: <><p className="mb-3">{workAdv.recovery}</p><p>{lifeAdv.recovery}</p></>,
              },
              {
                icon: <CheckCircle size={20} style={{ color: NEURO_LABELS[parts[1]]?.color }} />,
                title: `ステップ2：${neuroDict[parts[1]]?.jp}を立ち上げる`,
                summary: `${neuroDict[parts[1]]?.desc}を取り戻して加速装置を再起動`,
                body: <p>{neuroDict[parts[1]]?.jp}の「{neuroDict[parts[1]]?.desc}」を取り戻すには、{
                  parts[1] === 'D' ? '小さな新しい刺激を入れること。まだ本調子でなくていい。「少し面白いかも」程度の感覚で十分だ。' :
                  parts[1] === 'S' ? '身の回りの小さなことを整理すること。デスク、スケジュール、頭の中——何か一つ「整った」感覚を作れ。' :
                  parts[1] === 'O' ? '信頼できる人と短時間でも話すこと。深い話でなくていい。「人と繋がっている」感覚を取り戻せ。' :
                  parts[1] === 'N' ? '小さくてもいいから一つタスクを完了させること。「やり切った」感覚が集中力を呼び戻す。' :
                  '好きなことに短時間でも触れること。「楽しい」の感覚を少しでも取り戻すことが次のステップへの橋になる。'
                }</p>,
              },
              {
                icon: <CheckCircle size={20} style={{ color: NEURO_LABELS[parts[2]]?.color }} />,
                title: `ステップ3：${neuroDict[parts[2]]?.jp}で循環を繋げる`,
                summary: `${neuroDict[parts[2]]?.desc}を加えて駆動を完全循環させる`,
                body: <p>1位と2位が回復してきたら、最後に{neuroDict[parts[2]]?.jp}の「{neuroDict[parts[2]]?.desc}」を加えることで駆動が循環を始める。{
                  parts[2] === 'D' ? '新しい目標や次のチャレンジを設定すること。「次はこれをやりたい」というワクワクが循環の最後のピースになる。' :
                  parts[2] === 'S' ? '回復の過程を振り返り、学びを整理すること。「なぜドレインしたか」が理解できると、次はもっと早く気づける。' :
                  parts[2] === 'O' ? '回復の過程を誰かと共有すること。「実はこんな状態だった」と話せる関係があれば、循環は自然に始まる。' :
                  parts[2] === 'N' ? '次の目標を明確にすること。「何に向かって動くか」が定まると、集中力が戻り、駆動が安定する。' :
                  '日常の中に「味わう時間」を意識的に作ること。回復を急がず、今の状態を楽しむ余裕が循環の起点になる。'
                }</p>,
              },
            ].map((item) => (
              <div key={item.title} className="border border-gray-200 rounded-xl bg-gray-50/50 p-5 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  {item.icon}
                  <p className="text-sm font-bold text-gray-900">{item.title}</p>
                </div>
                <p className="text-xs font-bold mb-3" style={{ color: NEURO_LABELS[rank1]?.color }}>{item.summary}</p>
                <div className="text-sm text-gray-700 leading-[1.9]">{item.body}</div>
              </div>
            ))}
          </Chapter>
        )}

        {/* アクションメニュー */}
        {pattern && (
          <ActionMenu
            kanjiName={entry.kanji_name}
            reading={entry.reading}
            englishName={entry.english_name}
            kataName={kata?.name || ''}
            rank1Jp={neuroDict[parts[0]]?.jp || ''}
            rank2Jp={neuroDict[parts[1]]?.jp || ''}
            rank3Jp={neuroDict[parts[2]]?.jp || ''}
            bias={BIAS_JP[bias] || bias}
            ignition={pattern.ignition_label}
            timing={pattern.time_character_label}
            driveStructure={pattern.drive_structure}
            triggerCore={pattern.trigger_core}
            awakeningCondition={pattern.awakening_condition}
            drainCondition={pattern.drain_condition}
            recoveryCondition={pattern.recovery_condition}
          />
        )}

        {/* AI相談セクション */}
        {pattern && (
          <AiConsultSection prompt={`あなたは「疾走領域（Drive Field）」の診断結果に基づいて、ユーザーの相談に乗るアドバイザーです。

以下がこのユーザーの診断結果です。この情報を前提として、ユーザーの相談に親身に答えてください。

---
疾走領域名: ${entry.kanji_name}（${entry.reading} / ${entry.english_name}）
型: ${kata?.name || ''}
偏りタイプ: ${BIAS_JP[bias] || bias}

神経系優先順位:
- 1位（点火）: ${neuroDict[parts[0]]?.jp}（${neuroDict[parts[0]]?.desc}）
- 2位（加速）: ${neuroDict[parts[1]]?.jp}（${neuroDict[parts[1]]?.desc}）
- 3位（持続）: ${neuroDict[parts[2]]?.jp}（${neuroDict[parts[2]]?.desc}）

駆動構造: ${pattern.drive_structure}
発動方向: ${pattern.ignition_label}（${pattern.ignition_desc}）
時間特性: ${pattern.time_character_label}（${pattern.time_character_desc}）
出力: ${OUTPUT_JP[pattern.output_level] || pattern.output_level}

起動条件: ${pattern.trigger_core}
覚醒条件: ${pattern.awakening_condition}
ドレイン条件: ${pattern.drain_condition}
回復条件: ${pattern.recovery_condition}
---

このユーザーの駆動構造を深く理解した上で、以下のルールで回答してください:
- ユーザーの疾走領域の特性に合わせた具体的なアドバイスをする
- 一般論ではなく、この人の神経系の組み合わせに基づいた回答をする
- 「あなたの場合は〇〇なので、△△がおすすめです」のように個別具体的に答える
- 仕事・人間関係・人生の相談に対応する
- 温かく、でも的確に

ではユーザーの相談を聞いてください。最初に軽く自己紹介と、この人の疾走領域の特徴を簡潔に述べてから「何についてお話しましょうか？」と聞いてください。`} />
        )}

        {/* ─── フッター ─── */}
        <div className="flex justify-center gap-3 text-xs text-gray-500 mb-10 flex-wrap">
          <span>{coreCode}</span>
          {bias && <><span>·</span><span>{bias}</span></>}
        </div>

        <div className="space-y-3 w-full">
          <Link href="/diagnosis" className="btn-float block w-full py-3 border border-gray-300 text-gray-900 text-sm rounded-full text-center">
            もう一度診断する
          </Link>
          <Link href="/" className="btn-float block w-full py-3 text-gray-400 text-sm text-center">
            トップへ
          </Link>
        {/* 注意書き */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-[10px] text-gray-400 leading-relaxed">
            本診断は、医学的・科学的根拠に基づくものではありません。日々の行動パターンから、5つの神経系の傾向を推測し、それを駆動特性として表現したものです。診断結果は自己理解のための参考情報としてご活用ください。医療・心理的な判断の代替となるものではありません。
          </p>
        </div>
        </div>
      </div>
    </main>
    </>
  );
}
