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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: appState === "compressing" ? "stretch" : "center",
        gap: 12,
        padding: "16px 24px",
        background: "#fff",
        borderTop: "1px solid #E5E7EB",
      }}
    >
      {appState === "compressing" ? (
        <ProgressBar done={progress.done} total={progress.total} />
      ) : appState === "done" ? (
        <>
          <button
            onClick={onOpenFolder}
            className="action-btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
              color: "#fff",
              borderRadius: 10,
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(37,99,235,0.25), 0 1px 2px rgba(0,0,0,0.05)",
              transition: "all 0.2s ease",
            }}
            title={outputDir}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
            폴더 열기
          </button>
          <button
            onClick={onClear}
            style={{
              padding: "10px 20px",
              fontSize: 13,
              fontWeight: 500,
              color: "#6B7280",
              background: "transparent",
              border: "1px solid #E5E7EB",
              borderRadius: 10,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            className="action-btn-secondary"
          >
            새로 시작
          </button>
        </>
      ) : (
        <>
          <button
            onClick={onCompress}
            className="action-btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 24px",
              background:
                appState === "ready"
                  ? "linear-gradient(135deg, #2563EB, #1D4ED8)"
                  : "#E5E7EB",
              color: appState === "ready" ? "#fff" : "#9CA3AF",
              borderRadius: 10,
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              cursor: appState === "ready" ? "pointer" : "not-allowed",
              boxShadow:
                appState === "ready"
                  ? "0 2px 8px rgba(37,99,235,0.25), 0 1px 2px rgba(0,0,0,0.05)"
                  : "none",
              opacity: appState === "ready" ? 1 : 0.5,
              transition: "all 0.2s ease",
            }}
            disabled={appState !== "ready"}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            압축 시작
          </button>
          <button
            onClick={handleAddFiles}
            className="action-btn-secondary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 500,
              color: "#6B7280",
              border: "1px solid #E5E7EB",
              borderRadius: 10,
              background: "transparent",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
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
