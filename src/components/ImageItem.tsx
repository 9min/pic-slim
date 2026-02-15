import type { ImageItem as ImageItemType } from "../types";

interface ImageItemProps {
  image: ImageItemType;
  onRemove: (id: string) => void;
  onPreview: (image: ImageItemType) => void;
}

const formatColors: Record<string, { bg: string; color: string; border: string }> = {
  Jpeg: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  Png: { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  Gif: { bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
};

const defaultColors = { bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB" };

export default function ImageItem({
  image,
  onRemove,
  onPreview,
}: ImageItemProps) {
  const badge = formatColors[image.format] || defaultColors;

  const statusIndicator = () => {
    switch (image.status) {
      case "pending":
        return null;
      case "compressing":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg
              className="animate-spin"
              style={{ width: 16, height: 16, color: "#2563EB" }}
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                opacity="0.2"
              />
              <path
                d="M4 12a8 8 0 018-8"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <span style={{ fontSize: 12, color: "#2563EB", fontWeight: 500 }}>
              압축 중
            </span>
          </div>
        );
      case "done":
        return (
          <div
            className="animate-fade-in"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #22C55E, #16A34A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 3px rgba(22,163,74,0.3)",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {image.ratio !== undefined && (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#16A34A",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {image.ratio}%
              </span>
            )}
          </div>
        );
      case "error":
        return (
          <div
            className="animate-fade-in"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "help",
            }}
            title={image.error}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span
              style={{ fontSize: 12, color: "#DC2626", fontWeight: 500 }}
            >
              실패
            </span>
          </div>
        );
    }
  };

  return (
    <div
      className="image-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 24px",
        borderBottom: "1px solid #F3F4F6",
        transition: "background 0.15s ease",
      }}
    >
      {/* Thumbnail */}
      <button
        onClick={() => onPreview(image)}
        style={{
          width: 52,
          height: 52,
          borderRadius: 10,
          overflow: "hidden",
          flexShrink: 0,
          border: "1px solid #E5E7EB",
          background: "#F9FAFB",
          cursor: "pointer",
          padding: 0,
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        }}
      >
        {image.thumbnail ? (
          <img
            src={image.thumbnail}
            alt={image.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div
            className="animate-shimmer"
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </button>

      {/* File info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#111827",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={image.name}
          >
            {image.name}
          </span>
          <span
            style={{
              padding: "1px 6px",
              fontSize: 9,
              fontWeight: 700,
              textTransform: "uppercase" as const,
              borderRadius: 4,
              border: `1px solid ${badge.border}`,
              background: badge.bg,
              color: badge.color,
              flexShrink: 0,
              lineHeight: "16px",
              letterSpacing: "0.02em",
            }}
          >
            {image.format === "Jpeg" ? "JPG" : image.format.toUpperCase()}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 5,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "#9CA3AF",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {image.size_display}
          </span>
          {image.compressed_size_display && (
            <>
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 12h14m0 0l-4-4m4 4l-4 4"
                  stroke="#D1D5DB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#16A34A",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {image.compressed_size_display}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Status + actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        {statusIndicator()}
        {image.status === "pending" && (
          <button
            onClick={() => onRemove(image.id)}
            className="remove-btn"
            style={{
              padding: 4,
              borderRadius: 6,
              color: "#D1D5DB",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "color 0.15s ease, background 0.15s ease",
            }}
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
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
