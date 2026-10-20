import type { AssemblyFrame, CompiledAssembly, CompiledSimulation, Joint, LinkageConstraint, NodeRef, SimulationFrame, SimulationScenario, Transform, Vec3 } from '../types/model.ts';
import { createFrame, sampleAssembly } from '../assembly/engine.ts';
import { composeTransformBuffers as compose, relativeTransformBuffers as relative, slerpQuaternionBuffers, transformBuffersEqual, writeTransform } from '../core/transforms.ts';

const EPS = 1e-8;
const ID = Float64Array.of(0, 0, 0, 0, 0, 0, 1, 1, 1, 1);
type Track = { start: number; end: number; initial: number; c: number[] };
type Loop = { source: LinkageConstraint; driver: number; dependent: number[]; links: { a: number; ap: Vec3; b: number; bp: Vec3; length: number }[]; min: number; max: number; atlas: Float64Array; steps: number };
type Motion = { node: number; time: number; pose: Float64Array };
type Event = { source: SimulationScenario['objectEvents'][number]; node: number; parent: number; pose: Float64Array; order: Int32Array };
type Binding = { joint: number; jointParent: number; part: number; internal: number; rotorAtZero: Float64Array };
type Drive = { root: number; left: number; right: number; radius: number; track: number; axle: Vec3; initial: Float64Array; times: Float64Array; poses: Float64Array; exact: Uint8Array };
type Engine = {
  compiled: CompiledSimulation; completed: AssemblyFrame; parents: Int32Array; order: Int32Array; rest: Float64Array;
  jointAt: Int32Array; joints: Joint[]; origins: Float64Array; children: Float64Array; tracks: Track[][]; couplingOrder: number[]; couplingDrivers: Int32Array;
  ranges: { min: number; max: number }[]; loops: Loop[]; motions: Motion[][]; events: Event[]; bindings: Binding[];
  internalParent: Int32Array; internalOrder: Int32Array; internalRest: Float64Array; sensors: SimulationScenario['sensorSignals'][]; drive?: Drive;
};
type Scratch = { world: Float64Array; local: Float64Array; parents: Int32Array; q: Float64Array; motion: Float64Array; temp: Float64Array; points: Float64Array; residual: Float64Array; perturbed: Float64Array; jacobian: Float64Array; matrix: Float64Array; delta: Float64Array; internalWorld: Float64Array; internalLocal: Float64Array; drivePose: Float64Array };
type FrameState = { scratch: Scratch; assembly: AssemblyFrame; q: Float64Array; sensors: SimulationFrame['sensorValues']; lanes: unknown[] };
const engines = new WeakMap<CompiledSimulation, Engine>();
const frames = new WeakMap<SimulationFrame, FrameState>();
function fail(message: string): never { throw new Error(`Simulation: ${message}`); }
function finite(value: number, label: string): void { if (!Number.isFinite(value)) fail(`${label} must be finite`); }
function packed(pose: Transform): Float64Array { validatePose(pose); const out = new Float64Array(10); writeTransform(out, 0, pose); return out; }
function validatePose(pose: Transform): void {
  if (!pose || !Array.isArray(pose.position) || !Array.isArray(pose.quaternion) || !Array.isArray(pose.scale) || pose.position.length !== 3 || pose.quaternion.length !== 4 || pose.scale.length !== 3 || ![...pose.position, ...pose.quaternion, ...pose.scale].every(Number.isFinite) || Math.abs(Math.hypot(...pose.quaternion) - 1) > 1e-6 || pose.scale.some((v) => Math.abs(v - 1) > 1e-6)) fail('expected finite normalized rigid transform');
}
function copy(out: Float64Array, oi: number, src: ArrayLike<number>, si = 0): void { for (let k = 0; k < 10; k++) out[oi + k] = src[si + k]; }
function orderOf(parents: Int32Array): Int32Array {
  const state = new Uint8Array(parents.length), result: number[] = [];
  function visit(n: number): void { if (state[n] === 1) fail(`hierarchy cycle at node ${n}`); if (state[n] === 2) return; state[n] = 1; if (parents[n] >= 0) visit(parents[n]); state[n] = 2; result.push(n); }
  for (let n = 0; n < parents.length; n++) visit(n);
  return Int32Array.from(result);
}
function descendant(n: number, ancestor: number, parents: Int32Array): boolean { for (; n >= 0; n = parents[n]) if (n === ancestor) return true; return false; }
function polynomial(track: Track, time: number, derivative = false): number {
  const u = Math.max(0, Math.min(1, (time - track.start) / (track.end - track.start))), c = track.c;
  if (derivative) return (c[1] + u * (2 * c[2] + u * (3 * c[3] + u * 4 * c[4]))) * 1000 / (track.end - track.start);
  return c[0] + u * (c[1] + u * (c[2] + u * (c[3] + u * c[4])));
}
function coordinate(e: Engine, j: number, time: number, derivative = false): number {
  const coupling = e.joints[j].coupling;
  if (coupling) return coordinate(e, e.couplingDrivers[j], time, derivative) * coupling.ratio + (derivative ? 0 : coupling.offset);
  const tracks = e.tracks[j]; let value = e.joints[j].zero;
  for (let k = 0; k < tracks.length; k++) { const t = tracks[k]; if (time < t.start) return derivative ? 0 : value; if (time < t.end) return polynomial(t, time, derivative); value = polynomial(t, t.end); }
  return derivative ? 0 : value;
}
function jointMotion(joint: Joint, q: number, out: Float64Array): void {
  copy(out, 0, ID); const delta = q - joint.zero;
  if (joint.type === 'prismatic') { out[0] = joint.axis[0] * delta; out[1] = joint.axis[1] * delta; out[2] = joint.axis[2] * delta; }
  if (joint.type === 'revolute') { const sine = Math.sin(delta / 2); out[3] = joint.axis[0] * sine; out[4] = joint.axis[1] * sine; out[5] = joint.axis[2] * sine; out[6] = Math.cos(delta / 2); }
}
function scratchFor(e: Engine): Scratch {
  const count = e.parents.length, maxRows = Math.max(1, ...e.loops.map((v) => v.links.length)), maxCols = Math.max(1, ...e.loops.map((v) => v.dependent.length));
  return { world: new Float64Array(count * 10), local: new Float64Array(count * 10), parents: new Int32Array(count), q: new Float64Array(e.joints.length), motion: new Float64Array(10), temp: new Float64Array(40), points: new Float64Array(6), residual: new Float64Array(maxRows), perturbed: new Float64Array(maxRows), jacobian: new Float64Array(maxRows * maxCols), matrix: new Float64Array(maxCols * (maxCols + 1)), delta: new Float64Array(maxCols), internalWorld: new Float64Array(e.internalRest.length), internalLocal: new Float64Array(e.internalRest.length), drivePose: new Float64Array(10) };
}
function evaluate(e: Engine, s: Scratch, order = e.order): void {
  for (let k = 0; k < e.couplingOrder.length; k++) { const j = e.couplingOrder[k], c = e.joints[j].coupling!; s.q[j] = s.q[e.couplingDrivers[j]] * c.ratio + c.offset; }
  for (let k = 0; k < order.length; k++) {
    const n = order[k], p = s.parents[n], ji = e.jointAt[n], offset = n * 10;
    if (ji >= 0) { jointMotion(e.joints[ji], s.q[ji], s.motion); compose(s.temp, 0, e.origins, ji * 10, s.motion, 0); compose(s.temp, 0, s.temp, 0, e.children, ji * 10); if (p >= 0) compose(s.world, offset, s.world, p * 10, s.temp, 0); else copy(s.world, offset, s.temp); }
    else if (p >= 0) compose(s.world, offset, s.world, p * 10, s.local, offset);
    else copy(s.world, offset, s.local, offset);
  }
}
function point(world: Float64Array, node: number, local: Vec3, out: Float64Array, offset: number): void {
  const n = node * 10, x = local[0], y = local[1], z = local[2], qx = world[n + 3], qy = world[n + 4], qz = world[n + 5], qw = world[n + 6];
  const tx = 2 * (qy * z - qz * y), ty = 2 * (qz * x - qx * z), tz = 2 * (qx * y - qy * x);
  out[offset] = world[n] + x + qw * tx + qy * tz - qz * ty;
  out[offset + 1] = world[n + 1] + y + qw * ty + qz * tx - qx * tz;
  out[offset + 2] = world[n + 2] + z + qw * tz + qx * ty - qy * tx;
}
function residual(e: Engine, s: Scratch, loop: Loop, out: Float64Array): number {
  evaluate(e, s); let error = 0;
  for (let i = 0; i < loop.links.length; i++) { const l = loop.links[i]; point(s.world, l.a, l.ap, s.points, 0); point(s.world, l.b, l.bp, s.points, 3); const r = Math.hypot(s.points[0] - s.points[3], s.points[1] - s.points[4], s.points[2] - s.points[5]) - l.length; out[i] = r; error = Math.max(error, Math.abs(r)); }
  return error;
}
function solveLoop(e: Engine, s: Scratch, loop: Loop): void {
  const n = loop.dependent.length, rows = loop.links.length, h = 1e-6, target = Math.min(loop.source.toleranceMm * 0.01, 1e-8);
  for (let iteration = 0; iteration < 40; iteration++) {
    const error = residual(e, s, loop, s.residual);
    // Check rank even at an exact solution: a toggle is not a selectable continuous branch.
    for (let c = 0; c < n; c++) { const j = loop.dependent[c], q = s.q[j]; s.q[j] = q + h; residual(e, s, loop, s.perturbed); s.q[j] = q; for (let r = 0; r < rows; r++) s.jacobian[r * n + c] = (s.perturbed[r] - s.residual[r]) / h; }
    for (let c = 0; c < n; c++) { for (let d = 0; d < n; d++) { let sum = 0; for (let r = 0; r < rows; r++) sum += s.jacobian[r * n + c] * s.jacobian[r * n + d]; s.matrix[c * (n + 1) + d] = sum; } let sum = 0; for (let r = 0; r < rows; r++) sum -= s.jacobian[r * n + c] * s.residual[r]; s.matrix[c * (n + 1) + n] = sum; }
    for (let c = 0; c < n; c++) {
      let pivot = c; for (let r = c + 1; r < n; r++) if (Math.abs(s.matrix[r * (n + 1) + c]) > Math.abs(s.matrix[pivot * (n + 1) + c])) pivot = r;
      if (Math.abs(s.matrix[pivot * (n + 1) + c]) < 1e-11) fail(`linkage ${loop.source.id}: singular reference branch at driver ${s.q[loop.driver]}`);
      for (let d = c; d <= n; d++) { const a = c * (n + 1) + d, b = pivot * (n + 1) + d, value = s.matrix[a]; s.matrix[a] = s.matrix[b]; s.matrix[b] = value; }
      const divisor = s.matrix[c * (n + 1) + c]; for (let d = c; d <= n; d++) s.matrix[c * (n + 1) + d] /= divisor;
      for (let r = 0; r < n; r++) if (r !== c) { const factor = s.matrix[r * (n + 1) + c]; for (let d = c; d <= n; d++) s.matrix[r * (n + 1) + d] -= factor * s.matrix[c * (n + 1) + d]; }
    }
    if (error <= target) { evaluate(e, s); return; }
    let largest = 0; for (let c = 0; c < n; c++) { s.delta[c] = s.matrix[c * (n + 1) + n]; largest = Math.max(largest, Math.abs(s.delta[c])); }
    const scale = largest > 0.2 ? 0.2 / largest : 1;
    for (let c = 0; c < n; c++) s.q[loop.dependent[c]] += s.delta[c] * scale;
  }
  fail(`linkage ${loop.source.id}: unreachable driver ${s.q[loop.driver]} (closure did not converge)`);
}
function bounds(e: Engine, j: number, q: number): void {
  const joint = e.joints[j];
  if (!Number.isFinite(q)) fail(`joint ${joint.id}: coordinate must be finite`);
  if (joint.limits && (q < joint.limits.min - EPS || q > joint.limits.max + EPS)) fail(`joint ${joint.id}: ${q} outside ${joint.limits.basis} limits [${joint.limits.min}, ${joint.limits.max}]`);
}
function sampleMotion(track: Motion[], time: number, out: Float64Array, offset: number): void {
  let a = track[0], b = a;
  for (let k = 1; k < track.length; k++) { b = track[k]; if (time <= b.time) break; a = b; }
  const u = b.time === a.time ? 0 : Math.max(0, Math.min(1, (time - a.time) / (b.time - a.time)));
  for (let k = 0; k < 10; k++) out[offset + k] = a.pose[k] + (b.pose[k] - a.pose[k]) * u;
  slerpQuaternionBuffers(out, offset + 3, a.pose, 3, b.pose, 3, u);
}
function solveLinkedLoops(e: Engine, s: Scratch, count: number): void {
  for (let k = 0; k < count; k++) {
    const loop = e.loops[k], u = loop.max === loop.min ? 0 : (s.q[loop.driver] - loop.min) / (loop.max - loop.min) * loop.steps;
    const index = Math.max(0, Math.min(loop.steps - 1, Math.floor(u))), fraction = Math.max(0, Math.min(1, u - index));
    for (let c = 0; c < loop.dependent.length; c++) s.q[loop.dependent[c]] = loop.atlas[index * loop.dependent.length + c] * (1 - fraction) + loop.atlas[(index + 1) * loop.dependent.length + c] * fraction;
    solveLoop(e, s, loop);
  }
}
function prepare(e: Engine, s: Scratch, time: number): void {
  s.parents.set(e.parents); s.local.set(e.rest);
  for (let j = 0; j < e.joints.length; j++) s.q[j] = coordinate(e, j, time);
  solveLinkedLoops(e, s, e.loops.length);
  for (let k = 0; k < e.couplingOrder.length; k++) { const j = e.couplingOrder[k], c = e.joints[j].coupling!; s.q[j] = s.q[e.couplingDrivers[j]] * c.ratio + c.offset; }
  for (let j = 0; j < e.joints.length; j++) bounds(e, j, s.q[j]);
  for (let n = 0; n < e.motions.length; n++) if (e.motions[n].length) sampleMotion(e.motions[n], time, s.local, n * 10);
  if (e.drive) { drivePose(e, time, s.drivePose); copy(s.local, e.drive.root * 10, s.drivePose); }
  let order = e.order;
  for (let k = 0; k < e.events.length; k++) {
    const event = e.events[k]; if (event.source.timeMs > time) break;
    s.parents[event.node] = event.parent;
    // A released sample may continue its explicit world-space support path.
    if (event.parent >= 0 || !e.motions[event.node].length) copy(s.local, event.node * 10, event.pose);
    else sampleMotion(e.motions[event.node], time, s.local, event.node * 10);
    order = event.order;
  }
  evaluate(e, s, order);
}
const GAUSS_X = [-0.906179845938664, -0.5384693101056831, 0, 0.5384693101056831, 0.906179845938664];
const GAUSS_W = [0.2369268850561891, 0.4786286704993665, 0.5688888888888889, 0.4786286704993665, 0.2369268850561891];
function driveIncrement(e: Engine, d: Drive, a: number, b: number, exact: boolean, out: Float64Array, offset: number): void {
  const l0 = coordinate(e, d.left, a), r0 = coordinate(e, d.right, a), dl = coordinate(e, d.left, b) - l0, dr = coordinate(e, d.right, b) - r0;
  const yaw0 = out[offset + 2], angle = d.radius * (dr - dl) / d.track, travel = d.radius * (dr + dl) / 2;
  if (exact) { if (Math.abs(angle) < 1e-10) { out[offset] -= travel * Math.sin(yaw0); out[offset + 1] -= travel * Math.cos(yaw0); } else { out[offset] += travel / angle * (Math.cos(yaw0 + angle) - Math.cos(yaw0)); out[offset + 1] -= travel / angle * (Math.sin(yaw0 + angle) - Math.sin(yaw0)); } }
  else for (let k = 0; k < 5; k++) { const time = (a + b) / 2 + GAUSS_X[k] * (b - a) / 2, yaw = yaw0 + d.radius * (coordinate(e, d.right, time) - r0 - coordinate(e, d.left, time) + l0) / d.track, v = d.radius * (coordinate(e, d.left, time, true) + coordinate(e, d.right, time, true)) / 2, weight = GAUSS_W[k] * (b - a) / 2000; out[offset] -= v * Math.sin(yaw) * weight; out[offset + 1] -= v * Math.cos(yaw) * weight; }
  out[offset + 2] = yaw0 + angle;
}
function drivePose(e: Engine, time: number, out: Float64Array): void {
  const d = e.drive!; let lo = 0, hi = d.times.length - 1;
  while (lo + 1 < hi) { const mid = (lo + hi) >>> 1; if (d.times[mid] <= time) lo = mid; else hi = mid; }
  out[0] = d.poses[lo * 3]; out[1] = d.poses[lo * 3 + 1]; out[2] = d.poses[lo * 3 + 2];
  driveIncrement(e, d, d.times[lo], time, !!d.exact[lo], out, 0);
  const x = out[0], z = out[1], yaw = out[2], cosine = Math.cos(yaw), sine = Math.sin(yaw);
  copy(out, 0, ID);
  out[0] = x + d.axle[0] - cosine * d.axle[0] - sine * d.axle[2];
  out[2] = z + d.axle[2] + sine * d.axle[0] - cosine * d.axle[2];
  out[4] = Math.sin(yaw / 2); out[6] = Math.cos(yaw / 2);
  compose(out, 0, d.initial, 0, out, 0);
}
function internalTransforms(e: Engine, s: Scratch): void {
  s.internalLocal.set(e.internalRest);
  for (let k = 0; k < e.internalOrder.length; k++) {
    const i = e.internalOrder[k], parent = e.internalParent[i];
    if (parent >= 0) compose(s.internalWorld, i * 10, s.internalWorld, parent * 10, s.internalLocal, i * 10); else copy(s.internalWorld, i * 10, s.internalLocal, i * 10);
    for (let b = 0; b < e.bindings.length; b++) {
      const binding = e.bindings[b]; if (binding.internal !== i) continue;
      const ji = binding.joint, joint = e.joints[ji], jointParent = binding.jointParent;
      compose(s.temp, 0, s.world, jointParent * 10, e.origins, ji * 10);
      if (joint.internalBinding!.movingSide === 'rotor') { jointMotion(joint, s.q[ji], s.motion); compose(s.temp, 0, s.temp, 0, s.motion, 0); }
      compose(s.temp, 0, s.temp, 0, binding.rotorAtZero, 0);
      relative(s.internalWorld, i * 10, s.world, binding.part * 10, s.temp, 0);
      if (parent >= 0) relative(s.internalLocal, i * 10, s.internalWorld, parent * 10, s.internalWorld, i * 10); else copy(s.internalLocal, i * 10, s.internalWorld, i * 10);
    }
  }
}
function lanes(frame: AssemblyFrame): unknown[] { return [frame.transforms, frame.subassemblyTransforms, frame.internalTransforms, frame.environmentTransforms, frame.environmentVisible, frame.installed, frame.active, frame.visible, frame.connected, frame.counts]; }

