interface HeaderProps {
  onSettingsClick: () => void;
}

export default function Header({ onSettingsClick }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-2">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="text-accent"
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="3"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M3 16l5-5 4 4 3-3 6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="15" cy="9" r="2" fill="currentColor" />
        </svg>
        <h1 className="text-lg font-semibold text-gray-800">PicSlim</h1>
        <span className="text-xs text-gray-400 ml-1">이미지 용량 최적화</span>
      </div>
      <button
        onClick={onSettingsClick}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
        title="설정"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>
    </header>
  );
}
