import assert from 'node:assert/strict';
import test from 'node:test';
import { compileAssembly, createFrame, getStepAtTime, getStepTime, sampleAssembly } from '../../src/lib/assembly/engine.ts';
import { composeTransforms, identityTransform, quaternionFromAxisAngle, quaternionMultiply, relativeTransform, transformsEqual } from '../../src/lib/core/transforms.ts';
import type { AssemblyFrame, AssemblyOperation, CameraPreset, Evidence, MotionStage, PlacementEvidence, RobotModel, SourceReference, Transform } from '../../src/lib/types/model.ts';

// Analytic test specimens, not robot manifests or claims about manufacturer geometry.
const source: SourceReference = { documentId: 'test-source', sourceUrl: 'https://example.test/instructions', page: 1, confidence: 1 };
const evidence: Evidence = { category: 'app-authored', confidence: 1, sources: [source], note: 'Analytic engine fixture' };
const placement: PlacementEvidence = { relationship: evidence, placement: 'measured-attachment', evidence, fit: 'verified' };
const camera: CameraPreset = { position: [30, 40, 50], target: [0, 0, 0], up: [0, 1, 0], projection: 'perspective', framing: 40, transitionMs: 20 };
function pose(x = 0, y = 0, z = 0): Transform { return { position: [x, y, z], quaternion: [0, 0, 0, 1], scale: [1, 1, 1] }; }

