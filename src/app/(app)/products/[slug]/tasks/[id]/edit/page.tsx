import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateTask } from "@/actions/tasks";
import { TaskForm } from "@/components/tasks/task-form";

export const metadata: Metadata = {
  title: "タスクを編集",
};

async function getTask(id: string) {
  return prisma.devTask.findUnique({ where: { id } });
}

export default async function EditTaskPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const task = await getTask(id);

  if (!task) notFound();

  const action = updateTask.bind(null, task.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">タスクを編集</h1>
      <TaskForm
        action={action}
        initialData={{
          title: task.title,
          description: task.description,
          type: task.type,
          status: task.status,
          priority: task.priority,
        }}
        cancelHref={`/products/${slug}/tasks`}
      />
    </div>
  );
}
