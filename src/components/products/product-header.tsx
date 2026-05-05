import type { ProductStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { PRODUCT_STATUS_DOT_COLORS } from "@/constants";

type ProductHeaderProps = {
  name: string;
  iconUrl?: string | null;
  status: ProductStatus;
};

export function ProductHeader({ name, iconUrl, status }: ProductHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {iconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={iconUrl} alt="" className="size-9 rounded-xl object-cover shrink-0" />
      ) : (
        <span className="size-9 shrink-0 flex items-center justify-center">
          <span className={cn("size-3 rounded-full", PRODUCT_STATUS_DOT_COLORS[status])} />
        </span>
      )}
      <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
    </div>
  );
}
