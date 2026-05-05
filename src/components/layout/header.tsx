"use client";

import { useState } from "react";
import { Menu, Rocket } from "lucide-react";
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
    <header className="flex h-14 items-center border-b border-[oklch(0.9_0.025_276)] bg-[oklch(0.975_0.008_276)] px-4 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="inline-flex size-8 items-center justify-center rounded-lg text-[oklch(0.48_0.04_277)] hover:bg-[oklch(0.955_0.018_277)] transition-colors">
          <Menu className="size-5" />
          <span className="sr-only">メニューを開く</span>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 max-w-64" showCloseButton={false}>
          <Sidebar products={products} />
        </SheetContent>
      </Sheet>
      <div className="ml-3 flex items-center gap-2.5">
        <img src="/icon-192.png" alt="Launchpad" className="size-7" />
        <span className="text-base font-bold text-[oklch(0.22_0.12_277)]">Launchpad</span>
      </div>
    </header>
  );
}
