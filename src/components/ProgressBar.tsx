import type { ProgressBarProps } from "../types";

export default function ProgressBar({ done, total }: ProgressBarProps) {
  const percent = total > 0 ? Math.min(100, Math.max(0, Math.round((done / total) * 100))) : 0;
  const isIndeterminate = total > 0 && done === 0;
  const isComplete = total > 0 && done === total;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        flex: 1,
      }}
    >
      {/* Spinner - 완료 시 숨김 */}
      {!isComplete && (
        <svg
          className="animate-spin motion-reduce:animate-none"
          style={{ width: 18, height: 18, color: "#2563EB", flexShrink: 0 }}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
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
      )}

      <div
        style={{
          flex: 1,
          height: 6,
          background: "#E5E7EB",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          className={isIndeterminate ? "progress-bar-indeterminate" : (isComplete ? "" : "progress-bar-active")}
          style={{
            height: "100%",
            borderRadius: 999,
            ...(isIndeterminate
              ? {
                  width: "30%",
                  background: "linear-gradient(90deg, #2563EB, #60A5FA)",
                }
              : {
                  width: `${percent}%`,
                  transition: "width 0.5s ease-out",
                  background: "linear-gradient(90deg, #2563EB, #60A5FA)",
                }),
          }}
        />
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#2563EB",
          fontVariantNumeric: "tabular-nums",
          minWidth: 64,
          textAlign: "right" as const,
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        {isIndeterminate ? `${total}개 압축 중…` : `${done}/${total}`}
      </span>
    </div>
  );
}
