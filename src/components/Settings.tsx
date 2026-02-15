import { open } from "@tauri-apps/plugin-dialog";

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
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity duration-200"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[360px] bg-surface shadow-2xl z-50 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-border">
          <h2 className="text-sm font-bold text-text-primary">설정</h2>
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

        <div className="px-7 py-6 space-y-7">
          {/* Quality slider */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-[13px] font-semibold text-text-primary">
                압축 품질
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-text-tertiary">
                  {qualityLabel}
                </span>
                <span className="text-sm font-bold text-accent tabular-nums">
                  {quality}
                </span>
              </div>
            </div>
            <input
              type="range"
              min={60}
              max={95}
              value={quality}
              onChange={(e) => onQualityChange(Number(e.target.value))}
              className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between mt-2 text-[10px] text-text-tertiary">
              <span>60 - 작은 파일</span>
              <span>95 - 최고 품질</span>
            </div>
          </div>

          {/* Output directory */}
          <div>
            <label className="block text-[13px] font-semibold text-text-primary mb-4">
              출력 폴더
            </label>
            <div className="flex gap-2">
              <div
                className="flex-1 px-3 py-2.5 bg-surface-elevated border border-border rounded-lg text-[12px] text-text-secondary truncate"
                title={outputDir}
              >
                {outputDir || "선택되지 않음"}
              </div>
              <button
                onClick={handleSelectFolder}
                className="px-3 py-2.5 text-[12px] font-medium text-accent hover:bg-accent-subtle border border-border hover:border-accent/30 rounded-lg transition-all duration-200 cursor-pointer"
              >
                변경
              </button>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Engine info */}
          <div>
            <h3 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-4">
              압축 엔진
            </h3>
            <div className="space-y-3">
              {[
                { fmt: "JPEG", engine: "mozjpeg", desc: "Progressive 인코딩", color: "bg-amber-500" },
                { fmt: "PNG", engine: "imagequant + oxipng", desc: "양자화 + 무손실", color: "bg-blue-500" },
                { fmt: "GIF", engine: "gif", desc: "프레임 최적화", color: "bg-purple-500" },
              ].map(({ fmt, engine, desc, color }) => (
                <div key={fmt} className="flex items-center gap-3 py-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
                  <span className="text-[12px] font-medium text-text-primary w-10">{fmt}</span>
                  <span className="text-[11px] text-text-tertiary flex-1">{engine}</span>
                  <span className="text-[10px] text-text-tertiary">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-7 py-4 border-t border-border">
          <p className="text-[10px] text-text-tertiary text-center">
            PicSlim v0.1.0
          </p>
        </div>
      </div>
    </>
  );
}
