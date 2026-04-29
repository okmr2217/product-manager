"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { GripVertical } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ProductWithLatestRelease } from "@/app/(app)/products/page";
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_COLORS } from "@/constants";
import { reorderProducts } from "@/actions/products";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function SortableRow({ product }: { product: ProductWithLatestRelease }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id });
  const { iconUrl, themeColor, name, status } = product;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function renderIcon() {
    if (iconUrl) {
      return (
        <div className="size-7 rounded-lg overflow-hidden shrink-0">
          <Image src={iconUrl} alt="" width={28} height={28} className="w-full h-full object-cover" unoptimized />
        </div>
      );
    }
    const bg = themeColor ? `${themeColor}26` : "#6366F126";
    return (
      <div
        className="size-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-semibold"
        style={{ backgroundColor: bg, color: themeColor ?? "#6366F1" }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border/40 last:border-b-0"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
        aria-label="ドラッグして並び替え"
      >
        <GripVertical className="size-4" />
      </button>
      {renderIcon()}
      <span className="flex-1 text-sm font-medium">{name}</span>
      <span className={cn("text-[10px] px-2 py-0.5 rounded-full", PRODUCT_STATUS_COLORS[status])}>
        {PRODUCT_STATUS_LABELS[status]}
      </span>
    </div>
  );
}

export function ProductSortable({
  products,
  onDone,
}: {
  products: ProductWithLatestRelease[];
  onDone: () => void;
}) {
  const [items, setItems] = useState(products);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      setItems((prev) => {
        const oldIndex = prev.findIndex((p) => p.id === active.id);
        const newIndex = prev.findIndex((p) => p.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    },
    []
  );

  async function handleSave() {
    setSaving(true);
    const result = await reorderProducts(items.map((p) => p.id));
    setSaving(false);
    if (!result.success) {
      toast.error(result.error ?? "並び替えに失敗しました");
      return;
    }
    toast.success("並び順を保存しました");
    onDone();
  }

  return (
    <div>
      <div className="border border-border/40 rounded-xl overflow-hidden mb-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            {items.map((product) => (
              <SortableRow key={product.id} product={product} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onDone}
          disabled={saving}
          className="px-4 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
        >
          キャンセル
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-1.5 text-sm rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>
    </div>
  );
}
