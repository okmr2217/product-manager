import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Product } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/lib/button-variants";
import { PageHeader } from "@/components/layout/page-header";
import { ProductSummaryBar } from "@/components/products/product-summary-bar";
import { ProductDashboard } from "@/components/products/product-dashboard";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "プロダクト",
};

export type LatestRelease = { version: string; releaseDate: Date } | null;

export type ProductWithLatestRelease = Product & {
  latestRelease: LatestRelease;
};

export default async function DashboardPage() {
  const [rows, statusCounts] = await Promise.all([
    prisma.product.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        releases: {
          where: { isDraft: false },
          orderBy: { releaseDate: "desc" },
          take: 1,
          select: { version: true, releaseDate: true },
        },
      },
    }),
    prisma.product.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const products: ProductWithLatestRelease[] = rows.map(({ releases, ...product }) => ({
    ...product,
    latestRelease: releases[0] ?? null,
  }));

  const countMap = Object.fromEntries(statusCounts.map(({ status, _count }) => [status, _count._all]));
  const summaryProps = {
    total: products.length,
    released: countMap.RELEASED ?? 0,
    developing: countMap.DEVELOPING ?? 0,
    idea: countMap.IDEA ?? 0,
  };

  return (
    <div>
      <PageHeader
        title="プロダクト"
        actions={
          <Link href="/products/new" className={cn(buttonVariants({ size: "sm" }))}>
            <Plus className="h-4 w-4 mr-1" />
            新規作成
          </Link>
        }
      />

      <ProductSummaryBar {...summaryProps} />

      {products.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="mb-4">プロダクトがまだありません</p>
          <Link href="/products/new" className={cn(buttonVariants())}>
            最初のプロダクトを追加
          </Link>
        </div>
      ) : (
        <ProductDashboard products={products} />
      )}
    </div>
  );
}
