"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { ProductCategory } from "@prisma/client";
import { PRODUCT_CATEGORY_VALUES } from "@/constants";
import type { ProductWithLatestRelease } from "@/app/(app)/products/page";
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
    return <p className="py-12 text-center text-sm text-muted-foreground">該当するプロダクトがありません</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {filtered.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
