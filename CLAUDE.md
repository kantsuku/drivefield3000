# Drive Field 3000 / 疾走領域

## Why — このシステムは何をするのか

神経系プロファイル（D/S/O/N/E）から2880パターンの「疾走領域」を導出する診断ツール。
ユーザーが自分の**成長スパイラル**を開眼し、能力が最も自然かつ必中効果的に通る**疾走領域**を見出すためのシステム。

**コアバリュー**: 人は努力で動かない。フィールドで動く。

## What — どこに何があるのか

```
drive-field-3000/
├── CLAUDE.md                    ← このファイル
├── docs/requirements/           ← 要件定義（世界観・診断ロジック・命名・UI・式神・紋章・データ仕様）
│   ├── 00_readme.md             ← 要件読む順番ガイド
│   ├── 01_project_overview.md   ← サービス概要・コアコンセプト
│   ├── 02_worldview_and_concepts.md ← 世界観（鏡・開眼・展開・真名・式神・紋章）
│   ├── 03_diagnosis_logic.md    ← 診断ロジック（5神経系×偏り×出力×発動×時間＝2880）
│   ├── 04_naming_and_dictionary.md  ← 命名ルール・漢字辞書・類義語群
│   ├── 05_result_experience_and_ui.md ← 結果体験・演出・シェア・壁紙
│   ├── 06_shikigami_and_emblem.md   ← 式神AI・紋章（目）の5層文法
│   └── 07_data_and_system_spec.md   ← データ構造・シート構成・データフロー
├── src/
│   ├── app/                     ← Next.js App Router ページ
│   │   ├── layout.tsx           ← ルートレイアウト（OGP設定）
│   │   ├── page.tsx             ← トップページ
│   │   ├── globals.css          ← Tailwind CSS
│   │   ├── diagnosis/page.tsx   ← 診断ページ
│   │   └── result/[id]/page.tsx ← 結果ページ（動的ルート）
│   ├── data/                    ← 静的JSONデータ（CDN配信）
│   │   ├── patterns-2880.json   ← 2880パターン（メインDB）
│   │   ├── core-60.json         ← 60骨格定義
│   │   ├── kanji-dictionary.json← 漢字辞書（235件）
│   │   ├── synonym-groups.json  ← 類義語群（34件）
│   │   └── dictionaries.json    ← 神経系・偏り・出力の定義辞書
│   ├── lib/types.ts             ← TypeScript型定義
│   └── components/              ← UIコンポーネント
├── scripts/
│   └── convert-excel.ts         ← Excel(720) → JSON(2880) 変換スクリプト
├── supabase/
│   └── schema.sql               ← ユーザー結果保存テーブル定義
└── public/images/               ← 静的アセット
```

## How — どうやって作業を進めるのか

### 技術スタック
- **フロント**: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- **ホスティング**: Vercel（静的 + Edge Functions）
- **データ配信**: 2880パターンは静的JSON（DBアクセス不要、CDNで爆速）
- **ユーザー結果保存**: Supabase (PostgreSQL)
- **OGP画像**: @vercel/og で動的生成（予定）
- **母艦DB**: スプレッドシート → `scripts/convert-excel.ts` → JSON

### 診断構造
- 5神経系: D(ドーパミン), S(セロトニン), O(オキシトシン), N(ノルアドレナリン), E(エンドルフィン)
- 60骨格 (上位3の順列 5P3) × 4偏り × 3出力 × 2発動方向 × 2時間特性 = **2880パターン**
- ブランド名は **Drive Field 3000**

### データ更新フロー
```
Excel母艦 (720パターン + 辞書)
  ↓ npm run convert-data
JSON (2880パターン, src/data/)
  ↓ next build
静的配信 (Vercel CDN)
```

### 開発コマンド
```bash
npm run dev           # 開発サーバー起動
npm run build         # プロダクションビルド
npm run convert-data  # Excel → JSON変換
```

## Rules — 守るべきルール

- **口調**: 開発時は惣流・アスカ・ラングレー風で統一
- **世界観厳守**: 勝手な世界観の追加・命名量産はしない
- **核概念を崩さない**: 「開眼」「展開」「疾走領域」は不可侵
- **「分類ツール」に寄せない**: これは分類ではなく開眼の儀式
- **バズ設計**: スマホファースト、OGPシェア必須、3秒以内に結果表示
- **静的配信原則**: パターンデータはJSON、DBアクセスはユーザー結果保存のみ
- **既存データ保護**: Excel母艦を上書きしない、列名を統一する
