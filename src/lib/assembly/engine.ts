import type {
  AssemblyFrame, AssemblyOperation, CompiledAssembly, MotionStage, NodeRef,
  RobotModel, StepTime, Transform
} from '../types/model.ts';
import {
  composeTransformBuffers, quaternionFromAxisAngle, quaternionMultiply,
  relativeTransformBuffers, slerpQuaternionBuffers, transformBuffersEqual, writeTransform
} from '../core/transforms.ts';

const EPS = 1e-5;
type Track = {
  node: number; operation: number; start: number; end: number; stage: MotionStage;
  from: Float64Array; to: Float64Array; spinEndBase: Float64Array;
};
type Operation = { source: AssemblyOperation; start: number; end: number; parts: number[] };
type Epoch = { time: number; parents: Int32Array; local: Float64Array; tracks: Int32Array; order: Int32Array };
type Engine = {
  epochs: Epoch[]; tracks: Track[]; operations: Operation[]; stepById: Map<string, StepTime>;
  installedAt: Float64Array; visibility: { part: number; time: number; visible: number }[];
  connectionAt: Float64Array; internalDefaults: Float64Array; scopes: Uint8Array; fasteners: Uint8Array;
  environmentDefaults: Float64Array;
  nodeCount: number; robotTotal: number; sampleTotal: number; fastenersTotal: number;
};
const engines = new WeakMap<CompiledAssembly, Engine>();
type FrameStorage = Pick<AssemblyFrame,
  'transforms' | 'subassemblyTransforms' | 'internalTransforms' | 'environmentTransforms' | 'environmentVisible' |
  'installed' | 'active' | 'visible' | 'connected' | 'counts'> & { world: Float64Array };
const scratch = new WeakMap<AssemblyFrame, FrameStorage>();

function fail(model: RobotModel, message: string): never { throw new Error(`Assembly ${model.id}: ${message}`); }
function requireEngine(compiled: CompiledAssembly): Engine {
  const engine = engines.get(compiled);
  if (!engine) throw new Error('Unknown compiled assembly; use compileAssembly()');
  return engine;
}
function finiteTime(time: number, duration: number): number {
  if (!Number.isFinite(time)) throw new Error(`Assembly time must be finite, received ${time}`);
  return Math.max(0, Math.min(duration, time));
}
function indexById<T extends { id: string }>(model: RobotModel, values: readonly T[], label: string): Map<string, number> {
  const result = new Map<string, number>();
  values.forEach((value, index) => {
    if (!value.id || result.has(value.id)) fail(model, `duplicate or empty ${label} ID '${value.id}'`);
    result.set(value.id, index);
  });
  return result;
}
function unique(model: RobotModel, ids: readonly string[], label: string): void {
  if (new Set(ids).size !== ids.length) fail(model, `${label} has duplicate references`);
}
function transform(model: RobotModel, value: Transform, label: string, asset = false): void {
  if (!value || !Array.isArray(value.position) || !Array.isArray(value.quaternion) || !Array.isArray(value.scale) ||
      value.position.length !== 3 || value.quaternion.length !== 4 || value.scale.length !== 3 ||
      ![...value.position, ...value.quaternion, ...value.scale].every(Number.isFinite)) fail(model, `${label}: invalid transform`);
  if (Math.abs(Math.hypot(...value.quaternion) - 1) > 1e-6) fail(model, `${label}: quaternion must be normalized`);
  if (value.scale.some((v) => asset ? v <= 0 : Math.abs(v - 1) > 1e-6)) fail(model, `${label}: ${asset ? 'positive' : 'unit'} scale required`);
}
function vector(model: RobotModel, value: readonly number[], label: string): void {
  if (!Array.isArray(value) || value.length !== 3 || !value.every(Number.isFinite)) fail(model, `${label}: expected a finite xyz vector`);
}
function axis(model: RobotModel, value: readonly number[], label: string): void {
  vector(model, value, label);
  if (Math.abs(Math.hypot(...value) - 1) > 1e-6) fail(model, `${label}: axis must be normalized`);
}
function packed(value: Transform): Float64Array { const out = new Float64Array(10); writeTransform(out, 0, value); return out; }
function copyPose(out: Float64Array, oi: number, source: ArrayLike<number>, si: number): void {
  for (let k = 0; k < 10; k++) out[oi + k] = source[si + k];
}
function hierarchyOrder(model: RobotModel, parents: Int32Array, label: string): Int32Array {
  const state = new Uint8Array(parents.length), order: number[] = [];
  function visit(node: number): void {
    if (state[node] === 1) fail(model, `${label}: parent cycle at node ${node}`);
    if (state[node] === 2) return;
    state[node] = 1;
    if (parents[node] >= 0) visit(parents[node]);
    state[node] = 2; order.push(node);
  }
  for (let n = 0; n < parents.length; n++) visit(n);
  return Int32Array.from(order);
}
function descendant(node: number, ancestor: number, parents: Int32Array): boolean {
  for (let n = node; n >= 0; n = parents[n]) if (n === ancestor) return true;
  return false;
}
function sampleTrack(track: Track, time: number, out: Float64Array, offset: number): void {
  const from = track.from, to = track.to;
  if (time <= track.start) { copyPose(out, offset, from, 0); return; }
  if (time >= track.end) { copyPose(out, offset, to, 0); return; }
  let u = (time - track.start) / (track.end - track.start);
  if (track.stage.easing === 'smoothstep') u = u * u * (3 - 2 * u);
  const trajectory = track.stage.trajectory;
  for (let k = 0; k < 3; k++) {
    out[offset + k] = trajectory.type === 'linear' ? from[k] + (to[k] - from[k]) * u :
      (1 - u) ** 3 * from[k] + 3 * (1 - u) ** 2 * u * trajectory.control1[k] +
      3 * (1 - u) * u * u * trajectory.control2[k] + u ** 3 * to[k];
    out[offset + 7 + k] = from[7 + k] + (to[7 + k] - from[7 + k]) * u;
  }
  slerpQuaternionBuffers(out, offset + 3, from, 3, track.spinEndBase, 3, u);
  if (track.stage.spin) {
    const spin = track.stage.spin, angle = Math.PI * spin.turns * u, sine = Math.sin(angle);
    const x = spin.axis[0] * sine, y = spin.axis[1] * sine, z = spin.axis[2] * sine, w = Math.cos(angle);
    const qx = out[offset + 3], qy = out[offset + 4], qz = out[offset + 5], qw = out[offset + 6];
    out[offset + 3] = w * qx + x * qw + y * qz - z * qy;
    out[offset + 4] = w * qy - x * qz + y * qw + z * qx;
    out[offset + 5] = w * qz + x * qy - y * qx + z * qw;
    out[offset + 6] = w * qw - x * qx - y * qy - z * qz;
  }
}
function evaluate(epoch: Epoch, tracks: Track[], time: number, world: Float64Array): void {
  for (let k = 0; k < epoch.order.length; k++) {
    const n = epoch.order[k], parent = epoch.parents[n], track = epoch.tracks[n];
    if (track >= 0) sampleTrack(tracks[track], time, world, n * 10);
    else if (parent >= 0) composeTransformBuffers(world, n * 10, world, parent * 10, epoch.local, n * 10);
    else copyPose(world, n * 10, epoch.local, n * 10);
  }
}
function epochAt(engine: Engine, time: number): Epoch {
  let lo = 0, hi = engine.epochs.length;
  while (lo + 1 < hi) { const mid = (lo + hi) >>> 1; if (engine.epochs[mid].time <= time) lo = mid; else hi = mid; }
  return engine.epochs[lo];
}
function stepIndexAt(steps: readonly StepTime[], time: number): number {
  if (!steps.length) return -1;
  let lo = 0, hi = steps.length;
  while (lo + 1 < hi) { const mid = (lo + hi) >>> 1; if (steps[mid].startMs <= time) lo = mid; else hi = mid; }
  return lo;
}

