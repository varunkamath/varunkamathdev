'use client';

import { useState, useEffect } from 'react';

export default function ControlsHint() {
  const [expanded, setExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches);
    const timer = setTimeout(() => setExpanded(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  const label = isMobile
    ? 'tap to attract \u00b7 hold to repel \u00b7 drag to guide'
    : 'move to interact \u00b7 click to attract \u00b7 right-drag to orbit';

  return (
    <button
      onClick={() => setExpanded((v) => !v)}
      className="
        fixed z-10
        top-4 left-1/2 -translate-x-1/2
        md:top-6
        px-3 py-1.5
        rounded-full
        border border-white/[0.06]
        bg-white/[0.03]
        backdrop-blur-xl
        text-white/30 text-[11px]
        hover:text-white/50 hover:border-white/[0.12]
        transition-all duration-500
        cursor-pointer
        animate-panel-in
      "
      style={{ fontFamily: 'var(--font-mono)', animationDelay: '1.5s' }}
    >
      {expanded ? label : '?'}
    </button>
  );
}
