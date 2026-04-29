import type { DevTaskStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { DEV_TASK_STATUS_LABELS, DEV_TASK_STATUS_COLORS } from "@/constants";

export function TaskStatusBadge({ status }: { status: DevTaskStatus }) {
  return (
    <Badge className={DEV_TASK_STATUS_COLORS[status]} variant="outline">
      {DEV_TASK_STATUS_LABELS[status]}
    </Badge>
  );
}
