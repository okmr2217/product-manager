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

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="hover:shadow-md transition-shadow overflow-hidden h-full">
        <div className="aspect-video bg-slate-100 relative">
          {thumbnail ? (
            <Image src={thumbnail.url} alt={thumbnail.alt ?? product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">画像なし</div>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <h2 className="font-semibold text-base leading-snug">{product.name}</h2>
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
