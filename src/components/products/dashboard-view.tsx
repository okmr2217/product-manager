"use client";

import { useState, useEffect } from "react";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductWithLatestRelease } from "@/app/(app)/dashboard/page";
import { ProductCard } from "./product-card";
import { ProductTable } from "./product-table";

type ViewMode = "grid" | "table";
const STORAGE_KEY = "dashboard-view-mode";

export function DashboardView({ products }: { products: ProductWithLatestRelease[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "grid" || saved === "table") {
      setViewMode(saved);
    }
  }, []);

  function handleViewChange(mode: ViewMode) {
    setViewMode(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="flex border rounded-md overflow-hidden">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            className="rounded-none"
            onClick={() => handleViewChange("grid")}
            aria-label="グリッド表示"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            className="rounded-none"
            onClick={() => handleViewChange("table")}
            aria-label="テーブル表示"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <ProductTable products={products} />
      )}
    </div>
  );
}
