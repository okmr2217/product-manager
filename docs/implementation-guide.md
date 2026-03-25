# プロダクト管理アプリ — 開発ガイド

## 開発からリリースまでの全体フロー

```
Phase 1: 基盤構築
  Step 1. プロジェクト初期化 + Prisma + DB接続
  Step 2. Better Auth 認証
  Step 3. レイアウト（サイドバー + ヘッダー）

Phase 2: コア機能
  Step 4. プロダクトCRUD（作成・一覧・詳細・編集・削除）
  Step 5. ステータス変更 + ステータス履歴
  Step 6. 画像管理（アップロード・一覧・並び替え・サムネイル・削除）
  Step 7. リリースノート管理
  Step 8. DevTask管理

Phase 3: 仕上げ
  Step 9. ダッシュボード（フィルタ・ソート）
  Step 10. 全体の調整・動作確認

Phase 4: デプロイ
  Step 11. Vercelデプロイ + Supabase本番設定
```

### 前提

- 各ステップは Claude Code で1回の指示として実行できるサイズに分割
- 各ステップの終了時に動作確認ポイントを明記
- 設計書 `architecture-design.md` と要件定義 `requirements.md` をリポジトリに含め、Claude Code から参照させる

---

## Phase 1: 基盤構築

### Step 1. プロジェクト初期化 + Prisma + DB接続

**事前準備（手動）**:
- Supabase プロジェクトを作成し、接続文字列を取得
- `.env` に環境変数を設定

**Claude Code 指示文**:

```
プロダクト管理アプリのプロジェクトを初期化してください。

設計書: docs/architecture-design.md
要件定義: docs/requirements.md

## やること

1. Next.js 15 プロジェクトを作成（src/ ディレクトリ使用、App Router、TypeScript）
2. 必要なパッケージをインストール
   - prisma, @prisma/client
   - @supabase/supabase-js
   - zod
   - sonner
3. Tailwind CSS は Next.js 15 のデフォルト設定を使用
4. shadcn/ui を初期化し、以下のコンポーネントを追加:
   Card, Badge, Button, Input, Textarea, Select, Dialog, AlertDialog, 
   Separator, DropdownMenu, Popover, Calendar, Switch, Checkbox, Sheet, Sonner
5. フォント設定: Noto Sans JP + Roboto を next/font で設定（設計書の「フォント」セクション参照）
6. Prisma を初期化し、設計書と要件定義に記載のスキーマを作成
   - Product, ProductImage, Release, StatusHistory, DevTask と関連する enum すべて
   - Better Auth が必要とするテーブルは次のステップで追加するので、ここでは含めない
7. prisma migrate dev を実行してDBにテーブルを作成
8. lib/prisma.ts に Prisma Client のシングルトンを作成
9. lib/supabase.ts に Supabase Client を作成（Storage用）
10. lib/utils.ts に cn 関数を配置（shadcn/ui 初期化で生成済みのはず）
11. constants/index.ts にステータス・カテゴリ・リリースタイプ・DevTaskタイプ等の表示名と色クラスのマッピングを定義（設計書の「バッジデザイン」セクション参照）
12. schemas/ に Zod スキーマを作成（設計書の「バリデーション（Zod）」セクション参照）
    - schemas/product.ts
    - schemas/release.ts
    - schemas/task.ts
    - schemas/status.ts
13. types/index.ts に ActionResult 型を定義（設計書の「フィードバックUI」セクション参照）

## 環境変数

.env.example を作成し、必要な環境変数を記載:
DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, 
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

## 確認

- npx prisma studio でテーブルが作成されていること
- npm run dev でエラーなく起動すること
```

**動作確認**: `npm run dev` でエラーなし、`npx prisma studio` でテーブル一覧が表示される

---

### Step 2. Better Auth 認証

**Claude Code 指示文**:

