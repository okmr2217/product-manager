"use client";

import { useState, Suspense } from "react";
import type { ProductWithLatestRelease } from "@/app/(app)/products/page";
import { ProductToolbar } from "./product-toolbar";
import { ProductGrid } from "./product-grid";
import { ProductList } from "./product-list";
import { ProductSortable } from "./product-sortable";

export function ProductDashboard({ products }: { products: ProductWithLatestRelease[] }) {
  const [sortMode, setSortMode] = useState(false);

  if (sortMode) {
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted-foreground">ドラッグして並び替え、保存で確定します</p>
        </div>
        <ProductSortable products={products} onDone={() => setSortMode(false)} />
      </div>
    );
  }

  return (
    <>
      <Suspense>
        <ProductToolbar onSort={() => setSortMode(true)} />
      </Suspense>
      <Suspense>
        <ProductGrid products={products} />
      </Suspense>
      <Suspense>
        <ProductList products={products} />
      </Suspense>
    </>
  );
}
