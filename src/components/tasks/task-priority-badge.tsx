import type { Priority } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABELS, PRIORITY_COLORS } from "@/constants";

export function TaskPriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge className={PRIORITY_COLORS[priority]} variant="outline">
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}
