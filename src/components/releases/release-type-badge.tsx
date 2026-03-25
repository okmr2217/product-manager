import { Badge } from "@/components/ui/badge";
import { RELEASE_TYPE_LABELS, RELEASE_TYPE_COLORS } from "@/constants";
import type { ReleaseType } from "@prisma/client";

export function ReleaseTypeBadge({ type }: { type: ReleaseType }) {
  return (
    <Badge className={RELEASE_TYPE_COLORS[type]} variant="outline">
      {RELEASE_TYPE_LABELS[type]}
    </Badge>
  );
}
