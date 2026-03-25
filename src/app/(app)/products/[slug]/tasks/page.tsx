import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/lib/button-variants";
import { ProductTabs } from "@/components/products/product-tabs";
import { TaskList } from "@/components/tasks/task-list";

async function getProductWithTasks(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      tasks: { orderBy: { createdAt: "asc" } },
    },
  });
}

export default async function TasksPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductWithTasks(slug);

  if (!product) notFound();

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
      </div>

      <ProductTabs slug={slug} />

      <div className="mt-6">
        <div className="flex justify-end mb-4">
          <Link href={`/products/${slug}/tasks/new`} className={buttonVariants({ size: "sm" })}>
            <Plus className="h-4 w-4 mr-1" />
            タスクを追加
          </Link>
        </div>
        <TaskList tasks={product.tasks} slug={slug} />
      </div>
    </div>
  );
}
