import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductTabs } from "@/components/products/product-tabs";
import { ReleaseForm } from "@/components/releases/release-form";
import { createRelease } from "@/actions/releases";

export const metadata: Metadata = {
  title: "リリースノートを追加",
};

async function getProduct(slug: string) {
  return prisma.product.findUnique({ where: { slug }, select: { id: true, slug: true } });
}

export default async function NewReleasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const action = createRelease.bind(null, product.id);

  return (
    <div>
      <ProductTabs slug={slug} />
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">リリースノートを追加</h2>
        <ReleaseForm
          action={action}
          cancelHref={`/products/${slug}/releases`}
          successHref={`/products/${slug}/releases`}
        />
      </div>
    </div>
  );
}
