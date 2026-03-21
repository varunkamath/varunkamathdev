import * as THREE from 'three';
import { type InteractionState, computeExternalForce } from './interactions';

export const BOID_PARAMS = {
  separationRadius: 0.25,
  separationWeight: 1.2,
  alignmentRadius: 0.8,
  alignmentWeight: 0.2,
  cohesionRadius: 1.0,
  cohesionWeight: 0.15,
  targetWeight: 2.0,
  arrivalRadius: 1.5,
  maxSpeed: 8.0,
  dampingPerSecond: 0.3,
};

const MAX_NEIGHBOR_RADIUS = Math.max(
  BOID_PARAMS.separationRadius,
  BOID_PARAMS.alignmentRadius,
  BOID_PARAMS.cohesionRadius,
);

export interface SwarmState {
  count: number;
  positions: Float32Array;
  velocities: Float32Array;
  targets: Float32Array;
  nextTargets: Float32Array;
  speeds: Float32Array;
}

export function createSwarmState(count: number): SwarmState {
  return {
    count,
    positions: new Float32Array(count * 3),
    velocities: new Float32Array(count * 3),
    targets: new Float32Array(count * 3),
    nextTargets: new Float32Array(count * 3),
    speeds: new Float32Array(count),
  };
}

export function swapTargets(state: SwarmState): void {
  const tmp = state.targets;
  state.targets = state.nextTargets;
  state.nextTargets = tmp;
}

export function initializePositions(state: SwarmState): void {
  for (let i = 0; i < state.count; i++) {
    const i3 = i * 3;
    state.positions[i3] = state.targets[i3] + (Math.random() - 0.5) * 2;
    state.positions[i3 + 1] = state.targets[i3 + 1] + (Math.random() - 0.5) * 2;
    state.positions[i3 + 2] = state.targets[i3 + 2] + (Math.random() - 0.5) * 2;
    state.velocities[i3] = (Math.random() - 0.5) * 0.5;
    state.velocities[i3 + 1] = (Math.random() - 0.5) * 0.5;
    state.velocities[i3 + 2] = (Math.random() - 0.5) * 0.5;
  }
}

function hashCoords(ix: number, iy: number, iz: number): number {
  return ((ix * 92837111) ^ (iy * 689287499) ^ (iz * 283923481)) | 0;
}

class SpatialHash {
  cellSize: number;
  private buckets: Map<number, number[]> = new Map();
  private pool: number[][] = [];

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  rebuild(positions: Float32Array, count: number): void {
    // Return all buckets to pool before clearing
    for (const bucket of this.buckets.values()) {
      bucket.length = 0;
      this.pool.push(bucket);
    }
    this.buckets.clear();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const cs = this.cellSize;
      const h = hashCoords(
        Math.floor(positions[i3] / cs),
        Math.floor(positions[i3 + 1] / cs),
        Math.floor(positions[i3 + 2] / cs),
      );
      let bucket = this.buckets.get(h);
      if (!bucket) {
        bucket = this.pool.pop() ?? [];
        this.buckets.set(h, bucket);
      }
      bucket.push(i);
    }
  }

  query(x: number, y: number, z: number, radius: number, out: number[]): void {
    out.length = 0;
    const cs = this.cellSize;
    const minX = Math.floor((x - radius) / cs);
    const maxX = Math.floor((x + radius) / cs);
    const minY = Math.floor((y - radius) / cs);
    const maxY = Math.floor((y + radius) / cs);
    const minZ = Math.floor((z - radius) / cs);
    const maxZ = Math.floor((z + radius) / cs);

    for (let ix = minX; ix <= maxX; ix++) {
      for (let iy = minY; iy <= maxY; iy++) {
        for (let iz = minZ; iz <= maxZ; iz++) {
          const bucket = this.buckets.get(hashCoords(ix, iy, iz));
          if (bucket) {
            for (let k = 0; k < bucket.length; k++) {
              out.push(bucket[k]);
            }
          }
        }
      }
    }
  }
}

const spatialHash = new SpatialHash(1.0);
const neighbors: number[] = [];
const _extForce = new THREE.Vector3();