```
Better Auth を使った認証機能を実装してください。

設計書: docs/architecture-design.md（「認証フロー」セクション参照）

## やること

1. better-auth パッケージをインストール
2. Better Auth の CLI でスキーマを生成し、Prisma スキーマにマージ
   - npx @better-auth/cli generate で Better Auth が必要とするモデル（User, Session, Account, Verification）を生成
   - 生成された内容を既存の prisma/schema.prisma に追加
   - prisma migrate dev を実行
3. lib/auth.ts に Better Auth のサーバー設定を作成（設計書のコード参照）
   - prismaAdapter を使用
   - emailAndPassword を有効化
   - requireAuth() ヘルパー関数を追加
4. lib/auth-client.ts に Better Auth のクライアント設定を作成
5. app/api/auth/[...all]/route.ts に API ルートを作成
6. middleware.ts を作成（設計書のコード参照）
   - /api/auth/*, /login, /signup, /_next/*, /favicon.ico はスルー
   - それ以外は認証チェック、未認証は /login にリダイレクト
7. (auth)/layout.tsx を作成 — サイドバーなしの最小レイアウト（中央寄せのカード）
8. (auth)/login/page.tsx を作成
   - メールアドレス + パスワードのフォーム
   - ログイン成功後 /dashboard にリダイレクト
   - signupページへのリンク
9. (auth)/signup/page.tsx を作成
   - メールアドレス + パスワード + パスワード確認のフォーム
   - サインアップ成功後 /dashboard にリダイレクト
   - loginページへのリンク
10. app/page.tsx で "/" を /dashboard にリダイレクトする

## デザイン

ログイン・サインアップページはシンプルなカード形式。
アプリ名「Product Manager」をカード上部に表示。
shadcn/ui の Card, Input, Button, Label を使用。

## 確認

- /login にアクセスしてフォームが表示される
- サインアップ → ログイン → /dashboard にリダイレクトされる（ダッシュボードページはまだないので空ページでOK）
- 未認証で /dashboard にアクセスすると /login にリダイレクトされる
```

**動作確認**: signup → login → リダイレクト、未認証リダイレクトが動作する

---

### Step 3. レイアウト（サイドバー + ヘッダー）

**Claude Code 指示文**:

```
アプリ本体のレイアウト（サイドバー + ヘッダー）を実装してください。

設計書: docs/architecture-design.md（「サイドバー」セクション参照）

## やること

1. (app)/layout.tsx を作成（Server Component）
   - Prisma でプロダクト一覧を取得（id, name, slug, status のみ）
   - <Sidebar products={products} /> に props で渡す
   - メインコンテンツエリアを配置
   - Toaster コンポーネント（Sonner）を配置
2. components/layout/sidebar.tsx を作成（Client Component — "use client"）
   - 設計書のワイヤーフレーム通りのレイアウト
   - アプリ名「Product Manager」（/dashboard へリンク）
   - 📊 ダッシュボード リンク
   - 「プロダクト」セクションラベル + 区切り線
   - プロダクト一覧: ステータスの色ドット + プロダクト名（/products/[slug] へリンク）
   - アクティブなリンクは usePathname で判定し、背景色でハイライト
   - 下部に「+ 新規作成」ボタン（/products/new へリンク）
   - 最下部にユーザーメニュー（DropdownMenu でログアウト）
   - ステータスの色ドットは constants/index.ts の色定義を使用
   - モバイル対応: Sheet を使ったハンバーガーメニュー
3. components/layout/header.tsx を作成（Client Component）
   - モバイル時のハンバーガーメニューボタン
   - ページの上部に配置（モバイルのみ表示）
4. components/layout/page-header.tsx を作成
   - ページタイトルとオプションのアクションボタンエリア
   - パンくずリスト（トップ → ダッシュボード → プロダクト名 など）
5. (app)/dashboard/page.tsx に仮のページを作成
   - 「ダッシュボード」と表示するだけの最小ページ
   - PageHeader を使用

## デザイン

- サイドバー幅: w-64 (256px)
- 背景色: サイドバーは少し暗め、メインは白/明るい背景
- PC: サイドバー常時表示 + メインコンテンツ
- モバイル: サイドバー非表示、Sheet で開閉

## 確認

- ログイン後、サイドバー付きのレイアウトが表示される
- プロダクト一覧はまだ空だが、ダッシュボードリンクと新規作成ボタンは表示される
- モバイル幅でハンバーガーメニューが機能する
- ログアウトメニューが動作する
```

**動作確認**: レイアウト表示、サイドバーリンク、モバイル開閉、ログアウト

---

## Phase 2: コア機能

### Step 4. プロダクトCRUD

**Claude Code 指示文**:

