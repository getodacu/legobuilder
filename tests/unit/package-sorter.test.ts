import assert from 'node:assert/strict';
import test from 'node:test';
import measuredBounds from '../../docs/validation/component-bounds.json' with { type: 'json' };
import { compileAssembly, createFrame, getStepTime, sampleAssembly } from '../../src/lib/assembly/engine.ts';
import { composeTransforms, identityTransform, readTransform, transformsEqual } from '../../src/lib/core/transforms.ts';
import { packageSorter as model } from '../../src/lib/models/package-sorter.ts';
import { compileSimulation, createSimulationFrame, sampleSimulation } from '../../src/lib/simulation/kinematics.ts';
import type { AssemblyFrame, Transform, Vec3 } from '../../src/lib/types/model.ts';

// Independent transcription of the canonical index2019 PDFs, not model-derived
// totals. Each row is [family, authentic DAT, material, Robot, Base, Packages].
const families: [string, string, string, number, number, number][] = [
  ['hub', '45601c01', '15', 1, 0, 0],
  ['peg-black-friction', '2780', '0', 18, 30, 0],
  ['panel-yellow-11x19', '39369', '14', 1, 0, 0],
  ['peg-tan-axle', '3749', '19', 5, 6, 0],
  ['clip-red', '49283', '4', 1, 0, 0],
  ['frame-azure-11x15', '39790', '322', 1, 0, 0],
  ['frame-magenta-7x11', '39794', '26', 2, 0, 0],
  ['beam-yellow-3', '32523', '14', 2, 0, 0],
  ['peg-black-knob', '6628', '0', 2, 4, 0],
  ['motor-large', '54675', '15', 1, 0, 0],
  ['connector-gray-3-four-snaps', '48989', '71', 6, 2, 0],
  ['angular-azure-3x5', '32526', '322', 2, 2, 0],
  ['biscuit-magenta', '39793', '26', 1, 4, 0],
  ['peg-blue-3-friction', '6558', '1', 6, 2, 0],
  ['beam-magenta-5', '32316', '26', 2, 2, 0],
  ['iframe-gray-3x5', '14720', '71', 2, 0, 0],
  ['biscuit-black', '39793', '0', 4, 0, 0],
  ['tbeam-black-3x3', '60484', '0', 0, 2, 0],
  ['motor-medium', '54696p01', '15', 0, 1, 0],
  ['frame-black-5x7', '64179', '0', 0, 2, 0],
  ['peg-gray', '3673', '71', 0, 6, 0],
  ['axle-yellow-7', '44294', '14', 0, 1, 0],
  ['axle-gray-5', '32073', '71', 0, 1, 0],
  ['gear-gray-28', '46372', '71', 0, 1, 0],
  ['beam-azure-13', '41239', '322', 0, 1, 0],
  ['beam-azure-7', '32524', '322', 0, 2, 0],
  ['beam-azure-2-cross', '60483', '322', 0, 2, 0],
  ['rod-gray-6', '2739a', '0', 0, 2, 0],
  ['angular-yellow-2x4', '32140', '14', 0, 2, 0],
  ['double-cross-block-light', '32184', '15', 0, 4, 0],
  ['beam-magenta-11', '32525', '26', 0, 1, 0],
  ['beam-black-15', '32278', '0', 0, 2, 0],
  ['color-sensor', '37308', '15', 0, 1, 0],
  ['plate-round-azure-2x2', '4032a', '322', 0, 2, 0],
  ['dish-transparent-6x6', '44375b', '47', 0, 2, 0],
  ['tile-round-black-2x2', '15535', '0', 0, 2, 0],
  ['axle-black-2-snap', '18651', '0', 0, 4, 0],
  ['axle-red-2', '32062', '4', 0, 2, 0],
  ['angular-yellow-3x7', '32271', '14', 0, 2, 0],
  ['angle-black-180', '32034', '0', 0, 2, 0],
  ['panel-azure-3x11x2', '11954', '322', 0, 2, 0],
  ['gear-gray-36', '32498', '0', 0, 0, 2],
  ['axle-yellow-3', '4519', '14', 0, 0, 2],
  ['brick-yellow-2x4-cross', '39789', '14', 0, 0, 2],
  ['brick-magenta-2x4-cross', '39789', '26', 0, 0, 2]
];
// Corrected source family, unchanged historical callout identities.
const correctedTowballIds = ['base2019:peg-black-friction:19', 'base2019:peg-black-friction:20'];
const compiled = compileAssembly(model);
function part(id: string) {
  const value = model.parts.find((entry) => entry.id === id);
  assert.ok(value, id);
  return value;
}
function nativePoint(pose: Transform, point: Vec3): Vec3 {
  return composeTransforms(pose, { ...identityTransform(), position: [point[0] * 0.4, -point[1] * 0.4, -point[2] * 0.4] }).position;
}
function close(a: Vec3, b: Vec3, label: string): void {
  a.forEach((value, index) => assert.ok(Math.abs(value - b[index]) < 1e-7, `${label}: ${a} != ${b}`));
}
function poseOf(frame: AssemblyFrame, id: string): Transform {
  const index = compiled.partIds.indexOf(id);
  assert.notEqual(index, -1, id);
  return readTransform(frame.transforms, index * 10);
}

