import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import type { ProductStatus, ProductCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/lib/button-variants";
import { PageHeader } from "@/components/layout/page-header";
import { ProductCard } from "@/components/products/product-card";
import { StatusFilter } from "@/components/filters/status-filter";
import { CategoryFilter } from "@/components/filters/category-filter";
import { SortSelect } from "@/components/filters/sort-select";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "ダッシュボード",
};

const VALID_SORT = ["sortOrder", "updatedAt", "name", "releaseDate"] as const;
type SortKey = (typeof VALID_SORT)[number];

async function getProducts(status: ProductStatus | null, category: ProductCategory | null, sort: SortKey) {
  return prisma.product.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
    },
    include: {
      images: { where: { isThumbnail: true }, take: 1 },
    },
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
