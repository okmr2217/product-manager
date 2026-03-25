# プロダクト管理アプリ — アーキテクチャ設計書

## 目次

0. [実装方針（決定事項まとめ）](#実装方針決定事項まとめ)
1. [ディレクトリ構成・プロジェクト構造](#1-ディレクトリ構成プロジェクト構造)
2. [画面設計・UI設計](#2-画面設計ui設計)
3. [データフロー・状態管理](#3-データフロー状態管理)
4. [Supabase設定設計](#4-supabase設定設計)
5. [認証フロー](#5-認証フロー)
6. [ブログ側の接続設計](#6-ブログ側の接続設計)

---

## 実装方針（決定事項まとめ）

設計の詳細に入る前に、実装全体に影響する方針を整理する。

### データ更新方式

Server Actions 中心。API Routes は Better Auth 用のみ。

### フィードバックUI

保存成功・失敗・バリデーションエラーは Sonner（shadcn/ui 推奨のトースト）で通知する。

```
shadcn/ui add sonner
```

Server Action の戻り値の型:

```typescript
type ActionResult = {
  success: boolean;
  error?: string;          // 全体エラー
  fieldErrors?: Record<string, string[]>;  // フィールド単位のバリデーションエラー
};
```

フィールド単位のエラーはフォーム内にインライン表示し、全体エラー（DB接続失敗等）はトーストで表示する。

### slug

手動入力のみ。自動生成しない。バリデーション: `/^[a-z0-9-]+$/`

### プロダクト削除時の挙動

1. `AlertDialog` で確認（プロダクト名の入力を求める）
2. Supabase Storage 上の画像を一括削除（`{productId}/` フォルダごと）
3. DB レコードを削除（Cascade で関連テーブルも削除）
4. ダッシュボード（`/dashboard`）にリダイレクト
5. トーストで「削除しました」を表示

### マークダウンプレビュー

MVPでは実装しない。リリースノート・DevTaskのマークダウンは入力のみ。後日 `react-markdown` + `remark-gfm` で追加予定。

### 初期ユーザー

signupページを常に公開する。セルフホスト前提のため、アクセス制限はインフラ側（Vercelの認証等）で必要に応じて行う。

### レスポンシブ

PC向けを主とするが、モバイルでもレイアウトが壊れない最低限の対応をする。具体的には:
- サイドバー: モバイルではハンバーガーメニューで開閉（shadcn/ui `Sheet` を使用）
- カードグリッド: モバイルでは1カラムに切り替え
- フォーム: 幅100%で収まるよう調整
- テーブル・リスト: 横スクロールなしで収まるよう調整

### 環境変数一覧

```env
# DB
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"

# Better Auth
BETTER_AUTH_SECRET="[ランダム文字列]"
BETTER_AUTH_URL="http://localhost:3000"  # 本番: https://[domain]

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon key]"
SUPABASE_SERVICE_ROLE_KEY="[service role key]"
```

---

## 技術スタック・バージョン方針

AIコード生成との相性を重視し、最新版よりも安定版を優先する。

| パッケージ | バージョン | 備考 |
|-----------|----------|------|
| Next.js | 15.x | App Router |
| React | 19.x | Next.js 15 に合わせる |
| TypeScript | 5.x | |
| Prisma | 6.x | |
| @supabase/supabase-js | 2.x | Storage用 |
| better-auth | 1.x | |
| shadcn/ui | latest | CLI で都度追加 |
| tailwindcss | 4.x | Next.js 15 標準 |
| zod | 3.x | |
| @dnd-kit/core, @dnd-kit/sortable | 6.x | 画像並び替え |
| sonner | 2.x | トースト通知（shadcn/ui推奨） |

### フォント

Noto Sans JP + Roboto を使用。`next/font` で最適化する。

```typescript
// app/layout.tsx
import { Noto_Sans_JP } from "next/font/google";
import { Roboto } from "next/font/google";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
  display: "swap",
});

// body に適用
<body className={`${notoSansJP.variable} ${roboto.variable} font-sans`}>
```

Tailwind CSS で `font-sans` のフォールバックチェーンを設定:

```css
/* globals.css */
@theme {
  --font-sans: var(--font-noto-sans-jp), var(--font-roboto), sans-serif;
}
```

日本語は Noto Sans JP、英数字は Roboto が優先される。

---

## 1. ディレクトリ構成・プロジェクト構造

### App Router ルーティング設計

```
src/
├── app/
│   ├── layout.tsx                    # ルートレイアウト（フォント、テーマ）
│   ├── page.tsx                      # "/" → /dashboard へリダイレクト
│   │
│   ├── (auth)/                       # 認証グループ（サイドバーなしレイアウト）
│   │   ├── layout.tsx                # 認証ページ用の最小レイアウト
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   │
│   ├── (app)/                        # アプリ本体グループ（サイドバー付きレイアウト）
│   │   ├── layout.tsx                # サイドバー + ヘッダーのレイアウト
│   │   ├── dashboard/page.tsx        # プロダクト一覧（ダッシュボード）
│   │   └── products/
│   │       ├── new/page.tsx          # プロダクト作成
│   │       └── [slug]/
│   │           ├── page.tsx          # プロダクト詳細（概要タブ）
│   │           ├── edit/page.tsx     # プロダクト編集
│   │           ├── images/page.tsx   # 画像管理タブ
│   │           ├── releases/
│   │           │   ├── page.tsx      # リリースノート一覧タブ
│   │           │   ├── new/page.tsx  # リリースノート作成
│   │           │   └── [id]/
│   │           │       └── edit/page.tsx  # リリースノート編集
│   │           ├── tasks/
│   │           │   ├── page.tsx      # DevTask一覧タブ
│   │           │   ├── new/page.tsx  # DevTask作成
│   │           │   └── [id]/
│   │           │       └── edit/page.tsx  # DevTask編集
│   │           └── history/page.tsx  # ステータス履歴タブ
│   │
│   └── api/
│       └── auth/[...all]/route.ts    # Better Auth APIルート
│
├── components/
│   ├── ui/                           # shadcn/ui コンポーネント（自動生成）
│   ├── layout/
│   │   ├── sidebar.tsx               # サイドバー（Client Component）
│   │   ├── header.tsx                # ヘッダー（ユーザーメニュー）
│   │   └── page-header.tsx           # ページタイトル + パンくず
│   ├── products/
│   │   ├── product-card.tsx          # ダッシュボードのカード
│   │   ├── product-form.tsx          # 作成・編集フォーム（共通）
│   │   ├── status-badge.tsx          # ステータスバッジ
│   │   ├── category-badge.tsx        # カテゴリバッジ
│   │   ├── stack-tags.tsx            # 技術スタックのタグ表示
│   │   ├── status-change-dialog.tsx  # ステータス変更ダイアログ
│   │   └── delete-dialog.tsx         # 削除確認ダイアログ
│   ├── images/
│   │   ├── image-upload.tsx          # アップロードUI（ドラッグ&ドロップ）
│   │   ├── image-grid.tsx            # 画像一覧（並び替え対応）
│   │   └── image-card.tsx            # 個別画像カード
│   ├── releases/
│   │   ├── release-form.tsx          # リリースノートフォーム
│   │   ├── release-card.tsx          # リリースノートカード
│   │   └── release-type-badge.tsx    # リリースタイプバッジ
│   ├── tasks/
│   │   ├── task-form.tsx             # DevTaskフォーム
│   │   ├── task-list.tsx             # DevTaskリスト（フィルタ付き）
│   │   ├── task-card.tsx             # DevTaskカード
│   │   ├── task-type-badge.tsx       # タイプバッジ（機能追加/バグ/改善）
│   │   ├── task-status-badge.tsx     # ステータスバッジ（未着手/進行中/完了/保留）
│   │   └── task-priority-badge.tsx   # 優先度バッジ（高/中/低）
│   └── filters/
│       ├── status-filter.tsx         # ステータスフィルタ
│       ├── category-filter.tsx       # カテゴリフィルタ
│       └── sort-select.tsx           # ソート選択
│
├── lib/
│   ├── prisma.ts                     # Prisma Client シングルトン
│   ├── auth.ts                       # Better Auth 設定
│   ├── auth-client.ts                # Better Auth クライアント
│   ├── supabase.ts                   # Supabase Client（Storage用）
│   └── utils.ts                      # ユーティリティ（cn関数など）
│
├── actions/
│   ├── products.ts                   # プロダクトCRUD Server Actions
│   ├── images.ts                     # 画像管理 Server Actions
│   ├── releases.ts                   # リリースノート Server Actions
│   ├── tasks.ts                      # DevTask Server Actions
│   └── status.ts                     # ステータス変更 Server Actions
│
├── schemas/
│   ├── product.ts                    # Zodスキーマ（プロダクト）
│   ├── release.ts                    # Zodスキーマ（リリースノート）
│   ├── task.ts                       # Zodスキーマ（DevTask）
│   └── status.ts                     # Zodスキーマ（ステータス変更）
│
├── types/
│   └── index.ts                      # Prisma型の拡張・ユーティリティ型
│
├── hooks/
│   └── use-upload.ts                 # 画像アップロード用カスタムフック
│
├── constants/
│   └── index.ts                      # ステータス・カテゴリの表示名、色定義
│
└── prisma/
    └── schema.prisma                 # Prismaスキーマ（正本）
```

### Server Components / Client Components 使い分け方針

| 種別 | Server Component | Client Component |
|------|:---:|:---:|
| ページ本体（データ取得・表示） | ◯ | |
| レイアウト | ◯ | |
| フォーム（入力・バリデーション） | | ◯ |
| フィルタ・ソートUI | | ◯ |
| ダイアログ・モーダル | | ◯ |
| 画像アップロード | | ◯ |
| 画像並び替え（ドラッグ&ドロップ） | | ◯ |
| バッジ・タグ（表示のみ） | ◯ | |
| サイドバー | | ◯（アクティブ状態の判定に `usePathname` が必要） |
| ヘッダー（ユーザーメニュー） | | ◯ |

**原則**: データ取得はServer Component、ユーザーインタラクションはClient Component。Server ComponentからClient Componentにpropsでデータを渡すパターンを基本とする。

サイドバーはプロダクト一覧を表示するため、`(app)/layout.tsx`（Server Component）でプロダクト一覧を取得し、Client Componentの `<Sidebar products={products} />` にpropsで渡す。

---

## 2. 画面設計・UI設計

### サイドバー

プロダクト一覧をフラットに常時表示する。プロダクト数は10件前後を想定しており、折りたたみは不要。

```
┌─────────────────┐
│  Product Manager │  ← アプリ名（/dashboard へリンク）
│                  │
│  ────────────────│
│  📊 ダッシュボード │  ← 常にトップに固定
│                  │
│  プロダクト        │  ← セクションラベル（リンクではない）
│  ────────────────│
│  ● Yarukoto      │  ← ステータスの色ドット + プロダクト名
│  ● ブログ         │     クリック → /products/[slug]
│  ● furikaeri-mcp │
│  ● product-mgr   │
│  ...             │
│                  │
│                  │
│  ────────────────│
│  [+ 新規作成]     │  ← サイドバー下部に固定
│                  │
│  ────────────────│
│  👤 ユーザー名    │  ← ログアウトメニュー
└─────────────────┘
```

**設計判断の根拠**:

- プロダクト数が少ない（〜10件）ので折りたたみは操作の無駄
- ステータスの色ドットにより、サイドバーだけで各プロダクトの状況を一覧できる
- ダッシュボードはカード形式の俯瞰ビュー、サイドバーは素早いナビゲーション用と役割を分離
- アクティブなプロダクト（現在表示中）は背景色でハイライト

**shadcn/ui コンポーネント**:
- `Button` variant="ghost" — ナビゲーションリンク
- `DropdownMenu` — ユーザーメニュー（ログアウト）
- `Separator` — 区切り線

### ダッシュボード（プロダクト一覧）

```
┌──────────────────────────────────────────────────────────────────┐
│ [サイドバー]  │  ダッシュボード                                     │
│               │                                                    │
│ 📊 ダッシュ   │  [ステータス▼] [カテゴリ▼] [ソート▼]               │
│               │                                                    │
│ プロダクト     │  ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│ ● Yarukoto   │  │ 🖼 サムネイル  │ │ 🖼 サムネイル  │ │ (なし)     │ │
│ ● ブログ      │  │              │ │              │ │            │ │
│ ● mcp        │  │ Yarukoto     │ │ ブログ        │ │ mcp        │ │
│               │  │ [アプリ]      │ │ [サイト]      │ │ [MCP]      │ │
│ [+ 新規作成]  │  │ [リリース済]  │ │ [リリース済]  │ │ [開発中]   │ │
│               │  │              │ │              │ │            │ │
│ 👤 user      │  │ Next.js +2   │ │ Next.js +1   │ │ TS +1      │ │
│               │  │ 更新: 3/20   │ │ 更新: 3/18   │ │ 更新: 3/10 │ │
│               │  └──────────────┘ └──────────────┘ └────────────┘ │
│               │                                                    │
│               │  ┌──────────────┐ ┌──────────────┐                │
│               │  │ ...          │ │ ...          │                │
│               │  └──────────────┘ └──────────────┘                │
└──────────────────────────────────────────────────────────────────┘
```

**カード内の情報構成**:
- サムネイル画像（あれば上部に表示、なければプレースホルダー）
- プロダクト名（太字）
- `CategoryBadge` + `StatusBadge`（横並び）
- 技術スタック（タグ、最大2つ + 「+N」表示）
- 最終更新日

**shadcn/ui コンポーネント**:
- `Card`, `CardHeader`, `CardContent` — プロダクトカード
- `Badge` — ステータス・カテゴリ
- `Select` — フィルタ・ソート
- `Button` — 新規作成（サイドバーにも配置）

### プロダクト詳細ページ

タブ構成で切り替え。各タブは独立ページ（URLで直接アクセス可能）。

```
┌──────────────────────────────────────────────────────────────────┐
│ [サイドバー]  │  ← ダッシュボード                                   │
│               │                                                    │
│               │  Yarukoto              [リリース済]  [編集] [削除]  │
│               │  日々のタスク管理アプリ                               │
│               │                                                    │
│               │  [概要] [タスク] [画像] [リリースノート] [履歴]       │
│               │  ──────────────────────────────────────────────    │
│               │                                                    │
│               │  （選択中タブの内容が表示される）                      │
│               │                                                    │
└──────────────────────────────────────────────────────────────────┘
```

タブの実装: URL連動ナビゲーション。shadcn/ui の `Tabs` は使わず、ナビゲーションリンクとして実装し、アクティブタブは `usePathname` で判定する。

```
タブ → URLマッピング:
  概要           → /products/[slug]
  タスク         → /products/[slug]/tasks
  画像           → /products/[slug]/images
  リリースノート → /products/[slug]/releases
  ステータス履歴 → /products/[slug]/history
```

#### 概要タブ

```
  説明:
    日々のタスク管理に特化したWebアプリ

  詳細説明:
    （longDescriptionの内容）

  カテゴリ: アプリ
  ステータス: リリース済  [ステータスを変更]
  リリース日: 2025-01-02
  URL: https://yarukoto.example.com
  リポジトリ: https://github.com/user/yarukoto

  技術スタック:
    [Next.js] [Supabase] [Prisma] [Tailwind CSS]

  備考:
    Vercel (個人アカウント)、Supabase (Freeプラン)
```

- `ステータスを変更` ボタン → ダイアログ表示（変更先ステータス選択 + メモ入力）
- shadcn/ui: `Dialog`（ステータス変更）, `Select`（変更先ステータス）, `Textarea`（メモ）

#### タスクタブ（DevTask）

```
  [+ タスクを追加]

  [ステータス▼ すべて] [タイプ▼ すべて] [優先度▼ すべて]

  ┌─────────────────────────────────────────────────────┐
  │ ☐ ダークモード対応             [機能追加] [高] [未着手] │
  │   UIのダークモード切り替え機能を追加する                  │
  │                                              [編集]  │
  ├─────────────────────────────────────────────────────┤
  │ ☐ ログイン画面のレイアウト崩れ   [バグ修正] [中] [進行中] │
  │   Safari で横幅が溢れる                                │
  │                                              [編集]  │
  ├─────────────────────────────────────────────────────┤
  │ ☑ パフォーマンス改善            [改善]    [低] [完了]  │
  │   ダッシュボードの初回読み込みを高速化                   │
  │                                              [編集]  │
  └─────────────────────────────────────────────────────┘
```

- リスト形式で表示（カンバンは将来検討）
- フィルタ: ステータス、タイプ、優先度
- 完了タスクはチェック済み + テキスト薄め表示
- デフォルト: 完了タスクは下部に表示、それ以外は優先度順
- shadcn/ui: `Checkbox`, `Badge`, `Select`（フィルタ）

#### 画像タブ

```
  [+ 画像をアップロード]

  ┌────────┐ ┌────────┐ ┌────────┐
  │ 画像1  │ │ 画像2  │ │ 画像3  │
  │        │ │        │ │        │
  │ ★ サム │ │        │ │        │
  │ [削除] │ │ [削除] │ │ [削除] │
  └────────┘ └────────┘ └────────┘
  （ドラッグで並び替え可能）
```

- サムネイル指定: 画像カードにスター/チェックボックスで指定
- ドラッグ&ドロップ並び替え: `@dnd-kit/sortable` を使用
- shadcn/ui: `Dialog`（アップロードモーダル）, `AlertDialog`（削除確認）

#### リリースノートタブ

```
  [+ リリースノートを追加]

  v1.2.0 — タスクカテゴリ機能追加        [マイナー] 2025-03-15
  タスクにカテゴリを設定できるようになりました...
                                                    [編集]

  v1.1.0 — UI改善                        [マイナー] 2025-02-20  [下書き]
  ダッシュボードのレイアウトを刷新...
                                                    [編集]

  v1.0.0 — 初回リリース                  [メジャー] 2025-01-02
  Yarukotoの初回リリース...
                                                    [編集]
```

- 下書き状態は `[下書き]` バッジで明示
- shadcn/ui: `Badge`（リリースタイプ・下書き）

#### ステータス履歴タブ

```
  ● リリース済 ← 開発中     2025-01-02
    初回リリース完了

  ● 開発中 ← 構想中         2024-11-15
    開発開始
```

- タイムライン形式で表示（縦線 + ドット）

### 作成・編集フォーム

#### プロダクトフォーム

```
  プロダクト名 *        [________________]
  スラッグ *            [________________]  ← 名前から自動生成（編集可）
  概要説明 *            [________________]
  詳細説明              [                ]
                        [    テキストエリア    ]

  カテゴリ *            [アプリ ▼]
  リリース日            [カレンダー選択]

  技術スタック          [Next.js ×] [Supabase ×] [入力して追加...]
                        サジェスト: React, TypeScript, Prisma, ...

  リポジトリURL         [________________]
  プロダクトURL         [________________]

  備考                  [                ]
                        [    テキストエリア    ]

  表示順                [0___]
  ☐ ブログで公開する

                        [キャンセル] [保存]
```

#### DevTaskフォーム

```
  タスク名 *            [________________]
  詳細                  [                ]
                        [    テキストエリア（マークダウン）    ]

  タイプ *              [機能追加 ▼]
  ステータス *          [未着手 ▼]
  優先度                [中 ▼]

                        [キャンセル] [保存]
```

**shadcn/ui コンポーネント（共通）**:
- `Input` — テキスト入力
- `Textarea` — 長文入力
- `Select` — 列挙型の選択
- `Calendar` + `Popover` — 日付選択
- `Switch` — isPublic
- `Button` — 保存・キャンセル
- カスタム: タグ入力コンポーネント（技術スタック用）

### バッジデザイン

```
プロダクトステータス:
  構想中 (IDEA):           slate   (灰)
  開発中 (DEVELOPING):     blue    (青)
  リリース済 (RELEASED):   green   (緑)
  メンテナンス (MAINTENANCE): yellow (黄)
  休止中 (PAUSED):         red     (赤)

カテゴリ:
  アプリ (APP):            purple  (紫)
  MCP:                     orange  (橙)
  サイト (SITE):           cyan    (水色)

リリースタイプ:
  メジャー (MAJOR):        red     (赤)
  マイナー (MINOR):        blue    (青)
  パッチ (PATCH):          green   (緑)
  ホットフィックス (HOTFIX): yellow (黄)

DevTaskタイプ:
  機能追加 (FEATURE):      blue    (青)
  バグ修正 (BUG):          red     (赤)
  改善 (IMPROVEMENT):      green   (緑)

DevTaskステータス:
  未着手 (TODO):           slate   (灰)
  進行中 (IN_PROGRESS):    blue    (青)
  完了 (DONE):             green   (緑)
  保留 (ON_HOLD):          yellow  (黄)

優先度:
  高 (HIGH):               red     (赤)
  中 (MEDIUM):             yellow  (黄)
  低 (LOW):                slate   (灰)
```

バッジの実装: shadcn/ui の `Badge` コンポーネントに `className` で色を制御。`constants/index.ts` で enum値 → 表示名・色クラスのマッピングを定義する。

---

## 3. データフロー・状態管理

### 方針: Server Actions 中心

すべてのデータ変更操作は Server Actions で実装する。API Routes は Better Auth 用のみ。

```
[ページ (Server Component)]
  ↓ Prisma でデータ取得
  ↓ props で渡す
[フォーム (Client Component)]
  ↓ useActionState + Server Action 呼び出し
[Server Action (actions/*.ts)]
  ↓ Zod バリデーション
  ↓ Prisma でDB操作
  ↓ revalidatePath で再描画
[ページが再描画される]
```

### Server Actions 一覧

```typescript
// actions/products.ts
createProduct(formData: FormData): Promise<ActionResult>
updateProduct(id: string, formData: FormData): Promise<ActionResult>
deleteProduct(id: string): Promise<ActionResult>
  // → Supabase Storage の {productId}/ フォルダを一括削除
  // → DB レコードを削除（Cascade で images, releases, tasks, statusHistory も削除）
  // → revalidatePath("/dashboard") + redirect("/dashboard")

// actions/status.ts
changeStatus(productId: string, data: StatusChangeInput): Promise<ActionResult>
  // → Product.status を更新 + StatusHistory レコードを同時作成（トランザクション）

// actions/images.ts
createImageRecord(productId: string, data: ImageInput): Promise<ActionResult>
  // → Supabase Storage にアップロード済みのURLをDBに保存
deleteImage(imageId: string): Promise<ActionResult>
  // → Supabase Storage から削除 + DB レコード削除
setThumbnail(imageId: string, productId: string): Promise<ActionResult>
  // → 既存のサムネイルフラグを解除 + 新しい画像にフラグ設定
reorderImages(productId: string, orderedIds: string[]): Promise<ActionResult>

// actions/releases.ts
createRelease(productId: string, formData: FormData): Promise<ActionResult>
updateRelease(id: string, formData: FormData): Promise<ActionResult>
deleteRelease(id: string): Promise<ActionResult>

// actions/tasks.ts
createTask(productId: string, formData: FormData): Promise<ActionResult>
updateTask(id: string, formData: FormData): Promise<ActionResult>
deleteTask(id: string): Promise<ActionResult>
```

### バリデーション（Zod）

```typescript
// schemas/product.ts
export const productSchema = z.object({
  name: z.string().min(1, "プロダクト名は必須です"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "小文字英数字とハイフンのみ"),
  description: z.string().min(1, "概要説明は必須です"),
  longDescription: z.string().optional(),
  category: z.enum(["APP", "MCP", "SITE"]),
  releaseDate: z.date().optional(),
  stacks: z.array(z.string()),
  repositoryUrl: z.string().url().optional().or(z.literal("")),
  productUrl: z.string().url().optional().or(z.literal("")),
  note: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isPublic: z.boolean().default(false),
});

// schemas/release.ts
export const releaseSchema = z.object({
  version: z.string().min(1, "バージョンは必須です"),
  title: z.string().min(1, "タイトルは必須です"),
  content: z.string().min(1, "内容は必須です"),
  releaseDate: z.date(),
  type: z.enum(["MAJOR", "MINOR", "PATCH", "HOTFIX"]),
  isDraft: z.boolean().default(true),
});

// schemas/task.ts
export const taskSchema = z.object({
  title: z.string().min(1, "タスク名は必須です"),
  description: z.string().optional(),
  type: z.enum(["FEATURE", "BUG", "IMPROVEMENT"]),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "ON_HOLD"]),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
});

// schemas/status.ts
export const statusChangeSchema = z.object({
  to: z.enum(["IDEA", "DEVELOPING", "RELEASED", "MAINTENANCE", "PAUSED"]),
  note: z.string().optional(),
});
```

### 画像アップロードフロー

```
1. ユーザーが画像を選択（Client Component）
2. クライアントから Supabase Storage へ直接アップロード
   - バケット: product-images
   - パス: {productId}/{cuid}.{ext}
3. アップロード完了 → 公開URLを取得
4. Server Action を呼び出して DB に ProductImage レコードを作成
   - url, alt, isThumbnail, sortOrder を保存
5. revalidatePath で画像一覧を再描画
```

Supabase Storageへの直接アップロードにする理由: Server Actionを経由するとファイルサイズの制限が厳しく、大きな画像で問題が起きやすい。Supabase Storageのクライアントライブラリを使えば直接アップロードでき、認証もSupabaseのAPIキーで制御できる。

### ステータス変更時の自動履歴記録

```typescript
// actions/status.ts
export async function changeStatus(productId: string, data: StatusChangeInput) {
  const validated = statusChangeSchema.parse(data);

  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
  });

  // トランザクションで Product更新 + StatusHistory作成 を同時実行
  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { status: validated.to },
    }),
    prisma.statusHistory.create({
      data: {
        from: product.status,
        to: validated.to,
        note: validated.note,
        productId,
      },
    }),
  ]);

  revalidatePath(`/products/${product.slug}`);
}
```

---

## 4. Supabase設定設計

### Storage バケット構成

```
バケット名: product-images
種別: Public（公開バケット）
フォルダ構造:
  product-images/
    └── {productId}/
        ├── abc123.png
        ├── def456.jpg
        └── ...
```

- Public バケットにする理由: ブログ側から画像URLで直接参照するため
- ファイル名: cuid で生成（重複回避）
- 許可するファイル形式: image/png, image/jpeg, image/webp, image/gif
- 最大ファイルサイズ: 5MB

### RLS（Row Level Security）

**使わない方針**。理由:

1. Prisma Client からの接続には `service_role` キーを使用するため、RLSはバイパスされる
2. アプリケーション層（認証ミドルウェア + Server Actions内の認証チェック）でアクセス制御する
3. ユーザーが常に1人のセルフホスト設計なので、RLSの複雑さに見合うメリットがない

### 読み取り専用ロールの設定

ブログ側の接続用に、読み取り専用のデータベースロールを作成する。

```sql
-- 読み取り専用ロールの作成
CREATE ROLE blog_reader WITH LOGIN PASSWORD 'xxx';

-- 必要なテーブルへのSELECT権限のみ付与
GRANT USAGE ON SCHEMA public TO blog_reader;
GRANT SELECT ON "Product", "ProductImage", "Release", "StatusHistory" TO blog_reader;
-- DevTask はブログ側に公開しないため権限を付与しない
```

接続文字列:
- 管理アプリ: `postgresql://postgres:[password]@[host]:5432/postgres` （フル権限）
- ブログ: `postgresql://blog_reader:[password]@[host]:5432/postgres` （SELECT のみ）

### Supabase Storage のポリシー

画像アップロードはクライアント直接アップロード方式のため、Storageポリシーを設定する。

```sql
-- Public バケットなので読み取りは誰でも可能（デフォルト）

-- アップロードポリシー（認証済みユーザーのみ）
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- 削除ポリシー
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
```

---

## 5. 認証フロー

### Better Auth セットアップ

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  // 将来的にソーシャルログインを追加可能
});
```

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();
export const { signIn, signUp, signOut, useSession } = authClient;
```

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### 認証導線

```
未認証ユーザー
  ↓ 任意のページにアクセス
  ↓ middleware.ts で認証チェック
  ↓ 未認証 → /login にリダイレクト
  ↓ ログイン成功
  ↓ /dashboard にリダイレクト

ログイン済みユーザー
  ↓ /login にアクセス
  ↓ /dashboard にリダイレクト
```

### Middleware

```typescript
// middleware.ts
import { betterFetch } from "@better-fetch/fetch";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await betterFetch("/api/auth/get-session", {
    baseURL: request.nextUrl.origin,
    headers: { cookie: request.headers.get("cookie") || "" },
  });

  if (!session.data) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|login|signup|_next/static|_next/image|favicon.ico).*)"],
};
```

### Server Actions 内の認証チェック

すべての Server Action で共通の認証チェックをヘルパー関数として切り出す:

```typescript
// lib/auth.ts に追加
import { headers } from "next/headers";

export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}
```

```typescript
// actions/products.ts での使用例
import { requireAuth } from "@/lib/auth";

export async function createProduct(formData: FormData) {
  await requireAuth();
  // ... 処理
}
```

---

## 6. ブログ側の接続設計

### Prisma スキーマのコピー運用ルール

| 項目 | ルール |
|------|--------|
| 正本 | プロダクト管理アプリの `prisma/schema.prisma` |
| コピー先 | ブログリポジトリの `prisma/schema.prisma` |
| コピータイミング | スキーマ変更後、ブログ側のデプロイ前に手動コピー |
| 差分 | datasource の url のみ異なる（読み取り専用接続文字列） |
| generator | 両方とも `prisma-client-js` を使用 |

コピー時の手順:

```bash
# 1. 管理アプリ側でマイグレーション実行
cd product-manager
npx prisma migrate dev --name [migration_name]

# 2. ブログ側にスキーマをコピー
cp prisma/schema.prisma ../blog/prisma/schema.prisma

# 3. ブログ側の datasource url は環境変数で制御（schema.prisma は同一）

# 4. ブログ側で Prisma Client を再生成
cd ../blog
npx prisma generate
```

### 読み取り専用の接続文字列管理

```
# ブログ側 .env
DATABASE_URL="postgresql://blog_reader:xxx@[host]:5432/postgres"
```

- Vercel の環境変数に設定
- `blog_reader` ロールは SELECT 権限のみ

### ブログ側で使うクエリ一覧

```typescript
// ① プロダクト一覧取得（/products ページ）
prisma.product.findMany({
  where: { isPublic: true },
  include: {
    images: {
      orderBy: { sortOrder: "asc" },
    },
  },
  orderBy: { sortOrder: "asc" },
});

// ② プロダクト詳細取得（/products/:slug ページ）
prisma.product.findUnique({
  where: { slug, isPublic: true },
  include: {
    images: {
      orderBy: { sortOrder: "asc" },
    },
    releases: {
      where: { isDraft: false },
      orderBy: { releaseDate: "desc" },
    },
    statusHistory: {
      orderBy: { createdAt: "desc" },
    },
  },
});

// ③ プロダクト一覧（カテゴリフィルタ付き）
prisma.product.findMany({
  where: {
    isPublic: true,
    category: categoryFilter, // オプション
  },
  include: {
    images: {
      where: { isThumbnail: true },
      take: 1,
    },
  },
  orderBy: { sortOrder: "asc" },
});
```

**注意**: DevTask はブログ側に公開しない。`blog_reader` ロールにも `DevTask` テーブルへの権限は付与しない。

### ブログ側での注意事項

- **isDraft チェック**: リリースノートは必ず `isDraft: false` でフィルタする
- **isPublic チェック**: プロダクトは必ず `isPublic: true` でフィルタする
- **書き込み禁止**: `blog_reader` ロールでは write 操作はDBレベルでエラーになるが、コード上でも create/update/delete を呼ばないよう注意
- **キャッシュ**: Next.js の ISR（revalidate）を活用して、DB負荷を軽減する。`revalidate = 60`（60秒）程度を推奨

---

## 補足: 技術スタックのサジェスト機能

技術スタック入力のサジェストは、既存プロダクトで使われている `stacks` の値をDBから取得して候補として表示する。

```typescript
// 既存のスタック一覧を取得するクエリ
const existingStacks = await prisma.product.findMany({
  select: { stacks: true },
});

const uniqueStacks = [...new Set(existingStacks.flatMap((p) => p.stacks))];
```

固定の候補リスト（`constants/index.ts`）+ DB上の既存値をマージしてサジェストに使用する。
