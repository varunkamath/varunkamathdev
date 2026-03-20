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
        border border-white/[0.08]
        bg-white/[0.03]
        backdrop-blur-xl backdrop-saturate-[1.2]
        px-6 py-5 md:px-7 md:py-6
        animate-panel-in
      "
    >
      <h1
        className="text-white/90 text-2xl md:text-[28px] leading-tight tracking-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        varun kamath
      </h1>

      <p className="text-white/40 text-[13px] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
        research software engineer
      </p>

      <div className="h-px bg-white/[0.06] my-4" />

      <div className="flex gap-5 text-[13px]" style={{ fontFamily: 'var(--font-mono)' }}>
        <a
          href="https://github.com/varunkamath"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/50 hover:text-[#c0d8f0] transition-colors duration-300"
        >
          github
        </a>
        <a
          href="https://linkedin.com/in/varun-kamath"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/50 hover:text-[#c0d8f0] transition-colors duration-300"
        >
          linkedin
        </a>
        <a
          href="mailto:varun.kamath@gmail.com"
          className="text-white/50 hover:text-[#c0d8f0] transition-colors duration-300"
        >
          email
        </a>
      </div>
    </div>
  );
}
