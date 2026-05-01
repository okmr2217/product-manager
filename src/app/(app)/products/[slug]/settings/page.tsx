import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { updateProduct } from "@/actions/products";
import { ProductTabs } from "@/components/products/product-tabs";
import { ProductSettingsForm } from "@/components/products/product-settings-form";
import { StatusBadge } from "@/components/products/status-badge";
import { StatusChangeDialog } from "@/components/products/status-change-dialog";
import { HistoryEditDialog } from "@/components/products/history-edit-dialog";
import { HistoryDeleteButton } from "@/components/products/history-delete-button";
import { DeleteDialog } from "@/components/products/delete-dialog";
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_DOT_COLORS } from "@/constants";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { name: true } });
  return { title: product ? `${product.name} — 設定` : "設定" };
}

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      statusHistory: { orderBy: { changedAt: "desc" } },
    },
  });
}

async function getExistingStacks() {
  const products = await prisma.product.findMany({ select: { stacks: true } });
  return [...new Set(products.flatMap((p) => p.stacks))];
}

async function getTabCounts(productId: string) {
  const [taskCount, imageCount, releaseCount] = await Promise.all([
    prisma.devTask.count({ where: { productId } }),
    prisma.productImage.count({ where: { productId } }),
    prisma.release.count({ where: { productId } }),
  ]);
  return { taskCount, imageCount, releaseCount };
}

function SectionHeader({ title, description, danger }: { title: string; description?: string; danger?: boolean }) {
  return (
    <div className={cn("pb-2 border-b border-slate-200")}>
      <h2 className={cn("text-base font-semibold", danger ? "text-red-600" : "text-slate-900")}>{title}</h2>
      {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
    </div>
  );
}

export default async function ProductSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, existingStacks] = await Promise.all([getProduct(slug), getExistingStacks()]);

  if (!product) notFound();

  const { taskCount, imageCount, releaseCount } = await getTabCounts(product.id);
  const boundAction = updateProduct.bind(null, product.id);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
      </div>

      <ProductTabs slug={slug} productId={product.id} />

      <div className="mt-6 max-w-5xl space-y-12">
        {/* Section 1: 基本情報 */}
        <section className="space-y-4">
          <ProductSettingsForm
            action={boundAction}
            initialData={product}
            existingStacks={existingStacks}
            cancelHref={`/products/${slug}`}
            productName={product.name}
            taskCount={taskCount}
            imageCount={imageCount}
            releaseCount={releaseCount}
          />
        </section>

        {/* Section 2: ステータス管理 */}
        <section className="space-y-4">
          <SectionHeader title="ステータス管理" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">現在のステータス:</span>
              <StatusBadge status={product.status} />
            </div>
            <StatusChangeDialog productId={product.id} currentStatus={product.status} />
          </div>

          {product.statusHistory.length === 0 ? (
            <p className="text-sm text-slate-400">変更履歴はありません</p>
          ) : (
            <div className="relative mt-4">
              <div className="absolute left-2 top-3 bottom-3 w-px bg-slate-200" />
              <ul className="space-y-6">
                {product.statusHistory.map((entry) => (
                  <li key={entry.id} className="flex gap-4 relative">
                    <div className={cn("w-5 h-5 rounded-full shrink-0 mt-0.5 z-10", PRODUCT_STATUS_DOT_COLORS[entry.to])} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {PRODUCT_STATUS_LABELS[entry.to]}{" "}
                            <span className="font-normal text-slate-500">← {PRODUCT_STATUS_LABELS[entry.from]}</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{format(entry.changedAt, "yyyy/MM/dd HH:mm")}</p>
                          {entry.note && <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{entry.note}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <HistoryEditDialog entry={entry} />
                          <HistoryDeleteButton id={entry.id} />
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Section 3: 危険な操作 */}
        <section className="space-y-4">
          <SectionHeader
            title="危険な操作"
            description="プロダクトを削除すると、タスク・リリースノート・画像・ステータス履歴を含むすべてのデータが完全に削除されます。この操作は取り消せません。"
            danger
          />
          <DeleteDialog product={{ id: product.id, name: product.name }} />
        </section>
      </div>
    </div>
  );
}
