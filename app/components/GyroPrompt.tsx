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
        bg-black/60
        animate-fade-in
      "
    >
      <div
        className="
          max-w-xs mx-4
          rounded-xl
          border border-white/[0.08]
          bg-white/[0.03]
          backdrop-blur-xl backdrop-saturate-[1.2]
          px-7 py-6
          text-center
        "
      >
        <p
          className="text-white/70 text-[13px] leading-relaxed"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          enable motion controls for the full experience
        </p>

        <div className="flex gap-4 justify-center mt-5" style={{ fontFamily: 'var(--font-mono)' }}>
          <button
            onClick={handleAllow}
            className="
              px-4 py-1.5 rounded-full
              border border-[#c0d8f0]/30
              text-[#c0d8f0] text-[13px]
              hover:bg-[#c0d8f0]/10
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
              text-white/30 text-[13px]
              hover:text-white/50
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
