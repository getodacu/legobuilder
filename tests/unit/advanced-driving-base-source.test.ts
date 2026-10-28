import assert from 'node:assert/strict';
import test from 'node:test';
import manual from '../../docs/research/data/advanced-driving-base.json' with { type: 'json' };
import { compileAssembly, createFrame, getStepTime, sampleAssembly } from '../../src/lib/assembly/engine.ts';
import { composeTransforms, readTransform } from '../../src/lib/core/transforms.ts';
import { advancedDrivingBase as model, advancedDrivingBaseSourceFamilies } from '../../src/lib/models/advanced-driving-base.ts';
import type { Vec3 } from '../../src/lib/types/model.ts';

const parts = new Map(model.parts.map((part) => [part.id, part]));

test('each prepared part family and numbered instruction reconciles with the independently transcribed five books', () => {
  assert.equal(model.parts.length, 234);
  assert.equal(model.steps.length, 136);
  const books: Record<string, Record<string, number>> = {};
  for (const part of model.parts) {
    const reference = part.sourceReference;
    assert.ok(reference, part.id);
    assert.ok(reference.documentId.startsWith('adb-book'), part.id);
    const book = reference.documentId.slice('adb-book'.length);
    const family = advancedDrivingBaseSourceFamilies[part.id];
    assert.ok(family, part.id);
    const count = books[book] ??= {};
    count[family] = (count[family] ?? 0) + 1;
    assert.equal(model.installations.filter((event) => event.partInstanceId === part.id).length, 1, part.id);
  }
  assert.deepEqual(books, manual.inventoryEvidence.byBook);
  for (const sourceStep of manual.steps) {
    const id = `book${sourceStep.book}-step${sourceStep.step}`;
    const authored = model.steps.find((step) => step.id === id);
    assert.ok(authored, id);
    assert.equal(authored.sourceReferences[0]?.page, sourceStep.pdfPage, id);
    assert.equal(authored.sourceReferences[0]?.instructionId, String(sourceStep.step), id);
    const callout: Record<string, number> = {};
    for (const item of sourceStep.addedParts) callout[item.partKey] = (callout[item.partKey] ?? 0) + item.quantity;
    const actual: Record<string, number> = {};
    for (const part of model.parts.filter((entry) => entry.sourceReference?.documentId === `adb-book${sourceStep.book}` && entry.sourceReference?.instructionId === String(sourceStep.step))) {
      const family = advancedDrivingBaseSourceFamilies[part.id];
      actual[family] = (actual[family] ?? 0) + 1;
    }
    assert.deepEqual(actual, callout, `${id}: part instances match the published visual callout`);
  }
});

test('source-declared rigid mating points meet in the final assembly; captive flexible electrical leads are not falsely rendered as fitted plugs', () => {
  for (const connection of model.connections) {
    if (connection.type === 'electrical') continue;
    const a = parts.get(connection.a.partInstanceId);
    const b = parts.get(connection.b.partInstanceId);
    assert.ok(a && b, connection.id);
    const aPoint = a.connectionPoints.find((point) => point.id === connection.a.connectionPointId);
    const bPoint = b.connectionPoints.find((point) => point.id === connection.b.connectionPointId);
    assert.ok(aPoint && bPoint, connection.id);
    const aPosition = composeTransforms(a.finalTransform, aPoint.localTransform).position;
    const bPosition = composeTransforms(b.finalTransform, bPoint.localTransform).position;
    assert.ok(Math.hypot(...aPosition.map((v, i) => v - bPosition[i]!)) < 0.05, `${connection.id}: actual endpoints do not coincide`);
  }
});

test('14720 H-frame connection markers land on real endbar or central-spine bore features, not invented mounting holes', () => {
  // Independently transcribed 14720.dat lines 14–18 and its s/32523s01.dat
  // endbars: holes at native (x = −20, 0, 20; z = ±40), axis Y.
  // Spine bores at native (x = 0; z = −20, 0, 20), axis X.
  const allowed = [-20, 0, 20].flatMap((x) => [-40, 40].flatMap((z) => [-10, 0, 10].map((y) => [x, y, z])))
    .concat([-10, 0, 10].flatMap((x) => [-20, 0, 20].map((z) => [x, 0, z])));
  for (const part of model.parts.filter((entry) => entry.geometryId === '14720')) {
    for (const connection of part.connectionPoints) {
      const [x, y, z] = connection.localTransform.position;
      const native = [x / 0.4, -y / 0.4, -z / 0.4];
      assert.ok(allowed.some((hole) => hole.every((value, axis) => Math.abs(value - native[axis]!) < 0.05)),
        `${part.id} ${connection.id}: authored ${native.join(',')} has no real H-frame bore`);
    }
  }
});

