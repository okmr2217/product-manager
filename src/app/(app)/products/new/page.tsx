import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "@/components/products/product-form";
import { createProduct } from "@/actions/products";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "プロダクトを追加",
};

async function getExistingStacks() {
  const products = await prisma.product.findMany({ select: { stacks: true } });
  return [...new Set(products.flatMap((p) => p.stacks))];
}

export default async function NewProductPage() {
  const existingStacks = await getExistingStacks();

  return (
    <div>
      <PageHeader title="プロダクトを追加" />
      <ProductForm action={createProduct} existingStacks={existingStacks} cancelHref="/dashboard" />
    </div>
  );
}
