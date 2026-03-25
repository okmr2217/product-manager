import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { ProductTabs } from "@/components/products/product-tabs";
import { HistoryEditDialog } from "@/components/products/history-edit-dialog";
import { HistoryDeleteButton } from "@/components/products/history-delete-button";
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_DOT_COLORS } from "@/constants";
import { cn } from "@/lib/utils";

async function getProductWithHistory(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      statusHistory: { orderBy: { changedAt: "desc" } },
    },
  });
}

export default async function ProductHistoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductWithHistory(slug);

  if (!product) notFound();

  return (
    <div>
      <ProductTabs slug={slug} />

      <div className="mt-6 max-w-2xl">
        <h2 className="text-sm font-medium text-slate-500 mb-4">ステータス変更履歴</h2>

        {product.statusHistory.length === 0 ? (
          <p className="text-sm text-slate-400">変更履歴はありません</p>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-2 top-3 bottom-3 w-px bg-slate-200" />

            <ul className="space-y-6">
              {product.statusHistory.map((entry) => (
                <li key={entry.id} className="flex gap-4 relative">
                  {/* Dot */}
                  <div className={cn("w-5 h-5 rounded-full shrink-0 mt-0.5 z-10", PRODUCT_STATUS_DOT_COLORS[entry.to])} />

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {PRODUCT_STATUS_LABELS[entry.to]}{" "}
                          <span className="font-normal text-slate-500">← {PRODUCT_STATUS_LABELS[entry.from]}</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{format(entry.changedAt, "yyyy年M月d日 HH:mm")}</p>
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
      </div>
    </div>
  );
}
