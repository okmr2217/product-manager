# プロダクトデータ一覧

プロダクト管理アプリへの登録用データ。12プロダクト分のフィールド・リリースノート・ステータス履歴をまとめる。

---

## 1. Yarukoto

### 基本情報

| フィールド | 値 |
|---|---|
| name | Yarukoto |
| slug | yarukoto |
| description | 日々のタスク管理に特化したWebアプリ |
| longDescription | シンプルなUIで今日やることを素早く記録・管理できるタスク管理アプリ。プロダクトごとにカテゴリ分けしてタスクを整理できる。 |
| category | APP |
| status | RELEASED |
| releaseDate | 2026-01-01 |
| stacks | Next.js, TypeScript, Prisma, Supabase, Better Auth, Tailwind CSS, shadcn/ui |
| repositoryUrl | https://github.com/okmr2217/yarukoto |
| productUrl | https://yarukoto.vercel.app/ |
| note | Vercel（個人アカウント）、Supabase（Freeプラン） |
| sortOrder | 10 |
| isPublic | true |

### リリースノート

#### v1.0.0 — 初回リリース
- version: v1.0.0
- title: 初回リリース
- releaseDate: 2026-01-01
- type: MAJOR
- isDraft: false
- content:
```
## 初回リリース

Yarukotoの初回リリース。

### 追加機能
- タスクの作成・編集・削除
- プロダクトカテゴリによるタスク分類
- 今日のタスク一覧表示
- タスクの完了チェック
```

#### v1.1.0 — タスクカテゴリ機能改善
- version: v1.1.0
- title: タスクカテゴリ機能改善
- releaseDate: 2026-03-22
- type: MINOR
- isDraft: false
- content:
```
## タスクカテゴリ機能改善

### 改善内容
- カテゴリフィルタの追加
- UIの細部調整
- パフォーマンス改善
```

### ステータス履歴

| from | to | note | createdAt |
|---|---|---|---|
| IDEA | DEVELOPING | 開発開始 | 2025-12-31 |
| DEVELOPING | RELEASED | 初回リリース（v1.0.0） | 2026-01-01 |

---

## 2. Peak Log

### 基本情報

| フィールド | 値 |
|---|---|
| name | Peak Log |
| slug | peak-log |
| description | 自分を高揚させる体験を記録するログアプリ。 |
| longDescription | (生成してください) |
| category | APP |
| status | RELEASED |
| releaseDate | 2026-03-17 |
| stacks | Next.js, TypeScript, Prisma, Supabase, Better Auth, Tailwind CSS, shadcn/ui |
| repositoryUrl | https://github.com/okmr2217/peak-log |
| productUrl | https://peak-log-gamma.vercel.app |
| note | Vercel（個人アカウント）、Supabase（Freeプラン） |
| sortOrder | 20 |
| isPublic | true |

### リリースノート

#### v0.1.0 — 初期リリース
- version: v0.1.0
- title: 初期リリース（β版）
- releaseDate: 2026-03-12
- type: MINOR
- isDraft: false
- content:
```
## 初期リリース（β版）

### 追加機能
- 記録の作成・表示
- 基本的なログ一覧
```

#### v1.0.0 — 正式リリース
- version: v1.0.0
- title: 正式リリース
- releaseDate: 2026-03-17
- type: MAJOR
- isDraft: false
- content:
```
## 正式リリース

### 追加機能
- 記録の編集・削除
- 一覧ページのUI改善
- 認証機能（Better Auth）
```

#### v1.1.0 — 機能追加
- version: v1.1.0
- title: 機能追加
- releaseDate: 2026-03-20
- type: MINOR
- isDraft: false
- content:
```
## 機能追加

### 改善内容
- フィルタ・ソート機能
- レスポンシブ対応改善
```

#### v1.2.0 — 改善リリース
- version: v1.2.0
- title: 改善リリース
- releaseDate: 2026-03-24
- type: MINOR
- isDraft: false
- content:
```
## 改善リリース

### 改善内容
- UIの細部調整
- パフォーマンス改善
```

