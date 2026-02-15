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

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">설정</h2>
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

        <div className="p-5 space-y-6">
          {/* Quality slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              압축 품질
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={60}
                max={95}
                value={quality}
                onChange={(e) => onQualityChange(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-accent"
              />
              <span className="text-sm font-mono text-gray-600 min-w-[32px] text-right">
                {quality}
              </span>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>작은 파일</span>
              <span>높은 품질</span>
            </div>
          </div>

          {/* Output directory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              출력 폴더
            </label>
            <div className="flex gap-2">
              <div
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 truncate"
                title={outputDir}
              >
                {outputDir || "선택되지 않음"}
              </div>
              <button
                onClick={handleSelectFolder}
                className="px-3 py-2 text-sm text-accent hover:bg-sky-50 border border-gray-200 rounded-lg transition-colors"
              >
                변경
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-medium text-gray-500 mb-2">
              지원 포맷
            </h3>
            <div className="space-y-1.5 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>JPEG</span>
                <span className="text-gray-400">mozjpeg (Progressive)</span>
              </div>
              <div className="flex justify-between">
                <span>PNG</span>
                <span className="text-gray-400">imagequant + oxipng</span>
              </div>
              <div className="flex justify-between">
                <span>GIF</span>
                <span className="text-gray-400">gif 최적화</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
