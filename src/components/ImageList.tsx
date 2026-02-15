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
  const savedBytes = Math.max(0, totalOriginal - totalCompressed);
  const savedPercent =
    doneImages.length > 0 && totalOriginal > 0
      ? Math.max(0, Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100))
      : 0;

  const allDone =
    images.length > 0 &&
    images.every((img) => img.status === "done" || img.status === "error");

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        padding: "16px 20px",
        gap: 16,
      }}
    >
      {/* Card container */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #E5E7EB",
          boxShadow:
            "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* Summary header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 24px",
            borderBottom: "1px solid #F3F4F6",
            background: "#FAFBFC",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}
            >
              {images.length}개 이미지
            </span>
            <span
              style={{
                fontSize: 12,
                color: "#9CA3AF",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatSize(totalOriginal)}
            </span>
          </div>
          {doneImages.length > 0 && savedPercent > 0 && (
            <div
              className="animate-fade-in"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ color: "#16A34A" }}
                >
                  <path
                    d="M12 19V5m0 0l-5 5m5-5l5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#16A34A",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatSize(savedBytes)} 절약
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#16A34A",
                  background: "#F0FDF4",
                  padding: "2px 8px",
                  borderRadius: 6,
                  lineHeight: "18px",
                }}
              >
                -{savedPercent}%
              </span>
            </div>
          )}
        </div>

        {/* Scrollable image list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
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

      {/* Completion summary card */}
      {allDone && doneImages.length > 0 && (
        <div
          className="animate-fade-in"
          style={{
            padding: "20px 24px",
            background: "linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)",
            borderRadius: 16,
            border: "1px solid #BBF7D0",
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #22C55E, #16A34A)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(22,163,74,0.25)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L9 17l-5-5"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div
              style={{ fontSize: 14, fontWeight: 700, color: "#166534" }}
            >
              압축 완료
            </div>
            <div
              style={{ fontSize: 12, color: "#15803D", marginTop: 3 }}
            >
              {images.length}개 이미지에서 총{" "}
              <strong>{formatSize(savedBytes)}</strong> 절약했습니다 (
              {savedPercent}% 감소)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