### ステータス履歴

| from | to | note | createdAt |
|---|---|---|---|
| IDEA | DEVELOPING | 開発開始 | 2026-03-12 |
| DEVELOPING | RELEASED | 正式リリース（v1.0.0） | 2026-03-17 |

---

## 3. furikaeri-mcp

### 基本情報

| フィールド | 値 |
|---|---|
| name | furikaeri-mcp |
| slug | furikaeri-mcp |
| description | 1日の活動を振り返るMCPサーバー |
| longDescription | Claude AIと連携し、Google Calendar・GitHub・Supabase・Cloudflare R2などから1日のログを収集して振り返りを生成するMCPサーバー。Cloudflare Workers上で動作する。 |
| category | MCP |
| status | RELEASED |
| releaseDate | 2026-03-19 |
| stacks | TypeScript, Cloudflare Workers, MCP SDK, Supabase, GitHub OAuth, Google Calendar API, Zod, Cloudflare KV, Cloudflare R2 |
| repositoryUrl | https://github.com/okmr2217/furikaeri-mcp |
| productUrl | https://furikaeri-mcp.okumuradaichi2007.workers.dev/mcp |
| note | Cloudflare Workers（無料プラン）、Supabase（Freeプラン）。GitHub OAuthとGoogle Calendar APIの認証情報が必要。 |
| sortOrder | 30 |
| isPublic | true |

### リリースノート

#### v0.1.0 — 初回デプロイ
- version: v0.1.0
- title: 初回デプロイ
- releaseDate: 2026-03-19
- type: MINOR
- isDraft: false
- content:
```
## 初回デプロイ

### 追加機能
- Cloudflare Workers上でのMCPサーバー基盤
- Google Calendar連携（カレンダーイベント取得）
- GitHub連携（コミット履歴取得）
- 日次サマリー生成
```

#### v0.2.0 — 機能追加
- version: v0.2.0
- title: 機能追加
- releaseDate: 2026-03-21
- type: MINOR
- isDraft: false
- content:
```
## 機能追加

### 追加機能
- Supabaseからのタスクログ取得
- 写真URL取得（Cloudflare R2連携）
- ピークログデータ連携
```

#### v0.3.0 — 改善・安定化
- version: v0.3.0
- title: 改善・安定化
- releaseDate: 2026-03-23
- type: MINOR
- isDraft: false
- content:
```
## 改善・安定化

### 改善内容
- エラーハンドリング改善
- レスポンス形式の統一
- 認証フローの安定化
```

### ステータス履歴

| from | to | note | createdAt |
|---|---|---|---|
| IDEA | DEVELOPING | 開発開始 | 2026-03-18 |
| DEVELOPING | RELEASED | 初回デプロイ（v0.1.0） | 2026-03-19 |

---

## 4. product-manager

### 基本情報

| フィールド | 値 |
|---|---|
| name | product-manager |
| slug | product-manager |
| description | 個人開発プロダクトの進捗・ステータス・リリース履歴を横断管理するアプリ |
| longDescription | 複数の個人開発プロダクトを一元管理するツール。プロダクトごとのステータス・リリースノート・DevTask・画像を管理し、技術ブログ（パリッと開発日記）のDBとして機能する。 |
| category | APP |
| status | DEVELOPING |
| releaseDate | （未定） |
| stacks | Next.js, TypeScript, Prisma, Supabase, Better Auth, Tailwind CSS, shadcn/ui |
| repositoryUrl | https://github.com/okmr2217/product-manager |
| productUrl | https://product-manager-kappa-liard.vercel.app |
| note | Vercel（個人アカウント）、Supabase（Freeプラン） |
| sortOrder | 5 |
| isPublic | false |

### リリースノート

なし（開発中）

### ステータス履歴

| from | to | note | createdAt |
|---|---|---|---|
| IDEA | DEVELOPING | 開発開始 | 2026-03-26 |

---

## 5. パリッと開発日記（paritto-dev-diary）

### 基本情報

