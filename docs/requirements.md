# プロダクト管理アプリ 要件定義

## はじめに

個人開発のプロダクト数が増えてきたことにより、各プロダクトの進捗・ステータス・リリース履歴を横断的に管理する必要が生じた。
また、技術ブログ（パリッと開発日記）のプロダクト情報をこのアプリのDBから直接参照させることで、データの二重管理を解消する。

## コンセプト

- **プロダクト管理アプリがマスターデータ**：プロダクトに関する情報（画像含む）はすべてこのアプリのDB・ストレージに正規データとして持つ
- **技術ブログは参照側**：ブログのプロダクト一覧・詳細ページは同じSupabase DBに直接接続してデータを取得する
- **セルフホスト可能な設計**：リポジトリをクローンすれば誰でも同じように利用できる前提で設計する（ユーザーは常に1人）

## 技術スタック

| 領域 | 技術 |
| --- | --- |
| フレームワーク | Next.js (App Router) / TypeScript |
| ORM | Prisma |
| DB | Supabase (PostgreSQL) |
| 画像ストレージ | Supabase Storage |
| スタイル | Tailwind CSS / shadcn/ui |
| 認証 | Better Auth（Yarukotoと同様） |
| ホスティング | Vercel |
| ブログ連携 | ブログから同一Supabase DBに直接接続（Prisma Client） |

## MVPスコープ

以下をMVPとして実装する。

- プロダクトCRUD（基本情報・画像管理）
- ステータス管理・ステータス履歴
- リリースノート管理（下書き機能付き）
- 開発タスク管理（DevTask）
- 認証（Better Auth）

### MVPスコープ外（後日検討）

- ユーザーフィードバック管理 — 後述の検討事項を参照
- 改善メモ・バグ管理 — 後述の検討事項を参照
- slugのバリデーションルール — 技術ブログの改修時にあわせて検討

## 機能要件

### 1. プロダクト管理（CRUD）

プロダクト1件あたり以下の情報を管理する。

#### 基本情報

「公開」列は、ブログ側（isPublic=true時）に表示される項目を示す。管理アプリ側ではすべての項目が表示される。

| フィールド | 型 | 必須 | 公開 | 説明 |
| --- | --- | --- | --- | --- |
| name | string | ◯ | ◯ | プロダクト名（例: Yarukoto） |
| slug | string | ◯ | ◯ | URL用識別子（例: yarukoto） |
| description | text | ◯ | ◯ | 概要説明（短め、1〜2文） |
| longDescription | text | | ◯ | 詳細説明 |
| category | enum | ◯ | ◯ | アプリ / MCP / サイト |
| status | enum | ◯ | ◯ | 構想中 / 開発中 / リリース済 / メンテナンス / 休止中 |
| releaseDate | date | | ◯ | 初回リリース日 |
| stacks | string[] | | ◯ | 技術スタック（例: ["Next.js", "Supabase", "Prisma"]） |
| repositoryUrl | string | | ◯ | GitHubリポジトリURL |
| productUrl | string | | ◯ | 公開URL |
| note | text | | | 備考（ホスティングサービス・アカウント、DBサービス・アカウントなど運用情報） |
| sortOrder | int | | | 表示順（表示順の制御に使用、値自体は非公開） |
| isPublic | boolean | ◯ | | ブログで公開するかどうか |

#### 画像管理

プロダクトごとに複数の画像を管理する。すべてSupabase Storageにアップロードし、公開URLを保存する。画像はすべてブログ側に公開される（isPublic=trueのプロダクトの場合）。

| フィールド | 型 | 必須 | 公開 | 説明 |
| --- | --- | --- | --- | --- |
| url | string | ◯ | ◯ | Supabase Storageの公開URL |
| alt | string | | ◯ | 代替テキスト |
| isThumbnail | boolean | ◯ | ◯ | サムネイル画像かどうか（プロダクトにつき最大1枚） |
| sortOrder | int | | | 表示順 |

- サムネイル画像がないプロダクトにも対応する（ブログ側でプレースホルダー表示）
- 管理画面にアップロードUI・並び替え・サムネイル指定のUIを設ける

### 2. ステータス管理

各プロダクトのステータス遷移:

