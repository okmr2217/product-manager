"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "概要", path: "" },
  { label: "タスク", path: "/tasks" },
  { label: "画像", path: "/images" },
  { label: "リリースノート", path: "/releases" },
  { label: "履歴", path: "/history" },
] as const;

export function ProductTabs({ slug }: { slug: string }) {
  const pathname = usePathname();
  const basePath = `/products/${slug}`;

  return (
    <div className="flex gap-0 border-b overflow-x-auto">
      {TABS.map(({ label, path }) => {
        const href = `${basePath}${path}`;
        const isActive = path === "" ? pathname === basePath : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
