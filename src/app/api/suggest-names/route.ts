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
      prompt = `疾走領域「${name}」(id: ${id})の命名理由とリード文を生成してください。
rank1=${r1}(${NEURO[r1]}), rank2=${r2}(${NEURO[r2]}), rank3=${r3}(${NEURO[r3]}), bias=${bias}(${BIAS[bias]})
色テーマ: ${theme.color}

## 命名理由
- 1文で「[情景描写]、[短いキャッチコピー10〜20字]。」の形式
- 漢字名「${name}」の意味・イメージに準拠
- 診断用語は使わない

## リード文
- 200字程度
- 漢字名「${name}」のイメージを膨らませた詩的な文章
- rank1/2/3の性質を暗示的に織り込む（用語自体は使わない）
- 色テーマ（${theme.color}）に合った情景描写

JSON1つで返してください:
{"naming_reason":"命名理由1文。","lead":"リード文200字程度。"}`;

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
