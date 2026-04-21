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
        "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all",
        isActive
          ? "bg-background text-foreground shadow-sm border border-border"
          : "text-muted-foreground hover:text-foreground hover:bg-background/60"
      )}
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            "text-xs font-medium px-1.5 py-0.5 rounded-full tabular-nums",
            isActive ? "bg-primary/10 text-primary" : "bg-muted-foreground/15 text-muted-foreground"
          )}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
