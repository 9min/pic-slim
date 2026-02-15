import { useState, useCallback } from "react";
import type {
  ImageItem,
  CompressionSettings,
  CompressionEvent,
  CompressionResult,
} from "../types";
import { compressImages } from "../lib/tauri";

export function useCompression(
  updateImageStatus: (id: string, status: ImageItem["status"]) => void,
  updateImageResult: (id: string, result: CompressionResult) => void,
) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const startCompression = useCallback(
    async (images: ImageItem[], settings: CompressionSettings) => {
      const pendingImages = images.filter((img) => img.status === "pending");
      if (pendingImages.length === 0) return;

      setIsCompressing(true);
      setProgress({ done: 0, total: pendingImages.length });

      let completed = 0;

      const handleEvent = (event: CompressionEvent) => {
        switch (event.event_type) {
          case "start":
            updateImageStatus(event.image_id, "compressing");
            break;
          case "complete":
            if (event.result) {
              updateImageResult(event.image_id, event.result);
            }
            completed++;
            setProgress({ done: completed, total: pendingImages.length });
            break;
          case "error":
            if (event.result) {
              updateImageResult(event.image_id, event.result);
            }
            completed++;
            setProgress({ done: completed, total: pendingImages.length });
            break;
        }
      };

      try {
        await compressImages(
          pendingImages.map((img) => ({
            id: img.id,
            path: img.path,
            name: img.name,
            size: img.size,
            size_display: img.size_display,
            format: img.format,
            thumbnail: img.thumbnail,
          })),
          settings,
          handleEvent,
        );
      } catch {
        /* 압축 오류 시 무시 - 개별 이미지 에러는 이벤트로 처리됨 */
      } finally {
        setIsCompressing(false);
      }
    },
    [updateImageStatus, updateImageResult],
  );

  return { isCompressing, progress, startCompression };
}
