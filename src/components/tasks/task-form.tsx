"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import type { DevTaskType, DevTaskStatus, Priority } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/button-variants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEV_TASK_TYPE_LABELS, DEV_TASK_STATUS_LABELS, PRIORITY_LABELS } from "@/constants";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/types";

interface InitialData {
  title?: string;
  description?: string | null;
  type?: DevTaskType;
  status?: DevTaskStatus;
  priority?: Priority | null;
}

interface TaskFormProps {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  initialData?: InitialData;
  cancelHref: string;
}

export function TaskForm({ action, initialData, cancelHref }: TaskFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [type, setType] = useState<string>(initialData?.type ?? "");
  const [status, setStatus] = useState<string>(initialData?.status ?? "TODO");
  const [priority, setPriority] = useState<string>(initialData?.priority ?? "");

  useEffect(() => {
    if (state?.success === false && state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const fieldError = (field: string) => state?.fieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="space-y-5 max-w-2xl">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="priority" value={priority} />

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">
          タスク名 <span className="text-red-500">*</span>
        </Label>
        <Input id="title" name="title" defaultValue={initialData?.title} />
        {fieldError("title") && <p className="text-sm text-red-500">{fieldError("title")}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">詳細</Label>
        <Textarea id="description" name="description" rows={5} defaultValue={initialData?.description ?? ""} placeholder="マークダウン対応" />
      </div>

      {/* Type */}
      <div className="space-y-1.5">
        <Label>
          タイプ <span className="text-red-500">*</span>
        </Label>
        <Select value={type} onValueChange={(value) => setType(value ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="タイプを選択">{type ? DEV_TASK_TYPE_LABELS[type as DevTaskType] : undefined}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(DEV_TASK_TYPE_LABELS) as [DevTaskType, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldError("type") && <p className="text-sm text-red-500">{fieldError("type")}</p>}
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <Label>
          ステータス <span className="text-red-500">*</span>
        </Label>
        <Select value={status} onValueChange={(value) => setStatus(value ?? "TODO")}>
          <SelectTrigger>
            <SelectValue placeholder="ステータスを選択">{DEV_TASK_STATUS_LABELS[status as DevTaskStatus]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(DEV_TASK_STATUS_LABELS) as [DevTaskStatus, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldError("status") && <p className="text-sm text-red-500">{fieldError("status")}</p>}
      </div>

      {/* Priority */}
      <div className="space-y-1.5">
        <Label>優先度</Label>
        <Select value={priority} onValueChange={(value) => setPriority(value ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="優先度を選択（任意）">{priority === "" ? "未設定" : priority ? PRIORITY_LABELS[priority as Priority] : undefined}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">未設定</SelectItem>
            {(Object.entries(PRIORITY_LABELS) as [Priority, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Link href={cancelHref} className={cn(buttonVariants({ variant: "outline" }))}>キャンセル</Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? "保存中..." : "保存"}
        </Button>
      </div>
    </form>
  );
}
