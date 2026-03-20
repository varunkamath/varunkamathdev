'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { vertexShader, fragmentShader } from '../lib/shaders';
import { SHAPES, SHAPE_COUNT, ACCENT_COLOR } from '../lib/shapes';

export interface MorphfieldSceneHandle {
  triggerMorph: () => void;
}

interface MorphfieldSceneProps {
  onShapeChange?: (name: string) => void;
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const MorphfieldScene = forwardRef<MorphfieldSceneHandle, MorphfieldSceneProps>(
  function MorphfieldScene({ onShapeChange }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const onShapeChangeRef = useRef(onShapeChange);
    onShapeChangeRef.current = onShapeChange;

    const startMorphRef = useRef<(() => void) | null>(null);

    useImperativeHandle(ref, () => ({
      triggerMorph: () => startMorphRef.current?.(),
    }));

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const isMobile = window.matchMedia('(pointer: coarse)').matches;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000);
      container.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        100,
      );
      camera.position.z = 14;

      const scene = new THREE.Scene();

      const segU = isMobile ? 192 : 384;
      const segV = isMobile ? 24 : 32;
      const geometry = new THREE.PlaneGeometry(1, 1, segU, segV);

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uMorph: { value: 0 },
          uShapeA: { value: 0 },
          uShapeB: { value: 1 },
          uNoiseScale: { value: 0.35 },
          uDisplacement: { value: 0.12 },
          uRayOrigin: { value: new THREE.Vector3(0, 0, 100) },
          uRayDir: { value: new THREE.Vector3(0, 0, -1) },
          uMouseRadius: { value: 3.0 },
          uColor: { value: new THREE.Vector3(...ACCENT_COLOR) },
        },
        side: THREE.DoubleSide,
        wireframe: true,
        transparent: true,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.enablePan = false;
      controls.enableZoom = true;
      controls.minDistance = 6;
      controls.maxDistance = 30;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.8;

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(9999, 9999);

      const state = {
        shapeIndex: 0,
        morphing: false,
        morphStart: 0,
        animationId: 0,
        autoMorphTimer: null as ReturnType<typeof setTimeout> | null,
      };

      onShapeChangeRef.current?.(SHAPES[0].name);

      const onPointerMove = (e: PointerEvent) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      };
      const onPointerLeave = () => {
        mouse.set(9999, 9999);
      };
      if (!isMobile) {
        window.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerleave', onPointerLeave);
      }

      const startMorph = () => {
        if (state.morphing) return;
        const nextIndex = (state.shapeIndex + 1) % SHAPE_COUNT;
        material.uniforms.uShapeB.value = nextIndex;
        state.morphing = true;
        state.morphStart = performance.now();
        onShapeChangeRef.current?.(SHAPES[nextIndex]?.name ?? 'shape');
      };
      startMorphRef.current = startMorph;

      const scheduleAutoMorph = () => {
        if (state.autoMorphTimer) clearTimeout(state.autoMorphTimer);
        state.autoMorphTimer = setTimeout(startMorph, 20000);
      };
      scheduleAutoMorph();

      const clock = new THREE.Clock();
      const animate = () => {
        state.animationId = requestAnimationFrame(animate);
        material.uniforms.uTime.value = clock.getElapsedTime();

        if (state.morphing) {
          const progress = Math.min((performance.now() - state.morphStart) / 2000, 1);
          const eased = easeInOutCubic(progress);
          material.uniforms.uMorph.value = eased;
          material.uniforms.uDisplacement.value = 0.12 + eased * (1 - eased) * 0.5;

          if (progress >= 1) {
            const newIndex = material.uniforms.uShapeB.value % SHAPE_COUNT;
            state.shapeIndex = newIndex;
            material.uniforms.uShapeA.value = newIndex;
            material.uniforms.uShapeB.value = (newIndex + 1) % SHAPE_COUNT;
            material.uniforms.uMorph.value = 0;
            material.uniforms.uDisplacement.value = 0.12;
            state.morphing = false;
            scheduleAutoMorph();
          }
        }

        if (!isMobile && mouse.x < 2) {
          raycaster.setFromCamera(mouse, camera);
          material.uniforms.uRayOrigin.value.copy(raycaster.ray.origin);
          material.uniforms.uRayDir.value.copy(raycaster.ray.direction);
        }

        mesh.rotation.y += 0.002;
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', onResize);

      return () => {
        cancelAnimationFrame(state.animationId);
        if (state.autoMorphTimer) clearTimeout(state.autoMorphTimer);
        window.removeEventListener('resize', onResize);
        if (!isMobile) {
          window.removeEventListener('pointermove', onPointerMove);
          document.removeEventListener('pointerleave', onPointerLeave);
        }
        controls.dispose();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    }, []);

    return <div ref={containerRef} style={{ position: 'fixed', inset: 0, zIndex: 0 }} />;
  },
);

export default MorphfieldScene;
