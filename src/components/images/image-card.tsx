"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2, Pencil, ImageIcon } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteImage, setThumbnail, replaceImage, updateImageAlt } from "@/actions/images";
import { useUpload } from "@/hooks/use-upload";

interface ImageCardProps {
  image: {
    id: string;
    url: string;
    alt: string | null;
    isThumbnail: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  productId: string;
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function ImageCard({ image, productId }: ImageCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [displayAlt, setDisplayAlt] = useState(image.alt);
  const [altValue, setAltValue] = useState(image.alt ?? "");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useUpload();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteImage(image.id);
      if (!result.success) {
        toast.error(result.error ?? "削除に失敗しました");
      }
      setDeleteOpen(false);
    });
  };

  const handleReplaceClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("非対応の形式です（PNG/JPEG/WebP/GIF のみ）");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("ファイルサイズが5MBを超えています");
      return;
    }

    const uploadResult = await upload(file, productId);
    if (!uploadResult) {
      toast.error("アップロードに失敗しました");
      return;
    }

    startTransition(async () => {
      const result = await replaceImage(image.id, uploadResult.url);
      if (!result.success) {
        toast.error(result.error ?? "画像の変更に失敗しました");
      } else {
        toast.success("画像を変更しました");
        router.refresh();
      }
    });
  };

  const handleRename = () => {
    startTransition(async () => {
      const result = await updateImageAlt(image.id, altValue);
      if (!result.success) {
        toast.error(result.error ?? "名前の変更に失敗しました");
      } else {
        toast.success("名前を変更しました");
        setDisplayAlt(altValue.trim() || null);
        setRenameOpen(false);
        router.refresh();
      }
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

  const isUpdated = image.updatedAt.getTime() - image.createdAt.getTime() > 1000;

  const formatDate = (date: Date) =>
    date.toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="rounded-lg overflow-hidden border bg-card">
      {/* Image */}
      <div className="aspect-square relative overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.url} alt={image.alt ?? ""} className="w-full h-full object-cover" />
      </div>

      {/* Footer */}
      <div className="p-2 space-y-1.5">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 min-w-0">
            {image.isThumbnail ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-600 bg-yellow-50 border border-yellow-200 rounded px-1.5 py-0.5 shrink-0">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                サムネイル
              </span>
            ) : (
              <button
                onClick={handleSetThumbnail}
                disabled={isPending}
                className="group inline-flex items-center gap-1 text-xs text-slate-400 hover:text-yellow-500 transition-colors shrink-0"
              >
                <Star className="h-3.5 w-3.5 group-hover:fill-yellow-400 transition-colors" />
                <span className="hidden group-hover:inline">サムネイルに設定</span>
              </button>
            )}
            {displayAlt && <p className="text-xs text-slate-500 truncate">{displayAlt}</p>}
          </div>

        <div className="flex items-center gap-0.5">
          <input ref={fileInputRef} type="file" accept={ACCEPTED_TYPES.join(",")} onChange={handleFileChange} className="hidden" />

          <Button
            variant="ghost"
            size="icon-sm"
            disabled={isPending}
            title="名前を変更"
            onClick={() => {
              setAltValue(image.alt ?? "");
              setRenameOpen(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5 text-slate-400" />
          </Button>
          <Button variant="ghost" size="icon-sm" disabled={isPending || uploading} title="画像を変更" onClick={handleReplaceClick}>
            <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
          </Button>

          {/* Delete */}
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
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
        <div className="text-xs text-slate-400 space-y-0.5">
          <p>作成: {formatDate(image.createdAt)}</p>
          {isUpdated && <p>更新: {formatDate(image.updatedAt)}</p>}
        </div>
      </div>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>名前を変更</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="alt-input">画像の名前（alt テキスト）</Label>
            <Input
              id="alt-input"
              value={altValue}
              onChange={(e) => setAltValue(e.target.value)}
              placeholder="例: スクリーンショット"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isPending) handleRename();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)} disabled={isPending}>
              キャンセル
            </Button>
            <Button onClick={handleRename} disabled={isPending}>
              {isPending ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
