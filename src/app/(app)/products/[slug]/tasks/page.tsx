import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, Circle, Clock, CheckCircle2, PauseCircle } from "lucide-react";
import type { DevTask, DevTaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/lib/button-variants";
import { ProductTabs } from "@/components/products/product-tabs";
import { TaskCard } from "@/components/tasks/task-card";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { name: true } });
  return { title: product ? `${product.name} — タスク` : "タスク" };
}

async function getProductWithTasks(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      tasks: { orderBy: { createdAt: "asc" } },
    },
  });
}

const STATUS_GROUPS: { key: DevTaskStatus; label: string; icon: React.ElementType; collapsible?: boolean }[] = [
  { key: "TODO", label: "未着手", icon: Circle },
  { key: "IN_PROGRESS", label: "進行中", icon: Clock },
  { key: "ON_HOLD", label: "保留", icon: PauseCircle },
  { key: "DONE", label: "完了", icon: CheckCircle2, collapsible: true },
];

function TaskGroup({ group, tasks, slug }: { group: (typeof STATUS_GROUPS)[number]; tasks: DevTask[]; slug: string }) {
  const Icon = group.icon;
  const header = (
    <div className="flex items-center gap-2 mb-2">
      <Icon className="h-4 w-4 text-slate-400" />
      <span className="text-sm font-medium text-slate-600">{group.label}</span>
      <span className="text-xs text-slate-400">({tasks.length})</span>
    </div>
  );
  const body =
    tasks.length === 0 ? (
      <p className="text-sm text-slate-400 pl-6">なし</p>
    ) : (
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} slug={slug} />
        ))}
      </div>
    );

  if (group.collapsible) {
    return (
      <details>
        <summary className="flex items-center gap-2 cursor-pointer list-none mb-2">
          <Icon className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">{group.label}</span>
          <span className="text-xs text-slate-400">({tasks.length})</span>
        </summary>
        {body}
      </details>
    );
  }

  return (
    <section className="space-y-1.5">
      {header}
      {body}
    </section>
  );
}

export default async function TasksPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductWithTasks(slug);

  if (!product) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
      </div>

      <ProductTabs slug={slug} productId={product.id} />

      <div className="mt-6">
        <div className="flex justify-end mb-6">
          <Link href={`/products/${slug}/tasks/new`} className={buttonVariants({ size: "sm" })}>
            <Plus className="h-4 w-4 mr-1" />
            タスクを追加
          </Link>
        </div>

        <div className="space-y-8">
          {STATUS_GROUPS.map((group) => (
            <TaskGroup
              key={group.key}
              group={group}
              tasks={product.tasks.filter((t) => t.status === group.key)}
              slug={slug}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
