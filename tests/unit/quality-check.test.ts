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

  // Consumer-frame contact fixture transcribed from Detector pp5–9/16, not model connection constants.
  // 64179 seven-hole rails are X±40; 32526 frame pins are holes Z20/60,
  // crossblock pins occupy Z0/40, and the outward short-leg pins are X0/40 at Z80.
  const contact = (a: string, ap: Vec3, aa: Vec3, b: string, bp: Vec3, ba: Vec3): void => {
    const aPose = pose(frame, a), bPose = pose(frame, b);
    close(nativePoint(aPose, ap), nativePoint(bPose, bp), `${a}/${b} selected face contact`);
    const av = nativePoint(aPose, aa).map((value, index) => (value - aPose.position[index]!) / 0.4);
    const bv = nativePoint(bPose, ba).map((value, index) => (value - bPose.position[index]!) / 0.4);
    assert.ok(Math.abs(av.reduce((sum, value, index) => sum + value * bv[index]!, 0)) > 1 - 1e-7, `${a}/${b} actual bore axes`);
  };
  for (const [side, sign] of [['left', -1], ['right', 1]] as const) {
    const beam = `quality-l-beam-${side}`, block = `quality-hub-crossblock-${sign * 24}`;
    for (const z of [20, 60]) contact('quality-rear-frame', [sign * 40, -10, z], [0, 1, 0], beam, [0, sign * 10, z], [0, 1, 0]);
    for (const direction of [-1, 1]) {
      contact(beam, [0, -sign * 10, 20 - direction * 20], [0, 1, 0], block, [0, direction * 20, 10], [0, 0, 1]);
      // u9402 shell translation (0,-30,0) matters: X±60 are NOT end-facing bores.
      contact('quality-hub', [sign * 40, -30 + direction * 20, -110], [0, 0, 1], block, [0, -direction * 20, -10], [0, 0, 1]);
    }
    for (const x of [0, 40]) contact(beam, [x, sign * 10, 80], [0, 1, 0], 'quality-baseplate', [sign * (40 + x), -10, -180], [0, 1, 0]);
    const insertion = model.operations.find((entry) => entry.id === `quality-install-${beam}`)!.stages.find((stage) => stage.phase === 'insert')!.insertion!;
    close(insertion.axis, [0, -1, 0], 'L beam slides down the four real frame pins');
    assert.equal(insertion.depthMm, 8);
  }
  contact('quality-rear-frame', [40, -10, -60], [0, 1, 0], 'quality-rear-red-clip', [0, 0, -10], [0, 0, 1]);
  for (const x of [-32, -16, 16, 32]) {
    const insertion = model.operations.find((entry) => entry.id === `quality-install-quality-plate-join-pin-${x / 2}`)!.stages.find((stage) => stage.phase === 'insert')!.insertion!;
    close(insertion.axis, [0, 1, 0], 'Short-leg pins enter from underneath before the plate');
    assert.equal(insertion.depthMm, 8);
  }
  contact('quality-gray-elbow', [-10, 0, 0], [1, 0, 0], 'quality-gray-axle-pin', [0, 0, 0], [1, 0, 0]);
  contact('quality-gray-elbow', [0, 20, 10], [0, 0, 1], 'quality-plain-gray-pin', [0, 0, 0], [1, 0, 0]);
  contact('quality-lower-square', [0, 10, 0], [0, 1, 0], 'quality-gray-axle-pin', [0, 0, 0], [1, 0, 0]);
  const tanInsertion = model.operations.find((entry) => entry.id === 'quality-install-quality-gray-axle-pin')!.stages.find((stage) => stage.phase === 'insert')!.insertion!;
  close(tanInsertion.axis, [1, 0, 0], 'Tan axle enters the elbow in its protruding axle direction, not backwards');

  // Independent exterior fixture: Detector pp12–15, native 39789/24309/41749/41750.
  // The 39369 grid has NO studs. Only the rear brick pockets clutch the panels;
  // their Y48 front soles merely bear on the plate's Y−10 top plane.
  for (const [side, plateZ] of [['left', -40], ['right', -160]] as const) {
    const brick = `quality-yellow-brick-${side}`;
    for (const [index, brickX, plateX] of [[0, -20, 40], [16, 20, 80]]) {
      const id = `quality-surround-pin-${side}-${index}`;
      contact(brick, [brickX!, 24, 0], [0, 1, 0], id, [0, 0, 0], [1, 0, 0]);
      contact('quality-baseplate', [plateX!, -10, plateZ], [0, 1, 0], id, [0, 0, 0], [1, 0, 0]);
    }
    for (const [bx, bz, cx, cz] of [[10, -10, -10, 0], [10, 10, 10, 0], [30, -10, -10, -20], [30, 10, 10, -20]]) contact(brick, [bx!, 0, bz!], [0, 1, 0], `quality-yellow-curve-${side}`, [cx!, 24, cz!], [0, 1, 0]);
    const panel = `quality-panel-${side}`;
    const pockets = side === 'left'
      ? [[-30, -10, 20, -10], [-30, 10, 0, -10], [-10, -10, 20, 10], [-10, 10, 0, 10]]
      : [[-30, -10, 0, -10], [-30, 10, -20, -10], [-10, -10, 0, 10], [-10, 10, -20, 10]];
    for (const [bx, bz, px, pz] of pockets) contact(brick, [bx!, 0, bz!], [0, 1, 0], panel, [px!, 24, pz!], [0, 1, 0]);
    const sole = nativePoint(pose(frame, panel), [0, 48, -120]);
    close(sole, [-32, 8, side === 'left' ? 12 : 68], 'Panel front sole faces reading side, at plate height');
    const insertion = model.operations.find((entry) => entry.id === `quality-install-${panel}`)!.stages.find((stage) => stage.phase === 'insert')!.insertion!;
    close(insertion.axis, [0, -1, 0], 'Panel seats downward onto brick studs');
    assert.equal(insertion.depthMm, 1.6);
  }
  assert.equal(model.parts.find((entry) => entry.id === 'quality-panel-left')!.geometryId, '41750');
  assert.equal(model.parts.find((entry) => entry.id === 'quality-panel-right')!.geometryId, '41749');
  sampleAssembly(compiled, getStepTime(compiled, 'quality-idea-detector-step9').endMs, frame);
  const preparedBrick = pose(frame, 'quality-yellow-brick-left');
  assert.ok(nativePoint(preparedBrick, [0, 24, 0])[1] > preparedBrick.position[1], 'Source preparation shows the brick underside upward');
  for (const side of ['left', 'right']) for (const index of [0, 16]) {
    const insertion = model.operations.find((entry) => entry.id === `quality-install-quality-surround-pin-${side}-${index}`)!.stages.find((stage) => stage.phase === 'insert')!.insertion!;
    close(insertion.axis, [0, -1, 0], 'Axle enters downward into the prepared inverted brick');
    assert.equal(insertion.depthMm, 8);
  }
  sampleAssembly(compiled, compiled.durationMs, frame);
  // Head pp15–17: two 20-LDU clips around a 40-LDU axle, not crossed bores.
  contact('quality-retainer-azure', [0, 0, 0], [0, 0, 1], 'quality-retainer-axle', [10, 0, 0], [1, 0, 0]);
  contact('quality-retainer-magenta', [0, 0, 0], [0, 0, 1], 'quality-retainer-axle', [-10, 0, 0], [1, 0, 0]);
  contact('quality-retainer-azure', [0, 0, 10], [0, 0, 1], 'quality-retainer-magenta', [0, 0, -10], [0, 0, 1]);
  contact('quality-retainer-azure', [0, 0, -10], [0, 0, 1], 'quality-retainer-axle', [20, 0, 0], [1, 0, 0]);
  contact('quality-retainer-magenta', [0, 0, 10], [0, 0, 1], 'quality-retainer-axle', [-20, 0, 0], [1, 0, 0]);
  for (const id of ['quality-retainer-azure', 'quality-retainer-magenta']) {
    const clip = model.parts.find((entry) => entry.id === id)!;
    assert.equal(clip.placementEvidence!.evidence.category, 'unknown', 'Cable-supported global seat is not an exact rigid mount');
    assert.match(clip.placementEvidence!.evidence.note, /Flexible lead geometry is absent/);
    assert.ok(nativePoint(pose(frame, id), [0, -20, 0])[1] > pose(frame, id).position[1], 'Clip channel opens above its bush, not sideways through the motor');
  }
  const retainerIds = model.subassemblies.find((entry) => entry.id === 'quality-retainer')!.partInstanceIds;
  assert.ok(model.connections.filter((entry) => entry.type !== 'electrical' && (retainerIds.includes(entry.a.partInstanceId) || retainerIds.includes(entry.b.partInstanceId))).every((entry) => retainerIds.includes(entry.a.partInstanceId) && retainerIds.includes(entry.b.partInstanceId)), 'No invented rigid motor contact supports the cable retainer');

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
  // Head pp5/10: all four pins retain the reversed output; the center is only its pivot.
  for (const [y, z, sx, sz, mx, mz] of [[44, -48, -20, 0, 0, -20], [60, -48, 20, 0, 0, 20], [52, -56, 0, 20, 20, 0], [52, -40, 0, -20, -20, 0]]) {
    contact('quality-lower-square', [sx!, -10, sz!], [0, 1, 0], 'quality-upper-motor', [mx!, -50, mz!], [0, 1, 0]);
    close(nativePoint(pose(frame, 'quality-upper-motor'), [mx!, -50, mz!]), pose(frame, `quality-coupling-pin-${y}-${z}`).position, 'Reversed output pin collar');
  }
  const upperInsertion = model.operations.find((entry) => entry.id === 'quality-install-quality-upper-motor')!.stages.find((stage) => stage.phase === 'insert')!.insertion!;
  close(upperInsertion.axis, [1, 0, 0], 'Reversed upper output slides onto the prepared face pins');
  assert.equal(upperInsertion.depthMm, 8);
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
