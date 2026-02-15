interface HeaderProps {
  onSettingsClick: () => void;
}

export default function Header({ onSettingsClick }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between"
      style={{
        padding: "20px 32px",
        background: "var(--color-surface, #fff)",
        borderBottom: "1px solid var(--color-border, #E5E7EB)",
      }}
    >
      <div className="flex items-center" style={{ gap: 10 }}>
        {/* Logo mark */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--color-accent, #2563EB)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 3H3v18h18V3z"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M3 17l5-5 4 4 3-3 6 6"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="15.5" cy="8.5" r="2" stroke="#fff" strokeWidth="1.5" />
            <path
              d="M15 21V10M10 21v-6"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 14, fontWeight: 700, color: "#111827", letterSpacing: "-0.01em", lineHeight: 1 }}>
            PicSlim
          </h1>
          <p style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1, marginTop: 3 }}>
            이미지 용량 최적화
          </p>
        </div>
      </div>

      <button
        onClick={onSettingsClick}
        className="cursor-pointer"
        style={{
          padding: 8,
          borderRadius: 8,
          color: "#9CA3AF",
          background: "transparent",
          border: "none",
        }}
        title="설정"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </header>
  );
}