test('Front motor source step 10 seats the actual bottom bores on original pins and joins one mechanical component', () => {
  const front = model.parts.filter((part) => part.sourceReference?.documentId === 'adb-book1');
  assert.equal(front.length, 73);
  const motor = parts.get('front-medium-motor')!;
  // Independently from u9365/u9366 native bottom entrance (Y30, Z-20/140)
  // after LDraw's 0.4 mm unit and Rx(pi) scene normalization.
  for (const [side, pin, expectedLocal, expectedWorld] of [
    ['left', 'pin-3', [0, -12, 8], [0, 4, 8]],
    ['right', 'pin-4', [0, -12, -56], [64, 4, 8]]
  ] as const) {
    const seat = motor.connectionPoints.find((point) => point.id === `${side}-bottom-native-y30-bore`)!;
    assert.ok(seat, `${side} source motor bore`);
    assert.ok(Math.hypot(...seat.localTransform.position.map((value, axis) => value - expectedLocal[axis])) < 0.001);
    const world = composeTransforms(motor.finalTransform, seat.localTransform).position;
    assert.ok(Math.hypot(...world.map((value, axis) => value - expectedWorld[axis])) < 0.001, `${side} motor pin is not seated`);
    const join = model.connections.find((entry) => entry.id === `front-${side}-motor-datum-pin`)!;
    assert.equal(join.a.partInstanceId, motor.id);
    assert.equal(join.b.partInstanceId, pin);
  }
  const ids = new Set(front.map((part) => part.id));
  const adjacency = new Map(front.map((part) => [part.id, [] as string[]]));
  for (const connection of model.connections) {
    const a = connection.a.partInstanceId, b = connection.b.partInstanceId;
    if (connection.type === 'electrical' || !ids.has(a) || !ids.has(b)) continue;
    adjacency.get(a)!.push(b); adjacency.get(b)!.push(a);
  }
  const visited = new Set<string>(['beam-1']), remaining = ['beam-1'];
  for (let index = 0; index < remaining.length; index++) for (const neighbor of adjacency.get(remaining[index]!)!) {
    if (!visited.has(neighbor)) { visited.add(neighbor); remaining.push(neighbor); }
  }
  assert.equal(visited.size, front.length, 'every authored Front unit must physically join the same source-rooted mechanism');
});

