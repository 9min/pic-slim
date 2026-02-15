import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (!image) return;

    setLoading(true);
    setOriginalPreview("");
    setCompressedPreview("");

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

  if (!image) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div>
            <h3 className="text-sm font-medium text-gray-700">{image.name}</h3>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
              <span>{image.size_display}</span>
              {image.compressed_size_display && (
                <>
                  <span>&rarr;</span>
                  <span className="text-success font-medium">
                    {image.compressed_size_display}
                  </span>
                  {image.ratio !== undefined && (
                    <span className="text-success">({image.ratio}%)</span>
                  )}
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              width="18"
              height="18"
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
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-hidden p-5">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <svg
                className="animate-spin h-6 w-6 mr-2"
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
              로딩 중...
            </div>
          ) : compressedPreview ? (
            <div className="relative select-none">
              {/* Before/After slider comparison */}
              <div className="relative overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={compressedPreview}
                  alt="압축 후"
                  className="w-full block"
                  draggable={false}
                />
                <div
                  className="absolute top-0 left-0 h-full overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={originalPreview}
                    alt="원본"
                    className="block h-full"
                    style={{ width: `${10000 / sliderPos}%`, maxWidth: "none" }}
                    draggable={false}
                  />
                </div>
                {/* Slider line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6B7280"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M8 3L3 12l5 9M16 3l5 9-5 9" />
                    </svg>
                  </div>
                </div>
                {/* Labels */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded">
                  원본
                </div>
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded">
                  압축
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="w-full mt-3 accent-accent"
              />
            </div>
          ) : originalPreview ? (
            <div className="flex items-center justify-center">
              <img
                src={originalPreview}
                alt="원본"
                className="max-h-96 rounded-lg"
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              프리뷰를 불러올 수 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