export function compileAssembly(model: RobotModel): CompiledAssembly {
  if (model.schemaVersion !== 1) fail(model, 'unsupported schema version');
  const parts = indexById(model, model.parts, 'part'), subs = indexById(model, model.subassemblies, 'subassembly');
  const steps = indexById(model, model.steps, 'step'), ops = indexById(model, model.operations, 'operation');
  const assets = indexById(model, model.geometryAssets, 'geometry'), materials = indexById(model, model.materials, 'material');
  const docs = indexById(model, model.sourceDocuments, 'source document'), connections = indexById(model, model.connections, 'connection');
  const joints = indexById(model, model.joints, 'joint'), motors = indexById(model, model.motors, 'motor');
  indexById(model, model.cables, 'cable'); indexById(model, model.inventory, 'inventory');
  indexById(model, model.milestones, 'milestone'); indexById(model, model.scenarios, 'scenario');
  indexById(model, model.linkageConstraints, 'linkage constraint');
  const simulationObjects = model.simulationObjects ?? [], objects = indexById(model, simulationObjects, 'simulation object');
  const environmentDefaults = new Float64Array(simulationObjects.length * 10);
  simulationObjects.forEach((object, n) => {
    if (parts.has(object.id) || subs.has(object.id)) fail(model, `simulation object ${object.id}: ID collides with assembly node`);
    if (!assets.has(object.geometryId)) fail(model, `simulation object ${object.id}: unknown geometry '${object.geometryId}'`);
    if (!materials.has(object.materialId)) fail(model, `simulation object ${object.id}: unknown material '${object.materialId}'`);
    transform(model, object.initialTransform, `simulation object ${object.id} initial`);
    writeTransform(environmentDefaults, n * 10, object.initialTransform);
  });
  const seen = new WeakSet<object>();
  function validateData(value: unknown, label: string): void {
    if (typeof value === 'number' && !Number.isFinite(value)) fail(model, `${label}: number must be finite`);
    if (!value || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value);
    const record = value as Record<string, unknown>;
    if ('confidence' in record && (typeof record.confidence !== 'number' || record.confidence < 0 || record.confidence > 1)) fail(model, `${label}: confidence outside [0,1]`);
    if ('documentId' in record) {
      if (typeof record.documentId !== 'string' || !docs.has(record.documentId)) fail(model, `${label}: unknown source document '${record.documentId}'`);
      if (typeof record.sourceUrl !== 'string' || !record.sourceUrl) fail(model, `${label}: missing source URL`);
      if (record.page !== undefined) {
        const page = record.page as number, doc = model.sourceDocuments[docs.get(record.documentId)!];
        if (!Number.isInteger(page) || page < 1 || (doc.pageCount !== undefined && page > doc.pageCount)) fail(model, `${label}: invalid source page ${page}`);
      }
    }
    for (const [key, child] of Object.entries(record)) validateData(child, `${label}.${key}`);
  }
  validateData(model, model.id);
  function partId(id: string, label: string): number {
    const n = parts.get(id); if (n === undefined) fail(model, `${label}: unknown part '${id}'`); return n;
  }
  function nodeId(ref: NodeRef, label: string): number {
    if (!ref) fail(model, `${label}: missing node reference`);
    if (ref.kind === 'part') return partId(ref.id, label);
    if (ref.kind !== 'subassembly' || !subs.has(ref.id)) fail(model, `${label}: unknown node '${ref.id}'`);
    return model.parts.length + subs.get(ref.id)!;
  }
  function parentId(ref: NodeRef | null, label: string): number { return ref === null ? -1 : nodeId(ref, label); }
  function camera(preset: NonNullable<AssemblyOperation['cameraPreset']>, label: string): void {
    vector(model, preset.position, `${label} camera position`); vector(model, preset.target, `${label} camera target`); vector(model, preset.up, `${label} camera up`);
    if (Math.hypot(...preset.up) < EPS || !['perspective', 'orthographic'].includes(preset.projection) ||
      !Number.isFinite(preset.framing) || preset.framing <= 0 || !Number.isFinite(preset.transitionMs) ||
      (preset.projection === 'perspective' && preset.framing >= 180) || preset.transitionMs < 0) fail(model, `${label}: invalid camera preset`);
  }
  const internalNodes: { partInstanceId: string; geometryNodeId: string }[] = [], defaults: number[] = [];
  for (const asset of model.geometryAssets) {
    transform(model, asset.nativeToScene, `geometry ${asset.id}`, true);
    unique(model, asset.dependencyIds, `geometry ${asset.id} dependencies`);
    const bundledSources = new Set(asset.attribution.map((entry) => entry.sourcePath));
    for (const id of asset.dependencyIds) {
      if (asset.format === 'mpd' ? !bundledSources.has(id) : !assets.has(id)) fail(model, `geometry ${asset.id}: missing ${asset.format === 'mpd' ? 'bundled attribution for dependency' : 'dependency'} '${id}'`);
    }
    for (const slot of asset.materialSlots) if (slot.materialId && !materials.has(slot.materialId)) fail(model, `geometry ${asset.id}: unknown material '${slot.materialId}'`);
    const nodes = asset.internalNodes ?? [], ids = indexById(model, nodes, `geometry ${asset.id} internal node`);
    const parents = new Int32Array(nodes.length).fill(-1);
    nodes.forEach((node, i) => {
      transform(model, node.localTransform, `geometry ${asset.id} node ${node.id}`);
      if (node.parentId !== undefined) {
        if (!ids.has(node.parentId)) fail(model, `geometry ${asset.id}: unknown internal parent '${node.parentId}'`);
        parents[i] = ids.get(node.parentId)!;
      }
    });
    hierarchyOrder(model, parents, `geometry ${asset.id}`);
  }
  // Packed MPD dependencies are internal source paths, not independently loaded assets.
  const assetState = new Uint8Array(model.geometryAssets.length);
  function assetVisit(n: number): void {
    if (assetState[n] === 1) fail(model, `geometry dependency cycle at '${model.geometryAssets[n].id}'`);
    if (assetState[n] === 2) return;
    assetState[n] = 1;
    if (model.geometryAssets[n].format !== 'mpd') for (const id of model.geometryAssets[n].dependencyIds) assetVisit(assets.get(id)!);
    assetState[n] = 2;
  }
  model.geometryAssets.forEach((_, n) => assetVisit(n));
  const nodeCount = model.parts.length + model.subassemblies.length;
  const parents = new Int32Array(nodeCount).fill(-1), local = new Float64Array(nodeCount * 10), world = new Float64Array(nodeCount * 10);
  const pointIds: Map<string, number>[] = [];
  model.parts.forEach((part, n) => {
    if (!assets.has(part.geometryId)) fail(model, `part ${part.id}: unknown geometry '${part.geometryId}'`);
    if (!materials.has(part.materialId)) fail(model, `part ${part.id}: unknown material '${part.materialId}'`);
    if (!Number.isFinite(part.geometryConfidence) || part.geometryConfidence < 0 || part.geometryConfidence > 1) fail(model, `part ${part.id}: geometry confidence outside [0,1]`);
    if (!['robot', 'sample'].includes(part.inventoryScope)) fail(model, `part ${part.id}: invalid inventory scope`);
    transform(model, part.initialTransform, `part ${part.id} initial`); transform(model, part.finalTransform, `part ${part.id} final`);
    pointIds.push(indexById(model, part.connectionPoints, `part ${part.id} connection point`));
    part.connectionPoints.forEach((point) => transform(model, point.localTransform, `part ${part.id} connection ${point.id}`));
    if (part.subassemblyId !== undefined) {
      if (!subs.has(part.subassemblyId)) fail(model, `part ${part.id}: unknown subassembly '${part.subassemblyId}'`);
      parents[n] = model.parts.length + subs.get(part.subassemblyId)!;
    }
    for (const node of model.geometryAssets[assets.get(part.geometryId)!].internalNodes ?? []) {
      internalNodes.push({ partInstanceId: part.id, geometryNodeId: node.id });
      defaults.push(...node.localTransform.position, ...node.localTransform.quaternion, ...node.localTransform.scale);
    }
  });
  model.subassemblies.forEach((sub, i) => {
    const n = model.parts.length + i;
    transform(model, sub.localTransform, `subassembly ${sub.id}`); writeTransform(local, n * 10, sub.localTransform);
    unique(model, sub.partInstanceIds, `subassembly ${sub.id} parts`); unique(model, sub.childSubassemblyIds, `subassembly ${sub.id} children`);
    if (sub.parentId !== undefined) {
      if (!subs.has(sub.parentId)) fail(model, `subassembly ${sub.id}: unknown parent '${sub.parentId}'`);
      parents[n] = model.parts.length + subs.get(sub.parentId)!;
    }
    for (const id of sub.partInstanceIds) if (model.parts[partId(id, `subassembly ${sub.id}`)].subassemblyId !== sub.id) fail(model, `subassembly ${sub.id}: nonreciprocal part '${id}'`);
    for (const id of sub.childSubassemblyIds) if (!subs.has(id) || model.subassemblies[subs.get(id)!].parentId !== sub.id) fail(model, `subassembly ${sub.id}: nonreciprocal child '${id}'`);
  });
  model.parts.forEach((part) => {
    if (part.subassemblyId !== undefined && !model.subassemblies[subs.get(part.subassemblyId)!].partInstanceIds.includes(part.id)) fail(model, `part ${part.id}: absent from structural parent`);
  });
  model.subassemblies.forEach((sub) => {
    if (sub.parentId !== undefined && !model.subassemblies[subs.get(sub.parentId)!].childSubassemblyIds.includes(sub.id)) fail(model, `subassembly ${sub.id}: absent from structural parent`);
  });
  let order = hierarchyOrder(model, parents, 'initial hierarchy');
  for (const n of order) {
    if (n < model.parts.length) {
      writeTransform(world, n * 10, model.parts[n].initialTransform);
      if (parents[n] >= 0) relativeTransformBuffers(local, n * 10, world, parents[n] * 10, world, n * 10);
      else copyPose(local, n * 10, world, n * 10);
    } else if (parents[n] >= 0) composeTransformBuffers(world, n * 10, world, parents[n] * 10, local, n * 10);
    else copyPose(world, n * 10, local, n * 10);
  }
  const stepTimes: StepTime[] = [], stepById = new Map<string, StepTime>();
  let durationMs = 0;
  model.steps.forEach((step, index) => {
    if (!Number.isFinite(step.durationMs) || step.durationMs <= 0) fail(model, `step ${step.id}: duration must be positive and finite`);
    if (!step.sourceReferences.length && step.kind !== 'presentation') fail(model, `step ${step.id}: missing source references`);
    if (!step.operationIds.length) fail(model, `step ${step.id}: no operation covers this step`);
    unique(model, step.operationIds, `step ${step.id} operations`); unique(model, step.requiredPartInstanceIds, `step ${step.id} required parts`);
    step.requiredPartInstanceIds.forEach((id) => partId(id, `step ${step.id}`));
    if (step.cameraPreset) camera(step.cameraPreset, `step ${step.id}`);
    const timing = Object.freeze({ stepId: step.id, index, startMs: durationMs, endMs: durationMs + step.durationMs });
    if (!Number.isFinite(timing.endMs)) fail(model, `step ${step.id}: timeline overflow`);
    durationMs = timing.endMs; stepTimes.push(timing); stepById.set(step.id, timing);
    for (const id of step.operationIds) if (!ops.has(id) || model.operations[ops.get(id)!].stepId !== step.id) fail(model, `step ${step.id}: invalid operation '${id}'`);
  });
  const operations: Operation[] = [], tracks: Track[] = [], eventTimes = new Set<number>([0, durationMs]);
  const stageIds = new Set<string>();
  model.operations.forEach((op, oi) => {
    const step = stepById.get(op.stepId);
    if (!step || !model.steps[step.index].operationIds.includes(op.id)) fail(model, `operation ${op.id}: missing reciprocal step '${op.stepId}'`);
    if (!Number.isFinite(op.startMs) || !Number.isFinite(op.durationMs) || op.startMs < 0 || op.durationMs <= 0 || op.startMs + op.durationMs > step.endMs - step.startMs) fail(model, `operation ${op.id}: invalid timing`);
    if (!['linear', 'smoothstep'].includes(op.easing)) fail(model, `operation ${op.id}: unsupported easing '${op.easing}'`);
    if (!['insert', 'slide', 'rotate', 'fasten', 'align', 'attach', 'connect', 'merge-subassemblies'].includes(op.operationType)) fail(model, `operation ${op.id}: unsupported operation type '${op.operationType}'`);
    unique(model, op.partInstanceIds, `operation ${op.id} parts`); unique(model, op.dependencies, `operation ${op.id} dependencies`);
    if (op.fromTransforms.length !== op.partInstanceIds.length || op.toTransforms.length !== op.partInstanceIds.length) fail(model, `operation ${op.id}: endpoint arrays do not match participants`);
    op.fromTransforms.forEach((pose, i) => transform(model, pose, `operation ${op.id} from ${op.partInstanceIds[i]}`));
    op.toTransforms.forEach((pose, i) => transform(model, pose, `operation ${op.id} to ${op.partInstanceIds[i]}`));
    if (op.cameraPreset) camera(op.cameraPreset, `operation ${op.id}`);
    const operation = { source: op, start: step.startMs + op.startMs, end: step.startMs + op.startMs + op.durationMs, parts: op.partInstanceIds.map((id) => partId(id, `operation ${op.id}`)) };
    operations.push(operation); eventTimes.add(operation.start); eventTimes.add(operation.end);
    const view = model.steps[step.index].action === 'view';
    if (view && (op.operationType !== 'align' || op.partInstanceIds.length || op.stages.length || op.parentChanges.length ||
      !op.sourceReference || op.evidence.placement !== 'presentation-only' || !(op.cameraPreset ?? model.steps[step.index].cameraPreset))) fail(model, `operation ${op.id}: view steps require a source-linked, camera-only presentation align`);
    if (!view && !op.stages.length && !op.parentChanges.length && !model.connections.some((connection) => connection.installedByOperationId === op.id)) fail(model, `operation ${op.id}: no physical or connection effect`);
    if (!view && !op.partInstanceIds.length) fail(model, `operation ${op.id}: missing physical participants`);
    let previousStart = -1;
    for (const stage of op.stages) {
      if (!stage.id || stageIds.has(stage.id)) fail(model, `operation ${op.id}: duplicate or empty stage '${stage.id}'`);
      stageIds.add(stage.id);
      if (!Number.isFinite(stage.startMs) || !Number.isFinite(stage.durationMs) || stage.startMs < 0 || stage.startMs < previousStart || stage.durationMs <= 0 || stage.startMs + stage.durationMs > op.durationMs) fail(model, `operation ${op.id} stage ${stage.id}: invalid timing/order`);
      previousStart = stage.startMs;
      if (!stage.nodes.length || stage.nodes.length !== stage.fromTransforms.length || stage.nodes.length !== stage.toTransforms.length) fail(model, `stage ${stage.id}: node/endpoint arrays mismatch`);
      if (!['linear', 'smoothstep'].includes(stage.easing) || !['linear', 'cubic-bezier'].includes(stage.trajectory.type)) fail(model, `stage ${stage.id}: unsupported trajectory/easing`);
      if (!['approach', 'align', 'insert', 'fasten', 'settle', 'transfer'].includes(stage.phase)) fail(model, `stage ${stage.id}: unsupported phase '${stage.phase}'`);
      if (stage.trajectory.type === 'cubic-bezier') {
        vector(model, stage.trajectory.control1, `stage ${stage.id} control1`); vector(model, stage.trajectory.control2, `stage ${stage.id} control2`);
      }
      if (stage.insertion) {
        axis(model, stage.insertion.axis, `stage ${stage.id} insertion`);
        if (!Number.isFinite(stage.insertion.depthMm) || stage.insertion.depthMm < 0) fail(model, `stage ${stage.id}: insertion depth must be finite and nonnegative`);
      }
      if (stage.spin) {
        axis(model, stage.spin.axis, `stage ${stage.id} spin`);
        if (!Number.isFinite(stage.spin.turns)) fail(model, `stage ${stage.id}: spin turns must be finite`);
      }
      const moving = new Set<number>();
      // Keep one immutable-by-ownership stage copy, shared by its compiled node tracks.
      const source = structuredClone(stage);
      stage.nodes.forEach((node, i) => {
        const n = nodeId(node, `stage ${stage.id}`);
        if (moving.has(n)) fail(model, `stage ${stage.id}: duplicate node '${node.id}'`); moving.add(n);
        transform(model, stage.fromTransforms[i], `stage ${stage.id} from ${node.id}`); transform(model, stage.toTransforms[i], `stage ${stage.id} to ${node.id}`);
        const from = packed(stage.fromTransforms[i]), to = packed(stage.toTransforms[i]), spinEndBase = to.slice();
        if (stage.insertion) {
          for (let k = 0; k < 3; k++) if (Math.abs(to[k] - from[k] - stage.insertion.axis[k] * stage.insertion.depthMm) > EPS) fail(model, `stage ${stage.id}: insertion axis/depth disagree with endpoints`);
          if (stage.trajectory.type === 'cubic-bezier') for (const control of [stage.trajectory.control1, stage.trajectory.control2]) {
            const projection = control.reduce((sum, value, k) => sum + (value - from[k]) * stage.insertion!.axis[k], 0);
            if (projection < -EPS || projection > stage.insertion.depthMm + EPS || control.some((value, k) => Math.abs(value - from[k] - projection * stage.insertion!.axis[k]) > EPS)) fail(model, `stage ${stage.id}: insertion curve leaves its axial segment`);
          }
        }
        if (stage.spin) {
          const spin = quaternionFromAxisAngle(stage.spin.axis, -2 * Math.PI * stage.spin.turns);
          const q = quaternionMultiply(spin, stage.toTransforms[i].quaternion); spinEndBase.set(q, 3);
        }
        const track = { node: n, operation: oi, start: operation.start + stage.startMs, end: operation.start + stage.startMs + stage.durationMs, stage: source, from, to, spinEndBase };
        tracks.push(track); eventTimes.add(track.start); eventTimes.add(track.end);
      });
    }
    const changed = new Set<number>();
    for (const change of op.parentChanges) {
      const n = nodeId(change.node, `operation ${op.id} parent change`);
      if (changed.has(n)) fail(model, `operation ${op.id}: duplicate parent change '${change.node.id}'`); changed.add(n);
      parentId(change.fromParent, `operation ${op.id}`); parentId(change.toParent, `operation ${op.id}`);
      transform(model, change.fromLocalTransform, `operation ${op.id} from-local ${change.node.id}`);
      transform(model, change.toLocalTransform, `operation ${op.id} to-local ${change.node.id}`);
    }
  });
  const opState = new Uint8Array(operations.length);
  function visitOperation(n: number): void {
    if (opState[n] === 1) fail(model, `operation dependency cycle at '${operations[n].source.id}'`);
    if (opState[n] === 2) return;
    opState[n] = 1;
    for (const id of operations[n].source.dependencies) {
      const dep = ops.get(id); if (dep === undefined) fail(model, `operation ${operations[n].source.id}: unknown dependency '${id}'`);
      visitOperation(dep);
      if (operations[dep].end > operations[n].start) fail(model, `operation ${operations[n].source.id}: dependency '${id}' finishes after start`);
    }
    opState[n] = 2;
  }
  operations.forEach((_, n) => visitOperation(n));

  const epochs: Epoch[] = [], active = new Int32Array(nodeCount).fill(-1);
  let prior: Epoch = { time: 0, parents: parents.slice(), local: local.slice(), tracks: active.slice(), order };
  for (const time of [...eventTimes].sort((a, b) => a - b)) {
    evaluate(prior, tracks, time, world);
    // Capture completed world-space tracks into their structural parent frame.
    for (let index = 0; index < tracks.length; index++) {
      const track = tracks[index];
      if (track.end !== time) continue;
      if (active[track.node] !== index) fail(model, `stage ${track.stage.id}: overlapping or inactive writer`);
      if (parents[track.node] >= 0) relativeTransformBuffers(local, track.node * 10, world, parents[track.node] * 10, world, track.node * 10);
      else copyPose(local, track.node * 10, world, track.node * 10);
      active[track.node] = -1;
    }
    const changes = operations.filter((op) => op.end === time).flatMap((op) => op.source.parentChanges.map((change) => ({ change, op })));
    const changed = new Set<number>();
    for (const { change, op } of changes) {
      const n = nodeId(change.node, `operation ${op.source.id}`);
      if (changed.has(n)) fail(model, `operation ${op.source.id}: simultaneous parent writers for '${change.node.id}'`); changed.add(n);
      if (active[n] >= 0) fail(model, `operation ${op.source.id}: reparent during active track '${change.node.id}'`);
      if (parents[n] !== parentId(change.fromParent, `operation ${op.source.id}`)) fail(model, `operation ${op.source.id}: from-parent mismatch '${change.node.id}'`);
      if (!transformBuffersEqual(local, n * 10, packed(change.fromLocalTransform), 0, EPS)) fail(model, `operation ${op.source.id}: from-local mismatch '${change.node.id}'`);
    }
    for (const { change, op } of changes) {
      const n = nodeId(change.node, `operation ${op.source.id}`);
      parents[n] = parentId(change.toParent, `operation ${op.source.id}`);
      writeTransform(local, n * 10, change.toLocalTransform);
    }
    if (changes.length) order = hierarchyOrder(model, parents, `reparent at ${time}ms`);
    for (const { change, op } of changes) {
      const n = nodeId(change.node, `operation ${op.source.id}`), expected = new Float64Array(10);
      if (parents[n] >= 0) composeTransformBuffers(expected, 0, world, parents[n] * 10, local, n * 10);
      else copyPose(expected, 0, local, n * 10);
      if (!transformBuffersEqual(world, n * 10, expected, 0, EPS)) fail(model, `operation ${op.source.id}: reparent breaks world continuity '${change.node.id}'`);
    }
    tracks.forEach((track, index) => {
      if (track.start !== time) return;
      if (active[track.node] >= 0) fail(model, `stage ${track.stage.id}: overlapping writers for node`);
      if (!transformBuffersEqual(world, track.node * 10, track.from, 0, EPS)) fail(model, `operation ${operations[track.operation].source.id} stage ${track.stage.id}: start pose discontinuity`);
      active[track.node] = index;
      for (let part = 0; part < model.parts.length; part++) if (descendant(part, track.node, parents) && !operations[track.operation].parts.includes(part)) fail(model, `operation ${operations[track.operation].source.id}: missing descendant participant '${model.parts[part].id}'`);
    });
    for (let n = 0; n < nodeCount; n++) if (active[n] >= 0) {
      for (let p = parents[n]; p >= 0; p = parents[p]) if (active[p] >= 0) fail(model, `stage ${tracks[active[n]].stage.id}: root/descendant double writers`);
    }
    prior = { time, parents: parents.slice(), local: local.slice(), tracks: active.slice(), order };
    epochs.push(prior);
    evaluate(prior, tracks, time, world);
    for (const op of operations) {
      if (op.start === time) op.parts.forEach((part, i) => {
        if (!transformBuffersEqual(world, part * 10, packed(op.source.fromTransforms[i]), 0, EPS)) fail(model, `operation ${op.source.id}: start snapshot mismatch for '${model.parts[part].id}'`);
      });
      if (op.end === time) op.parts.forEach((part, i) => {
        if (!transformBuffersEqual(world, part * 10, packed(op.source.toTransforms[i]), 0, EPS)) fail(model, `operation ${op.source.id}: end snapshot mismatch for '${model.parts[part].id}'`);
      });
    }
  }
  model.parts.forEach((part, n) => {
    if (!transformBuffersEqual(world, n * 10, packed(part.finalTransform), 0, EPS)) fail(model, `part ${part.id}: sampled final pose differs from finalTransform`);
  });
  const installedAt = new Float64Array(model.parts.length).fill(Infinity), visibility: Engine['visibility'] = [];
  for (const milestone of model.installations) {
    const part = partId(milestone.partInstanceId, 'installation'), step = stepById.get(milestone.stepId), oi = ops.get(milestone.operationId);
    if (!step || oi === undefined || operations[oi].source.stepId !== milestone.stepId || !operations[oi].parts.includes(part)) fail(model, `installation ${milestone.partInstanceId}: invalid step/operation participant`);
    const time = step.startMs + milestone.atMs;
    if (!Number.isFinite(milestone.atMs) || milestone.atMs < 0 || time > step.endMs || time < operations[oi].start || time > operations[oi].end) fail(model, `installation ${milestone.partInstanceId}: event outside step/operation`);
    if (installedAt[part] !== Infinity) fail(model, `part ${milestone.partInstanceId}: duplicate installation milestone`);
    if (model.steps[step.index].action === 'view') fail(model, `step ${milestone.stepId}: view step cannot install parts`);
    installedAt[part] = time;
  }
  model.parts.forEach((part, n) => { if (installedAt[n] === Infinity) fail(model, `part ${part.id}: missing installation milestone`); });
  const visibilityKeys = new Set<string>();
  for (const event of model.visibility) {
    const part = partId(event.partInstanceId, 'visibility'), step = stepById.get(event.stepId);
    if (!step || !Number.isFinite(event.atMs) || typeof event.visible !== 'boolean' || event.atMs < 0 || event.atMs > step.endMs - step.startMs) fail(model, `visibility ${event.partInstanceId}: invalid event or event outside step`);
    const time = step.startMs + event.atMs, key = `${part}:${time}`;
    if (visibilityKeys.has(key)) fail(model, `part ${event.partInstanceId}: conflicting visibility at ${time}ms`); visibilityKeys.add(key);
    visibility.push({ part, time, visible: Number(event.visible) });
  }
  visibility.sort((a, b) => a.time - b.time);
  const connectionAt = new Float64Array(model.connections.length);
  model.connections.forEach((connection, index) => {
    for (const endpoint of [connection.a, connection.b]) {
      const part = partId(endpoint.partInstanceId, `connection ${connection.id}`);
      if (!pointIds[part].has(endpoint.connectionPointId)) fail(model, `connection ${connection.id}: unknown point '${endpoint.connectionPointId}' on '${endpoint.partInstanceId}'`);
    }
    if (connection.installedByOperationId !== undefined) {
      const oi = ops.get(connection.installedByOperationId);
      if (oi === undefined) fail(model, `connection ${connection.id}: unknown commit operation '${connection.installedByOperationId}'`);
      if (!operations[oi].parts.includes(parts.get(connection.a.partInstanceId)!) && !operations[oi].parts.includes(parts.get(connection.b.partInstanceId)!)) fail(model, `connection ${connection.id}: commit operation must reference a mating endpoint`);
      if (model.steps[steps.get(operations[oi].source.stepId)!].action === 'view') fail(model, `connection ${connection.id}: view operation cannot commit wiring`);
      connectionAt[index] = operations[oi].end;
    } else connectionAt[index] = 0;
  });
  const tracked = new Uint8Array(model.parts.length), scopes = new Uint8Array(model.parts.length), fasteners = new Uint8Array(model.parts.length);
  let robotTotal = 0, sampleTotal = 0, fastenersTotal = 0;
  for (const line of model.inventory) {
    if (!Number.isInteger(line.quantity) || line.quantity < 0) fail(model, `inventory ${line.id}: invalid quantity`);
    unique(model, line.partInstanceIds, `inventory ${line.id}`);
    line.partInstanceIds.forEach((id) => partId(id, `inventory ${line.id}`));
    if (line.accounting !== 'tracked') continue;
    if (line.quantity !== line.partInstanceIds.length) fail(model, `inventory ${line.id}: tracked quantity differs from instance count`);
    for (const id of line.partInstanceIds) {
      const n = parts.get(id)!;
      if (tracked[n]++) fail(model, `part ${id}: counted by multiple tracked inventory lines`);
      if (model.parts[n].inventoryScope !== line.scope) fail(model, `inventory ${line.id}: scope mismatch for '${id}'`);
    }
  }
  model.parts.forEach((part, n) => {
    if (!tracked[n]) fail(model, `part ${part.id}: not reconciled to tracked inventory`);
    scopes[n] = part.inventoryScope === 'robot' ? 0 : 1;
    if (scopes[n]) sampleTotal++; else robotTotal++;
    fasteners[n] = Number(part.category === 'fastener'); fastenersTotal += fasteners[n];
  });
  for (const mapping of model.sourceMappings) {
    if (mapping.stepId !== undefined && !steps.has(mapping.stepId)) fail(model, `source mapping: unknown step '${mapping.stepId}'`);
    if (mapping.operationId !== undefined) {
      const oi = ops.get(mapping.operationId);
      if (oi === undefined || (mapping.stepId !== undefined && operations[oi].source.stepId !== mapping.stepId)) fail(model, `source mapping: invalid operation '${mapping.operationId}'`);
    }
  }
  for (const milestone of model.milestones) if (!steps.has(milestone.stepId)) fail(model, `milestone ${milestone.id}: unknown step '${milestone.stepId}'`);
  for (const joint of model.joints) {
    nodeId(joint.parent, `joint ${joint.id}`); nodeId(joint.child, `joint ${joint.id}`);
    transform(model, joint.origin, `joint ${joint.id} origin`); transform(model, joint.childTransform, `joint ${joint.id} child`); axis(model, joint.axis, `joint ${joint.id}`);
    if (joint.limits && joint.limits.min > joint.limits.max) fail(model, `joint ${joint.id}: reversed limits`);
    if (joint.drivenByMotorId && !motors.has(joint.drivenByMotorId)) fail(model, `joint ${joint.id}: unknown motor '${joint.drivenByMotorId}'`);
    if (joint.coupling && !joints.has(joint.coupling.driverJointId)) fail(model, `joint ${joint.id}: unknown coupling driver`);
    if (joint.internalBinding) {
      const binding = joint.internalBinding, part = model.parts[partId(binding.partInstanceId, `joint ${joint.id}`)];
      if (!(model.geometryAssets[assets.get(part.geometryId)!].internalNodes ?? []).some((node) => node.id === binding.geometryNodeId)) fail(model, `joint ${joint.id}: unknown geometry internal node '${binding.geometryNodeId}'`);
    }
  }
  for (const motor of model.motors) {
    partId(motor.partInstanceId, `motor ${motor.id}`);
    if (motor.jointId && !joints.has(motor.jointId)) fail(model, `motor ${motor.id}: unknown joint '${motor.jointId}'`);
  }
  for (const constraint of model.linkageConstraints) {
    if (!joints.has(constraint.driverJointId) || constraint.dependentJointIds.some((id) => !joints.has(id))) fail(model, `linkage ${constraint.id}: unknown joint`);
    axis(model, constraint.planeNormal, `linkage ${constraint.id}`);
    for (const link of constraint.links) { nodeId(link.a.node, `linkage ${constraint.id}`); nodeId(link.b.node, `linkage ${constraint.id}`); if (link.lengthMm <= 0) fail(model, `linkage ${constraint.id}: nonpositive length`); }
  }
  for (const cable of model.cables) {
    partId(cable.devicePartInstanceId, `cable ${cable.id}`); if (cable.cablePartInstanceId) partId(cable.cablePartInstanceId, `cable ${cable.id}`);
    if (!connections.has(cable.fromConnection) || !connections.has(cable.toConnection)) fail(model, `cable ${cable.id}: unknown connection`);
    for (const control of cable.controlPoints) {
      if (control.parent) nodeId(control.parent, `cable ${cable.id}`);
      vector(model, control.position, `cable ${cable.id} control`);
    }
  }
  for (const scenario of model.scenarios) {
    for (const command of scenario.motorCommands) if (!motors.has(command.motorId)) fail(model, `scenario ${scenario.id}: unknown motor '${command.motorId}'`);
    for (const signal of scenario.sensorSignals) partId(signal.sensorPartInstanceId, `scenario ${scenario.id}`);
    for (const motion of scenario.rootMotion) { nodeId(motion.node, `scenario ${scenario.id}`); transform(model, motion.transform, `scenario ${scenario.id} root motion`); }
    for (const event of scenario.objectEvents) {
      if (!subs.has(event.objectSubassemblyId) && !objects.has(event.objectSubassemblyId)) fail(model, `scenario ${scenario.id}: unknown object subassembly or simulation object`);
      if (event.parent) nodeId(event.parent, `scenario ${scenario.id}`); transform(model, event.transform, `scenario ${scenario.id} object event`);
    }
    if (scenario.differentialDrive && (!subs.has(scenario.differentialDrive.rootSubassemblyId) || !joints.has(scenario.differentialDrive.leftJointId) || !joints.has(scenario.differentialDrive.rightJointId))) fail(model, `scenario ${scenario.id}: unknown differential drive hierarchy`);
    if (scenario.differentialDrive) {
      transform(model, scenario.differentialDrive.initialTransform, `scenario ${scenario.id} differential drive initial`);
      vector(model, scenario.differentialDrive.axleCenterInRoot, `scenario ${scenario.id} differential drive axle center`);
    }
  }
  const compiled: CompiledAssembly = Object.freeze({ model, partIds: Object.freeze(model.parts.map((part) => part.id)), subassemblyIds: Object.freeze(model.subassemblies.map((sub) => sub.id)), simulationObjectIds: Object.freeze(simulationObjects.map((object) => object.id)), connectionIds: Object.freeze(model.connections.map((connection) => connection.id)), internalNodes: Object.freeze(internalNodes), durationMs, stepTimes: Object.freeze(stepTimes) });
  engines.set(compiled, { epochs, tracks, operations, stepById, installedAt, visibility, connectionAt, internalDefaults: Float64Array.from(defaults), environmentDefaults, scopes, fasteners, nodeCount, robotTotal, sampleTotal, fastenersTotal });
  return compiled;
}

