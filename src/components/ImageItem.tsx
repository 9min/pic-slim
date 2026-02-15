import type { ImageItem as ImageItemType } from "../types";

interface ImageItemProps {
  image: ImageItemType;
  onRemove: (id: string) => void;
  onPreview: (image: ImageItemType) => void;
}

export default function ImageItem({
  image,
  onRemove,
  onPreview,
}: ImageItemProps) {
  const statusBadge = () => {
    switch (image.status) {
      case "pending":
        return (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            대기 중
          </span>
        );
      case "compressing":
        return (
          <span className="text-xs text-accent bg-sky-50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <svg
              className="animate-spin h-3 w-3"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                className="opacity-25"
              />
              <path
                d="M4 12a8 8 0 018-8"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            압축 중
          </span>
        );
      case "done":
        return (
          <span className="text-xs text-success bg-success-light px-2 py-0.5 rounded-full">
            {image.ratio !== undefined ? `${image.ratio}%` : "완료"}
          </span>
        );
      case "error":
        return (
          <span
            className="text-xs text-danger bg-danger-light px-2 py-0.5 rounded-full cursor-help"
            title={image.error}
          >
            오류
          </span>
        );
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group">
      {/* Thumbnail */}
      <button
        onClick={() => onPreview(image)}
        className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-accent/50 transition-all"
      >
        {image.thumbnail ? (
          <img
            src={image.thumbnail}
            alt={image.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            IMG
          </div>
        )}
      </button>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 truncate" title={image.name}>
          {image.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400">{image.size_display}</span>
          {image.compressed_size_display && (
            <>
              <span className="text-xs text-gray-300">&rarr;</span>
              <span className="text-xs text-success font-medium">
                {image.compressed_size_display}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        {statusBadge()}
        {image.status === "pending" && (
          <button
            onClick={() => onRemove(image.id)}
            className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all"
            title="제거"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
