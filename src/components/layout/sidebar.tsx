"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Plus } from "lucide-react";
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
};

type SidebarProps = {
  products: SidebarProduct[];
};

export function Sidebar({ products }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const isDashboardActive = pathname === "/dashboard";

  return (
    <aside className="flex h-full w-64 flex-col bg-slate-50 border-r border-slate-200">
      {/* アプリ名 */}
      <div className="p-4">
        <Link href="/dashboard" className="block">
          <span className="text-base font-semibold text-slate-900 hover:text-slate-700 transition-colors">
            Product Manager
          </span>
        </Link>
      </div>

      <Separator />

      {/* ナビゲーション */}
      <nav className="flex-1 overflow-y-auto p-2">
        {/* ダッシュボード */}
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isDashboardActive ? "bg-slate-200 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
        >
          <LayoutDashboard className="size-4 shrink-0" />
          ダッシュボード
        </Link>

        {/* プロダクトセクション */}
        <div className="mt-4 mb-1 px-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">プロダクト</span>
        </div>
        <Separator className="mb-1" />

        {products.length === 0 ? (
          <p className="px-3 py-2 text-xs text-slate-400">プロダクトがありません</p>
        ) : (
          <ul className="space-y-0.5">
            {products.map((product) => {
              const isActive = pathname === `/products/${product.slug}` || pathname.startsWith(`/products/${product.slug}/`);
              return (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.slug}`}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive ? "bg-slate-200 text-slate-900 font-medium" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <span className={cn("size-2 shrink-0 rounded-full", PRODUCT_STATUS_DOT_COLORS[product.status])} />
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
        <Separator className="mb-2" />

        <Link
          href="/products/new"
          className="flex w-full items-center justify-start gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <Plus className="size-4" />
          新規作成
        </Link>

        <Separator className="my-2" />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
            <span className="size-6 rounded-full bg-slate-300 flex items-center justify-center text-xs font-medium text-slate-700 shrink-0">
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
