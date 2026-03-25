import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "@/components/products/product-form";
import { updateProduct } from "@/actions/products";
import { prisma } from "@/lib/prisma";

async function getProduct(slug: string) {
  return prisma.product.findUnique({ where: { slug } });
}

async function getExistingStacks() {
  const products = await prisma.product.findMany({ select: { stacks: true } });
  return [...new Set(products.flatMap((p) => p.stacks))];
}

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, existingStacks] = await Promise.all([getProduct(slug), getExistingStacks()]);

  if (!product) notFound();

  const boundAction = updateProduct.bind(null, product.id);

  return (
    <div>
      <PageHeader title={`${product.name} を編集`} />
      <ProductForm
        action={boundAction}
        initialData={product}
        existingStacks={existingStacks}
        cancelHref={`/products/${slug}`}
      />
    </div>
  );
}