test('canonical per-document source families retain identity, palette and all individual callout units', () => {
  const expectedIds: string[] = [];
  for (const [family, geometry, color, ...counts] of families) {
    ['robot2019', 'base2019', 'packages2019'].forEach((book, index) => {
      const stableCount = book === 'base2019' && family === 'peg-black-friction' ? 32 : book === 'base2019' && family === 'peg-black-knob' ? 2 : counts[index];
      let ids = Array.from({ length: stableCount }, (_, ordinal) => `${book}:${family}:${String(ordinal + 1).padStart(2, '0')}`);
      if (book === 'base2019' && family === 'peg-black-friction') ids = ids.filter((id) => !correctedTowballIds.includes(id));
      if (book === 'base2019' && family === 'peg-black-knob') ids.push(...correctedTowballIds);
      const actual = model.parts.filter((entry) => ids.includes(entry.id));
      assert.equal(actual.length, counts[index], `${book}:${family}`);
      if (ids.length) {
        const inventory = model.inventory.find((entry) => entry.id === `inventory-${book}:${family}`)!;
        assert.equal(inventory.quantity, counts[index]);
        assert.deepEqual([...inventory.partInstanceIds].sort(), [...ids].sort());
      }
      actual.forEach((entry) => {
        assert.equal(entry.geometryId, geometry, entry.id);
        assert.equal(entry.materialId, `ldraw-${color}`, entry.id);
        assert.equal(entry.inventoryScope, book === 'packages2019' ? 'sample' : 'robot');
        assert.equal(entry.partNumber, undefined, 'LDraw basename must not become a manufacturer SKU');
        expectedIds.push(entry.id);
      });
    });
  }
  assert.deepEqual([...model.parts.map((entry) => entry.id)].sort(), expectedIds.sort());
  assert.equal(new Set(expectedIds).size, 166);
  const counted = model.inventory.filter((entry) => entry.accounting === 'tracked').flatMap((entry) => entry.partInstanceIds);
  assert.deepEqual(counted.sort(), expectedIds);
});

test('all canonical source pages synchronize, without mixing Robot18 or duplicating Packages at Base58', () => {
  for (const [book, count, offset] of [['robot2019', 19, 3], ['base2019', 58, 2], ['packages2019', 3, 2]] as const) {
    for (let index = 1; index <= count; index++) {
      const step = model.steps.find((entry) => entry.id === `${book}-step${index}`);
      assert.ok(step, `${book}:${index}`);
      assert.equal(step.kind, 'numbered-instruction');
      assert.equal(step.sourceReferences[0].documentId, book);
      assert.equal(step.sourceReferences[0].page, index + offset);
      assert.equal(step.sourceReferences[0].instructionId, String(index));
      for (const operationId of step.operationIds) assert.equal(model.operations.find((entry) => entry.id === operationId)?.stepId, step.id);
    }
  }
  const placement = model.steps.find((entry) => entry.id === 'base2019-step58')!;
  assert.equal(placement.action, 'reuse');
  assert.deepEqual(placement.requiredPartInstanceIds, []);
  assert.equal(model.installations.filter((entry) => entry.stepId === placement.id).length, 0);
  assert.ok(getStepTime(compiled, 'packages2019-step3').endMs <= getStepTime(compiled, placement.id).startMs);
  assert.equal(model.installations.filter((entry) => entry.partInstanceId.startsWith('packages2019:')).length, 8);
});

test('whole visible native inventory becomes57 platform units, then158 robot+8 separately prepared sample units', () => {
  const frame = sampleAssembly(compiled, 0, createFrame(compiled));
  assert.ok([...frame.visible].every(Boolean));
  assert.equal(frame.counts.robotInstalled, 0);
  assert.equal(frame.counts.sampleInstalled, 0);
  const bounds = model.parts.map((entry) => {
    const measured = measuredBounds.assets.find((asset) => asset.id === entry.geometryId)!;
    assert.equal(measured.sha256, model.geometryAssets.find((asset) => asset.id === entry.geometryId)!.sha256);
    const pose = poseOf(frame, entry.id);
    assert.deepEqual(pose.quaternion, [0, 0, 0, 1]);
    assert.ok(Math.abs(pose.position[1] + measured.min[1] - 5) < 1e-8);
    return { id: entry.id, min: measured.min.map((value, axis) => value + pose.position[axis]), max: measured.max.map((value, axis) => value + pose.position[axis]) };
  });
  for (let a = 0; a < bounds.length; a++) for (let b = a + 1; b < bounds.length; b++) {
    assert.ok(bounds[a].max[0] <= bounds[b].min[0] || bounds[b].max[0] <= bounds[a].min[0] || bounds[a].max[2] <= bounds[b].min[2] || bounds[b].max[2] <= bounds[a].min[2], `Staged source geometry overlaps: ${bounds[a].id}/${bounds[b].id}`);
  }
  sampleAssembly(compiled, getStepTime(compiled, 'robot2019-step19').endMs, frame);
  assert.equal(frame.counts.robotInstalled, 57);
  assert.equal(frame.counts.sampleInstalled, 0);
  sampleAssembly(compiled, getStepTime(compiled, 'base2019-step56').endMs, frame);
  assert.equal(frame.counts.robotInstalled, 158);
  assert.equal(frame.counts.sampleInstalled, 0);
  const wholeArm = model.operations.find((entry) => entry.id === 'merge-yaw')!;
  assert.equal(wholeArm.sourceReference?.page, 58);
  assert.equal(wholeArm.partInstanceIds.length, 101);
  assert.deepEqual(wholeArm.stages[0].nodes, [{ kind: 'subassembly', id: 'yaw' }]);
  sampleAssembly(compiled, compiled.durationMs, frame);
  assert.equal(frame.counts.robotInstalled, 158);
  assert.equal(frame.counts.sampleInstalled, 8);
  assert.equal(frame.counts.stepsComplete, 80);
  for (const entry of model.parts) assert.equal(model.installations.filter((event) => event.partInstanceId === entry.id).length, 1);
  const times = [0, compiled.durationMs * 0.61, compiled.durationMs * 0.07, compiled.durationMs, compiled.durationMs * 0.31];
  for (const time of times) {
    const first = sampleAssembly(compiled, time, frame).transforms.slice();
    sampleAssembly(compiled, compiled.durationMs - time, frame);
    assert.deepEqual(sampleAssembly(compiled, time, frame).transforms, first);
  }
});

