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
    <div className="flex items-center gap-3 px-6 py-4 bg-surface border-t border-border">
      {appState === "compressing" ? (
        <ProgressBar done={progress.done} total={progress.total} />
      ) : appState === "done" ? (
        <>
          <button
            onClick={onOpenFolder}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-text-inverse rounded-lg hover:bg-accent-hover transition-colors duration-200 text-[13px] font-semibold cursor-pointer shadow-sm shadow-accent/20"
            title={outputDir}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
            폴더 열기
          </button>
          <button
            onClick={onClear}
            className="px-4 py-2.5 text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors duration-200 cursor-pointer"
          >
            새로 시작
          </button>
        </>
      ) : (
        <>
          <button
            onClick={onCompress}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-text-inverse rounded-lg hover:bg-accent-hover transition-all duration-200 text-[13px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm shadow-accent/20 active:scale-[0.98]"
            disabled={appState !== "ready"}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            압축 시작
          </button>
          <button
            onClick={handleAddFiles}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-medium text-text-secondary hover:text-text-primary border border-border hover:border-text-tertiary rounded-lg transition-all duration-200 cursor-pointer hover:bg-surface-elevated"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            추가
          </button>
        </>
      )}
    </div>
  );
}
