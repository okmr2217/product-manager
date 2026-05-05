"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Pencil,
  Trash2,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  reorderImages,
  setThumbnail,
  updateImageAlt,
  deleteImage,
  replaceImage,
} from "@/actions/images";
import { ImageCard } from "./image-card";
import type { ImageData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  onPreviewClick: () => void;
}

function SortableItem({ image, onPreviewClick }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

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
      className={cn(
        "relative cursor-grab active:cursor-grabbing touch-none",
        isDragging && "z-50 opacity-50",
      )}
    >
      <ImageCard image={image} onPreviewClick={onPreviewClick} />
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

function PreviewModal({
  images,
  index,
  productId,
  onClose,
  onNavigate,
  onDelete,
  onRename,
  onSetThumbnail,
  onReplace,
}: PreviewModalProps) {
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
    date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-4xl p-0 gap-0 overflow-hidden">
          <div className="flex h-full">
            {/* Left: image area */}
            <div className="relative flex-1 bg-slate-900 flex items-center justify-center min-h-[60vh]">
              {images.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/25 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-white" />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/25 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-white" />
                  </button>
                </>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt ?? ""}
                className="max-w-full max-h-[75vh] object-contain p-4"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white/60 bg-black/30 rounded-full px-2.5 py-0.5 pointer-events-none">
                  {index + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Right: info & actions panel */}
            <div className="w-64 shrink-0 flex flex-col border-l bg-background">
              {/* Panel header */}
              <DialogHeader className="px-4 py-3 border-b">
                <DialogTitle className="text-sm font-medium truncate">
                  {image.alt ?? "画像プレビュー"}
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
                {/* Meta */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">情報</p>
                  <div className="flex flex-col gap-1.5">
                    <span
                      className={`self-start inline-flex items-center text-xs font-medium rounded px-1.5 py-0.5 border ${DEVICE_TYPE_COLORS[image.deviceType]}`}
                    >
                      {DEVICE_TYPE_LABELS[image.deviceType]}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(image.createdAt)}</span>
                  </div>
                </div>

                {/* Alt text */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">名前（alt）</p>
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
                  <Button
                    size="sm"
                    onClick={handleRename}
                    disabled={isPending}
                    className="w-full h-8"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    {isPending ? "保存中..." : "保存"}
                  </Button>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">操作</p>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_TYPES.join(",")}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={handleSetThumbnail}
                        className={cn(
                          "w-full h-8 justify-start",
                          image.isThumbnail && "text-yellow-600 border-yellow-300 bg-yellow-50",
                        )}
                      >
                        <Star
                          className={cn(
                            "h-3.5 w-3.5 mr-1.5",
                            image.isThumbnail && "fill-yellow-400 text-yellow-400",
                          )}
                        />
                        {image.isThumbnail ? "サムネイル設定済み" : "サムネイルに設定"}
                      </Button>
                      <p className="text-[10px] text-muted-foreground mt-1">※ この機能は廃止されました</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending || uploading}
                      onClick={handleReplaceClick}
                      className="w-full h-8 justify-start"
                    >
                      <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                      画像を変更
                    </Button>
                  </div>
                </div>
              </div>

              {/* Danger zone */}
              <div className="px-4 py-3 border-t">
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-destructive hover:text-destructive border-destructive/30 justify-start"
                      />
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    削除
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>画像を削除しますか？</AlertDialogTitle>
                      <AlertDialogDescription>
                        この操作は取り消せません。Storageからも削除されます。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isPending ? "削除中..." : "削除する"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
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
  onReplace: (id: string, newUrl: string) => void;
  onReorder: (newImages: ImageData[]) => void;
}

export function ImageGrid({
  images,
  productId,
  onDelete,
  onRename,
  onSetThumbnail,
  onReplace,
  onReorder,
}: ImageGridProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
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
      const result = await reorderImages(
        productId,
        newImages.map((img) => img.id),
      );
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
      <DndContext
        id="image-grid-dnd"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map((img) => img.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {images.map((image, i) => (
              <SortableItem
                key={image.id}
                image={image}
                onPreviewClick={() => setPreviewIndex(i)}
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
          onDelete={(id) => {
            onDelete(id);
          }}
          onRename={onRename}
          onSetThumbnail={onSetThumbnail}
          onReplace={onReplace}
        />
      )}
    </>
  );
}
