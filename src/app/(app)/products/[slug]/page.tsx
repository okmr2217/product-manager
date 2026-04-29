import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ExternalLink, GitFork, ImageIcon, Circle, Clock, CheckCircle2 } from "lucide-react";
import type { DevTaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { CategoryBadge } from "@/components/products/category-badge";
import { StatusBadge } from "@/components/products/status-badge";
import { StackTags } from "@/components/products/stack-tags";
import { ProductTabs } from "@/components/products/product-tabs";
import { ReleaseTypeBadge } from "@/components/releases/release-type-badge";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_DOT_COLORS } from "@/constants";

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      releases: {
        where: { isDraft: false },
        orderBy: { releaseDate: "desc" },
        take: 1,
      },
      tasks: {
        where: { status: { not: "DONE" } },
        orderBy: { createdAt: "asc" },
        take: 4,
      },
      statusHistory: {
        orderBy: { changedAt: "desc" },
      },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true, iconUrl: true },
  });
  return {
    title: product?.name ?? slug,
    description: product?.description,
    openGraph: {
      images: product?.iconUrl ? [{ url: product.iconUrl }] : [],
    },
  };
}

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">{label}</p>
      {children}
    </div>
  );
}

const TASK_STATUS_ICONS: Record<DevTaskStatus, React.ElementType> = {
  TODO: Circle,
  IN_PROGRESS: Clock,
  DONE: CheckCircle2,
  ON_HOLD: Circle,
};

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const thumbnail = product.images.find((img) => img.isThumbnail) ?? product.images[0] ?? null;
  const latestRelease = product.releases[0] ?? null;
  const releaseDate = product.statusHistory.filter((h) => h.to === "RELEASED").at(-1)?.changedAt ?? null;
  const historyTimeline = product.statusHistory.slice(0, 6);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
      </div>

      <ProductTabs slug={slug} productId={product.id} />

      <div className="mt-6 max-w-5xl">
        {/* Thumbnail */}
        <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnail.url} alt={thumbnail.alt ?? product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-300">
              <ImageIcon className="h-12 w-12" />
              <span className="text-sm">画像なし</span>
            </div>
          )}
        </div>

        {/* 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* Left column */}
          <div className="md:col-span-2 space-y-6">
            <p className="text-base text-slate-800 leading-relaxed">{product.description}</p>

            {product.longDescription && (
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {product.longDescription}
              </p>
            )}

            {(product.productUrl || product.repositoryUrl) && (
              <div className="flex flex-wrap gap-4">
                {product.productUrl && (
                  <a
                    href={product.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    プロダクトURL
                  </a>
                )}
                {product.repositoryUrl && (
                  <a
                    href={product.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                  >
                    <GitFork className="h-3.5 w-3.5 shrink-0" />
                    リポジトリ
                  </a>
                )}
              </div>
            )}

            {latestRelease && (
              <div className="rounded-lg border border-slate-200 p-4 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-semibold">{latestRelease.version}</span>
                  <ReleaseTypeBadge type={latestRelease.type} />
                  <span className="text-sm text-slate-700">{latestRelease.title}</span>
                </div>
                <p className="text-xs text-slate-400">{format(latestRelease.releaseDate, "yyyy/MM/dd")}</p>
                {latestRelease.content && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{latestRelease.content}</p>
                )}
                <Link href={`/products/${slug}/releases`} className="text-xs text-blue-600 hover:underline block">
                  すべてのリリースを見る →
                </Link>
              </div>
            )}

            {product.tasks.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">オープンタスク</p>
                {product.tasks.map((task) => {
                  const Icon = TASK_STATUS_ICONS[task.status];
                  return (
                    <div key={task.id} className="flex items-center gap-2.5 text-sm py-1.5 border-b border-slate-100 last:border-0">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="text-slate-700 line-clamp-1 flex-1">{task.title}</span>
                      {task.priority && <TaskPriorityBadge priority={task.priority} />}
                    </div>
                  );
                })}
                <Link href={`/products/${slug}/tasks`} className="text-xs text-blue-600 hover:underline block pt-1">
                  すべてのタスクを見る →
                </Link>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <MetaItem label="ステータス">
              <StatusBadge status={product.status} />
            </MetaItem>
            <MetaItem label="カテゴリ">
              <CategoryBadge category={product.category} />
            </MetaItem>
            {releaseDate && (
              <MetaItem label="初回リリース日">
                <p className="text-sm text-slate-800">{format(releaseDate, "yyyy/MM/dd")}</p>
              </MetaItem>
            )}
            <MetaItem label="スラッグ">
              <p className="font-mono text-sm text-slate-700">{product.slug}</p>
            </MetaItem>
            {product.stacks.length > 0 && (
              <MetaItem label="技術スタック">
                <StackTags stacks={product.stacks} />
              </MetaItem>
            )}
          </div>
        </div>

        {/* Status history timeline (read-only) */}
        <section className="mt-10 pt-8 border-t border-slate-100">
          <h2 className="text-sm font-medium text-slate-500 mb-4">ステータス履歴</h2>
          {historyTimeline.length === 0 ? (
            <p className="text-sm text-slate-400">変更履歴はありません</p>
          ) : (
            <div className="relative max-w-xl">
              <div className="absolute left-2 top-3 bottom-3 w-px bg-slate-200" />
              <ul className="space-y-5">
                {historyTimeline.map((entry) => (
                  <li key={entry.id} className="flex gap-4 relative">
                    <div className={cn("w-5 h-5 rounded-full shrink-0 mt-0.5 z-10", PRODUCT_STATUS_DOT_COLORS[entry.to])} />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {PRODUCT_STATUS_LABELS[entry.to]}
                        <span className="font-normal text-slate-500 ml-1">← {PRODUCT_STATUS_LABELS[entry.from]}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{format(entry.changedAt, "yyyy/MM/dd HH:mm")}</p>
                      {entry.note && <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{entry.note}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
