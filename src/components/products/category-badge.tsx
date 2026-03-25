import type { ProductCategory } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_CATEGORY_LABELS, PRODUCT_CATEGORY_COLORS } from "@/constants";
import { cn } from "@/lib/utils";

export function CategoryBadge({ category }: { category: ProductCategory }) {
  return (
    <Badge className={cn("border-0", PRODUCT_CATEGORY_COLORS[category])}>
      {PRODUCT_CATEGORY_LABELS[category]}
    </Badge>
  );
}
