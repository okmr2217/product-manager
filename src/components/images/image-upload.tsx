"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUpload } from "@/hooks/use-upload";
import { createImageRecord } from "@/actions/images";
import type { ImageData } from "@/types";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

function detectDeviceType(file: File): Promise<"PC" | "MOBILE" | "OTHER"> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const ratio = img.naturalWidth / img.naturalHeight;
      resolve(ratio > 1 ? "PC" : ratio < 1 ? "MOBILE" : "PC");
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve("PC");
    };
    img.src = objectUrl;
  });
}

interface ImageUploadProps {
  productId: string;
  nextSortOrder: number;
  onClose: () => void;
  onImageAdded: (image: ImageData) => void;
}

export function ImageUpload({ productId, nextSortOrder, onClose, onImageAdded }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload } = useUpload();

  const isUploading = uploadingFiles.length > 0;

  const processFiles = async (files: File[]) => {
    const validFiles = files.filter((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: 非対応の形式です（PNG/JPEG/WebP/GIF のみ）`);
        return false;
      }
      if (file.size > MAX_SIZE_BYTES) {
        toast.error(`${file.name}: ファイルサイズが5MBを超えています`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploadingFiles(validFiles.map((f) => f.name));

    let order = nextSortOrder;
    let successCount = 0;

    for (const file of validFiles) {
      const uploadResult = await upload(file, productId);
      if (!uploadResult) {
        toast.error(`${file.name}: アップロードに失敗しました`);
        continue;
      }

      const deviceType = await detectDeviceType(file);

      const actionResult = await createImageRecord(productId, {
        url: uploadResult.url,
        isThumbnail: false,
        sortOrder: order++,
        deviceType,
      });

      if (!actionResult.success || !actionResult.image) {
        toast.error(actionResult.error ?? "画像の登録に失敗しました");
        continue;
      }

      onImageAdded(actionResult.image);
      successCount++;
    }

    setUploadingFiles([]);

    if (successCount > 0) {
      toast.success(`${successCount}件の画像をアップロードしました`);
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) processFiles(files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) processFiles(files);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragOver ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
          isUploading ? "pointer-events-none opacity-60 cursor-default" : "cursor-pointer"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleFileChange}
          className="hidden"
        />

        <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />

        {isUploading ? (
          <div>
            <p className="text-sm text-slate-600 mb-2">アップロード中...</p>
            <ul className="text-xs text-slate-400 space-y-0.5">
              {uploadingFiles.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-600">ドラッグ&ドロップまたはクリックしてファイルを選択</p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPEG, WebP, GIF（最大5MB）・複数選択可</p>
          </>
        )}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isUploading}>
          <X className="h-3.5 w-3.5 mr-1" />
          閉じる
        </Button>
      </div>
    </div>
  );
}
