"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import type { DevTask } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toggleTaskDone } from "@/actions/tasks";
import { TaskTypeBadge } from "./task-type-badge";
import { TaskStatusBadge } from "./task-status-badge";
import { TaskPriorityBadge } from "./task-priority-badge";
import { TaskDeleteButton } from "./task-delete-button";

interface TaskCardProps {
  task: DevTask;
  slug: string;
}

export function TaskCard({ task, slug }: TaskCardProps) {
  const [isPending, startTransition] = useTransition();
  const isDone = task.status === "DONE";
  const descriptionFirstLine = task.description?.split("\n")[0];

  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      const result = await toggleTaskDone(task.id, checked);
      if (!result.success) {
        toast.error(result.error ?? "更新に失敗しました");
      }
    });
  };

  return (
    <div className={cn("flex items-start gap-3 p-4 border rounded-lg bg-white", isDone && "opacity-50")}>
      <Checkbox
        checked={isDone}
        onCheckedChange={(checked) => handleToggle(checked === true)}
        disabled={isPending}
        className="mt-0.5 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium text-slate-900", isDone && "line-through")}>{task.title}</p>
        {descriptionFirstLine && (
          <p className="text-sm text-slate-500 mt-0.5 truncate">{descriptionFirstLine}</p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-2">
          <TaskTypeBadge type={task.type} />
          <TaskStatusBadge status={task.status} />
          {task.priority && <TaskPriorityBadge priority={task.priority} />}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Link href={`/products/${slug}/tasks/${task.id}/edit`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted">
          <Pencil className="h-3 w-3" />
          編集
        </Link>
        <TaskDeleteButton taskId={task.id} />
      </div>
    </div>
  );
}
