import { useEffect, useCallback } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif"];

function isImageFile(path: string): boolean {
  const lower = path.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function useDragDrop(
  onFiles: (paths: string[]) => void,
  onDragOver: (active: boolean) => void,
) {
  const handleDrop = useCallback(
    (paths: string[]) => {
      const imagePaths = paths.filter(isImageFile);
      if (imagePaths.length > 0) {
        onFiles(imagePaths);
      }
    },
    [onFiles],
  );

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    getCurrentWebview()
      .onDragDropEvent((event) => {
        if (event.payload.type === "over") {
          onDragOver(true);
        } else if (event.payload.type === "drop") {
          onDragOver(false);
          handleDrop(event.payload.paths);
        } else {
          // "cancel"
          onDragOver(false);
        }
      })
      .then((fn) => {
        unlisten = fn;
      });

    return () => {
      unlisten?.();
    };
  }, [handleDrop, onDragOver]);
}