test('independent native DAT motor/gear axes and stacked39789 sample through-holes are seated', () => {
  //54675/u9363 rotor center (0,-50,0), not the arbitrary root origin.
  const large = part('robot2019:motor-large:01').finalTransform;
  close(nativePoint(large, [0, -50, 0]), model.joints.find((entry) => entry.id === 'yaw-A')!.origin.position, 'yaw native pivot');
  const medium = part('base2019:motor-medium:01').finalTransform;
  close(nativePoint(medium, [0, -50, 0]), model.joints.find((entry) => entry.id === 'output-F')!.origin.position, 'medium native pivot');
  close(nativePoint(medium, [0, -50, 0]), nativePoint(part('base2019:axle-yellow-7:01').finalTransform, [50, 0, 0]), '7L output seat');
  //s/u9363s01 opposite axle endY80, placed at rootY−50: body datumY+30.
  close(nativePoint(medium, [0, 30, 0]), nativePoint(part('base2019:axle-gray-5:01').finalTransform, [-30, 0, 0]), '5L genuine opposite rotor end, not bodyY+50');
  const z28 = part('base2019:gear-gray-28:01').finalTransform;
  close(nativePoint(z28, [0, 0, 0]), nativePoint(part('base2019:axle-yellow-7:01').finalTransform, [40, 0, 0]), 'z28 axial seat');
  const gearAxis = nativePoint(z28, [0, 0, 20]).map((value, index) => value - z28.position[index]) as Vec3;
  close(gearAxis, [8, 0, 0], '46372 axle normal is nativeZ, not nativeY');
  for (const [ordinal, family] of [[1, 'brick-magenta-2x4-cross'], [2, 'brick-yellow-2x4-cross']] as const) {
    const gear = part(`packages2019:gear-gray-36:0${ordinal}`).finalTransform;
    const shaft = part(`packages2019:axle-yellow-3:0${ordinal}`).finalTransform;
    const lower = part(`packages2019:${family}:01`).finalTransform;
    const upper = part(`packages2019:${family}:02`).finalTransform;
    close(nativePoint(gear, [0, 0, 10]), nativePoint(shaft, [10, 0, 0]), '32498 horizontal top face');
    close(nativePoint(lower, [0, 24, 0]), nativePoint(gear, [0, 0, 10]), 'lower39789 center through-hole');
    close(nativePoint(upper, [0, 24, 0]), nativePoint(lower, [0, 0, 0]), '39789 brick stud/underside seating');
    for (const y of [-20, 0, 20]) {
      close(nativePoint(gear, [0, y, 10]), nativePoint(lower, [-y, 24, 0]), 'Packages p5 underside inset aligns ALL THREE axle holes, not only the centre shaft');
      close(nativePoint(lower, [-y, 0, 0]), nativePoint(upper, [-y, 24, 0]), 'Both same-color bricks retain the complete native cross-hole row');
    }
  }
});

test('Robot19 outer short-rail pedestal graph seats the same source sample on both real outer gear axle holes', () => {
  const assembled = sampleAssembly(compiled, compiled.durationMs, createFrame(compiled));
  for (const [ordinal, side] of [[1, -1], [2, 1]] as const) {
    const frame = poseOf(assembled, `robot2019:frame-magenta-7x11:0${ordinal}`);
    const foot = poseOf(assembled, `robot2019:beam-magenta-5:0${ordinal}`);
    const h = poseOf(assembled, `robot2019:iframe-gray-3x5:0${ordinal}`);
    const gray1 = poseOf(assembled, `robot2019:connector-gray-3-four-snaps:0${ordinal + 2}`);
    const gray2 = poseOf(assembled, `robot2019:connector-gray-3-four-snaps:0${ordinal + 4}`);
    const black1 = poseOf(assembled, `robot2019:biscuit-black:0${ordinal}`);
    const black2 = poseOf(assembled, `robot2019:biscuit-black:0${ordinal + 2}`);
    const gear = poseOf(assembled, `packages2019:gear-gray-36:0${ordinal}`);
    for (const [index, z] of [[0, -40], [1, 40]] as const) {
      const blue = poseOf(assembled, `robot2019:peg-blue-3-friction:0${ordinal === 1 ? 3 + index : 5 + index}`);
      close(nativePoint(blue, [-20, 0, 0]), nativePoint(h, [20, 0, z]), 'Short blue section receives H bottom side hole');
      close(nativePoint(blue, [0, 0, 0]), nativePoint(foot, [0, 0, z]), 'Middle blue section receives magenta5L');
      close(nativePoint(blue, [20, 0, 0]), nativePoint(frame, [-z, 0, side * 100]), 'Outer blue section enters outer SHORT rail, second hole from corner');
    }
    close(nativePoint(h, [20, 0, 0]).map((v, axis) => v - h.position[axis]) as Vec3, [0, -8, 0], 'H central crossbar bores are nativeX, vertically receiving integral pins');
    close(nativePoint(h, [0, 20, 0]).map((v, axis) => v - h.position[axis]) as Vec3, [-8, 0, 0], 'H side-leg nativeY bores are horizontal, not the same axis as its crossbar');
    for (const [index, z] of [[0, -20], [1, 20]] as const) {
      close(nativePoint(gray1, [0, z, -20]), nativePoint(h, [0, 0, z]), 'First integral lower section enters H central crossbar');
      close(nativePoint(gray1, [0, z, 20]), nativePoint(black1, [20, 0, z]), 'First upper section enters lower black edge bore');
      close(nativePoint(gray2, [0, z, -20]), nativePoint(black1, [-20, 0, z]), 'Second integral lower section enters lower black top edge');
      close(nativePoint(gray2, [0, z, 20]), nativePoint(black2, [20, 0, z]), 'Second upper section enters upper black bottom edge');
      const tan = poseOf(assembled, `robot2019:peg-tan-axle:0${(ordinal === 1 ? 2 : 4) + index}`);
      close(nativePoint(tan, [-10, 0, 0]), nativePoint(black2, [-20, 0, z]), 'Top tan round half seats in the real black edge bore');
      close(nativePoint(tan, [10, 0, 0]), nativePoint(gear, [0, z, 0]), 'Exposed axle enters outer32498 cross hole, not centre package shaft');
      const blackFeature = part(`robot2019:biscuit-black:0${ordinal + 2}`).connectionPoints.find((point) => point.id === `sample-seat-${index}`)!;
      const gearFeature = part(`packages2019:gear-gray-36:0${ordinal}`).connectionPoints.find((point) => point.id === `pedestal-seat-${index}`)!;
      close(composeTransforms(black2, blackFeature.localTransform).position, composeTransforms(gear, gearFeature.localTransform).position, 'Actual black annulus and gear axle-boss material planes seat');
      const connection = model.connections.find((entry) => entry.id === `sample-${ordinal}-pedestal-${index}`)!;
      assert.equal(connection.type, 'sliding', 'Package can leave the exposed axles; this is not a permanent glued sample');
      assert.equal(connection.installedByOperationId, `place-package-${ordinal === 1 ? 'magenta' : 'yellow'}`);
    }
  }
});

