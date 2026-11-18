import { Box3, Matrix4, Quaternion, Vector3 } from 'three';
import { createFrame, sampleAssembly } from '../assembly/engine.ts';
import type { AssemblyFrame, RobotModel } from '../types/model.ts';

export function stepSubjects(model: RobotModel, stepIndex: number): Set<string> {
  const step = model.steps[stepIndex];
  const ids = new Set(step.requiredPartInstanceIds);
  const operationIds = new Set(step.operationIds);
  for (const operation of model.operations) {
    if (operationIds.has(operation.id)) for (const id of operation.partInstanceIds) ids.add(id);
  }
  for (const { a, b, installedByOperationId } of model.connections) {
    if (!installedByOperationId || !operationIds.has(installedByOperationId)) continue;
    ids.add(a.partInstanceId);
    ids.add(b.partInstanceId);
  }
  return ids;
}

export function stepCameraPoints(frame: AssemblyFrame, stepIndex: number, subjects: ReadonlySet<string>, boundsFor: (geometryId: string) => Box3): Vector3[] {
  const { compiled } = frame;
  const { model } = compiled;
  const { startMs, endMs } = compiled.stepTimes[stepIndex];
  const operationIds = new Set(model.steps[stepIndex].operationIds);
  const times = new Set([startMs, endMs, frame.timeMs]);
  for (const operation of model.operations) {
    if (!operationIds.has(operation.id)) continue;
    for (const stage of operation.stages) {
      const start = startMs + operation.startMs + stage.startMs;
      // shortcut: sample motion at quarter intervals with a framing margin, densify for longer or faster swings.
      for (const fraction of [0, 0.25, 0.5, 0.75, 1]) times.add(start + stage.durationMs * fraction);
    }
  }
  const candidates = model.parts.flatMap((part, index) => subjects.size && !subjects.has(part.id) ? [] : [{ index, bounds: boundsFor(part.geometryId) }]);
  const sample = createFrame(compiled);
  const transform = new Matrix4(), scale = new Vector3(), position = new Vector3(), rotation = new Quaternion();
  const points: Vector3[] = [];
  for (const time of times) {
    sampleAssembly(compiled, time, sample);
    for (const { index, bounds } of candidates) {
      if (!sample.visible[index] || (!subjects.size && !sample.installed[index])) continue;
      const offset = index * 10;
      transform.compose(position.fromArray(sample.transforms, offset), rotation.fromArray(sample.transforms, offset + 3), scale.fromArray(sample.transforms, offset + 7));
      for (const x of [bounds.min.x, bounds.max.x]) {
        for (const y of [bounds.min.y, bounds.max.y]) {
          for (const z of [bounds.min.z, bounds.max.z]) points.push(new Vector3(x, y, z).applyMatrix4(transform));
        }
      }
    }
  }
  return points;
}

export function fitStepCamera(points: Vector3[], direction: Vector3, up: Vector3, horizontalSlope: number, verticalSlope: number) {
  const basis = new Matrix4().lookAt(direction, new Vector3(), up);
  const inverse = basis.clone().transpose();
  const local = points.map((point) => point.clone().applyMatrix4(inverse));
  const bounds = new Box3().setFromPoints(local);
  const center = bounds.getCenter(new Vector3());
  const halfSize = bounds.getSize(new Vector3()).multiplyScalar(0.5);
  let distance = 5;
  for (const point of local) {
    const depth = point.z - center.z;
    distance = Math.max(distance, depth + Math.max(Math.abs(point.x - center.x) / horizontalSlope, Math.abs(point.y - center.y) / verticalSlope));
  }
  return { target: center.applyMatrix4(basis), distance, halfSize };
}
