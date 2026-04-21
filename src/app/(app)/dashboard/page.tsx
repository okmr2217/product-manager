import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import type { Product, ProductImage, ProductStatus, ProductCategory, StatusHistory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/lib/button-variants";
import { PageHeader } from "@/components/layout/page-header";
import { DashboardView } from "@/components/products/dashboard-view";
import { StatusFilter } from "@/components/filters/status-filter";
import { CategoryFilter } from "@/components/filters/category-filter";
import { SortSelect } from "@/components/filters/sort-select";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "ダッシュボード",
};

export type LatestRelease = { version: string; releaseDate: Date } | null;

export type ProductWithLatestRelease = Product & {
  images: Pick<ProductImage, "url" | "alt">[];
  releasedAt: Pick<StatusHistory, "changedAt"> | null;
  latestRelease: LatestRelease;
};

const VALID_SORT = ["sortOrder", "updatedAt", "name", "releaseDate", "latestRelease"] as const;
type SortKey = (typeof VALID_SORT)[number];

async function getProducts(status: ProductStatus | null, category: ProductCategory | null, sort: SortKey): Promise<ProductWithLatestRelease[]> {
  const where = {
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
  };

  const releasedAtInclude = {
    statusHistory: { where: { to: "RELEASED" as const }, orderBy: { changedAt: "asc" as const }, take: 1, select: { changedAt: true } },
  };

  const releasesInclude = {
    releases: { orderBy: { releaseDate: "desc" as const }, take: 1, select: { version: true, releaseDate: true } },
  };

  if (sort === "latestRelease") {
    const rows = await prisma.product.findMany({
      where,
      include: {
        images: { where: { isThumbnail: true }, take: 1 },
        ...releasedAtInclude,
        ...releasesInclude,
      },
    });
    return rows
      .sort((a, b) => (b.releases[0]?.releaseDate?.getTime() ?? 0) - (a.releases[0]?.releaseDate?.getTime() ?? 0))
      .map(({ releases, statusHistory, ...product }) => ({
        ...product,
        releasedAt: statusHistory[0] ?? null,
        latestRelease: releases[0] ?? null,
      }));
  }

  if (sort === "releaseDate") {
    const rows = await prisma.product.findMany({
      where,
      include: { images: { where: { isThumbnail: true }, take: 1 }, ...releasedAtInclude, ...releasesInclude },
    });
    return rows
      .sort((a, b) => (b.statusHistory[0]?.changedAt?.getTime() ?? 0) - (a.statusHistory[0]?.changedAt?.getTime() ?? 0))
      .map(({ statusHistory, releases, ...product }) => ({
        ...product,
        releasedAt: statusHistory[0] ?? null,
        latestRelease: releases[0] ?? null,
      }));
  }

  const rows = await prisma.product.findMany({
    where,
    include: { images: { where: { isThumbnail: true }, take: 1 }, ...releasedAtInclude, ...releasesInclude },
    orderBy: { [sort]: sort === "name" || sort === "sortOrder" ? "asc" : "desc" },
  });
  return rows.map(({ statusHistory, releases, ...product }) => ({
    ...product,
    releasedAt: statusHistory[0] ?? null,
    latestRelease: releases[0] ?? null,
  }));
}

type SearchParams = Promise<{ status?: string; category?: string; sort?: string }>;

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const statusValues = ["IDEA", "DEVELOPING", "RELEASED", "MAINTENANCE", "PAUSED"] as const;
  const categoryValues = ["APP", "MCP", "SITE"] as const;

  const status = statusValues.includes(params.status as ProductStatus) ? (params.status as ProductStatus) : null;
  const category = categoryValues.includes(params.category as ProductCategory) ? (params.category as ProductCategory) : null;
  const sort: SortKey = VALID_SORT.includes(params.sort as SortKey) ? (params.sort as SortKey) : "sortOrder";

  const products = await getProducts(status, category, sort);

  return (
    <div>
      <PageHeader
        title="ダッシュボード"
        actions={
          <Link href="/products/new" className={cn(buttonVariants({ size: "sm" }))}>
            <Plus className="h-4 w-4 mr-1" />
            新規作成
          </Link>
        }
      />

      <div className="flex gap-2 mb-6 flex-wrap">
        <Suspense>
          <StatusFilter />
        </Suspense>
        <Suspense>
          <CategoryFilter />
        </Suspense>
        <Suspense>
          <SortSelect />
        </Suspense>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="mb-4">
            {status || category ? "条件に一致するプロダクトがありません" : "プロダクトがまだありません"}
          </p>
          {!status && !category && (
            <Link href="/products/new" className={cn(buttonVariants())}>
              最初のプロダクトを追加
            </Link>
          )}
        </div>
      ) : (
        <DashboardView products={products} />
      )}
    </div>
  );
}
