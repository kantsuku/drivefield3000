'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import kataData from '@/data/l4-kata.json';
import namesData from '@/data/names-240.json';

const NEURO_COLOR: Record<string, string> = {
  D: '#c0392b', S: '#2e6b8a', O: '#27806a', N: '#b8860b', E: '#7b5ea7',
};
const NEURO_JP: Record<string, string> = {
  D: 'ドーパミン', S: 'セロトニン', O: 'オキシトシン', N: 'ノルアドレナリン', E: 'エンドルフィン',
};
const BIAS_JP: Record<string, string> = {
  Single: '一点突破', Dual: '二軸駆動', Trinity: '三極共鳴', Flat: '万能拡散',
};

type Tab = 'about' | 'neuro' | 'method' | 'catalog' | 'company';

function SectionHead({ title }: { title: string }) {
  return (
    <div className="mb-5 pb-3 border-b border-white/30">
      <h3 className="text-xl font-bold text-white">{title}</h3>
    </div>
  );
}

export function AboutMenu() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('about');
  const [fade, setFade] = useState(true);
  const fadeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const contentRef = useRef<HTMLDivElement>(null);

  const switchTab = useCallback((next: Tab) => {
    if (next === tab) return;
    setFade(false);
    clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => {
      setTab(next);
      setFade(true);
      contentRef.current?.scrollTo(0, 0);
    }, 150);
  }, [tab]);

  // タイマークリーンアップ
  useEffect(() => {
    return () => { clearTimeout(fadeTimer.current); };
  }, []);

  return (
    <>
      {/* ハンバーガーボタン */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-full border border-white/20 bg-black hover:border-white/40 transition-colors"
        aria-label="メニューを開く"
      >
        <Menu size={18} />
      </button>

      {/* オーバーレイ */}
      <div
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-500 ease-out ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* モーダル */}
      <div
        className={`fixed inset-4 md:inset-8 z-50 bg-gray-950 text-white rounded-2xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.97] translate-y-3 pointer-events-none'
        }`}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-800">
          <h2 className="text-lg font-bold text-white">疾走領域（Drive Field）</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-300 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* タブ */}
        <div className="flex bg-gray-800">
          {([
            { key: 'about' as Tab, num: '01', label: '疾走領域とは' },
            { key: 'neuro' as Tab, num: '02', label: '5つの神経系' },
            { key: 'method' as Tab, num: '03', label: '解析方法' },
            { key: 'catalog' as Tab, num: '04', label: '型一覧' },
            { key: 'company' as Tab, num: '05', label: '運営' },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-300 ease-out flex flex-col items-center gap-0.5 rounded-t-lg ${
                tab === t.key
                  ? 'text-white bg-gray-950'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <span className={`text-[10px] ${tab === t.key ? 'text-gray-400' : 'text-gray-400'}`}>{t.num}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* コンテンツ */}
        <div
          ref={contentRef}
          className={`overflow-y-auto px-6 pt-8 pb-20 transition-all duration-300 ease-out ${
            fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
          style={{ height: 'calc(100% - 110px)' }}
        >
          <div className="max-w-3xl mx-auto">

          {/* ═══ 疾走領域とは ═══ */}
          {tab === 'about' && (
            <div className="space-y-10">

              {/* 01 */}
              <section>
                <SectionHead title="疾走領域（しっそうりょういき / ドライブフィールド）とは" />
                <p className="text-base text-gray-200 leading-[2] mb-4">
                  人は「夢中」によって開かれます。
                </p>
                <p className="text-base text-gray-200 leading-[2] mb-4">
                  苦しい環境で歯を食いしばって努力したり、人との違いに悩み続けたりしていませんか。それは、あなたが弱いからではありません。自分の駆動構造に合わない場所で走ろうとしているだけです。
                </p>
                <p className="text-base text-gray-200 leading-[2]">
                  人はみんな違います。それぞれの行動特性は、5つの神経系の優先順位とその組み合わせから成り立っています。自分の駆動パターンを理解し、それに合った環境に身を投じること——それは人生に「生きる歓び」をもたらします。
                </p>
              </section>

              {/* 02 */}
              <section>
                <SectionHead title="夢中の領域を成長の方程式にする" />
                <p className="text-base text-gray-200 leading-[2] mb-4">
                  疾走領域とは、あなたが夢中になれる場所であり、能力が最も自然に、最も力強く発揮される領域のことです。
                </p>
                <p className="text-base text-gray-200 leading-[2] mb-4">
                  ただし「夢中」は偶然ではありません。あなたの神経系がどう組み合わさり、何で点火し、何で加速し、何で持続するか——その構造を理解すれば、夢中は再現できます。再現できれば、それは成長の方程式になります。
                </p>
                <p className="text-base text-gray-200 leading-[2] mb-4">
                  努力で到達するのではありません。自分の駆動構造に合った環境に身を置いたとき、自然と走り出してしまう。その状態を意図的に作り出し、繰り返し、積み重ねていくこと。それが疾走領域の展開であり、人生を本気で生きるための自分だけの成長エンジンです。
                </p>
                <p className="text-base text-gray-200 leading-[2]">
                  人は努力では動きません。夢中で動きます。疾走領域（Drive Field）は、その夢中を構造として捉え、成長の方程式に変えるためのツールです。
                </p>
              </section>

              <section>
                <SectionHead title="このツールをつくった理由" />
                <p className="text-base text-gray-200 leading-[2] mb-4">
                  「人は努力で動かない。フィールドで動く。」
                </p>
                <p className="text-base text-gray-200 leading-[2] mb-4">
                  この言葉が、疾走領域（Drive Field）のすべての出発点です。
                </p>
                <p className="text-base text-gray-200 leading-[2] mb-4">
                  私たちが考えていたのは、適材適所のような単純な話ではありませんでした。どうすれば人から人に熱意が伝播するのか。どうすれば歓びを共有できるのか。どうすればお互いの長所を活かし合えるのか。そういうことを、ずっと考えてきました。
                </p>
                <p className="text-base text-gray-200 leading-[2]">
                  自分に合ったフィールドに立ったとき、人は努力を超えた力を発揮します。夢中になり、時間を忘れ、気づいたら走っている。そしてその熱は、自然と周りにも伝わっていく。その状態に名前をつけたものが「疾走領域」です。一人でも多くの人にその場所を見つけてほしい。その想いでこのツールをつくりました。
                </p>
              </section>

              <section>
                <SectionHead title="分類するためのツールではありません" />
                <p className="text-base text-gray-200 leading-[2] mb-4">
                  これは性格診断でも、占いでも、タイプ分け遊びでもありません。私たちが本当にやりたかったのは、一人ひとりが自分の能力が最も自然に通る場所を見つけ、そこで走り続けるための具体的な方法を届けることです。
                </p>
                <p className="text-base text-gray-200 leading-[2]">
                  疾走領域を知ることで、自分の力がちゃんと届く場所を理解できます。無理に自分を変える必要はありません。大切な人と互いの疾走領域を共有してみてください。「我慢して合わせる関係」が「それぞれの走り方を認め合って一緒に走る関係」に変わるきっかけになれたら、こんなに嬉しいことはありません。
                </p>
              </section>

              <section>
                <SectionHead title="人生を楽しみながら走ってほしい" />
                <p className="text-base text-gray-200 leading-[2] mb-4">
                  人生に正解はありません。でも、自分にとっての「走り方」はあると信じています。あなたにはあなたの点火条件があり、あなたの加速装置があり、あなたの持続装置があります。その組み合わせは、世界に一つだけのものです。
                </p>
                <p className="text-base text-gray-200 leading-[2]">
                  この診断が、あなたの仕事に、人間関係に、そして人生に、少しでも助けになれたら。心からそう願って、このツールをつくりました。
                </p>
              </section>

            </div>
          )}

          {/* ═══ 5つの神経系 ═══ */}
          {tab === 'neuro' && (
            <div className="space-y-10">
              <section>
                <SectionHead title="5つの神経系とは" />
                <p className="text-base text-gray-200 leading-[2] mb-4">
                  人間の行動を駆動する5つの神経系。あなたの衝動の源泉であり、疾走領域を構成する根幹です。どの神経系が強いかによって、何に夢中になり、何で力を発揮し、何で消耗するかが決まります。
                </p>
              </section>

              {[
                { num: '02', code: 'D', name: 'ドーパミン', desc: '新規性・可能性', color: '#c0392b',
                  detail: '新しいことに飛びつく好奇心。未知の領域に惹かれ、変化と刺激を求める衝動。',
                  high: 'ドーパミンが高い人は、前例のない挑戦や新しい環境に強く惹かれます。まだ誰もやっていないことに興奮し、可能性を感じた瞬間にエンジンがかかります。飽きっぽいと言われることもありますが、それは弱さではなく、新しい刺激を求めるエンジンの構造です。',
                  low: 'ドーパミンが低い場合、安定した環境で着実に力を発揮するタイプです。無理に新しいことを始める必要はありません。' },
                { num: '03', code: 'S', name: 'セロトニン', desc: '理解・秩序', color: '#2e6b8a',
                  detail: '物事を構造化し、秩序を見出す力。論理と計画性で前に進む。',
                  high: 'セロトニンが高い人は、情報を整理し、複雑な問題をシンプルに構造化する力に秀でています。計画を立て、見通しを示し、全体を俯瞰する役割で真価を発揮します。「考えすぎ」と言われることもありますが、それは深い理解を求めるエンジンの構造です。',
                  low: 'セロトニンが低い場合、直感やフィーリングで動くタイプです。計画に縛られるより、流れに乗る方が力を発揮しやすいかもしれません。' },
                { num: '04', code: 'O', name: 'オキシトシン', desc: '共感・接続', color: '#27806a',
                  detail: '人との繋がりで燃える。共感と信頼関係の中で力を発揮する。',
                  high: 'オキシトシンが高い人は、チームワークを通じて最大の力を発揮します。メンバーの気持ちを汲み取り、信頼関係を築くことで、個人では到達できない成果を引き出します。「お人好し」と言われることもありますが、それは繋がりから力を引き出すエンジンの構造です。',
                  low: 'オキシトシンが低い場合、一人で集中して取り組むスタイルが合っています。孤独を恐れる必要はありません。' },
                { num: '05', code: 'N', name: 'ノルアドレナリン', desc: '緊張・集中', color: '#b8860b',
                  detail: 'プレッシャーの中で輝く。困難な課題に全神経を注ぐ集中力。',
                  high: 'ノルアドレナリンが高い人は、明確な目標と適度なプレッシャーがある環境で最も集中力が高まります。困難な課題に全神経を注ぎ込み、驚くような成果を出すことがあります。「ストイックすぎる」と言われることもありますが、それは集中から力を引き出すエンジンの構造です。',
                  low: 'ノルアドレナリンが低い場合、リラックスした環境で力を発揮するタイプです。無理にプレッシャーをかける必要はありません。' },
                { num: '06', code: 'E', name: 'エンドルフィン', desc: '快感・没入', color: '#7b5ea7',
                  detail: '好きなことへの没入で力を発揮する。質へのこだわりと鋭い感性。',
                  high: 'エンドルフィンが高い人は、心から楽しめることに出会ったとき、時間を忘れて没頭し、質の高い成果を生み出します。「こだわりが強い」と言われることもありますが、それは没入から力を引き出すエンジンの構造です。',
                  low: 'エンドルフィンが低い場合、幅広くバランスよく取り組むスタイルが合っています。一つに絞り込む必要はありません。' },
              ].map((n) => (
                <section key={n.code}>
                  <SectionHead title={`${n.name}（${n.desc}）`} />
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl font-bold" style={{ color: n.color }}>{n.code}</span>
                    <p className="text-base text-gray-200">{n.detail}</p>
                  </div>
                  <p className="text-base text-gray-200 leading-[2] mb-4">{n.high}</p>
                  <p className="text-sm text-gray-400 leading-[2]">{n.low}</p>
                </section>
              ))}
            </div>
          )}

          {/* ═══ 解析方法 ═══ */}
          {tab === 'method' && (
            <div className="space-y-10">

              <section>
                <SectionHead title="解析の概要" />
                <p className="text-base text-gray-200 leading-[2] mb-4">
                  疾走領域（Drive Field）は、90の問いに対するあなたの直感的な回答から、5つのレイヤーであなたを多面的に解析します。
                </p>
                <p className="text-base text-gray-200 leading-[2]">
                  考えて答えるのではなく、感じて答えることで、あなたの無意識の駆動パターンが浮かび上がります。
                </p>
              </section>

              <section>
                <SectionHead title="5層の診断モデル" />
                <p className="text-base text-gray-200 leading-[2] mb-6">
                  この診断は、単に「あなたは何型です」と分類するものではありません。5つの異なるレイヤーから、あなたという人間を立体的に捉えます。
                </p>
                <div className="space-y-4">
                  {[
                    { layer: 'Layer 1', title: 'エンジン（先天的・52問）', desc: '5つの神経系（ドーパミン・セロトニン・オキシトシン・ノルアドレナリン・エンドルフィン）のスコアを算出し、骨格・型・疾走領域・駆動パターンを段階的に絞り込みます。さらに偏り（一点突破/二軸駆動/三位一体/万能拡散）、発動方向（外燃/内燃）、時間特性（瞬発/熟成）、出力レベル（低/中/高）も判定します。クロスバリデーション（同じ神経系を異なる場面で再測定）により精度を担保しています。', color: '#c0392b' },
                    { layer: 'Layer 2', title: 'ブレーキ検出（14問）', desc: '自己肯定感を外見・能力・存在価値・行動力・回復力の観点から8問で測定。対人基盤（愛着スタイル）を初対面の態度・助けを求める力・幼少期の安心感など6問で逆推定します。同じエンジンでもブレーキがかかっていれば出力が制限されます。直接「自信がありますか？」とは聞かず、行動の結果から検出する設計です。', color: '#b8860b' },
                    { layer: 'Layer 3', title: 'スキルツリー（5問）', desc: '学習経験（勉強の方法論）・対人経験（場を回す力）・体力経験（限界突破）・創作経験（没頭力）・冒険経験（環境変化）の5軸で、これまでに積んできた経験値を把握します。エンジンと経験値の組み合わせで「何を通じて夢中になるか」の具体提案が変わります。', color: '#27806a' },
                    { layer: 'Layer 4', title: '才能軸（5問）', desc: '身体能力・感覚直感（右脳）・論理力（左脳）・手先の器用さ・言語表現力を測定します。エンジンの力をどのチャネルで出力するかを決定する要素です。例えばD型＋右脳強なら「アートで点火」、D型＋左脳強なら「ビジネス設計で点火」のように具体度が上がります。', color: '#2e6b8a' },
                    { layer: 'Layer 5', title: '環境コンテキスト（4問）', desc: '経済的背景（子供の頃の自由度・現在のお金への意識）と健康面の制約を、行動傾向から逆推定します。センシティブな情報は直接聞かず、「やりたい習い事ができたか」「お金のことが最初に頭に浮かぶか」といった問いで把握します。', color: '#7b5ea7' },
                  ].map((item) => (
                    <div key={item.layer} className="border-l-3 pl-4" style={{ borderColor: item.color }}>
                      <p className="text-[10px] tracking-wider mb-1" style={{ color: item.color }}>{item.layer}</p>
                      <p className="text-sm font-bold text-white mb-2">{item.title}</p>
                      <p className="text-xs text-gray-300 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <SectionHead title="エンジン診断の絞り込み" />
                <p className="text-base text-gray-200 leading-[2] mb-6">
                  Layer 1（エンジン）は、以下の4ステップで段階的にあなた固有の疾走領域を特定します。
                </p>
                <div className="space-y-5">
                  {[
                    { step: 'STEP 1', title: '5つの神経系スコアを算出', desc: '回答から、D（ドーパミン）・S（セロトニン）・O（オキシトシン）・N（ノルアドレナリン）・E（エンドルフィン）の5つの神経系スコアを数値化します。' },
                    { step: 'STEP 2', title: '上位3つの順列で60の骨格に分類', desc: '1位が点火装置、2位が加速装置、3位が持続装置。この順番が駆動の基本構造を決定します。5つから3つを選ぶ順列で60通り。' },
                    { step: 'STEP 3', title: 'スコアの偏りから20の型に分類', desc: '一点突破型・二軸駆動型・三位一体型・万能拡散型の4種と、1位の神経系5種の掛け合わせで20型。' },
                    { step: 'STEP 4', title: '240の疾走領域を確定', desc: '2位と3位の神経系の組み合わせで、同じ型でも走り方の質が変わります。その違いが固有の疾走領域名として表現されます。' },
                  ].map((s) => (
                    <div key={s.step} className="border-l-3 border-white/30 pl-4">
                      <p className="text-[10px] text-gray-400 tracking-wider mb-1">{s.step}</p>
                      <p className="text-sm font-bold text-white mb-2">{s.title}</p>
                      <p className="text-xs text-gray-300 leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <SectionHead title="さらに詳細な駆動特性" />
                <p className="text-base text-gray-200 leading-[2] mb-6">
                  240の疾走領域に加え、以下の3つの特性が掛け合わさり、最終的に2,880の駆動パターンに分岐します。
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    { title: '発動方向', options: '外燃 / 内燃', desc: '外部の刺激で火が点くか、内側の衝動で火が点くか。' },
                    { title: '時間特性', options: '瞬発 / 熟成', desc: 'すぐに動き出せるか、じわじわ温まるか。' },
                    { title: '出力レベル', options: '低 / 中 / 高', desc: '安定型か、爆発と休息を繰り返す型か。' },
                  ].map((item) => (
                    <div key={item.title} className="border border-white/20 rounded-lg p-3">
                      <p className="text-sm font-bold text-white">{item.title}<span className="text-[10px] text-gray-300 font-normal ml-2">{item.options}</span></p>
                      <p className="text-xs text-gray-300 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <SectionHead title="1億通りを超える診断結果" />
                <p className="text-base text-gray-200 leading-[2] mb-4">
                  5つのレイヤーを掛け合わせた結果、理論上の診断パターンは以下のようになります。
                </p>
                <div className="space-y-2 mb-4">
                  {[
                    { label: 'Layer 1: エンジン', value: '2,880通り' },
                    { label: 'Layer 2: ブレーキ', value: '× 12通り' },
                    { label: 'Layer 3: スキルツリー', value: '× 32通り' },
                    { label: 'Layer 4: 才能', value: '× 32通り' },
                    { label: 'Layer 5: 環境', value: '× 4通り' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-xs py-1 border-b border-white/20">
                      <span className="text-gray-300">{item.label}</span>
                      <span className="text-gray-200">{item.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-3xl font-bold text-white mb-4">
                  = 141,557,760通り
                </p>
                <p className="text-base text-gray-200 leading-[2]">
                  1億4千万通り。同じ診断結果になる人は、事実上存在しません。あなたの結果は、あなただけのものです。
                </p>
              </section>

              <section>
                <SectionHead title="全90問の内訳" />
                <div className="space-y-2">
                  {[
                    { category: 'エンジン（神経系・骨格）', count: '10問', type: '8択' },
                    { category: '偏り・発動方向・時間特性・出力', count: '20問', type: '2択' },
                    { category: '場面別（旅行・仕事・恋愛・食・金）', count: '18問', type: '2択' },
                    { category: '原体験', count: '4問', type: '2択' },
                    { category: 'クロスバリデーション', count: '6問', type: '2択' },
                    { category: '自己肯定感', count: '8問', type: '2択' },
                    { category: '対人基盤（愛着）', count: '6問', type: '2択' },
                    { category: '経験値マップ', count: '5問', type: '2択' },
                    { category: '才能軸', count: '5問', type: '2択' },
                    { category: '環境逆推定', count: '4問', type: '2択' },
                    { category: '未来思考', count: '4問', type: '8択+2択' },
                  ].map((item) => (
                    <div key={item.category} className="flex items-center justify-between text-xs py-1.5 border-b border-white/20">
                      <span className="text-gray-200">{item.category}</span>
                      <span className="text-gray-400">{item.count}（{item.type}）</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-sm py-2 font-bold">
                    <span className="text-white">合計</span>
                    <span className="text-white">90問 / 約15〜20分</span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ═══ 型一覧 ═══ */}
          {tab === 'catalog' && (
            <div className="space-y-10">
              <section>
                <SectionHead title="20の型と240の疾走領域" />
                <p className="text-base text-gray-200 leading-[2] mb-6">
                  5つの主神経系 × 4つの偏りタイプで全20型。各型の中に12の疾走領域が存在します。
                </p>
              </section>

              {['D', 'S', 'O', 'N', 'E'].map((r) => (
                <section key={r}>
                  <SectionHead title={`${NEURO_JP[r]}（${r}）系`} />
                  {['Single', 'Dual', 'Trinity', 'Flat'].map((b) => {
                    const k = (kataData as any[]).find((x: any) => x.id === `${r}-${b}`);
                    const fieldNames = (namesData as any[]).filter((n: any) => {
                      const p = n.id.split('-');
                      return p[0] === r && p[3] === b;
                    });
                    return (
                      <div key={b} className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: NEURO_COLOR[r] }} />
                          <p className="text-sm font-bold text-gray-200">{k?.name || '—'}</p>
                          <span className="text-[10px] text-gray-400">{k?.reading}</span>
                          <span className="text-[10px] text-gray-400">— {BIAS_JP[b]}</span>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5 ml-4">
                          {fieldNames.map((n: any) => (
                            <div key={n.id} className="border border-white/20 rounded px-2 py-1.5 text-center">
                              <p className="text-sm font-bold text-gray-200">{n.kanji_name}</p>
                              <p className="text-[8px] text-gray-400">{n.reading}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </section>
              ))}
            </div>
          )}

          {/* ═══ 運営 ═══ */}
          {tab === 'company' && (
            <div className="space-y-10">
              <section>
                <SectionHead title="株式会社歓尽" />
                <p className="text-base text-gray-200 leading-[2] mb-4">
                  歓尽は、人の心を動かす力を信じ、本質に向き合う支援を積み重ねていく会社です。
                </p>
                <p className="text-base text-gray-200 leading-[2]">
                  心を動かす体験や表現を通じて、人と社会の可能性をひらいていくことを目指しています。目の前の成果だけでなく、その先にある本質や価値に向き合いながら、ひとつひとつの仕事に取り組んでいます。
                </p>
              </section>

              <section>
                <SectionHead title="会社概要" />
                <div className="space-y-3">
                  {[
                    { label: '会社名', value: '株式会社歓尽' },
                    { label: '代表取締役社長', value: '山田竜矢' },
                    { label: '設立年月', value: '2023年11月' },
                    { label: '資本金', value: '500万円' },
                    { label: '住所', value: '〒169-0075 東京都新宿区高田馬場1丁目25-7 佐々木ビル4階' },
                    { label: 'メール', value: 'admin@kanjin-consulting.com' },
                    { label: '認可・受理番号', value: '13-ユ-316501（令和06年04月01日）' },
                  ].map((item) => (
                    <div key={item.label} className="flex border-b border-white/20 pb-3">
                      <span className="text-sm text-gray-400 w-36 shrink-0">{item.label}</span>
                      <span className="text-sm text-gray-200">{item.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <a
                  href="https://kanjin-consulting.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-float inline-block px-6 py-3 border border-white/30 text-white text-sm rounded-full"
                >
                  会社HPを見る
                </a>
              </section>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  );
}
