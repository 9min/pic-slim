import { useState, useEffect, useRef, useCallback } from "react";
import type { ImageItem } from "../types";
import { getImagePreview } from "../lib/tauri";

interface PreviewModalProps {
  image: ImageItem | null;
  onClose: () => void;
}

export default function PreviewModal({ image, onClose }: PreviewModalProps) {
  const [originalPreview, setOriginalPreview] = useState<string>("");
  const [compressedPreview, setCompressedPreview] = useState<string>("");
  const [sliderPos, setSliderPos] = useState(50);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!image) return;
    setLoading(true);
    setOriginalPreview("");
    setCompressedPreview("");
    setSliderPos(50);

    const loadPreviews = async () => {
      try {
        const original = await getImagePreview(image.path);
        setOriginalPreview(original);
        if (image.output_path) {
          const compressed = await getImagePreview(image.output_path);
          setCompressedPreview(compressed);
        }
      } catch {
        /* 프리뷰 로드 실패 시 무시 - UI에서 빈 상태로 표시됨 */
      } finally {
        setLoading(false);
      }
    };
    loadPreviews();
  }, [image]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      setSliderPos((x / rect.width) * 100);
    },
    [isDragging],
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!image) return null;

  const formatBadge: Record<string, { bg: string; color: string; border: string }> = {
    Jpeg: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
    Png: { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
    Gif: { bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
  };
  const badge = formatBadge[image.format] || { bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB" };

  return (
    <div
      className="animate-fade-in"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 24px 48px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.1)",
          maxWidth: 680,
          width: "100%",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid #F3F4F6",
            flexShrink: 0,
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#111827",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {image.name}
              </h3>
              <span
                style={{
                  padding: "1px 6px",
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  borderRadius: 4,
                  border: `1px solid ${badge.border}`,
                  background: badge.bg,
                  color: badge.color,
                  flexShrink: 0,
                  lineHeight: "16px",
                }}
              >
                {image.format === "Jpeg" ? "JPG" : image.format.toUpperCase()}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              <span
                style={{
                  fontSize: 12,
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
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#16A34A",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {image.compressed_size_display}
                  </span>
                  {image.ratio !== undefined && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#16A34A",
                        background: "#F0FDF4",
                        padding: "2px 8px",
                        borderRadius: 6,
                        lineHeight: "16px",
                      }}
                    >
                      {image.ratio}%
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="미리보기 닫기"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#F3F4F6",
              border: "none",
              color: "#6B7280",
              cursor: "pointer",
              flexShrink: 0,
              marginLeft: 16,
              transition: "all 0.15s ease",
            }}
            className="modal-close-btn"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Preview area */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            padding: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 0,
          }}
        >
          {loading ? (
            <div
              style={{
                height: 256,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                color: "#9CA3AF",
              }}
            >
              <svg
                className="animate-spin"
                style={{ width: 24, height: 24 }}
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
              <span style={{ fontSize: 13, fontWeight: 500 }}>
                로딩 중...
              </span>
            </div>
          ) : compressedPreview ? (
            <div style={{ userSelect: "none", width: "100%" }}>
              {/* Before/After comparison */}
              <div
                ref={containerRef}
                role="slider"
                aria-label="원본과 압축 이미지 비교"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(sliderPos)}
                tabIndex={0}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 12,
                  background: "#F3F4F6",
                  cursor: "col-resize",
                }}
                onMouseDown={() => setIsDragging(true)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    setSliderPos((prev) => Math.max(0, prev - 2));
                  } else if (e.key === "ArrowRight") {
                    e.preventDefault();
                    setSliderPos((prev) => Math.min(100, prev + 2));
                  }
                }}
              >
                {/* After (bottom layer - full) */}
                <img
                  src={compressedPreview}
                  alt="압축 후"
                  style={{
                    width: "100%",
                    display: "block",
                    maxHeight: "calc(85vh - 140px)",
                    objectFit: "contain",
                  }}
                  draggable={false}
                />
                {/* Before (top layer - clip-path) */}
                <img
                  src={originalPreview}
                  alt="원본"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                  }}
                  draggable={false}
                />
                {/* Slider line */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: "rgba(255,255,255,0.9)",
                    left: `${sliderPos}%`,
                    transform: "translateX(-1px)",
                    boxShadow: "0 0 8px rgba(0,0,0,0.15)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 32,
                      height: 32,
                      background: "#fff",
                      borderRadius: "50%",
                      boxShadow:
                        "0 2px 8px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6B7280"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M8 4L3 12l5 8M16 4l5 8-5 8" />
                    </svg>
                  </div>
                </div>
                {/* Labels */}
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    padding: "4px 10px",
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(8px)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 6,
                  }}
                >
                  원본
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    padding: "4px 10px",
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(8px)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 6,
                  }}
                >
                  압축
                </div>
              </div>
              {/* Comparison hint */}
              <div
                style={{
                  textAlign: "center",
                  marginTop: 12,
                  fontSize: 11,
                  color: "#9CA3AF",
                }}
              >
                드래그하여 원본과 압축 이미지를 비교하세요
              </div>
            </div>
          ) : originalPreview ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <img
                src={originalPreview}
                alt="원본"
                style={{
                  maxHeight: "calc(85vh - 140px)",
                  maxWidth: "100%",
                  borderRadius: 12,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  objectFit: "contain",
                }}
              />
              <div
                style={{
                  marginTop: 12,
                  padding: "4px 12px",
                  background: "#F3F4F6",
                  borderRadius: 6,
                  fontSize: 11,
                  color: "#9CA3AF",
                  fontWeight: 500,
                }}
              >
                원본 이미지
              </div>
            </div>
          ) : (
            <div
              style={{
                height: 256,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9CA3AF",
                fontSize: 13,
              }}
            >
              프리뷰를 불러올 수 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
