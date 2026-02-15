interface HeaderProps {
  onSettingsClick: () => void;
}

export default function Header({ onSettingsClick }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-surface border-b border-border">
      <div className="flex items-center gap-2.5">
        {/* Logo mark */}
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
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
          <h1 className="text-sm font-bold text-text-primary tracking-tight leading-none">
            PicSlim
          </h1>
          <p className="text-[11px] text-text-tertiary leading-none mt-0.5">
            이미지 용량 최적화
          </p>
        </div>
      </div>

      <button
        onClick={onSettingsClick}
        className="p-2 rounded-lg hover:bg-surface-elevated text-text-tertiary hover:text-text-secondary transition-colors duration-200 cursor-pointer"
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
