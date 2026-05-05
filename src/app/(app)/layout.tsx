import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";

async function getProducts() {
  return prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      iconUrl: true,
      themeColor: true,
    },
    orderBy: { sortOrder: "asc" },
  });
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();
  const products = await getProducts();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* PC サイドバー */}
      <div className="hidden md:flex md:flex-col md:w-64 md:shrink-0">
        <Sidebar products={products} />
      </div>

      {/* メインエリア */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* モバイルヘッダー */}
        <Header products={products} />

        <main className="flex-1 overflow-y-auto bg-white">
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}
