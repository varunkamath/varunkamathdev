import * as THREE from 'three';

export interface ForceRay {
  origin: THREE.Vector3;
  direction: THREE.Vector3;
  strength: number;
  radius: number;
  createdAt: number;
  lifetime: number;
}

export interface InteractionState {
  mouseRayOrigin: THREE.Vector3;
  mouseRayDir: THREE.Vector3;
  mouseActive: boolean;
  forceRays: ForceRay[];
  dragPoints: THREE.Vector3[];
  dragEndTime: number | null;
  pointers: Map<number, PointerInfo>;
}

interface PointerInfo {
  startX: number;
  startY: number;
  startTime: number;
  moved: boolean;
  longPressTimer: ReturnType<typeof setTimeout> | null;
}

const LONG_PRESS_MS = 500;
const MOVE_THRESHOLD = 8;
const MAX_FORCE_RAYS = 5;
const DRAG_FADE_MS = 1200;
const MAX_DRAG_POINTS = 30;
const DRAG_SPHERE_RADIUS = 5.0;

const MOUSE_HOVER_RADIUS = 4.0;
const MOUSE_HOVER_STRENGTH = 8.0;
const TAP_RAY_RADIUS = 5.0;
const TAP_RAY_STRENGTH = 15.0;
const TAP_RAY_LIFETIME = 2500;
const LONG_PRESS_RAY_RADIUS = 6.0;
const LONG_PRESS_RAY_STRENGTH = -20.0;
const LONG_PRESS_RAY_LIFETIME = 2500;
const DRAG_RADIUS = 6.0;
const DRAG_STRENGTH = 10.0;

export function createInteractionState(): InteractionState {
  return {
    mouseRayOrigin: new THREE.Vector3(),
    mouseRayDir: new THREE.Vector3(0, 0, -1),
    mouseActive: false,
    forceRays: [],
    dragPoints: [],
    dragEndTime: null,
    pointers: new Map(),
  };
}

export function setMouseRay(
  state: InteractionState,
  origin: THREE.Vector3,
  direction: THREE.Vector3,
): void {
  state.mouseRayOrigin.copy(origin);
  state.mouseRayDir.copy(direction);
  state.mouseActive = true;
}

export function clearMouseRay(state: InteractionState): void {
  state.mouseActive = false;
}

const _raycaster = new THREE.Raycaster();
const _ndc = new THREE.Vector2();
const _sphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1);
const _rayOrigin = new THREE.Vector3();
const _rayDir = new THREE.Vector3();

function setNdc(x: number, y: number): void {
  _ndc.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
}

function getRayFromPointer(
  x: number,
  y: number,
  camera: THREE.PerspectiveCamera,
  outOrigin: THREE.Vector3,
  outDir: THREE.Vector3,
): void {
  setNdc(x, y);
  _raycaster.setFromCamera(_ndc, camera);
  outOrigin.copy(_raycaster.ray.origin);
  outDir.copy(_raycaster.ray.direction);
}

function pointerToSphere(
  x: number,
  y: number,
  camera: THREE.PerspectiveCamera,
  out: THREE.Vector3,
): boolean {
  setNdc(x, y);
  _raycaster.setFromCamera(_ndc, camera);
  _sphere.radius = DRAG_SPHERE_RADIUS;
  return _raycaster.ray.intersectSphere(_sphere, out) !== null;
}

export function onPointerDown(
  state: InteractionState,
  e: PointerEvent,
  camera: THREE.PerspectiveCamera,
): void {
  const info: PointerInfo = {
    startX: e.clientX,
    startY: e.clientY,
    startTime: Date.now(),
    moved: false,
    longPressTimer: setTimeout(() => {
      if (!info.moved) {
        getRayFromPointer(e.clientX, e.clientY, camera, _rayOrigin, _rayDir);
        addForceRay(
          state,
          _rayOrigin,
          _rayDir,
          LONG_PRESS_RAY_STRENGTH,
          LONG_PRESS_RAY_RADIUS,
          LONG_PRESS_RAY_LIFETIME,
        );
      }
    }, LONG_PRESS_MS),
  };
  state.pointers.set(e.pointerId, info);
}

export function onPointerMove(
  state: InteractionState,
  e: PointerEvent,
  camera: THREE.PerspectiveCamera,
): void {
  const info = state.pointers.get(e.pointerId);
  if (!info) return;

  const dx = e.clientX - info.startX;
  const dy = e.clientY - info.startY;
  if (!info.moved && dx * dx + dy * dy > MOVE_THRESHOLD * MOVE_THRESHOLD) {
    info.moved = true;
    if (info.longPressTimer) {
      clearTimeout(info.longPressTimer);
      info.longPressTimer = null;
    }
    state.dragPoints = [];
    state.dragEndTime = null;
  }

  if (info.moved) {
    const pt = new THREE.Vector3();
    if (pointerToSphere(e.clientX, e.clientY, camera, pt)) {
      state.dragPoints.push(pt);
      if (state.dragPoints.length > MAX_DRAG_POINTS) {
        state.dragPoints.shift();
      }
    }
  }
}