```
プロダクトの作成・一覧表示・詳細表示・編集・削除を実装してください。

設計書: docs/architecture-design.md
要件定義: docs/requirements.md

## やること

### Server Actions (actions/products.ts)

1. createProduct — FormData を受け取り、Zod バリデーション → Prisma で作成 → revalidatePath("/dashboard") → リダイレクト
2. updateProduct — 同上、更新処理
3. deleteProduct — AlertDialog で確認後、Supabase Storage の {productId}/ フォルダを一括削除 → Prisma で削除（Cascade） → redirect("/dashboard")
4. すべての Action で requireAuth() を先頭で呼ぶ
5. ActionResult 型で戻り値を統一、エラー時はトーストで表示

### ページ

1. (app)/products/new/page.tsx — プロダクト作成ページ
2. (app)/products/[slug]/page.tsx — プロダクト詳細（概要タブ）
3. (app)/products/[slug]/edit/page.tsx — プロダクト編集ページ

### コンポーネント

1. components/products/product-form.tsx（Client Component）
   - 作成・編集で共用（initialData の有無で切り替え）
   - 設計書の「プロダクトフォーム」ワイヤーフレーム通りのフィールド配置
   - 技術スタック: タグ入力UI（自由テキスト入力、Enterで追加、×で削除）
     - サジェストは既存スタックをpropsで受け取って表示
   - カテゴリ: Select
   - リリース日: Calendar + Popover
   - isPublic: Switch
   - useActionState で Server Action を呼び出し
   - バリデーションエラーはフィールド下にインライン表示
   - 成功時はトースト + リダイレクト
2. components/products/status-badge.tsx — ステータスに応じた色の Badge
3. components/products/category-badge.tsx — カテゴリに応じた色の Badge
4. components/products/stack-tags.tsx — 技術スタックのタグ一覧表示
5. components/products/delete-dialog.tsx — 削除確認ダイアログ（プロダクト名の入力を要求）

### 詳細ページ（概要タブ）

- タブナビゲーション（概要・タスク・画像・リリースノート・履歴）をリンクで実装
  - 設計書の「タブ → URLマッピング」参照
  - アクティブタブは usePathname で判定
  - このステップでは概要タブのみ実装、他はリンクだけ作る（ページは後のステップで作成）
- 概要タブの内容: 設計書の「概要タブ」ワイヤーフレーム通り
  - 説明、詳細説明、カテゴリ、ステータス（+ ステータス変更ボタンは次ステップ）、リリース日、URL、リポジトリ、技術スタック、備考
  - 右上に [編集] [削除] ボタン

### サイドバー更新

プロダクト作成・削除後にサイドバーのプロダクト一覧が更新されること。
(app)/layout.tsx で revalidatePath が効いてプロダクト一覧が再取得される。

## 確認

- /products/new でプロダクトを作成できる
- 作成後サイドバーにプロダクトが表示される
- サイドバーからプロダクト詳細に遷移できる
- 詳細ページで概要情報が表示される
- 編集ページでプロダクトを更新できる
- 削除ダイアログでプロダクトを削除できる（名前入力による確認）
```

**動作確認**: CRUD全操作、サイドバー連動、バリデーション

---

### Step 5. ステータス変更 + ステータス履歴

**Claude Code 指示文**:

```
プロダクトのステータス変更機能とステータス履歴表示を実装してください。

設計書: docs/architecture-design.md（「ステータス変更時の自動履歴記録」セクション参照）

## やること

### Server Actions (actions/status.ts)

1. changeStatus — productId と StatusChangeInput を受け取る
   - Zod バリデーション
   - Prisma トランザクションで Product.status 更新 + StatusHistory 作成を同時実行（設計書のコード参照）
   - revalidatePath でプロダクト詳細を再描画

### コンポーネント

1. components/products/status-change-dialog.tsx（Client Component）
   - Dialog で表示
   - 変更先ステータスを Select で選択（現在のステータス以外を候補に表示）
   - メモを Textarea で入力（任意）
   - 保存時に changeStatus Server Action を呼び出し
   - 成功時はトースト + ダイアログを閉じる

### ページ

1. 概要タブの「ステータスを変更」ボタンに status-change-dialog を接続
2. (app)/products/[slug]/history/page.tsx — ステータス履歴タブ
   - StatusHistory をプロダクトIDで取得（createdAt desc）
   - タイムライン形式で表示（設計書のワイヤーフレーム参照）
   - 縦線 + ステータス色のドット + 「リリース済 ← 開発中」+ 日時 + メモ

## 確認

- 概要タブからステータス変更ダイアログを開ける
- ステータス変更が保存され、概要タブのステータスバッジが更新される
- サイドバーのステータス色ドットも更新される
- 履歴タブにステータス変更のログが時系列で表示される
```

