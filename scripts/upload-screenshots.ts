import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

// Load env
import * as dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "../.env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);
const prisma = new PrismaClient();

const BUCKET = "product-images";

interface ScreenshotEntry {
  filePath: string;
  filename: string;
  isThumbnail: boolean;
  alt: string;
  sortOrder: number;
}

interface ProductUploadConfig {
  slug: string;
  screenshots: ScreenshotEntry[];
}

const BASE = "C:/Development/Production";

const PRODUCT_CONFIGS: ProductUploadConfig[] = [
  {
    slug: "product-manager",
    screenshots: [
      { filePath: `${BASE}/プロダクト管理/product-manager/output/screenshots/pc/dashboard-pc.png`, filename: "dashboard-pc.png", isThumbnail: true, alt: "ダッシュボード（PC）", sortOrder: 1 },
      { filePath: `${BASE}/プロダクト管理/product-manager/output/screenshots/pc/product-detail-overview.png`, filename: "product-detail-overview.png", isThumbnail: false, alt: "プロダクト詳細 - 概要（PC）", sortOrder: 2 },
      { filePath: `${BASE}/プロダクト管理/product-manager/output/screenshots/pc/product-detail-releases.png`, filename: "product-detail-releases.png", isThumbnail: false, alt: "プロダクト詳細 - リリースノート（PC）", sortOrder: 3 },
      { filePath: `${BASE}/プロダクト管理/product-manager/output/screenshots/pc/product-detail-tasks.png`, filename: "product-detail-tasks.png", isThumbnail: false, alt: "プロダクト詳細 - タスク（PC）", sortOrder: 4 },
      { filePath: `${BASE}/プロダクト管理/product-manager/output/screenshots/pc/product-new-form.png`, filename: "product-new-form.png", isThumbnail: false, alt: "プロダクト作成フォーム（PC）", sortOrder: 5 },
      { filePath: `${BASE}/プロダクト管理/product-manager/output/screenshots/mobile/dashboard-mobile.png`, filename: "dashboard-mobile.png", isThumbnail: false, alt: "ダッシュボード（モバイル）", sortOrder: 6 },
    ],
  },
  {
    slug: "yarukoto",
    screenshots: [
      { filePath: `${BASE}/Yarukoto/yarukoto/output/screenshots/pc/home-pc.png`, filename: "home-pc.png", isThumbnail: true, alt: "ホーム（PC）", sortOrder: 1 },
      { filePath: `${BASE}/Yarukoto/yarukoto/output/screenshots/pc/calendar-pc.png`, filename: "calendar-pc.png", isThumbnail: false, alt: "カレンダー（PC）", sortOrder: 2 },
      { filePath: `${BASE}/Yarukoto/yarukoto/output/screenshots/pc/categories-list.png`, filename: "categories-list.png", isThumbnail: false, alt: "カテゴリ一覧（PC）", sortOrder: 3 },
      { filePath: `${BASE}/Yarukoto/yarukoto/output/screenshots/pc/settings.png`, filename: "settings.png", isThumbnail: false, alt: "設定（PC）", sortOrder: 4 },
      { filePath: `${BASE}/Yarukoto/yarukoto/output/screenshots/mobile/home-mobile.png`, filename: "home-mobile.png", isThumbnail: false, alt: "ホーム（モバイル）", sortOrder: 5 },
      { filePath: `${BASE}/Yarukoto/yarukoto/output/screenshots/mobile/calendar-mobile.png`, filename: "calendar-mobile.png", isThumbnail: false, alt: "カレンダー（モバイル）", sortOrder: 6 },
    ],
  },
  {
    slug: "paritto-dev-diary",
    screenshots: [
      { filePath: `${BASE}/パリッと開発日記/paritto-dev-diary/output/screenshots/pc/home-pc.png`, filename: "home-pc.png", isThumbnail: true, alt: "ホーム（PC）", sortOrder: 1 },
      { filePath: `${BASE}/パリッと開発日記/paritto-dev-diary/output/screenshots/pc/post-detail-pc.png`, filename: "post-detail-pc.png", isThumbnail: false, alt: "記事詳細（PC）", sortOrder: 2 },
      { filePath: `${BASE}/パリッと開発日記/paritto-dev-diary/output/screenshots/pc/about-pc.png`, filename: "about-pc.png", isThumbnail: false, alt: "Aboutページ（PC）", sortOrder: 3 },
      { filePath: `${BASE}/パリッと開発日記/paritto-dev-diary/output/screenshots/mobile/home-mobile.png`, filename: "home-mobile.png", isThumbnail: false, alt: "ホーム（モバイル）", sortOrder: 4 },
      { filePath: `${BASE}/パリッと開発日記/paritto-dev-diary/output/screenshots/mobile/post-detail-mobile.png`, filename: "post-detail-mobile.png", isThumbnail: false, alt: "記事詳細（モバイル）", sortOrder: 5 },
    ],
  },
  {
    slug: "jansuko",
    screenshots: [
      { filePath: `${BASE}/じゃんスコ/jansuko/output/screenshots/pc/home-sessions-pc.png`, filename: "home-sessions-pc.png", isThumbnail: true, alt: "ホーム - セッション一覧（PC）", sortOrder: 1 },
      { filePath: `${BASE}/じゃんスコ/jansuko/output/screenshots/pc/session-detail-pc.png`, filename: "session-detail-pc.png", isThumbnail: false, alt: "セッション詳細（PC）", sortOrder: 2 },
      { filePath: `${BASE}/じゃんスコ/jansuko/output/screenshots/pc/stats-pc.png`, filename: "stats-pc.png", isThumbnail: false, alt: "統計（PC）", sortOrder: 3 },
      { filePath: `${BASE}/じゃんスコ/jansuko/output/screenshots/pc/users-list-pc.png`, filename: "users-list-pc.png", isThumbnail: false, alt: "ユーザー一覧（PC）", sortOrder: 4 },
      { filePath: `${BASE}/じゃんスコ/jansuko/output/screenshots/mobile/home-sessions-mobile.png`, filename: "home-sessions-mobile.png", isThumbnail: false, alt: "ホーム（モバイル）", sortOrder: 5 },
      { filePath: `${BASE}/じゃんスコ/jansuko/output/screenshots/mobile/stats-mobile.png`, filename: "stats-mobile.png", isThumbnail: false, alt: "統計（モバイル）", sortOrder: 6 },
    ],
  },
  {
    slug: "peak-log",
    screenshots: [
      { filePath: `${BASE}/Peak Log/peak-log/output/screenshots/pc/home-timeline-pc.png`, filename: "home-timeline-pc.png", isThumbnail: true, alt: "ホーム - タイムライン（PC）", sortOrder: 1 },
      { filePath: `${BASE}/Peak Log/peak-log/output/screenshots/pc/activities-list-pc.png`, filename: "activities-list-pc.png", isThumbnail: false, alt: "アクティビティ一覧（PC）", sortOrder: 2 },
      { filePath: `${BASE}/Peak Log/peak-log/output/screenshots/pc/monthly-stats-pc.png`, filename: "monthly-stats-pc.png", isThumbnail: false, alt: "月間統計（PC）", sortOrder: 3 },
      { filePath: `${BASE}/Peak Log/peak-log/output/screenshots/pc/log-create-modal-pc.png`, filename: "log-create-modal-pc.png", isThumbnail: false, alt: "ログ作成モーダル（PC）", sortOrder: 4 },
      { filePath: `${BASE}/Peak Log/peak-log/output/screenshots/mobile/home-timeline-mobile.png`, filename: "home-timeline-mobile.png", isThumbnail: false, alt: "ホーム - タイムライン（モバイル）", sortOrder: 5 },
      { filePath: `${BASE}/Peak Log/peak-log/output/screenshots/mobile/monthly-stats-mobile.png`, filename: "monthly-stats-mobile.png", isThumbnail: false, alt: "月間統計（モバイル）", sortOrder: 6 },
    ],
  },
  {
    slug: "tukekan",
    screenshots: [
      { filePath: `${BASE}/ツケカン/tukekan/output/screenshots/pc/home-expenses-pc.png`, filename: "home-expenses-pc.png", isThumbnail: true, alt: "支出一覧（PC）", sortOrder: 1 },
      { filePath: `${BASE}/ツケカン/tukekan/output/screenshots/pc/from-members-detail.png`, filename: "from-members-detail.png", isThumbnail: false, alt: "メンバー別支出（PC）", sortOrder: 2 },
      { filePath: `${BASE}/ツケカン/tukekan/output/screenshots/pc/members-list-pc.png`, filename: "members-list-pc.png", isThumbnail: false, alt: "メンバー一覧（PC）", sortOrder: 3 },
      { filePath: `${BASE}/ツケカン/tukekan/output/screenshots/pc/group-settings.png`, filename: "group-settings.png", isThumbnail: false, alt: "グループ設定（PC）", sortOrder: 4 },
      { filePath: `${BASE}/ツケカン/tukekan/output/screenshots/mobile/home-expenses-mobile.png`, filename: "home-expenses-mobile.png", isThumbnail: false, alt: "支出一覧（モバイル）", sortOrder: 5 },
      { filePath: `${BASE}/ツケカン/tukekan/output/screenshots/mobile/members-list-mobile.png`, filename: "members-list-mobile.png", isThumbnail: false, alt: "メンバー一覧（モバイル）", sortOrder: 6 },
    ],
  },
];

