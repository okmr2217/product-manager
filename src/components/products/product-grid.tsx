"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { ProductCategory } from "@prisma/client";
import { PRODUCT_CATEGORY_VALUES } from "@/constants";
import type { ProductWithLatestRelease } from "@/app/(app)/dashboard/page";
import { ProductCard } from "./product-card";

export function ProductGrid({ products }: { products: ProductWithLatestRelease[] }) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "grid";
  const categoryParam = searchParams.get("category");
  const category = PRODUCT_CATEGORY_VALUES.includes(categoryParam as ProductCategory) ? (categoryParam as ProductCategory) : null;

  const filtered = useMemo(() => {
    if (!category) return products;
    return products.filter((p) => p.category === category);
  }, [products, category]);

  if (view !== "grid") return null;

  if (filtered.length === 0) {
    return <p className="py-12 text-center text-sm text-muted-foreground">該当するプロジェクトがありません</p>;
  }

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
      {filtered.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
