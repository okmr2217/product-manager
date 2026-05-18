import type { DevTaskType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { DEV_TASK_TYPE_LABELS, DEV_TASK_TYPE_COLORS } from "@/constants";

export function TaskTypeBadge({ type }: { type: DevTaskType }) {
  return (
    <Badge className={DEV_TASK_TYPE_COLORS[type]} variant="outline">
      {DEV_TASK_TYPE_LABELS[type]}
    </Badge>
  );
}
