import type { Quaternion, Transform, Vec3 } from '../types/model.ts';

export function identityTransform(): Transform {
  return { position: [0, 0, 0], quaternion: [0, 0, 0, 1], scale: [1, 1, 1] };
}

export function quaternionMultiply(a: Quaternion, b: Quaternion): Quaternion {
  return [
    a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
    a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
    a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
    a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
  ];
}

export function quaternionFromAxisAngle(axis: Vec3, radians: number): Quaternion {
  const length = Math.hypot(...axis);
  if (!Number.isFinite(radians) || !Number.isFinite(length) || length === 0) throw new Error('Invalid axis-angle');
  const sine = Math.sin(radians / 2) / length;
  return [axis[0] * sine, axis[1] * sine, axis[2] * sine, Math.cos(radians / 2)];
}

/** Writes a shortest-path, normalized quaternion without allocating scratch arrays. */
export function slerpQuaternionBuffers(out: Float64Array, offset: number, a: ArrayLike<number>, ai: number, b: ArrayLike<number>, bi: number, u: number): void {
  let dot = a[ai] * b[bi] + a[ai + 1] * b[bi + 1] + a[ai + 2] * b[bi + 2] + a[ai + 3] * b[bi + 3];
  const sign = dot < 0 ? -1 : 1;
  dot = Math.min(1, Math.abs(dot));
  let left = 1 - u, right = u;
  if (dot < 0.9995) {
    const angle = Math.acos(dot), sine = Math.sin(angle);
    left = Math.sin((1 - u) * angle) / sine;
    right = Math.sin(u * angle) / sine;
  }
  const x = left * a[ai] + right * sign * b[bi];
  const y = left * a[ai + 1] + right * sign * b[bi + 1];
  const z = left * a[ai + 2] + right * sign * b[bi + 2];
  const w = left * a[ai + 3] + right * sign * b[bi + 3];
  const length = Math.hypot(x, y, z, w);
  out[offset] = x / length; out[offset + 1] = y / length;
  out[offset + 2] = z / length; out[offset + 3] = w / length;
}

export function quaternionSlerp(a: Quaternion, b: Quaternion, u: number): Quaternion {
  const out = new Float64Array(4);
  slerpQuaternionBuffers(out, 0, a, 0, b, 0, u);
  return [out[0], out[1], out[2], out[3]];
}

export function writeTransform(out: Float64Array, offset: number, transform: Transform): void {
  out.set(transform.position, offset); out.set(transform.quaternion, offset + 3); out.set(transform.scale, offset + 7);
}

export function readTransform(buffer: ArrayLike<number>, offset = 0): Transform {
  return {
    position: [buffer[offset], buffer[offset + 1], buffer[offset + 2]],
    quaternion: [buffer[offset + 3], buffer[offset + 4], buffer[offset + 5], buffer[offset + 6]],
    scale: [buffer[offset + 7], buffer[offset + 8], buffer[offset + 9]]
  };
}

/** TRS composition; callers must not compose shear-producing nonuniform scaled rotations. */
export function composeTransformBuffers(out: Float64Array, oi: number, parent: ArrayLike<number>, pi: number, local: ArrayLike<number>, li: number): void {
  const px = parent[pi + 3], py = parent[pi + 4], pz = parent[pi + 5], pw = parent[pi + 6];
  const lx = local[li + 3], ly = local[li + 4], lz = local[li + 5], lw = local[li + 6];
  const x = local[li] * parent[pi + 7], y = local[li + 1] * parent[pi + 8], z = local[li + 2] * parent[pi + 9];
  const tx = 2 * (py * z - pz * y), ty = 2 * (pz * x - px * z), tz = 2 * (px * y - py * x);
  const sx = parent[pi + 7] * local[li + 7], sy = parent[pi + 8] * local[li + 8], sz = parent[pi + 9] * local[li + 9];
  const ox = parent[pi] + x + pw * tx + py * tz - pz * ty;
  const oy = parent[pi + 1] + y + pw * ty + pz * tx - px * tz;
  const oz = parent[pi + 2] + z + pw * tz + px * ty - py * tx;
  const qx = pw * lx + px * lw + py * lz - pz * ly;
  const qy = pw * ly - px * lz + py * lw + pz * lx;
  const qz = pw * lz + px * ly - py * lx + pz * lw;
  const qw = pw * lw - px * lx - py * ly - pz * lz;
  const length = Math.hypot(qx, qy, qz, qw);
  out[oi] = ox; out[oi + 1] = oy; out[oi + 2] = oz;
  out[oi + 3] = qx / length; out[oi + 4] = qy / length; out[oi + 5] = qz / length; out[oi + 6] = qw / length;
  out[oi + 7] = sx; out[oi + 8] = sy; out[oi + 9] = sz;
}

