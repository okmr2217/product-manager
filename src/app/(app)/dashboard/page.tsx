import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import type { Product, ProductImage, ProductStatus, ProductCategory } from "@prisma/client";
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

type ProductWithThumbnail = Product & { images: Pick<ProductImage, "url" | "alt">[] };

const VALID_SORT = ["sortOrder", "updatedAt", "name", "releaseDate", "latestRelease"] as const;
type SortKey = (typeof VALID_SORT)[number];

async function getProducts(status: ProductStatus | null, category: ProductCategory | null, sort: SortKey): Promise<ProductWithThumbnail[]> {
  const where = {
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
  };

  if (sort === "latestRelease") {
    const rows = await prisma.product.findMany({
      where,
      include: {
        images: { where: { isThumbnail: true }, take: 1 },
        releases: { orderBy: { releaseDate: "desc" }, take: 1, select: { releaseDate: true } },
      },
    });
    return rows
      .sort((a, b) => (b.releases[0]?.releaseDate?.getTime() ?? 0) - (a.releases[0]?.releaseDate?.getTime() ?? 0))
      .map(({ releases: _, ...product }) => product);
  }

  return prisma.product.findMany({
    where,
    include: { images: { where: { isThumbnail: true }, take: 1 } },
    orderBy: sort === "releaseDate" ? [{ releaseDate: "desc" }, { sortOrder: "asc" }] : { [sort]: sort === "name" || sort === "sortOrder" ? "asc" : "desc" },
  });
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
