'use client';

import { useState, useRef } from 'react';
import SwarmScene, { type SwarmSceneHandle } from './components/SwarmScene';
import InfoPanel from './components/InfoPanel';
import ShapeLabel from './components/ShapeLabel';
import GyroPrompt from './components/GyroPrompt';
import ControlsHint from './components/ControlsHint';

export default function Home() {
  const [shapeName, setShapeName] = useState('torus');
  const [showGyroPrompt, setShowGyroPrompt] = useState(false);
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

  return (
    <main className="h-screen w-screen overflow-hidden bg-black">
      <SwarmScene ref={sceneRef} onShapeChange={setShapeName} onGyroNeeded={handleGyroNeeded} />
      <InfoPanel />
      <ShapeLabel shapeName={shapeName} onClick={() => sceneRef.current?.triggerMorph()} />
      <ControlsHint />
      {showGyroPrompt && <GyroPrompt onResult={handleGyroResult} />}
    </main>
  );
}
