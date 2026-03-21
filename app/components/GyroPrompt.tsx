'use client';

import { requestGyroPermission } from '../lib/deviceMotion';

interface GyroPromptProps {
  onResult: (granted: boolean) => void;
}

export default function GyroPrompt({ onResult }: GyroPromptProps) {
  const handleAllow = async () => {
    const granted = await requestGyroPermission();
    onResult(granted);
  };

  return (
    <div
      className="
        fixed inset-0 z-20
        flex items-center justify-center
        bg-[var(--dialog-backdrop)]
        animate-fade-in
      "
    >
      <div
        className="
          max-w-xs mx-4
          rounded-xl
          border border-[var(--glass-border)]
          bg-[var(--glass-bg)]
          backdrop-blur-xl backdrop-saturate-[1.2]
          px-7 py-6
          text-center
          transition-colors duration-500
        "
      >
        <p
          className="text-[var(--text-secondary)] text-[13px] leading-relaxed"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          enable motion controls for the full experience
        </p>

        <div className="flex gap-4 justify-center mt-5" style={{ fontFamily: 'var(--font-mono)' }}>
          <button
            onClick={handleAllow}
            className="
              px-4 py-1.5 rounded-full
              border border-[rgba(var(--accent-rgb),0.3)]
              text-[var(--accent)] text-[13px]
              hover:bg-[rgba(var(--accent-rgb),0.1)]
              transition-colors duration-300
              cursor-pointer
            "
          >
            allow
          </button>
          <button
            onClick={() => onResult(false)}
            className="
              px-4 py-1.5 rounded-full
              text-[var(--text-muted)] text-[13px]
              hover:text-[var(--text-secondary)]
              transition-colors duration-300
              cursor-pointer
            "
          >
            skip
          </button>
        </div>
      </div>
    </div>
  );
}
