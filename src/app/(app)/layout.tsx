import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";

async function getProducts() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      iconUrl: true,
      themeColor: true,
      releases: {
        select: { releaseDate: true },
        orderBy: { releaseDate: "desc" },
        take: 1,
      },
    },
  });

  return products.sort((a, b) => {
    const aDate = a.releases[0]?.releaseDate ?? new Date(0);
    const bDate = b.releases[0]?.releaseDate ?? new Date(0);
    return bDate.getTime() - aDate.getTime();
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
          <div className="p-6">{children}</div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}
