"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "./image-upload";
import { ImageGrid } from "./image-grid";

interface Image {
  id: string;
  url: string;
  alt: string | null;
  isThumbnail: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ImagesPanelProps {
  images: Image[];
  productId: string;
}

export function ImagesPanel({ images, productId }: ImagesPanelProps) {
  const [showUpload, setShowUpload] = useState(false);

  const gridKey = images.map((img) => img.id + img.isThumbnail).join(",");

  return (
    <div className="space-y-4">
      {!showUpload && (
        <div>
          <Button size="sm" onClick={() => setShowUpload(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            画像をアップロード
          </Button>
        </div>
      )}

      {showUpload && (
        <ImageUpload
          productId={productId}
          nextSortOrder={images.length}
          onClose={() => setShowUpload(false)}
        />
      )}

      <ImageGrid key={gridKey} images={images} productId={productId} />
    </div>
  );
}
