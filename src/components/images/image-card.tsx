"use client";

import { cn } from "@/lib/utils";
import type { ImageData } from "@/types";

export type { ImageData } from "@/types";

interface ImageCardProps {
  image: ImageData;
  onPreviewClick?: () => void;
}

export function ImageCard({ image, onPreviewClick }: ImageCardProps) {
  const formatDate = (date: Date) =>
    date.toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" });

  const isMobile = image.deviceType === "MOBILE";
  const aspectRatio = isMobile ? "390 / 844" : "1280 / 800";

  return (
    <div className="group rounded-lg overflow-hidden border bg-card">
      <div
        className="bg-slate-100 cursor-pointer flex items-center justify-center"
        onClick={onPreviewClick}
      >
        <div
          className={cn("relative overflow-hidden", isMobile ? "w-[45%]" : "w-full")}
          style={{ aspectRatio }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt={image.alt ?? ""} className="w-full h-full object-contain" />
        </div>
      </div>

      <div className="px-2 py-1.5 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500 truncate">{image.alt ?? ""}</p>
        <span className="text-xs text-slate-400 shrink-0">{formatDate(image.createdAt)}</span>
      </div>
    </div>
  );
}
