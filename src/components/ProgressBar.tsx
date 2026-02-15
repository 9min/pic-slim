interface ProgressBarProps {
  done: number;
  total: number;
}

export default function ProgressBar({ done, total }: ProgressBarProps) {
  const percent = total > 0 ? Math.min(100, Math.max(0, Math.round((done / total) * 100))) : 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        flex: 1,
      }}
    >
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
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #2563EB, #60A5FA)",
            borderRadius: 999,
            transition: "width 0.5s ease-out",
            width: `${percent}%`,
          }}
        />
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#6B7280",
          fontVariantNumeric: "tabular-nums",
          minWidth: 52,
          textAlign: "right" as const,
        }}
      >
        {done}/{total}
      </span>
    </div>
  );
}
