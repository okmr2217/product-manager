import { prisma } from "@/lib/prisma";
import { ProductTabLink } from "./product-tab-link";

async function getTabCounts(productId: string) {
  const [taskCount, imageCount, releaseCount, historyCount] = await Promise.all([
    prisma.devTask.count({ where: { productId } }),
    prisma.productImage.count({ where: { productId } }),
    prisma.release.count({ where: { productId } }),
    prisma.statusHistory.count({ where: { productId } }),
  ]);
  return { taskCount, imageCount, releaseCount, historyCount };
}

export async function ProductTabs({ slug, productId }: { slug: string; productId: string }) {
  const { taskCount, imageCount, releaseCount, historyCount } = await getTabCounts(productId);

  const tabs = [
    { label: "概要", path: "" },
    { label: "タスク", path: "/tasks", count: taskCount },
    { label: "画像", path: "/images", count: imageCount },
    { label: "リリースノート", path: "/releases", count: releaseCount },
    { label: "履歴", path: "/history", count: historyCount },
  ];

  const basePath = `/products/${slug}`;

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg mb-4 overflow-x-auto">
      {tabs.map(({ label, path, count }) => (
        <ProductTabLink
          key={path}
          label={label}
          href={`${basePath}${path}`}
          basePath={basePath}
          isExact={path === ""}
          count={count}
        />
      ))}
    </div>
  );
}
