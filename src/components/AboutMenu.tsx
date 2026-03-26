'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

type Tab = 'about' | 'neuro' | 'method' | 'thoughts' | 'company';

function SectionHead({ title }: { title: string }) {
  return (
    <div className="mb-5 pb-3 border-b border-white/10">
      <h3 className="text-xl font-bold text-gray-100">{title}</h3>
    </div>
  );
}

export function AboutMenu() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('about');

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
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* モーダル */}
      <div
        className={`fixed inset-4 md:inset-8 z-50 bg-gray-950 text-white rounded-2xl overflow-hidden transition-all duration-300 ${
          open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold">疾走領域（Drive Field）</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* タブ */}
        <div className="flex border-b border-white/10">
          {([
            { key: 'about' as Tab, num: '01', label: '疾走領域とは' },
            { key: 'neuro' as Tab, num: '02', label: '5つの神経系' },
            { key: 'method' as Tab, num: '03', label: '解析方法' },
            { key: 'thoughts' as Tab, num: '04', label: '想い' },
            { key: 'company' as Tab, num: '05', label: '運営' },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 text-sm font-medium transition-colors flex flex-col items-center gap-0.5 ${
                tab === t.key
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="text-[10px] text-gray-500">{t.num}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* コンテンツ */}
        <div className="overflow-y-auto px-6 py-8" style={{ height: 'calc(100% - 110px)' }}>
          <div className="max-w-3xl mx-auto">

          {/* ═══ 疾走領域とは ═══ */}
          {tab === 'about' && (
            <div className="space-y-10">

              {/* 01 */}
              <section>
                <SectionHead title="疾走領域（しっそうりょういき / ドライブフィールド）とは" />
                <p className="text-base text-gray-300 leading-[2] mb-4">
                  人は「夢中」によって開かれます。
                </p>
                <p className="text-base text-gray-300 leading-[2] mb-4">
                  苦しい環境で歯を食いしばって努力したり、人との違いに悩み続けたりしていませんか。それは、あなたが弱いからではありません。自分の駆動構造に合わない場所で走ろうとしているだけです。
                </p>
                <p className="text-base text-gray-300 leading-[2]">
                  人はみんな違います。それぞれの行動特性は、5つの神経系の優先順位とその組み合わせから成り立っています。自分の駆動パターンを理解し、それに合った環境に身を投じること——それは人生に「生きる歓び」をもたらします。
                </p>
              </section>

              {/* 02 */}
              <section>
                <SectionHead title="夢中の領域を成長の方程式にする" />
                <p className="text-base text-gray-300 leading-[2] mb-4">
                  疾走領域とは、あなたが夢中になれる場所であり、能力が最も自然に、最も力強く発揮される領域のことです。
                </p>
                <p className="text-base text-gray-300 leading-[2] mb-4">
                  ただし「夢中」は偶然ではありません。あなたの神経系がどう組み合わさり、何で点火し、何で加速し、何で持続するか——その構造を理解すれば、夢中は再現できます。再現できれば、それは成長の方程式になります。
                </p>
                <p className="text-base text-gray-300 leading-[2] mb-4">
                  努力で到達するのではありません。自分の駆動構造に合った環境に身を置いたとき、自然と走り出してしまう。その状態を意図的に作り出し、繰り返し、積み重ねていくこと。それが疾走領域の展開であり、人生を本気で生きるための自分だけの成長エンジンです。
                </p>
                <p className="text-base text-gray-300 leading-[2]">
                  人は努力では動きません。夢中で動きます。疾走領域（Drive Field）は、その夢中を構造として捉え、成長の方程式に変えるためのツールです。
                </p>
              </section>

            </div>
          )}

          {/* ═══ 5つの神経系 ═══ */}
          {tab === 'neuro' && (
            <div className="space-y-10">
              <section>
                <SectionHead title="5つの神経系とは" />
                <p className="text-base text-gray-300 leading-[2] mb-4">
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
                    <p className="text-base text-gray-300">{n.detail}</p>
                  </div>
                  <p className="text-base text-gray-300 leading-[2] mb-4">{n.high}</p>
                  <p className="text-sm text-gray-500 leading-[2]">{n.low}</p>
                </section>
              ))}
            </div>
          )}

          {/* ═══ 解析方法 ═══ */}
          {tab === 'method' && (
            <div className="space-y-10">

              {/* 01 */}
              <section>
                <SectionHead title="解析の概要" />
                <p className="text-base text-gray-300 leading-[2] mb-4">
                  疾走領域（Drive Field）は、52の問いに対するあなたの直感的な回答から、5つの神経系のスコアを算出します。
                </p>
                <p className="text-base text-gray-300 leading-[2]">
                  考えて答えるのではなく、感じて答えることで、あなたの無意識の駆動パターンが浮かび上がります。
                </p>
              </section>

              {/* 02 */}
              <section>
                <SectionHead title="絞り込みの4ステップ" />
                <p className="text-base text-gray-300 leading-[2] mb-6">
                  52問の回答から、段階的にあなた固有の疾走領域を特定していきます。
                </p>
                <div className="space-y-5">
                  {[
                    { step: 'STEP 1', title: '5つの神経系スコアを算出', desc: '52問の回答から、D（ドーパミン）・S（セロトニン）・O（オキシトシン）・N（ノルアドレナリン）・E（エンドルフィン）の5つの神経系スコアを数値化する。' },
                    { step: 'STEP 2', title: '上位3つの順列で60の骨格に分類', desc: 'スコア上位3つの神経系を抽出し、その順番で骨格を決定する。1位が点火装置、2位が加速装置、3位が持続装置として機能する。5つから3つを選ぶ順列で60通り。' },
                    { step: 'STEP 3', title: 'スコアの偏りから20の型に分類', desc: '1位の神経系（5種）と、スコアの偏り方——1位に集中する一点突破型、1位と2位が突出する二軸駆動型、上位3つが均衡する三位一体型、全体が均等な万能拡散型——の4種の掛け合わせで20型。' },
                    { step: 'STEP 4', title: '240の疾走領域を確定', desc: '60の骨格 × 4つの偏りタイプ = 240の疾走領域。2位と3位の神経系の組み合わせによって、同じ型でも走り方の質が変わる。その違いが固有の疾走領域名として表現される。' },
                  ].map((s) => (
                    <div key={s.step} className="border-l-2 border-white/10 pl-4">
                      <p className="text-[10px] text-gray-500 tracking-wider mb-1">{s.step}</p>
                      <p className="text-sm font-bold text-gray-100 mb-2">{s.title}</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 03 */}
              <section>
                <SectionHead title="さらに詳細な特性" />
                <p className="text-base text-gray-300 leading-[2] mb-6">
                  240の疾走領域に加え、以下の3つの特性があなたの「走り方」をさらに精密に描き出します。
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    { title: '発動方向', options: '外燃 / 内燃', desc: '外部の刺激で火が点くか、内側の衝動で火が点くか。エンジンの点火スイッチがどこにあるかを示す。' },
                    { title: '時間特性', options: '瞬発 / 熟成', desc: 'すぐに動き出せる瞬発型か、じわじわ温まって回り始める熟成型か。エンジンのかかり方を示す。' },
                    { title: '出力レベル', options: '低 / 中 / 高', desc: 'エネルギーの大きさ。安定して回す低出力か、爆発と休息を繰り返す高出力か。' },
                  ].map((item) => (
                    <div key={item.title} className="border border-white/5 rounded-lg p-3">
                      <p className="text-sm font-bold text-gray-200">{item.title}<span className="text-[10px] text-gray-500 font-normal ml-2">{item.options}</span></p>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 04 */}
              <section>
                <SectionHead title="2,880の駆動パターン" />
                <p className="text-base text-gray-300 leading-[2] mb-4">
                  240の疾走領域 × 発動方向（2種）× 時間特性（2種）× 出力レベル（3種）。
                </p>
                <p className="text-3xl font-bold text-white mb-4">
                  = 2,880通り
                </p>
                <p className="text-base text-gray-300 leading-[2]">
                  同じ疾走領域名でも、発動方向や時間特性が異なれば走り方は変わります。あなたの診断結果は、この2,880パターンの中から導き出された、あなただけの駆動マニュアルです。
                </p>
              </section>
            </div>
          )}

          {/* ═══ 想い ═══ */}
          {tab === 'thoughts' && (
            <div className="space-y-10">

              {/* 01 */}
              <section>
                <SectionHead title="このツールをつくった理由" />
                <p className="text-base text-gray-300 leading-[2] mb-4">
                  「人は努力で動かない。フィールドで動く。」
                </p>
                <p className="text-base text-gray-300 leading-[2] mb-4">
                  この言葉が、疾走領域（Drive Field）のすべての出発点です。
                </p>
                <p className="text-base text-gray-300 leading-[2] mb-4">
                  私たちが考えていたのは、適材適所のような単純な話ではありませんでした。どうすれば人から人に熱意が伝播するのか。どうすれば歓びを共有できるのか。どうすればお互いの長所を活かし合えるのか。そういうことを、ずっと考えてきました。
                </p>
                <p className="text-base text-gray-300 leading-[2] mb-4">
                  苦しい環境で歯を食いしばって頑張り続けている人を、たくさん見てきました。周囲との違いに悩み、「なぜ自分はうまくいかないのか」と自分を責めている人も。でも、それはその人が弱いからではないんです。ただ、自分の駆動構造に合わない場所で走ろうとしているだけなんです。
                </p>
                <p className="text-base text-gray-300 leading-[2]">
                  自分に合ったフィールドに立ったとき、人は努力を超えた力を発揮します。夢中になり、時間を忘れ、気づいたら走っている。そしてその熱は、自然と周りにも伝わっていく。その状態に名前をつけたものが「疾走領域」です。一人でも多くの人にその場所を見つけてほしい。その想いでこのツールをつくりました。
                </p>
              </section>

              {/* 02 */}
              <section>
                <SectionHead title="分類するためのツールではありません" />
                <p className="text-base text-gray-300 leading-[2] mb-4">
                  これは性格診断でも、占いでも、タイプ分け遊びでもありません。「あなたはこういうタイプです」とラベルを貼りたいわけでもありません。
                </p>
                <p className="text-base text-gray-300 leading-[2] mb-4">
                  私たちが本当にやりたかったのは、一人ひとりが自分の能力が最も自然に通る場所を見つけ、そこで走り続けるための具体的な方法を届けることです。
                </p>
                <p className="text-base text-gray-300 leading-[2]">
                  「自分はこういう人間だ」という思い込みの代わりに、「自分が最も自然に走れる場所はここだ」という確信を持ってもらえたら。診断結果を読んで終わりではなく、明日からの行動が少しでも変わるものにしたい。そう考えてつくっています。
                </p>
              </section>

              {/* 03 */}
              <section>
                <SectionHead title="能力を空振りさせたくない" />
                <p className="text-base text-gray-300 leading-[2] mb-4">
                  仕事がうまくいかないとき、多くの人が「自分の能力が足りない」と思います。でも、本当にそうでしょうか。
                </p>
                <p className="text-base text-gray-300 leading-[2] mb-4">
                  自分の駆動構造に合わない環境で能力を振るうことは、空振りし続けるようなものです。バットを振る力はある。タイミングも悪くない。ただ、ボールが来ていない。そんな状態を続けていたら、誰だって「自分はダメだ」と思ってしまいます。
                </p>
                <p className="text-base text-gray-300 leading-[2]">
                  疾走領域を知ることで、自分の力がちゃんと届く場所を理解できます。無理に自分を変える必要はありません。自分に合った場所で振れば、あなたの能力はちゃんと届くはずです。そのことを伝えたくて、このツールをつくりました。
                </p>
              </section>

              {/* 04 */}
              <section>
                <SectionHead title="人間関係にも使ってほしい" />
                <p className="text-base text-gray-300 leading-[2] mb-4">
                  人間関係の摩擦の多くは、互いの駆動構造の違いから生まれます。変化を求める人と安定を求める人。一人で没頭したい人と、人と一緒に動きたい人。どちらが正しいわけでもありません。ただ、エンジンの構造が違うだけです。
                </p>
                <p className="text-base text-gray-300 leading-[2] mb-4">
                  相手の疾走領域を知ると、「理解できない人」が「エンジンの違う人」に変わります。それだけで、驚くほど関係は楽になります。
                </p>
                <p className="text-base text-gray-300 leading-[2]">
                  パートナー、同僚、友人、家族。大切な人と互いの疾走領域を共有してみてください。「我慢して合わせる関係」が「それぞれの走り方を認め合って一緒に走る関係」に変わるきっかけになれたら、こんなに嬉しいことはありません。
                </p>
              </section>

              {/* 05 */}
              <section>
                <SectionHead title="人生を楽しみながら走ってほしい" />
                <p className="text-base text-gray-300 leading-[2] mb-4">
                  人生に正解はありません。でも、自分にとっての「走り方」はあると信じています。
                </p>
                <p className="text-base text-gray-300 leading-[2] mb-4">
                  誰かの成功パターンを真似ても、自分のエンジンに合っていなければ空回りするだけです。あなたにはあなたの点火条件があり、あなたの加速装置があり、あなたの持続装置があります。その組み合わせは、世界に一つだけのものです。
                </p>
                <p className="text-base text-gray-300 leading-[2] mb-4">
                  他人と比べて苦しむ必要はありません。自分の走り方で走っているとき、人は最も生き生きとし、最も深い充実感を得られます。疾走領域は、人生を楽しみながら走るための、あなただけの方法論です。
                </p>
                <p className="text-base text-gray-300 leading-[2]">
                  この診断が、あなたの仕事に、人間関係に、そして人生に、少しでも助けになれたら。心からそう願って、このツールをつくりました。
                </p>
              </section>
            </div>
          )}

          {/* ═══ 運営 ═══ */}
          {tab === 'company' && (
            <div className="space-y-10">
              <section>
                <SectionHead title="株式会社歓尽" />
                <p className="text-base text-gray-300 leading-[2] mb-4">
                  歓尽は、人の心を動かす力を信じ、本質に向き合う支援を積み重ねていく会社です。
                </p>
                <p className="text-base text-gray-300 leading-[2]">
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
                    <div key={item.label} className="flex border-b border-white/5 pb-3">
                      <span className="text-sm text-gray-500 w-36 shrink-0">{item.label}</span>
                      <span className="text-sm text-gray-300">{item.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <a
                  href="https://kanjin-consulting.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-float inline-block px-6 py-3 border border-white/20 text-white text-sm rounded-full"
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
