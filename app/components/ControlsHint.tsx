'use client';

import { useState, useEffect } from 'react';

type View = 'collapsed' | 'controls' | 'about';

export default function ControlsHint() {
  const [view, setView] = useState<View>('controls');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches);
    const timer = setTimeout(() => setView('collapsed'), 6000);
    return () => clearTimeout(timer);
  }, []);

  const controlsShort = isMobile
    ? 'tap \u00b7 hold \u00b7 drag'
    : 'move \u00b7 click \u00b7 right-drag';
  const controlsFull = isMobile
    ? 'tap to attract \u00b7 hold to repel \u00b7 drag to guide'
    : 'move to interact \u00b7 click to attract \u00b7 right-drag to orbit';

  if (view === 'about') {
    return (
      <dialog
        open
        className="
          fixed z-20 inset-0 m-0 w-full h-full
          flex items-center justify-center
          bg-black/60
          animate-fade-in
          border-none
        "
        onClick={() => setView('collapsed')}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setView('collapsed');
        }}
      >
        <div
          className="
            max-w-sm mx-4
            rounded-xl
            border border-white/[0.08]
            bg-white/[0.03]
            backdrop-blur-xl backdrop-saturate-[1.2]
            px-7 py-6
          "
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="document"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <h2
            className="text-white/80 text-lg mb-3 tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            swarm field
          </h2>
          <p className="text-white/40 text-[12px] leading-relaxed mb-3">
            each particle is a{' '}
            <a
              href="https://en.wikipedia.org/wiki/Boids"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-[#c0d8f0] transition-colors duration-300 underline underline-offset-2 decoration-white/20"
            >
              boid
            </a>{' '}
            &mdash; an autonomous agent following three simple rules: separate from nearby
            neighbors, align velocity with the local flock, and cohere toward the group. add a
            fourth force pulling each boid toward a point on a parametric surface and the swarm
            collectively traces the shape.
          </p>
          <p className="text-white/40 text-[12px] leading-relaxed mb-4">
            on morph, the target points release and reassign to the next surface. your interactions
            inject attractor/repulsor forces that temporarily override the formation.
          </p>
          <div className="text-white/25 text-[11px] mb-4">{controlsFull}</div>
          <button
            onClick={() => setView('collapsed')}
            className="
              text-white/30 text-[11px]
              hover:text-[#c0d8f0]
              transition-colors duration-300
              cursor-pointer
            "
          >
            close
          </button>
        </div>
      </dialog>
    );
  }

  return (
    <div
      className="fixed z-10 top-4 md:top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-panel-in"
      style={{ fontFamily: 'var(--font-mono)', animationDelay: '1.5s' }}
    >
      <button
        onClick={() => setView(view === 'collapsed' ? 'controls' : 'collapsed')}
        className="
          px-3 py-1.5
          rounded-full
          border border-white/[0.06]
          bg-white/[0.03]
          backdrop-blur-xl
          text-white/30 text-[11px]
          hover:text-white/50 hover:border-white/[0.12]
          transition-all duration-500
          cursor-pointer
          whitespace-nowrap
        "
      >
        {view === 'controls' ? controlsShort : '?'}
      </button>
      {view === 'controls' && (
        <button
          onClick={() => setView('about')}
          className="
            text-white/25 text-[10px]
            hover:text-[#c0d8f0]
            transition-colors duration-300
            cursor-pointer
          "
        >
          what is this?
        </button>
      )}
    </div>
  );
}
