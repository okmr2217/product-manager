"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import type { ProductCategory, ProductStatus } from "@prisma/client";
import type { ProductWithLatestRelease } from "@/app/(app)/products/page";
import { PRODUCT_STATUS_DOT_COLORS, PRODUCT_CATEGORY_LABELS, PRODUCT_CATEGORY_COLORS } from "@/constants";
import { cn } from "@/lib/utils";

function StatusDot({ status }: { status: ProductStatus }) {
  return <span className={cn("size-[7px] rounded-full shrink-0", PRODUCT_STATUS_DOT_COLORS[status])} />;
}

function ProductIcon({ iconUrl, themeColor, name }: { iconUrl: string | null; themeColor: string | null; name: string }) {
  if (iconUrl) {
    return (
      <div className="size-11 rounded-xl overflow-hidden shrink-0">
        <Image src={iconUrl} alt="" width={44} height={44} className="w-full h-full object-cover" unoptimized />
      </div>
    );
  }
  const bg = themeColor ? `${themeColor}26` : "#6366F126";
  return (
    <div
      className="size-11 rounded-xl shrink-0 flex items-center justify-center text-sm font-semibold"
      style={{ backgroundColor: bg, color: themeColor ?? "#6366F1" }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function CategoryBadge({ category }: { category: ProductCategory }) {
  return (
    <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", PRODUCT_CATEGORY_COLORS[category])}>
      {PRODUCT_CATEGORY_LABELS[category]}
    </span>
  );
}

function VersionInfo({ release }: { release: { version: string; releaseDate: Date } | null }) {
  if (!release) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="text-xs font-medium font-mono">{release.version}</span>
      <span className="text-[10px] text-muted-foreground">{format(release.releaseDate, "yyyy/MM/dd")}</span>
    </div>
  );
}

export function ProductCard({ product }: { product: ProductWithLatestRelease }) {
  const router = useRouter();
  return (
    <div
      className="bg-card border border-border/40 rounded-xl p-4 cursor-pointer hover:border-border/80 transition-colors data-[status=DEVELOPING]:border-blue-400/60"
      data-status={product.status}
      onClick={() => router.push(`/products/${product.slug}`)}
    >
      <div className="flex items-start gap-3 mb-2.5">
        <ProductIcon iconUrl={product.iconUrl} themeColor={product.themeColor} name={product.name} />
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-base font-semibold text-foreground leading-snug">{product.name}</p>
        </div>
        <StatusDot status={product.status} />
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{product.description}</p>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
        <CategoryBadge category={product.category} />
        <VersionInfo release={product.latestRelease} />
      </div>
    </div>
  );
}
