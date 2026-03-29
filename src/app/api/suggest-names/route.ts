import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const COLOR_THEME: Record<string, { color: string; imagery: string }> = {
  D: { color: '赤', imagery: '火、炎、紅、朱、焔、陽、灼、烈、熾、鳳、虎、獅、猛、闘、嵐' },
  S: { color: '青', imagery: '水、氷、蒼、碧、海、月、霧、雨、霜、鏡、泉、澄、潮、涼、鶴' },
  O: { color: '緑', imagery: '森、風、翠、葉、花、草、春、桜、絆、芽、蔦、蝶、鳥、園、実' },
  N: { color: '黄/金', imagery: '雷、光、金、土、閃、稲妻、砂、琥珀、鋼、剣、岩、鍛、砦、盾' },
  E: { color: '紫', imagery: '夜、星、夢、幻、紫、藤、菫、月影、深淵、闇、霊、魂、宵、朧、幽' },
};

const NEURO: Record<string, string> = {
  D: 'ドーパミン（新規・可能性）', S: 'セロトニン（理解・秩序）',
  O: 'オキシトシン（共感・接続）', N: 'ノルアドレナリン（緊張・集中）',
  E: 'エンドルフィン（快感・没入）',
};

const BIAS: Record<string, string> = {
  Single: '一点突破', Dual: '二軸駆動', Trinity: '三極共鳴', Flat: '万能拡散',
};