test('Book4 p17/p21 source-native brackets use63869 and60483, vertical shafts and independent round-hole rail seats', () => {
  // Independent source: Book4 PDF17/19/21. Native features:63869.dat:15–16,
  // 32184.dat:17–18/37–38 and s/60483s01.dat:16/20. No authored contact markers.
  const nativePoint = (id: string, xyz: Vec3): Vec3 => composeTransforms(parts.get(id)!.finalTransform, {
    position: [xyz[0] * 0.4, -xyz[1] * 0.4, -xyz[2] * 0.4], quaternion: [0, 0, 0, 1], scale: [1, 1, 1]
  }).position;
  const axis = (id: string, xyz: Vec3): Vec3 => {
    const origin = nativePoint(id, [0, 0, 0]), end = nativePoint(id, xyz);
    const delta = end.map((value, index) => value - origin[index]!) as Vec3;
    return delta.map((value) => value / Math.hypot(...delta)) as Vec3;
  };
  const contact = (a: string, ap: Vec3, aa: Vec3, b: string, bp: Vec3, ba: Vec3): void => {
    const left = nativePoint(a, ap), right = nativePoint(b, bp), u = axis(a, aa), v = axis(b, ba);
    assert.ok(Math.hypot(...left.map((value, index) => value - right[index]!)) < 1e-8, `${a}/${b}: native seat planes`);
    assert.ok(Math.abs(u.reduce((sum, value, index) => sum + value * v[index]!, 0)) > 1 - 1e-10, `${a}/${b}: native axes`);
  };
  assert.equal(parts.get('rear-rail-clip')!.geometryId, '49283', 'the actual p14 cable clip remains');
  for (const i of [1, 2]) {
    const block = `rear-mount-frame-${i}`, beam = `rear-mount-clip-${i}`, pin = `rear-azur-rail-pin-${i}`;
    assert.equal(parts.get(block)!.geometryId, '63869');
    assert.equal(parts.get(beam)!.geometryId, '60483');
    assert.equal(parts.get(block)!.sourceReference?.page, 17);
    assert.equal(parts.get(beam)!.sourceReference?.page, 17);
    for (const [j, y] of [-20, 20].entries()) {
      contact(`rear-white-${j === 0 ? 'upper' : 'lower'}-${i}`, [0, 0, 10], [0, 0, 1], `rear-housing-pin-${i}-${j + 1}`, [0, 0, 0], [1, 0, 0]);
      const shaft = `rear-yellow-shaft-${i}-${j + 1}`;
      contact(`rear-white-lower-${i}`, [-10, y, 0], [1, 0, 0], shaft, [-10, 0, 0], [1, 0, 0]);
      contact(`rear-white-upper-${i}`, [10, y, 0], [1, 0, 0], shaft, [10, 0, 0], [1, 0, 0]);
      assert.ok(Math.abs(axis(shaft, [1, 0, 0])[1]) > 1 - 1e-10, 'source yellow shaft stays vertical');
    }
    contact(block, [10, 0, 0], [1, 0, 0], `rear-yellow-shaft-${i}-${i === 1 ? 1 : 2}`, [-10, 0, 0], [1, 0, 0]);
    contact(beam, [0, 10, 0], [0, 1, 0], `rear-yellow-shaft-${i}-${i === 1 ? 2 : 1}`, [-10, 0, 0], [1, 0, 0]);
    contact(beam, [0, 10, 20], [0, 1, 0], pin, [-10, 0, 0], [1, 0, 0]);
    contact('rear-azur-rail-1', [0, -10, i === 1 ? -60 : 60], [0, 1, 0], pin, [-10, 0, 0], [1, 0, 0]);
    contact('rear-azur-rail-2', [0, 10, i === 1 ? -60 : 60], [0, 1, 0], pin, [10, 0, 0], [1, 0, 0]);
    assert.ok(!model.connections.some((edge) => edge.a.partInstanceId === `rear-white-upper-${i}` && edge.b.partInstanceId === pin), 'no fictional white-center rail mate');
  }
});

test('official physical assembly receiver ownership closes four native63869 bearings and their contacting6536 faces', () => {
  // LEGO lesson film photo51454837 at18s, not the authored connection markers.
  // Native sources:63869.dat:15–16,6536.dat and6558.dat axial primitives.
  const nativePoint = (id: string, xyz: Vec3): Vec3 => composeTransforms(parts.get(id)!.finalTransform, {
    position: [xyz[0] * 0.4, -xyz[1] * 0.4, -xyz[2] * 0.4], quaternion: [0, 0, 0, 1], scale: [1, 1, 1]
  }).position;
  const near = (a: Vec3, b: Vec3, label: string): void => {
    assert.ok(Math.hypot(...a.map((value, i) => value - b[i]!)) < 1e-8, label);
  };
  const axis = (id: string, xyz: Vec3): Vec3 => {
    const origin = nativePoint(id, [0, 0, 0]), end = nativePoint(id, xyz);
    const delta = end.map((value, i) => value - origin[i]!) as Vec3;
    return delta.map((value) => value / Math.hypot(...delta)) as Vec3;
  };
  for (const [side, index, sign, x] of [['left', 2, -1, -16], ['right', 1, 1, 80]] as const) {
    const receiver = `rear-mount-frame-${index}`;
    for (const [pinIndex, nativeX, y] of [[1, -20, 24], [2, 20, 8]] as const) {
      const pin = `${side}-frame-pin-${pinIndex}`, brace = `${side}-brace-cross-${pinIndex === 1 ? 2 : sign + 2}`;
      near(nativePoint(receiver, [nativeX, 20, 0]), [x, y, 160], `${receiver}: actual bore center`);
      near(nativePoint(pin, [20, 0, 0]), nativePoint(receiver, [nativeX, 20, 0]), `${pin}: second bearing`);
      near(nativePoint(pin, [0, 0, 0]), nativePoint(brace, [0, 20, 0]), `${pin}: first bearing`);
      // First and second free bearings occupy adjacent8mm layers.6536's
      // far face meets63869's near face atworldZ156; no unexplained air gap.
      const face = nativePoint(receiver, [nativeX, 20, index === 1 ? -10 : 10]);
      near(face, nativePoint(brace, [0, 20, -10]), `${pin}: contacting real faces`);
      near(face, nativePoint(pin, [10, 0, 0]), `${pin}: shaft enters second bearing`);
      const a = axis(pin, [1, 0, 0]), b = axis(receiver, [0, 0, 1]);
      assert.ok(Math.abs(a.reduce((sum, value, i) => sum + value * b[i]!, 0)) > 1 - 1e-10, `${pin}: coaxial`);
      const edge = model.connections.find((entry) => entry.a.partInstanceId === receiver && entry.b.partInstanceId === pin);
      assert.equal(edge?.installedByOperationId, 'assembly-join-rear', 'all four real joints installed during source9');
      assert.ok(!model.connections.some((entry) => entry.a.partInstanceId.startsWith('rear-white-') && entry.b.partInstanceId === pin), 'white bores are motor-occupied, not alternate side receivers');
    }
  }
  assert.deepEqual(model.steps.find((step) => step.id === 'book5-step9')!.warnings, []);
});

