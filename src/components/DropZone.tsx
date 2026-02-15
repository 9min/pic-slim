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
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <button
        type="button"
        onClick={handleClick}
        style={{
          width: "100%",
          maxWidth: 420,
          aspectRatio: "4/3",
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          cursor: "pointer",
          transition: "all 0.3s ease",
          background: isDragOver ? "#EFF6FF" : "#fff",
          border: isDragOver
            ? "2px solid #2563EB"
            : "2px dashed #D1D5DB",
          boxShadow: isDragOver
            ? "0 0 0 4px rgba(37,99,235,0.1), 0 4px 12px rgba(0,0,0,0.05)"
            : "0 1px 3px rgba(0,0,0,0.02)",
          transform: isDragOver ? "scale(1.01)" : "scale(1)",
        }}
      >
        {/* Upload icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isDragOver ? "rgba(37,99,235,0.08)" : "#F9FAFB",
            transition: "all 0.3s ease",
            transform: isDragOver ? "scale(1.1)" : "scale(1)",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            style={{
              color: isDragOver ? "#2563EB" : "#9CA3AF",
              transition: "color 0.2s ease",
            }}
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

        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: isDragOver ? "#2563EB" : "#4B5563",
              transition: "color 0.2s ease",
            }}
          >
            {isDragOver
              ? "이미지를 놓아주세요"
              : "이미지를 드래그하거나 클릭하여 선택"}
          </p>
          <p
            style={{
              fontSize: 12,
              color: "#9CA3AF",
              marginTop: 6,
            }}
          >
            JPG, PNG, GIF 파일 지원
          </p>
        </div>

        {/* Format badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {["JPG", "PNG", "GIF"].map((fmt) => (
            <span
              key={fmt}
              style={{
                padding: "4px 10px",
                fontSize: 11,
                fontWeight: 500,
                color: "#9CA3AF",
                background: "#F9FAFB",
                borderRadius: 6,
                border: "1px solid #F3F4F6",
              }}
            >
              {fmt}
            </span>
          ))}
        </div>
      </button>
    </div>
  );
}
