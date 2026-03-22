import { MathUtils } from 'three';

const DEG2RAD = Math.PI / 180;

export async function requestGyroPermission(): Promise<boolean> {
  if (typeof DeviceOrientationEvent === 'undefined') return false;
  if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
    try {
      const result = await (DeviceOrientationEvent as any).requestPermission();
      return result === 'granted';
    } catch {
      return false;
    }
  }
  return true;
}

export interface GyroState {
  targetTheta: number;
  targetPhi: number;
  offsetTheta: number;
  offsetPhi: number;
  active: boolean;
}

export const GYRO_PREF_KEY = 'gyroPref';

const SENSITIVITY = 0.15;
const MAX_YAW = 0.3;
const MAX_PITCH = 0.25;
const SMOOTHING = 0.08;
const DEAD_ZONE = 1e-6;

export function createGyroState(): GyroState {
  return { targetTheta: 0, targetPhi: 0, offsetTheta: 0, offsetPhi: 0, active: false };
}

export function handleOrientation(state: GyroState, event: DeviceOrientationEvent): void {
  const beta = (event.beta ?? 0) * DEG2RAD;
  const gamma = (event.gamma ?? 0) * DEG2RAD;

  state.targetTheta = MathUtils.clamp(gamma * SENSITIVITY, -MAX_YAW, MAX_YAW);
  state.targetPhi = MathUtils.clamp((beta - 0.75) * SENSITIVITY, -MAX_PITCH, MAX_PITCH);
  state.active = true;
}

export function updateGyroOffset(state: GyroState): boolean {
  const dTheta = state.targetTheta - state.offsetTheta;
  const dPhi = state.targetPhi - state.offsetPhi;
  if (Math.abs(dTheta) < DEAD_ZONE && Math.abs(dPhi) < DEAD_ZONE) return false;
  state.offsetTheta += dTheta * SMOOTHING;
  state.offsetPhi += dPhi * SMOOTHING;
  return true;
}

// Shake detection
const SHAKE_THRESHOLD = 25;
const SHAKE_COUNT_REQUIRED = 3;
const SHAKE_WINDOW = 800;
const SHAKE_COOLDOWN = 2000;

export interface ShakeDetector {
  timestamps: number[];
  lastEvent: number;
  onShake: (() => void) | null;
}

export function createShakeDetector(): ShakeDetector {
  return { timestamps: [], lastEvent: 0, onShake: null };
}

export function handleDeviceMotion(detector: ShakeDetector, event: DeviceMotionEvent): void {
  const acc = event.accelerationIncludingGravity;
  if (!acc) return;

  const magnitude = Math.sqrt((acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2);

  if (magnitude > SHAKE_THRESHOLD) {
    const now = Date.now();
    detector.timestamps.push(now);
    detector.timestamps = detector.timestamps.filter((t) => now - t < SHAKE_WINDOW);

    if (
      detector.timestamps.length >= SHAKE_COUNT_REQUIRED &&
      now - detector.lastEvent > SHAKE_COOLDOWN
    ) {
      detector.lastEvent = now;
      detector.timestamps = [];
      detector.onShake?.();
    }
  }
}