export function createFrame(compiled: CompiledAssembly): AssemblyFrame {
  const engine = requireEngine(compiled), count = compiled.partIds.length;
  const frame: AssemblyFrame = {
    compiled, timeMs: 0, stepIndex: -1, transforms: new Float64Array(count * 10),
    subassemblyTransforms: new Float64Array(compiled.subassemblyIds.length * 10),
    internalTransforms: new Float64Array(engine.internalDefaults.length), installed: new Uint8Array(count),
    environmentTransforms: new Float64Array(engine.environmentDefaults.length), environmentVisible: new Uint8Array(compiled.simulationObjectIds.length),
    active: new Uint8Array(count), visible: new Uint8Array(count), connected: new Uint8Array(compiled.connectionIds.length),
    counts: { robotInstalled: 0, robotTotal: engine.robotTotal, sampleInstalled: 0, sampleTotal: engine.sampleTotal,
      fastenersInstalled: 0, fastenersTotal: engine.fastenersTotal, stepsComplete: 0, stepsTotal: compiled.stepTimes.length }
  };
  scratch.set(frame, {
    world: new Float64Array(engine.nodeCount * 10),
    transforms: frame.transforms, subassemblyTransforms: frame.subassemblyTransforms,
    internalTransforms: frame.internalTransforms, installed: frame.installed, active: frame.active,
    environmentTransforms: frame.environmentTransforms, environmentVisible: frame.environmentVisible,
    visible: frame.visible, connected: frame.connected, counts: frame.counts
  });
  return sampleAssembly(compiled, 0, frame);
}

