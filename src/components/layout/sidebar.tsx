"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Plus, Rocket, Settings } from "lucide-react";
import type { ProductStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { PRODUCT_STATUS_DOT_COLORS } from "@/constants";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";

type SidebarProduct = {
  id: string;
  name: string;
  slug: string;
  status: ProductStatus;
  iconUrl?: string | null;
  themeColor?: string | null;
};

type SidebarProps = {
  products: SidebarProduct[];
};

export function Sidebar({ products }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  const isDashboardActive = pathname === "/dashboard";

  const TAB_SEGMENTS = new Set(["/tasks", "/images", "/releases", "/history"]);

  function getProductHref(slug: string): string {
    const match = pathname.match(/^\/products\/[^/]+(\/[^/]+)?/);
    const segment = match?.[1] ?? "";
    return `/products/${slug}${TAB_SEGMENTS.has(segment) ? segment : ""}`;
  }

  return (
    <aside className="flex h-full w-full flex-col bg-slate-900 border-r border-slate-700/50">
      {/* アプリ名 */}
      <div className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-indigo-600">
            <Rocket className="size-4 text-white" />
          </span>
          <span className="text-base font-semibold text-white hover:text-slate-200 transition-colors">
            Launchpad
          </span>
        </Link>
      </div>

      <Separator className="bg-slate-700/50" />

      {/* ナビゲーション */}
      <nav className="flex-1 overflow-y-auto p-2 [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.700)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700">
        {/* ダッシュボード */}
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isDashboardActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
          )}
        >
          <LayoutGrid className="size-4 shrink-0" />
          プロジェクト
        </Link>

        {/* プロダクトセクション */}
        <div className="mt-4 mb-1 px-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">プロダクト</span>
        </div>
        <Separator className="mb-1 bg-slate-700/50" />

        {products.length === 0 ? (
          <p className="px-3 py-2 text-xs text-slate-500">プロダクトがありません</p>
        ) : (
          <ul className="space-y-0.5">
            {products.map((product) => {
              const isActive = pathname === `/products/${product.slug}` || pathname.startsWith(`/products/${product.slug}/`);
              return (
                <li key={product.id}>
                  <Link
                    href={getProductHref(product.slug)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                    )}
                  >
                    {product.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.iconUrl} alt="" className="size-4 shrink-0 rounded overflow-hidden object-cover" />
                    ) : (
                      <span className={cn("size-2 shrink-0 rounded-full", PRODUCT_STATUS_DOT_COLORS[product.status])} />
                    )}
                    <span className="truncate">{product.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {/* 下部 */}
      <div className="p-2 space-y-1">
        <Separator className="mb-2 bg-slate-700/50" />

        <Link
          href="/products/new"
          className="flex w-full items-center justify-start gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-200"
        >
          <Plus className="size-4" />
          新規作成
        </Link>

        <Link
          href="/settings"
          className={cn(
            "flex w-full items-center justify-start gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
            pathname === "/settings" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
          )}
        >
          <Settings className="size-4" />
          設定
        </Link>

        <Separator className="my-2 bg-slate-700/50" />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-200">
            <span className="size-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300 shrink-0">
              {session?.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </span>
            <span className="truncate">{session?.user?.name ?? session?.user?.email ?? "ユーザー"}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-48">
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