```
構想中 → 開発中 → リリース済 → メンテナンス
                              → 休止中
```

ステータス変更時には任意でメモを残せるようにする（ステータス履歴）。

ステータス履歴は以下の情報を持つ:

| フィールド | 型 | 必須 | 公開 | 説明 |
| --- | --- | --- | --- | --- |
| from | enum | ◯ | ◯ | 変更前のステータス |
| to | enum | ◯ | ◯ | 変更後のステータス |
| note | text | | | 変更理由などのメモ |
| createdAt | datetime | ◯ | ◯ | 変更日時（自動記録） |

ブログ側でもステータス履歴を表示し、プロダクトが使える状態かどうかを閲覧者が判断できるようにする。

### 3. リリースノート・変更履歴

プロダクトごとにリリースノートを管理する。各リポジトリの `CHANGELOG.md` とは別管理とする。

| フィールド | 型 | 必須 | 公開 | 説明 |
| --- | --- | --- | --- | --- |
| version | string | ◯ | ◯ | バージョン（例: v1.0.0, v1.1） |
| title | string | ◯ | ◯ | リリースタイトル |
| content | text | ◯ | ◯ | 変更内容（マークダウン対応） |
| releaseDate | date | ◯ | ◯ | リリース日 |
| type | enum | ◯ | ◯ | メジャー / マイナー / パッチ / ホットフィックス |
| isDraft | boolean | ◯ | | 下書きかどうか（trueの場合、ブログ側で非表示） |

※ 各リポジトリでは `package.json` の `version` が正本、`CHANGELOG.md` に変更履歴を記録するワークフローを運用中。プロダクト管理アプリのリリースノートは、ブログ向けにより整理された形で別途管理する位置づけ。

### 4. 開発タスク管理（DevTask）

プロダクト単位で、機能追加・バグ修正・改善をまとまった単位で追跡する。日々の「今日やること」レベルのタスクはYarukotoで管理し、プロダクト管理アプリでは中長期的に追跡が必要なものを扱う。

#### データ構造

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| title | string | ◯ | タスク名 |
| description | text | | 詳細（マークダウン対応） |
| type | enum | ◯ | 機能追加 / バグ修正 / 改善 |
| status | enum | ◯ | 未着手 / 進行中 / 完了 / 保留 |
| priority | enum | | 高 / 中 / 低 |
| productId | string | ◯ | 紐付くプロダクト |
| createdAt | datetime | ◯ | 作成日時 |
| updatedAt | datetime | ◯ | 更新日時 |

#### YarukotoとDevTaskの棲み分け

| | Yarukoto | プロダクト管理アプリ（DevTask） |
| --- | --- | --- |
| 粒度 | 日単位の小さなタスク | 機能・バグ単位のまとまった作業 |
| 期間 | 今日〜数日 | 中長期（期限なしも可） |
| 分類 | カテゴリ（プロダクトごと） | type（機能追加/バグ/改善）+ priority |
| 用途 | 「今日やること」の管理 | プロダクトの課題を俯瞰・追跡 |

#### 管理画面での表示

- プロダクト詳細ページにタブとして追加
- ステータスでフィルタ・タイプでフィルタ・優先度でフィルタ
- 簡易的なリスト表示（カンバンは将来検討）

### 5. ブログ連携（直接DB接続）

技術ブログ（パリッと開発日記）は、プロダクト管理アプリと同一のSupabase DBにPrisma Clientで直接接続してデータを取得する。

#### 接続構成

```
┌─────────────────────┐     ┌─────────────────────┐
│  プロダクト管理アプリ  │     │  技術ブログ           │
│  (Next.js / Vercel)  │     │  (Next.js / Vercel)  │
│  読み書き             │     │  読み取り専用          │
└──────────┬──────────┘     └──────────┬──────────┘
           │                           │
           └───────────┬───────────────┘
                       │
              ┌────────▼────────┐
              │  Supabase       │
              │  PostgreSQL     │
              │  + Storage      │
              └─────────────────┘
```

#### ブログ側の実装イメージ

```typescript
// ブログ側: lib/prisma.ts
// プロダクト管理アプリからスキーマファイルを手動コピーして使用
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default prisma;
```

