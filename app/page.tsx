'use client';

import { useState, useRef, useCallback } from 'react';
import SwarmScene, { type SwarmSceneHandle, type InteractionEvent } from './components/SwarmScene';
import InfoPanel from './components/InfoPanel';
import ShapeLabel from './components/ShapeLabel';
import GyroPrompt from './components/GyroPrompt';
import ControlsHint from './components/ControlsHint';
import ThemeToggle from './components/ThemeToggle';
import { RippleLayer } from './components/InteractionRipple';
import { usePalette } from './lib/palette';
import { ThemeProvider } from './lib/theme';

interface Ripple {
  id: number;
  x: number;
  y: number;
  type: 'attract' | 'repel';
}

let nextRippleId = 0;

export default function Home() {
  usePalette();
  const [shapeName, setShapeName] = useState('torus');
  const [showGyroPrompt, setShowGyroPrompt] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const sceneRef = useRef<SwarmSceneHandle>(null);

  const handleGyroResult = (granted: boolean) => {
    setShowGyroPrompt(false);
    if (granted) {
      sceneRef.current?.enableGyro();
    }
    try {
      sessionStorage.setItem('gyroPromptShown', '1');
    } catch {}
  };

  const handleGyroNeeded = () => {
    try {
      if (sessionStorage.getItem('gyroPromptShown')) return;
    } catch {}
    setShowGyroPrompt(true);
  };

  const handleInteraction = useCallback((event: InteractionEvent) => {
    const id = nextRippleId++;
    setRipples((prev) => [...prev, { id, x: event.x, y: event.y, type: event.type }]);
  }, []);

  const handleRippleComplete = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <ThemeProvider>
      <main className="h-screen w-screen overflow-hidden bg-black">
        <SwarmScene
          ref={sceneRef}
          onShapeChange={setShapeName}
          onGyroNeeded={handleGyroNeeded}
          onInteraction={handleInteraction}
        />
        <InfoPanel />
        <ShapeLabel shapeName={shapeName} onClick={() => sceneRef.current?.triggerMorph()} />
        <ControlsHint />
        <ThemeToggle />
        <RippleLayer ripples={ripples} onComplete={handleRippleComplete} />
        {showGyroPrompt && <GyroPrompt onResult={handleGyroResult} />}
      </main>
    </ThemeProvider>
  );
}
