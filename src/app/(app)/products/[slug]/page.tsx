import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ExternalLink, GitFork, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/products/status-badge";
import { CategoryBadge } from "@/components/products/category-badge";
import { StackTags } from "@/components/products/stack-tags";
import { DeleteDialog } from "@/components/products/delete-dialog";
import { ProductTabs } from "@/components/products/product-tabs";
import { PRODUCT_STATUS_LABELS } from "@/constants";

async function getProduct(slug: string) {
  return prisma.product.findUnique({ where: { slug } });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
            <StatusBadge status={product.status} />
          </div>
          <p className="text-sm text-slate-500">{product.description}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href={`/products/${slug}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            <Pencil className="h-4 w-4 mr-1" />
            編集
          </Link>
          <DeleteDialog product={{ id: product.id, name: product.name }} />
        </div>
      </div>

      {/* Tabs */}
      <ProductTabs slug={slug} />

      {/* Overview content */}
      <div className="mt-6 space-y-6 max-w-2xl">
        {/* Description */}
        <section>
          <h2 className="text-sm font-medium text-slate-500 mb-1">説明</h2>
          <p className="text-slate-900">{product.description}</p>
        </section>

        {product.longDescription && (
          <section>
            <h2 className="text-sm font-medium text-slate-500 mb-1">詳細説明</h2>
            <p className="text-slate-700 whitespace-pre-wrap">{product.longDescription}</p>
          </section>
        )}

        {/* Meta */}
        <section className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">カテゴリ</p>
            <CategoryBadge category={product.category} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">ステータス</p>
            <p className="text-slate-900">{PRODUCT_STATUS_LABELS[product.status]}</p>
          </div>
          {product.releaseDate && (
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">リリース日</p>
              <p className="text-slate-900">{format(product.releaseDate, "yyyy年M月d日")}</p>
            </div>
          )}
        </section>

        {/* Links */}
        {(product.productUrl || product.repositoryUrl) && (
          <section className="space-y-2">
            {product.productUrl && (
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-slate-400 shrink-0" />
                <a href={product.productUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                  {product.productUrl}
                </a>
              </div>
            )}
            {product.repositoryUrl && (
              <div className="flex items-center gap-2">
                <GitFork className="h-4 w-4 text-slate-400 shrink-0" />
                <a href={product.repositoryUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                  {product.repositoryUrl}
                </a>
              </div>
            )}
          </section>
        )}

        {/* Stacks */}
        {product.stacks.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-slate-500 mb-2">技術スタック</h2>
            <StackTags stacks={product.stacks} />
          </section>
        )}

        {/* Note */}
        {product.note && (
          <section>
            <h2 className="text-sm font-medium text-slate-500 mb-1">備考</h2>
            <p className="text-slate-700 whitespace-pre-wrap text-sm">{product.note}</p>
          </section>
        )}
      </div>
    </div>
  );
}
