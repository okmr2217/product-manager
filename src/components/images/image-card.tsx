"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { setThumbnail, updateImageDeviceType } from "@/actions/images";
import { DEVICE_TYPE_LABELS, DEVICE_TYPE_COLORS, DEVICE_TYPE_ORDER } from "@/constants";
import type { ImageData } from "@/types";
import type { DeviceType } from "@prisma/client";

export type { ImageData } from "@/types";

interface ImageCardProps {
  image: ImageData;
  productId: string;
  onPreviewClick?: () => void;
  onSetThumbnail: () => void;
  onDeviceTypeChange: (newType: DeviceType) => void;
}

export function ImageCard({ image, productId, onPreviewClick, onSetThumbnail, onDeviceTypeChange }: ImageCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleSetThumbnail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (image.isThumbnail) return;
    startTransition(async () => {
      const result = await setThumbnail(image.id, productId);
      if (!result.success) {
        toast.error(result.error ?? "サムネイルの設定に失敗しました");
      } else {
        onSetThumbnail();
      }
    });
  };

  const handleCycleDeviceType = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = DEVICE_TYPE_ORDER.indexOf(image.deviceType);
    const nextType = DEVICE_TYPE_ORDER[(currentIndex + 1) % DEVICE_TYPE_ORDER.length];
    const prevType = image.deviceType;
    onDeviceTypeChange(nextType);
    startTransition(async () => {
      const result = await updateImageDeviceType(image.id, nextType);
      if (!result.success) {
        toast.error(result.error ?? "デバイス種別の変更に失敗しました");
        onDeviceTypeChange(prevType);
      }
    });
  };

  const formatDate = (date: Date) =>
    date.toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" });

  return (
    <div className="group rounded-lg overflow-hidden border bg-card">
      {/* Image */}
      <div
        className="h-48 relative overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer"
        onClick={onPreviewClick}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.url} alt={image.alt ?? ""} className="max-w-full max-h-full object-contain mx-auto" />
      </div>

      {/* Footer */}
      <div className="p-2 space-y-1">
        {/* Row 1: thumbnail badge + name */}
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
              className="group/star inline-flex items-center gap-1 text-xs text-slate-300 hover:text-yellow-500 transition-colors shrink-0"
            >
              <Star className="h-3.5 w-3.5 group-hover/star:fill-yellow-400 transition-colors" />
            </button>
          )}
          {image.alt && <p className="text-xs text-slate-500 truncate">{image.alt}</p>}
        </div>

        {/* Row 2: device type badge + date */}
        <div className="flex items-center justify-between gap-1">
          <button
            onClick={handleCycleDeviceType}
            disabled={isPending}
            title="クリックでデバイス種別を変更"
            className={`inline-flex items-center text-xs font-medium rounded px-1.5 py-0.5 border transition-opacity hover:opacity-70 ${DEVICE_TYPE_COLORS[image.deviceType]}`}
          >
            {DEVICE_TYPE_LABELS[image.deviceType]}
          </button>
          <span className="text-xs text-slate-400">{formatDate(image.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