| フィールド | 値 |
|---|---|
| name | パリッと開発日記 |
| slug | paritto-dev-diary |
| description | 個人開発の記録を発信する技術ブログ |
| longDescription | Next.jsとMarkdownで構築した技術ブログ。個人開発プロダクトの紹介・開発過程・技術的な学びを発信する。プロダクト管理アプリのDBと連携してプロダクト情報を表示する。 |
| category | SITE |
| status | RELEASED |
| releaseDate | 2025-12-14 |
| stacks | Next.js, TypeScript, Tailwind CSS, shadcn/ui, Markdown |
| repositoryUrl | https://github.com/okmr2217/paritto-dev-diary |
| productUrl | https://paritto-dev-diary.vercel.app |
| note | Vercel（個人アカウント） |
| sortOrder | 40 |
| isPublic | true |

### リリースノート

#### v1.0.0 — 公開開始
- version: v1.0.0
- title: 公開開始
- releaseDate: 2025-12-14
- type: MAJOR
- isDraft: false
- content:
```
## 公開開始

技術ブログ「パリッと開発日記」を公開。

### 主な機能
- ブログ記事一覧・詳細ページ
- Markdownによる記事管理
- タグによる絞り込み
```

### ステータス履歴

| from | to | note | createdAt |
|---|---|---|---|
| IDEA | DEVELOPING | 開発開始 | 2025-12-14 |
| DEVELOPING | RELEASED | 公開開始 | 2025-12-14 |
| RELEASED | MAINTENANCE | 継続的にコンテンツ追加・機能改善中 | 2026-01-01 |

---

## 6. じゃんスコ（jansuko）

### 基本情報

| フィールド | 値 |
|---|---|
| name | じゃんスコ |
| slug | jansuko |
| description | 麻雀の点数計算・スコア管理アプリ |
| longDescription | 麻雀のゲームごとのスコアを記録・集計するWebアプリ。プレイヤー登録・ゲーム記録・スコアランキングを管理できる。 |
| category | APP |
| status | RELEASED |
| releaseDate | 2026-01-15 |
| stacks | Next.js, TypeScript, Prisma, Supabase, Tailwind CSS, shadcn/ui |
| repositoryUrl | https://github.com/okmr2217/jansuko |
| productUrl | https://jansuko.vercel.app |
| note | Vercel（個人アカウント）、Supabase（Freeプラン） |
| sortOrder | 60 |
| isPublic | true |

### リリースノート

#### v1.0.0 — 初回リリース
- version: v1.0.0
- title: 初回リリース
- releaseDate: 2026-01-15
- type: MAJOR
- isDraft: false
- content:
```
## 初回リリース

じゃんスコの初回リリース。

### 主な機能
- プレイヤー登録・管理
- ゲームスコアの記録
- スコア集計・ランキング表示
```

### ステータス履歴

| from | to | note | createdAt |
|---|---|---|---|
| IDEA | DEVELOPING | 開発開始 | 2025-12-18 |
| DEVELOPING | RELEASED | 初回リリース（v1.0.0） | 2026-01-15 |

---

## 7. ツケカン（tukekan）

### 基本情報

| フィールド | 値 |
|---|---|
| name | ツケカン |
| slug | tukekan |
| description | 立替・割り勘の精算管理アプリ |
| longDescription | 友人・グループ間の立替金や割り勘を記録・精算するWebアプリ。誰がいくら立て替えたかを管理し、最終的な精算額を自動計算する。 |
| category | APP |
| status | PAUSED |
| releaseDate | （未リリース） |
| stacks | Next.js, TypeScript, Prisma, Supabase, Tailwind CSS, shadcn/ui |
| repositoryUrl | https://github.com/okmr2217/tukekan |
| productUrl | https://tukekan.vercel.app |
| note | 開発を一時休止中（2026-01-28最終コミット）。認証にbcrypt+JWTを使用（Better Authではない）。 |
| sortOrder | 70 |
| isPublic | false |

### リリースノート

なし（未リリース）

### ステータス履歴

