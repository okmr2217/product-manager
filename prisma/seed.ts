import { PrismaClient, ProductCategory, ProductStatus, ReleaseType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 シード開始...");

  const products = [
    {
      name: "product-manager",
      slug: "product-manager",
      description: "個人開発プロダクトの進捗・ステータス・リリース履歴を横断管理するアプリ",
      longDescription:
        "複数の個人開発プロダクトを一元管理するツール。プロダクトごとのステータス・リリースノート・DevTask・画像を管理し、技術ブログ（パリッと開発日記）のDBとして機能する。",
      category: ProductCategory.APP,
      status: ProductStatus.DEVELOPING,
      releaseDate: null,
      stacks: ["Next.js", "TypeScript", "Prisma", "Supabase", "Better Auth", "Tailwind CSS", "shadcn/ui"],
      repositoryUrl: "https://github.com/okmr2217/product-manager",
      productUrl: "https://product-manager-kappa-liard.vercel.app",
      note: "Vercel（個人アカウント）、Supabase（Freeプラン）",
      sortOrder: 5,
      isPublic: false,
      releases: [],
      statusHistory: [{ from: ProductStatus.IDEA, to: ProductStatus.DEVELOPING, note: "開発開始", changedAt: new Date("2026-03-26") }],
    },
    {
      name: "Yarukoto",
      slug: "yarukoto",
      description: "日々のタスク管理に特化したWebアプリ",
      longDescription:
        "シンプルなUIで今日やることを素早く記録・管理できるタスク管理アプリ。プロダクトごとにカテゴリ分けしてタスクを整理できる。",
      category: ProductCategory.APP,
      status: ProductStatus.RELEASED,
      releaseDate: new Date("2026-01-01"),
      stacks: ["Next.js", "TypeScript", "Prisma", "Supabase", "Better Auth", "Tailwind CSS", "shadcn/ui"],
      repositoryUrl: "https://github.com/okmr2217/yarukoto",
      productUrl: "https://yarukoto.vercel.app/",
      note: "Vercel（個人アカウント）、Supabase（Freeプラン）",
      sortOrder: 10,
      isPublic: true,
      releases: [
        {
          version: "v1.0.0",
          title: "初回リリース",
          content:
            "## 初回リリース\n\nYarukotoの初回リリース。\n\n### 追加機能\n- タスクの作成・編集・削除\n- プロダクトカテゴリによるタスク分類\n- 今日のタスク一覧表示\n- タスクの完了チェック",
          releaseDate: new Date("2026-01-01"),
          type: ReleaseType.MAJOR,
          isDraft: false,
        },
        {
          version: "v1.1.0",
          title: "タスクカテゴリ機能改善",
          content: "## タスクカテゴリ機能改善\n\n### 改善内容\n- カテゴリフィルタの追加\n- UIの細部調整\n- パフォーマンス改善",
          releaseDate: new Date("2026-03-22"),
          type: ReleaseType.MINOR,
          isDraft: false,
        },
      ],
      statusHistory: [
        { from: ProductStatus.IDEA, to: ProductStatus.DEVELOPING, note: "開発開始", changedAt: new Date("2025-12-31") },
        { from: ProductStatus.DEVELOPING, to: ProductStatus.RELEASED, note: "初回リリース（v1.0.0）", changedAt: new Date("2026-01-01") },
      ],
    },
    {
      name: "Peak Log",
      slug: "peak-log",
      description: "自分を高揚させる体験を記録するログアプリ。",
      longDescription:
        "登山・マラソン・読書など、自分を高揚させたピーク体験を記録するログアプリ。日時・タイトル・感想を記録して振り返ることで、自己成長を実感し次の挑戦へのモチベーションを高められる。",
      category: ProductCategory.APP,
      status: ProductStatus.RELEASED,
      releaseDate: new Date("2026-03-17"),
      stacks: ["Next.js", "TypeScript", "Prisma", "Supabase", "Better Auth", "Tailwind CSS", "shadcn/ui"],
      repositoryUrl: "https://github.com/okmr2217/peak-log",
      productUrl: "https://peak-log-gamma.vercel.app",
      note: "Vercel（個人アカウント）、Supabase（Freeプラン）",
      sortOrder: 20,
      isPublic: true,
      releases: [
        {
          version: "v0.1.0",
          title: "初期リリース（β版）",
          content: "## 初期リリース（β版）\n\n### 追加機能\n- 記録の作成・表示\n- 基本的なログ一覧",
          releaseDate: new Date("2026-03-12"),
          type: ReleaseType.MINOR,
          isDraft: false,
        },
        {
          version: "v1.0.0",
          title: "正式リリース",
          content: "## 正式リリース\n\n### 追加機能\n- 記録の編集・削除\n- 一覧ページのUI改善\n- 認証機能（Better Auth）",
          releaseDate: new Date("2026-03-17"),
          type: ReleaseType.MAJOR,
          isDraft: false,
        },
        {
          version: "v1.1.0",
          title: "機能追加",
          content: "## 機能追加\n\n### 改善内容\n- フィルタ・ソート機能\n- レスポンシブ対応改善",
          releaseDate: new Date("2026-03-20"),
          type: ReleaseType.MINOR,
          isDraft: false,
        },
        {
          version: "v1.2.0",
          title: "改善リリース",
          content: "## 改善リリース\n\n### 改善内容\n- UIの細部調整\n- パフォーマンス改善",
          releaseDate: new Date("2026-03-24"),
          type: ReleaseType.MINOR,
          isDraft: false,
        },
      ],
      statusHistory: [
        { from: ProductStatus.IDEA, to: ProductStatus.DEVELOPING, note: "開発開始", changedAt: new Date("2026-03-12") },
        { from: ProductStatus.DEVELOPING, to: ProductStatus.RELEASED, note: "正式リリース（v1.0.0）", changedAt: new Date("2026-03-17") },
      ],
    },
    {
      name: "furikaeri-mcp",
      slug: "furikaeri-mcp",
      description: "1日の活動を振り返るMCPサーバー",
      longDescription:
        "Claude AIと連携し、Google Calendar・GitHub・Supabase・Cloudflare R2などから1日のログを収集して振り返りを生成するMCPサーバー。Cloudflare Workers上で動作する。",
      category: ProductCategory.MCP,
      status: ProductStatus.RELEASED,
      releaseDate: new Date("2026-03-19"),
      stacks: ["TypeScript", "Cloudflare Workers", "MCP SDK", "Supabase", "GitHub OAuth", "Google Calendar API", "Zod", "Cloudflare KV", "Cloudflare R2"],
      repositoryUrl: "https://github.com/okmr2217/furikaeri-mcp",
      productUrl: "https://furikaeri-mcp.okumuradaichi2007.workers.dev/mcp",
      note: "Cloudflare Workers（無料プラン）、Supabase（Freeプラン）。GitHub OAuthとGoogle Calendar APIの認証情報が必要。",
      sortOrder: 30,
      isPublic: true,
      releases: [
        {
          version: "v0.1.0",
          title: "初回デプロイ",
          content:
            "## 初回デプロイ\n\n### 追加機能\n- Cloudflare Workers上でのMCPサーバー基盤\n- Google Calendar連携（カレンダーイベント取得）\n- GitHub連携（コミット履歴取得）\n- 日次サマリー生成",
          releaseDate: new Date("2026-03-19"),
          type: ReleaseType.MINOR,
          isDraft: false,
        },
        {
          version: "v0.2.0",
          title: "機能追加",
          content: "## 機能追加\n\n### 追加機能\n- Supabaseからのタスクログ取得\n- 写真URL取得（Cloudflare R2連携）\n- ピークログデータ連携",
          releaseDate: new Date("2026-03-21"),
          type: ReleaseType.MINOR,
          isDraft: false,
        },
        {
          version: "v0.3.0",
          title: "改善・安定化",
          content: "## 改善・安定化\n\n### 改善内容\n- エラーハンドリング改善\n- レスポンス形式の統一\n- 認証フローの安定化",
          releaseDate: new Date("2026-03-23"),
          type: ReleaseType.MINOR,
          isDraft: false,
        },
      ],
      statusHistory: [
        { from: ProductStatus.IDEA, to: ProductStatus.DEVELOPING, note: "開発開始", changedAt: new Date("2026-03-18") },
        { from: ProductStatus.DEVELOPING, to: ProductStatus.RELEASED, note: "初回デプロイ（v0.1.0）", changedAt: new Date("2026-03-19") },
      ],
    },
    {
      name: "パリッと開発日記",
      slug: "paritto-dev-diary",
      description: "個人開発の記録を発信する技術ブログ",
      longDescription:
        "Next.jsとMarkdownで構築した技術ブログ。個人開発プロダクトの紹介・開発過程・技術的な学びを発信する。プロダクト管理アプリのDBと連携してプロダクト情報を表示する。",
      category: ProductCategory.SITE,
      status: ProductStatus.MAINTENANCE,
      releaseDate: new Date("2025-12-14"),
      stacks: ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "Markdown"],
      repositoryUrl: "https://github.com/okmr2217/paritto-dev-diary",
      productUrl: "https://paritto-dev-diary.vercel.app",
      note: "Vercel（個人アカウント）",
      sortOrder: 40,
      isPublic: true,
      releases: [
        {
          version: "v1.0.0",
          title: "公開開始",
          content: "## 公開開始\n\n技術ブログ「パリッと開発日記」を公開。\n\n### 主な機能\n- ブログ記事一覧・詳細ページ\n- Markdownによる記事管理\n- タグによる絞り込み",
          releaseDate: new Date("2025-12-14"),
          type: ReleaseType.MAJOR,
          isDraft: false,
        },
      ],
      statusHistory: [
        { from: ProductStatus.IDEA, to: ProductStatus.DEVELOPING, note: "開発開始", changedAt: new Date("2025-12-14") },
        { from: ProductStatus.DEVELOPING, to: ProductStatus.RELEASED, note: "公開開始", changedAt: new Date("2025-12-14") },
        { from: ProductStatus.RELEASED, to: ProductStatus.MAINTENANCE, note: "継続的にコンテンツ追加・機能改善中", changedAt: new Date("2026-01-01") },
      ],
    },
    {
      name: "ポートフォリオサイト",
      slug: "portfolio-site",
      description: "個人ポートフォリオ・ブログサイト",
      longDescription: "Next.jsで構築した個人ポートフォリオサイト。スキル・経歴・制作物の紹介とブログ機能を兼ね備えたサイト。",
      category: ProductCategory.SITE,
      status: ProductStatus.MAINTENANCE,
      releaseDate: new Date("2024-12-01"),
      stacks: ["Next.js", "TypeScript", "Tailwind CSS"],
      repositoryUrl: "https://github.com/okmr2217/portfolio-site",
      productUrl: "https://daichi-blog.vercel.app",
      note: "Vercel（個人アカウント）。継続的にコンテンツ更新中（最終更新2025-03-16）。",
      sortOrder: 50,
      isPublic: true,
      releases: [
        {
          version: "v1.0.0",
          title: "公開",
          content: "## 公開\n\n個人ポートフォリオサイトを公開。\n\n### 主な機能\n- プロフィール・スキル紹介\n- 制作物一覧\n- ブログ機能",
          releaseDate: new Date("2024-12-01"),
          type: ReleaseType.MAJOR,
          isDraft: false,
        },
      ],
      statusHistory: [
        { from: ProductStatus.IDEA, to: ProductStatus.DEVELOPING, note: "開発開始", changedAt: new Date("2024-12-01") },
        { from: ProductStatus.DEVELOPING, to: ProductStatus.RELEASED, note: "公開", changedAt: new Date("2024-12-01") },
        { from: ProductStatus.RELEASED, to: ProductStatus.MAINTENANCE, note: "継続的にコンテンツ更新中", changedAt: new Date("2025-01-01") },
      ],
    },
    {
      name: "じゃんスコ",
      slug: "jansuko",
      description: "麻雀の点数計算・スコア管理アプリ",
      longDescription: "麻雀のゲームごとのスコアを記録・集計するWebアプリ。プレイヤー登録・ゲーム記録・スコアランキングを管理できる。",
      category: ProductCategory.APP,
      status: ProductStatus.RELEASED,
      releaseDate: new Date("2026-01-15"),
      stacks: ["Next.js", "TypeScript", "Prisma", "Supabase", "Tailwind CSS", "shadcn/ui"],
      repositoryUrl: "https://github.com/okmr2217/jansuko",
      productUrl: "https://jansuko.vercel.app",
      note: "Vercel（個人アカウント）、Supabase（Freeプラン）",
      sortOrder: 60,
      isPublic: true,
      releases: [
        {
          version: "v1.0.0",
          title: "初回リリース",
          content:
            "## 初回リリース\n\nじゃんスコの初回リリース。\n\n### 主な機能\n- プレイヤー登録・管理\n- ゲームスコアの記録\n- スコア集計・ランキング表示",
          releaseDate: new Date("2026-01-15"),
          type: ReleaseType.MAJOR,
          isDraft: false,
        },
      ],
      statusHistory: [
        { from: ProductStatus.IDEA, to: ProductStatus.DEVELOPING, note: "開発開始", changedAt: new Date("2025-12-18") },
        { from: ProductStatus.DEVELOPING, to: ProductStatus.RELEASED, note: "初回リリース（v1.0.0）", changedAt: new Date("2026-01-15") },
      ],
    },
    {
      name: "ツケカン",
      slug: "tukekan",
      description: "立替・割り勘の精算管理アプリ",
      longDescription:
        "友人・グループ間の立替金や割り勘を記録・精算するWebアプリ。誰がいくら立て替えたかを管理し、最終的な精算額を自動計算する。",
      category: ProductCategory.APP,
      status: ProductStatus.PAUSED,
      releaseDate: null,
      stacks: ["Next.js", "TypeScript", "Prisma", "Supabase", "Tailwind CSS", "shadcn/ui"],
      repositoryUrl: "https://github.com/okmr2217/tukekan",
      productUrl: "https://tukekan.vercel.app",
      note: "開発を一時休止中（2026-01-28最終コミット）。認証にbcrypt+JWTを使用（Better Authではない）。",
      sortOrder: 70,
      isPublic: false,
      releases: [],
      statusHistory: [
        { from: ProductStatus.IDEA, to: ProductStatus.DEVELOPING, note: "開発開始", changedAt: new Date("2025-12-22") },
        { from: ProductStatus.DEVELOPING, to: ProductStatus.PAUSED, note: "他プロダクト優先のため一時休止", changedAt: new Date("2026-01-28") },
      ],
    },
    {
      name: "Stockee",
      slug: "stockee",
      description: "日用品の在庫管理アプリ",
      longDescription:
        "家庭の日用品の在庫をスマートに管理するWebアプリ。在庫数の記録・補充タイミングの把握・買い物リスト生成を支援する。",
      category: ProductCategory.APP,
      status: ProductStatus.PAUSED,
      releaseDate: null,
      stacks: ["Next.js", "TypeScript", "Prisma", "Supabase", "Better Auth", "Tailwind CSS", "shadcn/ui"],
      repositoryUrl: "https://github.com/okmr2217/stockee",
      productUrl: "https://stockee-theta.vercel.app/",
      note: "開発を一時休止中（2026-01-28最終コミット）",
      sortOrder: 80,
      isPublic: false,
      releases: [],
      statusHistory: [
        { from: ProductStatus.IDEA, to: ProductStatus.DEVELOPING, note: "開発開始", changedAt: new Date("2025-12-26") },
        { from: ProductStatus.DEVELOPING, to: ProductStatus.PAUSED, note: "他プロダクト優先のため一時休止", changedAt: new Date("2026-01-28") },
      ],
    },
    {
      name: "Imageable",
      slug: "imageable",
      description: "画像管理・ギャラリーアプリ",
      longDescription: "画像のアップロード・管理・ギャラリー表示を行うWebアプリ。Supabase Storageを使った画像ストレージ管理の検証プロジェクト。",
      category: ProductCategory.APP,
      status: ProductStatus.PAUSED,
      releaseDate: null,
      stacks: ["Next.js 15", "TypeScript", "Prisma", "Supabase", "Tailwind CSS", "Zod"],
      repositoryUrl: "https://github.com/okmr2217/imageable",
      productUrl: null,
      note: "開発を一時休止中（2024-11-28最終コミット）。短期間の実験的プロジェクト。",
      sortOrder: 90,
      isPublic: false,
      releases: [],
      statusHistory: [
        { from: ProductStatus.IDEA, to: ProductStatus.DEVELOPING, note: "開発開始", changedAt: new Date("2024-11-13") },
        { from: ProductStatus.DEVELOPING, to: ProductStatus.PAUSED, note: "実験的プロジェクトとして休止", changedAt: new Date("2024-11-28") },
      ],
    },
    {
      name: "Biography",
      slug: "biography",
      description: "リアルタイムチャット付き自己紹介・ポートフォリオサイト",
      longDescription:
        "React+Vite（フロントエンド）とLaravel（バックエンド）で構築した自己紹介サイト。Pusherによるリアルタイムチャット機能を搭載。XServer VPSにセルフホスト。",
      category: ProductCategory.SITE,
      status: ProductStatus.PAUSED,
      releaseDate: new Date("2024-06-01"),
      stacks: ["React", "Vite", "TypeScript", "Laravel", "MySQL", "Tailwind CSS", "Pusher"],
      repositoryUrl: "https://github.com/okmr2217/biography",
      productUrl: null,
      note: "XServer VPS（現在稼働状況不明）。フロントとバックエンドが分離したSPAアーキテクチャ。大学のポートフォリオとして制作。",
      sortOrder: 100,
      isPublic: false,
      releases: [
        {
          version: "v1.0.0",
          title: "公開",
          content:
            "## 公開\n\nBiography（自己紹介・ポートフォリオサイト）を公開。\n\n### 主な機能\n- 自己紹介・プロフィール表示\n- Pusherを使ったリアルタイムチャット\n- スキル・経歴の紹介",
          releaseDate: new Date("2024-06-01"),
          type: ReleaseType.MAJOR,
          isDraft: false,
        },
      ],
      statusHistory: [
        { from: ProductStatus.IDEA, to: ProductStatus.DEVELOPING, note: "開発開始", changedAt: new Date("2024-05-15") },
        { from: ProductStatus.DEVELOPING, to: ProductStatus.RELEASED, note: "公開", changedAt: new Date("2024-06-01") },
        { from: ProductStatus.RELEASED, to: ProductStatus.PAUSED, note: "更新停止（VPS稼働状況不明）", changedAt: new Date("2024-12-01") },
      ],
    },
    {
      name: "aifes2023",
      slug: "aifes2023",
      description: "AI文化祭2023の公式サイト",
      longDescription: "大学のAI文化祭（2023年度）向けに制作したWordPressサイト。イベント情報・スケジュール・参加者向け情報を公開した。",
      category: ProductCategory.SITE,
      status: ProductStatus.PAUSED,
      releaseDate: new Date("2024-05-01"),
      stacks: ["WordPress"],
      repositoryUrl: "https://github.com/okmr2217/aifes2023",
      productUrl: null,
      note: "WordPress製。イベント終了後に公開停止。",
      sortOrder: 110,
      isPublic: false,
      releases: [],
      statusHistory: [
        { from: ProductStatus.IDEA, to: ProductStatus.DEVELOPING, note: "文化祭サイト制作開始", changedAt: new Date("2024-01-17") },
        { from: ProductStatus.DEVELOPING, to: ProductStatus.RELEASED, note: "公開", changedAt: new Date("2024-05-01") },
        { from: ProductStatus.RELEASED, to: ProductStatus.PAUSED, note: "イベント終了に伴い公開停止", changedAt: new Date("2024-11-01") },
      ],
    },
  ];

  for (const { releases, statusHistory, ...productData } of products) {
    const existing = await prisma.product.findUnique({ where: { slug: productData.slug } });
    if (existing) {
      console.log(`  ⏭️  スキップ（既存）: ${productData.name}`);
      continue;
    }

    const product = await prisma.product.create({ data: productData });

    if (releases.length > 0) {
      await prisma.release.createMany({
        data: releases.map((r) => ({ ...r, productId: product.id })),
      });
    }

    if (statusHistory.length > 0) {
      await prisma.statusHistory.createMany({
        data: statusHistory.map((h) => ({ ...h, productId: product.id, createdAt: h.changedAt })),
      });
    }

    console.log(`  ✅ 作成: ${productData.name} (releases: ${releases.length}, history: ${statusHistory.length})`);
  }

  console.log("✨ シード完了");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
