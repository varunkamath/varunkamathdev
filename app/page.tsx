'use client';

import { useState, useRef } from 'react';
import MorphfieldScene, { type MorphfieldSceneHandle } from './components/MorphfieldScene';
import InfoPanel from './components/InfoPanel';
import ShapeLabel from './components/ShapeLabel';

export default function Home() {
  const [shapeName, setShapeName] = useState('torus');
  const sceneRef = useRef<MorphfieldSceneHandle>(null);

  return (
    <main className="h-screen w-screen overflow-hidden bg-black">
      <MorphfieldScene ref={sceneRef} onShapeChange={setShapeName} />
      <InfoPanel />
      <ShapeLabel shapeName={shapeName} onClick={() => sceneRef.current?.triggerMorph()} />
    </main>
  );
}
