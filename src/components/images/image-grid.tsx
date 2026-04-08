"use client";

import { useState, useTransition } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DragEndEvent } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { reorderImages } from "@/actions/images";
import { ImageCard } from "./image-card";

interface ImageType {
  id: string;
  url: string;
  alt: string | null;
  isThumbnail: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SortableItemProps {
  image: ImageType;
  productId: string;
}

function SortableItem({ image, productId }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("relative", isDragging && "z-50 opacity-50")}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 z-10 cursor-grab active:cursor-grabbing p-0.5 rounded bg-black/20 hover:bg-black/30 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3.5 w-3.5 text-white" />
      </div>
      <ImageCard image={image} productId={productId} />
    </div>
  );
}

interface ImageGridProps {
  images: ImageType[];
  productId: string;
}

export function ImageGrid({ images: initialImages, productId }: ImageGridProps) {
  const [images, setImages] = useState(initialImages);
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
    setImages(newImages);

    startTransition(async () => {
      const result = await reorderImages(
        productId,
        newImages.map((img) => img.id)
      );
      if (!result.success) {
        toast.error(result.error ?? "並び替えに失敗しました");
        setImages(prevImages);
      }
    });
  };

  if (images.length === 0) {
    return <p className="text-sm text-slate-400">画像はまだありません</p>;
  }

  return (
    <DndContext id="image-grid-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <SortableItem key={image.id} image={image} productId={productId} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
