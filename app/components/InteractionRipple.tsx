'use client';

import { useState, useCallback, useEffect } from 'react';
import type { InteractionEvent } from './SwarmScene';

interface Ripple {
  id: number;
  x: number;
  y: number;
  type: 'attract' | 'repel';
}

let nextId = 0;

export default function InteractionRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const add = useCallback((event: InteractionEvent) => {
    const id = nextId++;
    setRipples((prev) => [...prev, { id, x: event.x, y: event.y, type: event.type }]);
  }, []);

  const remove = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { ripples, add, remove };
}

export function RippleLayer({
  ripples,
  onComplete,
}: {
  ripples: Ripple[];
  onComplete: (id: number) => void;
}) {
  return (
    <div className="fixed inset-0 z-10 pointer-events-none overflow-hidden">
      {ripples.map((r) => (
        <RippleDot key={r.id} ripple={r} onComplete={onComplete} />
      ))}
    </div>
  );
}

function RippleDot({ ripple, onComplete }: { ripple: Ripple; onComplete: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(ripple.id), 2500);
    return () => clearTimeout(timer);
  }, [ripple.id, onComplete]);

  const isAttract = ripple.type === 'attract';

  return (
    <div
      className="absolute animate-ripple"
      style={{
        left: ripple.x,
        top: ripple.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className="rounded-full animate-ripple-ring"
        style={{
          width: 6,
          height: 6,
          boxShadow: `0 0 8px 2px ${isAttract ? 'rgba(192, 216, 240, 0.6)' : 'rgba(255, 140, 120, 0.5)'}`,
          background: isAttract ? 'rgba(192, 216, 240, 0.8)' : 'rgba(255, 140, 120, 0.7)',
        }}
      />
      <div
        className="absolute inset-0 rounded-full animate-ripple-expand"
        style={{
          border: `1px solid ${isAttract ? 'rgba(192, 216, 240, 0.4)' : 'rgba(255, 140, 120, 0.3)'}`,
          transform: 'translate(-50%, -50%)',
          left: '50%',
          top: '50%',
        }}
      />
    </div>
  );
}