export function relativeTransformBuffers(out: Float64Array, oi: number, parent: ArrayLike<number>, pi: number, world: ArrayLike<number>, wi: number): void {
  const px = -parent[pi + 3], py = -parent[pi + 4], pz = -parent[pi + 5], pw = parent[pi + 6];
  const x = world[wi] - parent[pi], y = world[wi + 1] - parent[pi + 1], z = world[wi + 2] - parent[pi + 2];
  const tx = 2 * (py * z - pz * y), ty = 2 * (pz * x - px * z), tz = 2 * (px * y - py * x);
  const lx = world[wi + 3], ly = world[wi + 4], lz = world[wi + 5], lw = world[wi + 6];
  const sx = world[wi + 7] / parent[pi + 7], sy = world[wi + 8] / parent[pi + 8], sz = world[wi + 9] / parent[pi + 9];
  const ox = (x + pw * tx + py * tz - pz * ty) / parent[pi + 7];
  const oy = (y + pw * ty + pz * tx - px * tz) / parent[pi + 8];
  const oz = (z + pw * tz + px * ty - py * tx) / parent[pi + 9];
  const qx = pw * lx + px * lw + py * lz - pz * ly;
  const qy = pw * ly - px * lz + py * lw + pz * lx;
  const qz = pw * lz + px * ly - py * lx + pz * lw;
  const qw = pw * lw - px * lx - py * ly - pz * lz;
  const length = Math.hypot(qx, qy, qz, qw);
  out[oi] = ox; out[oi + 1] = oy; out[oi + 2] = oz;
  out[oi + 3] = qx / length; out[oi + 4] = qy / length; out[oi + 5] = qz / length; out[oi + 6] = qw / length;
  out[oi + 7] = sx; out[oi + 8] = sy; out[oi + 9] = sz;
}

export function composeTransforms(parent: Transform, local: Transform): Transform {
  const buffer = new Float64Array(30);
  writeTransform(buffer, 0, parent); writeTransform(buffer, 10, local);
  composeTransformBuffers(buffer, 20, buffer, 0, buffer, 10);
  return readTransform(buffer, 20);
}

export function relativeTransform(parent: Transform, world: Transform): Transform {
  const buffer = new Float64Array(30);
  writeTransform(buffer, 0, parent); writeTransform(buffer, 10, world);
  relativeTransformBuffers(buffer, 20, buffer, 0, buffer, 10);
  return readTransform(buffer, 20);
}

export function transformBuffersEqual(a: ArrayLike<number>, ai: number, b: ArrayLike<number>, bi: number, tolerance = 1e-5): boolean {
  for (let i = 0; i < 10; i++) {
    if (!Number.isFinite(a[ai + i]) || !Number.isFinite(b[bi + i])) return false;
    if (i < 3 || i > 6) if (Math.abs(a[ai + i] - b[bi + i]) > tolerance) return false;
  }
  let same = 0, opposite = 0;
  for (let i = 3; i < 7; i++) {
    same += (a[ai + i] - b[bi + i]) ** 2;
    opposite += (a[ai + i] + b[bi + i]) ** 2;
  }
  return Math.min(same, opposite) <= tolerance * tolerance;
}

export function transformsEqual(a: Transform, b: Transform, tolerance = 1e-5): boolean {
  const buffer = new Float64Array(20);
  writeTransform(buffer, 0, a); writeTransform(buffer, 10, b);
  return transformBuffersEqual(buffer, 0, buffer, 10, tolerance);
}