test('source B2p26 crank cross bores are coaxial with F and both prepared rod sockets seat on genuine towballs', () => {
  const assembled = sampleAssembly(compiled, compiled.durationMs, createFrame(compiled));
  const motor = poseOf(assembled, 'base2019:motor-medium:01');
  const shaft = nativePoint(motor, [0, -50, 0]);
  const motorY = nativePoint(motor, [0, -30, 0]).map((v, i) => (v - shaft[i]) / 8) as Vec3;
  for (const ordinal of [1, 2]) {
    const crank = poseOf(assembled, `base2019:beam-azure-2-cross:0${ordinal}`);
    const cross = nativePoint(crank, [0, 0, 0]);
    const boreAxis = nativePoint(crank, [0, 20, 0]).map((v, i) => (v - cross[i]) / 8) as Vec3;
    assert.ok(Math.abs(Math.abs(boreAxis.reduce((sum, v, i) => sum + v * motorY[i], 0)) - 1) < 1e-7, '60483 nativeY cross-hole axis, not an invented nativeZ bore');
    const offset = cross.map((v, i) => v - shaft[i]) as Vec3;
    const axial = offset.reduce((sum, v, i) => sum + v * motorY[i], 0);
    close(offset.map((v, i) => v - axial * motorY[i]) as Vec3, [0, 0, 0], 'Crank cross hole lies on the actual F shaft line');
    const pin = poseOf(assembled, correctedTowballIds[ordinal - 1]);
    close(nativePoint(crank, [0, 0, 20]), nativePoint(pin, [10, 0, 0]), '6628 pin half centers in the60483 round bore');
    const rod = poseOf(assembled, `base2019:rod-gray-6:0${ordinal}`);
    close(nativePoint(pin, [-10, 0, 0]), nativePoint(rod, [0, 0, 100]), 'The prepared rod socket closes on the real sphere center on both mirrored sides');
    const side = ordinal === 1 ? 'left' : 'right';
    const prepared = model.operations.find((operation) => operation.id === `merge-ball-link-${side}`)!;
    assert.ok(prepared, 'Spherical2739 has its own body node, not a rigid crank mesh group');
    assert.equal(prepared.sourceReference?.page, 25);
    assert.deepEqual(prepared.partInstanceIds, [`base2019:rod-gray-6:0${ordinal}`]);
    assert.deepEqual(prepared.fromTransforms[0].quaternion, prepared.toTransforms[0].quaternion, 'Prepared p25 socket transfer preserves native rod phase');
  }
});

