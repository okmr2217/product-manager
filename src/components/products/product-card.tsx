import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import type { ProductWithLatestRelease } from "@/app/(app)/dashboard/page";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { CategoryBadge } from "./category-badge";
import { StackTags } from "./stack-tags";

export function ProductCard({ product }: { product: ProductWithLatestRelease }) {
  const thumbnail = product.images[0];
  const themeColor = product.themeColor ?? "#6366F1";
  const iconUrl = product.iconUrl;

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="hover:shadow-md transition-shadow overflow-hidden h-full">
        <div className="h-1 w-full" style={{ backgroundColor: themeColor }} />
        <div className="aspect-video bg-slate-100 relative">
          {thumbnail ? (
            <Image src={thumbnail.url} alt={thumbnail.alt ?? product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">画像なし</div>
          )}
          {iconUrl && (
            <div className="absolute bottom-2 right-2 size-8 rounded-md overflow-hidden border-2 border-white shadow-sm bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={iconUrl} alt={`${product.name} icon`} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            {iconUrl && (
              <div className="size-5 rounded overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={iconUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <h2 className="font-semibold text-base leading-snug">{product.name}</h2>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <CategoryBadge category={product.category} />
            <StatusBadge status={product.status} />
          </div>
          <StackTags stacks={product.stacks} maxDisplay={2} />
          {product.latestRelease ? (
            <p className="text-xs text-muted-foreground">
              {product.latestRelease.version} · {format(product.latestRelease.releaseDate, "yyyy/MM/dd")}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">リリースなし</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
