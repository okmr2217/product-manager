"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteTask } from "@/actions/tasks";

export function TaskDeleteButton({ taskId }: { taskId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("このタスクを削除しますか？")) return;
    startTransition(async () => {
      const result = await deleteTask(taskId);
      if (!result.success) {
        toast.error(result.error ?? "削除に失敗しました");
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive px-2 py-1 rounded hover:bg-muted disabled:opacity-50"
    >
      <Trash2 className="h-3 w-3" />
      削除
    </button>
  );
}