**動作確認**: ステータス変更 → バッジ更新 → 履歴表示

---

### Step 6. 画像管理

**Claude Code 指示文**:

```
プロダクトの画像管理機能を実装してください。

設計書: docs/architecture-design.md（「画像アップロードフロー」「画像タブ」セクション参照）

## やること

### Server Actions (actions/images.ts)

1. createImageRecord — productId, url, alt, isThumbnail, sortOrder を受け取り DB に保存
2. deleteImage — imageId を受け取り、Supabase Storage からファイル削除 + DB レコード削除
3. setThumbnail — 指定画像をサムネイルに設定（既存のサムネイルフラグを解除してから設定）
4. reorderImages — productId と orderedIds（並び順の画像ID配列）を受け取り、各画像の sortOrder を更新

### カスタムフック

1. hooks/use-upload.ts — 画像アップロード用
   - Supabase Storage クライアントを使ってクライアントから直接アップロード
   - パス: product-images/{productId}/{cuid}.{ext}
   - アップロード中の進捗状態管理
   - アップロード完了後、公開URLを返す
   - エラーハンドリング

### コンポーネント

1. components/images/image-upload.tsx（Client Component）
   - ドラッグ&ドロップまたはクリックでファイル選択
   - 複数ファイル対応
   - use-upload フックでアップロード → 完了後 createImageRecord Server Action を呼ぶ
   - アップロード中はプログレス表示
   - 許可形式: image/png, image/jpeg, image/webp, image/gif
   - 最大サイズ: 5MB
2. components/images/image-grid.tsx（Client Component）
   - @dnd-kit/sortable でドラッグ&ドロップ並び替え
   - 並び替え確定時に reorderImages Server Action を呼ぶ
3. components/images/image-card.tsx
   - 画像のサムネイル表示
   - サムネイル指定ボタン（★アイコン、指定済みは塗りつぶし）
   - 削除ボタン（AlertDialog で確認）
   - alt テキスト表示

### ページ

1. (app)/products/[slug]/images/page.tsx — 画像管理タブ
   - ProductImage をプロダクトIDで取得（sortOrder asc）
   - 「+ 画像をアップロード」ボタン → image-upload コンポーネントを表示
   - image-grid で画像一覧表示

## Supabase Storage

事前に Supabase のダッシュボードで product-images バケット（Public）を作成しておく必要がある。
この指示文の中ではバケットの存在を前提とする。

## 確認

- 画像をアップロードでき、一覧に表示される
- ドラッグ&ドロップで並び替えできる
- サムネイル指定ができる（1枚のみ）
- 画像を削除できる（Storage からも削除される）
```

**動作確認**: アップロード → 一覧表示 → 並び替え → サムネイル → 削除

---

### Step 7. リリースノート管理

**Claude Code 指示文**:

```
リリースノートの作成・一覧表示・編集・削除を実装してください。

設計書: docs/architecture-design.md（「リリースノートタブ」セクション参照）
要件定義: docs/requirements.md（「リリースノート・変更履歴」セクション参照）

## やること

### Server Actions (actions/releases.ts)

1. createRelease — productId + FormData → Zod バリデーション → Prisma 作成
2. updateRelease — id + FormData → 更新
3. deleteRelease — id → 削除（AlertDialog で確認後）
4. すべてで requireAuth() + revalidatePath

### コンポーネント

1. components/releases/release-form.tsx（Client Component）
   - 作成・編集で共用
   - フィールド: version, title, content (Textarea), releaseDate (Calendar), type (Select), isDraft (Switch)
   - isDraft のデフォルトは true
2. components/releases/release-card.tsx
   - バージョン、タイトル、リリースタイプバッジ、日付、下書きバッジ（isDraft時）、contentの先頭数行、編集リンク
3. components/releases/release-type-badge.tsx
   - constants の色定義を使用

### ページ

1. (app)/products/[slug]/releases/page.tsx — リリースノート一覧タブ
   - Release をプロダクトIDで取得（releaseDate desc）
   - 「+ リリースノートを追加」ボタン
   - release-card のリスト表示
2. (app)/products/[slug]/releases/new/page.tsx — 作成
3. (app)/products/[slug]/releases/[id]/edit/page.tsx — 編集

## 確認

- リリースノートを作成できる（下書き状態で作成される）
- 一覧に下書きバッジ付きで表示される
- 編集で isDraft を false にして公開できる
- 削除できる
```

