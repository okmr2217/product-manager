"use client";

import { useState, useCallback } from "react";

interface UploadResult {
  url: string;
  path: string;
}

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File, productId: string, type?: "icon"): Promise<UploadResult | null> => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", productId);
      if (type) formData.append("type", type);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "アップロードに失敗しました");
        return null;
      }

      return { url: json.url, path: json.path };
    } catch (err) {
      setError(err instanceof Error ? err.message : "アップロードに失敗しました");
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  return { uploading, error, upload };
}
