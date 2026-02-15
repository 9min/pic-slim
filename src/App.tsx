import { useState, useCallback } from "react";
import type { ImageItem, AppState } from "./types";
import { loadImages, openOutputFolder } from "./lib/tauri";
import { useSettings } from "./hooks/useSettings";
import { useImageList } from "./hooks/useImageList";
import { useCompression } from "./hooks/useCompression";
import { useDragDrop } from "./hooks/useDragDrop";
import Header from "./components/Header";
import DropZone from "./components/DropZone";
import ImageList from "./components/ImageList";
import ActionBar from "./components/ActionBar";
import Settings from "./components/Settings";
import PreviewModal from "./components/PreviewModal";

function App() {
  const { settings, updateQuality, updateOutputDir } = useSettings();
  const {
    images,
    addImages,
    removeImage,
    clearImages,
    updateImageStatus,
    updateImageResult,
  } = useImageList();
  const { isCompressing, progress, startCompression } = useCompression(
    updateImageStatus,
    updateImageResult,
  );

  const [isDragOver, setIsDragOver] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<ImageItem | null>(null);

  const handleFiles = useCallback(
    async (paths: string[]) => {
      try {
        const loaded = await loadImages(paths);
        addImages(loaded);
      } catch (err) {
        console.error("이미지 로드 실패:", err);
      }
    },
    [addImages],
  );

  const handleDragOver = useCallback((active: boolean) => {
    setIsDragOver(active);
  }, []);

  useDragDrop(handleFiles, handleDragOver);

  const handleCompress = useCallback(async () => {
    await startCompression(images, settings);
  }, [images, settings, startCompression]);

  const handleOpenFolder = useCallback(async () => {
    try {
      await openOutputFolder(settings.output_dir);
    } catch (err) {
      console.error("폴더 열기 실패:", err);
    }
  }, [settings.output_dir]);

  const handleClear = useCallback(() => {
    clearImages();
  }, [clearImages]);

  // Determine app state
  let appState: AppState = "empty";
  if (isCompressing) {
    appState = "compressing";
  } else if (
    images.length > 0 &&
    images.every((img) => img.status === "done" || img.status === "error")
  ) {
    appState = "done";
  } else if (images.length > 0) {
    appState = "ready";
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: "#F9FAFB" }}>
      <Header onSettingsClick={() => setSettingsOpen(true)} />

      {images.length === 0 ? (
        <DropZone isDragOver={isDragOver} onFiles={handleFiles} />
      ) : (
        <ImageList
          images={images}
          onRemove={removeImage}
          onPreview={setPreviewImage}
        />
      )}

      {images.length > 0 && (
        <ActionBar
          appState={appState}
          progress={progress}
          outputDir={settings.output_dir}
          onCompress={handleCompress}
          onAddFiles={handleFiles}
          onOpenFolder={handleOpenFolder}
          onClear={handleClear}
        />
      )}

      <Settings
        isOpen={settingsOpen}
        quality={settings.quality}
        outputDir={settings.output_dir}
        onClose={() => setSettingsOpen(false)}
        onQualityChange={updateQuality}
        onOutputDirChange={updateOutputDir}
      />

      <PreviewModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />

      {/* Drag overlay for when images are already loaded */}
      {isDragOver && images.length > 0 && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(37,99,235,0.04)",
            backdropFilter: "blur(1px)",
            border: "2px dashed #2563EB",
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            className="animate-fade-in"
            style={{
              background: "#fff",
              padding: "16px 28px",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              border: "1px solid rgba(37,99,235,0.15)",
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 600, color: "#2563EB" }}>
              이미지를 놓아서 추가하세요
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
