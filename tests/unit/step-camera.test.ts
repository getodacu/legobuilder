import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { Box3, PerspectiveCamera, Vector3 } from 'three';
import { compileAssembly, createFrame, sampleAssembly } from '../../src/lib/assembly/engine.ts';
import { fitStepCamera, stepCameraPoints, stepSubjects } from '../../src/lib/scene/step-camera.ts';
import type { RobotModel } from '../../src/lib/types/model.ts';

const model = JSON.parse(readFileSync(new URL('../../static/models/advanced-driving-base/manifest.json', import.meta.url), 'utf8')) as RobotModel;
const compiled = compileAssembly(model);
const localBounds = new Box3(new Vector3(-4, -3, -2), new Vector3(4, 3, 2));

test('guided targets include all listed pieces, moving assemblies and wired receivers', () => {
  assert.deepEqual(stepSubjects(model, 0), new Set(model.steps[0].requiredPartInstanceIds));
  const reuse = model.steps.findIndex(({ id }) => id === 'book1-step10');
  assert.equal(model.steps[reuse].requiredPartInstanceIds.length, 0);
  assert.ok(stepSubjects(model, reuse).size >= 5);
  const wiring = model.steps.findIndex(({ id }) => id === 'book5-step2');
  const connection = model.connections.find(({ installedByOperationId }) => model.steps[wiring].operationIds.includes(installedByOperationId ?? ''))!;
  const wiringSubjects = stepSubjects(model, wiring);
  assert.ok(wiringSubjects.has(connection.a.partInstanceId));
  assert.ok(wiringSubjects.has(connection.b.partInstanceId));
  const view = model.steps.findIndex(({ action }) => action === 'view');
  assert.equal(stepSubjects(model, view).size, 0);
  const frame = sampleAssembly(compiled, compiled.stepTimes[view].startMs, createFrame(compiled));
  assert.ok(stepCameraPoints(frame, view, new Set(), () => localBounds).length > 24);
});

test('the guided camera fits opening and seated poses inside the clear screen rectangle', () => {
  const frame = createFrame(compiled);
  const points = stepCameraPoints(frame, 0, stepSubjects(model, 0), () => localBounds);
  assert.ok(points.length > model.steps[0].requiredPartInstanceIds.length * 16);
  for (const viewport of [
    { width: 1257, height: 1313, left: 365, top: 80, clearWidth: 860, clearHeight: 1100 },
    { width: 320, height: 740, left: 9, top: 110, clearWidth: 302, clearHeight: 360 },
    { width: 740, height: 320, left: 12, top: 57, clearWidth: 716, clearHeight: 94 }
  ]) {
    const { width, height, left, top, clearWidth, clearHeight } = viewport;
    const preset = model.steps[0].cameraPreset!;
    const direction = new Vector3(...preset.position).sub(new Vector3(...preset.target)).normalize();
    const up = new Vector3(...preset.up);
    const camera = new PerspectiveCamera(preset.framing, width / height, 0.05, 20000);
    const slope = Math.tan(camera.fov * Math.PI / 360);
    const fit = fitStepCamera(points, direction, up, 0.86 * slope * clearWidth / height, 0.86 * slope * clearHeight / height);
    camera.setViewOffset(width, height, (width - clearWidth) / 2 - left, (height - clearHeight) / 2 - top, width, height);
    camera.up.copy(up);
    camera.position.copy(direction).multiplyScalar(fit.distance).add(fit.target);
    camera.lookAt(fit.target);
    camera.updateMatrixWorld();
    for (const point of points) {
      const projected = point.clone().project(camera);
      const x = (projected.x + 1) * width / 2, y = (1 - projected.y) * height / 2;
      assert.ok(x > left && x < left + clearWidth && y > top && y < top + clearHeight, `Point at ${x},${y} was outside the clear area`);
    }
  }
});