export function compileSimulation(assembly: CompiledAssembly, input: SimulationScenario): CompiledSimulation {
  // Snapshot logs: callers may author a replacement scenario, never mutate an active replay.
  const scenario = structuredClone(input), model = assembly.model, completed = sampleAssembly(assembly, assembly.durationMs, createFrame(assembly));
  if (scenario.fidelity !== 'deterministic-kinematics') fail('unsupported simulation fidelity');
  finite(scenario.durationMs, 'duration'); if (scenario.durationMs < 0) fail('duration must be nonnegative');
  if (completed.counts.robotInstalled !== completed.counts.robotTotal || completed.counts.sampleInstalled !== completed.counts.sampleTotal || completed.counts.stepsComplete !== completed.counts.stepsTotal) fail('assembly is not complete');
  const np = model.parts.length, ns = model.subassemblies.length, props = model.simulationObjects ?? [], count = np + ns + props.length;
  const nodeMap = new Map<string, number>(); model.parts.forEach((p, i) => nodeMap.set(`part:${p.id}`, i)); model.subassemblies.forEach((p, i) => nodeMap.set(`subassembly:${p.id}`, np + i));
  const node = (ref: NodeRef): number => { const n = nodeMap.get(`${ref.kind}:${ref.id}`); if (n === undefined) fail(`unknown ${ref.kind} '${ref.id}'`); return n; };
  const sub = (id: string): number => node({ kind: 'subassembly', id });
  const parents = new Int32Array(count).fill(-1), world = new Float64Array(count * 10), rest = new Float64Array(count * 10);
  world.set(completed.transforms); world.set(completed.subassemblyTransforms, np * 10); world.set(completed.environmentTransforms, (np + ns) * 10);
  model.parts.forEach((p, i) => { if (p.subassemblyId) parents[i] = sub(p.subassemblyId); });
  model.subassemblies.forEach((p, i) => { if (p.parentId) parents[np + i] = sub(p.parentId); });
  const changes = model.operations.flatMap((op, i) => (op.parentChanges ?? []).map((change) => ({ change, time: assembly.stepTimes.find((s) => s.stepId === op.stepId)!.startMs + op.startMs + op.durationMs, i })));
  changes.sort((a, b) => a.time - b.time || a.i - b.i); for (const { change } of changes) parents[node(change.node)] = change.toParent ? node(change.toParent) : -1;
  orderOf(parents);
  for (let n = 0; n < count; n++) { if (parents[n] >= 0) relative(rest, n * 10, world, parents[n] * 10, world, n * 10); else copy(rest, n * 10, world, n * 10); }
  const joints = structuredClone(model.joints), jointIds = new Map<string, number>(); joints.forEach((j, i) => { if (jointIds.has(j.id)) fail(`duplicate joint ${j.id}`); jointIds.set(j.id, i); });
  const jid = (id: string): number => { const n = jointIds.get(id); if (n === undefined) fail(`unknown joint '${id}'`); return n; };
  const jointAt = new Int32Array(count).fill(-1), origins = new Float64Array(joints.length * 10), children = new Float64Array(joints.length * 10);
  joints.forEach((j, i) => {
    if (!['fixed', 'revolute', 'prismatic'].includes(j.type)) fail(`joint ${j.id}: unknown joint type`);
    const child = node(j.child), parent = node(j.parent); if (jointAt[child] >= 0) fail(`multiple joints own ${j.child.id}`); if (child === parent) fail(`joint ${j.id} owns its parent`);
    finite(j.zero, `joint ${j.id} zero`); if (j.axis.length !== 3 || !j.axis.every(Number.isFinite) || Math.abs(Math.hypot(...j.axis) - 1) > 1e-6) fail(`joint ${j.id}: normalized finite axis required`);
    writeTransform(origins, i * 10, packedPose(j.origin)); writeTransform(children, i * 10, packedPose(j.childTransform));
    if (j.limits) { finite(j.limits.min, `${j.id} min`); finite(j.limits.max, `${j.id} max`); if (j.limits.min > j.limits.max || !['modeled', 'physical'].includes(j.limits.basis)) fail(`${j.id}: invalid classified limits`); if (j.limits.basis === 'physical' && (!j.limits.evidence.sources.length || !['documented', 'measured'].includes(j.limits.evidence.category))) fail(`${j.id}: physical limits require documented/measurement evidence`); }
    if (j.maxSpeed) { finite(j.maxSpeed.value, `${j.id} speed`); if (j.maxSpeed.value <= 0 || !['modeled', 'physical'].includes(j.maxSpeed.basis)) fail(`${j.id}: invalid speed limit`); if (j.maxSpeed.basis === 'physical' && (!j.maxSpeed.evidence.sources.length || !['documented', 'measured'].includes(j.maxSpeed.evidence.category))) fail(`${j.id}: physical speed requires evidence`); }
    parents[child] = parent; jointAt[child] = i;
  });
  const outputDevices = new Set(scenario.sensorSignals.filter((s) => s.type === 'light' && s.basis === 'documented-output').map((s) => s.sensorPartInstanceId));
  const compiled: CompiledSimulation = Object.freeze({ assembly, scenario, jointIds: Object.freeze(joints.map((j) => j.id)), sensorPartIds: Object.freeze(model.parts.filter((p) => p.category === 'sensor' || p.category === 'controller' && outputDevices.has(p.id)).map((p) => p.id)) });
  const e: Engine = { compiled, completed, parents, order: orderOf(parents), rest, jointAt, joints, origins, children, tracks: joints.map(() => []), couplingOrder: [], couplingDrivers: new Int32Array(joints.length).fill(-1), ranges: joints.map((j) => ({ min: j.zero, max: j.zero })), loops: [], motions: Array.from({ length: count }, () => []), events: [], bindings: [], internalParent: new Int32Array(assembly.internalNodes.length).fill(-1), internalOrder: new Int32Array(), internalRest: completed.internalTransforms.slice(), sensors: compiled.sensorPartIds.map(() => []) };
  const passive = new Set<number>();
  for (const loop of model.linkageConstraints) for (const id of loop.dependentJointIds) { const i = jid(id); if (passive.has(i)) fail(`joint ${id}: multiple linkage owners`); passive.add(i); }
  const coordinateParent = new Int32Array(joints.length).fill(-1), dependencyState = new Uint8Array(joints.length), dependencyRank = new Int32Array(joints.length);
  joints.forEach((j, i) => { if (j.coupling) coordinateParent[i] = jid(j.coupling.driverJointId); });
  for (const loop of model.linkageConstraints) for (const id of loop.dependentJointIds) {
    const i = jid(id); if (coordinateParent[i] >= 0) fail(`joint ${id}: both coupling and loop owner`);
    coordinateParent[i] = jid(loop.driverJointId);
  }
  function coordinateVisit(i: number): void {
    if (dependencyState[i] === 1) fail(`coupling cycle or linkage coordinate cycle at ${joints[i].id}`);
    if (dependencyState[i] === 2) return;
    dependencyState[i] = 1;
    if (coordinateParent[i] >= 0) { coordinateVisit(coordinateParent[i]); dependencyRank[i] = dependencyRank[coordinateParent[i]] + 1; }
    dependencyState[i] = 2;
  }
  for (let i = 0; i < joints.length; i++) coordinateVisit(i);
  const motorIds = new Map(model.motors.map((m) => [m.id, m]));
  const bindingByMotor = new Map<string, number>();
  for (const motor of model.motors) {
    const matches = joints.map((j, i) => ({ j, i })).filter(({ j }) => j.drivenByMotorId === motor.id);
    if (motor.jointId) matches.push({ j: joints[jid(motor.jointId)], i: jid(motor.jointId) });
    const ids = [...new Set(matches.map(({ i }) => i))]; if (ids.length > 1) fail(`motor ${motor.id}: conflicting joint bindings`);
    if (ids.length) { const ji = ids[0]; if (joints[ji].drivenByMotorId && joints[ji].drivenByMotorId !== motor.id) fail(`motor ${motor.id}: conflicting joint owner`); if ([...bindingByMotor.values()].includes(ji)) fail(`joint ${joints[ji].id}: multiple motors`); bindingByMotor.set(motor.id, ji); }
  }
  for (const j of joints) if (j.drivenByMotorId && !motorIds.has(j.drivenByMotorId)) fail(`joint ${j.id}: unknown motor`);
  const commands = [...scenario.motorCommands].sort((a, b) => a.startMs - b.startMs);
  const peakSpeeds = new Float64Array(joints.length);
  for (const c of commands) {
    const ji = bindingByMotor.get(c.motorId); if (ji === undefined) fail(`motor '${c.motorId}': unknown/unassigned physical joint binding`); const j = joints[ji];
    if (motorIds.get(c.motorId)!.assignmentEvidence.category === 'unknown') fail(`motor ${c.motorId}: unresolved physical-axis assignment`);
    if (j.type === 'fixed' || j.coupling || passive.has(ji)) fail(`joint ${j.id}: cannot command fixed/coupled/passive coordinate`);
    for (const v of [c.startMs, c.durationMs, c.from, c.to]) finite(v, `command ${c.motorId}`);
    if (c.startMs < 0 || c.durationMs <= 0 || c.startMs + c.durationMs > scenario.durationMs) fail(`command ${c.motorId}: invalid interval`);
    if (!['position', 'speed'].includes(c.mode) || !['linear', 'smoothstep'].includes(c.easing)) fail(`command ${c.motorId}: unsupported mode/easing`);
    const unit = j.type === 'revolute' ? 'rad' : 'mm'; if (c.unit !== unit + (c.mode === 'speed' ? '/s' : '')) fail(`command ${c.motorId}: expected ${unit}${c.mode === 'speed' ? '/s' : ''}, received ${c.unit}`);
    const tracks = e.tracks[ji], previous = tracks[tracks.length - 1], initial = previous ? polynomial(previous, previous.end) : j.zero;
    if (previous && c.startMs < previous.end) fail(`joint ${j.id}: overlapping commands`);
    if (c.mode === 'position' && Math.abs(c.from - initial) > EPS) fail(`joint ${j.id}: discontinuous position command (expected from ${initial})`);
    const delta = c.to - c.from, seconds = c.durationMs / 1000;
    const coefficients = c.mode === 'position' ? c.easing === 'linear' ? [c.from, delta, 0, 0, 0] : [c.from, 0, 3 * delta, -2 * delta, 0] : c.easing === 'linear' ? [initial, seconds * c.from, seconds * delta / 2, 0, 0] : [initial, seconds * c.from, 0, seconds * delta, -seconds * delta / 2];
    const track = { start: c.startMs, end: c.startMs + c.durationMs, initial, c: coefficients }; tracks.push(track);
    const candidates = [0, 1]; if (c.mode === 'speed' && c.from * c.to < 0) { let low = 0, high = 1; for (let k = 0; k < 50; k++) { const mid = (low + high) / 2, speed = polynomial(track, track.start + mid * c.durationMs, true); if (speed * c.from > 0) low = mid; else high = mid; } candidates.push((low + high) / 2); }
    for (const u of candidates) { const q = polynomial(track, track.start + u * c.durationMs); bounds(e, ji, q); e.ranges[ji].min = Math.min(e.ranges[ji].min, q); e.ranges[ji].max = Math.max(e.ranges[ji].max, q); }
    const speed = c.mode === 'position' ? Math.abs(delta) / seconds * (c.easing === 'smoothstep' ? 1.5 : 1) : Math.max(Math.abs(c.from), Math.abs(c.to)); if (j.maxSpeed && speed > j.maxSpeed.value + EPS) fail(`joint ${j.id}: exceeds ${j.maxSpeed.basis} max speed ${j.maxSpeed.value}`);
    finite(speed, `joint ${j.id} derived speed`);
    peakSpeeds[ji] = Math.max(peakSpeeds[ji], speed);
  }
  const couplingState = new Uint8Array(joints.length);
  function couplingVisit(i: number): void {
    if (couplingState[i] === 1) fail(`coupling cycle at ${joints[i].id}`);
    if (couplingState[i] === 2) return;
    couplingState[i] = 1; const c = joints[i].coupling;
    if (c) {
      finite(c.ratio, 'coupling ratio'); finite(c.offset, 'coupling offset');
      if (passive.has(i) || joints[i].type === 'fixed') fail(`${joints[i].id}: invalid coupled coordinate`);
      const d = jid(c.driverJointId); e.couplingDrivers[i] = d; couplingVisit(d); e.couplingOrder.push(i);
      if (Math.abs(joints[i].zero - (joints[d].zero * c.ratio + c.offset)) > EPS) fail(`joint ${joints[i].id}: coupling does not preserve declared zero`);
      const a = e.ranges[d].min * c.ratio + c.offset, b = e.ranges[d].max * c.ratio + c.offset;
      e.ranges[i] = { min: Math.min(a, b), max: Math.max(a, b) };
      peakSpeeds[i] = peakSpeeds[d] * Math.abs(c.ratio);
      finite(peakSpeeds[i], `joint ${joints[i].id} coupled speed`);
      if (joints[i].maxSpeed && peakSpeeds[i] > joints[i].maxSpeed!.value + EPS) fail(`joint ${joints[i].id}: coupling exceeds ${joints[i].maxSpeed!.basis} max speed`);
    }
    couplingState[i] = 2;
  }
  for (let i = 0; i < joints.length; i++) couplingVisit(i);
  for (let i = 0; i < joints.length; i++) { bounds(e, i, e.ranges[i].min); bounds(e, i, e.ranges[i].max); }
  let s = scratchFor(e); s.parents.set(parents); s.local.set(rest); joints.forEach((j, i) => { s.q[i] = j.zero; }); evaluate(e, s);
  for (let n = 0; n < count; n++) if (!transformBuffersEqual(s.world, n * 10, world, n * 10, 1e-4)) fail(`joint zero/rest pose disagrees with completed hierarchy at node ${n}`);
  const remaining = [...model.linkageConstraints].sort((a, b) => dependencyRank[jid(a.driverJointId)] - dependencyRank[jid(b.driverJointId)]);
  while (remaining.length) {
    const source = structuredClone(remaining.shift()!), driver = jid(source.driverJointId), dependent = source.dependentJointIds.map(jid);
    if (source.branch !== 'reference-continuous' || !dependent.length || new Set([driver, ...dependent]).size !== dependent.length + 1 || source.referenceJointValues.length !== dependent.length + 1 || !source.referenceJointValues.every(Number.isFinite)) fail(`linkage ${source.id}: referenceJointValues must be [driver, ...dependentJointIds] without duplicate joints`);
    if (source.links.length < dependent.length || !Number.isFinite(source.toleranceMm) || source.toleranceMm <= 0 || source.planeNormal.length !== 3 || !source.planeNormal.every(Number.isFinite) || Math.abs(Math.hypot(...source.planeNormal) - 1) > 1e-6) fail(`linkage ${source.id}: invalid constraints/tolerance/plane`);
    for (const i of [driver, ...dependent]) if (joints[i].type !== 'revolute') fail(`linkage ${source.id}: planar closure requires revolute joints`);
    bounds(e, driver, source.referenceJointValues[0]);
    const range = e.ranges[driver], min = Math.min(range.min, source.referenceJointValues[0]), max = Math.max(range.max, source.referenceJointValues[0]), steps = Math.max(1, Math.ceil((max - min) / 0.005));
    if (steps > 8192) fail(`linkage ${source.id}: branch atlas exceeds 8192 intervals; split the operating range`);
    const loop: Loop = { source, driver, dependent, links: source.links.map((l) => { if (!Number.isFinite(l.lengthMm) || l.lengthMm <= 0 || ![...l.a.point, ...l.b.point].every(Number.isFinite)) fail(`linkage ${source.id}: invalid local anchors/length`); return { a: node(l.a.node), ap: l.a.point, b: node(l.b.node), bp: l.b.point, length: l.lengthMm }; }), min, max, steps, atlas: new Float64Array((steps + 1) * dependent.length) };
    e.loops.push(loop); s = scratchFor(e); s.parents.set(parents); s.local.set(rest); joints.forEach((j, i) => { s.q[i] = j.zero; }); s.q[driver] = source.referenceJointValues[0]; dependent.forEach((j, k) => { s.q[j] = source.referenceJointValues[k + 1]; bounds(e, j, s.q[j]); });
    solveLinkedLoops(e, s, e.loops.length - 1);
    if (residual(e, s, loop, s.residual) > source.toleranceMm) fail(`linkage ${source.id}: reference branch does not close`);
    evaluate(e, s); let planeOffset: number | undefined;
    for (const link of loop.links) for (const endpoint of [{ n: link.a, p: link.ap }, { n: link.b, p: link.bp }]) { point(s.world, endpoint.n, endpoint.p, s.points, 0); const offset = s.points[0] * source.planeNormal[0] + s.points[1] * source.planeNormal[1] + s.points[2] * source.planeNormal[2]; if (planeOffset === undefined) planeOffset = offset; else if (Math.abs(offset - planeOffset) > source.toleranceMm) fail(`linkage ${source.id}: anchors are not coplanar`); }
    for (const i of [driver, ...dependent]) {
      const j = joints[i]; compose(s.temp, 0, s.world, node(j.parent) * 10, origins, i * 10);
      point(s.temp, 0, j.axis, s.points, 0);
      const alignment = (s.points[0] - s.temp[0]) * source.planeNormal[0] + (s.points[1] - s.temp[1]) * source.planeNormal[1] + (s.points[2] - s.temp[2]) * source.planeNormal[2];
      if (Math.abs(Math.abs(alignment) - 1) > 1e-5) fail(`linkage ${source.id}: joint axes must be parallel to declared plane normal`);
    }
    const ref = source.referenceJointValues[0], middle = max === min ? 0 : Math.round((ref - min) / (max - min) * steps);
    for (const direction of [1, -1]) {
      dependent.forEach((j, k) => { s.q[j] = source.referenceJointValues[k + 1]; }); s.q[driver] = ref; solveLinkedLoops(e, s, e.loops.length - 1); solveLoop(e, s, loop);
      for (let index = middle; index >= 0 && index <= steps; index += direction) { s.q[driver] = min + (max - min) * index / steps; solveLinkedLoops(e, s, e.loops.length - 1); solveLoop(e, s, loop); dependent.forEach((j, k) => { bounds(e, j, s.q[j]); loop.atlas[index * dependent.length + k] = s.q[j]; e.ranges[j].min = Math.min(e.ranges[j].min, s.q[j]); e.ranges[j].max = Math.max(e.ranges[j].max, s.q[j]); }); }
    }
    // Check every atlas interval interior as well as its endpoints before accepting a branch.
    for (let index = 0; index < steps; index++) for (const u of [0.25, 0.5, 0.75]) {
      s.q[driver] = min + (max - min) * (index + u) / steps;
      dependent.forEach((j, k) => { s.q[j] = loop.atlas[index * dependent.length + k] * (1 - u) + loop.atlas[(index + 1) * dependent.length + k] * u; });
      solveLinkedLoops(e, s, e.loops.length - 1);
      solveLoop(e, s, loop);
      dependent.forEach((j) => { bounds(e, j, s.q[j]); e.ranges[j].min = Math.min(e.ranges[j].min, s.q[j]); e.ranges[j].max = Math.max(e.ranges[j].max, s.q[j]); });
    }
    for (const j of e.couplingOrder) {
      const c = joints[j].coupling!, d = e.couplingDrivers[j], a = e.ranges[d].min * c.ratio + c.offset, b = e.ranges[d].max * c.ratio + c.offset;
      e.ranges[j] = { min: Math.min(a, b), max: Math.max(a, b) };
      bounds(e, j, e.ranges[j].min); bounds(e, j, e.ranges[j].max);
    }
  }
  // Internal asset hierarchy has its own parent-local lane, never extra inventory units.
  assembly.internalNodes.forEach((entry, i) => { const part = model.parts[node({ kind: 'part', id: entry.partInstanceId })], asset = model.geometryAssets.find((a) => a.id === part.geometryId)!, definition = asset.internalNodes!.find((n) => n.id === entry.geometryNodeId)!; if (definition.parentId) { const p = assembly.internalNodes.findIndex((n) => n.partInstanceId === entry.partInstanceId && n.geometryNodeId === definition.parentId); if (p < 0) fail(`internal node ${definition.id}: unknown parent`); e.internalParent[i] = p; } });
  e.internalOrder = orderOf(e.internalParent); const internalZero = new Float64Array(e.internalRest.length);
  for (const i of e.internalOrder) { const p = e.internalParent[i]; if (p < 0) copy(internalZero, i * 10, e.internalRest, i * 10); else compose(internalZero, i * 10, internalZero, p * 10, e.internalRest, i * 10); }
  joints.forEach((j, ji) => {
    const b = j.internalBinding; if (!b) return;
    const part = node({ kind: 'part', id: b.partInstanceId }), internal = assembly.internalNodes.findIndex((n) => n.partInstanceId === b.partInstanceId && n.geometryNodeId === b.geometryNodeId);
    if (internal < 0 || e.bindings.some((v) => v.internal === internal) || j.type !== 'revolute' || !['body', 'rotor'].includes(b.movingSide)) fail(`joint ${j.id}: missing/conflicting real rotor node binding`);
    const child = node(j.child), parent = node(j.parent);
    if (b.movingSide === 'body' ? !descendant(part, child, parents) : descendant(part, child, parents) || !descendant(part, parent, parents)) fail(`joint ${j.id}: ${b.movingSide} binding contradicts body hierarchy`);
    const zero = new Float64Array(30);
    compose(zero, 0, world, parent * 10, origins, ji * 10); compose(zero, 10, world, part * 10, internalZero, internal * 10); relative(zero, 20, zero, 0, zero, 10);
    e.bindings.push({ joint: ji, jointParent: parent, part, internal, rotorAtZero: zero.slice(20, 30) });
  });
  for (const m of scenario.rootMotion) { finite(m.timeMs, 'root motion time'); const n = node(m.node); if (parents[n] >= 0 || jointAt[n] >= 0 || m.timeMs < 0 || m.timeMs > scenario.durationMs) fail(`root motion ${m.node.id}: requires free root and in-range time`); e.motions[n].push({ node: n, time: m.timeMs, pose: packed(m.transform) }); }
  for (let n = 0; n < count; n++) { const track = e.motions[n]; track.sort((a, b) => a.time - b.time); if (track.length && (track[0].time !== 0 || !transformBuffersEqual(track[0].pose, 0, world, n * 10))) fail(`root motion node ${n}: must start continuously at completed pose, time zero`); for (let k = 1; k < track.length; k++) if (track[k].time === track[k - 1].time) fail('duplicate root motion timestamps'); }
  if (scenario.differentialDrive) {
    const d = scenario.differentialDrive, root = sub(d.rootSubassemblyId), left = jid(d.leftJointId), right = jid(d.rightJointId);
    if (left === right || parents[root] >= 0 || jointAt[root] >= 0 || e.motions[root].length || [left, right].some((j) => joints[j].type !== 'revolute' || passive.has(j) || !descendant(node(joints[j].child), root, parents))) fail('differential drive requires distinct real revolute wheels under a free root; no simultaneous rootMotion');
    if (![d.wheelRadiusMm, d.trackWidthMm].every((v) => Number.isFinite(v) && v > 0)) fail('differential drive requires positive finite radius/track');
    const initial = packed(d.initialTransform); if (!transformBuffersEqual(initial, 0, world, root * 10)) fail('differential drive initial pose teleports completed root');
    if (Math.abs(initial[3]) > 1e-6 || Math.abs(initial[5]) > 1e-6) fail('differential drive initial root must be Y-up (yaw rotation only)');
    for (const ji of [left, right]) for (let n = node(joints[ji].parent); n !== root && n >= 0; n = parents[n]) if (jointAt[n] >= 0 && joints[jointAt[n]].type !== 'fixed') fail('wheel axle must be rigidly mounted to the drive root');
    const zero = new Float64Array(40), centers: number[] = [];
    for (const j of [left, right]) { compose(zero, 0, world, node(joints[j].parent) * 10, origins, j * 10); relative(zero, 10, initial, 0, zero, 0); centers.push(zero[10], zero[11], zero[12]); const a = joints[j].axis; zero[20] = a[0]; zero[21] = a[1]; zero[22] = a[2]; zero[23] = 0; zero[24] = 0; zero[25] = 0; zero[26] = 1; zero[27] = zero[28] = zero[29] = 1; compose(zero, 30, zero, 10, zero, 20); const dx = zero[30] - zero[10], dy = zero[31] - zero[11], dz = zero[32] - zero[12]; if (Math.abs(dx + 1) > 1e-5 || Math.abs(dy) > 1e-5 || Math.abs(dz) > 1e-5) fail('positive wheel coordinate must rotate about root-local -X for forward -Z'); }
    if (!d.axleCenterInRoot || d.axleCenterInRoot.length !== 3 || !d.axleCenterInRoot.every(Number.isFinite) || d.axleCenterInRoot.some((v, i) => Math.abs(v - (centers[i] + centers[i + 3]) / 2) > 1e-3)) fail('drive axleCenterInRoot must equal actual wheel joint midpoint');
    if (Math.abs(Math.abs(centers[3] - centers[0]) - d.trackWidthMm) > 1e-3 || Math.abs(centers[1] - centers[4]) > 1e-3 || Math.abs(centers[2] - centers[5]) > 1e-3 || centers[0] >= centers[3]) fail('drive track/left-right assignment disagrees with actual wheel joint centers');
    // ponytail: bounded 1ms compile grid, five-point Gauss quadrature; finer/adaptive quadrature if calibrated error demands it.
    if (scenario.durationMs > 200000) fail('drive integration grid exceeds 200000 intervals (200s); split the scenario');
    const times = new Set<number>([0, scenario.durationMs]); for (let t = 1; t < scenario.durationMs; t++) times.add(t); for (const tracks of e.tracks) for (const t of tracks) { times.add(t.start); times.add(t.end); } if (times.size > 200001) fail('drive integration grid exceeds 200000 intervals; split the scenario');
    const sorted = [...times].sort((a, b) => a - b), drive: Drive = { root, left, right, radius: d.wheelRadiusMm, track: d.trackWidthMm, axle: [...d.axleCenterInRoot], initial, times: Float64Array.from(sorted), poses: new Float64Array(sorted.length * 3), exact: new Uint8Array(sorted.length) }; e.drive = drive;
    for (let k = 0; k + 1 < sorted.length; k++) {
      const a = sorted[k], b = sorted[k + 1]; let vlReference = 0, vrReference = 0, magnitude = 0;
      for (let p = 0; p < 5; p++) {
        const t = a + (b - a) * (p + 0.5) / 5, vl = coordinate(e, left, t, true), vr = coordinate(e, right, t, true);
        if (Math.hypot(vl, vr) > magnitude) { vlReference = vl; vrReference = vr; magnitude = Math.hypot(vl, vr); }
      }
      let exact = true;
      for (let p = 0; p < 5; p++) {
        const t = a + (b - a) * (p + 0.5) / 5, vl = coordinate(e, left, t, true), vr = coordinate(e, right, t, true);
        if (Math.abs(vl * vrReference - vr * vlReference) > 1e-12 * Math.max(1, Math.abs(vl * vrReference), Math.abs(vr * vlReference))) exact = false;
      }
      drive.exact[k] = Number(exact);
      for (let c = 0; c < 3; c++) drive.poses[(k + 1) * 3 + c] = drive.poses[k * 3 + c];
      driveIncrement(e, drive, a, b, exact, drive.poses, (k + 1) * 3);
      for (let c = 0; c < 3; c++) finite(drive.poses[(k + 1) * 3 + c], 'derived drive pose');
    }
  }
  for (const signal of scenario.sensorSignals) {
    const index = compiled.sensorPartIds.indexOf(signal.sensorPartInstanceId);
    if (index < 0) fail(`signal targets non-sensor/output device '${signal.sensorPartInstanceId}'`);
    finite(signal.timeMs, 'signal time');
    if (!['color', 'distance', 'button', 'light'].includes(signal.type) || !['scripted-input', 'geometric-model', 'documented-output'].includes(signal.basis)) fail('unknown signal type/basis');
    if (signal.timeMs < 0 || signal.timeMs > scenario.durationMs || typeof signal.value === 'number' && !Number.isFinite(signal.value)) fail('invalid signal time/value');
    if (!['string', 'number', 'boolean'].includes(typeof signal.value)) fail('signal value must be string, number or boolean');
    if (signal.type === 'distance' && (typeof signal.value !== 'number' || signal.value < 0) || signal.type === 'button' && typeof signal.value !== 'boolean' || signal.type === 'color' && typeof signal.value !== 'string') fail('signal value has wrong type/unit');
    e.sensors[index].push(signal);
  }
  for (const signals of e.sensors) { signals.sort((a, b) => a.timeMs - b.timeMs); for (let k = 1; k < signals.length; k++) if (signals[k].timeMs === signals[k - 1].timeMs) fail('ambiguous simultaneous sensor signals; one held channel per sensor'); }
  s = scratchFor(e);
  const eventParents = parents.slice(), held = new Set<number>();
  for (const source of [...scenario.objectEvents].sort((a, b) => a.timeMs - b.timeMs)) {
    finite(source.timeMs, 'object event time'); if (source.timeMs < 0 || source.timeMs > scenario.durationMs) fail('object event outside scenario');
    const prop = assembly.simulationObjectIds.indexOf(source.objectSubassemblyId), n = prop >= 0 ? np + ns + prop : sub(source.objectSubassemblyId);
    if (prop < 0 && (!model.parts.some((p, i) => descendant(i, n, parents) && p.inventoryScope === 'sample') || model.parts.some((p, i) => descendant(i, n, parents) && p.inventoryScope !== 'sample'))) fail(`object ${source.objectSubassemblyId}: only nonempty declared samples/props can attach`);
    if (e.events.some((event) => event.node === n && event.source.timeMs === source.timeMs)) fail('overlapping object events');
    const parent = source.parent ? node(source.parent) : -1, capture = source.capture;
    if (source.action === 'attach' ? parent < 0 || held.has(n) : source.action !== 'release' || parent >= 0 || !held.has(n)) fail(`object ${source.objectSubassemblyId}: invalid attach/release state`);
    if (!capture || capture.contacts.length < 2 || ![capture.maxGapMm, capture.poseToleranceMm, capture.angleToleranceRad].every((v) => Number.isFinite(v) && v >= 0) || capture.angleToleranceRad > Math.PI) fail('capture requires >=2 local contact pairs and finite gap/pose/angular tolerances');
    prepare(e, s, source.timeMs); const pose = packed(source.transform), current = s.world;
    if (parent >= 0) compose(s.temp, 10, current, parent * 10, pose, 0); else copy(s.temp, 10, pose);
    const distance = Math.hypot(current[n * 10] - s.temp[10], current[n * 10 + 1] - s.temp[11], current[n * 10 + 2] - s.temp[12]), dot = Math.abs(current[n * 10 + 3] * s.temp[13] + current[n * 10 + 4] * s.temp[14] + current[n * 10 + 5] * s.temp[15] + current[n * 10 + 6] * s.temp[16]);
    if (distance > capture.poseToleranceMm + EPS || 2 * Math.acos(Math.min(1, dot)) > capture.angleToleranceRad + EPS) fail(`object ${source.objectSubassemblyId}: event would teleport pose`);
    if (source.action === 'release' && e.motions[n].length) {
      const key = e.motions[n].find((entry) => entry.time === source.timeMs);
      if (!key || !transformBuffersEqual(key.pose, 0, pose, 0, EPS)) fail(`object ${source.objectSubassemblyId}: release support path needs a matching world-pose keyframe`);
    }
    const distinct = new Set<string>(), holderDistinct = new Set<string>();
    for (const contact of capture.contacts) {
      const holder = node(contact.holder), receiver = source.action === 'attach' ? parent : s.parents[n];
      if (contact.holderPoint.length !== 3 || contact.objectPoint.length !== 3 || ![...contact.holderPoint, ...contact.objectPoint].every(Number.isFinite)) fail('capture contact must be finite local geometry');
      if (descendant(holder, n, s.parents) || !descendant(holder, receiver, s.parents)) fail('capture holder must belong to actual receiving subtree, not object');
      point(current, holder, contact.holderPoint, s.points, 0); point(current, n, contact.objectPoint, s.points, 3);
      if (Math.hypot(s.points[0] - s.points[3], s.points[1] - s.points[4], s.points[2] - s.points[5]) > capture.maxGapMm + EPS) fail(`object ${source.objectSubassemblyId}: capture contact gap exceeds ${capture.maxGapMm}mm`);
      point(s.temp, 1, contact.objectPoint, s.points, 3);
      if (Math.hypot(s.points[0] - s.points[3], s.points[1] - s.points[4], s.points[2] - s.points[5]) > capture.maxGapMm + EPS) fail(`object ${source.objectSubassemblyId}: proposed event pose breaks capture contact gap`);
      distinct.add(contact.objectPoint.join(',')); holderDistinct.add(`${holder}:${contact.holderPoint.join(',')}`);
    }
    if (distinct.size < 2 || holderDistinct.size < 2) fail('capture needs two distinct object and holder contact points');
    eventParents[n] = parent; const order = orderOf(eventParents); e.events.push({ source, node: n, parent, pose, order }); if (source.action === 'attach') held.add(n); else held.delete(n);
  }
  freezeLog(scenario);
  engines.set(compiled, e); return compiled;
}
function packedPose(pose: Transform): Transform { validatePose(pose); return pose; }
function freezeLog(value: unknown): void {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return;
  for (const child of Object.values(value)) freezeLog(child);
  Object.freeze(value);
}
export function createSimulationFrame(compiled: CompiledSimulation): SimulationFrame {
  const e = engines.get(compiled); if (!e) fail('unknown compilation; use compileSimulation()');
  const frame: SimulationFrame = { compiled, timeMs: 0, assembly: createFrame(compiled.assembly), jointValues: new Float64Array(e.joints.length), sensorValues: Array(e.sensors.length).fill(null) };
  frames.set(frame, { scratch: scratchFor(e), assembly: frame.assembly, q: frame.jointValues, sensors: frame.sensorValues, lanes: lanes(frame.assembly) }); return sampleSimulation(compiled, 0, frame);
}
export function sampleSimulation(compiled: CompiledSimulation, timeMs: number, out: SimulationFrame): SimulationFrame {
  finite(timeMs, 'sample time'); const e = engines.get(compiled), state = frames.get(out);
  if (!e || !state || out.compiled !== compiled || state.assembly !== out.assembly || state.q !== out.jointValues || state.sensors !== out.sensorValues || out.sensorValues.length !== e.sensors.length) fail('foreign or modified simulation frame; use createSimulationFrame(compiled)');
  const a = out.assembly, registered = state.lanes;
  if (a.compiled !== compiled.assembly || a.transforms !== registered[0] || a.subassemblyTransforms !== registered[1] || a.internalTransforms !== registered[2] || a.environmentTransforms !== registered[3] || a.environmentVisible !== registered[4] || a.installed !== registered[5] || a.active !== registered[6] || a.visible !== registered[7] || a.connected !== registered[8] || a.counts !== registered[9]) fail('modified assembly output buffers');
  const completed = e.completed;
  if (out.jointValues.length !== e.joints.length || a.transforms.length !== completed.transforms.length || a.subassemblyTransforms.length !== completed.subassemblyTransforms.length || a.internalTransforms.length !== completed.internalTransforms.length || a.environmentTransforms.length !== completed.environmentTransforms.length || a.environmentVisible.length !== completed.environmentVisible.length || a.installed.length !== completed.installed.length || a.active.length !== completed.active.length || a.visible.length !== completed.visible.length || a.connected.length !== completed.connected.length) fail('detached or resized simulation output buffers');
  const time = Math.max(0, Math.min(compiled.scenario.durationMs, timeMs)), s = state.scratch;
  // All potentially failing constraints run on private scratch before any observable write.
  prepare(e, s, time); internalTransforms(e, s);
  for (let k = 0; k < s.world.length; k++) if (!Number.isFinite(s.world[k])) fail(`nonfinite derived world transform at lane ${k}`);
  for (let k = 0; k < s.internalLocal.length; k++) if (!Number.isFinite(s.internalLocal[k])) fail(`nonfinite derived internal transform at lane ${k}`);
  const done = e.completed;
  a.timeMs = done.timeMs; a.stepIndex = done.stepIndex;
  a.installed.set(done.installed); a.active.set(done.active); a.visible.set(done.visible); a.connected.set(done.connected);
  Object.assign(a.counts, done.counts);
  for (let k = 0; k < a.transforms.length; k++) a.transforms[k] = s.world[k];
  const partOffset = a.transforms.length; for (let k = 0; k < a.subassemblyTransforms.length; k++) a.subassemblyTransforms[k] = s.world[partOffset + k];
  const propOffset = partOffset + a.subassemblyTransforms.length; for (let k = 0; k < a.environmentTransforms.length; k++) a.environmentTransforms[k] = s.world[propOffset + k];
  a.environmentVisible.fill(1); a.internalTransforms.set(s.internalLocal); out.jointValues.set(s.q);
  for (let i = 0; i < e.sensors.length; i++) { const signals = e.sensors[i]; out.sensorValues[i] = null; for (let k = 0; k < signals.length && signals[k].timeMs <= time; k++) out.sensorValues[i] = signals[k].value; }
  out.timeMs = time; return out;
}
