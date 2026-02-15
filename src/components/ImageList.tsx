import type { ImageItem as ImageItemType } from "../types";
import ImageItem from "./ImageItem";

interface ImageListProps {
  images: ImageItemType[];
  onRemove: (id: string) => void;
  onPreview: (image: ImageItemType) => void;
}

export default function ImageList({
  images,
  onRemove,
  onPreview,
}: ImageListProps) {
  const totalOriginal = images.reduce((sum, img) => sum + img.size, 0);
  const doneImages = images.filter((img) => img.status === "done");
  const totalCompressed = doneImages.reduce(
    (sum, img) => sum + (img.compressed_size ?? img.size),
    0,
  );
  const savedBytes = totalOriginal - totalCompressed;
  const savedPercent =
    doneImages.length > 0 && totalOriginal > 0
      ? Math.round((savedBytes / totalOriginal) * 100)
      : 0;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Summary bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-surface border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-text-secondary">
            {images.length}개 이미지
          </span>
          <span className="text-[11px] text-text-tertiary tabular-nums">
            {formatSize(totalOriginal)}
          </span>
        </div>
        {doneImages.length > 0 && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-success">
                <path d="M12 19V5m0 0l-5 5m5-5l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-semibold text-success tabular-nums">
                {formatSize(savedBytes)} 절약
              </span>
            </div>
            <span className="text-[10px] font-medium text-success bg-success-bg px-1.5 py-0.5 rounded">
              -{savedPercent}%
            </span>
          </div>
        )}
      </div>

      {/* Scrollable image list */}
      <div className="flex-1 overflow-y-auto py-1">
        {images.map((image) => (
          <ImageItem
            key={image.id}
            image={image}
            onRemove={onRemove}
            onPreview={onPreview}
          />
        ))}
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
