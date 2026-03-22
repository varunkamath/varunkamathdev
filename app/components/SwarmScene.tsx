'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SHAPES, SHAPE_COUNT } from '../lib/shapes';
import { currentPalette } from '../lib/palette';
import { sampleShapeTargets } from '../lib/parametric';
import {
  createSwarmState,
  initializePositions,
  stepSimulation,
  applyBurstForce,
  swapTargets,
  BOID_PARAMS,
} from '../lib/boids';
import { swarmVertexShader, swarmFragmentShader } from '../lib/swarmShaders';
import { starVertexShader, starFragmentShader } from '../lib/backgroundShaders';
import {
  createInteractionState,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  updateInteractions,
  setMouseRay,
  clearMouseRay,
} from '../lib/interactions';
import {
  createGyroState,
  handleOrientation,
  updateGyroOffset,
  createShakeDetector,
  handleDeviceMotion,
  GYRO_PREF_KEY,
} from '../lib/deviceMotion';

export interface SwarmSceneHandle {
  triggerMorph: () => void;
  enableGyro: () => void;
}

export interface InteractionEvent {
  x: number;
  y: number;
  type: 'attract' | 'repel';
}

interface SwarmSceneProps {
  onShapeChange?: (name: string) => void;
  onGyroNeeded?: () => void;
  onInteraction?: (event: InteractionEvent) => void;
}

const easeInCubic = (t: number) => t * t * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const RELEASE_END = 300;
const SCATTER_END = 1000;
const CONVERGE_END = 2200;
const SETTLE_END = 2800;

const PARTICLE_COUNT_MOBILE = 500;
const PARTICLE_COUNT_DESKTOP = 800;

const ICE_BLUE = new THREE.Color(...currentPalette.gl);
const WHITE = new THREE.Color(1.0, 1.0, 1.0);
const DARK_LERP = new THREE.Color(0.05, 0.05, 0.05);
const LIGHT_BG = new THREE.Color(0.95, 0.94, 0.93);
const DARK_BG = new THREE.Color(0, 0, 0);

const _mat4 = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _color = new THREE.Color();
const _scale = new THREE.Vector3(1, 1, 1);
const _gyroQuat = new THREE.Quaternion();
const _gyroEuler = new THREE.Euler();