export function stepSimulation(
  state: SwarmState,
  dt: number,
  targetWeight: number,
  dampingOverride: number | null,
  interactions: InteractionState | null,
  now: number,
): void {
  const { count, positions, velocities, targets, speeds } = state;
  const {
    separationRadius,
    separationWeight,
    alignmentRadius,
    alignmentWeight,
    cohesionRadius,
    cohesionWeight,
    arrivalRadius,
    maxSpeed,
    dampingPerSecond,
  } = BOID_PARAMS;

  const baseDamping = dampingOverride ?? dampingPerSecond;
  const frameDamping = Math.pow(baseDamping, dt);
  const heavyDamping = Math.pow(0.001, dt);

  spatialHash.rebuild(positions, count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const px = positions[i3];
    const py = positions[i3 + 1];
    const pz = positions[i3 + 2];

    let fx = 0;
    let fy = 0;
    let fz = 0;

    let distToTarget = 0;
    if (targetWeight > 0.001) {
      let dx = targets[i3] - px;
      let dy = targets[i3 + 1] - py;
      let dz = targets[i3 + 2] - pz;
      distToTarget = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distToTarget > 0.001) {
        let desiredSpeed = maxSpeed;
        if (distToTarget < arrivalRadius) {
          desiredSpeed = maxSpeed * (distToTarget / arrivalRadius);
        }
        const invDist = 1.0 / distToTarget;
        dx = dx * invDist * desiredSpeed - velocities[i3];
        dy = dy * invDist * desiredSpeed - velocities[i3 + 1];
        dz = dz * invDist * desiredSpeed - velocities[i3 + 2];
        fx += dx * targetWeight;
        fy += dy * targetWeight;
        fz += dz * targetWeight;
      }
    }

    spatialHash.query(px, py, pz, MAX_NEIGHBOR_RADIUS, neighbors);

    let sepX = 0,
      sepY = 0,
      sepZ = 0;
    let alignVX = 0,
      alignVY = 0,
      alignVZ = 0,
      alignCount = 0;
    let cohX = 0,
      cohY = 0,
      cohZ = 0,
      cohCount = 0;

    for (let k = 0; k < neighbors.length; k++) {
      const j = neighbors[k];
      if (j === i) continue;

      const j3 = j * 3;
      const dx = px - positions[j3];
      const dy = py - positions[j3 + 1];
      const dz = pz - positions[j3 + 2];
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < 0.0001) continue;

      const dist = Math.sqrt(distSq);

      if (dist < separationRadius) {
        const inv = 1.0 / distSq;
        sepX += dx * inv;
        sepY += dy * inv;
        sepZ += dz * inv;
      }

      if (dist < alignmentRadius) {
        alignVX += velocities[j3];
        alignVY += velocities[j3 + 1];
        alignVZ += velocities[j3 + 2];
        alignCount++;
      }

      if (dist < cohesionRadius) {
        cohX += positions[j3];
        cohY += positions[j3 + 1];
        cohZ += positions[j3 + 2];
        cohCount++;
      }
    }

    fx += sepX * separationWeight;
    fy += sepY * separationWeight;
    fz += sepZ * separationWeight;

    if (alignCount > 0) {
      fx += (alignVX / alignCount - velocities[i3]) * alignmentWeight;
      fy += (alignVY / alignCount - velocities[i3 + 1]) * alignmentWeight;
      fz += (alignVZ / alignCount - velocities[i3 + 2]) * alignmentWeight;
    }

    if (cohCount > 0) {
      fx += (cohX / cohCount - px) * cohesionWeight;
      fy += (cohY / cohCount - py) * cohesionWeight;
      fz += (cohZ / cohCount - pz) * cohesionWeight;
    }

    if (interactions) {
      computeExternalForce(interactions, px, py, pz, now, _extForce);
      const extMag = Math.sqrt(
        _extForce.x * _extForce.x + _extForce.y * _extForce.y + _extForce.z * _extForce.z,
      );
      if (extMag > 0.01) {
        const suppressFactor = Math.max(0, 1 - extMag * 0.3);
        fx *= suppressFactor;
        fy *= suppressFactor;
        fz *= suppressFactor;
      }
      fx += _extForce.x;
      fy += _extForce.y;
      fz += _extForce.z;
    }

    velocities[i3] += fx * dt;
    velocities[i3 + 1] += fy * dt;
    velocities[i3 + 2] += fz * dt;

    let d = frameDamping;
    if (targetWeight > 0.001 && distToTarget < arrivalRadius * 0.5) {
      const proximityFactor = distToTarget / (arrivalRadius * 0.5);
      d = d * proximityFactor + heavyDamping * (1 - proximityFactor);
    }

    velocities[i3] *= d;
    velocities[i3 + 1] *= d;
    velocities[i3 + 2] *= d;

    const speed = Math.sqrt(
      velocities[i3] * velocities[i3] +
        velocities[i3 + 1] * velocities[i3 + 1] +
        velocities[i3 + 2] * velocities[i3 + 2],
    );
    if (speed > maxSpeed) {
      const s = maxSpeed / speed;
      velocities[i3] *= s;
      velocities[i3 + 1] *= s;
      velocities[i3 + 2] *= s;
      speeds[i] = maxSpeed;
    } else {
      speeds[i] = speed;
    }

    positions[i3] += velocities[i3] * dt;
    positions[i3 + 1] += velocities[i3 + 1] * dt;
    positions[i3 + 2] += velocities[i3 + 2] * dt;
  }
}

export function applyBurstForce(state: SwarmState, strength: number): void {
  const { count, positions, velocities } = state;

  let cx = 0,
    cy = 0,
    cz = 0;
  for (let i = 0; i < count; i++) {
    cx += positions[i * 3];
    cy += positions[i * 3 + 1];
    cz += positions[i * 3 + 2];
  }
  cx /= count;
  cy /= count;
  cz /= count;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    let dx = positions[i3] - cx;
    let dy = positions[i3 + 1] - cy;
    let dz = positions[i3 + 2] - cz;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist > 0.01) {
      dx /= dist;
      dy /= dist;
      dz /= dist;
    } else {
      dx = Math.random() - 0.5;
      dy = Math.random() - 0.5;
      dz = Math.random() - 0.5;
    }
    velocities[i3] += (dx + (Math.random() - 0.5) * 0.5) * strength;
    velocities[i3 + 1] += (dy + (Math.random() - 0.5) * 0.5) * strength;
    velocities[i3 + 2] += (dz + (Math.random() - 0.5) * 0.5) * strength;
  }
}
