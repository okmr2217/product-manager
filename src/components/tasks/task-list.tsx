"use client";

import { useState } from "react";
import type { DevTask, DevTaskStatus, DevTaskType, Priority } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEV_TASK_STATUS_LABELS, DEV_TASK_TYPE_LABELS, PRIORITY_LABELS } from "@/constants";
import { TaskCard } from "./task-card";

const PRIORITY_ORDER: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

function sortTasks(tasks: DevTask[]): DevTask[] {
  return [...tasks].sort((a, b) => {
    const aDone = a.status === "DONE";
    const bDone = b.status === "DONE";
    if (aDone !== bDone) return aDone ? 1 : -1;

    const aPriority = a.priority ? (PRIORITY_ORDER[a.priority] ?? 3) : 3;
    const bPriority = b.priority ? (PRIORITY_ORDER[b.priority] ?? 3) : 3;
    return aPriority - bPriority;
  });
}

interface TaskListProps {
  tasks: DevTask[];
  slug: string;
}

export function TaskList({ tasks, slug }: TaskListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  const filtered = tasks.filter((task) => {
    if (statusFilter !== "ALL" && task.status !== statusFilter) return false;
    if (typeFilter !== "ALL" && task.type !== typeFilter) return false;
    if (priorityFilter !== "ALL" && task.priority !== priorityFilter) return false;
    return true;
  });

  const sorted = sortTasks(filtered);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
          <SelectTrigger className="w-36">
            <SelectValue>{statusFilter === "ALL" ? "すべて" : DEV_TASK_STATUS_LABELS[statusFilter as DevTaskStatus]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">すべて</SelectItem>
            {(Object.entries(DEV_TASK_STATUS_LABELS) as [DevTaskStatus, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "ALL")}>
          <SelectTrigger className="w-36">
            <SelectValue>{typeFilter === "ALL" ? "すべて" : DEV_TASK_TYPE_LABELS[typeFilter as DevTaskType]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">すべて</SelectItem>
            {(Object.entries(DEV_TASK_TYPE_LABELS) as [DevTaskType, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v ?? "ALL")}>
          <SelectTrigger className="w-36">
            <SelectValue>{priorityFilter === "ALL" ? "すべて" : PRIORITY_LABELS[priorityFilter as Priority]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">すべて</SelectItem>
            {(Object.entries(PRIORITY_LABELS) as [Priority, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Task list */}
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">タスクがありません</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((task) => (
            <TaskCard key={task.id} task={task} slug={slug} />
          ))}
        </div>
      )}
    </div>
  );
}