export function onPointerUp(
  state: InteractionState,
  e: PointerEvent,
  camera: THREE.PerspectiveCamera,
): void {
  const info = state.pointers.get(e.pointerId);
  if (!info) return;

  if (info.longPressTimer) {
    clearTimeout(info.longPressTimer);
    info.longPressTimer = null;
  }

  if (!info.moved && Date.now() - info.startTime < LONG_PRESS_MS) {
    getRayFromPointer(e.clientX, e.clientY, camera, _rayOrigin, _rayDir);
    addForceRay(state, _rayOrigin, _rayDir, TAP_RAY_STRENGTH, TAP_RAY_RADIUS, TAP_RAY_LIFETIME);
  }

  if (info.moved) {
    state.dragEndTime = Date.now();
  }

  state.pointers.delete(e.pointerId);
}

function addForceRay(
  state: InteractionState,
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  strength: number,
  radius: number,
  lifetime: number,
): void {
  if (state.forceRays.length >= MAX_FORCE_RAYS) {
    state.forceRays.shift();
  }
  state.forceRays.push({
    origin: origin.clone(),
    direction: direction.clone().normalize(),
    strength,
    radius,
    createdAt: Date.now(),
    lifetime,
  });
}

export function updateInteractions(state: InteractionState, now: number): void {
  let writeIdx = 0;
  for (let i = 0; i < state.forceRays.length; i++) {
    if (now - state.forceRays[i].createdAt < state.forceRays[i].lifetime) {
      state.forceRays[writeIdx++] = state.forceRays[i];
    }
  }
  state.forceRays.length = writeIdx;

  if (state.dragEndTime && now - state.dragEndTime > DRAG_FADE_MS) {
    state.dragPoints = [];
    state.dragEndTime = null;
  }
}

const _toPoint = new THREE.Vector3();
const _closest = new THREE.Vector3();
const _pushDir = new THREE.Vector3();
const _toSeg = new THREE.Vector3();
const _segDir = new THREE.Vector3();

function pointRayDistance(
  px: number,
  py: number,
  pz: number,
  rayOrigin: THREE.Vector3,
  rayDir: THREE.Vector3,
  outPushDir: THREE.Vector3,
): number {
  _toPoint.set(px - rayOrigin.x, py - rayOrigin.y, pz - rayOrigin.z);
  const proj = Math.max(0, _toPoint.dot(rayDir));
  _closest.copy(rayDir).multiplyScalar(proj).add(rayOrigin);
  outPushDir.set(px - _closest.x, py - _closest.y, pz - _closest.z);
  const dist = outPushDir.length();
  if (dist > 0.001) outPushDir.divideScalar(dist);
  return dist;
}

export function computeExternalForce(
  state: InteractionState,
  px: number,
  py: number,
  pz: number,
  now: number,
  out: THREE.Vector3,
): void {
  out.set(0, 0, 0);

  if (state.mouseActive) {
    const dist = pointRayDistance(px, py, pz, state.mouseRayOrigin, state.mouseRayDir, _pushDir);
    if (dist < MOUSE_HOVER_RADIUS) {
      const falloff = 1.0 - dist / MOUSE_HOVER_RADIUS;
      out.addScaledVector(_pushDir, MOUSE_HOVER_STRENGTH * falloff * falloff);
    }
  }

  for (const ray of state.forceRays) {
    const dist = pointRayDistance(px, py, pz, ray.origin, ray.direction, _pushDir);
    if (dist < ray.radius) {
      const falloff = 1.0 - dist / ray.radius;
      const age = Math.max(0, 1.0 - (now - ray.createdAt) / ray.lifetime);
      const sign = ray.strength > 0 ? -1 : 1;
      out.addScaledVector(_pushDir, sign * Math.abs(ray.strength) * falloff * age);
    }
  }

  const pts = state.dragPoints;
  if (pts.length >= 2) {
    let minDist = Infinity;
    let bestDx = 0,
      bestDy = 0,
      bestDz = 0;

    for (let i = 0; i < pts.length - 1; i++) {
      _segDir.copy(pts[i + 1]).sub(pts[i]);
      const segLen = _segDir.length();
      if (segLen < 0.001) continue;
      _segDir.divideScalar(segLen);

      _toSeg.set(px - pts[i].x, py - pts[i].y, pz - pts[i].z);
      const proj = Math.max(0, Math.min(segLen, _toSeg.dot(_segDir)));
      const cx = pts[i].x + _segDir.x * proj - px;
      const cy = pts[i].y + _segDir.y * proj - py;
      const cz = pts[i].z + _segDir.z * proj - pz;
      const d = Math.sqrt(cx * cx + cy * cy + cz * cz);

      if (d < minDist && d < DRAG_RADIUS) {
        minDist = d;
        bestDx = cx;
        bestDy = cy;
        bestDz = cz;
      }
    }

    if (minDist < DRAG_RADIUS) {
      const falloff = 1.0 - minDist / DRAG_RADIUS;
      const fade = state.dragEndTime
        ? Math.max(0, 1.0 - (now - state.dragEndTime) / DRAG_FADE_MS)
        : 1.0;
      const s = DRAG_STRENGTH * falloff * fade;
      const len = Math.sqrt(bestDx * bestDx + bestDy * bestDy + bestDz * bestDz);
      if (len > 0.001) {
        out.x += (bestDx / len) * s;
        out.y += (bestDy / len) * s;
        out.z += (bestDz / len) * s;
      }
    }
  }
}