export function sampleAssembly(compiled: CompiledAssembly, timeMs: number, out: AssemblyFrame): AssemblyFrame {
  const time = finiteTime(timeMs, compiled.durationMs), engine = requireEngine(compiled), storage = scratch.get(out);
  if (out.compiled !== compiled || !storage) throw new Error('Assembly frame belongs to another compilation; use createFrame(compiled)');
  const count = compiled.partIds.length;
  if (out.transforms !== storage.transforms || out.transforms.length !== count * 10 ||
      out.subassemblyTransforms !== storage.subassemblyTransforms || out.subassemblyTransforms.length !== compiled.subassemblyIds.length * 10 ||
      out.internalTransforms !== storage.internalTransforms || out.internalTransforms.length !== engine.internalDefaults.length ||
      out.environmentTransforms !== storage.environmentTransforms || out.environmentTransforms.length !== engine.environmentDefaults.length ||
      out.environmentVisible !== storage.environmentVisible || out.environmentVisible.length !== compiled.simulationObjectIds.length ||
      out.installed !== storage.installed || out.installed.length !== count ||
      out.active !== storage.active || out.active.length !== count ||
      out.visible !== storage.visible || out.visible.length !== count ||
      out.connected !== storage.connected || out.connected.length !== compiled.connectionIds.length ||
      out.counts !== storage.counts) throw new Error('Assembly frame has foreign or incorrectly sized output lanes; use createFrame(compiled)');
  const world = storage.world;
  evaluate(epochAt(engine, time), engine.tracks, time, world);
  for (let k = 0; k < out.transforms.length; k++) out.transforms[k] = world[k];
  for (let k = 0; k < out.subassemblyTransforms.length; k++) out.subassemblyTransforms[k] = world[count * 10 + k];
  out.internalTransforms.set(engine.internalDefaults);
  out.environmentTransforms.set(engine.environmentDefaults); out.environmentVisible.fill(0);
  out.active.fill(0); out.visible.fill(1);
  const counts = out.counts;
  counts.robotInstalled = 0; counts.sampleInstalled = 0; counts.fastenersInstalled = 0; counts.stepsComplete = 0;
  counts.robotTotal = engine.robotTotal; counts.sampleTotal = engine.sampleTotal; counts.fastenersTotal = engine.fastenersTotal; counts.stepsTotal = compiled.stepTimes.length;
  for (let n = 0; n < out.installed.length; n++) {
    const installed = Number(engine.installedAt[n] <= time); out.installed[n] = installed;
    if (engine.scopes[n]) counts.sampleInstalled += installed; else counts.robotInstalled += installed;
    counts.fastenersInstalled += installed * engine.fasteners[n];
  }
  for (let n = 0; n < engine.operations.length; n++) {
    const op = engine.operations[n];
    if (op.start <= time && time < op.end) for (let i = 0; i < op.parts.length; i++) out.active[op.parts[i]] = 1;
  }
  for (let n = 0; n < engine.visibility.length; n++) {
    const event = engine.visibility[n];
    if (event.time > time) break;
    out.visible[event.part] = event.visible;
  }
  for (let n = 0; n < out.connected.length; n++) out.connected[n] = Number(engine.connectionAt[n] <= time);
  for (let n = 0; n < compiled.stepTimes.length; n++) if (compiled.stepTimes[n].endMs <= time) counts.stepsComplete++;
  out.timeMs = time; out.stepIndex = stepIndexAt(compiled.stepTimes, time);
  return out;
}

export function getStepAtTime(compiled: CompiledAssembly, timeMs: number): StepTime | null {
  requireEngine(compiled);
  const index = stepIndexAt(compiled.stepTimes, finiteTime(timeMs, compiled.durationMs));
  return index < 0 ? null : compiled.stepTimes[index];
}

export function getStepTime(compiled: CompiledAssembly, stepId: string): StepTime {
  const step = requireEngine(compiled).stepById.get(stepId);
  if (!step) throw new Error(`Assembly ${compiled.model.id}: unknown step '${stepId}'`);
  return step;
}
