import assert from 'node:assert/strict';
import test from 'node:test';
import { compileAssembly, createFrame, getStepTime, sampleAssembly } from '../../src/lib/assembly/engine.ts';
import { composeTransforms, identityTransform, readTransform, transformsEqual } from '../../src/lib/core/transforms.ts';
import { advancedDrivingBase as model } from '../../src/lib/models/advanced-driving-base.ts';
import type { AssemblyFrame, Transform, Vec3 } from '../../src/lib/types/model.ts';

const introductions = [
  ['beam-1', 'pin-1', 'pin-2'],
  ['grey-connector-1', 'grey-connector-2'],
  ['pin-3', 'pin-4']
];
const bracketIds = introductions.flat();
const stepIds = ['book1-step1', 'book1-step2', 'book1-step3'];
const compiled = compileAssembly(model);
function part(id: string) {
  const value = model.parts.find((entry) => entry.id === id);
  assert.ok(value, `Missing source instance ${id}`);
  return value;
}
function close(actual: ArrayLike<number>, expected: ArrayLike<number>, label: string): void {
  assert.equal(actual.length, expected.length, label);
  for (let i = 0; i < actual.length; i++) {
    assert.ok(Number.isFinite(actual[i]) && Math.abs(actual[i] - expected[i]) < 1e-8,
      `${label}[${i}]: ${actual[i]} != ${expected[i]}`);
  }
}
function point(pose: Transform, local: Vec3): Vec3 {
  return composeTransforms(pose, { ...identityTransform(), position: local }).position;
}
// Independently transcribed DAT features, not the model's authored connection frames.
// N = diag(.4, -.4, -.4): preserve native origins and convert geometry exactly once.
function nativePoint(pose: Transform, native: Vec3): Vec3 {
  return point(pose, [native[0] * 0.4, native[1] * -0.4, native[2] * -0.4]);
}
function difference(a: Vec3, b: Vec3): Vec3 { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function installedIds(frame: AssemblyFrame): string[] {
  return compiled.partIds.filter((_, index) => frame.installed[index] === 1).sort();
}
function poseOf(frame: AssemblyFrame, id: string): Transform {
  const index = compiled.partIds.indexOf(id);
  assert.notEqual(index, -1, id);
  return readTransform(frame.transforms, index * 10);
}

// 40490.dat: holes (0,0,-80..80), faces Y ±10 (beamhole/peghole).
// 2780.dat + confric5.dat: collar at origin, shaft along X, tips X ±20.
// 48989.dat: integral bases (0,±20,+10), tips Z +30; opposite pair Z -10..-30.
// s/48989s01.dat + connhole.dat: outer hole seats (±10,±20,0), axis X.
type Mate = {
  id: string; receiver: string; moving: string;
  seat: Vec3; exit: Vec3; collar: Vec3; tip: Vec3; anchor: Vec3; axis: Vec3;
};
const mates: Mate[] = [
  { id: 'beam-h4-pin', receiver: 'beam-1', moving: 'pin-1', seat: [0, -10, -20], exit: [0, 10, -20], collar: [0, 0, 0], tip: [-20, 0, 0], anchor: [24, 0, -4], axis: [0, 0, 1] },
  { id: 'beam-h6-pin', receiver: 'beam-1', moving: 'pin-2', seat: [0, -10, 20], exit: [0, 10, 20], collar: [0, 0, 0], tip: [-20, 0, 0], anchor: [40, 0, -4], axis: [0, 0, 1] },
  { id: 'beam-h1-crossblock', receiver: 'beam-1', moving: 'grey-connector-1', seat: [0, 10, -80], exit: [0, -10, -80], collar: [0, -20, 10], tip: [0, -20, 30], anchor: [0, 0, 4], axis: [0, 0, -1] },
  { id: 'beam-h3-crossblock', receiver: 'beam-1', moving: 'grey-connector-1', seat: [0, 10, -40], exit: [0, -10, -40], collar: [0, 20, 10], tip: [0, 20, 30], anchor: [16, 0, 4], axis: [0, 0, -1] },
  { id: 'beam-h7-crossblock', receiver: 'beam-1', moving: 'grey-connector-2', seat: [0, 10, 40], exit: [0, -10, 40], collar: [0, -20, 10], tip: [0, -20, 30], anchor: [48, 0, 4], axis: [0, 0, -1] },
  { id: 'beam-h9-crossblock', receiver: 'beam-1', moving: 'grey-connector-2', seat: [0, 10, 80], exit: [0, -10, 80], collar: [0, 20, 10], tip: [0, 20, 30], anchor: [64, 0, 4], axis: [0, 0, -1] },
  { id: 'left-upper-pin', receiver: 'grey-connector-1', moving: 'pin-3', seat: [10, -20, 0], exit: [-10, -20, 0], collar: [0, 0, 0], tip: [-20, 0, 0], anchor: [0, 4, 8], axis: [0, -1, 0] },
  { id: 'right-upper-pin', receiver: 'grey-connector-2', moving: 'pin-4', seat: [10, 20, 0], exit: [-10, 20, 0], collar: [0, 0, 0], tip: [-20, 0, 0], anchor: [64, 4, 8], axis: [0, -1, 0] }
];

test('source introductions retain seven distinct callout units and reconcile the actual tracked inventory', () => {
  assert.equal(new Set(model.parts.map((entry) => entry.id)).size, model.parts.length);
  const shapeCounts: Record<string, number> = {};
  for (const id of bracketIds) shapeCounts[part(id).geometryId] = (shapeCounts[part(id).geometryId] ?? 0) + 1;
  assert.deepEqual(shapeCounts, { '40490': 1, '2780': 4, '48989': 2 });
  stepIds.forEach((id, index) => {
    const step = model.steps.find((entry) => entry.id === id);
    assert.ok(step, id);
    assert.deepEqual([...step.requiredPartInstanceIds].sort(), [...introductions[index]].sort());
    for (const instance of introductions[index]) {
      assert.equal(part(instance).sourceReference?.documentId, 'adb-book1');
      assert.equal(part(instance).sourceReference?.page, index + 1);
      assert.equal(part(instance).sourceReference?.instructionId, String(index + 1));
      assert.equal(model.installations.filter((event) => event.partInstanceId === instance).length, 1);
    }
  });
  const tracked = model.inventory.filter((line) => line.accounting === 'tracked');
  for (const line of tracked) {
    assert.equal(line.basis, 'prepared-callout-units', line.id);
    assert.equal(line.quantity, line.partInstanceIds.length, line.id);
    assert.equal(new Set(line.partInstanceIds).size, line.quantity, line.id);
    for (const id of line.partInstanceIds) assert.equal(part(id).inventoryScope, line.scope);
  }
  const trackedIds = tracked.flatMap((line) => line.partInstanceIds);
  assert.equal(new Set(trackedIds).size, trackedIds.length, 'No double-counted captive pins or shared instances');
  assert.deepEqual([...trackedIds].sort(), model.parts.map((entry) => entry.id).sort());
  const robotTotal = tracked.filter((line) => line.scope === 'robot').reduce((sum, line) => sum + line.quantity, 0);
  assert.equal(createFrame(compiled).counts.robotTotal, robotTotal);
  assert.equal(model.coverage.modeledComponents, model.parts.length);
  assert.equal(model.coverage.documentedSteps, 136);
  // The source denominator is not seven; later full coverage must reconcile the whole BOM.
  if (model.coverage.implementedSteps === 136) assert.equal(robotTotal, 234);
});

test('real source registry preserves manual identity and selected CAD/material provenance while producing seated poses', () => {
  const documents = new Map(model.sourceDocuments.map((document) => [document.id, document]));
  assert.equal(documents.size, model.sourceDocuments.length);
  const front = documents.get('adb-book1');
  assert.ok(front);
  assert.equal(front.sha256, '903c68142601a3fbd50a4c22eac64e1fd950bd037b667626e4eacc362e8d7901');
  assert.equal(front.pageCount, 38);
  assert.equal(front.redistribution, 'link-only');
  for (const geometryId of ['40490', '2780', '48989']) {
    const asset = model.geometryAssets.find((entry) => entry.id === geometryId);
    assert.ok(asset, geometryId);
    const root = asset.attribution.find((entry) => entry.sourcePath === `parts/${geometryId}.dat`);
    assert.ok(root, geometryId);
    assert.equal(documents.get(`ldraw-${geometryId}`)?.sha256, root.sha256);
    assert.equal(documents.get(`ldraw-${geometryId}`)?.sourceUrl, root.sourceUrl);
    assert.equal(asset.preserveOrigin, true);
    close(point(asset.nativeToScene, [10, 20, 30]), [4, -8, -12], `${geometryId} native conversion`);
  }
  for (const material of model.materials) {
    for (const reference of material.evidence.sources) assert.ok(documents.has(reference.documentId), material.id);
  }
  const frame = createFrame(compiled);
  for (const [index, stepId] of stepIds.entries()) {
    const time = getStepTime(compiled, stepId).endMs;
    sampleAssembly(compiled, time, frame);
    for (const id of introductions.slice(0, index + 1).flat()) {
      assert.ok(transformsEqual(poseOf(frame, id), part(id).finalTransform), `${stepId}: ${id} seated`);
    }
  }
});

test('independent native hole, collar and tip features mate across all eight bracket connections', () => {
  const beam = part('beam-1').finalTransform;
  for (let index = 0; index < 9; index++) {
    close(nativePoint(beam, [0, 0, -80 + 20 * index]), [8 * index, 0, 0], `beam h${index + 1}`);
  }
  const bracketConnections = model.connections.filter((connection) =>
    bracketIds.includes(connection.a.partInstanceId) && bracketIds.includes(connection.b.partInstanceId));
  assert.deepEqual(bracketConnections.map((connection) => connection.id).sort(), mates.map((mate) => mate.id).sort());
  for (const mate of mates) {
    const receiver = part(mate.receiver), moving = part(mate.moving);
    const seat = nativePoint(receiver.finalTransform, mate.seat);
    const exit = nativePoint(receiver.finalTransform, mate.exit);
    const collar = nativePoint(moving.finalTransform, mate.collar);
    const tip = nativePoint(moving.finalTransform, mate.tip);
    close(seat, mate.anchor, `${mate.id} source seat`);
    close(collar, seat, `${mate.id} collar seats on face, not hole midpoint`);
    close(tip, exit, `${mate.id} tip reaches opposite face`);
    close(difference(tip, collar), mate.axis.map((value) => value * 8), `${mate.id} shaft axis/depth`);
    close(difference(exit, seat), difference(tip, collar), `${mate.id} collinear bore and shaft`);
    const connection = bracketConnections.find((entry) => entry.id === mate.id)!;
    assert.equal(connection.a.partInstanceId, mate.receiver);
    assert.equal(connection.b.partInstanceId, mate.moving);
    for (const [endpoint, instance] of [[connection.a, receiver], [connection.b, moving]] as const) {
      const local = instance.connectionPoints.find((entry) => entry.id === endpoint.connectionPointId);
      assert.ok(local, `${mate.id} connection endpoint`);
      const world = composeTransforms(instance.finalTransform, local.localTransform);
      close(world.position, seat, `${mate.id} recorded anchor agrees with DAT`);
      close(difference(point(world, [0, 1, 0]), world.position), mate.axis, `${mate.id} connection insertion frame`);
    }
  }
  for (const id of ['grey-connector-1', 'grey-connector-2']) {
    for (const y of [-20, 20]) {
      close(difference(nativePoint(part(id).finalTransform, [0, y, -30]), nativePoint(part(id).finalTransform, [0, y, -10])),
        [0, 0, 8], `${id} opposite captive pin projects outward`);
    }
  }
  // The 2-LDU collars occupy face recesses; friction/lip interference is intentional.
  // These analytic seat/axis checks do not claim general mesh clearance or molded fit.
});

test('actual insert tracks travel eight millimeters along source-backed extraction axes without teleporting', () => {
  const frame = createFrame(compiled);
  for (const id of bracketIds.filter((entry) => entry !== 'beam-1')) {
    const operation = model.operations.find((entry) => entry.partInstanceIds.includes(id));
    assert.ok(operation, id);
    const stage = operation.stages.find((entry) => entry.phase === 'insert');
    assert.ok(stage, id);
    const mate = mates.find((entry) => entry.moving === id)!;
    assert.deepEqual(stage.insertion?.axis, mate.axis, id);
    assert.equal(stage.insertion?.depthMm, 8, id);
    const start = getStepTime(compiled, operation.stepId).startMs + operation.startMs + stage.startMs;
    const seat = nativePoint(part(mate.receiver).finalTransform, mate.seat);
    let previous = -1;
    for (const fraction of [0, 0.25, 0.5, 0.75, 1]) {
      sampleAssembly(compiled, start + stage.durationMs * fraction, frame);
      const pose = poseOf(frame, id);
      const tip = nativePoint(pose, mate.tip);
      const collar = nativePoint(pose, mate.collar);
      const travel = difference(tip, seat).reduce((sum, value, axis) => sum + value * mate.axis[axis], 0);
      assert.ok(travel > previous, `${id}: insertion moves monotonically inward`);
      previous = travel;
      close(difference(tip, seat), mate.axis.map((value) => value * travel), `${id}: no lateral shaft drift`);
      close(difference(tip, collar), mate.axis.map((value) => value * 8), `${id}: orientation stays coaxial`);
      if (fraction === 0) close(tip, seat, `${id}: first tip contact`);
      if (fraction === 0.5) close(difference(tip, seat), mate.axis.map((value) => value * 4), `${id}: continuous half insertion`);
      if (fraction === 1) close(collar, seat, `${id}: seated collar`);
    }
  }
});

test('first three source end states and exact installation milestones reverse to the correct 3/5/7 subsets', () => {
  const frame = createFrame(compiled);
  sampleAssembly(compiled, 0, frame);
  assert.deepEqual(installedIds(frame), []);
  for (const id of bracketIds) {
    assert.ok(transformsEqual(poseOf(frame, id), part(id).initialTransform), `${id} starts in inventory`);
    assert.equal(frame.visible[compiled.partIds.indexOf(id)], 1);
  }
  const endpoints = stepIds.map((id) => getStepTime(compiled, id).endMs);
  for (const index of [0, 1, 2, 1, 0, 2]) {
    sampleAssembly(compiled, endpoints[index], frame);
    assert.deepEqual(installedIds(frame), introductions.slice(0, index + 1).flat().sort());
    assert.equal(frame.counts.robotInstalled, [3, 5, 7][index]);
    assert.equal(frame.counts.stepsComplete, index + 1);
  }
  const events = model.installations.filter((event) => bracketIds.includes(event.partInstanceId)).map((event) => ({
    id: event.partInstanceId, time: getStepTime(compiled, event.stepId).startMs + event.atMs
  }));
  const boundaries = [...new Set(events.map((event) => event.time))].sort((a, b) => a - b);
  for (const boundary of [...boundaries, ...[...boundaries].reverse()]) {
    for (const time of [boundary - 0.001, boundary, boundary - 0.001, boundary]) {
      sampleAssembly(compiled, time, frame);
      assert.deepEqual(installedIds(frame), events.filter((event) => event.time <= time).map((event) => event.id).sort());
      assert.equal(frame.counts.robotInstalled, installedIds(frame).length);
    }
  }
});

function snapshot(frame: AssemblyFrame) {
  return { time: frame.timeMs, step: frame.stepIndex, poses: [...frame.transforms], internal: [...frame.internalTransforms],
    installed: [...frame.installed], active: [...frame.active], visible: [...frame.visible], connected: [...frame.connected], counts: { ...frame.counts } };
}
test('real model random, direct, forward and reverse seeks reproduce poses and installed sets in the same output buffers', () => {
  const frame = createFrame(compiled);
  const buffers = [frame.transforms, frame.internalTransforms, frame.installed, frame.active, frame.visible, frame.connected, frame.counts];
  const times = [0, compiled.durationMs, ...compiled.stepTimes.flatMap((step) => [step.startMs, (step.startMs + step.endMs) / 2, step.endMs])];
  for (const event of model.installations) {
    const time = getStepTime(compiled, event.stepId).startMs + event.atMs;
    times.push(time - 0.001, time);
  }
  let seed = 314159;
  for (let index = 0; index < 64; index++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    times.push(seed / 0x100000000 * compiled.durationMs);
  }
  const expected = new Map(times.map((time) => [time, snapshot(sampleAssembly(compiled, time, createFrame(compiled)))]));
  const ascending = [...times].sort((a, b) => a - b);
  for (const time of [...ascending, ...[...ascending].reverse(), ...times]) {
    assert.strictEqual(sampleAssembly(compiled, time, frame), frame);
    assert.deepEqual(snapshot(frame), expected.get(time), `seek ${time}`);
    [frame.transforms, frame.internalTransforms, frame.installed, frame.active, frame.visible, frame.connected, frame.counts]
      .forEach((buffer, index) => assert.strictEqual(buffer, buffers[index]));
  }
});
