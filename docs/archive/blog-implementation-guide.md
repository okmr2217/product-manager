# ブログ側（paritto-dev-diary）実装ガイド

プロダクト管理アプリのDBからデータを読み取り、ブログにプロダクト一覧・詳細ページを追加するための実装手順。

---

## 前提

- ブログ: Next.js 16 App Router（`app/` ルート）、Prisma 未導入
- Supabase: `product-images` バケット作成済み
- プロダクト管理アプリ側のマイグレーション適用済み

---

## Step 1: Supabase に blog_reader ロールを作成する

Supabase ダッシュボード → **SQL Editor** で以下を実行する。

```sql
-- 読み取り専用ロールを作成
CREATE ROLE blog_reader WITH LOGIN PASSWORD 'ここに強いパスワードを設定';

-- スキーマへのアクセスを許可
GRANT USAGE ON SCHEMA public TO blog_reader;

-- 必要なテーブルのSELECT権限のみ付与（DevTaskは除外）
GRANT SELECT ON "Product" TO blog_reader;
GRANT SELECT ON "ProductImage" TO blog_reader;
GRANT SELECT ON "Release" TO blog_reader;
GRANT SELECT ON "StatusHistory" TO blog_reader;
```

接続文字列のホストは **Project Settings → Database → Connection string** から確認する。
完成した接続文字列: `postgresql://blog_reader:[パスワード]@[host]:5432/postgres`

---

## Step 2: Prisma をブログに導入する

ブログのリポジトリルートで以下を実行する。

```bash
npm install prisma @prisma/client
npx prisma init
```

`npx prisma init` は `prisma/schema.prisma` と `.env` を自動生成する。
`.env` は次の Step で不要になるので削除してよい（`.env.local` を使う）。

---

## Step 3: schema.prisma をコピーする

プロダクト管理アプリの `prisma/schema.prisma` をブログの `prisma/schema.prisma` に**上書きコピー**する。
`prisma init` が生成したファイルを置き換える。

```bash
# product-manager リポジトリのルートから実行
cp prisma/schema.prisma "../パリッと開発日記/paritto-dev-diary/prisma/schema.prisma"
```

datasource の `url` は環境変数で差し替えるので、ファイル自体は両リポジトリで同一のまま管理する。

> **スキーマ変更時:** プロダクト管理アプリ側でマイグレーションを実行したら、このコピーを再実行して `npx prisma generate` を実行する。

---

## Step 4: 環境変数を設定する

ブログのリポジトリルートに `.env.local` が存在しなければ新規作成し、以下を追加する。

```env
DATABASE_URL="postgresql://blog_reader:[パスワード]@[host]:5432/postgres"
```

`.gitignore` に `.env*` が含まれているので、このファイルはコミットされない。

---

## Step 5: Prisma Client を作成する

`lib/prisma.ts` を**新規作成**する。

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

## Step 6: 定数ファイルを作成する

`lib/product-constants.ts` を**新規作成**する。

```typescript
// lib/product-constants.ts
export const PRODUCT_STATUS_LABEL: Record<string, string> = {
  IDEA: "構想中",
  DEVELOPING: "開発中",
  RELEASED: "リリース済",
  MAINTENANCE: "メンテナンス",
  PAUSED: "休止中",
};

export const PRODUCT_CATEGORY_LABEL: Record<string, string> = {
  APP: "アプリ",
  MCP: "MCP",
  SITE: "サイト",
};

export const PRODUCT_STATUS_COLOR: Record<string, string> = {
  IDEA: "bg-slate-100 text-slate-700",
  DEVELOPING: "bg-blue-100 text-blue-700",
  RELEASED: "bg-green-100 text-green-700",
  MAINTENANCE: "bg-yellow-100 text-yellow-700",
  PAUSED: "bg-red-100 text-red-700",
};

export const PRODUCT_CATEGORY_COLOR: Record<string, string> = {
  APP: "bg-purple-100 text-purple-700",
  MCP: "bg-orange-100 text-orange-700",
  SITE: "bg-cyan-100 text-cyan-700",
};

export const RELEASE_TYPE_LABEL: Record<string, string> = {
  MAJOR: "メジャー",
  MINOR: "マイナー",
  PATCH: "パッチ",
  HOTFIX: "ホットフィックス",
};
```

---

## Step 7: プロダクト一覧ページを作成する

`app/products/` ディレクトリを作成し、`app/products/page.tsx` を**新規作成**する。