export async function POST(req: NextRequest) {
  try {
    const { id, field, current, kanjiName } = await req.json();
    const parts = id.split('-');
    const [r1, r2, r3, bias] = parts;
    const theme = COLOR_THEME[r1];
    if (!theme) return NextResponse.json({ error: 'invalid rank1' }, { status: 400 });

    let prompt = '';

    if (field === 'kanji_name') {
      prompt = `「${id}」の疾走領域名の候補を5つ提案してください。
現在: ${current}
rank1=${r1}(${NEURO[r1]}), rank2=${r2}(${NEURO[r2]}), rank3=${r3}(${NEURO[r3]}), bias=${bias}(${BIAS[bias]})

ルール:
- 必ず漢字2文字
- 色テーマは${theme.color}。使うイメージ: ${theme.imagery}
- bias特徴: Single=鋭い特化, Dual=二つの融合, Trinity=三つの調和, Flat=広がり
- 現在のものと違う提案を

JSON配列で返してください: [{"kanji_name":"XX","reading":"xx","english_name":"Xx Xx"}]`;

    } else if (field === 'naming_reason') {
      const name = kanjiName || current;
      prompt = `疾走領域「${name}」(id: ${id})の命名理由（キャッチコピー）の候補を5つ提案してください。
rank1=${r1}(${NEURO[r1]}), rank2=${r2}(${NEURO[r2]}), rank3=${r3}(${NEURO[r3]}), bias=${bias}(${BIAS[bias]})
色テーマ: ${theme.color}
現在の命名理由: ${current}

ルール:
- 1文で「[情景描写]、[短いキャッチコピー10〜20字]。」の形式
- 漢字名「${name}」の意味・イメージに準拠すること
- 診断用語（ドーパミン等）は使わない
- 「表現」「象徴」「最適」等の選定メモ的言葉は使わない
- 短く詩的に

良い例:
- 桜の優美さと弓の精密性
- 切り拓く猛虎の突破力
- 星の輝きと獣の野性

JSON配列で返してください: [{"naming_reason":"ここに1文。"}]`;

    } else if (field === 'cascade') {
      // 名前変更時にコピー＋リード文を連動生成
      const name = kanjiName || '';
      const BIAS_DESC: Record<string, string> = {
        Single: '一点突破——1位の衝動が圧倒的に突出',
        Dual: '二軸駆動——1位と2位が拮抗・融合',
        Trinity: '三極共鳴——1位〜3位が均衡して回転',
        Flat: '万能拡散——五衝動がフラットに分散',
      };

      const LANDSCAPE: Record<string, string> = {
        D: '灼熱の荒野、紅い砂塵、炎の道、溶岩の河、赤い空、焔の嵐',
        S: '氷の湖、蒼い深海、霧の谷、月光の平原、凍てつく結晶、静寂の水面',
        O: '花畑、深い森、木漏れ日の道、蔦に覆われた廃墟、桜吹雪、春の草原',
        N: '雷雲の荒野、黄金の砂漠、稲妻の走る大地、剣が突き刺さった丘、鍛冶の火花',
        E: '紫の霧の森、星空の海、夢と現の境界、月影の庭園、幽玄の闇、発光する蝶',
      };

      prompt = `疾走領域「${name}」(id: ${id})の読み・英語名・キャッチコピー・リード文を生成してください。
rank1=${r1}(${NEURO[r1]}), rank2=${r2}(${NEURO[r2]}), rank3=${r3}(${NEURO[r3]}), bias=${bias}(${BIAS_DESC[bias]})
色テーマ: ${theme.color}（${theme.imagery}）
風景の素材: ${LANDSCAPE[r1]}

## 読み（reading）
- 漢字名「${name}」のふりがな（ひらがな）

## 英語名（english_name）
- 漢字名「${name}」の意味を反映した英訳（Title Case、2〜3語）

## キャッチコピー（naming_reason）

### 形式
「[情景や動作の描写]、[体言止めのキャッチコピー]。」

### 文体ルール
- **体言止め（名詞で終わる）こと。動詞で文を閉じない。**
- 読点「、」で情景と結論を繋ぐ
- 全体で20〜35文字程度
- 短くかっこよく

### 良い例
- 未踏を裂く、猛虎の爪痕。
- すべてを統べる、炎の頂点。
- 曇りなき氷面が映す、構造の本質。
- 静寂から研ぎ出された、最も鋭い一手。
- 一点に宿る、揺るぎない愛の芯。
- 幽玄を舞う蝶、三つの感性の共鳴。

### 悪い例（絶対にやらないこと）
- ❌ 「三つの知性が重なり、深い共鳴を生む。」（動詞で終わってる）
- ❌ 「猛虎が荒野を切り拓いていく。」（動詞で終わってる）
- ❌ 「ドーパミン1位特化」（診断用語）

### 禁止ワード
ドーパミン、セロトニン、オキシトシン、ノルアドレナリン、エンドルフィン、神経系、表現、象徴、最適、力強く

## リード文（lead）

### 役割
疾走領域を展開したときに見える**固有の風景・情景**を描写する。

### 形式
- **80〜100字**（厳守）
- 2〜3文
- 疾走領域の中に広がる風景を描く

### 良い例
「地平線まで続く紅い荒野。溶岩の河が大地を割り、その中央に一本だけ炎の道が真っ直ぐ伸びている。赤い空から焔の嵐が降り注ぐ中、炎の道は領域となり、遥か彼方の頂へと続いていく。」
「二つの溶岩の流れが穏やかに合流する地点。赤き流面が鏡のように空を映し、炎の粒子が静かに舞い踊る。二つの流れが一つになる領域で、心が熱く満たされる。」
「黄金色の雷雲が低く垂れ込める荒野。大地には無数の剣が突き刺さり、空気が帯電している。この張り詰めた領域で、意識が極限まで研ぎ澄まされる。」

### 最終文のルール（最重要）
- 最終文に「領域」という言葉を必ず入れる
- 「〜は領域となり」「この領域で」「領域そのものであり」「〜の領域では」等の形で使う
- 「足を踏み入れた瞬間〜」等の体験者視点は使わない。風景そのものが領域であるという描写にする

### 禁止事項
- 診断用語（ドーパミン、セロトニン等）は使わない
- 現実の比喩（締め切り、オフィス等）は使わない
- 「領域内に入ると」「領域を展開すると」等のメタ表現は使わない
- 説明的にならない。風景を描く。

### ポイント
- 漢字名のイメージを風景に反映する（虎→虎がいる、氷→氷がある等）
- bias(偏り)で世界の質感を変える：
  - Single: 一点だけが際立つ風景（一本の道、一振りの剣、一輪の花）
  - Dual: 二つの要素が対峙・融合する風景（対岸、二つの月、交差する道）
  - Trinity: 三つの要素が調和する風景（三つの山、三重の虹、三つの音）
  - Flat: 広く満ちた風景（地平線、海原、大草原、満天の星）

## 出力形式
JSON1つで返してください:
{"reading":"ふりがな","english_name":"English Name","naming_reason":"コピー1文。","lead":"リード文80〜100字。"}`;

    } else {
      return NextResponse.json({ error: 'unsupported field' }, { status: 400 });
    }

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = (msg.content[0] as any).text;

    if (field === 'cascade') {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return NextResponse.json({ error: 'parse error' }, { status: 500 });
      const result = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ result });
    } else {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return NextResponse.json({ error: 'parse error' }, { status: 500 });
      const suggestions = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ suggestions });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
