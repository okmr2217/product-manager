"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { ProductCategory } from "@prisma/client";
import { PRODUCT_CATEGORY_VALUES } from "@/constants";
import type { ProductWithLatestRelease } from "@/app/(app)/dashboard/page";
import { ProductListRow } from "./product-list-row";

export function ProductList({ products }: { products: ProductWithLatestRelease[] }) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "grid";
  const categoryParam = searchParams.get("category");
  const category = PRODUCT_CATEGORY_VALUES.includes(categoryParam as ProductCategory) ? (categoryParam as ProductCategory) : null;

  const filtered = useMemo(() => {
    if (!category) return products;
    return products.filter((p) => p.category === category);
  }, [products, category]);

  if (view !== "list") return null;

  if (filtered.length === 0) {
    return <p className="py-12 text-center text-sm text-muted-foreground">該当するプロジェクトがありません</p>;
  }

  return (
    <div className="border border-border/40 rounded-xl overflow-hidden">
      <div
        className="grid items-center gap-4 px-4 py-2 bg-muted/50 border-b border-border/40"
        style={{ gridTemplateColumns: "36px 1fr 90px 100px 130px" }}
      >
        <div />
        <span className="text-[11px] text-muted-foreground font-medium tracking-wide">プロジェクト</span>
        <span className="text-[11px] text-muted-foreground font-medium tracking-wide">カテゴリ</span>
        <span className="text-[11px] text-muted-foreground font-medium tracking-wide">ステータス</span>
        <span className="text-[11px] text-muted-foreground font-medium tracking-wide">最新バージョン</span>
      </div>
      {filtered.map((product) => (
        <ProductListRow key={product.id} product={product} />
      ))}
    </div>
  );
}