| from | to | note | createdAt |
|---|---|---|---|
| IDEA | DEVELOPING | 開発開始 | 2025-12-22 |
| DEVELOPING | PAUSED | 他プロダクト優先のため一時休止 | 2026-01-28 |

---

## 8. Stockee

### 基本情報

| フィールド | 値 |
|---|---|
| name | Stockee |
| slug | stockee |
| description | 日用品の在庫管理アプリ |
| longDescription | 家庭の日用品の在庫をスマートに管理するWebアプリ。在庫数の記録・補充タイミングの把握・買い物リスト生成を支援する。 |
| category | APP |
| status | PAUSED |
| releaseDate | （未リリース） |
| stacks | Next.js, TypeScript, Prisma, Supabase, Better Auth, Tailwind CSS, shadcn/ui |
| repositoryUrl | https://github.com/okmr2217/stockee |
| productUrl | https://stockee-theta.vercel.app/ |
| note | 開発を一時休止中（2026-01-28最終コミット） |
| sortOrder | 80 |
| isPublic | false |

### リリースノート

なし（未リリース）

### ステータス履歴

| from | to | note | createdAt |
|---|---|---|---|
| IDEA | DEVELOPING | 開発開始 | 2025-12-26 |
| DEVELOPING | PAUSED | 他プロダクト優先のため一時休止 | 2026-01-28 |

---

## 9. Imageable

### 基本情報

| フィールド | 値 |
|---|---|
| name | Imageable |
| slug | imageable |
| description | 画像管理・ギャラリーアプリ |
| longDescription | 画像のアップロード・管理・ギャラリー表示を行うWebアプリ。Supabase Storageを使った画像ストレージ管理の検証プロジェクト。 |
| category | APP |
| status | PAUSED |
| releaseDate | （未リリース） |
| stacks | Next.js 15, TypeScript, Prisma, Supabase, Tailwind CSS, Zod |
| repositoryUrl | https://github.com/okmr2217/imageable |
| productUrl | （未リリース） |
| note | 開発を一時休止中（2024-11-28最終コミット）。短期間の実験的プロジェクト。 |
| sortOrder | 90 |
| isPublic | false |

### リリースノート

なし（未リリース）

### ステータス履歴

| from | to | note | createdAt |
|---|---|---|---|
| IDEA | DEVELOPING | 開発開始 | 2024-11-13 |
| DEVELOPING | PAUSED | 実験的プロジェクトとして休止 | 2024-11-28 |

---

## 10. Biography

### 基本情報

| フィールド | 値 |
|---|---|
| name | Biography |
| slug | biography |
| description | リアルタイムチャット付き自己紹介・ポートフォリオサイト |
| longDescription | React+Vite（フロントエンド）とLaravel（バックエンド）で構築した自己紹介サイト。Pusherによるリアルタイムチャット機能を搭載。XServer VPSにセルフホスト。 |
| category | SITE |
| status | PAUSED |
| releaseDate | 2024-06-01 |
| stacks | React, Vite, TypeScript, Laravel, MySQL, Tailwind CSS, Pusher |
| repositoryUrl | https://github.com/okmr2217/biography |
| productUrl | （未リリース） |
| note | XServer VPS（現在稼働状況不明）。フロントとバックエンドが分離したSPAアーキテクチャ。大学のポートフォリオとして制作。 |
| sortOrder | 100 |
| isPublic | false |

### リリースノート

#### v1.0.0 — 公開
- version: v1.0.0
- title: 公開
- releaseDate: 2024-06-01
- type: MAJOR
- isDraft: false
- content:
```
## 公開

Biography（自己紹介・ポートフォリオサイト）を公開。

### 主な機能
- 自己紹介・プロフィール表示
- Pusherを使ったリアルタイムチャット
- スキル・経歴の紹介
```

### ステータス履歴

| from | to | note | createdAt |
|---|---|---|---|
| IDEA | DEVELOPING | 開発開始 | 2024-05-15 |
| DEVELOPING | RELEASED | 公開 | 2024-06-01 |
| RELEASED | PAUSED | 更新停止（VPS稼働状況不明） | 2024-12-01 |