test('source-time replay seats motor pins at6, white receivers at19 and free gray receivers only during final assembly9', () => {
  const compiled = compileAssembly(model), frame = createFrame(compiled);
  const indices = new Map(model.parts.map((part, index) => [part.id, index]));
  const nativeAt = (id: string, xyz: Vec3): Vec3 => composeTransforms(readTransform(frame.transforms, indices.get(id)! * 10), {
    position: [xyz[0] * 0.4, -xyz[1] * 0.4, -xyz[2] * 0.4], quaternion: [0, 0, 0, 1], scale: [1, 1, 1]
  }).position;
  const equal = (a: Vec3, b: Vec3): void => assert.ok(Math.hypot(...a.map((value, i) => value - b[i]!)) < 1e-8);
  sampleAssembly(compiled, getStepTime(compiled, 'book4-step6')!.endMs, frame);
  for (const i of [1, 2]) {
    assert.equal(frame.installed[indices.get(`rear-mount-frame-${i}`)!], 0, 'future gray part cannot receive source6 pins');
    for (const [j, y] of [-20, 20].entries()) equal(
      nativeAt('rear-motor', [-30, y, i === 1 ? -20 : 140]),
      nativeAt(`rear-housing-pin-${i}-${j + 1}`, [0, 0, 0]));
    for (const name of ['upper', 'lower']) assert.equal(frame.installed[indices.get(`rear-white-${name}-${i}`)!], 0, 'white preparation is also introduced later, at16/18');
  }
  sampleAssembly(compiled, getStepTime(compiled, 'book4-step19')!.endMs, frame);
  for (const i of [1, 2]) for (const [j, name] of ['upper', 'lower'].entries()) {
    equal(nativeAt(`rear-white-${name}-${i}`, [0, 0, 10]), nativeAt(`rear-housing-pin-${i}-${j + 1}`, [0, 0, 0]));
    const edge = model.connections.find((entry) => entry.id === `rear-housing-white-cap-${i}-${j + 1}`)!;
    assert.ok(edge);
    assert.equal(model.operations.find((operation) => operation.id === edge.installedByOperationId)?.stepId, 'book4-step19');
    assert.ok(!model.connections.some((entry) => entry.a.partInstanceId === `rear-mount-frame-${i}` && entry.b.partInstanceId === `rear-housing-pin-${i}-${j + 1}`), 'no later gray-part marker can certify the wrong motor receiver');
  }
  sampleAssembly(compiled, getStepTime(compiled, 'book5-step9')!.endMs, frame);
  for (const [side, i] of [['left', 2], ['right', 1]] as const) for (const [j, x] of [[1, -20], [2, 20]] as const) {
    equal(nativeAt(`${side}-frame-pin-${j}`, [20, 0, 0]), nativeAt(`rear-mount-frame-${i}`, [x, 20, 0]));
  }
});
