import { PrismaClient, ReleaseType } from "@prisma/client";

const prisma = new PrismaClient();

type ReleaseData = {
  version: string;
  title: string;
  content: string;
  releaseDate: Date;
  type: ReleaseType;
  isDraft: boolean;
};

const releasesBySlug: Record<string, ReleaseData[]> = {
  yarukoto: [
    {
      version: "v1.0.0",
      title: "初回リリース",
      content: `## 初回リリース

### 追加機能
- タスクの作成・編集・完了・削除・「やらない」操作
- ドラッグ＆ドロップでタスクの並び替え
- N キーショートカットでタスク作成モーダルを開く
- 日付別セクション表示（過期・今日・未予定・完了・スキップ）
- カテゴリフィルター
- タスク詳細シート（メモ内 URL の自動リンク化）
- タスク検索
- カレンダー画面
- メール・パスワード変更、パスワードリセット
- アカウント削除
- PWA manifest 設定`,
      releaseDate: new Date("2026-03-20"),
      type: ReleaseType.MAJOR,
      isDraft: false,
    },
    {
      version: "v1.1.0",
      title: "タスク管理機能の強化",
      content: `## タスク管理機能の強化

### 追加・改善内容
- 優先度の代わりにお気に入り（★）でタスクをマークできるようになりました
- タスク画面で日付・キーワード検索がまとめてフィルタリングできるようになりました
- カテゴリの表示順を並び替えられるようになりました
- タスクカードに作成日時が表示され、予定日が「昨日」「3日前」などの形式で表示されるようになりました
- タスクの更新が画面に即座に反映され、完了通知が表示されるようになりました
- タスク一覧がバックグラウンドで自動的に更新されるようになりました
- カレンダーの集計表示が見やすくなりました
- 読み込み中の表示がスケルトン UI に改善されました
- スマートフォンでもタスクカードの編集ボタンが正しく表示されるようになりました`,
      releaseDate: new Date("2026-03-22"),
      type: ReleaseType.MINOR,
      isDraft: false,
    },
  ],

  "peak-log": [
    {
      version: "v0.1.0",
      title: "MVPリリース",
      content: `## MVPリリース

### 追加機能
- Activity 管理（作成・編集・アーカイブ）
- Quick Log（ホームからワンタップで記録）
- Reflection（余韻の追加・表示）
- History 表示（月次集計・日次一覧）
- パスワード変更・ログアウト`,
      releaseDate: new Date("2026-03-12"),
      type: ReleaseType.MINOR,
      isDraft: false,
    },
    {
      version: "v0.2.0",
      title: "History・Activity 機能強化",
      content: `## History・Activity 機能強化

### 追加・改善内容
- History ページの主導線を日次 History に変更し、統計を別画面に分離
- Activity 統計機能と詳細ページを追加
- 日次 History の日付に曜日・土日祝の色分けを表示
- Home ページの Peak Log Card にオーバーフローメニューを追加
- Activity カードの UI 導線を整理
- モーダル・カード・ボタンのビジュアル強化`,
      releaseDate: new Date("2026-03-14"),
      type: ReleaseType.MINOR,
      isDraft: false,
    },
    {
      version: "v0.3.0",
      title: "UI デザインリニューアル",
      content: `## UI デザインリニューアル

### 改善内容
- カード全体のデザインを刷新（グラデーション・グロー・Activity カラーの統一）
- ActivityButton を色面グラデーション tile スタイルに変更
- History の各ログ表示を時刻 + emoji チップ UI に変更し、Activity カラーを反映
- History の日別詳細を PC 幅でモーダル表示に対応
- 各ページのヘッダーを非固定・軽量なデザインに整理

### 修正内容
- Home の Peak Log Card ドロップダウンのクリッピング問題を修正
- モーダル重なり順の表示バグを修正`,
      releaseDate: new Date("2026-03-14"),
      type: ReleaseType.MINOR,
      isDraft: false,
    },
    {
      version: "v1.0.0",
      title: "正式リリース",
      content: `## 正式リリース

### 追加・改善内容
- PWA 対応（ホーム画面への追加・オフライン起動に対応）
- アプリアイコン・OGP 画像を追加
- Log 作成時に日時（performedAt）を指定できるように変更
- 日時入力 UI をカレンダー + 時刻選択ポップオーバーに刷新
- 時刻の初期値を切り捨て・スクロール・ナビボタンの操作性を改善`,
      releaseDate: new Date("2026-03-17"),
      type: ReleaseType.MAJOR,
      isDraft: false,
    },
    {
      version: "v1.1.0",
      title: "タイムライン・ログ機能強化",
      content: `## タイムライン・ログ機能強化

### 追加・改善内容
- History にタイムライン表示モードを追加
- Activity 詳細の最近の記録を日付グループ表示に変更し、30 件まで表示
- ログ作成時にメモ（余韻 note）を入力可能に
- Home「最近のピーク」にページネーションを追加
- 新規ユーザーにデフォルト Activity を自動作成
- 各ページに説明文を追加
- ログカード・ActivityItem をコンパクトなデザインに整理
- 日付選択 UI を作成・編集で統一
- セッション有効期限を 90 日に延長・ログインページにオートフィル対応

### 修正内容
- ログカードのメモ改行を表示に反映
- 月次統計への導線を改善`,
      releaseDate: new Date("2026-03-22"),
      type: ReleaseType.MINOR,
      isDraft: false,
    },
    {
      version: "v1.2.0",
      title: "Home リニューアル・月次集計の独立",
      content: `## Home リニューアル・月次集計の独立

### 追加・改善内容
- Home をタイムライン形式にリニューアル（記録ページを廃止・FAB から記録）
- 月次集計ページをナビゲーションに独立して追加
- Activity に説明文フィールドを追加
- Activity 一覧をドラッグ＆ドロップで並び替え可能に
- Activity 一覧のメニューを廃止し、統計・編集・アーカイブボタンを独立配置
- Home にアクティビティ・メモの検索フィルターを追加
- Activity 詳細の最近の記録をカード形式に変更
- 記録の日時を Twitter 風の相対時間で表示
- Noto Sans JP・Roboto フォントを適用
- タイムライン・カードの余白・フォントサイズ・デザインを調整

### 修正内容
- 記録の作成・削除・日時編集後にホームのデータを即時反映するよう修正`,
      releaseDate: new Date("2026-03-24"),
      type: ReleaseType.MINOR,
      isDraft: false,
    },
  ],

  "furikaeri-mcp": [
    {
      version: "v0.1.0",
      title: "初回リリース",
      content: `## 初回リリース

### 追加機能
- Google Calendar のイベント取得に対応（指定日の予定一覧）
- 日記の取得に対応（Supabase 上の日記データ）
- GitHub コミット履歴の取得に対応（複数リポジトリ対応、省略時は全リポジトリ自動取得）
- タスク管理アプリ（Yarukoto）のタスク取得に対応（指定日に関係するタスクを横断取得）
- Peak Log の記録取得に対応
- 写真 URL の取得に対応
- 1日分の活動データをまとめて取得できる集約ツール（get_day_summary）を追加`,
      releaseDate: new Date("2026-03-19"),
      type: ReleaseType.MINOR,
      isDraft: false,
    },
    {
      version: "v0.2.0",
      title: "Cloudflare Workers・GitHub OAuth 移行",
      content: `## Cloudflare Workers・GitHub OAuth 移行

### 変更内容
- Cloudflare Workers + GitHub OAuth 構成に全面移行（stdio → Streamable HTTP）
- Prisma を廃止し Supabase JS Client（PostgREST）に移行
- GitHub OAuth 認証を実装（workers-oauth-provider、ALLOWED_USERNAMES によるユーザー制限）
- 全ツールを Workers ランタイム対応に移植

### 修正内容
- get_commits に User-Agent ヘッダーを追加（Workers の fetch は自動付与しないため）
- performedAt を JST ISO 文字列（+09:00）で返すよう修正
- get_tasks レスポンスにカテゴリ説明文（categories）を追加`,
      releaseDate: new Date("2026-03-19"),
      type: ReleaseType.MINOR,
      isDraft: false,
    },
    {
      version: "v0.3.0",
      title: "マネーフォワード・位置情報履歴対応",
      content: `## マネーフォワード・位置情報履歴対応

### 追加機能
- マネーフォワード ME の決済・支出履歴取得に対応（get_transactions）—— R2 から月次 CSV を取得・パース
- Google Maps タイムラインの移動・訪問場所取得に対応（get_location_history）—— R2 から Timeline.json を取得し、日付別に KV キャッシュ（TTL 7日）
- get_day_summary に transactions・locationHistory を追加`,
      releaseDate: new Date("2026-03-23"),
      type: ReleaseType.MINOR,
      isDraft: false,
    },
  ],

  // CHANGELOG.md なし → ステータス履歴・公開日をもとに作成
  jansuko: [
    {
      version: "v1.0.0",
      title: "初回リリース",
      content: `## 初回リリース

### 主な機能
- プレイヤー登録・管理
- ゲームスコアの記録
- スコア集計・ランキング表示`,
      releaseDate: new Date("2026-01-15"),
      type: ReleaseType.MAJOR,
      isDraft: false,
    },
  ],

  "paritto-dev-diary": [
    {
      version: "v1.0.0",
      title: "公開開始",
      content: `## 公開開始

技術ブログ「パリッと開発日記」を公開。

### 主な機能
- ブログ記事一覧・詳細ページ
- Markdown による記事管理
- タグによる絞り込み`,
      releaseDate: new Date("2025-12-14"),
      type: ReleaseType.MAJOR,
      isDraft: false,
    },
  ],

  // tukekan・stockee・product-manager はリリース前のため対象外
};

async function main() {
  console.log("🌱 リリースシード開始...");

  for (const [slug, releases] of Object.entries(releasesBySlug)) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) {
      console.log(`  ⚠️  プロダクトが見つかりません: ${slug}`);
      continue;
    }

    // 既存リリースを削除
    const deleted = await prisma.release.deleteMany({ where: { productId: product.id } });
    if (deleted.count > 0) {
      console.log(`  🗑️  既存リリース削除: ${product.name} (${deleted.count} 件)`);
    }

    // 新規リリースを作成
    await prisma.release.createMany({
      data: releases.map((r) => ({ ...r, productId: product.id })),
    });

    console.log(`  ✅ リリース作成: ${product.name} (${releases.length} 件)`);
  }

  console.log("✨ リリースシード完了");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
