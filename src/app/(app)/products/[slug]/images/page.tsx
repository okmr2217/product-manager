import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductTabs } from "@/components/products/product-tabs";
import { ImagesPanel } from "@/components/images/images-panel";

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
      <ProductTabs slug={slug} />
      <div className="mt-6">
        <ImagesPanel images={product.images} productId={product.id} />
      </div>
    </div>
  );
}
