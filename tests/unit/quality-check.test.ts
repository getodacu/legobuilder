import assert from 'node:assert/strict';
import test from 'node:test';
import research from '../../docs/research/data/hand-quality.json' with { type: 'json' };
import { compileAssembly, createFrame, getStepTime, sampleAssembly } from '../../src/lib/assembly/engine.ts';
import { composeTransforms, identityTransform, readTransform, relativeTransform, transformsEqual } from '../../src/lib/core/transforms.ts';
import { qualityCheck as model, qualityCheckSourceFamilies } from '../../src/lib/models/quality-check.ts';
import { compileSimulation, createSimulationFrame, sampleSimulation } from '../../src/lib/simulation/kinematics.ts';
import type { AssemblyFrame, Transform, Vec3 } from '../../src/lib/types/model.ts';

function close(actual: ArrayLike<number>, expected: ArrayLike<number>, label: string): void {
  assert.equal(actual.length, expected.length, label);
  for (let index = 0; index < actual.length; index++) assert.ok(Math.abs(actual[index]! - expected[index]!) < 1e-7, `${label}[${index}]: ${actual[index]} != ${expected[index]}`);
}
function nativePoint(pose: Transform, position: Vec3): Vec3 {
  return composeTransforms(pose, { ...identityTransform(), position: [position[0] * 0.4, -position[1] * 0.4, -position[2] * 0.4] }).position;
}