```typescript
// app/products/page.tsx
import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/page-hero";
import { ProductCard } from "@/components/product-card";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "プロダクト",
  description: "個人開発したプロダクトの一覧です。",
};

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { isPublic: true },
    include: {
      images: {
        where: { isThumbnail: true },
        take: 1,
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-8">
      <PageHero title="プロダクト">
        <p className="text-sm text-muted-foreground mt-1">個人開発したプロダクトの一覧です。</p>
      </PageHero>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

---

## Step 8: ProductCard コンポーネントを作成する

`components/product-card.tsx` を**新規作成**する。

```typescript
// components/product-card.tsx
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PRODUCT_STATUS_LABEL,
  PRODUCT_CATEGORY_LABEL,
  PRODUCT_STATUS_COLOR,
  PRODUCT_CATEGORY_COLOR,
} from "@/lib/product-constants";

type ProductWithThumbnail = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  status: string;
  stacks: string[];
  updatedAt: Date;
  images: { url: string; alt: string | null }[];
};

type Props = {
  product: ProductWithThumbnail;
};

export function ProductCard({ product }: Props) {
  const thumbnail = product.images[0];
  const visibleStacks = product.stacks.slice(0, 2);
  const hiddenCount = product.stacks.length - 2;

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md py-0 gap-0">
        <div className="aspect-video bg-muted relative overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail.url}
              alt={thumbnail.alt ?? product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No Image
            </div>
          )}
        </div>
        <CardHeader className="pt-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRODUCT_CATEGORY_COLOR[product.category]}`}>
              {PRODUCT_CATEGORY_LABEL[product.category]}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRODUCT_STATUS_COLOR[product.status]}`}>
              {PRODUCT_STATUS_LABEL[product.status]}
            </span>
          </div>
          <CardTitle className="text-base mt-1">{product.name}</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {product.description}
          </p>
          {product.stacks.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {visibleStacks.map((stack) => (
                <span
                  key={stack}
                  className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded"
                >
                  {stack}
                </span>
              ))}
              {hiddenCount > 0 && (
                <span className="text-xs text-muted-foreground px-1 py-0.5">
                  +{hiddenCount}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
```

---

## Step 9: プロダクト詳細ページを作成する

`app/products/[slug]/` ディレクトリを作成し、`app/products/[slug]/page.tsx` を**新規作成**する。

```typescript
// app/products/[slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/page-hero";
import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import {
  PRODUCT_STATUS_LABEL,
  PRODUCT_CATEGORY_LABEL,
  PRODUCT_STATUS_COLOR,
  PRODUCT_CATEGORY_COLOR,
  RELEASE_TYPE_LABEL,
} from "@/lib/product-constants";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isPublic: true },
    select: { slug: true },
  });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, isPublic: true },
  });

  if (!product) return { title: "プロダクトが見つかりません" };

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: { slug, isPublic: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      releases: {
        where: { isDraft: false },
        orderBy: { releaseDate: "desc" },
      },
    },
  });

  if (!product) notFound();

  // 関連記事: frontmatterのproductSlugで紐付け
  const allPosts = getAllPosts();
  const relatedPosts = allPosts.filter((post) => post.productSlug === slug);

  return (
    <div className="space-y-10">
      <PageHero title={product.name}>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PRODUCT_CATEGORY_COLOR[product.category]}`}>
            {PRODUCT_CATEGORY_LABEL[product.category]}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PRODUCT_STATUS_COLOR[product.status]}`}>
            {PRODUCT_STATUS_LABEL[product.status]}
          </span>
        </div>
      </PageHero>

      {/* 画像ギャラリー */}
      {product.images.length > 0 && (
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.images.map((image) => (
              <div key={image.id} className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                <Image src={image.url} alt={image.alt ?? product.name} fill className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 概要 */}
      <section className="space-y-4">
        <p className="text-foreground">{product.description}</p>
        {product.longDescription && (
          <p className="text-muted-foreground whitespace-pre-wrap">{product.longDescription}</p>
        )}

        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          {product.releaseDate && (
            <>
              <dt className="text-muted-foreground font-medium">リリース日</dt>
              <dd>{new Date(product.releaseDate).toLocaleDateString("ja-JP")}</dd>
            </>
          )}
          {product.productUrl && (
            <>
              <dt className="text-muted-foreground font-medium">URL</dt>
              <dd>
                <a href={product.productUrl} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all">
                  {product.productUrl}
                </a>
              </dd>
            </>
          )}
          {product.repositoryUrl && (
            <>
              <dt className="text-muted-foreground font-medium">リポジトリ</dt>
              <dd>
                <a href={product.repositoryUrl} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all">
                  {product.repositoryUrl}
                </a>
              </dd>
            </>
          )}
        </dl>

        {product.stacks.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-2">技術スタック</p>
            <div className="flex flex-wrap gap-2">
              {product.stacks.map((stack) => (
                <span key={stack}
                  className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded">
                  {stack}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 関連記事 */}
      {relatedPosts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">関連記事</h2>
          <div className="space-y-4">
            {relatedPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* リリースノート */}
      {product.releases.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">リリースノート</h2>
          <div className="space-y-4">
            {product.releases.map((release) => (
              <div key={release.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono font-semibold">{release.version}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {RELEASE_TYPE_LABEL[release.type]}
                  </span>
                  <time className="text-sm text-muted-foreground">
                    {new Date(release.releaseDate).toLocaleDateString("ja-JP")}
                  </time>
                </div>
                <p className="font-medium">{release.title}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{release.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="pt-4">
        <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">
          ← プロダクト一覧に戻る
        </Link>
      </div>
    </div>
  );
}
```

