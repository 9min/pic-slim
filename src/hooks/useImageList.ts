import { useState, useCallback } from "react";
import type { ImageItem, ImageFileInfo, CompressionResult } from "../types";

export function useImageList() {
  const [images, setImages] = useState<ImageItem[]>([]);

  const addImages = useCallback((newImages: ImageFileInfo[]) => {
    setImages((prev) => {
      const existingPaths = new Set(prev.map((img) => img.path));
      const uniqueNew = newImages
        .filter((img) => !existingPaths.has(img.path))
        .map((img) => ({ ...img, status: "pending" as const }));
      return [...prev, ...uniqueNew];
    });
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const clearImages = useCallback(() => {
    setImages([]);
  }, []);

  const updateImageStatus = useCallback(
    (id: string, status: ImageItem["status"]) => {
      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, status } : img)),
      );
    },
    [],
  );

  const updateImageResult = useCallback(
    (id: string, result: CompressionResult) => {
      setImages((prev) =>
        prev.map((img) => {
          if (img.id !== id) return img;
          if (result.success) {
            const ratio = Math.round(
              ((result.compressed_size - result.original_size) /
                result.original_size) *
                100,
            );
            return {
              ...img,
              status: "done" as const,
              compressed_size: result.compressed_size,
              compressed_size_display: formatSize(result.compressed_size),
              output_path: result.output_path,
              ratio,
            };
          } else {
            return {
              ...img,
              status: "error" as const,
              error: result.error || "알 수 없는 오류",
            };
          }
        }),
      );
    },
    [],
  );

  const resetStatus = useCallback(() => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        status: "pending" as const,
        compressed_size: undefined,
        compressed_size_display: undefined,
        output_path: undefined,
        error: undefined,
        ratio: undefined,
      })),
    );
  }, []);

  return {
    images,
    addImages,
    removeImage,
    clearImages,
    updateImageStatus,
    updateImageResult,
    resetStatus,
  };
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