test('Quality source inventory, integration, real native mates and serial body/rotor response stay coherent', () => {
  const compiled = compileAssembly(model);
  const frame = createFrame(compiled);
  const pose = (out: AssemblyFrame, id: string): Transform => {
    const index = compiled.partIds.indexOf(id);
    assert.notEqual(index, -1, id);
    return readTransform(out.transforms, index * 10);
  };
  const rotorWorld = (out: AssemblyFrame, id: string): Transform => {
    const index = compiled.internalNodes.findIndex((node) => node.partInstanceId === id && node.geometryNodeId === 'parts/u9363p01.dat');
    assert.notEqual(index, -1, 'Authentic motor rotor node, not an anonymous replacement mesh');
    return composeTransforms(pose(out, id), readTransform(out.internalTransforms, index * 10));
  };
  assert.equal(model.parts.length, 63);
  assert.equal(model.parts.filter((part) => part.inventoryScope === 'robot').length, 55);
  assert.equal(model.parts.filter((part) => part.inventoryScope === 'sample').length, 8);
  assert.equal(model.steps.length, 30);
  assert.equal(new Set(model.parts.map((part) => part.id)).size, 63);
  assert.equal(model.parts.some((part) => part.partNumber !== undefined), false, 'No uncertified manufacturer IDs');

  // Independent research transcription, not the model inventory summed against itself.
  for (const row of research.builds['quality-check'].steps) {
    const step = model.steps.find((entry) => entry.id === `quality-${row.manual}-step${row.step}`)!;
    assert.ok(step, `${row.manual}/${row.step}`);
    assert.ok(step.operationIds.length);
    assert.equal(step.sourceReferences[0]?.page, row.page);
    assert.equal(step.sourceReferences[0]?.instructionId, String(row.step));
    assert.equal(step.sourceReferences[0]?.documentId, `quality-${row.manual}`);
    const introduced: Record<string, number> = {};
    for (const id of step.requiredPartInstanceIds) {
      const family = qualityCheckSourceFamilies[id]!;
      introduced[family] = (introduced[family] ?? 0) + 1;
      assert.equal(model.installations.filter((event) => event.partInstanceId === id).length, 1);
    }
    assert.deepEqual(introduced, row.add, `${row.manual}/${row.step} actual source callouts`);
  }
  for (const [module, rows] of Object.entries(research.builds['quality-check'].bomByModule)) for (const row of rows) {
    const line = model.inventory.find((entry) => entry.id === `quality-bom-${module}-${row.part}`)!;
    assert.ok(line);
    assert.equal(line.quantity, row.quantity);
    assert.equal(line.partInstanceIds.length, row.quantity);
    for (const id of line.partInstanceIds) assert.equal(qualityCheckSourceFamilies[id], row.part);
  }
  const documents = new Map(model.sourceDocuments.map((document) => [document.id, document]));
  assert.equal(documents.get('quality-idea-detector')?.sha256, 'e81b4e9b1212349543ad4b79d8a47a7897f06c1c031c23d9c3bc05933c3727c0');
  assert.equal(documents.get('quality-robot-head')?.sha256, '69b0625f4f1c2c752440bfefd5b5316d34a1c27681e7f46a509177d59ff2b170');
  assert.equal(documents.get('quality-robot-head')?.pageCount, 20);
  for (const asset of model.geometryAssets) {
    const root = asset.attribution.find((entry) => entry.sourcePath === `parts/${asset.id}.dat`)!;
    assert.ok(root);
    assert.equal(documents.get(`ldraw-${asset.id}`)?.sha256, root.sha256);
    close(nativePoint(identityTransform(), [10, 20, 30]), composeTransforms(asset.nativeToScene, { ...identityTransform(), position: [10, 20, 30] }).position, 'Native N, no recentering');
  }
  for (const [id, geometry] of [['quality-plain-gray-pin', '3673'], ['quality-gray-elbow', '6536'], ['quality-retainer-azure', '49283']]) assert.equal(model.parts.find((part) => part.id === id)?.geometryId, geometry);
  const sampleStep = getStepTime(compiled, 'quality-robot-head-step16');
  sampleAssembly(compiled, sampleStep.startMs, frame);
  assert.equal(frame.counts.robotInstalled, 55);
  assert.equal(frame.counts.sampleInstalled, 0, 'Loose samples count only at their actual source preparation');
  sampleAssembly(compiled, sampleStep.endMs, frame);
  assert.equal(frame.counts.sampleInstalled, 8);
  sampleAssembly(compiled, compiled.durationMs, frame);
  assert.equal(frame.counts.stepsComplete, 30);
  assert.equal(frame.counts.robotInstalled, 55);
  for (const part of model.parts) assert.ok(transformsEqual(pose(frame, part.id), part.finalTransform), part.id);
  const join = model.operations.find((operation) => operation.id === 'quality-merge-quality-head')!;
  assert.equal(join.stepId, 'quality-robot-head-step11');
  assert.equal(join.partInstanceIds.length, 18, 'Only existing pre-retainer head hardware moves in the genuine integration');
  assert.ok(join.parentChanges.some((change) => change.node.id === 'quality-head' && change.toParent?.id === 'quality-base'));
  const finalView = model.operations.find((operation) => operation.id === 'quality-final-source-view')!;
  assert.deepEqual(finalView.partInstanceIds, []);
  assert.deepEqual(finalView.stages, []);
  assert.equal(model.steps.find((step) => step.id === 'quality-robot-head-step12')?.action, 'wiring');

  // Independent source-native probes: no reuse of the model's authored point frames.
  // 54696p01 rotor occurrence (0,-50,0); lower disc bores Z±20;
  // 39793 lower edge connhol3 (-30,0,±20); u9366 side bores (30,±20,140).
  for (const z of [-56, -40]) {
    const pin = pose(frame, `quality-disc-pin-${z}`);
    close(nativePoint(pose(frame, 'quality-lower-motor'), [0, -50, (z + 48) / 0.4]), pin.position, 'Lower real rotor pin seat');
    close(nativePoint(pose(frame, 'quality-lower-square'), [-30, 0, -(z + 48) / 0.4]), pin.position, 'Upright actual edge bore');
  }
  for (const x of [-32, -16]) close(nativePoint(pose(frame, 'quality-upper-motor'), [30, -(x + 24) / 0.4, 140]), pose(frame, `quality-upper-body-pin-${x}`).position, 'Upper real motor housing side bore');
  close(nativePoint(pose(frame, 'quality-upper-motor'), [0, -50, 0]), [-4, 52, -48], 'Upper native rotor is the actual pitch pivot');
  for (const color of ['green', 'blue', 'red', 'violet']) {
    const lower = model.parts.find((part) => part.id === `quality-sample-${color}-1`)!;
    const upper = model.parts.find((part) => part.id === `quality-sample-${color}-2`)!;
    assert.equal(lower.geometryId, '39789'); assert.equal(upper.geometryId, '39789');
    assert.equal(lower.inventoryScope, 'sample'); assert.equal(upper.inventoryScope, 'sample');
    assert.equal(lower.subassemblyId, `quality-sample-${color}`);
    assert.equal(model.subassemblies.find((group) => group.id === lower.subassemblyId)?.parentId, undefined, 'Not attached to robot');
    // Authentic brick body height is24 LDU, not an arbitrary package box.
    close(nativePoint(lower.finalTransform, [-30, 0, -10]), nativePoint(upper.finalTransform, [-30, 24, -10]), `${color} real stud/underside stack`);
  }
  assert.equal(model.parts.find((part) => part.id === 'quality-sample-violet-1')?.materialId, 'ldraw-26', 'Physical sample is magenta, lesson event is violet');

  const sim = compileSimulation(compiled, model.scenarios[0]!);
  const out = createSimulationFrame(sim);
  sampleSimulation(sim, 0, out);
  const lowerBodyZero = pose(out.assembly, 'quality-lower-motor');
  const upperBodyZero = pose(out.assembly, 'quality-upper-motor');
  const upperRotorZero = rotorWorld(out.assembly, 'quality-upper-motor');
  const lowerRotorZero = rotorWorld(out.assembly, 'quality-lower-motor');
  const eyesInBody = relativeTransform(upperBodyZero, pose(out.assembly, 'quality-distance-sensor'));
  sampleSimulation(sim, 2000, out);
  assert.ok(transformsEqual(pose(out.assembly, 'quality-lower-motor'), lowerBodyZero), 'Lower housing stays on base');
  assert.ok(!transformsEqual(rotorWorld(out.assembly, 'quality-lower-motor'), lowerRotorZero), 'Real lower rotor turns');
  sampleSimulation(sim, 5000, out);
  assert.ok(!transformsEqual(pose(out.assembly, 'quality-upper-motor'), upperBodyZero), 'Upper housing, not a fake rotor child, carries pitch');
  assert.ok(transformsEqual(rotorWorld(out.assembly, 'quality-upper-motor'), upperRotorZero), 'Upper rotor countertransforms against its moving housing');
  assert.ok(transformsEqual(relativeTransform(pose(out.assembly, 'quality-upper-motor'), pose(out.assembly, 'quality-distance-sensor')), eyesInBody), 'Eyes remain rigid on actual moving body');
  for (const motor of model.motors) {
    assert.equal(motor.assignmentEvidence.category, 'app-authored');
    assert.match(motor.assignmentEvidence.note, /UNKNOWN/);
  }
  for (const joint of model.joints) assert.equal(joint.limits?.basis, 'modeled');
  assert.equal(model.joints.length, 2);
  assert.equal(model.joints[0]?.internalBinding?.movingSide, 'rotor');
  assert.equal(model.joints[1]?.internalBinding?.movingSide, 'body');
  const violetCommands = model.scenarios[0]!.motorCommands.filter((command) => command.motorId === 'quality-motor-A-assumption');
  close(violetCommands.map((command) => command.to * 180 / Math.PI), [30, -30, 30, 0], 'Documented violet/A positions');
  close(violetCommands.map((command) => (command.to - command.from) * 180 / Math.PI), [30, -60, 60, -30], 'Documented30/60/60/30 direction sequence');
  assert.ok(violetCommands.every((command) => command.evidence.sources[0]?.documentId === 'quality-quality-solution.svg'));
  const eyeSignals = model.scenarios[0]!.sensorSignals.filter((event) => event.sensorPartInstanceId === 'quality-distance-sensor' && event.type === 'light');
  assert.deepEqual(eyeSignals.map((event) => event.value), [100, 35, 100]);
  const signal = model.scenarios[0]!.sensorSignals.find((event) => event.type === 'color' && event.value === 'violet')!;
  assert.equal(signal.port, 'D');
  assert.equal(signal.evidence.sources[0]?.documentId, 'quality-quality-solution.svg');
  assert.ok(documents.has('quality-quality-other.svg'), 'Teacher red-A/green-F program remains distinct source');
  assert.ok(model.scenarios[0]!.rootMotion.every((motion) => motion.evidence.category === 'app-authored'));
  assert.deepEqual(model.scenarios[0]!.objectEvents, [], 'No invented gripper capture or conveyor');
  const snapshot = out.assembly.transforms.slice();
  const internal = out.assembly.internalTransforms.slice();
  sampleSimulation(sim, 0, out); sampleSimulation(sim, 8000, out); sampleSimulation(sim, 5000, out);
  close(out.assembly.transforms, snapshot, 'Deterministic two-axis replay');
  close(out.assembly.internalTransforms, internal, 'Deterministic actual rotor replay');
  for (const time of [0, compiled.durationMs * 0.21, compiled.durationMs * 0.74, compiled.durationMs]) {
    sampleAssembly(compiled, time, frame); const snapshot = frame.transforms.slice();
    sampleAssembly(compiled, compiled.durationMs - time, frame); sampleAssembly(compiled, time, frame);
    close(frame.transforms, snapshot, 'Reversible manual assembly');
  }
  assert.equal(model.coverage.verifiedSteps, 0, 'Authoring must not silently promote source-view/mesh fit verification');
});