```typescript
// ブログ側: app/products/page.tsx
import prisma from '@/lib/prisma';

async function getProducts() {
  return prisma.product.findMany({
    where: { isPublic: true },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
    },
    orderBy: { sortOrder: 'asc' },
  });
}
```

#### Prismaスキーマの共有方法

プロダクト管理アプリのPrismaスキーマファイル（`schema.prisma`）をブログ側のリポジトリに手動コピーして同期する。

- 正本はプロダクト管理アプリ側の `schema.prisma`
- スキーマ変更時にブログ側のファイルを手動で更新する
- スキーマの変更頻度は低い想定なので、手動コピーで十分

#### セキュリティ

- ブログ側は読み取り専用のDB接続文字列を使用する（Supabaseのロール設定で書き込み権限を制限）
- `isPublic = false` のプロダクトはブログ側のクエリで除外する
- `isDraft = true` のリリースノートはブログ側のクエリで除外する
- DevTask はブログ側に公開しない

## ページ構成

### プロダクト管理アプリ側

#### ダッシュボード（一覧）

- プロダクト一覧をカード形式で表示
- 各カードにはプロダクト名、カテゴリ、ステータスバッジ、技術スタック、最終更新日を表示
- ステータス・カテゴリでフィルタ可能
- ソート（名前順 / 更新日順 / リリース日順）

#### プロダクト詳細ページ

タブまたはセクションで以下を表示:

1. **概要** — 基本情報、技術スタック、備考
2. **タスク** — DevTaskの一覧・フィルタ・追加
3. **画像** — アップロード済み画像の一覧・管理
4. **リリースノート** — バージョン履歴（新しい順）
5. **ステータス履歴** — ステータス変更のログ

#### プロダクト作成・編集

- フォームで基本情報を入力
- カテゴリはセレクトボックス（アプリ / MCP / サイト）
- 技術スタックはタグ入力UI（自由入力 + サジェスト）
- 画像のアップロード・並び替え・サムネイル指定
- 備考はテキストエリア（運用情報を自由記述）

### ブログ側（パリッと開発日記）

#### プロダクト一覧ページ（/products）

- DBから直接データを取得して表示
- サムネイル画像付きのカード形式で一覧表示
- サムネイル画像がないプロダクトはプレースホルダーを表示
- カテゴリで絞り込み可能

#### プロダクト詳細ページ（/products/:slug）

- プロダクト名
- 概要説明（description）
- 詳細説明（longDescription）
- 画像ギャラリー（画像がない場合は非表示）
- 関連記事一覧（frontmatterの `productSlug` で紐付け、該当なしの場合は非表示）
- GitHubリポジトリURL
- プロダクトURL

#### 記事のfrontmatter変更

```yaml
---
title: "日々のタスク管理に特化したWebアプリ「Yarukoto」を作りました"
date: "2025-01-02"
description: "Yarukotoの核となるコンセプトは..."
tags: ["個人開発", "TODOリスト"]
productSlug: "yarukoto"  # ← 追加: プロダクト管理アプリのslugと一致させる
---
```

## DB設計（Prisma）

```prisma
model Product {
  id              String          @id @default(cuid())
  name            String
  slug            String          @unique
  description     String
  longDescription String?
  category        ProductCategory
  status          ProductStatus   @default(IDEA)
  releaseDate     DateTime?
  stacks          String[]
  repositoryUrl   String?
  productUrl      String?
  note            String?
  sortOrder       Int             @default(0)
  isPublic        Boolean         @default(false)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  images          ProductImage[]
  releases        Release[]
  statusHistory   StatusHistory[]
  tasks           DevTask[]
}

enum ProductCategory {
  APP
  MCP
  SITE
}

enum ProductStatus {
  IDEA
  DEVELOPING
  RELEASED
  MAINTENANCE
  PAUSED
}

model ProductImage {
  id          String  @id @default(cuid())
  url         String
  alt         String?
  isThumbnail Boolean @default(false)
  sortOrder   Int     @default(0)
  productId   String
  product     Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model Release {
  id          String      @id @default(cuid())
  version     String
  title       String
  content     String
  releaseDate DateTime
  type        ReleaseType
  isDraft     Boolean     @default(true)
  productId   String
  createdAt   DateTime    @default(now())
  product     Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
}

enum ReleaseType {
  MAJOR
  MINOR
  PATCH
  HOTFIX
}

model StatusHistory {
  id        String        @id @default(cuid())
  from      ProductStatus
  to        ProductStatus
  note      String?
  productId String
  createdAt DateTime      @default(now())
  product   Product       @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model DevTask {
  id          String        @id @default(cuid())
  title       String
  description String?
  type        DevTaskType
  status      DevTaskStatus @default(TODO)
  priority    Priority?
  productId   String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  product     Product       @relation(fields: [productId], references: [id], onDelete: Cascade)
}

enum DevTaskType {
  FEATURE
  BUG
  IMPROVEMENT
}

enum DevTaskStatus {
  TODO
  IN_PROGRESS
  DONE
  ON_HOLD
}

enum Priority {
  HIGH
  MEDIUM
  LOW
}
```

