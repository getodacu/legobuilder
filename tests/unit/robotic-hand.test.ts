import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { roboticHand } from '../../src/lib/models/robotic-hand.ts';
import { compileAssembly, createFrame, sampleAssembly } from '../../src/lib/assembly/engine.ts';
import { compileSimulation, createSimulationFrame, sampleSimulation } from '../../src/lib/simulation/kinematics.ts';
import { composeTransforms, readTransform, transformsEqual } from '../../src/lib/core/transforms.ts';
import type { AssemblyFrame, NodeRef, Transform, Vec3 } from '../../src/lib/types/model.ts';

// Independently transcribed official Pass-the-Brick book1 p4–31 callouts, not the model's inventory array.
const publishedFamilies: Record<string, number> = { '45601c01': 1, '2780': 10, '18651': 1, '48989': 1, '39794': 2, '54696p01': 1, '4519': 5, '32316': 1, '32184': 1, '3749': 2, '60483': 1, '61254': 2, '56903': 2, '39789': 2, '32348': 2, '15535': 4, '14720': 1 };
const publishedAdditions = [5, 2, 1, 0, 2, 4, 3, 2, 1, 0, 2, 1, 1, 2, 0, 2, 1, 0, 2, 1, 1, 2, 0, 2, 0, 1, 1, 0];
function world(frame: AssemblyFrame, node: NodeRef): Transform {
  const ids = node.kind === 'part' ? roboticHand.parts : roboticHand.subassemblies;
  const index = ids.findIndex((entry) => entry.id === node.id);
  assert.notEqual(index, -1, node.id);
  return readTransform(node.kind === 'part' ? frame.transforms : frame.subassemblyTransforms, index * 10);
}
function point(pose: Transform, position: Vec3): Vec3 {
  return composeTransforms(pose, { position, quaternion: [0, 0, 0, 1], scale: [1, 1, 1] }).position;
}
function close(actual: number, expected: number, tolerance = 1e-5): void {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected} (tolerance ${tolerance})`);
}
function separation(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

test('Hand has every published family,39 identities,28 numbered steps, battery preparation and F wiring without extra inventory', () => {
  const actual: Record<string, number> = {};
  for (const part of roboticHand.parts) actual[part.geometryId] = (actual[part.geometryId] ?? 0) + 1;
  assert.deepEqual(actual, publishedFamilies);
  assert.equal(roboticHand.parts.length, 39);
  assert.equal(new Set(roboticHand.parts.map((part) => part.id)).size, 39);
  assert.equal(roboticHand.steps.filter((step) => step.kind === 'numbered-instruction').length, 28);
  assert.equal(roboticHand.inventory.reduce((count, row) => count + row.quantity, 0), 39);
  assert.equal(new Set(roboticHand.inventory.flatMap((row) => row.partInstanceIds)).size, 39);
  assert.equal(roboticHand.parts.some((part) => part.inventoryScope === 'sample'), false);
  assert.equal(roboticHand.parts.some((part) => part.partNumber !== undefined), false, 'unprinted manufacturer numbers must remain absent');
  assert.equal(roboticHand.motors.length, 1);
  assert.equal(roboticHand.motors[0]!.port, 'F');
  assert.equal(roboticHand.simulationObjects!.length, 1);
  assert.equal(roboticHand.simulationObjects![0]!.geometryId, 'robobuild-demo-block');
  assert.ok(!roboticHand.inventory.some((line) => line.partInstanceIds.includes('hand-demo-block')));
  assert.ok(roboticHand.sourceMappings.some((mapping) => mapping.source.page === 3));
  assert.ok(roboticHand.steps.some((step) => step.action === 'wiring' && step.sourceReferences[0]!.page === 32));
  assert.ok(roboticHand.parts.every((part) => part.placementEvidence.placement === 'diagram-derived'), 'Nominal manual/CAD registration is not a measured attachment');
  assert.equal(roboticHand.cables[0]!.routeEvidence.category, 'diagram-derived');
  assert.equal(roboticHand.cables[0]!.lengthMm, undefined, 'Visual slack is not a measured captive length');
});

test('Hand actual assembly journal counts each new callout once and carries existing modules reversibly', () => {
  const compiled = compileAssembly(roboticHand), frame = createFrame(compiled);
  let installed = 0;
  for (let index = 0; index < 28; index++) {
    const step = compiled.stepTimes[index]!;
    sampleAssembly(compiled, step.endMs, frame);
    installed += publishedAdditions[index]!;
    assert.equal(frame.counts.robotInstalled, installed, `source numbered step${index + 1}`);
    assert.equal(frame.counts.robotTotal, 39);
    assert.equal(frame.counts.sampleTotal, 0);
    assert.equal(roboticHand.steps[index]!.sourceReferences[0]!.page, index + 4);
    assert.equal(roboticHand.steps[index]!.requiredPartInstanceIds.length, publishedAdditions[index]);
  }
  sampleAssembly(compiled, compiled.durationMs, frame);
  roboticHand.parts.forEach((part, index) => assert.ok(transformsEqual(readTransform(frame.transforms, index * 10), part.finalTransform), part.id));
  const all = [...frame.transforms];
  sampleAssembly(compiled, 0, frame);
  assert.equal(frame.counts.robotInstalled, 0);
  assert.ok(frame.visible.every((value) => value === 1), 'all actual inventory remains available in staging');
  const fresh = createFrame(compiled);
  for (const fraction of [0.21, 0.91, 0.05, 0.62, 0.3, 1, 0, 0.62]) {
    sampleAssembly(compiled, compiled.durationMs * fraction, frame);
    sampleAssembly(compiled, compiled.durationMs * fraction, fresh);
    assert.deepEqual([...frame.transforms], [...fresh.transforms]);
    assert.deepEqual([...frame.subassemblyTransforms], [...fresh.subassemblyTransforms]);
    assert.deepEqual(frame.counts, fresh.counts);
  }
  sampleAssembly(compiled, compiled.durationMs, frame);
  assert.deepEqual([...frame.transforms], all);
  const join = roboticHand.operations.find((operation) => operation.id === 'hand-join-hand-gripper')!;
  assert.equal(join.partInstanceIds.length, 29, '28-step reuse moves29 original gripper units, not a replacement mesh');
  assert.equal(new Set(roboticHand.installations.map((entry) => entry.partInstanceId)).size, 39);
});

test('critical Hand native pivot grid is present in genuine DATs and independently registered', () => {
  const bent = readFileSync(new URL('../../static/models/library/32348.mpd', import.meta.url), 'utf8');
  assert.match(bent, /0 -10 60 .* peghole\.dat/);
  assert.match(bent, /16 0 72 .* connhole\.dat/);
  assert.match(bent, /32 0 84 .* beamhole\.dat/);
  assert.match(bent, /48 -10 96 .* axlehol4\.dat/);
  const h = readFileSync(new URL('../../static/models/library/14720.mpd', import.meta.url), 'utf8');
  assert.match(h, /0 0 -40 .*32523\.dat/);
  assert.match(h, /0 0 40 .*32523\.dat/);
  const assembly = compileAssembly(roboticHand), frame = sampleAssembly(assembly, assembly.durationMs, createFrame(assembly));
  for (let index = 0; index < 2; index++) {
    const part = roboticHand.parts.find((part) => part.id === `hand-black-angled-beam-${index + 1}`)!;
    const pivot = point(part.finalTransform, [12.8, 0, -33.6]);
    close(pivot[0], index ? 16 : -16); close(pivot[1], 24); close(pivot[2], 0);
    const rim = roboticHand.parts.find((part) => part.id === `hand-small-wheel-${index + 1}`)!;
    const tyre = roboticHand.parts.find((part) => part.id === `hand-small-tire-${index + 1}`)!;
    assert.ok(transformsEqual(world(frame, { kind: 'part', id: rim.id }), world(frame, { kind: 'part', id: tyre.id })));
  }
  assert.ok(roboticHand.geometryAssets.every((asset) => asset.preserveOrigin));
  assert.ok(roboticHand.geometryAssets.filter((asset) => asset.format === 'mpd').every((asset) => asset.attribution.length > 0));
});

test('source p5–6 complete handle and p9–30 selected native contacts seat without moving datums', () => {
  const assembly = compileAssembly(roboticHand), frame = sampleAssembly(assembly, assembly.durationMs, createFrame(assembly));
  // Independently transcribed from source arrows/visible unused holes and original DAT type1 features.
  // All coordinates below are native LDU, not copied connectionPoints or linkageConstraints.
  const seats: [string, Vec3, string, Vec3][] = [
    ['hand-magenta-frame-1', [60, 0, 60], 'hand-gray-double-pin-connector-1', [0, -20, -20]],
    ['hand-magenta-frame-1', [60, 0, 20], 'hand-gray-double-pin-connector-1', [0, 20, -20]],
    ['hand-magenta-frame-2', [60, 0, 60], 'hand-gray-double-pin-connector-1', [0, -20, 20]],
    ['hand-magenta-frame-2', [60, 0, 20], 'hand-gray-double-pin-connector-1', [0, 20, 20]],
    ['hand-hub-1', [-40, -10, 110], 'hand-black-pin-1', [0, 0, 0]],
    ['hand-hub-1', [-40, -50, 110], 'hand-black-pin-2', [0, 0, 0]],
    ['hand-hub-1', [40, -10, 110], 'hand-black-pin-3', [0, 0, 0]],
    ['hand-hub-1', [40, -50, 110], 'hand-black-pin-4', [0, 0, 0]],
    ['hand-magenta-frame-2', [-40, 0, -100], 'hand-black-pin-1', [10, 0, 0]],
    ['hand-magenta-frame-1', [-40, 0, -100], 'hand-black-pin-2', [10, 0, 0]],
    ['hand-magenta-frame-2', [40, 0, -100], 'hand-black-pin-3', [10, 0, 0]],
    ['hand-magenta-frame-1', [40, 0, -100], 'hand-black-pin-4', [10, 0, 0]],
    ['hand-magenta-frame-1', [0, 0, 100], 'hand-black-pin-5', [-10, 0, 0]],
    ['hand-magenta-frame-2', [0, 0, 100], 'hand-black-pin-6', [-10, 0, 0]],
    ['hand-medium-motor-1', [-20, 0, 150], 'hand-black-pin-5', [0, 0, 0]],
    ['hand-medium-motor-1', [20, 0, 150], 'hand-black-pin-6', [0, 0, 0]],
    ['hand-medium-motor-1', [-20, 30, 0], 'hand-black-pin-7', [0, 0, 0]],
    ['hand-medium-motor-1', [20, 30, 0], 'hand-black-pin-8', [0, 0, 0]],
    ['hand-magenta-beam-5-1', [0, 0, 20], 'hand-black-pin-7', [10, 0, 0]],
    ['hand-magenta-beam-5-1', [0, 0, -20], 'hand-black-pin-8', [10, 0, 0]],
    ['hand-magenta-beam-5-1', [0, 0, 40], 'hand-black-pin-9', [-10, 0, 0]],
    ['hand-magenta-beam-5-1', [0, 0, -40], 'hand-black-pin-10', [-10, 0, 0]],
    ['hand-medium-motor-1', [0, 30, 0], 'hand-yellow-axle-3-1', [-10, 0, 0]],
    ['hand-azure-short-connector-1', [0, 0, 0], 'hand-yellow-axle-3-1', [20, 0, 0]],
    ['hand-black-angled-beam-1', [32, 0, 84], 'hand-black-pin-9', [10, 0, 0]],
    ['hand-black-angled-beam-2', [32, 0, 84], 'hand-black-pin-10', [10, 0, 0]],
    ['hand-black-angled-beam-1', [48, 0, 96], 'hand-tan-axle-pin-2', [10, 0, 0]],
    ['hand-black-angled-beam-2', [16, 0, 72], 'hand-long-black-pin-1', [0, 0, 0]],
    ['hand-white-short-link-1', [0, 20, 0], 'hand-long-black-pin-1', [20, 0, 0]],
    ['hand-gray-h-link-1', [20, 0, -40], 'hand-long-black-pin-1', [-20, 0, 0]],
    ['hand-gray-h-link-1', [-20, 0, 40], 'hand-tan-axle-pin-2', [-10, 0, 0]],
    ['hand-azure-short-connector-1', [0, 0, 20], 'hand-tan-axle-pin-1', [-10, 0, 0]],
    ['hand-white-short-link-1', [0, -20, 0], 'hand-tan-axle-pin-1', [10, 0, 0]]
  ];
  const native = (id: string, coordinates: Vec3): Vec3 => point(world(frame, { kind: 'part', id }), [coordinates[0] * 0.4, -coordinates[1] * 0.4, -coordinates[2] * 0.4]);
  for (const [a, aPoint, b, bPoint] of seats) assert.ok(separation(native(a, aPoint), native(b, bPoint)) <= 1e-5, `${a} [${aPoint}] / ${b} [${bPoint}]: source seat mismatch`);
  // Mating planes, not merely concentric shafts: connector bases touch the inward frame faces.
  for (const [frameId, frameFace, bridgeFace] of [['hand-magenta-frame-1', 10, -10], ['hand-magenta-frame-2', -10, 10]] as const) {
    for (const [frameZ, bridgeY] of [[60, -20], [20, 20]] as const) {
      close(separation(native(frameId, [60, frameFace, frameZ]), native('hand-gray-double-pin-connector-1', [0, bridgeY, bridgeFace])), 0);
    }
  }
  for (const id of ['hand-gray-double-pin-connector-1', 'hand-magenta-frame-2']) {
    const insertion = roboticHand.operations.find((operation) => operation.partInstanceIds[0] === id)!.stages.find((stage) => stage.phase === 'insert')!.insertion!;
    assert.deepEqual(insertion.axis, [-1, 0, 0]); close(insertion.depthMm, 8);
  }
  assert.equal(roboticHand.connections.find((connection) => connection.id === 'hand-white-retainer')!.type, 'fixed', 'white axlehole is keyed; round jaw bore is the pivot');
  const supported = roboticHand.connections.filter((connection) => connection.evidence.evidence.note.startsWith('Independently compared nominal'));
  assert.equal(supported.length, 53);
  for (const connection of supported) {
    const axis = connection.id.startsWith('hand-frame-bridge') ? 0 : /hand-(hub-end|handle-hub|motor-handle|handle-end-pin)/.test(connection.id) ? 2 : 1;
    for (const endpoint of [connection.a, connection.b]) {
      const part = roboticHand.parts.find((part) => part.id === endpoint.partInstanceId)!;
      const local = part.connectionPoints.find((site) => site.id === endpoint.connectionPointId)!.localTransform;
      const pose = composeTransforms(world(frame, { kind: 'part', id: part.id }), local);
      close(Math.abs(point(pose, [0, 0, 1])[axis]! - pose.position[axis]!), 1);
    }
  }
  assert.ok(roboticHand.parts.every((part) => part.placementEvidence.fit === 'unchecked'), 'nominal seats do not certify collision or physical tolerance');
});

test('Hand p14–19/p22–27 native tip faces, keyed lobes and stud pockets agree in the consumer frame', () => {
  const assembly = compileAssembly(roboticHand), frame = sampleAssembly(assembly, assembly.durationMs, createFrame(assembly));
  const native = (id: string, coordinates: Vec3): Vec3 => point(world(frame, { kind: 'part', id }), [coordinates[0] * 0.4, -coordinates[1] * 0.4, -coordinates[2] * 0.4]);
  const vector = (id: string, coordinates: Vec3): Vec3 => native(id, coordinates).map((value, axis) => value - native(id, [0, 0, 0])[axis]!) as Vec3;
  const equal = (a: Vec3, b: Vec3) => close(separation(a, b), 0);
  // Genuine feature declarations, including the reversed tube: its annular end is Y24, NOT Y18.
  const brickDat = readFileSync(new URL('../../static/models/library/39789.mpd', import.meta.url), 'utf8');
  assert.match(brickDat, /20 18 0 1 0 0 0 -1\.5 0 0 0 1 stud4a\.dat/);
  assert.match(brickDat, /-20 0 0 1 0 0 0 18 0 0 0 1 axl3hol8\.dat/);
  const rimDat = readFileSync(new URL('../../static/models/library/56903.mpd', import.meta.url), 'utf8');
  assert.match(rimDat, /0 0 -10 1 0 0 0 0 1 0 20 0 axl3hole\.dat/);
  assert.match(rimDat, /0 0 10 2 0 0 0 0 2 0 -1 0 4-4ring3\.dat/);
  const tileDat = readFileSync(new URL('../../static/models/library/15535.mpd', import.meta.url), 'utf8');
  assert.match(tileDat, /0 8 0 .* 1-8ring8\.dat/);
  assert.match(tileDat, /16 4 10 .* 5\.65686 4 5\.65686/);
  for (let index = 0; index < 2; index++) {
    const serial = index + 1, sign = index ? -1 : 1;
    const brick = `hand-magenta-technic-brick-${serial}`, jaw = `hand-black-angled-beam-${serial}`;
    const rim = `hand-small-wheel-${serial}`, tyre = `hand-small-tire-${serial}`;
    equal(native(rim, [8.5, 0, 10]), native(jaw, [0, sign * 10, 40 + sign * 8.5]));
    equal(native(brick, [-sign * 20, 24, 7]), native(jaw, [-7, -sign * 10, 0]));
    close(native(rim, [0, 0, 0])[1], 16); close(native(brick, [0, 0, 0])[1], 37.6);
    equal(native(rim, [0, 0, 0]), native(tyre, [0, 0, 0]));
    // Official shortcut uses coincident origins; uncompressed mesh bead/flange radii are NOT identical.
    close(separation(native(rim, [21, 0, 9]), native(tyre, [22, 0, 9])), 0.4);
    equal(vector(rim, [6, 0, 0]), vector(brick, [6, 0, 0]));
    for (let end = 0; end < 2; end++) {
      const tile = `hand-black-round-grip-${index * 2 + end + 1}`;
      const axle = `hand-yellow-axle-3-${index * 2 + (end ? 2 : 3)}`;
      const holeX = sign * (end ? 20 : -20), station = end ? 40 : 0;
      equal(native(brick, [holeX, 9, 0]), native(axle, [10, 0, 0]));
      equal(native(jaw, [0, 0, station]), native(axle, [-15, 0, 0]));
      equal(vector(axle, [0, 6, 0]), vector(brick, [6, 0, 0]));
      equal(vector(tile, [6, 0, 0]), vector(brick, [6, 0, 0]));
      for (const x of [-10, 10]) for (const z of [-10, 10]) {
        equal(native(brick, [holeX + x, 0, z]), native(tile, [x, 8, z]));
        equal(native(brick, [holeX + x, -4, z]), native(tile, [x, 4, z]));
      }
      close(native(tile, [0, 0, 0])[1], 40.8);
      close(native(axle, [29.5, 0, 0])[1] - native(tile, [0, 0, 0])[1], 1);
      close(native(axle, [-29.5, 0, 0])[1], 18.2);
      close(native(axle, [-27.5, 0, 0])[1], 19);
      const operation = roboticHand.operations.find((entry) => entry.partInstanceIds[0] === axle)!;
      const insertion = operation.stages.find((stage) => stage.phase === 'insert')!.insertion!;
      assert.deepEqual(insertion.axis, [0, -1, 0]);
      assert.equal(roboticHand.parts.find((part) => part.id === axle)!.sourceReference?.page, index * 8 + (end ? 15 : 17));
    }
    const rimOperation = roboticHand.operations.find((entry) => entry.partInstanceIds[0] === rim)!;
    assert.deepEqual(rimOperation.stages.find((stage) => stage.phase === 'insert')!.insertion!.axis, [0, -1, 0]);
  }
  assert.match(roboticHand.connections.find((entry) => entry.id === 'hand-wheel-axle-0')!.evidence.evidence.note, /NOT a source-dimensioned insertion stop/);
});

test('Hand solves nonlinear bilateral closure, holds and releases the real separate prop without count changes or teleports', () => {
  const assembly = compileAssembly(roboticHand), log = roboticHand.scenarios[0]!, compiled = compileSimulation(assembly, log), frame = createSimulationFrame(compiled);
  const staticFrame = sampleAssembly(assembly, assembly.durationMs, createFrame(assembly));
  const root = (id: string): NodeRef => ({ kind: 'subassembly', id });
  const ratios: number[] = [];
  for (const time of [500, 1000, 1700, 2400, 3000, 4200, 6000, 7200, 8500, 0, 3000]) {
    sampleSimulation(compiled, time, frame);
    const a = point(world(frame.assembly, root('hand-crank')), [0, 24, -8]);
    const b = point(world(frame.assembly, root('hand-jaw-2')), [16, 24, -8]);
    const c = point(world(frame.assembly, root('hand-jaw-1')), [-16, 24, 8]);
    close(separation(a, b), 16);
    close(separation(b, c), Math.hypot(32, 16));
    const whiteEnd = point(world(frame.assembly, root('hand-white-link')), [16, 24, -8]);
    const hEnd = point(world(frame.assembly, root('hand-h-coupler')), [-16, 24, 8]);
    close(separation(whiteEnd, b), 0, 1e-4);
    close(separation(hEnd, c), 0, 1e-4);
    assert.deepEqual(frame.assembly.counts, staticFrame.counts);
    if (time > 500 && time < 3000) ratios.push(frame.jointValues[3]! / frame.jointValues[0]!);
  }
  assert.ok(Math.max(...ratios) - Math.min(...ratios) > 0.05, 'actual H geometry is not an invented constant-ratio opposite jaw');
  for (const time of [3000, 6000]) {
    sampleSimulation(compiled, time, frame);
    const object = readTransform(frame.assembly.environmentTransforms);
    for (const contact of log.objectEvents[0]!.capture!.contacts) close(separation(point(world(frame.assembly, contact.holder), contact.holderPoint), point(object, contact.objectPoint)), 0, 0.001);
  }
  sampleSimulation(compiled, 3000, frame); const beforeLift = readTransform(frame.assembly.environmentTransforms);
  sampleSimulation(compiled, 4500, frame); const held = readTransform(frame.assembly.environmentTransforms);
  close(held.position[1] - beforeLift.position[1], 50);
  sampleSimulation(compiled, 6000 - 1e-5, frame); const beforeRelease = readTransform(frame.assembly.environmentTransforms);
  sampleSimulation(compiled, 6000, frame); const released = readTransform(frame.assembly.environmentTransforms);
  assert.ok(transformsEqual(beforeRelease, released, 1e-5));
  sampleSimulation(compiled, 9000, frame);
  assert.ok(transformsEqual(readTransform(frame.assembly.environmentTransforms), released));
  close(frame.jointValues[0]!, 0);
  const broken = structuredClone(log);
  broken.objectEvents[0]!.capture!.contacts[1]!.holderPoint[0] += 5;
  assert.throws(() => compileSimulation(assembly, broken), /capture contact gap/);
  const fresh = createSimulationFrame(compiled);
  for (const time of [2200, 7300, 0, 4500, 6000, 1000, 4500]) {
    sampleSimulation(compiled, time, frame); sampleSimulation(compiled, time, fresh);
    assert.deepEqual([...frame.assembly.transforms], [...fresh.assembly.transforms]);
    assert.deepEqual([...frame.assembly.environmentTransforms], [...fresh.assembly.environmentTransforms]);
    assert.deepEqual([...frame.jointValues], [...fresh.jointValues]);
  }
  assert.match(log.description, /left\/right.*left press\/release/);
  assert.equal(roboticHand.joints.filter((joint) => joint.drivenByMotorId).length, 1);
  assert.equal(roboticHand.joints.some((joint) => joint.coupling), false);
});

test('serial Hand loop atlas follows the previously solved jaw branch instead of compiling H against a frozen jaw', () => {
  const assembly = compileAssembly(roboticHand);
  const log = structuredClone(roboticHand.scenarios[0]!);
  log.id = 'hand-native-serial-branch-check';
  log.durationMs = 4000;
  log.objectEvents = [];
  log.rootMotion = [];
  log.motorCommands = [{ ...log.motorCommands[0]!, startMs: 0, durationMs: 3000, from: 0, to: 0.45 }];
  const compiled = compileSimulation(assembly, log), frame = createSimulationFrame(compiled);
  const sought = createSimulationFrame(compiled);
  for (const time of [0, 750, 1600, 2300, 3000, 1750, 500, 2999, 0]) {
    sampleSimulation(compiled, time, frame);
    const u = Math.min(time / 3000, 1), driver = 0.45 * u * u * (3 - 2 * u);
    // Independent source-indexed circles: ground32348[32,84], long axle[16,72],
    // opposite tan[48,96]: two8mm arms on opposite sides, not a symmetric angular ratio.
    // P30 opposite H crossbar ends span hypot(32,16), not the center/end span.
    const x = 32 - 8 * Math.sin(driver), z = -8 * Math.cos(driver);
    const expectedOtherJaw = Math.asin((x * x + z * z - (32 * 32 + 16 * 16 - 8 * 8)) / (16 * Math.hypot(x, z))) - Math.atan2(z, x);
    close(frame.jointValues[0]!, driver);
    close(frame.jointValues[1]!, driver, 1e-4);
    close(frame.jointValues[2]!, -driver, 1e-4);
    close(frame.jointValues[3]!, expectedOtherJaw, 1e-4);
    sampleSimulation(compiled, 4000, sought);
    sampleSimulation(compiled, time, sought);
    assert.deepEqual([...frame.jointValues], [...sought.jointValues]);
    assert.deepEqual([...frame.assembly.transforms], [...sought.assembly.transforms]);
  }
});
