import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { ProductTabs } from "@/components/products/product-tabs";
import { ReleaseCard } from "@/components/releases/release-card";
import { DeleteDialog } from "@/components/products/delete-dialog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { name: true } });
  return { title: product ? `${product.name} — リリースノート` : "リリースノート" };
}

async function getProductWithReleases(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      releases: { orderBy: { releaseDate: "desc" } },
    },
  });
}

export default async function ProductReleasesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductWithReleases(slug);

  if (!product) notFound();

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
        <div className="flex gap-2 shrink-0">
          <Link href={`/products/${slug}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            <Pencil className="h-4 w-4 mr-1" />
            編集
          </Link>
          <DeleteDialog product={{ id: product.id, name: product.name }} />
        </div>
      </div>
      <ProductTabs slug={slug} />

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-slate-500">リリースノート</h2>
          <Link href={`/products/${slug}/releases/new`} className={cn(buttonVariants({ size: "sm" }))}>
            <Plus className="h-4 w-4 mr-1" />
            リリースノートを追加
          </Link>
        </div>

        {product.releases.length === 0 ? (
          <p className="text-sm text-slate-400">リリースノートはありません</p>
        ) : (
          <div className="space-y-3">
            {product.releases.map((release) => (
              <ReleaseCard key={release.id} release={release} slug={slug} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