const SwarmScene = forwardRef<SwarmSceneHandle, SwarmSceneProps>(function SwarmScene(
  { onShapeChange, onGyroNeeded, onInteraction },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onShapeChangeRef = useRef(onShapeChange);
  onShapeChangeRef.current = onShapeChange;
  const onGyroNeededRef = useRef(onGyroNeeded);
  onGyroNeededRef.current = onGyroNeeded;
  const onInteractionRef = useRef(onInteraction);
  onInteractionRef.current = onInteraction;

  const enableGyroRef = useRef<(() => void) | null>(null);
  const startMorphRef = useRef<(() => void) | null>(null);

  useImperativeHandle(ref, () => ({
    triggerMorph: () => startMorphRef.current?.(),
    enableGyro: () => enableGyroRef.current?.(),
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    const particleCount = isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, 14);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0, 0, 0);

    // --- Star field ---
    const starCount = isMobile ? 800 : 1200;
    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    const starPhases = new Float32Array(starCount);
    const starBrightnesses = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 30 + Math.random() * 40;
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);
      starSizes[i] = 1.5 + Math.random() * 3.0;
      starPhases[i] = Math.random() * Math.PI * 2;
      starBrightnesses[i] = 0.5 + Math.random() * 0.7;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1));
    starGeo.setAttribute('aPhase', new THREE.BufferAttribute(starPhases, 1));
    starGeo.setAttribute('aBrightness', new THREE.BufferAttribute(starBrightnesses, 1));
    const starMat = new THREE.ShaderMaterial({
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      uniforms: {
        uBaseColor: { value: new THREE.Vector3(...currentPalette.complementaryGl) },
        uTime: { value: 0 },
        uMorphPulse: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    starPoints.renderOrder = -1;
    scene.add(starPoints);

    const geometry = new THREE.TetrahedronGeometry(0.06, 0);
    const material = new THREE.ShaderMaterial({
      vertexShader: swarmVertexShader,
      fragmentShader: swarmFragmentShader,
      uniforms: {
        uBaseColor: { value: new THREE.Vector3(...currentPalette.gl) },
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.InstancedMesh(geometry, material, particleCount);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const colorArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      colorArray[i * 3] = currentPalette.gl[0];
      colorArray[i * 3 + 1] = currentPalette.gl[1];
      colorArray[i * 3 + 2] = currentPalette.gl[2];
    }
    mesh.instanceColor = new THREE.InstancedBufferAttribute(colorArray, 3);
    mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);

    scene.add(mesh);

    const quaternions: THREE.Quaternion[] = [];
    for (let i = 0; i < particleCount; i++) {
      const q = new THREE.Quaternion();
      q.set(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5,
      ).normalize();
      quaternions.push(q);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.minDistance = 6;
    controls.maxDistance = 30;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;

    if (isMobile) {
      controls.enableRotate = false;
      controls.touches = { ONE: THREE.TOUCH.DOLLY_PAN, TWO: THREE.TOUCH.DOLLY_ROTATE };
    } else {
      controls.mouseButtons = {
        LEFT: null as unknown as THREE.MOUSE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      };
    }

    const swarm = createSwarmState(particleCount);
    sampleShapeTargets(0, particleCount, swarm.targets);
    sampleShapeTargets(1, particleCount, swarm.nextTargets);
    initializePositions(swarm);
    onShapeChangeRef.current?.(SHAPES[0].name);

    const interactions = createInteractionState();

    const mouseRaycaster = new THREE.Raycaster();
    const mouseNdc = new THREE.Vector2(9999, 9999);

    const pointerStartInfo = new Map<number, { x: number; y: number; time: number }>();

    const handleDown = (e: PointerEvent) => {
      if (!isMobile && e.button === 2) return;
      pointerStartInfo.set(e.pointerId, { x: e.clientX, y: e.clientY, time: Date.now() });
      onPointerDown(interactions, e, camera);
    };
    const handleMove = (e: PointerEvent) => {
      onPointerMove(interactions, e, camera);
      if (!isMobile) {
        mouseNdc.set(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / window.innerHeight) * 2 + 1,
        );
      }
    };
    const handleUp = (e: PointerEvent) => {
      const start = pointerStartInfo.get(e.pointerId);
      if (start) {
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        const moved = dx * dx + dy * dy > 64;
        if (!moved) {
          const isLong = Date.now() - start.time >= 500;
          onInteractionRef.current?.({
            x: e.clientX,
            y: e.clientY,
            type: isLong ? 'repel' : 'attract',
          });
        }
        pointerStartInfo.delete(e.pointerId);
      }
      onPointerUp(interactions, e, camera);
    };
    const handleLeave = () => {
      mouseNdc.set(9999, 9999);
      clearMouseRay(interactions);
    };

    renderer.domElement.addEventListener('pointerdown', handleDown);
    renderer.domElement.addEventListener('pointermove', handleMove);
    renderer.domElement.addEventListener('pointerup', handleUp);
    renderer.domElement.addEventListener('pointercancel', handleUp);
    renderer.domElement.addEventListener('pointerleave', handleLeave);
    renderer.domElement.style.touchAction = 'none';

    const gyroState = createGyroState();
    const shakeDetector = createShakeDetector();
    const onOrient = (e: DeviceOrientationEvent) => handleOrientation(gyroState, e);
    const onMotion = (e: DeviceMotionEvent) => handleDeviceMotion(shakeDetector, e);

    enableGyroRef.current = () => {
      window.addEventListener('deviceorientation', onOrient);
      window.addEventListener('devicemotion', onMotion);
    };

    let onFirstTouch: (() => void) | null = null;

    if (isMobile) {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        let savedPref: string | null = null;
        try {
          savedPref = localStorage.getItem(GYRO_PREF_KEY);
        } catch {}
        if (savedPref === 'granted') {
          onFirstTouch = async () => {
            onFirstTouch = null;
            try {
              const result = await (DeviceOrientationEvent as any).requestPermission();
              if (result === 'granted') enableGyroRef.current?.();
            } catch {}
          };
          renderer.domElement.addEventListener('touchstart', onFirstTouch, { once: true });
        } else if (savedPref !== 'denied') {
          onGyroNeededRef.current?.();
        }
      } else {
        enableGyroRef.current();
      }
    }

    const morphState = {
      shapeIndex: 0,
      phase: 'idle' as string,
      startTime: 0,
      burstApplied: false,
      targetsSwapped: false,
      autoTimer: null as ReturnType<typeof setTimeout> | null,
    };

    let morphPulse = 0;

    shakeDetector.onShake = () => {
      if (morphState.phase !== 'idle') return;
      applyBurstForce(swarm, 6.0);
      morphState.phase = 'scatter';
      morphState.startTime = performance.now();
      morphState.burstApplied = true;
      morphState.targetsSwapped = true;
      morphPulse = 1.0;
    };

    const startMorph = () => {
      if (morphState.phase !== 'idle') return;
      const nextIndex = (morphState.shapeIndex + 1) % SHAPE_COUNT;
      sampleShapeTargets(nextIndex, particleCount, swarm.nextTargets);
      morphState.phase = 'release';
      morphState.startTime = performance.now();
      morphState.burstApplied = false;
      morphState.targetsSwapped = false;
      morphState.shapeIndex = nextIndex;
      onShapeChangeRef.current?.(SHAPES[nextIndex]?.name ?? 'shape');
    };

    startMorphRef.current = startMorph;

    const scheduleAutoMorph = () => {
      if (morphState.autoTimer) clearTimeout(morphState.autoTimer);
      morphState.autoTimer = setTimeout(startMorph, 20000);
    };
    scheduleAutoMorph();

    const timer = new THREE.Timer();

    const animate = () => {
      const animId = requestAnimationFrame(animate);
      animationId = animId;

      timer.update();
      let dt = timer.getDelta();
      dt = Math.max(0.001, Math.min(dt, 0.05));
      const now = Date.now();

      const elapsed = timer.getElapsed();
      const isLight = document.documentElement.classList.contains('light');

      if (isLight) {
        ICE_BLUE.setRGB(...currentPalette.darkGl);
        material.uniforms.uBaseColor.value.set(...currentPalette.darkGl);
        if (material.blending !== THREE.NormalBlending) {
          scene.background = LIGHT_BG;
          material.blending = THREE.NormalBlending;
          material.needsUpdate = true;
          starMat.blending = THREE.NormalBlending;
          starMat.needsUpdate = true;
        }
      } else {
        ICE_BLUE.setRGB(...currentPalette.gl);
        material.uniforms.uBaseColor.value.set(...currentPalette.gl);
        if (material.blending !== THREE.AdditiveBlending) {
          scene.background = DARK_BG;
          material.blending = THREE.AdditiveBlending;
          material.needsUpdate = true;
          starMat.blending = THREE.AdditiveBlending;
          starMat.needsUpdate = true;
        }
      }

      material.uniforms.uTime.value = elapsed;
      starMat.uniforms.uBaseColor.value.set(
        ...(isLight ? currentPalette.darkGl : currentPalette.complementaryGl),
      );
      starMat.uniforms.uTime.value = elapsed;

      if (!isMobile && mouseNdc.x < 2) {
        mouseRaycaster.setFromCamera(mouseNdc, camera);
        setMouseRay(interactions, mouseRaycaster.ray.origin, mouseRaycaster.ray.direction);
      }

      let targetWeight = BOID_PARAMS.targetWeight;
      let dampingOverride: number | null = null;

      if (morphState.phase !== 'idle') {
        const morphElapsed = performance.now() - morphState.startTime;

        if (morphElapsed < RELEASE_END) {
          const t = morphElapsed / RELEASE_END;
          targetWeight = BOID_PARAMS.targetWeight * (1 - easeInCubic(t));
        } else if (morphElapsed < SCATTER_END) {
          if (!morphState.burstApplied) {
            applyBurstForce(swarm, 6.0);
            morphState.burstApplied = true;
            morphPulse = 1.0;
          }
          targetWeight = 0;
          dampingOverride = 0.6;
        } else if (morphElapsed < CONVERGE_END) {
          if (!morphState.targetsSwapped) {
            swapTargets(swarm);
            morphState.targetsSwapped = true;
          }
          const t = (morphElapsed - SCATTER_END) / (CONVERGE_END - SCATTER_END);
          targetWeight = BOID_PARAMS.targetWeight * easeOutCubic(t);
          dampingOverride = 0.4 * (1 - t) + BOID_PARAMS.dampingPerSecond * t;
        } else if (morphElapsed < SETTLE_END) {
          targetWeight = BOID_PARAMS.targetWeight * 1.5;
          dampingOverride = 0.05;
        } else {
          morphState.phase = 'idle';
          sampleShapeTargets(
            (morphState.shapeIndex + 1) % SHAPE_COUNT,
            particleCount,
            swarm.nextTargets,
          );
          scheduleAutoMorph();
        }
      }

      morphPulse = Math.max(0, morphPulse - dt * 1.25);
      starMat.uniforms.uMorphPulse.value = morphPulse;

      updateInteractions(interactions, now);
      stepSimulation(swarm, dt, targetWeight, dampingOverride, interactions, now);

      const lerpTarget = isLight ? DARK_LERP : WHITE;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        _pos.set(swarm.positions[i3], swarm.positions[i3 + 1], swarm.positions[i3 + 2]);
        _mat4.compose(_pos, quaternions[i], _scale);
        mesh.setMatrixAt(i, _mat4);

        const speedNorm = Math.min(swarm.speeds[i] / BOID_PARAMS.maxSpeed, 1.0);
        _color.copy(ICE_BLUE).lerp(lerpTarget, speedNorm * speedNorm);
        mesh.setColorAt(i, _color);
      }

      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

      controls.update();

      if (isMobile && gyroState.active && updateGyroOffset(gyroState)) {
        _gyroEuler.set(-gyroState.offsetPhi, -gyroState.offsetTheta, 0, 'YXZ');
        _gyroQuat.setFromEuler(_gyroEuler);
        camera.quaternion.multiply(_gyroQuat);
      }

      renderer.render(scene, camera);
    };

    let animationId = requestAnimationFrame(animate);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationId);
      if (morphState.autoTimer) clearTimeout(morphState.autoTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('deviceorientation', onOrient);
      window.removeEventListener('devicemotion', onMotion);
      if (onFirstTouch) {
        renderer.domElement.removeEventListener('touchstart', onFirstTouch);
      }
      renderer.domElement.removeEventListener('pointerdown', handleDown);
      renderer.domElement.removeEventListener('pointermove', handleMove);
      renderer.domElement.removeEventListener('pointerup', handleUp);
      renderer.domElement.removeEventListener('pointercancel', handleUp);
      renderer.domElement.removeEventListener('pointerleave', handleLeave);
      controls.dispose();
      starGeo.dispose();
      starMat.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} style={{ position: 'fixed', inset: 0, zIndex: 0 }} />;
});

export default SwarmScene;
