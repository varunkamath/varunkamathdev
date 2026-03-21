'use client';

export default function InfoPanel() {
  return (
    <div
      className="
        fixed z-10
        bottom-0 left-0 right-0
        md:bottom-6 md:left-6 md:right-auto
        md:max-w-xs md:rounded-xl
        rounded-t-xl
        border border-[var(--glass-border)]
        bg-[var(--glass-bg)]
        backdrop-blur-xl backdrop-saturate-[1.2]
        px-6 py-5 md:px-7 md:py-6
        animate-panel-in
        transition-colors duration-500
      "
    >
      <h1
        className="text-[var(--text-primary)] text-2xl md:text-[28px] leading-tight tracking-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        varun kamath
      </h1>

      <p
        className="text-[var(--text-tertiary)] text-[13px] mt-1"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        research software engineer
      </p>

      <div className="h-px bg-[var(--divider)] my-4" />

      <div className="flex gap-5 text-[13px]" style={{ fontFamily: 'var(--font-mono)' }}>
        <a
          href="https://github.com/varunkamath"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors duration-300"
        >
          github
        </a>
        <a
          href="https://linkedin.com/in/varun-kamath"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors duration-300"
        >
          linkedin
        </a>
        <a
          href="mailto:varun.kamath@gmail.com"
          className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors duration-300"
        >
          email
        </a>
      </div>
    </div>
  );
}