**動作確認**: CRUD全操作、下書き表示

---

### Step 8. DevTask管理

**Claude Code 指示文**:

```
DevTask（開発タスク）の作成・一覧表示・編集・削除を実装してください。

設計書: docs/architecture-design.md（「タスクタブ（DevTask）」セクション参照）
要件定義: docs/requirements.md（「開発タスク管理（DevTask）」セクション参照）

## やること

### Server Actions (actions/tasks.ts)

1. createTask — productId + FormData → Zod バリデーション → Prisma 作成
2. updateTask — id + FormData → 更新（ステータス変更もこれで行う）
3. deleteTask — id → 削除
4. すべてで requireAuth() + revalidatePath

### コンポーネント

1. components/tasks/task-form.tsx（Client Component）
   - 作成・編集で共用
   - フィールド: title, description (Textarea), type (Select), status (Select), priority (Select, 任意)
2. components/tasks/task-list.tsx（Client Component）
   - フィルタUI: ステータス、タイプ、優先度の Select（「すべて」選択可）
   - フィルタはクライアントサイドで実行（データ量が少ないため）
   - ソート: 完了タスクは下部、それ以外は優先度順（HIGH → MEDIUM → LOW → 未設定）
3. components/tasks/task-card.tsx
   - チェックボックス（クリックで完了/未完了をトグル → updateTask を呼ぶ）
   - タスク名、description の先頭1行
   - タイプバッジ、優先度バッジ、ステータスバッジ
   - 完了タスクはテキストを薄く表示
   - 編集リンク
4. components/tasks/task-type-badge.tsx
5. components/tasks/task-status-badge.tsx
6. components/tasks/task-priority-badge.tsx

### ページ

1. (app)/products/[slug]/tasks/page.tsx — DevTask 一覧タブ
   - DevTask をプロダクトIDで取得
   - 「+ タスクを追加」ボタン
   - task-list で表示
2. (app)/products/[slug]/tasks/new/page.tsx — 作成
3. (app)/products/[slug]/tasks/[id]/edit/page.tsx — 編集

## 確認

- タスクを作成できる
- フィルタで絞り込みできる
- チェックボックスで完了/未完了を切り替えられる
- 完了タスクが下部に移動し、薄く表示される
- 編集・削除ができる
```

**動作確認**: CRUD、フィルタ、完了トグル

---

## Phase 3: 仕上げ

### Step 9. ダッシュボード（フィルタ・ソート）

**Claude Code 指示文**:

```
ダッシュボード（プロダクト一覧）のカード表示とフィルタ・ソート機能を実装してください。

設計書: docs/architecture-design.md（「ダッシュボード」セクション参照）

## やること

### ページ

1. (app)/dashboard/page.tsx を本実装に置き換え（Server Component）
   - Prisma でプロダクト一覧を取得（images の isThumbnail=true を含む）
   - フィルタ・ソート用のコンポーネントとカードグリッドを配置

### コンポーネント

1. components/products/product-card.tsx
   - 設計書のワイヤーフレーム通りの情報構成
   - サムネイル画像（あればアスペクト比を維持して表示、なければグレーのプレースホルダー）
   - プロダクト名（太字）、CategoryBadge + StatusBadge
   - 技術スタック（最大2つ表示 + 「+N」）
   - 最終更新日（updatedAt をフォーマット）
   - カード全体がクリッカブル（/products/[slug] へ遷移）
2. components/filters/status-filter.tsx（Client Component）
   - Select: 「すべて」+ 各ステータス
3. components/filters/category-filter.tsx（Client Component）
   - Select: 「すべて」+ 各カテゴリ
4. components/filters/sort-select.tsx（Client Component）
   - Select: 名前順 / 更新日順 / リリース日順

### フィルタ・ソートの実装方針

URL の searchParams でフィルタ・ソートの状態を管理する。
- /dashboard?status=RELEASED&category=APP&sort=updatedAt
- フィルタ変更時に router.push で URL を更新
- Server Component 側で searchParams を読み取り、Prisma の where/orderBy に反映

### レスポンシブ

- PC: 3カラムグリッド
- タブレット: 2カラム
- モバイル: 1カラム

## 確認

- ダッシュボードにプロダクトカードが表示される
- サムネイル画像が表示される（ない場合はプレースホルダー）
- フィルタでステータス・カテゴリの絞り込みができる
- ソートで並び順を変更できる
- カードをクリックしてプロダクト詳細に遷移できる
- モバイルで1カラム表示になる
```

