"use client";

import { useState } from "react";
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

  const handleReorder = (newImages: ImageData[]) => {
    setImages(newImages);
  };

  return (
    <div className="space-y-4">
      <ImageUpload
        productId={productId}
        nextSortOrder={images.length}
        onImageAdded={handleImageAdded}
      />

      <ImageGrid
        images={images}
        productId={productId}
        onDelete={handleDelete}
        onRename={handleRename}
        onSetThumbnail={handleSetThumbnail}
        onDeviceTypeChange={handleDeviceTypeChange}
        onReplace={handleReplace}
        onReorder={handleReorder}
      />
    </div>
  );
}
