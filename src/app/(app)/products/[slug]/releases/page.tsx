import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { ProductTabs } from "@/components/products/product-tabs";
import { ReleaseCard } from "@/components/releases/release-card";
import { ProductHeader } from "@/components/products/product-header";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { name: true } });
  return { title: product ? `${product.name} — リリース` : "リリース" };
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

  const drafts = product.releases.filter((r) => r.isDraft);
  const published = product.releases.filter((r) => !r.isDraft);

  return (
    <div>
      <ProductHeader name={product.name} iconUrl={product.iconUrl} status={product.status} />
      <ProductTabs slug={slug} productId={product.id} />

      <div className="mt-6">
        <div className="flex justify-end mb-6">
          <Link href={`/products/${slug}/releases/new`} className={cn(buttonVariants({ size: "sm" }))}>
            <Plus className="h-4 w-4 mr-1" />
            リリースノートを追加
          </Link>
        </div>

        {product.releases.length === 0 ? (
          <p className="text-sm text-slate-400">リリースノートはありません</p>
        ) : (
          <div className="space-y-8">
            {drafts.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <h3 className="text-sm font-medium text-slate-600">下書き</h3>
                  <span className="text-xs text-slate-400">({drafts.length})</span>
                </div>
                <div className="space-y-3">
                  {drafts.map((release) => (
                    <ReleaseCard key={release.id} release={release} slug={slug} />
                  ))}
                </div>
              </section>
            )}

            {drafts.length > 0 && published.length > 0 && <hr className="border-slate-100" />}

            {published.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-medium text-slate-600">公開済み</h3>
                  <span className="text-xs text-slate-400">({published.length})</span>
                </div>
                <div className="space-y-3">
                  {published.map((release) => (
                    <ReleaseCard key={release.id} release={release} slug={slug} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
