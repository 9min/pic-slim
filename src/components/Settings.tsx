import { open } from "@tauri-apps/plugin-dialog";
import { version } from "../../package.json";

const ENGINES = [
  { fmt: "JPG", engine: "mozjpeg", desc: "프로그레시브 인코딩", color: "#F59E0B" },
  { fmt: "PNG", engine: "imagequant + oxipng", desc: "양자화 + 무손실", color: "#3B82F6" },
  { fmt: "GIF", engine: "gif", desc: "프레임 최적화", color: "#8B5CF6" },
] as const;

interface SettingsProps {
  isOpen: boolean;
  quality: number;
  outputDir: string;
  onClose: () => void;
  onQualityChange: (quality: number) => void;
  onOutputDirChange: (dir: string) => void;
}

export default function Settings({
  isOpen,
  quality,
  outputDir,
  onClose,
  onQualityChange,
  onOutputDirChange,
}: SettingsProps) {
  const handleSelectFolder = async () => {
    const selected = await open({
      directory: true,
      title: "출력 폴더 선택",
    });
    if (selected && typeof selected === "string") {
      onOutputDirChange(selected);
    }
  };

  const qualityLabel =
    quality >= 90 ? "최고 품질" : quality >= 80 ? "권장" : "작은 파일";

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }}
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50"
        aria-hidden={!isOpen}
        style={{
          width: 380,
          background: "#fff",
          boxShadow: "-8px 0 30px rgba(0,0,0,0.08)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          visibility: isOpen ? "visible" : "hidden",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{ padding: "24px 32px", borderBottom: "1px solid #E5E7EB" }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
            설정
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="설정 닫기"
            className="rounded-lg cursor-pointer"
            style={{ padding: 6, color: "#9CA3AF" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "28px 32px" }}>
          {/* Quality slider */}
          <div style={{ marginBottom: 32 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <label htmlFor="quality-slider" style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                압축 품질
              </label>
              <div className="flex items-center" style={{ gap: 8 }}>
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                  {qualityLabel}
                </span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#2563EB" }}>
                  {quality}
                </span>
              </div>
            </div>
            <input
              id="quality-slider"
              type="range"
              min={60}
              max={95}
              value={quality}
              onChange={(e) => onQualityChange(Number(e.target.value))}
              className="w-full cursor-pointer"
              style={{ height: 6, accentColor: "#2563EB" }}
            />
            <div className="flex justify-between" style={{ marginTop: 10, fontSize: 10, color: "#9CA3AF" }}>
              <span>60 - 작은 파일</span>
              <span>95 - 최고 품질</span>
            </div>
          </div>

          {/* Output directory */}
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 14 }}>
              출력 폴더
            </label>
            <div className="flex" style={{ gap: 10 }}>
              <div
                className="flex-1 truncate"
                style={{
                  padding: "10px 14px",
                  background: "#FAFAFA",
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#4B5563",
                }}
                title={outputDir}
              >
                {outputDir || "선택되지 않음"}
              </div>
              <button
                type="button"
                onClick={handleSelectFolder}
                className="cursor-pointer"
                style={{
                  padding: "10px 16px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#2563EB",
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  background: "transparent",
                }}
              >
                변경
              </button>
            </div>
          </div>

          <div style={{ height: 1, background: "#F3F4F6", marginBottom: 28 }} />

          {/* Engine info */}
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
              압축 엔진
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {ENGINES.map(({ fmt, engine, desc, color }) => (
                <div key={fmt} className="flex items-center" style={{ gap: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#111827", width: 36 }}>{fmt}</span>
                  <span style={{ fontSize: 11, color: "#9CA3AF", flex: 1 }}>{engine}</span>
                  <span style={{ fontSize: 10, color: "#9CA3AF" }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="absolute bottom-0 left-0 right-0 text-center"
          style={{ padding: "16px 32px", borderTop: "1px solid #F3F4F6", fontSize: 10, color: "#9CA3AF" }}
        >
          PicSlim 버전 {version}
          <div style={{ marginTop: 4 }}>© 2026 9min. All Rights Reserved.</div>
        </div>
      </div>
    </>
  );
}
