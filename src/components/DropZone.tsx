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
    <div className="flex-1 flex items-center justify-center p-8">
      <button
        onClick={handleClick}
        className={`w-full max-w-lg h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 transition-all duration-200 cursor-pointer ${
          isDragOver
            ? "border-accent bg-sky-50 scale-[1.02]"
            : "border-gray-300 hover:border-accent hover:bg-gray-50"
        }`}
      >
        <div
          className={`p-4 rounded-full transition-colors ${isDragOver ? "bg-accent/10" : "bg-gray-100"}`}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            className={`transition-colors ${isDragOver ? "text-accent" : "text-gray-400"}`}
          >
            <path
              d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="17 8 12 3 7 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="12"
              y1="3"
              x2="12"
              y2="15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-gray-600 font-medium">
            이미지를 드래그하거나 클릭하여 선택하세요
          </p>
          <p className="text-gray-400 text-sm mt-1">
            JPG, PNG, GIF 파일 지원
          </p>
        </div>
      </button>
    </div>
  );
}
