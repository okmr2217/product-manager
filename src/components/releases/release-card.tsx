import Link from "next/link";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReleaseTypeBadge } from "./release-type-badge";
import { ReleaseDeleteButton } from "./release-delete-button";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/lib/button-variants";
import type { Release } from "@prisma/client";

interface ReleaseCardProps {
  release: Release;
  slug: string;
}

export function ReleaseCard({ release, slug }: ReleaseCardProps) {
  const preview = release.content.split("\n").slice(0, 3).join("\n");

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-900">{release.version}</span>
          <span className="text-slate-500 text-sm">—</span>
          <span className="font-medium text-slate-800">{release.title}</span>
          <ReleaseTypeBadge type={release.type} />
          {release.isDraft && (
            <Badge variant="outline" className="bg-slate-100 text-slate-500">
              下書き
            </Badge>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <Link href={`/products/${slug}/releases/${release.id}/edit`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <ReleaseDeleteButton id={release.id} />
        </div>
      </div>
      <p className="text-xs text-slate-400">{format(release.releaseDate, "yyyy年M月d日")}</p>
      {preview && <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-3">{preview}</p>}
    </div>
  );
}