async function uploadScreenshots() {
  for (const config of PRODUCT_CONFIGS) {
    console.log(`\n📦 Processing: ${config.slug}`);

    const product = await prisma.product.findUnique({
      where: { slug: config.slug },
    });

    if (!product) {
      console.log(`  ❌ Product not found: ${config.slug}`);
      continue;
    }

    console.log(`  Product ID: ${product.id}`);

    for (const screenshot of config.screenshots) {
      if (!fs.existsSync(screenshot.filePath)) {
        console.log(`  ⏭ File not found, skipping: ${screenshot.filename}`);
        continue;
      }

      const fileBuffer = fs.readFileSync(screenshot.filePath);
      const storagePath = `${product.id}/${screenshot.filename}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) {
        console.log(`  ❌ Upload failed: ${screenshot.filename} — ${uploadError.message}`);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath);

      const publicUrl = urlData.publicUrl;

      // Check if record already exists
      const existing = await prisma.productImage.findFirst({
        where: { productId: product.id, url: publicUrl },
      });

      if (existing) {
        // Update existing record
        await prisma.productImage.update({
          where: { id: existing.id },
          data: {
            alt: screenshot.alt,
            isThumbnail: screenshot.isThumbnail,
            sortOrder: screenshot.sortOrder,
          },
        });
        console.log(`  ✅ Updated: ${screenshot.filename}${screenshot.isThumbnail ? " ⭐ thumbnail" : ""}`);
      } else {
        // Create new record
        await prisma.productImage.create({
          data: {
            url: publicUrl,
            alt: screenshot.alt,
            isThumbnail: screenshot.isThumbnail,
            sortOrder: screenshot.sortOrder,
            productId: product.id,
          },
        });
        console.log(`  ✅ Created: ${screenshot.filename}${screenshot.isThumbnail ? " ⭐ thumbnail" : ""}`);
      }
    }
  }

  await prisma.$disconnect();
  console.log("\n🎉 Done!");
}

uploadScreenshots().catch((e) => {
  console.error(e);
  process.exit(1);
});
