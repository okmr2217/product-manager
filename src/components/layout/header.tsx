"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import type { ProductStatus } from "@prisma/client";

type HeaderProduct = {
  id: string;
  name: string;
  slug: string;
  status: ProductStatus;
};

type HeaderProps = {
  products: HeaderProduct[];
};

export function Header({ products }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-14 items-center border-b border-slate-200 bg-white px-4 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="inline-flex size-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
          <Menu className="size-5" />
          <span className="sr-only">メニューを開く</span>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 max-w-64" showCloseButton={false}>
          <Sidebar products={products} />
        </SheetContent>
      </Sheet>
      <span className="ml-3 text-sm font-semibold text-slate-900">Launchpad</span>
    </header>
  );
}
