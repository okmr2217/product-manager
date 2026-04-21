"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DragEndEvent } from "@dnd-kit/core";
import { ChevronLeft, ChevronRight, Star, Pencil, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { reorderImages, setThumbnail, updateImageAlt, deleteImage, replaceImage } from "@/actions/images";
import { ImageCard } from "./image-card";
import type { ImageData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { DEVICE_TYPE_LABELS, DEVICE_TYPE_COLORS } from "@/constants";
import { useUpload } from "@/hooks/use-upload";
import type { DeviceType } from "@prisma/client";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

interface SortableItemProps {
  image: ImageData;
  productId: string;
  onPreviewClick: () => void;
  onSetThumbnail: () => void;
  onDeviceTypeChange: (newType: DeviceType) => void;
}

function SortableItem({ image, productId, onPreviewClick, onSetThumbnail, onDeviceTypeChange }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn("relative cursor-grab active:cursor-grabbing touch-none", isDragging && "z-50 opacity-50")}
    >
      <ImageCard
        image={image}
        productId={productId}
        onPreviewClick={onPreviewClick}
        onSetThumbnail={onSetThumbnail}
        onDeviceTypeChange={onDeviceTypeChange}
      />
    </div>
  );
}

interface PreviewModalProps {
  images: ImageData[];
  index: number;
  productId: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newAlt: string | null) => void;
  onSetThumbnail: (id: string) => void;
  onReplace: (id: string, newUrl: string) => void;
}

function PreviewModal({ images, index, productId, onClose, onNavigate, onDelete, onRename, onSetThumbnail, onReplace }: PreviewModalProps) {
  const image = images[index];
  const [renameOpen, setRenameOpen] = useState(false);
  const [altValue, setAltValue] = useState(image.alt ?? "");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useUpload();

  const goPrev = () => onNavigate(index > 0 ? index - 1 : images.length - 1);
  const goNext = () => onNavigate(index < images.length - 1 ? index + 1 : 0);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (renameOpen) return;
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  useEffect(() => {
    setAltValue(image.alt ?? "");
  }, [image.id, image.alt]);

  const handleSetThumbnail = () => {
    if (image.isThumbnail) return;
    startTransition(async () => {
      const result = await setThumbnail(image.id, productId);
      if (!result.success) {
        toast.error(result.error ?? "サムネイルの設定に失敗しました");
      } else {
        onSetThumbnail(image.id);
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
        onRename(image.id, altValue.trim() || null);
        setRenameOpen(false);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteImage(image.id);
      if (!result.success) {
        toast.error(result.error ?? "削除に失敗しました");
      } else {
        onDelete(image.id);
        onClose();
      }
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
        onReplace(image.id, uploadResult.url);
      }
    });
  };

  const formatDate = (date: Date) =>
    date.toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" });

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
          {/* Header */}
          <DialogHeader className="px-4 py-3 border-b flex-row items-center justify-between">
            <DialogTitle className="text-sm font-medium truncate max-w-xs">
              {image.alt ?? "画像プレビュー"}
            </DialogTitle>
            {images.length > 1 && (
              <span className="text-xs text-slate-400 shrink-0 ml-2">
                {index + 1} / {images.length}
              </span>
            )}
          </DialogHeader>

          {/* Image area */}
          <div className="relative bg-slate-100 flex items-center justify-center" style={{ minHeight: "50vh", maxHeight: "70vh" }}>
            {images.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-2 z-10 p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-2 z-10 p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>
              </>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.alt ?? ""}
              className="max-w-full object-contain"
              style={{ maxHeight: "70vh" }}
            />
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t space-y-3">
            {/* Meta + thumbnail row */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`inline-flex items-center text-xs font-medium rounded px-1.5 py-0.5 border ${DEVICE_TYPE_COLORS[image.deviceType]}`}>
                {DEVICE_TYPE_LABELS[image.deviceType]}
              </span>
              <span className="text-xs text-slate-400">{formatDate(image.createdAt)}</span>

              <div className="ml-auto flex items-center gap-1">
                <input ref={fileInputRef} type="file" accept={ACCEPTED_TYPES.join(",")} onChange={handleFileChange} className="hidden" />

                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={handleSetThumbnail}
                  className={image.isThumbnail ? "text-yellow-600 border-yellow-300 bg-yellow-50" : ""}
                >
                  <Star className={cn("h-3.5 w-3.5 mr-1", image.isThumbnail && "fill-yellow-400 text-yellow-400")} />
                  {image.isThumbnail ? "サムネイル" : "サムネイルに設定"}
                </Button>

                <Button variant="outline" size="sm" disabled={isPending || uploading} onClick={handleReplaceClick}>
                  <ImageIcon className="h-3.5 w-3.5 mr-1" />
                  変更
                </Button>
              </div>
            </div>

            {/* Rename row */}
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="preview-alt-input" className="text-xs text-slate-500">
                  名前（alt テキスト）
                </Label>
                <Input
                  id="preview-alt-input"
                  value={altValue}
                  onChange={(e) => setAltValue(e.target.value)}
                  placeholder="例: スクリーンショット"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isPending) handleRename();
                  }}
                  className="h-8 text-sm"
                />
              </div>
              <Button size="sm" onClick={handleRename} disabled={isPending} className="h-8">
                <Pencil className="h-3.5 w-3.5 mr-1" />
                {isPending ? "保存中..." : "保存"}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="outline" size="sm" className="h-8 text-destructive hover:text-destructive border-destructive/30" />}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  削除
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
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ImageGridProps {
  images: ImageData[];
  productId: string;
  onDelete: (id: string) => void;
  onRename: (id: string, newAlt: string | null) => void;
  onSetThumbnail: (id: string) => void;
  onDeviceTypeChange: (id: string, newType: DeviceType) => void;
  onReplace: (id: string, newUrl: string) => void;
  onReorder: (newImages: ImageData[]) => void;
}

export function ImageGrid({ images, productId, onDelete, onRename, onSetThumbnail, onDeviceTypeChange, onReplace, onReorder }: ImageGridProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);
    const prevImages = images;
    const newImages = arrayMove(images, oldIndex, newIndex);
    onReorder(newImages);

    startTransition(async () => {
      const result = await reorderImages(productId, newImages.map((img) => img.id));
      if (!result.success) {
        toast.error(result.error ?? "並び替えに失敗しました");
        onReorder(prevImages);
      }
    });
  };

  if (images.length === 0) {
    return <p className="text-sm text-slate-400">画像はまだありません</p>;
  }

  return (
    <>
      <DndContext id="image-grid-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image, i) => (
              <SortableItem
                key={image.id}
                image={image}
                productId={productId}
                onPreviewClick={() => setPreviewIndex(i)}
                onSetThumbnail={() => onSetThumbnail(image.id)}
                onDeviceTypeChange={(newType) => onDeviceTypeChange(image.id, newType)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {previewIndex !== null && (
        <PreviewModal
          images={images}
          index={previewIndex}
          productId={productId}
          onClose={() => setPreviewIndex(null)}
          onNavigate={setPreviewIndex}
          onDelete={(id) => { onDelete(id); }}
          onRename={onRename}
          onSetThumbnail={onSetThumbnail}
          onReplace={onReplace}
        />
      )}
    </>
  );
}
