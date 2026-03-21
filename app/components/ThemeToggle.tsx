'use client';

import { useTheme } from '../lib/theme';

export default function ThemeToggle() {
  const { mode, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="
        fixed top-4 right-4 md:top-6 md:right-6 z-10
        px-3 py-1.5
        rounded-full
        border border-[var(--glass-border)]
        bg-[var(--glass-bg)]
        backdrop-blur-xl
        text-[var(--text-muted)] text-[11px]
        hover:text-[var(--text-secondary)] hover:border-[var(--glass-border-hover)]
        transition-all duration-500
        cursor-pointer
        animate-panel-in
      "
      style={{ fontFamily: 'var(--font-mono)', animationDelay: '1.8s' }}
      title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
    >
      {mode === 'dark' ? 'light' : 'dark'}
    </button>
  );
}
