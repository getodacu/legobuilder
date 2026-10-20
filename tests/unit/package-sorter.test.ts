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
  close(nativePoint(medium, [0, -50, 0]), nativePoint(part('base2019:axle-yellow-7:01').finalTransform, [60, 0, 0]), '7L output seat');
  close(nativePoint(medium, [0, 50, 0]), nativePoint(part('base2019:axle-gray-5:01').finalTransform, [-40, 0, 0]), '5L opposite seat');
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
    assert.ok(model.coverage.outstandingDeviations.some((deviation) => /not acceptance-complete/.test(deviation)));
    assert.equal(model.coverage.verifiedSteps, 0);
    assert.ok(model.parts.every((entry) => entry.placementEvidence.fit === 'unchecked'));
  }
});

test('source two-package pickup, nonlinear fork closure and continuous distinct accept/reject delivery', { skip: 'BLOCKED: B2pp25/27/36/53 compound32140/32184/32526 joint indexing and actual two-prong gear contacts require geometric reconstruction. See docs/validation/package-sorter.md; command replay is not sorting acceptance.' }, () => {
  assert.equal(model.linkageConstraints.filter((loop) => loop.type === 'planar-closed-loop').length, 2);
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
