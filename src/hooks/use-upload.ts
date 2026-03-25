"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface UploadResult {
  url: string;
  path: string;
}

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File, productId: string): Promise<UploadResult | null> => {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${productId}/${crypto.randomUUID()}.${ext}`;

    setUploading(true);
    setError(null);

    try {
      const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (uploadError) {
        setError(uploadError.message);
        return null;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(path);

      return { url: publicUrl, path };
    } catch (err) {
      setError(err instanceof Error ? err.message : "アップロードに失敗しました");
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  return { uploading, error, upload };
}
