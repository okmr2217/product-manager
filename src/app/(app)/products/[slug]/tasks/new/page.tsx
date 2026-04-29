import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createTask } from "@/actions/tasks";
import { TaskForm } from "@/components/tasks/task-form";

export const metadata: Metadata = {
  title: "タスクを追加",
};

async function getProduct(slug: string) {
  return prisma.product.findUnique({ where: { slug } });
}

export default async function NewTaskPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const action = createTask.bind(null, product.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">タスクを追加</h1>
      <TaskForm action={action} cancelHref={`/products/${slug}/tasks`} />
    </div>
  );
}
