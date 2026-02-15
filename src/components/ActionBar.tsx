import { open } from "@tauri-apps/plugin-dialog";
import type { AppState } from "../types";
import ProgressBar from "./ProgressBar";

interface ActionBarProps {
  appState: AppState;
  progress: { done: number; total: number };
  outputDir: string;
  onCompress: () => void;
  onAddFiles: (paths: string[]) => void;
  onOpenFolder: () => void;
  onClear: () => void;
}

export default function ActionBar({
  appState,
  progress,
  outputDir,
  onCompress,
  onAddFiles,
  onOpenFolder,
  onClear,
}: ActionBarProps) {
  const handleAddFiles = async () => {
    const selected = await open({
      multiple: true,
      filters: [
        {
          name: "이미지",
          extensions: ["jpg", "jpeg", "png", "gif"],
        },
      ],
    });
    if (selected) {
      const paths = Array.isArray(selected) ? selected : [selected];
      onAddFiles(paths);
    }
  };

  return (
    <div className="flex items-center gap-3 px-5 py-3 border-t border-gray-200 bg-white">
      {appState === "compressing" ? (
        <ProgressBar done={progress.done} total={progress.total} />
      ) : (
        <>
          {appState === "done" ? (
            <>
              <button
                onClick={onOpenFolder}
                className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors text-sm font-medium"
                title={outputDir}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                폴더 열기
              </button>
              <button
                onClick={onClear}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                새로 시작
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onCompress}
                className="flex items-center gap-1.5 px-5 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={appState !== "ready"}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="16 16 12 12 8 16" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                </svg>
                압축 시작
              </button>
              <button
                onClick={handleAddFiles}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                추가
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
