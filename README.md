# DriveField 3000 — 疾走領域診断

脳科学ベースのプロフィール診断ツール。5つの神経伝達物質システム（ドーパミン・セロトニン・オキシトシン・ノルアドレナリン・エンドルフィン）を軸に、ユーザー固有の「能力が最も自然に発揮される領域」を特定する。

> 人は努力では動かない。正しいフィールドで動く。

## 技術スタック

- **Next.js 16** (App Router) + TypeScript + React 19
- **Tailwind CSS 4** + カスタムアニメーション（リップル・ウェーブ）
- **Supabase** (PostgreSQL) — ユーザー結果の永続化
- **Claude API** — 式神AI相談・名前生成・コピーリライト
- **Vercel** — ホスティング + OGP動的画像生成
- **静的JSON** — 2,880パターン + 60コア + 240フィールド名

## 主要機能

- **診断システム**: 5層モデル・最大80問の設問で神経構造をマッピング
- **2,880パターンエンジン**: 60コア × 4バイアス × 3出力 × 2点火方向 × 2時間特性
- **結果体験**: 神経伝達物質カラーテーマ、240の象徴的フィールド名、OGP画像生成
- **管理パネル**: Names-240管理、設問編集、OGPプレビュー、Claude連携バッチ処理
- **式神AI相談**: Claude APIによるパーソナライズド・コンサルテーション

## セットアップ

```bash
npm install
npm run dev    # http://localhost:3040
```

### 環境変数 (.env.local)

```
ANTHROPIC_API_KEY=    # Claude API
ADMIN_API_KEY=        # 管理パネル認証
```

### データ管理

```bash
npm run convert-data   # Excel(720) → JSON(2,880パターン)に展開
npm run sync-names     # 240フィールド名を同期
```

## ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx              # トップページ（ヒーロー + リップルボタン）
│   ├── diagnosis/page.tsx    # 80問の診断フォーム
│   ├── result/[id]/page.tsx  # 動的結果表示（1,478行）
│   ├── admin/                # 管理パネル
│   └── api/                  # OGP生成・サジェスト・同期
├── components/               # UIコンポーネント
├── lib/                      # スコアリング・データローダー・認証
└── data/                     # 2,880パターンJSON（約3.5MB）
scripts/                      # 27本のビルド・変換スクリプト
docs/requirements/            # 7部構成の仕様書
supabase/schema.sql           # PostgreSQLスキーマ
```

## デプロイ

- **本番**: https://drivefield3000.vercel.app
- **ビルド出力**: `/tmp/df3000-next`（カスタムdistDir）
