import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import namesData from '@/data/names-240.json';
import kataData from '@/data/l4-kata.json';

// ─── Lookups ──────────────────────────────────────────

interface NameEntry { id: string; kanji_name: string; reading: string; english_name: string; naming_reason: string; }
interface KataEntry { id: string; rank1: string; bias: string; name: string; }

const namesMap: Record<string, NameEntry> = {};
for (const n of namesData as NameEntry[]) namesMap[n.id] = n;

const kataMap: Record<string, KataEntry> = {};
for (const k of kataData as KataEntry[]) kataMap[k.id] = k;

// ─── Color definitions ───────────────────────────────

const NEURO_COLOR: Record<string, { bg: string; accent: string; accentSub: string }> = {
  D: { bg: '#8b2520', accent: '#c0392b', accentSub: '#e74c3c' },
  S: { bg: '#1a3a4a', accent: '#2e6b8a', accentSub: '#3498db' },
  O: { bg: '#1a3d32', accent: '#27806a', accentSub: '#2ecc71' },
  N: { bg: '#3d3010', accent: '#b8860b', accentSub: '#f39c12' },
  E: { bg: '#2d1f45', accent: '#7b5ea7', accentSub: '#9b59b6' },
};

const BIAS_JP: Record<string, string> = {
  Single: '一点突破型', Dual: '二軸駆動型', Trinity: '三位一体型', Flat: '万能拡散型',
};

// ─── Catchphrase extraction ──────────────────────────

function extractCatchphrase(namingReason: string): string {
  const raw = namingReason
    .split('。')
    .filter((s) => !s.includes('優先漢字') && !s.includes('使用漢字'))
    .map((s) => s.trim())
    .filter(Boolean)[0] || '';
  const match = raw.match(/[、。]([^、。]*$)/) || raw.match(/を[、]?(.+)/);
  return match ? match[1].replace(/として表現$/, '').replace(/を象徴$/, '').trim() : raw;
}

// ─── Route handler ───────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return new Response('Missing id parameter', { status: 400 });
    }

    const entry = namesMap[id];
    if (!entry) {
      return new Response('Entry not found', { status: 404 });
    }

    const parts = id.split('-');
    const rank1 = parts[0];
    const bias = parts[3] ?? '';
    const kata = kataMap[`${rank1}-${bias}`];
    const colors = NEURO_COLOR[rank1] || NEURO_COLOR.D;
    const catchphrase = extractCatchphrase(entry.naming_reason);

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.bg,
            position: 'relative',
          }}
        >
          {/* 型名 */}
          <div style={{ display: 'flex', fontSize: 22, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.2em', marginBottom: 28 }}>
            {kata?.name || ''}
          </div>

          {/* 疾走領域名（漢字） */}
          <div style={{ display: 'flex', fontSize: 120, fontWeight: 700, color: 'white', letterSpacing: '0.15em', lineHeight: 1.1, marginBottom: 8 }}>
            {entry.kanji_name}
          </div>

          {/* reading / English */}
          <div style={{ display: 'flex', fontSize: 18, color: 'rgba(255,255,255,0.6)', marginBottom: 32 }}>
            {entry.reading} / {entry.english_name}
          </div>

          {/* キャッチコピー */}
          <div style={{ display: 'flex', fontSize: 20, color: 'rgba(255,255,255,0.85)', maxWidth: 800, textAlign: 'center', lineHeight: 1.6, marginBottom: 28 }}>
            {catchphrase}
          </div>

          {/* 偏りタイプ */}
          <div style={{ display: 'flex', fontSize: 14, color: colors.accentSub, border: `1px solid ${colors.accentSub}`, borderRadius: 20, padding: '6px 18px', letterSpacing: '0.1em' }}>
            {BIAS_JP[bias] || bias}
          </div>

          {/* フッター */}
          <div style={{ display: 'flex', position: 'absolute', bottom: 24, fontSize: 14, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em' }}>
            疾走領域 / Drive Field
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e) {
    return new Response(`OG image generation failed: ${e}`, { status: 500 });
  }
}
