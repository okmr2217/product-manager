import type { ProductStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_COLORS } from "@/constants";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <Badge className={cn("border-0", PRODUCT_STATUS_COLORS[status])}>
      {PRODUCT_STATUS_LABELS[status]}
    </Badge>
  );
}
