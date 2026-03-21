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
  currentTheta: number;
  currentPhi: number;
  active: boolean;
}

const BASE_THETA = Math.PI / 2;
const BASE_PHI = Math.PI / 2;

export function createGyroState(): GyroState {
  return {
    targetTheta: BASE_THETA,
    targetPhi: BASE_PHI,
    currentTheta: BASE_THETA,
    currentPhi: BASE_PHI,
    active: false,
  };
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

export function handleOrientation(state: GyroState, event: DeviceOrientationEvent): void {
  const beta = (event.beta ?? 0) * DEG2RAD;
  const gamma = (event.gamma ?? 0) * DEG2RAD;

  state.targetTheta = clamp(BASE_THETA + gamma * 0.5, BASE_THETA - 0.5, BASE_THETA + 0.5);
  state.targetPhi = clamp(BASE_PHI + (beta - 0.75) * 0.3, BASE_PHI - 0.4, BASE_PHI + 0.4);
  state.active = true;
}

export function updateGyroCamera(state: GyroState): void {
  state.currentTheta += (state.targetTheta - state.currentTheta) * 0.08;
  state.currentPhi += (state.targetPhi - state.currentPhi) * 0.08;
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
