'use client';

import { useState, useEffect, useRef } from 'react';

type View = 'collapsed' | 'controls' | 'about';

export default function ControlsHint({
  onExpandedChange,
}: {
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const [view, setView] = useState<View>('controls');
  const [isMobile, setIsMobile] = useState(false);
  const onExpandedChangeRef = useRef(onExpandedChange);
  onExpandedChangeRef.current = onExpandedChange;

  useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches);
    const timer = setTimeout(() => {
      setView((v) => (v === 'controls' ? 'collapsed' : v));
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    onExpandedChangeRef.current?.(view !== 'collapsed');
  }, [view]);

  const controls = isMobile
    ? 'tap to attract \u00b7 hold to repel \u00b7 drag to guide'
    : 'move to interact \u00b7 click to attract \u00b7 right-drag to orbit';

  if (view === 'about') {
    return (
      <dialog
        open
        className="
          fixed z-20 inset-0 m-0 w-full h-full
          flex items-center justify-center
          bg-[var(--dialog-backdrop)]
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
            border border-[var(--glass-border)]
            bg-[var(--glass-bg)]
            backdrop-blur-xl backdrop-saturate-[1.2]
            px-7 py-6
            transition-colors duration-500
          "
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="document"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <h2
            className="text-[var(--text-heading)] text-lg mb-3 tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            swarm field
          </h2>
          <p className="text-[var(--text-tertiary)] text-[12px] leading-relaxed mb-3">
            each particle is a{' '}
            <a
              href="https://en.wikipedia.org/wiki/Boids"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-link)] hover:text-[var(--accent)] transition-colors duration-300 underline underline-offset-2 decoration-[var(--text-link-decoration)]"
            >
              boid
            </a>{' '}
            &mdash; an autonomous agent following three simple rules: separate from nearby
            neighbors, align velocity with the local flock, and cohere toward the group. add a
            fourth force pulling each boid toward a point on a parametric surface and the swarm
            collectively traces the shape.
          </p>
          <p className="text-[var(--text-tertiary)] text-[12px] leading-relaxed mb-4">
            on morph, the target points release and reassign to the next surface. your interactions
            inject attractor/repulsor forces that temporarily override the formation.
          </p>
          <div className="text-[var(--text-muted)] text-[11px] mb-4">{controls}</div>
          <button
            onClick={() => setView('collapsed')}
            className="
              text-[var(--text-muted)] text-[11px]
              hover:text-[var(--accent)]
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
          border border-[var(--glass-border)]
          bg-[var(--glass-bg)]
          backdrop-blur-xl
          text-[var(--text-muted)] text-[11px]
          hover:text-[var(--text-secondary)] hover:border-[var(--glass-border-hover)]
          transition-all duration-500
          cursor-pointer
          whitespace-nowrap
        "
      >
        {view === 'controls' ? controls : '?'}
      </button>
      {view === 'controls' && (
        <button
          onClick={() => setView('about')}
          className="
            text-[var(--text-muted)] text-[10px]
            hover:text-[var(--accent)]
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