---

## 11. ポートフォリオサイト（portfolio-site）

### 基本情報

| フィールド | 値 |
|---|---|
| name | ポートフォリオサイト |
| slug | portfolio-site |
| description | 個人ポートフォリオ・ブログサイト |
| longDescription | Next.jsで構築した個人ポートフォリオサイト。スキル・経歴・制作物の紹介とブログ機能を兼ね備えたサイト。 |
| category | SITE |
| status | MAINTENANCE |
| releaseDate | 2024-12-01 |
| stacks | Next.js, TypeScript, Tailwind CSS |
| repositoryUrl | https://github.com/okmr2217/portfolio-site |
| productUrl | https://daichi-blog.vercel.app |
| note | Vercel（個人アカウント）。継続的にコンテンツ更新中（最終更新2025-03-16）。 |
| sortOrder | 50 |
| isPublic | true |

### リリースノート

#### v1.0.0 — 公開
- version: v1.0.0
- title: 公開
- releaseDate: 2024-12-01
- type: MAJOR
- isDraft: false
- content:
```
## 公開

個人ポートフォリオサイトを公開。

### 主な機能
- プロフィール・スキル紹介
- 制作物一覧
- ブログ機能
```

### ステータス履歴

| from | to | note | createdAt |
|---|---|---|---|
| IDEA | DEVELOPING | 開発開始 | 2024-12-01 |
| DEVELOPING | RELEASED | 公開 | 2024-12-01 |
| RELEASED | MAINTENANCE | 継続的にコンテンツ更新中 | 2025-01-01 |

---

## 12. aifes2023

### 基本情報

| フィールド | 値 |
|---|---|
| name | aifes2023 |
| slug | aifes2023 |
| description | AI文化祭2023の公式サイト |
| longDescription | 大学のAI文化祭（2023年度）向けに制作したWordPressサイト。イベント情報・スケジュール・参加者向け情報を公開した。 |
| category | SITE |
| status | PAUSED |
| releaseDate | 2024-05-01 |
| stacks | WordPress |
| repositoryUrl | https://github.com/okmr2217/aifes2023 |
| productUrl | （公開終了） |
| note | WordPress製。イベント終了後に公開停止。 |
| sortOrder | 110 |
| isPublic | false |

### リリースノート

なし

### ステータス履歴

| from | to | note | createdAt |
|---|---|---|---|
| IDEA | DEVELOPING | 文化祭サイト制作開始 | 2024-01-17 |
| DEVELOPING | RELEASED | 公開 | 2024-05-01 |
| RELEASED | PAUSED | イベント終了に伴い公開停止 | 2024-11-01 |

---

## 登録順（sortOrder）まとめ

| sortOrder | slug | name | status |
|---|---|---|---|
| 5 | product-manager | product-manager | DEVELOPING |
| 10 | yarukoto | Yarukoto | RELEASED |
| 20 | peak-log | Peak Log | RELEASED |
| 30 | furikaeri-mcp | furikaeri-mcp | RELEASED |
| 40 | paritto-dev-diary | パリッと開発日記 | RELEASED |
| 50 | portfolio-site | ポートフォリオサイト | MAINTENANCE |
| 60 | jansuko | じゃんスコ | RELEASED |
| 70 | tukekan | ツケカン | PAUSED |
| 80 | stockee | Stockee | PAUSED |
| 90 | imageable | Imageable | PAUSED |
| 100 | biography | Biography | PAUSED |
| 110 | aifes2023 | aifes2023 | PAUSED |

## 未確認・要確認事項

- **じゃんスコ** の productUrl: デプロイ済みURLが不明。`.env.production.local` か Vercel ダッシュボードで確認が必要。
- **Biography** の productUrl `http://choishoi.site`: VPSが現在稼働中かどうか要確認。停止済みの場合は productUrl を空欄にする。
- **aifes2023** の repositoryUrl: Private リポジトリなのでURLを記載するか任意。
