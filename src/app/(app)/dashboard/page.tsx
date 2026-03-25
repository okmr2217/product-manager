import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/lib/button-variants";
import { PageHeader } from "@/components/layout/page-header";
import { ProductCard } from "@/components/products/product-card";
import { cn } from "@/lib/utils";

async function getProducts() {
  return prisma.product.findMany({
    include: {
      images: { where: { isThumbnail: true }, take: 1 },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export default async function DashboardPage() {
  const products = await getProducts();

  return (
    <div>
      <PageHeader
        title="ダッシュボード"
        actions={
          <Link href="/products/new" className={cn(buttonVariants({ size: "sm" }))}>
            <Plus className="h-4 w-4 mr-1" />
            新規作成
          </Link>
        }
      />

      {products.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="mb-4">プロダクトがまだありません</p>
          <Link href="/products/new" className={cn(buttonVariants())}>最初のプロダクトを追加</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