**動作確認**: カード表示、フィルタ、ソート、レスポンシブ

---

### Step 10. 全体の調整・動作確認

**Claude Code 指示文**:

```
アプリ全体の調整と最終確認を行ってください。

設計書: docs/architecture-design.md

## やること

1. 全ページのレイアウト確認・調整
   - 余白、フォントサイズ、色の統一感を確認
   - 各ページの PageHeader にパンくずリストが正しく表示されているか
   - 空状態の表示（プロダクトなし、画像なし、リリースなし、タスクなし）に適切なメッセージを表示

2. エラーハンドリングの確認
   - Server Action でエラーが発生した場合にトーストが表示されるか
   - バリデーションエラーがフォームにインライン表示されるか
   - 存在しないslugにアクセスした場合に404が表示されるか
   - not-found.tsx を (app) グループに作成

3. ローディング状態
   - フォーム送信中のボタンの disabled + ローディング表示
   - 画像アップロード中のプログレス表示

4. 細かいUI改善
   - 外部リンク（リポジトリURL、プロダクトURL）に外部リンクアイコンを追加
   - 日付のフォーマットを統一（YYYY/MM/DD）
   - タブナビゲーションのアクティブスタイルが正しいか

5. metadataの設定
   - 各ページに適切な title を設定（例: "Yarukoto | Product Manager"）
   - layout.tsx にデフォルトの metadata を設定

## 確認

- 全ページを一通り操作して、エラーなく動作すること
- 空状態、エラー状態、ローディング状態がすべて適切に表示されること
- モバイル幅でレイアウトが壊れないこと
```

**動作確認**: 全画面通し確認

---

## Phase 4: デプロイ

### Step 11. Vercel デプロイ + Supabase 本番設定

**手動作業**（Claude Code ではなく手動で行う）:

```
1. GitHub にリポジトリを作成し push

2. Vercel にプロジェクトをインポート
   - Framework: Next.js
   - Root Directory: （デフォルト）
   - Build Command: npx prisma generate && next build
   - 環境変数を設定:
     DATABASE_URL（Supabase の本番接続文字列）
     BETTER_AUTH_SECRET
     BETTER_AUTH_URL（本番ドメイン）
     NEXT_PUBLIC_SUPABASE_URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY
     SUPABASE_SERVICE_ROLE_KEY

3. Supabase 本番設定
   - product-images バケット（Public）を作成
   - Storage ポリシーを設定（設計書の SQL 参照）
   - blog_reader ロールを作成（設計書の SQL 参照）

4. デプロイ後の確認
   - サインアップ → ログイン
   - プロダクト作成 → 画像アップロード → リリースノート作成 → タスク作成
   - ステータス変更 → 履歴確認
   - ダッシュボードのフィルタ・ソート
   - 削除操作

5. ブログ側の接続（別タスク）
   - ブログリポジトリに Prisma スキーマをコピー
   - 読み取り専用接続文字列で接続
   - プロダクト一覧・詳細ページを実装
```

---

## Claude Code で使うときのコツ

### 指示文の渡し方

1. リポジトリのルートに `docs/` ディレクトリを作り、`architecture-design.md` と `requirements.md` を配置する
2. 各ステップの指示文を Claude Code に渡す際、「設計書: docs/architecture-design.md 参照」と明記する
3. Claude Code はファイルを読んで設計に沿った実装をしてくれる

### ステップ間の依存

```
Step 1 → Step 2 → Step 3 （基盤、順序厳守）
Step 4 → Step 5 （ステータス変更は詳細ページに依存）
Step 4 → Step 6 （画像管理は詳細ページに依存）
Step 4 → Step 7 （リリースノートは詳細ページに依存）
Step 4 → Step 8 （DevTaskは詳細ページに依存）
Step 5〜8 は並行可能だが、順番に進めた方が安定する
Step 9 はカード表示なので Step 4 以降ならいつでも可
Step 10 は全機能完了後
```

### 各ステップ後に必ずやること

1. `npm run dev` でエラーがないか確認
2. 動作確認ポイントをすべてチェック
3. 問題があれば次のステップに進む前に修正を指示する
4. git commit しておく（ステップごとにコミットしておくとロールバックしやすい）
