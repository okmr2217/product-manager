"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import type { ProductWithLatestRelease } from "@/app/(app)/products/page";
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_COLORS, PRODUCT_CATEGORY_LABELS, PRODUCT_CATEGORY_COLORS } from "@/constants";
import { cn } from "@/lib/utils";

export function ProductListRow({ product }: { product: ProductWithLatestRelease }) {
  const router = useRouter();
  const { iconUrl, themeColor, name, description, category, status, latestRelease } = product;

  function renderIcon() {
    if (iconUrl) {
      return (
        <div className="size-7 rounded-lg overflow-hidden shrink-0">
          <Image src={iconUrl} alt="" width={28} height={28} className="w-full h-full object-cover" unoptimized />
        </div>
      );
    }
    const bg = themeColor ? `${themeColor}26` : "#6366F126";
    return (
      <div
        className="size-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-semibold"
        style={{ backgroundColor: bg, color: themeColor ?? "#6366F1" }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      className="grid items-center gap-4 px-4 py-3 bg-card border-b border-border/40 last:border-b-0 cursor-pointer hover:bg-muted/30 transition-colors data-[status=DEVELOPING]:border-l-2 data-[status=DEVELOPING]:border-blue-400 data-[status=DEVELOPING]:pl-[14px]"
      style={{ gridTemplateColumns: "36px 1fr 90px 100px 130px" }}
      data-status={product.status}
      onClick={() => router.push(`/products/${product.slug}`)}
    >
      {renderIcon()}
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{description}</p>
      </div>
      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded w-fit", PRODUCT_CATEGORY_COLORS[category])}>
        {PRODUCT_CATEGORY_LABELS[category]}
      </span>
      <span className={cn("text-[10px] px-2 py-0.5 rounded-full inline-flex items-center w-fit", PRODUCT_STATUS_COLORS[status])}>
        {PRODUCT_STATUS_LABELS[status]}
      </span>
      {latestRelease ? (
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-xs font-medium font-mono">{latestRelease.version}</span>
          <span className="text-[10px] text-muted-foreground">{format(latestRelease.releaseDate, "yyyy/MM/dd")}</span>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      )}
    </div>
  );
}
