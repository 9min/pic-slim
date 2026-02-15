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
  const formatBadge = () => {
    const colors: Record<string, string> = {
      Jpeg: "bg-amber-50 text-amber-600 border-amber-200",
      Png: "bg-blue-50 text-blue-600 border-blue-200",
      Gif: "bg-purple-50 text-purple-600 border-purple-200",
    };
    return colors[image.format] || "bg-gray-50 text-gray-600 border-gray-200";
  };

  const statusIndicator = () => {
    switch (image.status) {
      case "pending":
        return null;
      case "compressing":
        return (
          <div className="flex items-center gap-1.5">
            <div className="relative w-4 h-4">
              <svg className="animate-spin w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-xs text-accent font-medium">압축 중</span>
          </div>
        );
      case "done":
        return (
          <div className="flex items-center gap-1.5 animate-fade-in">
            <div className="w-4 h-4 rounded-full bg-success flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {image.ratio !== undefined && (
              <span className="text-xs font-semibold text-success tabular-nums">
                {image.ratio}%
              </span>
            )}
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-1.5 animate-fade-in cursor-help" title={image.error}>
            <div className="w-4 h-4 rounded-full bg-danger flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-xs text-danger font-medium">실패</span>
          </div>
        );
    }
  };

  return (
    <div
      className="flex items-center transition-colors duration-150 group animate-fade-in"
      style={{ gap: 16, padding: "12px 24px" }}
    >
      {/* Thumbnail */}
      <button
        onClick={() => onPreview(image)}
        className="w-11 h-11 rounded-lg overflow-hidden bg-surface-elevated flex-shrink-0 cursor-pointer ring-1 ring-border hover:ring-accent/40 transition-all duration-200"
      >
        {image.thumbnail ? (
          <img
            src={image.thumbnail}
            alt={image.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-6 h-4 rounded-sm animate-shimmer" />
          </div>
        )}
      </button>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium text-text-primary truncate" title={image.name}>
            {image.name}
          </p>
          <span className={`px-1.5 py-px text-[9px] font-semibold uppercase rounded border flex-shrink-0 ${formatBadge()}`}>
            {image.format === "Jpeg" ? "JPG" : image.format.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[11px] text-text-tertiary tabular-nums">
            {image.size_display}
          </span>
          {image.compressed_size_display && (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-text-tertiary">
                <path d="M5 12h14m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[11px] font-semibold text-success tabular-nums">
                {image.compressed_size_display}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Status + actions */}
      <div className="flex items-center gap-2">
        {statusIndicator()}
        {image.status === "pending" && (
          <button
            onClick={() => onRemove(image.id)}
            className="p-1 rounded-md text-text-tertiary hover:text-danger hover:bg-danger-bg opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
            title="제거"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
