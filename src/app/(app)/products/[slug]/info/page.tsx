import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductTabs } from "@/components/products/product-tabs";
import { ProductForm } from "@/components/products/product-form";
import { updateProduct } from "@/actions/products";

async function getProduct(slug: string) {
  return prisma.product.findUnique({ where: { slug } });
}

async function getExistingStacks() {
  const products = await prisma.product.findMany({ select: { stacks: true } });
  return [...new Set(products.flatMap((p) => p.stacks))];
}

export default async function ProductInfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, existingStacks] = await Promise.all([getProduct(slug), getExistingStacks()]);

  if (!product) notFound();

  const boundAction = updateProduct.bind(null, product.id);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
      </div>

      <ProductTabs slug={slug} productId={product.id} />

      <div className="mt-6">
        <ProductForm
          action={boundAction}
          initialData={product}
          existingStacks={existingStacks}
          cancelHref={`/products/${slug}`}
        />
      </div>
    </div>
  );
}
