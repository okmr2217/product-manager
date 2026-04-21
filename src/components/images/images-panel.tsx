"use client";

import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { ImageUpload } from "./image-upload";
import { ImageGrid } from "./image-grid";
import type { ImageData } from "@/types";
import type { DeviceType } from "@prisma/client";

interface ImagesPanelProps {
  images: ImageData[];
  productId: string;
}

export function ImagesPanel({ images: initialImages, productId }: ImagesPanelProps) {
  const [images, setImages] = useState<ImageData[]>(initialImages);

  const pcImages = images.filter((img) => img.deviceType !== "MOBILE");
  const mobileImages = images.filter((img) => img.deviceType === "MOBILE");

  const handleImageAdded = (image: ImageData) => {
    setImages((prev) => [...prev, image]);
  };

  const handleDelete = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleRename = (id: string, newAlt: string | null) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, alt: newAlt } : img)));
  };

  const handleSetThumbnail = (id: string) => {
    setImages((prev) => prev.map((img) => ({ ...img, isThumbnail: img.id === id })));
  };

  const handleDeviceTypeChange = (id: string, newType: DeviceType) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, deviceType: newType } : img)));
  };

  const handleReplace = (id: string, newUrl: string) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, url: newUrl } : img)));
  };

  const handlePCReorder = (reordered: ImageData[]) => {
    setImages((prev) => {
      const mobile = prev.filter((img) => img.deviceType === "MOBILE");
      return [...reordered, ...mobile];
    });
  };

  const handleMobileReorder = (reordered: ImageData[]) => {
    setImages((prev) => {
      const nonMobile = prev.filter((img) => img.deviceType !== "MOBILE");
      return [...nonMobile, ...reordered];
    });
  };

  return (
    <div className="space-y-8">
      {/* PC section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-medium text-slate-700">PC</h3>
          <span className="text-xs text-slate-400">({pcImages.length})</span>
        </div>
        <ImageUpload
          productId={productId}
          nextSortOrder={images.length}
          deviceType="PC"
          onImageAdded={handleImageAdded}
        />
        <ImageGrid
          images={pcImages}
          productId={productId}
          onDelete={handleDelete}
          onRename={handleRename}
          onSetThumbnail={handleSetThumbnail}
          onDeviceTypeChange={handleDeviceTypeChange}
          onReplace={handleReplace}
          onReorder={handlePCReorder}
        />
      </div>

      {/* Mobile section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-medium text-slate-700">モバイル</h3>
          <span className="text-xs text-slate-400">({mobileImages.length})</span>
        </div>
        <ImageUpload
          productId={productId}
          nextSortOrder={images.length}
          deviceType="MOBILE"
          onImageAdded={handleImageAdded}
        />
        <ImageGrid
          images={mobileImages}
          productId={productId}
          onDelete={handleDelete}
          onRename={handleRename}
          onSetThumbnail={handleSetThumbnail}
          onDeviceTypeChange={handleDeviceTypeChange}
          onReplace={handleReplace}
          onReorder={handleMobileReorder}
        />
      </div>
    </div>
  );
}
