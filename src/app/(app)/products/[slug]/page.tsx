import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ExternalLink, GitFork, ImageIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CategoryBadge } from "@/components/products/category-badge";
import { StatusBadge } from "@/components/products/status-badge";
import { StackTags } from "@/components/products/stack-tags";
import { DeleteDialog } from "@/components/products/delete-dialog";
import { ProductTabs } from "@/components/products/product-tabs";
import { ReleaseTypeBadge } from "@/components/releases/release-type-badge";

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
      statusHistory: {
        where: { to: "RELEASED" },
        orderBy: { changedAt: "asc" },
        take: 1,
        select: { changedAt: true },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true },
  });
  return { title: product?.name ?? slug };
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
      {children}
    </p>
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const thumbnail =
    product.images.find((img) => img.isThumbnail) ?? product.images[0] ?? null;
  const latestRelease = product.releases[0] ?? null;
  const releaseDate = product.statusHistory[0]?.changedAt ?? null;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
      </div>

      {/* Tabs */}
      <ProductTabs slug={slug} productId={product.id} />

      {/* Content */}
      <div className="mt-6 space-y-8 max-w-3xl">
        {/* Hero image */}
        <section>
          <SectionLabel>画像</SectionLabel>
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
            {thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnail.url}
                alt={thumbnail.alt ?? product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-300">
                <ImageIcon className="h-12 w-12" />
                <span className="text-sm">画像なし</span>
              </div>
            )}
          </div>
        </section>

        {/* Product name */}
        <section>
          <SectionLabel>プロダクト名</SectionLabel>
          <p className="text-xl font-semibold text-slate-900">{product.name}</p>
        </section>

        {/* Description */}
        <section>
          <SectionLabel>概要説明</SectionLabel>
          <p className="text-base text-slate-800 leading-relaxed">
            {product.description}
          </p>
        </section>

        {/* Long description */}
        {product.longDescription && (
          <section>
            <SectionLabel>詳細説明</SectionLabel>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {product.longDescription}
            </p>
          </section>
        )}

        {/* Meta grid */}
        <section className="grid grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <SectionLabel>カテゴリ</SectionLabel>
            <CategoryBadge category={product.category} />
          </div>
          <div>
            <SectionLabel>ステータス</SectionLabel>
            <StatusBadge status={product.status} />
          </div>
          {releaseDate && (
            <div>
              <SectionLabel>初回リリース日</SectionLabel>
              <p className="text-sm text-slate-800">
                {format(releaseDate, "yyyy/MM/dd")}
              </p>
            </div>
          )}
          <div>
            <SectionLabel>スラッグ</SectionLabel>
            <p className="text-sm text-slate-800 font-mono">{product.slug}</p>
          </div>
          {product.productUrl && (
            <div>
              <SectionLabel>プロダクトURL</SectionLabel>
              <a
                href={product.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline break-all"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                {product.productUrl}
              </a>
            </div>
          )}
          {product.repositoryUrl && (
            <div>
              <SectionLabel>リポジトリ</SectionLabel>
              <a
                href={product.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline break-all"
              >
                <GitFork className="h-3.5 w-3.5 shrink-0" />
                {product.repositoryUrl}
              </a>
            </div>
          )}
        </section>

        {/* Tech stacks */}
        {product.stacks.length > 0 && (
          <section>
            <SectionLabel>技術スタック</SectionLabel>
            <StackTags stacks={product.stacks} />
          </section>
        )}

        {/* Latest release */}
        {latestRelease && (
          <section>
            <SectionLabel>最新リリース</SectionLabel>
            <div className="border border-slate-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-slate-900">
                  {latestRelease.version}
                </span>
                <span className="text-slate-400">—</span>
                <span className="text-sm font-medium text-slate-800">
                  {latestRelease.title}
                </span>
                <ReleaseTypeBadge type={latestRelease.type} />
              </div>
              <p className="text-xs text-slate-400">
                {format(latestRelease.releaseDate, "yyyy/MM/dd")}
              </p>
              {latestRelease.content && (
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {latestRelease.content}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Danger zone */}
        <section className="pt-4 border-t border-slate-100">
          <SectionLabel>削除</SectionLabel>
          <p className="text-sm text-slate-500 mb-3">
            プロダクトを削除すると、タスク・リリースノート・画像・ステータス履歴を含むすべてのデータが完全に削除されます。この操作は取り消せません。
          </p>
          <DeleteDialog product={{ id: product.id, name: product.name }} />
        </section>
      </div>
    </div>
  );
}
