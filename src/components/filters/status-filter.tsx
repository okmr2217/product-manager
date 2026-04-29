"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_VALUES } from "@/constants";
import type { ProductStatus } from "@prisma/client";

export function StatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("status") ?? "all";

  function handleChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue>{current === "all" ? "すべて" : PRODUCT_STATUS_LABELS[current as ProductStatus]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">すべて</SelectItem>
        {PRODUCT_STATUS_VALUES.map((s) => (
          <SelectItem key={s} value={s}>
            {PRODUCT_STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
