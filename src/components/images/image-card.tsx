"use client";

import { useState, useTransition } from "react";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteImage, setThumbnail } from "@/actions/images";

interface ImageCardProps {
  image: {
    id: string;
    url: string;
    alt: string | null;
    isThumbnail: boolean;
  };
  productId: string;
}

export function ImageCard({ image, productId }: ImageCardProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteImage(image.id);
      if (!result.success) {
        toast.error(result.error ?? "削除に失敗しました");
      }
      setOpen(false);
    });
  };

  const handleSetThumbnail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (image.isThumbnail) return;
    startTransition(async () => {
      const result = await setThumbnail(image.id, productId);
      if (!result.success) {
        toast.error(result.error ?? "サムネイルの設定に失敗しました");
      }
    });
  };

  return (
    <div className="rounded-lg overflow-hidden border bg-card">
      {/* Image */}
      <div className="aspect-square relative overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.url} alt={image.alt ?? ""} className="w-full h-full object-cover" />
      </div>

      {/* Footer */}
      <div className="p-2 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 min-w-0">
          <button
            onClick={handleSetThumbnail}
            disabled={isPending || image.isThumbnail}
            title={image.isThumbnail ? "サムネイル設定済み" : "サムネイルに設定"}
            className={cn(
              "shrink-0 p-0.5 rounded transition-colors",
              image.isThumbnail ? "text-yellow-400 cursor-default" : "text-slate-300 hover:text-yellow-400"
            )}
          >
            <Star className={cn("h-4 w-4", image.isThumbnail && "fill-yellow-400")} />
          </button>
          {image.alt && <p className="text-xs text-slate-500 truncate">{image.alt}</p>}
        </div>

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" />} onClick={(e) => e.stopPropagation()}>
            <Trash2 className="h-3.5 w-3.5 text-slate-400" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>画像を削除しますか？</AlertDialogTitle>
              <AlertDialogDescription>この操作は取り消せません。Storageからも削除されます。</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {isPending ? "削除中..." : "削除する"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
