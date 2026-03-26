import Link from "next/link";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
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
      <p className="text-xs text-slate-400">{format(release.releaseDate, "yyyy/MM/dd")}</p>
      {release.content && (
        <div className="text-xs text-slate-600 prose prose-xs max-w-none
          [&_h1]:text-sm [&_h1]:font-semibold [&_h1]:mt-2 [&_h1]:mb-1
          [&_h2]:text-xs [&_h2]:font-semibold [&_h2]:mt-2 [&_h2]:mb-1
          [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:mt-1 [&_h3]:mb-0.5
          [&_p]:my-0.5 [&_p]:leading-relaxed
          [&_ul]:my-0.5 [&_ul]:pl-4 [&_ul]:list-disc
          [&_ol]:my-0.5 [&_ol]:pl-4 [&_ol]:list-decimal
          [&_li]:my-0
          [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs
          [&_pre]:bg-slate-100 [&_pre]:p-2 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:text-xs
          [&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 [&_blockquote]:pl-2 [&_blockquote]:text-slate-500
          [&_hr]:border-slate-200 [&_hr]:my-1
          [&_strong]:font-semibold [&_em]:italic">
          <ReactMarkdown>{release.content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
