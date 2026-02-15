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

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Summary bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
        <span>
          {images.length}개 이미지 ({formatSize(totalOriginal)})
        </span>
        {doneImages.length > 0 && (
          <span className="text-success font-medium">
            {formatSize(totalOriginal - totalCompressed)} 절약
          </span>
        )}
      </div>

      {/* Scrollable image list */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
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