function fixture(count = 4): RobotModel {
  const parts: RobotModel['parts'] = Array.from({ length: count }, (_, i) => ({
    id: `pin-${i}`, name: `Analytic pin ${i}`, geometryId: 'test.dat', materialId: 'test-material',
    initialTransform: pose(-20, 0, i * 8), finalTransform: pose(0, 0, i * 8),
    connectionPoints: [{ id: 'seat', type: 'surface', localTransform: pose(), evidence: placement }],
    geometryConfidence: 1, inventoryScope: 'robot', category: 'connector', identityEvidence: evidence, placementEvidence: placement
  }));
  const stages: MotionStage[] = parts.flatMap((part, i): MotionStage[] => [
    { id: `approach-${i}`, startMs: 0, durationMs: 40, phase: 'approach', nodes: [{ kind: 'part', id: part.id }],
      fromTransforms: [part.initialTransform], toTransforms: [pose(-10, 0, i * 8)],
      trajectory: { type: 'cubic-bezier', control1: [-20, 10, i * 8], control2: [-10, 10, i * 8] }, easing: 'linear', evidence: placement },
    { id: `insert-${i}`, startMs: 40, durationMs: 60, phase: 'insert', nodes: [{ kind: 'part', id: part.id }],
      fromTransforms: [pose(-10, 0, i * 8)], toTransforms: [part.finalTransform], trajectory: { type: 'linear' },
      insertion: { axis: [1, 0, 0], depthMm: 10 }, easing: 'smoothstep', evidence: placement }
  ]);
  stages.sort((a, b) => a.startMs - b.startMs);
  return {
    schemaVersion: 1, id: 'analytic-assembly', name: 'Analytic assembly', manufacturer: 'Test', edition: 'Test', category: 'Test', complexity: 'Test', description: 'Analytic engine test',
    sourceDocuments: [{ id: 'test-source', title: 'Test', sourceUrl: source.sourceUrl, edition: 'Test', sha256: 'test-only', pageCount: 1, redistribution: 'link-only' }],
    parts,
    geometryAssets: [{ id: 'test.dat', url: '/test-only.dat', format: 'dat', sha256: 'test-only', dependencyIds: [], nativeUnits: 'mm', nativeToScene: pose(), preserveOrigin: true,
      attribution: [], materialSlots: [], internalNodes: [{ id: 'rotor', localTransform: pose(0, 2, 0) }] }],
    materials: [{ id: 'test-material', name: 'Test', color: '#ffffff', metalness: 0, roughness: 1, opacity: 1, category: 'plastic', evidence }],
    steps: [{ id: 'install', title: 'Insert four pins', description: 'Four independent test specimens', kind: 'numbered-instruction', action: 'assembly', sourceReferences: [source], operationIds: ['insert'], requiredPartInstanceIds: parts.map((p) => p.id), warnings: [], durationMs: 100 }],
    operations: [{ id: 'insert', stepId: 'install', operationType: 'insert', partInstanceIds: parts.map((p) => p.id), fromTransforms: parts.map((p) => p.initialTransform), toTransforms: parts.map((p) => p.finalTransform), durationMs: 100, startMs: 0, easing: 'linear', dependencies: [], stages, parentChanges: [], evidence: placement, sourceReference: source }],
    installations: parts.map((p) => ({ partInstanceId: p.id, stepId: 'install', atMs: 100, operationId: 'insert' })),
    visibility: [], subassemblies: [], connections: [], joints: [], linkageConstraints: [], motors: [], cables: [],
    inventory: [{ id: 'pins', name: 'Pins', scope: 'robot', basis: 'prepared-callout-units', accounting: 'tracked', quantity: count, partInstanceIds: parts.map((p) => p.id), sourceReferences: [source] }],
    milestones: [], sourceMappings: [{ source, stepId: 'install', operationId: 'insert' }], scenarios: [],
    coverage: { documentedSteps: 1, implementedSteps: 1, verifiedSteps: 1, modeledComponents: count, verifiedComponents: count, geometryConfidence: 1,
      dimensions: { inventory: { status: 'complete', verified: count, total: count, note: 'Test' }, geometry: { status: 'complete', verified: count, total: count, note: 'Test' }, placement: { status: 'complete', verified: count, total: count, note: 'Test' }, kinematics: { status: 'unimplemented', verified: 0, note: 'Test' }, simulation: { status: 'unimplemented', verified: 0, note: 'Test' } }, outstandingDeviations: [] }
  };
}
function snapshot(frame: AssemblyFrame): unknown {
  return { time: frame.timeMs, step: frame.stepIndex, transforms: [...frame.transforms], subassemblies: [...frame.subassemblyTransforms],
    internal: [...frame.internalTransforms], environment: [...frame.environmentTransforms], environmentVisible: [...frame.environmentVisible],
    installed: [...frame.installed], active: [...frame.active], visible: [...frame.visible], connected: [...frame.connected], counts: { ...frame.counts } };
}
function close(actual: number, expected: number, tolerance = 1e-8): void { assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`); }

function addViewAndWiring(model: RobotModel): void {
  model.steps.push(
    { id: 'view', title: 'Turn the source view', description: 'Camera, not physical motion', kind: 'numbered-instruction', action: 'view', sourceReferences: [source], operationIds: ['view-op'], requiredPartInstanceIds: [], warnings: [], durationMs: 50, cameraPreset: camera },
    { id: 'wire', title: 'Connect existing devices', description: 'No new counted hardware', kind: 'numbered-instruction', action: 'wiring', sourceReferences: [source], operationIds: ['wire-op'], requiredPartInstanceIds: ['pin-0', 'pin-1'], warnings: [], durationMs: 50 }
  );
  model.operations.push(
    { id: 'view-op', stepId: 'view', operationType: 'align', partInstanceIds: [], fromTransforms: [], toTransforms: [], startMs: 0, durationMs: 50, easing: 'linear', dependencies: ['insert'], stages: [], parentChanges: [], evidence: { ...placement, placement: 'presentation-only' }, sourceReference: source },
    { id: 'wire-op', stepId: 'wire', operationType: 'connect', partInstanceIds: ['pin-0', 'pin-1'], fromTransforms: model.parts.slice(0, 2).map((p) => p.finalTransform), toTransforms: model.parts.slice(0, 2).map((p) => p.finalTransform), startMs: 0, durationMs: 50, easing: 'linear', dependencies: ['view-op'], stages: [], parentChanges: [], evidence: placement, sourceReference: source }
  );
  model.connections.push({ id: 'connection', a: { partInstanceId: 'pin-0', connectionPointId: 'seat' }, b: { partInstanceId: 'pin-1', connectionPointId: 'seat' }, type: 'contact', installedByOperationId: 'wire-op', evidence: placement });
  model.visibility.push({ partInstanceId: 'pin-3', stepId: 'view', atMs: 0, visible: false }, { partInstanceId: 'pin-3', stepId: 'view', atMs: 50, visible: true });
}

test('absolute random seeks are history-independent, analytic, and reuse every output buffer', () => {
  const model = fixture(); addViewAndWiring(model);
  const original = structuredClone(model), compiled = compileAssembly(model), frame = createFrame(compiled), reference = createFrame(compiled);
  const buffers = [frame.transforms, frame.subassemblyTransforms, frame.internalTransforms, frame.environmentTransforms, frame.environmentVisible, frame.active, frame.installed, frame.visible, frame.connected, frame.counts];
  sampleAssembly(compiled, 20, frame);
  close(frame.transforms[0], -15); close(frame.transforms[1], 7.5);
  sampleAssembly(compiled, 70, frame); close(frame.transforms[0], -5);
  let seed = 17;
  for (let i = 0; i < 100; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const time = (seed / 0x100000000) * 240 - 20;
    sampleAssembly(compiled, i % 2 ? 200 : 0, reference);
    sampleAssembly(compiled, time, reference);
    assert.strictEqual(sampleAssembly(compiled, time, frame), frame);
    assert.deepEqual(snapshot(frame), snapshot(reference));
  }
  for (const time of [0, 40, 70, 100, 150, 200, 150, 99, 0, 200, 0]) {
    sampleAssembly(compiled, time, frame); sampleAssembly(compiled, time, reference);
    assert.deepEqual(snapshot(frame), snapshot(reference));
  }
  [frame.transforms, frame.subassemblyTransforms, frame.internalTransforms, frame.environmentTransforms, frame.environmentVisible, frame.active, frame.installed, frame.visible, frame.connected, frame.counts]
    .forEach((buffer, index) => assert.strictEqual(buffer, buffers[index]));
  assert.deepEqual(model, original);
});

test('four pins count individually at the exact seating boundary in both directions', () => {
  const compiled = compileAssembly(fixture()), frame = createFrame(compiled);
  for (const [time, installed] of [[0, 0], [99.999, 0], [100, 4], [101, 4], [99.999, 0], [-1, 0], [100, 4]]) {
    sampleAssembly(compiled, time, frame);
    assert.equal(frame.counts.robotInstalled, installed); assert.equal(frame.counts.robotTotal, 4);
    assert.deepEqual([...frame.installed], Array(4).fill(installed ? 1 : 0));
    assert.equal(frame.counts.stepsComplete, installed ? 1 : 0);
  }
  assert.deepEqual([...frame.active], [0, 0, 0, 0]);
  assert.equal(frame.timeMs, 100);
});

test('camera-only pages preserve poses and wiring commits without recounting inventory', () => {
  const model = fixture(); addViewAndWiring(model);
  const compiled = compileAssembly(model), frame = createFrame(compiled);
  sampleAssembly(compiled, 100, frame); const finalPoses = [...frame.transforms];
  assert.equal(getStepAtTime(compiled, 100)?.stepId, 'view'); assert.equal(frame.visible[3], 0);
  for (const [time, connected] of [[125, 0], [150, 0], [199.999, 0], [200, 1], [199.999, 0], [99, 0]]) {
    sampleAssembly(compiled, time, frame);
    assert.equal(frame.connected[0], connected);
    if (time >= 100) { assert.deepEqual([...frame.transforms], finalPoses); assert.equal(frame.counts.robotInstalled, 4); }
  }
  sampleAssembly(compiled, 150, frame); assert.equal(frame.visible[3], 1);
  sampleAssembly(compiled, 100, frame); assert.equal(frame.visible[3], 0);
  sampleAssembly(compiled, 99, frame); assert.equal(frame.visible[3], 1);
  assert.deepEqual(getStepTime(compiled, 'wire'), { index: 2, stepId: 'wire', startMs: 150, endMs: 200 });
  assert.equal(getStepAtTime(compiled, 200)?.stepId, 'wire');
  assert.equal(getStepAtTime(compiled, -20)?.stepId, 'install');
  assert.throws(() => getStepTime(compiled, 'absent'), /unknown step.*absent/);
});

test('signed full and fractional spins retain motion and exactly reach explicit endpoint orientations', () => {
  for (const turns of [-2, -0.25, 0.5, 1, 1.25]) {
    const model = fixture(1), part = model.parts[0], op = model.operations[0];
    part.category = 'fastener'; part.initialTransform = pose();
    part.finalTransform = { ...pose(), quaternion: quaternionFromAxisAngle([0, 1, 0], 2 * Math.PI * turns) };
    op.operationType = 'fasten'; op.fromTransforms = [part.initialTransform]; op.toTransforms = [part.finalTransform];
    op.stages = [{ id: 'spin', startMs: 0, durationMs: 100, phase: 'fasten', nodes: [{ kind: 'part', id: part.id }], fromTransforms: [part.initialTransform], toTransforms: [part.finalTransform], trajectory: { type: 'linear' }, spin: { axis: [0, 1, 0], turns }, insertion: { axis: [0, 1, 0], depthMm: 0 }, easing: 'linear', evidence: placement }];
    const compiled = compileAssembly(model), frame = createFrame(compiled);
    sampleAssembly(compiled, 25, frame);
    const q = quaternionFromAxisAngle([0, 1, 0], 2 * Math.PI * turns / 4);
    const actual: Transform = { position: [0, 0, 0], quaternion: [frame.transforms[3], frame.transforms[4], frame.transforms[5], frame.transforms[6]], scale: [1, 1, 1] };
    assert.ok(transformsEqual(actual, { ...pose(), quaternion: q }));
    sampleAssembly(compiled, 100, frame); assert.deepEqual([...frame.transforms], [...part.finalTransform.position, ...part.finalTransform.quaternion, ...part.finalTransform.scale]);
    assert.equal(frame.counts.fastenersInstalled, 1);
    sampleAssembly(compiled, 0, frame); assert.deepEqual([...frame.transforms], [0, 0, 0, 0, 0, 0, 1, 1, 1, 1]);
  }
});

test('shortest slerp crosses the quaternion sign boundary and spin uses the world axis', () => {
  const model = fixture(1), part = model.parts[0], op = model.operations[0];
  part.initialTransform = { ...pose(), quaternion: quaternionFromAxisAngle([0, 1, 0], 170 * Math.PI / 180) };
  part.finalTransform = { ...pose(), quaternion: quaternionFromAxisAngle([0, 1, 0], -170 * Math.PI / 180) };
  op.operationType = 'rotate'; op.fromTransforms = [part.initialTransform]; op.toTransforms = [part.finalTransform];
  op.stages = [{ id: 'orientation', startMs: 0, durationMs: 100, phase: 'align', nodes: [{ kind: 'part', id: part.id }], fromTransforms: op.fromTransforms, toTransforms: op.toTransforms, trajectory: { type: 'linear' }, easing: 'linear', evidence: placement }];
  let compiled = compileAssembly(model), frame = createFrame(compiled);
  sampleAssembly(compiled, 50, frame);
  close(Math.abs(frame.transforms[4]), 1); close(frame.transforms[6], 0);
  part.initialTransform = pose();
  part.finalTransform = { ...pose(), quaternion: quaternionFromAxisAngle([0, 0, 1], Math.PI / 2) };
  op.fromTransforms = [part.initialTransform]; op.toTransforms = [part.finalTransform];
  op.stages[0].fromTransforms = op.fromTransforms; op.stages[0].toTransforms = op.toTransforms;
  op.stages[0].spin = { axis: [0, 1, 0], turns: 0.25 };
  compiled = compileAssembly(model); frame = createFrame(compiled);
  sampleAssembly(compiled, 50, frame);
  // inverse(Y90)*Z90 = [-.5,-.5,.5,.5]; its halfway shortest slerp from I is analytic.
  const d = 1 / (2 * Math.sqrt(3));
  const expected = quaternionMultiply(quaternionFromAxisAngle([0, 1, 0], Math.PI / 4), [-d, -d, d, Math.sqrt(3) / 2]);
  expected.forEach((value, i) => close(frame.transforms[3 + i], value));
  sampleAssembly(compiled, 100, frame);
  part.finalTransform.quaternion.forEach((value, i) => close(frame.transforms[3 + i], value));
});

test('robot/sample scopes and reference-only inventory remain separate accounting units', () => {
  const model = fixture(2);
  model.parts[1].inventoryScope = 'sample';
  model.inventory[0].quantity = 1; model.inventory[0].partInstanceIds = ['pin-0'];
  model.inventory.push({ ...model.inventory[0], id: 'sample', scope: 'sample', partInstanceIds: ['pin-1'] },
    { ...model.inventory[0], id: 'alternative-source-count', accounting: 'reference-only', quantity: 200, partInstanceIds: [], discrepancy: 'Not the tracked basis' });
  const compiled = compileAssembly(model), frame = createFrame(compiled);
  sampleAssembly(compiled, 100, frame);
  assert.equal(frame.counts.robotTotal, 1); assert.equal(frame.counts.sampleTotal, 1);
  assert.equal(frame.counts.robotInstalled, 1); assert.equal(frame.counts.sampleInstalled, 1);
});

function nestedFixture(): RobotModel {
  const model = fixture(1), part = model.parts[0], rotation = quaternionFromAxisAngle([0, 0, 1], Math.PI / 2);
  part.subassemblyId = 'inner'; part.initialTransform = pose(2, 5); part.finalTransform = { ...pose(25, 2), quaternion: rotation };
  model.subassemblies = [
    { id: 'moving', name: 'Moving root', localTransform: pose(), partInstanceIds: [], childSubassemblyIds: ['inner'], evidence: placement },
    { id: 'inner', name: 'Nested rigid child', parentId: 'moving', localTransform: pose(0, 5), partInstanceIds: [part.id], childSubassemblyIds: [], evidence: placement },
    { id: 'mount', name: 'Receiving assembly', localTransform: pose(30), partInstanceIds: [], childSubassemblyIds: [], evidence: placement }
  ];
  const first: AssemblyOperation = {
    ...model.operations[0], operationType: 'merge-subassemblies', fromTransforms: [part.initialTransform], toTransforms: [{ ...pose(5, 2), quaternion: rotation }],
    stages: [{ id: 'root-transfer', startMs: 0, durationMs: 100, phase: 'transfer', nodes: [{ kind: 'subassembly', id: 'moving' }], fromTransforms: [pose()], toTransforms: [{ ...pose(10), quaternion: rotation }], trajectory: { type: 'linear' }, easing: 'linear', evidence: placement }],
    parentChanges: [{ node: { kind: 'subassembly', id: 'moving' }, fromParent: null, toParent: { kind: 'subassembly', id: 'mount' }, fromLocalTransform: { ...pose(10), quaternion: rotation }, toLocalTransform: { ...pose(-20), quaternion: rotation } }]
  };
  model.operations = [first, { ...first, id: 'carry', stepId: 'carry-step', dependencies: ['insert'], fromTransforms: first.toTransforms, toTransforms: [part.finalTransform], parentChanges: [], stages: [{ id: 'carry-root', startMs: 0, durationMs: 100, phase: 'transfer', nodes: [{ kind: 'subassembly', id: 'mount' }], fromTransforms: [pose(30)], toTransforms: [pose(50)], trajectory: { type: 'linear' }, easing: 'linear', evidence: placement }] }];
  model.steps.push({ ...model.steps[0], id: 'carry-step', title: 'Carry existing nested assembly', action: 'reuse', operationIds: ['carry'] });
  return model;
}

test('nested root motion is rigid and merging preserves world pose before carrying descendants', () => {
  const compiled = compileAssembly(nestedFixture()), frame = createFrame(compiled);
  sampleAssembly(compiled, 50, frame);
  close(frame.transforms[0], 5 - 3 / Math.sqrt(2)); close(frame.transforms[1], 7 / Math.sqrt(2));
  sampleAssembly(compiled, 100 - 1e-7, frame); const before = [...frame.transforms];
  sampleAssembly(compiled, 100, frame); close(frame.transforms[0], 5); close(frame.transforms[1], 2);
  before.forEach((value, i) => close(frame.transforms[i], value, 1e-6));
  sampleAssembly(compiled, 150, frame); close(frame.transforms[0], 15); close(frame.transforms[1], 2);
  assert.equal(frame.counts.robotInstalled, 1);
  sampleAssembly(compiled, 200, frame); close(frame.transforms[0], 25);
  sampleAssembly(compiled, 50, frame); close(frame.transforms[0], 5 - 3 / Math.sqrt(2)); assert.equal(frame.counts.robotInstalled, 0);
});

test('consumers read completed merged root and descendant world poses with reusable, resettable hierarchy buffers', () => {
  const compiled = compileAssembly(nestedFixture()), frame = createFrame(compiled);
  const buffer = frame.subassemblyTransforms, parts = frame.transforms;
  assert.deepEqual(compiled.subassemblyIds, ['moving', 'inner', 'mount']);
  function read(data: Float64Array, index: number): Transform {
    const offset = index * 10;
    return {
      position: [data[offset], data[offset + 1], data[offset + 2]],
      quaternion: [data[offset + 3], data[offset + 4], data[offset + 5], data[offset + 6]],
      scale: [data[offset + 7], data[offset + 8], data[offset + 9]]
    };
  }
  function expectWorld(time: number): void {
    const t = Math.max(0, Math.min(200, time)), transfer = Math.min(t / 100, 1), carry = Math.max(t - 100, 0) / 100;
    const moving = { ...pose(10 * transfer + 20 * carry), quaternion: quaternionFromAxisAngle([0, 0, 1], Math.PI / 2 * transfer) };
    const inner = composeTransforms(moving, pose(0, 5));
    const mount = pose(30 + 20 * carry);
    for (const [id, expected] of [['moving', moving], ['inner', inner], ['mount', mount]] as const) {
      assert.ok(transformsEqual(read(frame.subassemblyTransforms, compiled.subassemblyIds.indexOf(id)), expected), `${id} world pose at ${time}`);
    }
    assert.ok(transformsEqual(read(frame.transforms, 0), composeTransforms(inner, pose(2))), `descendant part world pose at ${time}`);
    assert.strictEqual(frame.subassemblyTransforms, buffer); assert.strictEqual(frame.transforms, parts);
  }
  expectWorld(0);
  sampleAssembly(compiled, compiled.durationMs, frame); expectWorld(200);
  // These completed module roots differ from their authored initial localTransform.
  close(read(buffer, compiled.subassemblyIds.indexOf('moving')).position[0], 30);
  close(read(buffer, compiled.subassemblyIds.indexOf('inner')).position[0], 25);
  let seed = 23;
  for (const time of [200, 150, 100, 99.999, 50, 0, 200, 0, ...Array.from({ length: 30 }, () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000 * 240 - 20;
  })]) {
    buffer.fill(-999);
    sampleAssembly(compiled, time, frame); expectWorld(time);
  }
  sampleAssembly(compiled, 150, frame);
  const before = snapshot(frame), foreign = createFrame(compileAssembly(nestedFixture())), foreignBefore = snapshot(foreign);
  for (const replacement of [foreign.subassemblyTransforms, new Float64Array(buffer.length - 1)]) {
    Object.defineProperty(frame, 'subassemblyTransforms', { value: replacement });
    assert.throws(() => sampleAssembly(compiled, 0, frame), /foreign or incorrectly sized output lanes/);
    assert.deepEqual(snapshot(foreign), foreignBefore);
    Object.defineProperty(frame, 'subassemblyTransforms', { value: buffer });
    assert.deepEqual(snapshot(frame), before);
  }
  for (const time of [NaN, Infinity, -Infinity]) {
    assert.throws(() => sampleAssembly(compiled, time, frame), /time must be finite/);
    assert.deepEqual(snapshot(frame), before);
  }
  assert.throws(() => sampleAssembly(foreign.compiled, 0, frame), /another compilation/);
  assert.deepEqual(snapshot(frame), before);
});

test('external simulation props reset in the same frame without entering official assembly accounting', () => {
  const model = fixture(1);
  model.simulationObjects = [{ id: 'demo-block', name: 'App-authored demo block', geometryId: 'test.dat', materialId: 'test-material', initialTransform: pose(12, 3, 4), evidence }];
  const compiled = compileAssembly(model), frame = createFrame(compiled), foreign = createFrame(compiled);
  const environment = frame.environmentTransforms, visible = frame.environmentVisible;
  assert.deepEqual(compiled.simulationObjectIds, ['demo-block']);
  assert.deepEqual([...environment], [12, 3, 4, 0, 0, 0, 1, 1, 1, 1]);
  assert.deepEqual([...visible], [0]);
  for (const time of [100, 40, 0, 100, 0]) {
    environment.fill(999); visible.fill(1);
    sampleAssembly(compiled, time, frame);
    assert.deepEqual([...environment], [12, 3, 4, 0, 0, 0, 1, 1, 1, 1]); assert.deepEqual([...visible], [0]);
    assert.strictEqual(frame.environmentTransforms, environment); assert.strictEqual(frame.environmentVisible, visible);
    assert.equal(frame.counts.robotTotal, 1); assert.equal(frame.counts.sampleTotal, 0);
  }
  for (const key of ['environmentTransforms', 'environmentVisible'] as const) {
    const original = frame[key], before = snapshot(frame), otherBefore = snapshot(foreign);
    Object.defineProperty(frame, key, { value: foreign[key] });
    assert.throws(() => sampleAssembly(compiled, 100, frame), /foreign or incorrectly sized output lanes/);
    Object.defineProperty(frame, key, { value: original });
    assert.deepEqual(snapshot(frame), before); assert.deepEqual(snapshot(foreign), otherBefore);
  }
  const invalid = structuredClone(model); invalid.simulationObjects![0].id = model.parts[0].id;
  assert.throws(() => compileAssembly(invalid), /ID collides with assembly node/);
  invalid.simulationObjects![0].id = 'demo-block'; invalid.simulationObjects![0].geometryId = 'absent';
  assert.throws(() => compileAssembly(invalid), /simulation object.*unknown geometry/);
});

test('invalid times and foreign frames fail before mutating any output lane; defaults reset', () => {
  const compiled = compileAssembly(fixture()), frame = createFrame(compiled);
  sampleAssembly(compiled, 70, frame); const before = snapshot(frame);
  for (const time of [NaN, Infinity, -Infinity]) {
    assert.throws(() => sampleAssembly(compiled, time, frame), /time must be finite/);
    assert.deepEqual(snapshot(frame), before);
    assert.throws(() => getStepAtTime(compiled, time), /time must be finite/);
  }
  const foreign = compileAssembly(fixture());
  assert.throws(() => sampleAssembly(foreign, 0, frame), /another compilation/); assert.deepEqual(snapshot(frame), before);
  frame.internalTransforms.fill(123); sampleAssembly(compiled, 0, frame);
  assert.deepEqual([...frame.internalTransforms.slice(0, 10)], [0, 2, 0, 0, 0, 0, 1, 1, 1, 1]);
});

test('compile rejects dependency cycles, overlaps, bad references, inventory, insertion and final poses', () => {
  const cases: [string, (model: RobotModel) => void, RegExp][] = [
    ['cycle', (m) => { m.operations[0].dependencies = ['insert']; }, /dependency cycle/],
    ['overlap', (m) => { m.operations[0].stages.splice(1, 0, { ...m.operations[0].stages[0], id: 'overlap' }); }, /overlapping writers/],
    ['duplicate part', (m) => { m.parts.push(m.parts[0]); }, /duplicate.*part ID/],
    ['duplicate install', (m) => { m.installations.push(m.installations[0]); }, /duplicate installation/],
    ['missing install', (m) => { m.installations.pop(); }, /missing installation/],
    ['unknown asset', (m) => { m.parts[0].geometryId = 'missing.dat'; }, /unknown geometry/],
    ['unknown material', (m) => { m.parts[0].materialId = 'missing'; }, /unknown material/],
    ['inventory', (m) => { m.inventory[0].quantity = 1; }, /quantity differs/],
    ['axis', (m) => { m.operations[0].stages[4].insertion!.depthMm = 9; }, /axis\/depth disagree/],
    ['final', (m) => { m.parts[0].finalTransform = pose(1); }, /sampled final pose/],
    ['quaternion', (m) => { m.parts[0].initialTransform = { ...pose(), quaternion: [0, 0, 0, 2] }; }, /quaternion must be normalized/],
    ['nonfinite', (m) => { m.operations[0].durationMs = NaN; }, /number must be finite/],
    ['coverage', (m) => { m.steps[0].operationIds = []; }, /no operation covers/]
  ];
  for (const [name, mutate, expected] of cases) {
    const model = fixture(); mutate(model);
    assert.throws(() => compileAssembly(model), expected, name);
  }
  const cycle = nestedFixture(); cycle.operations[0].parentChanges[0].toParent = { kind: 'subassembly', id: 'inner' };
  assert.throws(() => compileAssembly(cycle), /parent cycle/);
  const discontinuity = nestedFixture(); discontinuity.operations[0].parentChanges[0].toLocalTransform.position[0] = -19;
  assert.throws(() => compileAssembly(discontinuity), /reparent breaks world continuity/);
  const doubleWriter = nestedFixture();
  doubleWriter.operations[0].stages.push({ ...doubleWriter.operations[0].stages[0], id: 'child-writer', nodes: [{ kind: 'part', id: 'pin-0' }], fromTransforms: [doubleWriter.parts[0].initialTransform], toTransforms: doubleWriter.operations[0].toTransforms });
  assert.throws(() => compileAssembly(doubleWriter), /root\/descendant double writers/);
});

test('zero-step assembly and reusable transform math have well-defined endpoints', () => {
  const model = fixture(0); model.steps = []; model.operations = []; model.sourceMappings = [];
  const compiled = compileAssembly(model), frame = createFrame(compiled);
  assert.equal(compiled.durationMs, 0); assert.equal(getStepAtTime(compiled, 10), null);
  sampleAssembly(compiled, 10, frame); assert.equal(frame.stepIndex, -1); assert.equal(frame.timeMs, 0);
  const parent = { ...pose(10, 20, 30), quaternion: quaternionFromAxisAngle([0, 1, 0], Math.PI / 2) };
  const local = { ...pose(3, 4, 5), quaternion: quaternionFromAxisAngle([1, 0, 0], 0.3) };
  const world = composeTransforms(parent, local);
  close(world.position[0], 15); close(world.position[1], 24); close(world.position[2], 27);
  assert.ok(transformsEqual(relativeTransform(parent, world), local));
  assert.ok(transformsEqual(composeTransforms(identityTransform(), local), local));
});
