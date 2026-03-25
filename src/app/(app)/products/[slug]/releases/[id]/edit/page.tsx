import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductTabs } from "@/components/products/product-tabs";
import { ReleaseForm } from "@/components/releases/release-form";
import { updateRelease } from "@/actions/releases";

export const metadata: Metadata = {
  title: "リリースノートを編集",
};

async function getRelease(id: string, slug: string) {
  return prisma.release.findFirst({
    where: { id, product: { slug } },
  });
}

export default async function EditReleasePage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const release = await getRelease(id, slug);

  if (!release) notFound();

  const action = updateRelease.bind(null, id);

  return (
    <div>
      <ProductTabs slug={slug} />
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">リリースノートを編集</h2>
        <ReleaseForm
          action={action}
          initialData={release}
          cancelHref={`/products/${slug}/releases`}
          successHref={`/products/${slug}/releases`}
        />
      </div>
    </div>
  );
}
