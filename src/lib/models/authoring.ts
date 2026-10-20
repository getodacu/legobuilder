import { composeTransforms, relativeTransform } from '../core/transforms.ts';
import type {
  AssemblyOperation, CameraPreset, Connection, ConnectionPoint, Evidence, PartInstance,
  PlacementEvidence, Quaternion, RobotModel, SourceReference, Trajectory, Transform, Vec3
} from '../types/model.ts';

/** N = Rx(pi) * 0.4: placement conversion N*T*N^-1, not a second geometry conversion. */
export function nativeLDrawTransform(position: Vec3, quaternion: Quaternion = [0, 0, 0, 1]): Transform {
  return {
    position: [position[0] * 0.4, -position[1] * 0.4, -position[2] * 0.4],
    quaternion: [quaternion[0], -quaternion[1], -quaternion[2], quaternion[3]],
    scale: [1, 1, 1]
  };
}

export function evidence(category: Evidence['category'], note: string, sources: SourceReference[], confidence = 0.95): Evidence {
  return { category, confidence, sources, note };
}

export function placement(relationship: Evidence, numerical: Evidence, presentation = false): PlacementEvidence {
  return {
    relationship,
    placement: presentation ? 'presentation-only' : 'measured-attachment',
    evidence: numerical,
    fit: 'unchecked'
  };
}

export const stepId = (book: number, step: number): string => `book${book}-step${step}`;

export type BuildFragment = Pick<RobotModel,
  'parts' | 'steps' | 'operations' | 'installations' | 'visibility' | 'subassemblies' |
  'connections' | 'joints' | 'linkageConstraints' | 'motors' | 'cables' | 'inventory' |
  'milestones' | 'sourceMappings'> & {
  rootId: string;
  attachmentSites: Record<string, {
    partInstanceId: string;
    connectionPointId: string;
    description: string;
    sourceReference: SourceReference;
  }>;
  familyByPartId: Record<string, string>;
};

function positiveDuration(durationMs: number): void {
  if (!Number.isFinite(durationMs) || durationMs <= 0) throw new Error('Authoring duration must be finite and positive');
}

/** Solve parentWorld * parentLocalFrame = childWorld * childLocalFrame. */
export function placeAtConnection(parentWorld: Transform, parentLocalFrame: Transform, childLocalFrame: Transform): Transform {
  const identity: Transform = { position: [0, 0, 0], quaternion: [0, 0, 0, 1], scale: [1, 1, 1] };
  return composeTransforms(composeTransforms(parentWorld, parentLocalFrame), relativeTransform(childLocalFrame, identity));
}

/** Register source-local frames without changing either part's placement. */
export function addMate(
  receiver: PartInstance, receiverPoint: ConnectionPoint,
  moving: PartInstance, movingPoint: ConnectionPoint,
  options: { id: string; type: Connection['type']; installedByOperationId?: string; evidence: PlacementEvidence }
): Connection {
  for (const [part, point] of [[receiver, receiverPoint], [moving, movingPoint]] as const) {
    const ids = new Set(part.connectionPoints.map((existing) => existing.id));
    if (ids.size !== part.connectionPoints.length || ids.has(point.id)) {
      throw new Error(`Part ${part.id}: duplicate connection point '${point.id}'`);
    }
  }
  if (receiver === moving && receiverPoint.id === movingPoint.id) {
    throw new Error(`Part ${receiver.id}: duplicate connection point '${receiverPoint.id}'`);
  }
  receiver.connectionPoints.push(receiverPoint);
  moving.connectionPoints.push(movingPoint);
  return {
    ...options,
    a: { partInstanceId: receiver.id, connectionPointId: receiverPoint.id },
    b: { partInstanceId: moving.id, connectionPointId: movingPoint.id }
  };
}

export function mountPart(part: PartInstance, options: {
  id?: string; stepId: string; sourceReference: SourceReference;
  startMs: number; durationMs: number; axis?: Vec3; depthMm?: number;
  dependencies: string[]; cameraPreset?: CameraPreset; approachTrajectory?: Trajectory;
}): AssemblyOperation {
  positiveDuration(options.durationMs);
  if (!Number.isFinite(options.startMs) || options.startMs < 0 ||
    !Number.isFinite(options.startMs + options.durationMs)) throw new Error('Mount start/end must be finite and nonnegative');
  const { axis, depthMm, durationMs } = options;
  if (axis === undefined ? depthMm !== undefined :
    axis.length !== 3 || !axis.every(Number.isFinite) || Math.abs(Math.hypot(...axis) - 1) > 1e-6 ||
    depthMm === undefined || !Number.isFinite(depthMm) || depthMm <= 0) {
    throw new Error(`Part ${part.id}: insertion requires a unit world axis and positive finite source-derived depth together`);
  }
  const id = options.id ?? `mount-${part.id}`;
  const authored = evidence('app-authored', 'RoboBuild staging trajectory and proportional playback timing; not source assembly measurements.', [], 1);
  const presentation = placement(part.placementEvidence.relationship, authored, true);
  const contact: Transform = axis ? {
    ...part.finalTransform,
    position: part.finalTransform.position.map((value, i) => value - axis[i] * depthMm!) as Vec3
  } : part.finalTransform;
  const approachMs = axis ? durationMs * 0.6 : durationMs;
  const insertionMs = durationMs - approachMs;
  if (!(approachMs > 0) || (axis && !(insertionMs > 0))) throw new Error('Mount duration cannot represent each positive phase');
  const operation: AssemblyOperation = {
    id, stepId: options.stepId, operationType: axis ? 'insert' : 'align',
    partInstanceIds: [part.id], fromTransforms: [part.initialTransform], toTransforms: [part.finalTransform],
    durationMs, easing: 'smoothstep', dependencies: options.dependencies,
    cameraPreset: options.cameraPreset, sourceReference: options.sourceReference, startMs: options.startMs,
    parentChanges: [], evidence: presentation,
    stages: [{
      id: `${id}-approach`, startMs: 0, durationMs: approachMs, phase: axis ? 'approach' : 'transfer',
      nodes: [{ kind: 'part', id: part.id }], fromTransforms: [part.initialTransform], toTransforms: [contact],
      trajectory: options.approachTrajectory ?? { type: 'linear' }, easing: 'smoothstep', evidence: presentation
    }]
  };
  if (axis) operation.stages.push({
    id: `${id}-insert`, startMs: approachMs, durationMs: insertionMs, phase: 'insert',
    nodes: [{ kind: 'part', id: part.id }], fromTransforms: [contact], toTransforms: [part.finalTransform],
    trajectory: { type: 'linear' }, easing: 'smoothstep', insertion: { axis, depthMm: depthMm! },
    evidence: part.placementEvidence
  });
  return operation;
}

export function viewOperation(
  id: string, stepId: string, sourceReference: SourceReference, cameraPreset: CameraPreset, durationMs: number
): AssemblyOperation {
  positiveDuration(durationMs);
  return {
    id, stepId, operationType: 'align', partInstanceIds: [], fromTransforms: [], toTransforms: [],
    durationMs, easing: 'smoothstep', dependencies: [], cameraPreset, sourceReference, startMs: 0,
    stages: [], parentChanges: [],
    evidence: placement(
      evidence('documented', 'Source view instruction; no physical assembly change.', [sourceReference]),
      evidence('app-authored', 'RoboBuild camera framing and playback duration.', [], 1), true
    )
  };
}
