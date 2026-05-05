import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductTabs } from "@/components/products/product-tabs";
import { ImagesPanel } from "@/components/images/images-panel";
import { ProductHeader } from "@/components/products/product-header";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { name: true } });
  return { title: product ? `${product.name} — 画像` : "画像" };
}

async function getProductWithImages(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export default async function ProductImagesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductWithImages(slug);

  if (!product) notFound();

  return (
    <div>
      <ProductHeader name={product.name} iconUrl={product.iconUrl} status={product.status} />
      <ProductTabs slug={slug} productId={product.id} />
      <div className="mt-6">
        <ImagesPanel images={product.images} productId={product.id} />
      </div>
    </div>
  );
}
