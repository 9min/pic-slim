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
      } catch (err) {
        console.error("프리뷰 로드 실패:", err);
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

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="min-w-0">
            <h3 className="text-[13px] font-semibold text-text-primary truncate">
              {image.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
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
                  {image.ratio !== undefined && (
                    <span className="text-[10px] font-medium text-success bg-success-bg px-1.5 py-0.5 rounded">
                      {image.ratio}%
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-elevated text-text-tertiary hover:text-text-secondary transition-colors duration-200 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-hidden p-5">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-text-tertiary">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span className="text-xs">로딩 중...</span>
            </div>
          ) : compressedPreview ? (
            <div className="select-none">
              {/* Before/After comparison */}
              <div
                ref={containerRef}
                className="relative overflow-hidden rounded-xl bg-surface-elevated cursor-col-resize"
                onMouseDown={() => setIsDragging(true)}
              >
                {/* After (full) */}
                <img
                  src={compressedPreview}
                  alt="압축 후"
                  className="w-full block"
                  draggable={false}
                />
                {/* Before (clipped) */}
                <div
                  className="absolute top-0 left-0 h-full overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={originalPreview}
                    alt="원본"
                    className="block h-full"
                    style={{
                      width: `${10000 / sliderPos}%`,
                      maxWidth: "none",
                    }}
                    draggable={false}
                  />
                </div>
                {/* Slider line */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-white/80"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-surface rounded-full shadow-lg border border-border flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M8 4L3 12l5 8M16 4l5 8-5 8" />
                    </svg>
                  </div>
                </div>
                {/* Labels */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium rounded-md">
                  원본
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium rounded-md">
                  압축
                </div>
              </div>
            </div>
          ) : originalPreview ? (
            <div className="flex items-center justify-center">
              <img
                src={originalPreview}
                alt="원본"
                className="max-h-96 rounded-xl"
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-text-tertiary text-xs">
              프리뷰를 불러올 수 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
