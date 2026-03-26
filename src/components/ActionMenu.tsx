'use client';

import { useState } from 'react';
import { Share2, Smartphone, PlusSquare, Bookmark, MessageCircle } from 'lucide-react';

interface ActionMenuProps {
  kanjiName: string;
  reading: string;
  englishName: string;
  kataName: string;
  rank1Jp: string;
  rank2Jp: string;
  rank3Jp: string;
  bias: string;
  ignition: string;
  timing: string;
  driveStructure: string;
  triggerCore: string;
  awakeningCondition: string;
  drainCondition: string;
  recoveryCondition: string;
}

export function ActionMenu(props: ActionMenuProps) {
  const [copied, setCopied] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const shareText = `疾走領域「${props.kanjiName}」（${props.reading}）\n${props.kataName}\n\n#疾走領域 #DriveField`;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `疾走領域「${props.kanjiName}」`, text: shareText, url: shareUrl }); } catch {}
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      flash();
    }
  };

  const handleBookmark = () => {
    alert('ブラウザのブックマーク機能（Ctrl+D / Cmd+D）でこのページを保存できます。URLはあなた専用の結果ページです。');
  };

  const handleAddToHome = () => {
    alert('ブラウザメニューの「ホーム画面に追加」からこのページをアプリのように追加できます。');
  };

  const handleWallpaper = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 1080, 1920);

    const grad = ctx.createRadialGradient(540, 960, 0, 540, 960, 800);
    grad.addColorStop(0, 'rgba(139, 37, 32, 0.6)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(props.kataName, 540, 760);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 160px serif';
    ctx.textAlign = 'center';
    const chars = props.kanjiName.split('');
    chars.forEach((char, i) => { ctx.fillText(char, 540, 900 + i * 180); });

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '28px sans-serif';
    ctx.fillText(props.reading, 540, 900 + chars.length * 180 + 40);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '20px sans-serif';
    ctx.fillText('Drive Field', 540, 1800);

    const link = document.createElement('a');
    link.download = `drivefield-${props.kanjiName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleAiConsult = async () => {
    const prompt = `あなたは「疾走領域（Drive Field）」の診断結果に基づいて、ユーザーの相談に乗るアドバイザーです。

以下がこのユーザーの診断結果です。この情報を前提として、ユーザーの相談に親身に答えてください。

---
疾走領域名: ${props.kanjiName}（${props.reading} / ${props.englishName}）
型: ${props.kataName}
偏りタイプ: ${props.bias}

神経系優先順位:
- 1位（点火）: ${props.rank1Jp}
- 2位（加速）: ${props.rank2Jp}
- 3位（持続）: ${props.rank3Jp}

駆動構造: ${props.driveStructure}
発動方向: ${props.ignition}
時間特性: ${props.timing}

起動条件: ${props.triggerCore}
覚醒条件: ${props.awakeningCondition}
ドレイン条件: ${props.drainCondition}
回復条件: ${props.recoveryCondition}
---

このユーザーの駆動構造を深く理解した上で、以下のルールで回答してください:
- ユーザーの疾走領域の特性に合わせた具体的なアドバイスをする
- 一般論ではなく、この人の神経系の組み合わせに基づいた回答をする
- 「あなたの場合は〇〇なので、△△がおすすめです」のように個別具体的に答える
- 仕事・人間関係・人生の相談に対応する
- 温かく、でも的確に

ではユーザーの相談を聞いてください。最初に軽く自己紹介と、この人の疾走領域の特徴を簡潔に述べてから「何についてお話しましょうか？」と聞いてください。`;

    await navigator.clipboard.writeText(prompt);
    flash();
  };

  const flash = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const actions = [
    { label: 'シェア', icon: <Share2 size={16} />, onClick: handleShare },
    { label: '壁紙', icon: <Smartphone size={16} />, onClick: handleWallpaper },
    { label: 'HOME追加', icon: <PlusSquare size={16} />, onClick: handleAddToHome },
    { label: 'ブックマーク', icon: <Bookmark size={16} />, onClick: handleBookmark },
    { label: 'AIに相談', icon: <MessageCircle size={16} />, onClick: handleAiConsult },
  ];

  return (
    <>
      {/* コピー通知 */}
      {copied && (
        <div className="fixed bottom-20 right-20 z-50 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          コピーしました
        </div>
      )}

      {/* SP: 下部バー */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-700 flex justify-around py-2 px-1">
        {actions.map((a, i) => (
          <button
            key={i}
            onClick={a.onClick}
            className="flex flex-col items-center gap-0.5 py-1 px-2 text-gray-400 hover:text-white transition-colors"
          >
            <span>{a.icon}</span>
            <span className="text-[9px]">{a.label}</span>
          </button>
        ))}
      </div>

      {/* PC: 右サイドバー（ホバーで伸びる） */}
      <div className="hidden md:flex fixed bottom-6 right-4 z-50 flex-col-reverse items-end gap-2">
        {actions.map((a, i) => (
          <button
            key={i}
            onClick={a.onClick}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            className="flex items-center gap-1.5 h-8 bg-gray-900 border border-gray-700 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 overflow-hidden"
            style={{ paddingLeft: 8, paddingRight: hoveredIdx === i ? 12 : 8, width: hoveredIdx === i ? 'auto' : 32 }}
          >
            <span className="shrink-0">{a.icon}</span>
            <span
              className="text-[10px] text-gray-300 whitespace-nowrap transition-all duration-300 overflow-hidden"
              style={{
                maxWidth: hoveredIdx === i ? 100 : 0,
                opacity: hoveredIdx === i ? 1 : 0,
              }}
            >
              {a.label}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
