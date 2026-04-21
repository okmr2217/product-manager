"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  href: string;
  basePath: string;
  isExact: boolean;
  count?: number;
};

export function ProductTabLink({ label, href, basePath, isExact, count }: Props) {
  const pathname = usePathname();
  const isActive = isExact ? pathname === basePath : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors flex items-center gap-1.5",
        isActive
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
      )}
    >
      {label}
      {count !== undefined && <span className="text-xs tabular-nums opacity-60">{count}</span>}
    </Link>
  );
}