test('B2p21–22 carrier rear ROUND bearings seat on F without becoming keyed motor outputs', () => {
  const assembled = sampleAssembly(compiled, compiled.durationMs, createFrame(compiled));
  for (const [ordinal, shaftId, shaftSection, mateId] of [
    [1, 'base2019:axle-yellow-7:01', 20, 'carrier-left-round-bearing'],
    [2, 'base2019:axle-gray-5:01', -20, 'carrier-right-round-bearing']
  ] as const) {
    const beam = poseOf(assembled, `base2019:beam-azure-7:0${ordinal}`);
    //32524.dat: rear end(0,0,-60), axisY; all seven holes are round.
    const rear = nativePoint(beam, [0, 0, -60]);
    const bore = nativePoint(beam, [0, 20, -60]);
    close(bore.map((v, axis) => v - rear[axis]) as Vec3, [-8, 0, 0], '7L stands on edge, with transverse nativeY bearing bores');
    close(rear, nativePoint(poseOf(assembled, shaftId), [shaftSection, 0, 0]), 'Real shaft cross-section passes through rear END hole');
    assert.equal(model.connections.find((connection) => connection.id === mateId)?.type, 'pivot', 'A round receiving bore is not a keyed drive mate');
    const side = ordinal === 1 ? -1 : 1;
    const crank = poseOf(assembled, `base2019:beam-azure-2-cross:0${ordinal}`);
    const plate = poseOf(assembled, `base2019:plate-round-azure-2x2:0${ordinal}`);
    const dish = poseOf(assembled, `base2019:dish-transparent-6x6:0${ordinal}`);
    const tile = poseOf(assembled, `base2019:tile-round-black-2x2:0${ordinal}`);
    const white = poseOf(assembled, `base2019:double-cross-block-light:0${3 - ordinal}`);
    close(nativePoint(white, [0, 0, -side * 10]), nativePoint(crank, [0, -side * 10, 0]), 'White F bearing seats outside crank');
    close(nativePoint(plate, [0, 8, 0]), nativePoint(white, [0, 0, side * 10]), 'Plate underside seats outside white bearing, not through it');
    const sphere = nativePoint(poseOf(assembled, correctedTowballIds[ordinal - 1]), [-10, 0, 0]);
    assert.ok(Math.abs(sphere[0] - white.position[0]) > 7.2, 'Input sphere lies inward above7L, outside the white material slab plus genuine8LDU sphere radius');
    close(nativePoint(dish, [0, 8, 0]), nativePoint(plate, [0, 0, 0]), 'Dish inner snap plane meets plate stud plane');
    close(nativePoint(tile, [0, 8, 0]), nativePoint(dish, [0, 0, 0]), 'Tile underside meets dish stud plane');
  }
  const motor = poseOf(assembled, 'base2019:motor-medium:01');
  const gear = poseOf(assembled, 'base2019:gear-gray-28:01');
  close(nativePoint(gear, [0, 0, 10]), nativePoint(motor, [0, -50, 0]), 'z28 inner face meets actual rotor end');
  close(nativePoint(gear, [0, 0, -10]), nativePoint(poseOf(assembled, 'base2019:beam-azure-7:01'), [0, -10, -60]), 'Left round bearing sits outside gear, not intersecting it');
  close(nativePoint(motor, [0, 30, 0]), nativePoint(poseOf(assembled, 'base2019:beam-azure-7:02'), [0, 10, -60]), 'Opposite bearing meets genuine rotor end without forced body symmetry');
  assert.ok(!model.joints.some((joint) => joint.child.id === 'arm-support' && joint.drivenByMotorId), 'Carrier is not an extra independently powered axis or rigid motor ratio');
});

test('B2p18–22 carrier closes biscuit side bores, four-pin connectors and7L without parallel-hole proxies', () => {
  const assembled = sampleAssembly(compiled, compiled.durationMs, createFrame(compiled));
  const biscuit = poseOf(assembled, 'base2019:biscuit-magenta:03');
  const crossbar = poseOf(assembled, 'base2019:beam-azure-13:01');
  for (const [ordinal, side] of [[1, -1], [2, 1]] as const) {
    const connector = poseOf(assembled, `base2019:connector-gray-3-four-snaps:0${ordinal}`);
    const beam = poseOf(assembled, `base2019:beam-azure-7:0${ordinal}`);
    //48989 integral pin mid-sections(0,±20,±20), not its central hole.
    for (const z of [-20, 20]) {
      close(nativePoint(connector, [0, z, -side * 20]), nativePoint(biscuit, [side * 20, 0, z]), 'Inward integral pin seats in39793 side passage');
      close(nativePoint(connector, [0, z, side * 20]), nativePoint(beam, [0, 0, z + 40]), 'Outward integral pin seats in7L first/third front holes');
    }
    const pin = poseOf(assembled, `base2019:peg-black-friction:${ordinal + 16}`);
    close(nativePoint(pin, [10, 0, 0]), nativePoint(crossbar, [0, 0, side * 20]), '13L central round hole receives lower pin half');
    close(nativePoint(pin, [-10, 0, 0]), nativePoint(biscuit, [side * 20, 0, 0]), '39793 top bore receives upper pin half');
  }
});

test('B2p36–44 rear white ROUND bearings receive F and all four L pins seat ONE11L crossbar', () => {
  const assembled = sampleAssembly(compiled, compiled.durationMs, createFrame(compiled));
  const crossbar = poseOf(assembled, 'base2019:beam-magenta-11:01');
  for (const [ordinal, side, shaftId, section] of [
    [1, 1, 'base2019:axle-gray-5:01', 20],
    [2, -1, 'base2019:axle-yellow-7:01', -20]
  ] as const) {
    const white = poseOf(assembled, `base2019:double-cross-block-light:0${ordinal}`);
    const l = poseOf(assembled, `base2019:angular-azure-3x5:0${ordinal}`);
    close(nativePoint(white, [0, 0, 0]), nativePoint(poseOf(assembled, shaftId), [section, 0, 0]), 'Central ROUND passage is the real F shaft bearing');
    close(nativePoint(white, [0, 0, 20]).map((v, axis) => v - white.position[axis]) as Vec3, [8, 0, 0], 'White central nativeZ, not either perpendicular outer axle passage');
    for (const [index, y] of [[0, -20], [1, 20]] as const) {
      const tan = poseOf(assembled, `base2019:peg-tan-axle:0${ordinal === 1 ? 3 + index : 5 + index}`);
      close(nativePoint(tan, [10, 0, 0]), nativePoint(white, [0, y, 0]), 'Tan axle half keys white outer cross');
      close(nativePoint(tan, [-10, 0, 0]), nativePoint(l, [0, 0, index * 40]), 'Tan round half seats L long-arm holes0/40');
    }
    for (const [index, x, barHole] of [[0, 0, side * 100], [1, 40, side * 60]] as const) {
      const pin = poseOf(assembled, `base2019:peg-black-friction:${ordinal === 1 ? 23 + index : 25 + index}`);
      close(nativePoint(pin, [-10, 0, 0]), nativePoint(l, [x, 0, 80]), 'L lower two genuine pin holes');
      close(nativePoint(pin, [10, 0, 0]), nativePoint(crossbar, [0, 0, barHole]), 'All four pins close onto the same source11L, not independently shifted bars');
    }
  }
  const barFeature = part('base2019:beam-magenta-11:01').connectionPoints.find((point) => point.id === 'rear-frame-stop-candidate')!;
  const bodyFeature = part('base2019:motor-medium:01').connectionPoints.find((point) => point.id === 'rear-frame-stop-body-candidate')!;
  close(barFeature.localTransform.position, [3.6, 4, -8], 'Genuine32525 material edge, not a gap-closing marker');
  close(bodyFeature.localTransform.position, [11.6, 0, -27.6], 'Actual u9366 X29 side face in motor root coordinates');
  const barPoint = composeTransforms(crossbar, barFeature.localTransform).position;
  const bodyPoint = composeTransforms(poseOf(assembled, 'base2019:motor-medium:01'), bodyFeature.localTransform).position;
  close(barPoint.map((v, axis) => v - bodyPoint[axis]) as Vec3, [0, 0, -0.4], 'Real1LDU nominal stop clearance is not erased');
  assert.equal(barFeature.evidence.fit, 'unchecked', 'Registered candidate is not a fabricated active-contact certification');
});