---

## Step 10: PostMeta 型に productSlug を追加する

`lib/posts.ts` を**編集**する。変更箇所は2か所。

**① 型定義に追加**

```typescript
export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  productSlug?: string;  // 追加
};
```

**② getAllPosts() のマッピングに追加**

`return { ... }` の末尾に1行追加する。

```typescript
return {
  slug,
  title: data.title || slug,
  date: data.date || "",
  description: data.description || "",
  tags: data.tags || [],
  productSlug: data.productSlug ?? undefined,  // 追加
};
```

---

## Step 11: 既存記事の frontmatter に productSlug を追加する

プロダクト管理アプリで設定した `slug` と一致させる。プロダクトがない記事には追加不要。

```markdown
---
title: "「先週の火曜日、何してた？」にClaudeが答えてくれるMCPサーバーを自作した"
date: "2026年3月19日"
description: "..."
tags: ["MCP", "Claude", "振り返り", "個人開発"]
productSlug: "furikaeri-mcp"   # ← 追加
---
```

対象ファイルと追加する値（プロダクト管理アプリの slug に合わせる）:
- `content/posts/furikaeri-mcp.md` → `productSlug: "furikaeri-mcp"`
- `content/posts/yarukoto.md` → `productSlug: "yarukoto"`
- 他にも紐づけたい記事があれば同様に追加する

---

## Step 12: next.config.ts を更新する

`next.config.ts` を**編集**する。既存の `images.remotePatterns` に Supabase Storage のドメインを追加し、`redirects` を新たに追加する。

> Supabase Storage のホスト名は `[project-ref].supabase.co` の形式。
> プロジェクトの ref は Supabase ダッシュボードの **Project Settings → General → Reference ID** で確認する。

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // Supabase Storage の画像を next/image で表示するために追加
      {
        protocol: "https",
        hostname: "[project-ref].supabase.co",  // ← 実際の値に置き換える
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      // 旧 Works ページを新 Products ページにリダイレクト
      {
        source: "/posts/products",
        destination: "/products",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

---

## Step 13: ヘッダーの "Works" リンクを更新する

`components/header.tsx` を**編集**する。`href="/posts/products"` を `href="/products"` に変更する。

```diff
- <Link
-   href="/posts/products"
-   className="relative text-sm font-medium font-heading ..."
- >
-   Works
- </Link>
+ <Link
+   href="/products"
+   className="relative text-sm font-medium font-heading transition-colors hover:text-accent after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:tech-gradient after:transition-all after:duration-300 hover:after:w-full"
+ >
+   Works
+ </Link>
```

---

## Prisma generate と動作確認

```bash
# Prisma Client を生成（ファイル作成・スキーマコピー後に必ず実行）
npx prisma generate

# 開発サーバーで動作確認
npm run dev
# → http://localhost:3000/products でプロダクト一覧を確認
# → http://localhost:3000/products/[slug] でプロダクト詳細を確認
```

---

## Vercel へのデプロイ

**① 環境変数を設定する**

Vercel のプロジェクト設定 → **Environment Variables** に以下を追加する。

| 変数名 | 値 |
|--------|-----|
| `DATABASE_URL` | `postgresql://blog_reader:[パスワード]@[host]:5432/postgres` |

**② build スクリプトを更新する**

`package.json` を**編集**し、`build` スクリプトに `prisma generate &&` を追加する。
これがないと Vercel のビルド時に Prisma Client が生成されずにビルドエラーになる。

```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

---

## スキーマ変更時のメンテナンス手順

プロダクト管理アプリ側でスキーマを変更した場合は以下の手順を実行する。

```bash
# 1. プロダクト管理アプリ側でマイグレーション
cd product-manager
npx prisma migrate dev --name [migration_name]

# 2. ブログ側にスキーマをコピー
cp prisma/schema.prisma "../パリッと開発日記/paritto-dev-diary/prisma/schema.prisma"

# 3. ブログ側で Prisma Client を再生成
cd "../パリッと開発日記/paritto-dev-diary"
npx prisma generate
```
