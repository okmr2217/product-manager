import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { ProductTabs } from "@/components/products/product-tabs";
import { ImagesPanel } from "@/components/images/images-panel";
import { DeleteDialog } from "@/components/products/delete-dialog";

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
        <ImagesPanel images={product.images} productId={product.id} />
      </div>
    </div>
  );
}