test('B2p14–17 andp27–44 body rails, yellow cradles and direct black mast seats use real receiving axes', () => {
  const assembled = sampleAssembly(compiled, compiled.durationMs, createFrame(compiled));
  const motor = poseOf(assembled, 'base2019:motor-medium:01');
  const bottom = poseOf(assembled, 'base2019:biscuit-magenta:01');
  const top = poseOf(assembled, 'base2019:biscuit-magenta:02');
  const upright = poseOf(assembled, 'base2019:biscuit-magenta:04');
  const sensor = poseOf(assembled, 'base2019:color-sensor:01');
  for (const [ordinal, side] of [[1, -1], [2, 1]] as const) {
    const rail = poseOf(assembled, `base2019:beam-magenta-5:0${ordinal}`);
    for (const [railZ, bodyZ, pinOrdinal] of [[20, -20, ordinal === 1 ? 12 : 15], [-20, 20, ordinal === 1 ? 13 : 16]]) {
      const pin = poseOf(assembled, `base2019:peg-black-friction:${pinOrdinal}`);
      close(nativePoint(pin, [-10, 0, 0]), nativePoint(rail, [0, 0, railZ]), '5L body rail receives inward pin section');
      close(nativePoint(pin, [10, 0, 0]), nativePoint(motor, [-20, side * 20, bodyZ]), 'Real motor body nativeX receiver, not the rotor passage');
    }
    close(nativePoint(rail, [0, 20, 0]).map((v, axis) => v - rail.position[axis]) as Vec3, [0, 0, -8], '5L round bores face native assemblyZ');
    const upperPin = poseOf(assembled, `base2019:peg-black-friction:${ordinal === 1 ? 11 : 14}`);
    close(nativePoint(upperPin, [-10, 0, 0]), nativePoint(rail, [0, 0, 40]), '5L top end pin half');
    close(nativePoint(upperPin, [10, 0, 0]), nativePoint(top, [20, 0, side * 20]), 'Top biscuit genuine nativeX side bore');
    const lowerPin = poseOf(assembled, `base2019:peg-black-friction:${String(ordinal + 8).padStart(2, '0')}`);
    close(nativePoint(lowerPin, [10, 0, 0]), nativePoint(rail, [0, 0, -40]), '5L bottom end pin half');
    close(nativePoint(lowerPin, [-10, 0, 0]), nativePoint(bottom, [-20, 0, side * 20]), 'Lower biscuit genuine nativeX side bore');
    close(nativePoint(top, [20, 0, 0]).map((v, axis) => v - top.position[axis]) as Vec3, [0, 0, 8], 'Biscuit side passages are nativeX, not guessed nativeZ');
    const bridgePin = poseOf(assembled, `base2019:peg-black-friction:${ordinal + 26}`);
    close(nativePoint(bridgePin, [10, 0, 0]), nativePoint(top, [0, 0, side * 20]), 'Vertical bridge pin in top biscuit nativeY main bore');
    close(nativePoint(bridgePin, [-10, 0, 0]), nativePoint(upright, [20, 0, side * 20]), 'Standing biscuit nativeX side bore receives vertical pin');
  }
  for (const [ordinal, side] of [[1, 1], [2, -1]] as const) {
    const yellow = poseOf(assembled, `base2019:angular-yellow-2x4:0${ordinal}`);
    const tan = poseOf(assembled, `base2019:peg-tan-axle:0${ordinal}`);
    const black = poseOf(assembled, `base2019:peg-black-friction:${ordinal + 20}`);
    const blue = poseOf(assembled, `base2019:peg-blue-3-friction:0${ordinal}`);
    const mast = poseOf(assembled, `base2019:beam-black-15:0${ordinal}`);
    close(nativePoint(tan, [-10, 0, 0]), nativePoint(motor, [20, side * 20, 20]), 'Tan round half seats in body, not an outboard shaft');
    close(nativePoint(tan, [10, 0, 0]), nativePoint(yellow, [0, 0, 0]), 'Tan axle half keys yellow root cross');
    close(nativePoint(black, [-10, 0, 0]), nativePoint(yellow, [0, 0, 20]), 'Black pin at actual yellowz20');
    close(nativePoint(black, [10, 0, 0]), nativePoint(mast, [0, 0, -140]), 'Black pin directly receives black15L bottom hole');
    close(nativePoint(blue, [-20, 0, 0]), nativePoint(yellow, [0, 0, 60]), 'Blue short side seats in yellow, not white F bearing');
    close(nativePoint(blue, [0, 0, 0]), nativePoint(mast, [0, 0, -100]), 'Blue first long section receives third15L hole');
    close(nativePoint(mast, [0, 20, 0]).map((v, axis) => v - mast.position[axis]) as Vec3, [0, 0, -8], 'Mast bore axes match its two direct cradle pins');
    const headPin = poseOf(assembled, `base2019:peg-black-friction:${ordinal + 28}`);
    close(nativePoint(headPin, [-10, 0, 0]), nativePoint(mast, [0, 0, 120]), 'Head pin in second15L hole from top');
    close(nativePoint(headPin, [10, 0, 0]), nativePoint(sensor, [-side * 20, 0, 0]), 'Actual D sensor rear nativeZ receiver');
    assert.equal(model.connections.find((connection) => connection.id === `cradle-${ordinal}-body-round`)?.type, 'pivot');
  }
});

