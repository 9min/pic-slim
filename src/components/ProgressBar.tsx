interface ProgressBarProps {
  done: number;
  total: number;
}

export default function ProgressBar({ done, total }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3 flex-1">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 tabular-nums min-w-[60px] text-right">
        {done} / {total}
      </span>
    </div>
  );
}