## 非機能要件

| 項目 | 内容 |
| --- | --- |
| 認証 | Better Auth（メール+パスワード、将来的にソーシャルログイン） |
| デプロイ | Vercel |
| DB | Supabase PostgreSQL（管理アプリ・ブログで共有） |
| 画像ストレージ | Supabase Storage |
| レスポンシブ（管理アプリ） | PC向け（モバイルでも壊れない最低限の対応） |
| レスポンシブ（ブログ側） | モバイルファースト |
| パフォーマンス | ページ読み込み3秒以内 |
| データ | Supabase自動バックアップ |

## 権限

| 操作 | 権限 |
| --- | --- |
| プロダクト作成・編集・削除 | ログインユーザー（管理アプリ） |
| リリースノート追加 | ログインユーザー（管理アプリ） |
| DevTask追加・編集・削除 | ログインユーザー（管理アプリ） |
| 画像アップロード・削除 | ログインユーザー（管理アプリ） |
| ブログ側のデータ表示 | 読み取り専用DB接続（isPublic=trueのみ、DevTaskは非公開） |

## ブログ移行計画

1. プロダクト管理アプリをリリースし、既存プロダクト情報・画像を登録する
2. ブログ側にPrisma Clientを導入し、同一Supabase DBに接続する設定を行う
3. ブログの既存記事のfrontmatterに `productSlug` を追加する
4. ブログにプロダクト一覧ページ（`/products`）を新設し、DBからデータを取得して表示する
5. ブログにプロダクト詳細ページ（`/products/:slug`）を新設し、プロダクト情報・画像・関連記事を表示する
6. 既存のWorksページ（`/posts/products`）から新しいプロダクト一覧ページへリダイレクトする

## MVPスコープ外の検討事項

### ユーザーフィードバック管理

プロダクトを使った人からのフィードバック（要望・バグ報告・感想・質問）を記録する機能。MVPリリース後に必要性を再評価して導入を検討する。

### 改善メモ・バグ管理

以下の選択肢を検討中:

#### 選択肢A: アプリ内レイヤー分離
改善メモ・バグを「フィード」として専用UIに分離。ダッシュボードとは別の軽いメモ画面で、素早く書き込める。プロダクトとの紐付けは任意。

#### 選択肢B: Yarukoto連携（推奨）
Yarukotoのタスクにプロダクトタグを付けられるようにして、プロダクト管理アプリからYarukotoのAPIを参照して表示する。改善メモの「書く場所」はYarukoto（普段使い）、「見る場所」はプロダクト管理アプリ。

#### 選択肢C: GitHub Issues連携
改善メモ・バグをGitHub Issuesとして管理し、プロダクト管理アプリはGitHub APIで取得・表示する。開発者向けのワークフローとして自然。

#### 選択肢D: マークダウンファイル外部管理（現状維持+α）
今のマークダウン管理をそのまま続けつつ、プロダクト管理アプリからファイルを読み込んで表示する。変更頻度の高いデータをDBの外に出す思想。

**推奨**: 選択肢Bが最も自然。Yarukotoは毎日使うアプリで、改善アイデアを思いついた瞬間に記録する場所として最適。プロダクト管理アプリはそれを集約・俯瞰する場所と位置づける。