test('B2p49–57 fork adapter and panel close their distinct native axle and pin receiving rows', () => {
  const assembled = sampleAssembly(compiled, compiled.durationMs, createFrame(compiled));
  const crossbar = poseOf(assembled, 'base2019:beam-azure-13:01');
  for (const [ordinal, side] of [[1, -1], [2, 1]] as const) {
    const white = poseOf(assembled, `base2019:double-cross-block-light:0${ordinal + 2}`);
    const bearing = poseOf(assembled, `base2019:axle-black-2-snap:0${ordinal}`);
    const fork = poseOf(assembled, `base2019:angular-yellow-3x7:0${ordinal}`);
    const forkAxle = poseOf(assembled, `base2019:axle-black-2-snap:0${ordinal + 2}`);
    const bendPin = poseOf(assembled, `base2019:peg-black-friction:${ordinal + 30}`);
    const panel = poseOf(assembled, `base2019:panel-azure-3x11x2:0${ordinal}`);
    close(nativePoint(bearing, [0, 0, 0]), nativePoint(crossbar, [0, 0, side * 120]), '13L round end bearing');
    close(nativePoint(bearing, [20, 0, 0]), nativePoint(white, [0, -20, 0]), 'White aft outer cross lies below carrier');
    close(nativePoint(forkAxle, [0, 0, 0]), nativePoint(fork, [0, 0, 0]), 'Fork LONG end cross, not its bend hole');
    close(nativePoint(forkAxle, [20, 0, 0]), nativePoint(white, [0, 20, 0]), 'White forward outer cross keys fork40LDU ahead of carrier');
    close(nativePoint(forkAxle, [-20, 0, 0]), nativePoint(panel, [-20, -40, side * 40]), '18651 pin enters first nativeX hole of panel rear mounting group');
    close(nativePoint(bendPin, [10, 0, 0]), nativePoint(fork, [0, 0, 120]), '32271 bend round bore');
    close(nativePoint(bendPin, [-10, 0, 0]), nativePoint(panel, [-20, -40, -side * 80]), 'Other FRONT group first hole retains120LDU mounting pitch');
    const ball = poseOf(assembled, `base2019:peg-black-knob:0${ordinal}`);
    close(nativePoint(ball, [10, 0, 0]), nativePoint(panel, [0, 0, side * 80]), 'Terminal nativeY hole lies40LDU aft of the fork long-end mount');
    const rod = poseOf(assembled, `base2019:rod-gray-6:0${ordinal}`);
    close(nativePoint(ball, [-10, 0, 0]), nativePoint(rod, [0, 0, 0]), 'The actual fork sphere closes the real free rod socket, without marker relocation');
    // Each member has9LDU material radius along this fore/aft direction.
    assert.ok(Math.abs(fork.position[2] - crossbar.position[2]) > 7.2, 'Fork starts forward of13L rather than overlapping its material plane');
    const red = poseOf(assembled, `base2019:axle-red-2:0${ordinal}`);
    const cap = poseOf(assembled, `base2019:angle-black-180:0${ordinal}`);
    close(nativePoint(red, [10, 0, 0]), nativePoint(fork, [32, 0, 144]), 'Actual bent short-end cross, not rectangular-grid guess');
    close(nativePoint(red, [-10, 0, 0]), nativePoint(cap, [0, 0, -20]), '32034 axial socket is nativeZ');
    close(nativePoint(fork, [32, 0, 144]), nativePoint(panel, [-40, -8, -side * 104]), 'B2p52 bent tip goes toward the spine at panelY−8, not outside the panel atY−72');
    assert.equal(model.connections.find((connection) => connection.id === `fork-${ordinal}-carrier-round`)?.type, 'pivot');
    for (const suffix of ['white-bearing-key', 'white-forward-key', '32271-key']) assert.equal(model.connections.find((connection) => connection.id === `fork-${ordinal}-${suffix}`)?.type, 'fixed', 'CROSS/CROSS shaft is keyed, not an invented forward-axis swivel');
    const panelPart = part(`base2019:panel-azure-3x11x2:0${ordinal}`);
    close(panelPart.connectionPoints.find((point) => point.id === 'support-lip-centroid')!.localTransform.position, [3.6, -1.8, side * 29.8], 'Native upward finite lip facet');
    close(panelPart.connectionPoints.find((point) => point.id === 'inner-face-witness')!.localTransform.position, [-3.2, -4, side * 24], 'Native inner finite material facet');
    close(part(`base2019:angle-black-180:0${ordinal}`).connectionPoints.find((point) => point.id === 'inner-annular-face-witness')!.localTransform.position, [-side * 4, -3.4, 0], 'Annular point radius8.5 is material, not the8LDU mouth void');
  }
});

