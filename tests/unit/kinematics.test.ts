import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { compileAssembly, createFrame, sampleAssembly } from '../../src/lib/assembly/engine.ts';
import { compileSimulation, createSimulationFrame, sampleSimulation } from '../../src/lib/simulation/kinematics.ts';
import { composeTransforms, identityTransform, quaternionFromAxisAngle, readTransform, transformsEqual } from '../../src/lib/core/transforms.ts';
import type { Evidence, Joint, NodeRef, PlacementEvidence, RobotModel, SimulationFrame, SimulationScenario, Transform, Vec3 } from '../../src/lib/types/model.ts';

// Explicit analytic specimens, not substitute robots, vendor assets or manufacturer dimensions.
const source = { documentId: 'analytic', sourceUrl: 'https://example.test/analytic', confidence: 1 };
const evidence: Evidence = { category: 'app-authored', confidence: 1, sources: [source], note: 'Independent analytic mechanism fixture; no vendor geometry claim' };
const placement: PlacementEvidence = { relationship: evidence, placement: 'measured-attachment', evidence, fit: 'verified' };
const pose = (x = 0, y = 0, z = 0, angle = 0): Transform => ({ position: [x, y, z], quaternion: quaternionFromAxisAngle([0, 1, 0], angle), scale: [1, 1, 1] });
const part = (id: string): NodeRef => ({ kind: 'part', id });
const sub = (id: string): NodeRef => ({ kind: 'subassembly', id });
function close(actual: number, expected: number, tolerance = 1e-7): void { assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`); }
function poseClose(actual: Transform, expected: Transform, tolerance = 1e-7): void { assert.ok(transformsEqual(actual, expected, tolerance), `${JSON.stringify(actual)} != ${JSON.stringify(expected)}`); }
function joint(id: string, parent: NodeRef, child: NodeRef, origin = pose(), childTransform = pose(), axis: Vec3 = [0, 1, 0], zero = 0): Joint {
  return { id, name: id, type: 'revolute', parent, child, origin, childTransform, axis, zero, evidence: placement };
}
type Spec = { id: string; world: Transform; parent?: string; category?: RobotModel['parts'][number]['category']; sample?: boolean };
function fixture(specs: Spec[], groups: { id: string; local: Transform; parent?: string }[] = [], joints: Joint[] = []): RobotModel {
  const parts: RobotModel['parts'] = specs.map((p) => ({ id: p.id, name: p.id, geometryId: 'analytic.dat', materialId: 'analytic-material', initialTransform: p.world, finalTransform: p.world, connectionPoints: [], subassemblyId: p.parent, sourceReference: source, geometryConfidence: 1, inventoryScope: p.sample ? 'sample' : 'robot', category: p.category ?? 'structure', identityEvidence: evidence, placementEvidence: placement }));
  return {
    schemaVersion: 1, id: 'analytic-mechanism', name: 'Analytic mechanism', manufacturer: 'Test', edition: 'Test', category: 'Test', complexity: 'Test', description: 'Mathematical test specimen',
    sourceDocuments: [{ id: source.documentId, title: 'Analytic fixture', sourceUrl: source.sourceUrl, edition: 'Test', sha256: 'test-only', redistribution: 'link-only' }],
    geometryAssets: [{ id: 'analytic.dat', url: '/analytic-test-only.dat', format: 'dat', sha256: 'test-only', dependencyIds: [], nativeUnits: 'mm', nativeToScene: identityTransform(), preserveOrigin: true, attribution: [], materialSlots: [], internalNodes: [{ id: 'real-fixture-rotor', localTransform: pose(0, 2, 0) }] }],
    materials: [{ id: 'analytic-material', name: 'Analytic', color: '#ffffff', metalness: 0, roughness: 1, opacity: 1, category: 'plastic', evidence }], parts,
    subassemblies: groups.map((g) => ({ id: g.id, name: g.id, parentId: g.parent, localTransform: g.local, partInstanceIds: specs.filter((p) => p.parent === g.id).map((p) => p.id), childSubassemblyIds: groups.filter((p) => p.parent === g.id).map((p) => p.id), evidence: placement })),
    steps: [{ id: 'seated', title: 'Analytic initial fixture', description: 'Stationary seating test', kind: 'presentation', action: 'assembly', sourceReferences: [source], operationIds: ['seat'], requiredPartInstanceIds: parts.map((p) => p.id), warnings: [], durationMs: 1 }],
    operations: [{ id: 'seat', stepId: 'seated', operationType: 'align', partInstanceIds: parts.map((p) => p.id), fromTransforms: parts.map((p) => p.initialTransform), toTransforms: parts.map((p) => p.finalTransform), startMs: 0, durationMs: 1, easing: 'linear', dependencies: [], parentChanges: [], evidence: placement, sourceReference: source, stages: [{ id: 'seating', startMs: 0, durationMs: 1, phase: 'settle', nodes: parts.map((p) => part(p.id)), fromTransforms: parts.map((p) => p.initialTransform), toTransforms: parts.map((p) => p.finalTransform), trajectory: { type: 'linear' }, easing: 'linear', evidence: placement }] }],
    installations: parts.map((p) => ({ partInstanceId: p.id, stepId: 'seated', atMs: 1, operationId: 'seat' })), visibility: [], connections: [], joints, linkageConstraints: [], motors: [], cables: [],
    inventory: (['robot', 'sample'] as const).map((scope) => { const ids = parts.filter((p) => p.inventoryScope === scope).map((p) => p.id); return { id: scope, name: scope, scope, basis: 'prepared-callout-units', accounting: 'tracked', quantity: ids.length, partInstanceIds: ids, sourceReferences: [source] }; }),
    milestones: [], sourceMappings: [], scenarios: [], coverage: { documentedSteps: 0, implementedSteps: 0, verifiedSteps: 0, modeledComponents: parts.length, verifiedComponents: 0, geometryConfidence: 1, dimensions: { inventory: { status: 'unimplemented', verified: 0, note: 'Fixture' }, geometry: { status: 'unimplemented', verified: 0, note: 'Fixture' }, placement: { status: 'unimplemented', verified: 0, note: 'Fixture' }, kinematics: { status: 'unimplemented', verified: 0, note: 'Fixture' }, simulation: { status: 'unimplemented', verified: 0, note: 'Fixture' } }, outstandingDeviations: ['Analytic fixture, not a real robot'] }
  };
}
function scenario(durationMs = 1000): SimulationScenario { return { id: 'analytic-replay', title: 'Analytic', description: 'Test', fidelity: 'deterministic-kinematics', durationMs, motorCommands: [], sensorSignals: [], objectEvents: [], rootMotion: [], limitations: ['Analytic test specimen'], sourceReferences: [source] }; }
function motor(model: RobotModel, jointId: string, partId = model.parts[0].id): string { const id = `motor-${jointId}`; model.motors.push({ id, partInstanceId: partId, jointId, assignmentEvidence: evidence }); return id; }
function command(log: SimulationScenario, motorId: string, from: number, to: number, mode: 'position' | 'speed' = 'position', easing: 'linear' | 'smoothstep' = 'linear'): void { log.motorCommands.push({ motorId, startMs: 0, durationMs: log.durationMs, mode, from, to, unit: mode === 'speed' ? 'rad/s' : 'rad', easing, evidence }); }
function snap(frame: SimulationFrame): unknown { const a = frame.assembly; return { time: frame.timeMs, assemblyTime: a.timeMs, step: a.stepIndex, q: [...frame.jointValues], sensors: [...frame.sensorValues], parts: [...a.transforms], subs: [...a.subassemblyTransforms], internals: [...a.internalTransforms], environment: [...a.environmentTransforms], environmentVisible: [...a.environmentVisible], installed: [...a.installed], active: [...a.active], visible: [...a.visible], connected: [...a.connected], counts: { ...a.counts } }; }

test('joint zero, nontrivial parent/pivot composition, rotor-only binding and completed counts', () => {
  const root = pose(12, 3, -4, 0.4), origin = pose(2, 1, -1), childTransform = pose(3, 0, 0), childWorld = composeTransforms(root, composeTransforms(origin, childTransform));
  const j = joint('pivot', sub('root'), sub('moving'), origin, childTransform, [0, 1, 0], 0.3);
  j.limits = { min: -1, max: 2, basis: 'modeled', evidence }; j.maxSpeed = { value: 3, basis: 'modeled', evidence };
  j.internalBinding = { partInstanceId: 'motor-body', geometryNodeId: 'real-fixture-rotor', movingSide: 'rotor' };
  const model = fixture([{ id: 'motor-body', world: composeTransforms(root, origin), parent: 'root', category: 'motor' }, { id: 'moving-part', world: childWorld, parent: 'moving' }, { id: 'sensor', world: root, parent: 'root', category: 'sensor' }], [{ id: 'root', local: root }, { id: 'moving', local: composeTransforms(origin, childTransform), parent: 'root' }], [j]);
  const log = scenario(); command(log, motor(model, 'pivot'), 0.3, 1.3);
  log.sensorSignals = [{ sensorPartInstanceId: 'sensor', timeMs: 200, type: 'color', value: 'red', basis: 'scripted-input', evidence }, { sensorPartInstanceId: 'sensor', timeMs: 700, type: 'color', value: 'blue', basis: 'scripted-input', evidence }];
  const assembly = compileAssembly(model), compiled = compileSimulation(assembly, log), frame = createSimulationFrame(compiled), buffers = [frame.assembly.transforms, frame.assembly.subassemblyTransforms, frame.assembly.internalTransforms, frame.jointValues, frame.sensorValues, frame.assembly.counts];
  sampleSimulation(compiled, 500, frame); close(frame.jointValues[0], 0.8);
  const expected = composeTransforms(root, composeTransforms(origin, composeTransforms(pose(0, 0, 0, 0.5), childTransform)));
  poseClose(readTransform(frame.assembly.transforms, 10), expected); poseClose(readTransform(frame.assembly.transforms), model.parts[0].finalTransform);
  poseClose(readTransform(frame.assembly.internalTransforms), composeTransforms(pose(0, 0, 0, 0.5), pose(0, 2, 0)));
  assert.equal(frame.sensorValues[0], 'red'); assert.equal(frame.assembly.timeMs, assembly.durationMs); assert.equal(frame.assembly.counts.robotInstalled, 3); assert.equal(frame.assembly.counts.stepsComplete, 1);
  const reference = createSimulationFrame(compiled); let seed = 23;
  for (let i = 0; i < 80; i++) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; const time = seed / 0x100000000 * 1200 - 100; sampleSimulation(compiled, 1000, reference); sampleSimulation(compiled, time, reference); sampleSimulation(compiled, time, frame); assert.deepEqual(snap(frame), snap(reference)); }
  sampleSimulation(compiled, 0, frame); close(frame.jointValues[0], 0.3); assert.equal(frame.sensorValues[0], null);
  sampleSimulation(compiled, 10000, frame); assert.equal(frame.timeMs, 1000); assert.equal(frame.sensorValues[0], 'blue');
  [frame.assembly.transforms, frame.assembly.subassemblyTransforms, frame.assembly.internalTransforms, frame.jointValues, frame.sensorValues, frame.assembly.counts].forEach((lane, i) => assert.strictEqual(lane, buffers[i]));
});

test('output-mounted upper motor body moves while its actual rotor countertransforms', () => {
  const j = joint('upper', sub('root'), part('body'), pose(4, 2, 0), pose(0, -2, 0));
  j.internalBinding = { partInstanceId: 'body', geometryNodeId: 'real-fixture-rotor', movingSide: 'body' };
  const model = fixture([{ id: 'body', world: pose(4, 0, 0), parent: 'root', category: 'motor' }, { id: 'eye', world: pose(7, 0, 0), parent: 'carried' }], [{ id: 'root', local: pose() }, { id: 'carried', local: pose(), parent: 'root' }], [j]);
  // Make carried hardware a child of the real body through completed assembly parentage.
  const change = { node: sub('carried'), fromParent: sub('root'), toParent: part('body'), fromLocalTransform: pose(), toLocalTransform: pose(-4, 0, 0) };
  model.operations[0].parentChanges.push(change);
  const log = scenario(); command(log, motor(model, 'upper'), 0, Math.PI / 2);
  const compiled = compileSimulation(compileAssembly(model), log), frame = createSimulationFrame(compiled);
  sampleSimulation(compiled, 1000, frame);
  const body = readTransform(frame.assembly.transforms), rotor = readTransform(frame.assembly.internalTransforms);
  poseClose(body, composeTransforms(pose(4, 2, 0), composeTransforms(pose(0, 0, 0, Math.PI / 2), pose(0, -2, 0))));
  poseClose(composeTransforms(body, rotor), pose(4, 2, 0));
  close(frame.assembly.transforms[10], 4); close(frame.assembly.transforms[12], -3);
});

test('analytic speed integration, smoothstep position, fixed/prismatic units, coupling and classified limits', () => {
  const driver = joint('driver', sub('root'), part('a')), follower = joint('follower', sub('root'), part('b'));
  follower.coupling = { driverJointId: 'driver', ratio: -2, offset: 0, evidence }; follower.limits = { min: -5, max: 0, basis: 'modeled', evidence };
  const model = fixture([{ id: 'a', world: pose(), parent: 'root' }, { id: 'b', world: pose(), parent: 'root' }], [{ id: 'root', local: pose() }], [driver, follower]);
  const log = scenario(); command(log, motor(model, 'driver'), 0, 4, 'speed', 'smoothstep');
  const compiled = compileSimulation(compileAssembly(model), log), frame = createSimulationFrame(compiled);
  sampleSimulation(compiled, 500, frame); close(frame.jointValues[0], 0.375); close(frame.jointValues[1], -0.75);
  sampleSimulation(compiled, 1000, frame); close(frame.jointValues[0], 2); close(frame.jointValues[1], -4);
  const bad = structuredClone(log); bad.motorCommands[0].unit = 'mm/s'; assert.throws(() => compileSimulation(compileAssembly(model), bad), /expected rad\/s/);
  model.joints[1].limits!.min = -3; assert.throws(() => compileSimulation(compileAssembly(model), log), /outside modeled limits/); model.joints[1].limits!.min = -5;
  const overlap = structuredClone(log); overlap.motorCommands.push({ ...overlap.motorCommands[0], startMs: 500, durationMs: 500 }); assert.throws(() => compileSimulation(compileAssembly(model), overlap), /overlapping/);
  const unknown = structuredClone(log); unknown.motorCommands[0].motorId = 'unassigned'; assert.throws(() => compileSimulation(compileAssembly(model), unknown), /unknown\/unassigned/);
  const unbound = structuredClone(model); unbound.motors[0].assignmentEvidence = { ...evidence, category: 'unknown' }; assert.throws(() => compileSimulation(compileAssembly(unbound), log), /unresolved physical-axis/);
  const reversal = structuredClone(log); reversal.motorCommands[0].from = 4; reversal.motorCommands[0].to = -4; reversal.motorCommands[0].easing = 'linear';
  const narrow = structuredClone(model); narrow.joints[0].limits = { min: -1, max: 0.8, basis: 'modeled', evidence }; assert.throws(() => compileSimulation(compileAssembly(narrow), reversal), /outside modeled limits/);
  const excessive = structuredClone(model); excessive.joints[1].maxSpeed = { value: 3, basis: 'modeled', evidence }; assert.throws(() => compileSimulation(compileAssembly(excessive), log), /coupling exceeds/);
  const wrongPhysical = structuredClone(model); wrongPhysical.joints[0].limits = { min: -5, max: 5, basis: 'physical', evidence }; assert.throws(() => compileSimulation(compileAssembly(wrongPhysical), log), /physical limits require/);
  const cycle = structuredClone(model); cycle.joints[0].coupling = { driverJointId: 'follower', ratio: 1, offset: 0, evidence }; assert.throws(() => compileSimulation(compileAssembly(cycle), scenario()), /coupling cycle/);
  const linear = structuredClone(model); linear.joints[0].type = 'prismatic'; linear.joints[0].axis = [1, 0, 0]; linear.joints[1].coupling = undefined;
  const mm = scenario(); command(mm, 'motor-driver', 0, 4); mm.motorCommands[0].unit = 'mm'; mm.motorCommands[0].easing = 'smoothstep'; const mmCompiled = compileSimulation(compileAssembly(linear), mm), mmFrame = createSimulationFrame(mmCompiled); sampleSimulation(mmCompiled, 250, mmFrame); close(mmFrame.assembly.transforms[0], 0.625);
  linear.joints[0].type = 'fixed'; assert.throws(() => compileSimulation(compileAssembly(linear), mm), /fixed\/coupled\/passive/);
});

function driveFixture(leftFrom: number, leftTo: number, rightFrom: number, rightTo: number, easing: 'linear' | 'smoothstep' = 'linear'): { model: RobotModel; log: SimulationScenario } {
  const root = pose(10, 0, 20), leftOrigin = pose(-5, 2, 7), rightOrigin = pose(5, 2, 7);
  const model = fixture([{ id: 'left-wheel', world: composeTransforms(root, leftOrigin), parent: 'root', category: 'wheel' }, { id: 'right-wheel', world: composeTransforms(root, rightOrigin), parent: 'root', category: 'wheel' }], [{ id: 'root', local: root }], [joint('left', sub('root'), part('left-wheel'), leftOrigin, pose(), [-1, 0, 0]), joint('right', sub('root'), part('right-wheel'), rightOrigin, pose(), [-1, 0, 0])]);
  const log = scenario(); command(log, motor(model, 'left'), leftFrom, leftTo, 'speed', easing); command(log, motor(model, 'right'), rightFrom, rightTo, 'speed', easing);
  log.differentialDrive = { rootSubassemblyId: 'root', leftJointId: 'left', rightJointId: 'right', wheelRadiusMm: 2, trackWidthMm: 10, axleCenterInRoot: [0, 2, 7], initialTransform: root, evidence };
  return { model, log };
}
function axle(frame: SimulationFrame): Vec3 { return composeTransforms(readTransform(frame.assembly.subassemblyTransforms), pose(0, 2, 7)).position; }
test('drive follows actual wheel travel: straight, reverse, exact curvature, and offset axle root conjugation', () => {
  for (const speed of [2, -2]) { const { model, log } = driveFixture(speed, speed, speed, speed), compiled = compileSimulation(compileAssembly(model), log), frame = createSimulationFrame(compiled); sampleSimulation(compiled, 1000, frame); close(frame.assembly.subassemblyTransforms[0], 10); close(frame.assembly.subassemblyTransforms[2], 20 - 2 * speed); close(frame.jointValues[0], speed); close(frame.jointValues[1], speed); }
  for (const [left, right] of [[0, 2], [2, 0], [-1, -3]]) { const { model, log } = driveFixture(left, left, right, right), compiled = compileSimulation(compileAssembly(model), log), frame = createSimulationFrame(compiled); sampleSimulation(compiled, 1000, frame); const angle = 2 * (right - left) / 10, travel = left + right, radius = travel / angle, center = axle(frame); close(center[0], 10 + radius * (Math.cos(angle) - 1)); close(center[2], 27 - radius * Math.sin(angle)); close(frame.assembly.subassemblyTransforms[4], Math.sin(angle / 2)); assert.ok(Math.abs(frame.assembly.subassemblyTransforms[0] - center[0]) > 0.1, 'root is not incorrectly integrated at axle center'); }
  const proportional = driveFixture(0, 2, 0, 4, 'smoothstep'), compiled = compileSimulation(compileAssembly(proportional.model), proportional.log), frame = createSimulationFrame(compiled); sampleSimulation(compiled, 1000, frame); const angle = 0.2, center = axle(frame); close(center[0], 10 + 15 * (Math.cos(angle) - 1)); close(center[2], 27 - 15 * Math.sin(angle));
  const wrong = structuredClone(proportional.log); wrong.differentialDrive!.axleCenterInRoot = [0, 0, 0]; assert.throws(() => compileSimulation(compileAssembly(proportional.model), wrong), /actual wheel joint midpoint/);
  const conflict = structuredClone(proportional.log); conflict.rootMotion.push({ node: sub('root'), timeMs: 0, transform: pose(10, 0, 20), evidence }); assert.throws(() => compileSimulation(compileAssembly(proportional.model), conflict), /simultaneous rootMotion/);
});

test('variable-speed drive agrees with independent high-resolution quadrature and random replay', () => {
  const { model, log } = driveFixture(1, 2, 3, 0, 'smoothstep'), compiled = compileSimulation(compileAssembly(model), log), frame = createSimulationFrame(compiled);
  function expected(timeMs: number): [number, number] { const end = timeMs / 1000, n = 2000, h = end / n; let x = 0, z = 0; for (let k = 0; k <= n; k++) { const t = k * h, ease = t * t * (3 - 2 * t), integratedEase = t ** 3 - t ** 4 / 2, l = t + integratedEase, r = 3 * t - 3 * integratedEase, yaw = (r - l) / 5, v = 4 - 2 * ease, weight = k === 0 || k === n ? 1 : k % 2 ? 4 : 2; x -= Math.sin(yaw) * v * weight * h / 3; z -= Math.cos(yaw) * v * weight * h / 3; } return [10 + x, 27 + z]; }
  for (const time of [1000, 123.456, 0, 801.37, 333.333, 999.9, 77]) { sampleSimulation(compiled, time, frame); const result = axle(frame), reference = expected(time); close(result[0], reference[0], 2e-8); close(result[2], reference[1], 2e-8); const same = createSimulationFrame(compiled); sampleSimulation(compiled, time, same); assert.deepEqual(snap(frame), snap(same)); }
});

function loopFixture(branch: 'upper' | 'lower' = 'upper'): { model: RobotModel; log: SimulationScenario } {
  // Analytic crank/coupler/rocker specimen: actual closure, not a fixed-ratio proxy.
  const driverAngle = 0.7, a: Vec3 = [2 * Math.cos(driverAngle), 2 * Math.sin(driverAngle), 0];
  const followerAngle = branch === 'upper' ? 1.6 : 2 * Math.atan2(a[1], a[0] - 4) - 1.6;
  const b: Vec3 = [4 + 2.5 * Math.cos(followerAngle), 2.5 * Math.sin(followerAngle), 0], length = Math.hypot(a[0] - b[0], a[1] - b[1]);
  const d = joint('input', sub('root'), part('crank'), pose(), { ...pose(), quaternion: quaternionFromAxisAngle([0, 0, 1], driverAngle) }, [0, 0, 1], driverAngle);
  const f = joint('output', sub('root'), part('rocker'), pose(4, 0, 0), { ...pose(), quaternion: quaternionFromAxisAngle([0, 0, 1], followerAngle) }, [0, 0, 1], followerAngle);
  const model = fixture([{ id: 'crank', world: d.childTransform, parent: 'root' }, { id: 'rocker', world: composeTransforms(f.origin, f.childTransform), parent: 'root' }], [{ id: 'root', local: pose() }], [d, f]);
  model.linkageConstraints.push({ id: 'four-bar', type: 'planar-closed-loop', driverJointId: 'input', dependentJointIds: ['output'], planeNormal: [0, 0, 1], links: [{ a: { node: part('crank'), point: [2, 0, 0] }, b: { node: part('rocker'), point: [2.5, 0, 0] }, lengthMm: length }], referenceJointValues: [driverAngle, followerAngle], branch: 'reference-continuous', toleranceMm: 1e-5, evidence: placement });
  const log = scenario(); command(log, motor(model, 'input'), driverAngle, 1.1); return { model, log };
}
test('nonlinear closure solves reference branch at varied/random driver coordinates independently of history', () => {
  const { model, log } = loopFixture(), compiled = compileSimulation(compileAssembly(model), log), frame = createSimulationFrame(compiled), reference = createSimulationFrame(compiled), length = model.linkageConstraints[0].links[0].lengthMm;
  let seed = 19; const samples = [0, 1000, 500, 731, 0, 1000]; for (let k = 0; k < 80; k++) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; samples.push(seed / 0x100000000 * 1000); }
  let middle = 0;
  for (const time of samples) { sampleSimulation(compiled, time, frame); const d = frame.jointValues[0], f = frame.jointValues[1], ax = 2 * Math.cos(d), ay = 2 * Math.sin(d), bx = 4 + 2.5 * Math.cos(f), by = 2.5 * Math.sin(f); close(Math.hypot(ax - bx, ay - by), length, 1e-7); assert.ok(f > 0 && f < Math.PI, 'reference upper branch retained'); sampleSimulation(compiled, 1000 - time, reference); sampleSimulation(compiled, time, reference); assert.deepEqual(snap(frame), snap(reference)); if (time === 500) middle = f; }
  sampleSimulation(compiled, 1000, frame); assert.ok(Math.abs(middle - (1.6 + frame.jointValues[1]) / 2) > 1e-4, 'nonlinear linkage is not a fixed-ratio echo');
  const malformed = structuredClone(model); malformed.linkageConstraints[0].referenceJointValues = [1.6]; assert.throws(() => compileSimulation(compileAssembly(malformed), log), /referenceJointValues/);
  const unreachable = structuredClone(log); unreachable.motorCommands[0].to = -3; assert.throws(() => compileSimulation(compileAssembly(model), unreachable), /unreachable|singular/);
});

test('the authored reference selects the alternate nonlinear assembly branch', () => {
  const { model, log } = loopFixture('lower'), compiled = compileSimulation(compileAssembly(model), log), frame = createSimulationFrame(compiled);
  const length = model.linkageConstraints[0].links[0].lengthMm;
  for (const time of [1000, 0, 250, 800, 500]) {
    sampleSimulation(compiled, time, frame);
    const d = frame.jointValues[0], f = frame.jointValues[1];
    assert.ok(f > Math.PI, 'lower reference branch must not flip to upper');
    close(Math.hypot(2 * Math.cos(d) - 4 - 2.5 * Math.cos(f), 2 * Math.sin(d) - 2.5 * Math.sin(f)), length, 1e-7);
  }
});

test('two linked four-bars solve their shared motor branch together during compilation and arbitrary replay', () => {
  const d0 = 0.7, f0 = 1.6, g0 = 2.1;
  const z = (angle: number): Transform => ({ ...pose(), quaternion: quaternionFromAxisAngle([0, 0, 1], angle) });
  const input = joint('input', sub('root'), part('crank'), pose(), z(d0), [0, 0, 1], d0);
  const output = joint('output', sub('root'), part('rocker'), pose(4), z(f0), [0, 0, 1], f0);
  const second = joint('second', sub('root'), part('second-rocker'), pose(8), z(g0), [0, 0, 1], g0);
  const model = fixture([
    { id: 'crank', world: input.childTransform, parent: 'root' },
    { id: 'rocker', world: composeTransforms(output.origin, output.childTransform), parent: 'root' },
    { id: 'second-rocker', world: composeTransforms(second.origin, second.childTransform), parent: 'root' }
  ], [{ id: 'root', local: pose() }], [input, output, second]);
  const a = [2 * Math.cos(d0), 2 * Math.sin(d0)], b = [4 + 2.5 * Math.cos(f0), 2.5 * Math.sin(f0)], c = [8 + 2 * Math.cos(g0), 2 * Math.sin(g0)];
  const firstLength = Math.hypot(a[0] - b[0], a[1] - b[1]), secondLength = Math.hypot(b[0] - c[0], b[1] - c[1]);
  model.linkageConstraints.push(
    { id: 'upstream', type: 'planar-closed-loop', driverJointId: 'input', dependentJointIds: ['output'], planeNormal: [0, 0, 1], links: [{ a: { node: part('crank'), point: [2, 0, 0] }, b: { node: part('rocker'), point: [2.5, 0, 0] }, lengthMm: firstLength }], referenceJointValues: [d0, f0], branch: 'reference-continuous', toleranceMm: 1e-5, evidence: placement },
    { id: 'downstream', type: 'planar-closed-loop', driverJointId: 'input', dependentJointIds: ['second'], planeNormal: [0, 0, 1], links: [{ a: { node: part('rocker'), point: [2.5, 0, 0] }, b: { node: part('second-rocker'), point: [2, 0, 0] }, lengthMm: secondLength }], referenceJointValues: [d0, g0], branch: 'reference-continuous', toleranceMm: 1e-5, evidence: placement }
  );
  const log = scenario(); command(log, motor(model, 'input'), d0, 1.1);
  const compiled = compileSimulation(compileAssembly(model), log), state = createSimulationFrame(compiled), other = createSimulationFrame(compiled);
  for (const time of [1000, 0, 321, 870, 500, 1000, 0]) {
    sampleSimulation(compiled, time, state);
    const [d, f, g] = state.jointValues;
    close(Math.hypot(2 * Math.cos(d) - 4 - 2.5 * Math.cos(f), 2 * Math.sin(d) - 2.5 * Math.sin(f)), firstLength, 1e-7);
    close(Math.hypot(4 + 2.5 * Math.cos(f) - 8 - 2 * Math.cos(g), 2.5 * Math.sin(f) - 2 * Math.sin(g)), secondLength, 1e-7);
    sampleSimulation(compiled, 1000 - time, other); sampleSimulation(compiled, time, other);
    assert.deepEqual(snap(state), snap(other));
  }
  assert.ok(Math.abs(state.jointValues[2] - g0) < 1e-7, 'downstream branch returns exactly to its zero');
});

function objectFixture(external = false): { model: RobotModel; log: SimulationScenario } {
  const specs: Spec[] = [{ id: 'holder-surface', world: pose(), parent: 'holder' }]; if (!external) specs.push({ id: 'sample-piece', world: pose(), parent: 'sample', sample: true });
  const groups = [{ id: 'holder', local: pose() }, ...(!external ? [{ id: 'sample', local: pose() }] : [])], model = fixture(specs, groups), log = scenario(3000);
  const objectId = external ? 'authored-block' : 'sample';
  if (external) {
    const metadata = JSON.parse(readFileSync(new URL('../../static/models/simulation/manifest.json', import.meta.url), 'utf8')) as { assets: RobotModel['geometryAssets']; materials: RobotModel['materials'] };
    model.geometryAssets.push(...metadata.assets); model.materials.push(...metadata.materials);
    model.simulationObjects = [{ id: objectId, name: 'Original RoboBuild demo block (outside official BOM)', geometryId: 'robobuild-demo-block', materialId: 'robobuild-demo-foam', initialTransform: pose(), evidence }];
  }
  log.rootMotion = [{ node: sub('holder'), timeMs: 0, transform: pose(), evidence }, { node: sub('holder'), timeMs: 1000, transform: pose(), evidence }, { node: sub('holder'), timeMs: 2000, transform: pose(10, 0, 0), evidence }, { node: sub('holder'), timeMs: 3000, transform: pose(20, 0, 0), evidence }];
  // Actual original block X side faces are ±8mm, per its authored asset design.
  const halfWidth = external ? 8 : 1;
  const capture = { contacts: [{ holder: part('holder-surface'), holderPoint: [-halfWidth, 0, 0] as Vec3, objectPoint: [-halfWidth, 0, 0] as Vec3 }, { holder: part('holder-surface'), holderPoint: [halfWidth, 0, 0] as Vec3, objectPoint: [halfWidth, 0, 0] as Vec3 }], maxGapMm: 1e-6, poseToleranceMm: 1e-6, angleToleranceRad: 1e-6, evidence };
  log.objectEvents = [{ timeMs: 1000, objectSubassemblyId: objectId, action: 'attach', parent: sub('holder'), transform: pose(), capture, evidence }, { timeMs: 2000, objectSubassemblyId: objectId, action: 'release', parent: null, transform: pose(10, 0, 0), capture, evidence }]; return { model, log };
}
test('existing sample and separate typed prop capture follow two real local contacts, attach/release continuously', () => {
  for (const external of [false, true]) {
    const { model, log } = objectFixture(external), assembly = compileAssembly(model), assembled = sampleAssembly(assembly, assembly.durationMs, createFrame(assembly)), compiled = compileSimulation(assembly, log), frame = createSimulationFrame(compiled), originalCount = model.parts.length;
    const objectX = (): number => external ? frame.assembly.environmentTransforms[0] : frame.assembly.transforms[10];
    for (const [time, x] of [[999.999, 0], [1000, 0], [1500, 5], [1999.999, 9.99999], [2000, 10], [2500, 10], [0, 0], [1500, 5]]) { sampleSimulation(compiled, time, frame); close(objectX(), x, 1e-7); assert.deepEqual(frame.assembly.counts, assembled.counts); assert.equal(model.parts.length, originalCount); }
    if (external) { assert.equal(frame.assembly.environmentVisible[0], 1); assert.equal(assembled.environmentVisible[0], 0); assert.equal(assembly.partIds.length, 1); }
    const gap = structuredClone(log); gap.objectEvents[0].capture!.contacts[1].holderPoint = [99, 0, 0]; assert.throws(() => compileSimulation(assembly, gap), /capture contact gap/);
    const teleport = structuredClone(log); teleport.objectEvents[1].transform.position[0] = 99; assert.throws(() => compileSimulation(assembly, teleport), /teleport/);
    const oneContact = structuredClone(log); oneContact.objectEvents[0].capture!.contacts.length = 1; assert.throws(() => compileSimulation(assembly, oneContact), />=2/);
    const duplicate = structuredClone(log); duplicate.objectEvents[0].capture!.contacts[1] = structuredClone(duplicate.objectEvents[0].capture!.contacts[0]); assert.throws(() => compileSimulation(assembly, duplicate), /two distinct/);
  }
});

test('released sample continues only a pose-continuous authored world support path', () => {
  const { model, log } = objectFixture();
  log.rootMotion.push({ node: sub('sample'), timeMs: 0, transform: pose(), evidence }, { node: sub('sample'), timeMs: 1000, transform: pose(), evidence }, { node: sub('sample'), timeMs: 2000, transform: pose(10, 0, 0), evidence }, { node: sub('sample'), timeMs: 3000, transform: pose(10, -5, 0), evidence });
  const compiled = compileSimulation(compileAssembly(model), log), frame = createSimulationFrame(compiled);
  for (const [time, x, y] of [[1500, 5, 0], [2000, 10, 0], [2500, 10, -2.5], [1999.999, 9.99999, 0], [0, 0, 0]]) { sampleSimulation(compiled, time, frame); close(frame.assembly.transforms[10], x); close(frame.assembly.transforms[11], y); }
  const broken = structuredClone(log); broken.rootMotion.find((m) => m.node.id === 'sample' && m.timeMs === 2000)!.transform.position[0] = 11;
  assert.throws(() => compileSimulation(compileAssembly(model), broken), /matching world-pose keyframe/);
});

test('invalid time, foreign/modified frame, nonfinite commands and bad hierarchy fail before observable mutation', () => {
  const { model, log } = driveFixture(1, 1, 1, 1), assembly = compileAssembly(model), compiled = compileSimulation(assembly, log), other = compileSimulation(assembly, log), frame = createSimulationFrame(compiled), before = snap(frame);
  for (const time of [NaN, Infinity, -Infinity]) { assert.throws(() => sampleSimulation(compiled, time, frame), /finite/); assert.deepEqual(snap(frame), before); }
  assert.throws(() => sampleSimulation(other, 900, frame), /foreign/); assert.deepEqual(snap(frame), before);
  const forged = { ...frame }; assert.throws(() => sampleSimulation(compiled, 200, forged), /foreign/); assert.deepEqual(snap(frame), before);
  const replaced = { ...frame.assembly, transforms: frame.assembly.transforms.slice() }; Object.defineProperty(frame, 'assembly', { value: replaced, configurable: true }); assert.throws(() => sampleSimulation(compiled, 200, frame), /foreign/); assert.deepEqual(snap(frame), before);
  const nonfinite = structuredClone(log); nonfinite.motorCommands[0].to = Infinity; assert.throws(() => compileSimulation(assembly, nonfinite), /finite/);
  const cycle = structuredClone(model); cycle.joints[0].parent = part('right-wheel'); cycle.joints[1].parent = part('left-wheel'); assert.throws(() => compileSimulation(compileAssembly(cycle), log), /cycle/);
});
