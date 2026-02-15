import { open } from "@tauri-apps/plugin-dialog";

interface DropZoneProps {
  isDragOver: boolean;
  onFiles: (paths: string[]) => void;
}

export default function DropZone({ isDragOver, onFiles }: DropZoneProps) {
  const handleClick = async () => {
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
      onFiles(paths);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <button
        onClick={handleClick}
        className={`w-full max-w-md aspect-[4/3] rounded-2xl flex flex-col items-center justify-center gap-5 transition-all duration-300 cursor-pointer group ${
          isDragOver
            ? "bg-accent-subtle border-2 border-accent scale-[1.01] shadow-[0_0_0_4px_rgba(37,99,235,0.1)]"
            : "bg-surface border-2 border-dashed border-border hover:border-accent/40 hover:bg-accent-subtle/50 hover:shadow-sm"
        }`}
      >
        {/* Upload icon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isDragOver
              ? "bg-accent/10 scale-110"
              : "bg-surface-elevated group-hover:bg-accent/5 group-hover:scale-105"
          }`}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            className={`transition-colors duration-200 ${isDragOver ? "text-accent" : "text-text-tertiary group-hover:text-accent"}`}
          >
            <path
              d="M12 16V4m0 0l-4 4m4-4l4 4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 16.8A3 3 0 0 0 22 14a4.97 4.97 0 0 0-1.46-3.54A5 5 0 0 0 12 8a5 5 0 0 0-8.54 2.46A3 3 0 0 0 4 16.8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="text-center space-y-1.5">
          <p
            className={`text-sm font-semibold transition-colors duration-200 ${isDragOver ? "text-accent" : "text-text-secondary group-hover:text-text-primary"}`}
          >
            {isDragOver
              ? "이미지를 놓아주세요"
              : "이미지를 드래그하거나 클릭하여 선택"}
          </p>
          <p className="text-xs text-text-tertiary">
            JPG, PNG, GIF 파일 지원
          </p>
        </div>

        {/* Format badges */}
        <div className="flex items-center gap-2">
          {["JPG", "PNG", "GIF"].map((fmt) => (
            <span
              key={fmt}
              className="px-2.5 py-1 text-[10px] font-medium text-text-tertiary bg-surface-elevated rounded-md border border-border-subtle"
            >
              {fmt}
            </span>
          ))}
        </div>
      </button>
    </div>
  );
}
