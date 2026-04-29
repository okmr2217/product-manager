"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { LayoutGrid, List, ArrowUpDown } from "lucide-react";
import type { ProductCategory } from "@prisma/client";
import { PRODUCT_CATEGORY_LABELS } from "@/constants";
import { cn } from "@/lib/utils";

const CATEGORIES: { value: ProductCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "すべて" },
  { value: "APP", label: PRODUCT_CATEGORY_LABELS.APP },
  { value: "MCP", label: "MCP" },
  { value: "SITE", label: PRODUCT_CATEGORY_LABELS.SITE },
  { value: "EXTENSION", label: PRODUCT_CATEGORY_LABELS.EXTENSION },
  { value: "LIBRARY", label: PRODUCT_CATEGORY_LABELS.LIBRARY },
];

export function ProductToolbar({ onSort }: { onSort: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") ?? "ALL";
  const currentView = searchParams.get("view") ?? "grid";

  function setCategory(value: ProductCategory | "ALL") {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") params.delete("category");
    else params.set("category", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function setView(value: "grid" | "list") {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "grid") params.delete("view");
    else params.set("view", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex items-center gap-2 mb-5 flex-wrap">
      <div className="flex items-center gap-1 flex-1 flex-wrap">
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setCategory(value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              currentCategory === value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onSort}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
        >
          <ArrowUpDown className="size-3.5" />
          並び替え
        </button>
        <div className="flex border border-border rounded-md overflow-hidden">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "p-1.5 transition-colors",
              currentView === "grid" ? "bg-foreground text-background" : "bg-card text-muted-foreground hover:bg-muted"
            )}
            aria-label="グリッド表示"
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "p-1.5 transition-colors border-l border-border",
              currentView === "list" ? "bg-foreground text-background" : "bg-card text-muted-foreground hover:bg-muted"
            )}
            aria-label="リスト表示"
          >
            <List className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