test('Base p24 source towballs retain their exact identities and genuine native rod socket features', () => {
  correctedTowballIds.forEach((id, index) => {
    const pin = part(id), rod = part(`base2019:rod-gray-6:0${index + 1}`);
    assert.equal(pin.geometryId, '6628', 'The spherical p24 callout is not a plain2780 pin');
    assert.equal(pin.name, 'Technic Pin Towball with Friction');
    assert.equal(pin.materialId, 'ldraw-0');
    assert.equal(pin.sourceReference?.page, 24);
    assert.equal(pin.sourceReference?.instructionId, '22');
    assert.equal(rod.geometryId, '2739a');
    const ball = pin.connectionPoints.find((point) => point.id === 'towball-center')!;
    const sockets = [0, 100].map((z) => rod.connectionPoints.find((point) => point.id === `socket-${z}`)!);
    assert.ok(ball && sockets.every(Boolean), 'Real sphere/socket centers must remain inspectable');
    // Independent DAT transcription:6628 sphere(-10,0,0),2739a sockets z0/100.
    close(ball.localTransform.position, [-4, 0, 0], '6628 native sphere center');
    close(sockets[0].localTransform.position, [0, 0, 0], '2739a first socket');
    close(sockets[1].localTransform.position, [0, 0, -40], '2739a second socket');
    assert.ok([ball, ...sockets].every((point) => point.type === 'surface' && point.evidence.fit === 'unchecked'));
    const install = model.installations.filter((event) => event.partInstanceId === id);
    assert.equal(install.length, 1);
    assert.equal(install[0].stepId, 'base2019-step22');
    const assembled = sampleAssembly(compiled, compiled.durationMs, createFrame(compiled));
    close(composeTransforms(poseOf(assembled, id), ball.localTransform).position, nativePoint(pin.finalTransform, [-10, 0, 0]), 'authentic sphere follows the installed source instance');
  });
  assert.equal(model.parts.filter((entry) => entry.geometryId === '2780').length, 48);
  assert.equal(model.parts.filter((entry) => entry.geometryId === '6628').length, 6);
  assert.equal(model.linkageConstraints.length, 0, 'Feature identity alone cannot certify closed fork motion');
});

test('published Python and SVG command variants retain distinct branch outputs and final command ordering', () => {
  for (const scenario of model.scenarios) {
    assert.deepEqual(scenario.sensorSignals.map((signal) => [signal.port, signal.value, signal.basis]), [['D', 'magenta', 'scripted-input'], ['D', 'yellow', 'scripted-input']]);
    const liftTargets = scenario.motorCommands.filter((command) => command.motorId === 'motor-F').map((command) => Math.round(command.to * 180 / Math.PI));
    assert.deepEqual(liftTargets, [-120, 25, -125, 25, -120, 25, -125, 25, -75, 25, -75, 25, -75, 25, -120]);
    const finalPorts = scenario.motorCommands.slice(-2).map((command) => command.motorId);
    assert.deepEqual(finalPorts, scenario.id.includes('python') ? ['motor-A', 'motor-F'] : ['motor-F', 'motor-A']);
    assert.match(scenario.title, /pickup disabled/);
    assert.equal(scenario.objectEvents.length, 0, 'No invented contact or teleport to cover an unresolved loop');
  }
});

test('source-supported yaw and motor output replay deterministically, without pretending the blocked fork is solved', () => {
  assert.deepEqual(model.joints.map((joint) => joint.id), ['yaw-A', 'output-F']);
  assert.equal(model.linkageConstraints.length, 0, 'A guessed four-bar is not the documented compound mechanism');
  for (const scenario of model.scenarios) {
    const simulation = compileSimulation(compiled, scenario), frame = createSimulationFrame(simulation);
    sampleSimulation(simulation, 0, frame);
    const initialFork = poseOf(frame.assembly, 'base2019:panel-azure-3x11x2:01');
    const initialGear = poseOf(frame.assembly, 'base2019:gear-gray-28:01');
    sampleSimulation(simulation, 300, frame); // First F command; yaw has not begun.
    assert.ok(transformsEqual(poseOf(frame.assembly, 'base2019:panel-azure-3x11x2:01'), initialFork));
    assert.ok(!transformsEqual(poseOf(frame.assembly, 'base2019:gear-gray-28:01'), initialGear));
    const first = frame.assembly.transforms.slice();
    sampleSimulation(simulation, scenario.durationMs, frame);
    sampleSimulation(simulation, 300, frame);
    assert.deepEqual(frame.assembly.transforms, first);
    assert.equal(model.coverage.verifiedSteps, 0);
    assert.ok(model.parts.every((entry) => entry.placementEvidence.fit === 'unchecked'));
  }
});

test('source two-package pickup, contact-selected passive fork closure and distinct accepted/rejected delivery', { skip: 'BLOCKED: two genuine40mm spherical rods constrain three passive coordinates. Source-registered active material contact/stop and encoder phase/sign are still missing; see docs/research/sorter-linkage-resolution.md. Command replay is not sorting acceptance.' }, () => {
  for (const scenario of model.scenarios) {
    const captures = scenario.objectEvents.filter((event) => event.action === 'attach');
    const releases = scenario.objectEvents.filter((event) => event.action === 'release');
    assert.deepEqual(captures.map((event) => event.objectSubassemblyId).sort(), ['package-magenta', 'package-yellow']);
    assert.equal(releases.length, 2);
    for (const event of captures) {
      assert.ok(event.capture);
      assert.equal(new Set(event.capture.contacts.map((contact) => `${contact.holder.kind}:${contact.holder.id}`)).size, 2);
    }
    assert.notDeepEqual(releases[0].transform.position, releases[1].transform.position);
    const simulation = compileSimulation(compiled, scenario);
    const frame = createSimulationFrame(simulation);
    for (const event of scenario.objectEvents) {
      sampleSimulation(simulation, event.timeMs - 0.001, frame);
      const before = frame.assembly.transforms.slice();
      sampleSimulation(simulation, event.timeMs + 0.001, frame);
      for (let index = 0; index < model.parts.length; index++) {
        if (model.parts[index].inventoryScope !== 'sample') continue;
        const offset = index * 10;
        assert.ok(Math.hypot(...[0, 1, 2].map((axis) => before[offset + axis] - frame.assembly.transforms[offset + axis])) < 0.01);
      }
    }
  }
});
