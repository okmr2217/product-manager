"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUpload } from "@/hooks/use-upload";
import { createImageRecord } from "@/actions/images";
import type { ImageData } from "@/types";
import type { DeviceType } from "@prisma/client";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

interface ImageUploadProps {
  productId: string;
  nextSortOrder: number;
  deviceType: DeviceType;
  onImageAdded: (image: ImageData) => void;
}

export function ImageUpload({ productId, nextSortOrder, deviceType, onImageAdded }: ImageUploadProps) {
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
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
      className={cn(
        "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
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

      <Upload className="h-5 w-5 text-slate-400 mx-auto mb-1" />

      {isUploading ? (
        <div>
          <p className="text-sm text-slate-600 mb-1">アップロード中...</p>
          <ul className="text-xs text-slate-400 space-y-0.5">
            {uploadingFiles.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-600">ドロップまたはクリックして追加</p>
          <p className="text-xs text-slate-400 mt-0.5">PNG, JPEG, WebP, GIF（最大5MB）・複数可</p>
        </>
      )}
    </div>
  );
}
