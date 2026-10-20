import research from '../../../docs/research/data/hand-quality.json' with { type: 'json' };
import crosswalk from '../../../docs/research/data/lego-part-crosswalk.json' with { type: 'json' };
import props from '../../../static/models/simulation/manifest.json' with { type: 'json' };
import { composeTransforms, identityTransform, quaternionFromAxisAngle, quaternionMultiply, relativeTransform } from '../core/transforms.ts';
import { geometryAssetsFor, materials, sourceDocumentsFor } from '../geometry/library.ts';
import { evidence, mountPart, nativeLDrawTransform, placement } from './authoring.ts';
import type { AssemblyOperation, AssemblyStep, CameraPreset, Connection, GeometryAsset, Joint, NodeRef, PartInstance, Quaternion, RobotModel, SourceReference, Subassembly, Transform, Vec3 } from '../types/model.ts';

const manual = research.manuals.find((document) => document.id === 'hand')!;
const sourceBuild = research.builds['robotic-hand'];
const families = crosswalk.families.filter((family) => family.build === 'robotic-hand');
const I = identityTransform;
const at = (position: Vec3, quaternion: Quaternion = [0, 0, 0, 1]): Transform => ({ position, quaternion, scale: [1, 1, 1] });
const rotation = (axis: Vec3, angle: number) => quaternionFromAxisAngle(axis, angle);
const rx = (angle: number) => rotation([1, 0, 0], angle);
const ry = (angle: number) => rotation([0, 1, 0], angle);
const rz = (angle: number) => rotation([0, 0, 1], angle);
const sub = (id: string): NodeRef => ({ kind: 'subassembly', id });
const partNode = (id: string): NodeRef => ({ kind: 'part', id });
const pageSource = (page: number, instruction?: number): SourceReference => ({ documentId: 'hand', sourceUrl: `${manual.url}#page=${page}`, page, ...(instruction === undefined ? {} : { instructionId: String(instruction) }), figure: instruction === undefined ? page === 3 ? 'Battery preparation' : 'Port F wiring' : `Numbered step ${instruction}`, confidence: 0.95 });
const source = (step: number) => pageSource(step + 3, step);
const cad = (id: string): SourceReference => ({ documentId: `ldraw-${id}`, sourceUrl: `https://library.ldraw.org/library/official/parts/${id}.dat`, confidence: 0.95 });
const fit = (step: number, note: string, ids: string[] = []) => placement(evidence('documented', 'Source-selected component relationship; historical mold and independently registered fit remain unchecked.', [source(step)]), evidence('cad-derived', note, [source(step), ...ids.map(cad)], 0.8));
const display = evidence('app-authored', 'Original RoboBuild staging, camera, conservative operating range and demonstration timing, not manufacturer measurements or source-program calibration.', [], 1);
const presentation = placement(evidence('documented', 'The actual source modules are transferred without introducing duplicate inventory.', [source(28)]), display, true);
const camera: CameraPreset = { position: [220, 220, -250], target: [0, 12, 86], up: [0, 1, 0], projection: 'perspective', framing: 48, transitionMs: 650 };
const mechanismCamera: CameraPreset = { ...camera, position: [130, 170, -160], target: [0, 20, 0] };

// Stable source-native datums, in mm after N = Rx(pi) * 0.4. All registered fits are unchecked.
const motorPose = at([0, 0, 0], rx(Math.PI));
const hubPose = at([12, 0, 192], rz(Math.PI / 2));
const jawAngle = Math.PI + Math.atan2(4, 3);
const jawRotations = [ry(jawAngle), quaternionMultiply(ry(-jawAngle), rz(Math.PI))];
const pivotPositions: Vec3[] = [[-16, 24, 0], [16, 24, 0]];
const jawPoses = jawRotations.map((quaternion, index) => {
  const localPivot = nativeLDrawTransform([0, 0, 120]);
  const rotated = composeTransforms(at([0, 0, 0], quaternion), localPivot);
  return at(pivotPositions[index]!.map((value, axis) => value - rotated.position[axis]!) as Vec3, quaternion);
});
const jawFeature = (index: number, position: Vec3): Transform => composeTransforms(jawPoses[index]!, nativeLDrawTransform(position));
const whitePose = at([8, 16, 8], rz(Math.PI / 2));
const azurePose = at([0, 24, 0], ry(Math.PI));
const hPose = at([0, 32, 8], ry(Math.PI / 2));

const groups: { id: string; name: string; world: Transform; initial: Transform; parent?: string; children: string[] }[] = [];
function group(id: string, name: string, world: Transform, parent?: string): string {
  groups.push({ id, name, world, initial: parent ? relativeTransform(groups.find((entry) => entry.id === parent)!.world, world) : world, parent, children: [] });
  if (parent) groups.find((entry) => entry.id === parent)!.children.push(id);
  return id;
}
const root = group('hand-root', 'Robot Hand — one powered coupled mechanism', I());
const hubGroup = group('hand-hub', 'Prepared hub and four end pins', I());
const handleGroup = group('hand-handle', 'Two stacked frames and integral-pin bridge', at([-160, 0, 90]));
const gripperGroup = group('hand-gripper', 'Medium motor and coupled jaws', at([170, 0, 0]));
const whiteGroup = group('hand-white-link', 'White 16mm passive connecting link', at([0, 0, -170]));
const azureGroup = group('hand-crank', 'Azure 8mm keyed motor crank', groups.find((entry) => entry.id === whiteGroup)!.world, whiteGroup);
const jawGroups = [group('hand-jaw-1', 'First angled jaw', at([-180, 0, -180])), group('hand-jaw-2', 'Second angled jaw', at([180, 0, -180]))];
const tipGroups = [group('hand-tip-1', 'First separately built rim, tyre and jaw brick', at([-180, 0, -90])), group('hand-tip-2', 'Second separately built rim, tyre and jaw brick', at([180, 0, -90]))];
const hGroup = group('hand-h-coupler', 'Actual gray H-shaped passive coupling', groups.find((entry) => entry.id === gripperGroup)!.world, gripperGroup);
const groupById = Object.fromEntries(groups.map((entry) => [entry.id, entry]));
const initialChildren = Object.fromEntries(groups.map((entry) => [entry.id, [...entry.children]]));
const parts: PartInstance[] = [];
const operations: AssemblyOperation[] = [];
const installations: RobotModel['installations'] = [];
const connections: Connection[] = [];
const familyByPartId: Record<string, string> = {};
const parentByPart: Record<string, string> = {};
const introducedByStep: Record<number, string[]> = {};
const serials: Record<string, number> = {};

function add(family: string, step: number, owner: string, finalTransform: Transform, category: PartInstance['category'], axis?: Vec3, depthMm?: number): PartInstance {
  const selected = families.find((entry) => entry.localKey === family)!;
  if (!selected) throw new Error(`Unresolved hand family ${family}`);
  const serial = serials[family] = (serials[family] ?? 0) + 1;
  const id = `hand-${family}-${serial}`;
  const index = parts.length;
  const part: PartInstance = { id, name: `${selected.correctedName} · ${serial}`, geometryId: selected.geometryId, materialId: `ldraw-${selected.material.ldrawCode}`, finalTransform, initialTransform: at([-245 + index % 8 * 68, 0, 290 + Math.floor(index / 8) * 78]), connectionPoints: [], sourceReference: source(step), geometryConfidence: family === 'gray-double-pin-connector' ? 0.7 : 0.9, inventoryScope: 'robot', category, identityEvidence: evidence('diagram-derived', `${selected.correctedName}; contextual manual/crosswalk selection, not a printed or certified manufacturer part number.`, [source(step), cad(selected.geometryId)], 0.9), placementEvidence: fit(step, 'Native part origin retained. Named bore/shaft datums and source stack determine placement; independent manual-view and clearance validation remain outstanding.', [selected.geometryId]) };
  parts.push(part); familyByPartId[id] = family; parentByPart[id] = owner;
  (introducedByStep[step] ??= []).push(id);
  const target = composeTransforms(groupById[owner]!.world, finalTransform);
  const staged = { ...part, finalTransform: target };
  const previous = operations.filter((operation) => operation.stepId === `hand-step-${step}`);
  const operation = mountPart(staged, { stepId: `hand-step-${step}`, sourceReference: source(step), startMs: previous.length * 1000, durationMs: 1000, dependencies: [], ...(axis ? { axis, depthMm } : {}), cameraPreset: step >= 6 && step <= 27 ? mechanismCamera : camera });
  operation.parentChanges.push({ node: partNode(id), fromParent: null, toParent: sub(owner), fromLocalTransform: target, toLocalTransform: finalTransform });
  operations.push(operation);
  installations.push({ partInstanceId: id, stepId: operation.stepId, operationId: operation.id, atMs: operation.startMs + operation.durationMs });
  return part;
}
function descendants(id: string): string[] { return [id, ...groupById[id]!.children.flatMap(descendants)]; }
function join(id: string, receiver: string, step: number): void {
  const moving = groupById[id]!, target = groupById[receiver]!.world;
  const ownGroups = descendants(id), participants = parts.filter((part) => ownGroups.includes(parentByPart[part.id]!));
  const before = moving.world;
  const after: Transform = target;
  const opId = `hand-join-${id}`;
  const fromTransforms = participants.map((part) => composeTransforms(before, part.finalTransform));
  const toTransforms = participants.map((part) => composeTransforms(after, part.finalTransform));
  operations.push({ id: opId, stepId: `hand-step-${step}`, operationType: 'merge-subassemblies', partInstanceIds: participants.map((part) => part.id), fromTransforms, toTransforms, startMs: 0, durationMs: 2000, easing: 'smoothstep', dependencies: [], sourceReference: source(step), cameraPreset: step === 28 || step === 4 ? camera : mechanismCamera, stages: [{ id: `${opId}-transfer`, startMs: 0, durationMs: 2000, phase: 'transfer', nodes: [sub(id)], fromTransforms: [before], toTransforms: [after], trajectory: { type: 'linear' }, easing: 'smoothstep', evidence: presentation }], parentChanges: [{ node: sub(id), fromParent: moving.parent ? sub(moving.parent) : null, toParent: sub(receiver), fromLocalTransform: after, toLocalTransform: I() }], evidence: fit(step, 'Rigid transfer of the previously built module; each prepared instance retains its own identity and local native registration.') });
  moving.parent = receiver;
  groupById[receiver]!.children.push(id);
  // Initial hierarchy is separate from the chronological final hierarchy.
  for (const child of ownGroups) groupById[child]!.world = target;
}

const hub = add('hub', 1, hubGroup, hubPose, 'controller');
const hubPins: PartInstance[] = [];
for (const x of [-40, 40]) for (const y of [-10, -50]) {
  const seat = composeTransforms(hubPose, nativeLDrawTransform([x, y, 110]));
  hubPins.push(add('black-pin', 1, hubGroup, at(seat.position, ry(Math.PI / 2)), 'connector', [0, 0, 1], 8));
}
const frame1 = add('magenta-frame', 2, handleGroup, at([-8, 0, 104], rz(Math.PI / 2)), 'structure');
const bridge = add('gray-double-pin-connector', 2, handleGroup, at([0, 24, 104], quaternionMultiply(rz(Math.PI / 2), rx(-Math.PI / 2))), 'connector', [1, 0, 0], 8);
const frame2 = add('magenta-frame', 3, handleGroup, at([8, 0, 104], rz(Math.PI / 2)), 'structure', [1, 0, 0], 8);
join(handleGroup, hubGroup, 4);
const handlePins = [-8, 8].map((x) => add('black-pin', 5, handleGroup, at([x, 0, 60], ry(Math.PI / 2)), 'connector', [0, 0, 1], 8));
const motor = add('medium-motor', 6, gripperGroup, motorPose, 'motor');
const bodyPins = [-8, 8].map((x) => add('black-pin', 6, gripperGroup, at([x, 12, 0], rz(Math.PI / 2)), 'connector', [0, -1, 0], 8));
const motorAxle = add('yellow-axle-3', 6, gripperGroup, at([0, 16, 0], rz(Math.PI / 2)), 'connector', [0, -1, 0], 8);
const axleTarget = composeTransforms(groupById[gripperGroup]!.world, motorAxle.finalTransform);
const groundBeam = add('magenta-beam-5', 7, gripperGroup, at([0, 16, 0], ry(Math.PI / 2)), 'structure', [0, -1, 0], 8);
const jawPins = [-16, 16].map((x) => add('black-pin', 7, gripperGroup, at([x, 20, 0], rz(Math.PI / 2)), 'connector', [0, -1, 0], 8));
const white = add('white-short-link', 8, whiteGroup, whitePose, 'structure');
const crankPin = add('tan-axle-pin', 8, whiteGroup, at([0, 20, 8], rz(-Math.PI / 2)), 'connector', [0, -1, 0], 8);
const azure = add('azure-short-connector', 9, azureGroup, azurePose, 'structure', [0, -1, 0], 8);
join(whiteGroup, gripperGroup, 10);
// The keyed central axle is reparented only once its real azure crank is seated.
const whiteJoin = operations[operations.length - 1]!;
whiteJoin.partInstanceIds.push(motorAxle.id);
whiteJoin.fromTransforms.push(axleTarget); whiteJoin.toTransforms.push(axleTarget);
whiteJoin.parentChanges.push({ node: partNode(motorAxle.id), fromParent: sub(gripperGroup), toParent: sub(azureGroup), fromLocalTransform: motorAxle.finalTransform, toLocalTransform: motorAxle.finalTransform });
parentByPart[motorAxle.id] = azureGroup;
const rims: PartInstance[] = [], tyres: PartInstance[] = [], bricks: PartInstance[] = [], jaws: PartInstance[] = [], jawAxles: PartInstance[] = [], tiles: PartInstance[] = [];
for (let index = 0; index < 2; index++) {
  const first = index === 0;
  const base = first ? 11 : 19;
  const wheelPoint = jawFeature(index, [0, 0, 40]).position;
  const frontPoint = jawFeature(index, [0, 0, 0]).position;
  const rimPose = at([wheelPoint[0], 16, wheelPoint[2]], rx(Math.PI / 2));
  rims.push(add('small-wheel', base, tipGroups[index]!, rimPose, 'wheel'));
  tyres.push(add('small-tire', base, tipGroups[index]!, rimPose, 'wheel', [0, -1, 0], 7.2));
  jawAxles.push(add('yellow-axle-3', base + 1, tipGroups[index]!, at([wheelPoint[0], 28, wheelPoint[2]], rz(Math.PI / 2)), 'connector', [0, -1, 0], 8));
  const center = jawFeature(index, [0, 0, 20]).position;
  // Brick's outer vertical axle holes ±20 LDU coincide with jaw holes z0/z40.
  const brickYaw = first ? jawAngle + Math.PI / 2 : -jawAngle - Math.PI / 2;
  bricks.push(add('magenta-technic-brick', base + 2, tipGroups[index]!, at([center[0], 37.6, center[2]], ry(brickYaw)), 'structure', [0, -1, 0], 9.6));
  jaws.push(add('black-angled-beam', base + 3, jawGroups[index]!, jawPoses[index]!, 'structure'));
  jawAxles.push(add('yellow-axle-3', base + 3, jawGroups[index]!, at([frontPoint[0], 28, frontPoint[2]], rz(Math.PI / 2)), 'connector', [0, -1, 0], 8));
  join(tipGroups[index]!, jawGroups[index]!, base + 4);
  for (const point of [frontPoint, wheelPoint]) tiles.push(add('black-round-grip', base + 5, jawGroups[index]!, at([point[0], 40.8, point[2]]), 'structure', [0, -1, 0], 3.2));
  if (first) {
    const point = jawFeature(0, [32, 0, 144]).position;
    add('tan-axle-pin', 17, jawGroups[0]!, at([point[0], 28, point[2]], rz(-Math.PI / 2)), 'connector', [0, 1, 0], 8);
  }
  join(jawGroups[index]!, gripperGroup, first ? 18 : 25);
}
const retainingPin = add('long-black-pin', 26, jawGroups[1]!, at([16, 24, 8], rz(-Math.PI / 2)), 'connector', [0, -1, 0], 16);
const h = add('gray-h-link', 27, hGroup, hPose, 'structure', [0, -1, 0], 8);
join(gripperGroup, hubGroup, 28);
// Root attachment is structural and stationary; the hand remains one handheld assembly.
const attachHub = operations.find((operation) => operation.stepId === 'hand-step-1' && operation.partInstanceIds[0] === hub.id)!;
attachHub.parentChanges.unshift({ node: sub(hubGroup), fromParent: null, toParent: sub(root), fromLocalTransform: I(), toLocalTransform: I() });

const nativeAxes: Record<string, 'x' | 'y' | 'z'> = { '4519': 'x', '2780': 'x', '3749': 'x', '18651': 'x', '32184': 'x', '56903': 'z', '61254': 'z', '48989': 'z', '45601c01': 'z' };
const pointTypes: Record<string, PartInstance['connectionPoints'][number]['type']> = { '4519': 'axle', '2780': 'pin', '48989': 'pin', '56903': 'axle-hole', '32184': 'axle-hole', '39789': 'axle-hole', '61254': 'surface' };
function mate(id: string, a: PartInstance, aNative: Vec3, b: PartInstance, bNative: Vec3, type: Connection['type'], step: number, aAxis = nativeAxes[a.geometryId] ?? 'y', bAxis = nativeAxes[b.geometryId] ?? 'y'): void {
  const checked = fit(step, 'Actual DAT-local bore/shaft frame, with source-selected hole index. Numerical origin/axes are CAD-derived; source correspondence and clearance are independently unchecked.', [a.geometryId, b.geometryId]);
  const ap = `${id}-a`, bp = `${id}-b`;
  for (const [part, position, pointId, axis] of [[a, aNative, ap, aAxis], [b, bNative, bp, bAxis]] as const) {
    let pointType = pointTypes[part.geometryId] ?? 'hole';
    if (part.geometryId === '3749') pointType = position[0] >= 0 ? 'axle' : 'pin';
    if (part.geometryId === '18651') pointType = position[0] > -10 ? 'axle' : 'pin';
    if (part.geometryId === '60483') pointType = position[2] === 0 ? 'axle-hole' : 'hole';
    if (part.geometryId === '32271' && (position[2] === 0 || position[2] === 144)) pointType = 'axle-hole';
    part.connectionPoints.push({ id: pointId, type: pointType, localTransform: nativeLDrawTransform(position, axis === 'x' ? ry(Math.PI / 2) : axis === 'y' ? rx(-Math.PI / 2) : [0, 0, 0, 1]), evidence: checked });
  }
  const op = operations.filter((operation) => operation.stepId === `hand-step-${step}` && (operation.partInstanceIds.includes(a.id) || operation.partInstanceIds.includes(b.id))).at(-1)!;
  connections.push({ id, a: { partInstanceId: a.id, connectionPointId: ap }, b: { partInstanceId: b.id, connectionPointId: bp }, type, installedByOperationId: op.id, evidence: checked });
}
for (let index = 0; index < 2; index++) {
  mate(`hand-body-pin-${index}`, motor, [index ? 20 : -20, 30, 0], bodyPins[index]!, [0, 0, 0], 'fixed', 6);
  mate(`hand-body-ground-${index}`, groundBeam, [0, 0, index ? -20 : 20], bodyPins[index]!, [10, 0, 0], 'fixed', 7);
  mate(`hand-ground-pin-${index}`, groundBeam, [0, 0, index ? -40 : 40], jawPins[index]!, [-10, 0, 0], 'fixed', 7);
  mate(`hand-jaw-ground-${index}`, jaws[index]!, [0, 0, 120], jawPins[index]!, [10, 0, 0], 'pivot', index ? 25 : 18);
  mate(`hand-wheel-tyre-${index}`, rims[index]!, [0, 0, 0], tyres[index]!, [0, 0, 0], 'fixed', index ? 19 : 11);
  mate(`hand-wheel-axle-${index}`, rims[index]!, [0, 0, 0], jawAxles[index * 2]!, [-30, 0, 0], 'fixed', index ? 20 : 12);
  mate(`hand-brick-hole-${index}`, bricks[index]!, [index ? -20 : 20, 0, 0], jawAxles[index * 2]!, [24, 0, 0], 'fixed', index ? 21 : 13);
  mate(`hand-front-jaw-axle-${index}`, jaws[index]!, [0, 0, 0], jawAxles[index * 2 + 1]!, [-10, 0, 0], 'fixed', index ? 22 : 14);
  mate(`hand-front-brick-axle-${index}`, bricks[index]!, [index ? 20 : -20, 0, 0], jawAxles[index * 2 + 1]!, [24, 0, 0], 'fixed', index ? 23 : 15);
  for (let end = 0; end < 2; end++) mate(`hand-tile-stud-${index}-${end}`, bricks[index]!, [(index ? 1 : -1) * (end ? -20 : 20), 0, 0], tiles[index * 2 + end]!, [0, 8, 0], 'fixed', index ? 24 : 16);
}
mate('hand-keyed-drive', azure, [0, 0, 0], motorAxle, [20, 0, 0], 'fixed', 10);
mate('hand-white-crank-pivot', azure, [0, 0, 20], crankPin, [-10, 0, 0], 'pivot', 10);
mate('hand-white-retainer', white, [0, 20, 0], retainingPin, [20, 0, 0], 'pivot', 26);
mate('hand-h-retainer', h, [0, 0, -40], retainingPin, [-20, 0, 0], 'pivot', 27);
mate('hand-frame-bridge-1', frame1, [60, 0, 20], bridge, [0, -20, -20], 'fixed', 2);
mate('hand-frame-bridge-2', frame2, [60, 0, 20], bridge, [0, -20, 20], 'fixed', 3);
for (let index = 0; index < hubPins.length; index++) mate(`hand-hub-end-${index}`, hub, [[-40, -10, 110], [-40, -50, 110], [40, -10, 110], [40, -50, 110]][index] as Vec3, hubPins[index]!, [0, 0, 0], 'fixed', 1);
for (let index = 0; index < hubPins.length; index++) mate(`hand-handle-hub-${index}`, index % 2 ? frame1 : frame2, [index < 2 ? -40 : 40, 0, -100], hubPins[index]!, [10, 0, 0], 'fixed', 4, 'z');
for (let index = 0; index < handlePins.length; index++) {
  mate(`hand-motor-handle-${index}`, motor, [index ? 20 : -20, 0, 150], handlePins[index]!, [0, 0, 0], 'fixed', 28, 'z');
  mate(`hand-handle-end-pin-${index}`, index ? frame2 : frame1, [0, 0, 100], handlePins[index]!, [-10, 0, 0], 'fixed', 5, 'z');
}
mate('hand-central-output-axle', motor, [0, 30, 0], motorAxle, [-10, 0, 0], 'pivot', 6);
mate('hand-white-tan-axle', white, [0, -20, 0], crankPin, [10, 0, 0], 'fixed', 8);
mate('hand-driven-retainer-bore', jaws[1]!, [16, 0, 132], retainingPin, [0, 0, 0], 'pivot', 26);
const oppositeRearPin = parts.find((part) => part.id === 'hand-tan-axle-pin-2')!;
mate('hand-opposite-rear-axle', jaws[0]!, [32, 0, 144], oppositeRearPin, [10, 0, 0], 'fixed', 17);
mate('hand-H-opposite-pin', h, [-20, 0, 40], oppositeRearPin, [-10, 0, 0], 'pivot', 27);

const electrical = fit(28, 'Source p32 connects the captive medium-motor lead to Hub F. Native cable exit and hub port coordinates are nominal; spline and cable length are not certified.', ['54696p01', '45601c01']);
motor.connectionPoints.push({ id: 'hand-motor-lead', type: 'electrical', localTransform: nativeLDrawTransform([0, 0, 143]), evidence: electrical });
hub.connectionPoints.push({ id: 'hand-hub-F', type: 'electrical', localTransform: nativeLDrawTransform([70, -68, -40]), evidence: electrical });
const wiringId = 'hand-connect-F';
operations.push({ id: wiringId, stepId: 'hand-wiring', operationType: 'connect', partInstanceIds: [motor.id, hub.id], fromTransforms: [motorPose, hubPose], toTransforms: [motorPose, hubPose], durationMs: 1600, startMs: 0, easing: 'smoothstep', dependencies: ['hand-join-hand-gripper'], stages: [], parentChanges: [], sourceReference: pageSource(32), cameraPreset: camera, evidence: electrical });
connections.push({ id: 'hand-port-F', a: { partInstanceId: motor.id, connectionPointId: 'hand-motor-lead' }, b: { partInstanceId: hub.id, connectionPointId: 'hand-hub-F' }, type: 'electrical', installedByOperationId: wiringId, evidence: electrical });
const steps: AssemblyStep[] = sourceBuild.steps.map((entry) => {
  const own = operations.filter((operation) => operation.stepId === `hand-step-${entry.step}`);
  return { id: `hand-step-${entry.step}`, title: `Step ${entry.step} — ${entry.action}`, description: entry.action + (entry.step === 6 ? ' Align the motor marks as shown in the inset; do not treat the fixed magenta 5L beam as the motor crank.' : entry.step === 28 ? ' The source turn is presented by camera; move the real completed gripper module to the existing handle. Prepared hub includes the battery from p3, not an extra counted part.' : ''), kind: 'numbered-instruction', action: Object.keys(entry.add).length ? 'assembly' : 'reuse', sourceReferences: [source(entry.step)], operationIds: own.map((operation) => operation.id), requiredPartInstanceIds: introducedByStep[entry.step] ?? [], warnings: ['Native source-selected registrations are independently unchecked, not verified exact fit.', ...(entry.step === 1 ? ['Battery preparation p3 is included in the prepared hub, not a separately tracked callout.'] : [])], durationMs: Math.max(...own.map((operation) => operation.startMs + operation.durationMs)), cameraPreset: entry.step >= 6 && entry.step <= 27 ? mechanismCamera : camera };
});
steps.push({ id: 'hand-wiring', title: 'Source p32 — connect medium motor to F', description: 'Connect the actual captive motor lead to Hub F. No extra cable, plug, battery, Force Sensor or loose scoring bricks are added to the 39-unit robot inventory.', kind: 'unnumbered-preparation', action: 'wiring', sourceReferences: [pageSource(32)], operationIds: [wiringId], requiredPartInstanceIds: [], warnings: ['Flexible lead routing/length is not measured; electrical topology alone is documented.'], durationMs: 1600, cameraPreset: camera });
for (let index = 0; index < steps.length; index++) {
  const own = operations.filter((operation) => operation.stepId === steps[index]!.id);
  for (let operationIndex = 0; operationIndex < own.length; operationIndex++) {
    own[operationIndex]!.dependencies = operationIndex ? [own[operationIndex - 1]!.id] : index ? [...steps[index - 1]!.operationIds] : [];
  }
}

const mechanismEvidence = fit(27, 'Native 60483 axle/round pitch8mm; 32184 axle centers16mm; 32271 ground pivot(0,0,120), midpoint(16,0,132), terminal(32,0,144). H14720 connects crossbar(-20,0,40) to(0,0,-40), span sqrt(32²+8²)mm. Axial projection onto Y24 is along real shaft axes, not a new physical link. Source-selected indices/rest branch need independent comparison.', ['60483', '32184', '32271', '14720']);
const joint = (id: string, name: string, parent: string, child: string, pivot: Vec3, childRest = I()): Joint => ({ id, name, type: 'revolute', parent: sub(parent), child: sub(child), origin: at(pivot), childTransform: relativeTransform(at(pivot), childRest), axis: [0, 1, 0], zero: 0, evidence: mechanismEvidence });
const joints: Joint[] = [
  { ...joint('hand-F-drive', 'F · actual keyed azure motor crank', gripperGroup, azureGroup, [0, 24, 0]), drivenByMotorId: 'hand-motor-F', internalBinding: { partInstanceId: motor.id, geometryNodeId: 'parts/u9363p01.dat', movingSide: 'rotor' }, limits: { min: 0, max: 2.4, basis: 'modeled', evidence: display }, maxSpeed: { value: 2, basis: 'modeled', evidence: display } },
  joint('hand-jaw-2-pivot', 'Passive driven-side jaw', gripperGroup, jawGroups[1]!, [16, 24, 0]),
  joint('hand-white-pivot', 'White coupler pivots on azure crank pin', azureGroup, whiteGroup, [0, 24, 8]),
  joint('hand-jaw-1-pivot', 'Passive opposite jaw', gripperGroup, jawGroups[0]!, [-16, 24, 0]),
  joint('hand-H-pivot', 'H coupler pivots on long retainer', jawGroups[1]!, hGroup, [16, 24, 8])
];
const anchor = (id: string, point: Vec3) => ({ node: sub(id), point });
const projectedJaw = (index: number, native: Vec3): Vec3 => { const point = jawFeature(index, native).position; return [point[0], 24, point[2]]; };
const distance = (a: Vec3, b: Vec3) => Math.hypot(...a.map((value, index) => value - b[index]!) as Vec3);
const linkageConstraints: RobotModel['linkageConstraints'] = [
  { id: 'hand-drive-fourbar', type: 'planar-closed-loop', driverJointId: 'hand-F-drive', dependentJointIds: ['hand-jaw-2-pivot', 'hand-white-pivot'], planeNormal: [0, 1, 0], links: [
    { a: anchor(azureGroup, [0, 24, 8]), b: anchor(jawGroups[1]!, [16, 24, 8]), lengthMm: 16 },
    { a: anchor(whiteGroup, [16, 24, 8]), b: anchor(jawGroups[1]!, projectedJaw(1, [0, 0, 100])), lengthMm: Math.sqrt(16 * 16 + 32 * 32) * 0.4 }
  ], referenceJointValues: [0, 0, 0], branch: 'reference-continuous', toleranceMm: 1e-6, evidence: mechanismEvidence },
  { id: 'hand-bilateral-H-loop', type: 'planar-closed-loop', driverJointId: 'hand-F-drive', dependentJointIds: ['hand-jaw-1-pivot', 'hand-H-pivot'], planeNormal: [0, 1, 0], links: [
    { a: anchor(jawGroups[0]!, [-16, 24, 16]), b: anchor(jawGroups[1]!, [16, 24, 8]), lengthMm: Math.hypot(32, 8) },
    { a: anchor(hGroup, [-16, 24, 16]), b: anchor(jawGroups[0]!, projectedJaw(0, [0, 0, 100])), lengthMm: Math.hypot(32, 44) * 0.4 }
  ], referenceJointValues: [0, 0, 0], branch: 'reference-continuous', toleranceMm: 1e-6, evidence: mechanismEvidence }
];

// Static authoring registration of the demo contacts; runtime motion is exclusively the shared nonlinear solver.
function closedGeometry(q: number) {
  const bx = 32 + 8 * Math.sin(q), bz = 8 * Math.cos(q);
  const passive = Math.asin((bx * bx + bz * bz - 832) / (32 * Math.hypot(bx, bz))) - Math.atan2(bz, bx);
  const left: Vec3 = [-16 - 25.6 * Math.cos(passive) - 19.2 * Math.sin(passive), 16, 25.6 * Math.sin(passive) - 19.2 * Math.cos(passive)];
  const right: Vec3 = [16 + 25.6 * Math.cos(q) - 19.2 * Math.sin(q), 16, -25.6 * Math.sin(q) - 19.2 * Math.cos(q)];
  return { passive, left, right };
}
const contactRadius = 9.2; // 61254's native23-LDU outer-band edge, not a certified tyre radius.
let lower = 2.2, upper = 2.4;
for (let index = 0; index < 48; index++) { const q = (lower + upper) / 2, p = closedGeometry(q); if (distance(p.left, p.right) > 16 + 2 * contactRadius) lower = q; else upper = q; }
const closeAngle = (lower + upper) / 2;
const closed = closedGeometry(closeAngle);
const direction = closed.right.map((value, index) => (value - closed.left[index]!) / (16 + 2 * contactRadius)) as Vec3;
const blockPose = at([(closed.left[0] + closed.right[0]) / 2, 19.6, (closed.left[2] + closed.right[2]) / 2], ry(Math.atan2(-direction[2], direction[0])));
const gripEvidence = evidence('app-authored', 'RoboBuild extension: original 16×20×32mm GLB demo block, two nominal 61254 outer-band contact anchors (23LDU radius, native axial edge9LDU), conservative modeled motor excursion. No manufacturer grip force, safe stall limit, collision certification or six-brick composition asserted.', [cad('61254')], 0.8);
const contacts = tyres.map((tyre, index) => {
  const q = index ? closeAngle : closed.passive, pivot = pivotPositions[index]!;
  const closedTyre = composeTransforms(at(pivot), composeTransforms(at([0, 0, 0], ry(q)), relativeTransform(at(pivot), tyre.finalTransform)));
  const center = index ? closed.right : closed.left;
  const point: Vec3 = [center[0] + direction[0] * contactRadius * (index ? -1 : 1), 19.6, center[2] + direction[2] * contactRadius * (index ? -1 : 1)];
  return { holder: partNode(tyre.id), holderPoint: relativeTransform(closedTyre, at(point)).position, objectPoint: [index ? 8 : -8, 0, 0] as Vec3 };
});
const capture = { contacts, maxGapMm: 0.001, poseToleranceMm: 0.001, angleToleranceRad: 0.001, evidence: gripEvidence };
const liftPose = at([0, 50, 0]);
const scenario: RobotModel['scenarios'][number] = {
  id: 'hand-grip-hold-release-extension', title: 'RoboBuild extension — coupled grip, hold and release', description: 'One real F-powered crank and two solved passive jaws grip the original RoboBuild block, hold it while a scripted human-hand lift moves the actual whole robot, then release continuously and reopen. Lesson Building Tips says left/right buttons; supplied solution SVG instead uses left press/release (startup F clockwise0.2s, press −100% power, release clockwise0.2s). This position-calibrated demonstration does NOT claim to reproduce those uncalibrated power/time endpoints.', fidelity: 'deterministic-kinematics', durationMs: 9000,
  motorCommands: [
    { motorId: 'hand-motor-F', startMs: 500, durationMs: 2500, mode: 'position', from: 0, to: closeAngle, unit: 'rad', easing: 'smoothstep', evidence: display },
    { motorId: 'hand-motor-F', startMs: 6000, durationMs: 2500, mode: 'position', from: closeAngle, to: 0, unit: 'rad', easing: 'smoothstep', evidence: display }
  ], sensorSignals: [], objectEvents: [
    { timeMs: 3000, objectSubassemblyId: 'hand-demo-block', action: 'attach', parent: sub(root), transform: blockPose, capture, evidence: gripEvidence },
    { timeMs: 6000, objectSubassemblyId: 'hand-demo-block', action: 'release', parent: null, transform: composeTransforms(liftPose, blockPose), capture, evidence: gripEvidence }
  ], rootMotion: [
    { node: sub(root), timeMs: 0, transform: I(), evidence: display }, { node: sub(root), timeMs: 3000, transform: I(), evidence: display },
    { node: sub(root), timeMs: 4500, transform: liftPose, evidence: display }, { node: sub(root), timeMs: 9000, transform: liftPose, evidence: display }
  ], limitations: ['RoboBuild extension, not the official time/power program; prose left/right and SVG left press/release remain distinct.', 'Source-selected pivot indices, H crossbar correspondence and fitted rest branch require independent geometry/manual comparison.', 'Only modeled range/rate; physical travel, compliance, collision clearance, force and payload are unknown. Two nominal tyre-band contacts are not certified soft-body physics.', 'No Force Sensor or six unsourced scoring bricks. Original prop is outside all39 source callouts.'], sourceReferences: [pageSource(32), { documentId: 'hand-solution', sourceUrl: 'https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltc6b07403d9294da2/6399c2a031c74c1cc74f9795/spike_extra_resources_pass_the_brick_step04-hint_en.svg?locale=en-us', figure: 'Startup / left press / left release', confidence: 0.95 }]
};
const geometryAssets = geometryAssetsFor(parts.map((part) => part.geometryId));
const rawPropAsset = props.assets.find((asset) => asset.id === 'robobuild-demo-block')!;
const rawPropPose = rawPropAsset.nativeToScene;
const propAsset: GeometryAsset = {
  ...rawPropAsset, format: 'glb', nativeUnits: 'm', preserveOrigin: true,
  nativeToScene: { position: [rawPropPose.position[0]!, rawPropPose.position[1]!, rawPropPose.position[2]!], quaternion: [rawPropPose.quaternion[0]!, rawPropPose.quaternion[1]!, rawPropPose.quaternion[2]!, rawPropPose.quaternion[3]!], scale: [rawPropPose.scale[0]!, rawPropPose.scale[1]!, rawPropPose.scale[2]!] },
  materialSlots: rawPropAsset.materialSlots.map((slot) => ({ ...slot, colorMode: 'fixed' as const }))
};
const propMaterial = props.materials.find((material) => material.id === 'robobuild-demo-foam')!;
// Only initial parentage is declared here. Module joins and part installation record later epochs.
const subassemblies: Subassembly[] = groups.map((entry) => ({ id: entry.id, name: entry.name, ...(entry.id === azureGroup ? { parentId: whiteGroup } : entry.id === hGroup ? { parentId: gripperGroup } : {}), localTransform: entry.initial, partInstanceIds: [], childSubassemblyIds: initialChildren[entry.id]!, evidence: mechanismEvidence }));
export const roboticHandSourceFamilies = familyByPartId;
export const roboticHand: RobotModel = {
  schemaVersion: 1, id: 'robotic-hand', name: 'Robot Hand', manufacturer: 'LEGO Education', edition: 'Pass the Brick — 2019 export', category: 'Coupled gripper', complexity: 'Intermediate', description: 'Complete28-numbered-step /39-prepared-unit source reconstruction with one F-powered coupled linkage. Native registrations and browser comparison remain independently unchecked; the separate original-block grip/hold/release demonstration is a RoboBuild extension.',
  sourceDocuments: [{ id: 'hand', title: manual.title, sourceUrl: manual.url, edition: '2019-08-13 PDF export; no printed revision', sha256: manual.sha256, pageCount: manual.pages, redistribution: 'link-only' }, { id: 'hand-solution', title: 'Pass the Brick — supplied possible-solution SVG', sourceUrl: scenario.sourceReferences[1]!.sourceUrl, edition: 'Linked SVG inspected2026-10-20; distinct from lesson prose', sha256: '8538d55e0e2973749b709a2e111eef51136aba258c4a5fdab597d4974b0abcb5', redistribution: 'link-only' }, ...sourceDocumentsFor(geometryAssets, materials)],
  parts, geometryAssets: [...geometryAssets, propAsset], materials: [...materials, propMaterial] as RobotModel['materials'], steps, operations, installations, visibility: [], subassemblies, connections, joints, linkageConstraints,
  motors: [{ id: 'hand-motor-F', partInstanceId: motor.id, port: 'F', jointId: 'hand-F-drive', assignmentEvidence: evidence('documented', 'One medium motor, captive lead to Hub F on p32; no independently commanded fingers.', [pageSource(32)]) }],
  cables: [{ id: 'hand-captive-F-lead', devicePartInstanceId: motor.id, captive: true, fromConnection: 'hand-port-F', toConnection: 'hand-port-F', controlPoints: [], routeEvidence: evidence('unknown', 'One electrical edge names both endpoints. Electrical topology is documented; flexible route, length and dynamic cable shape have not been reconstructed. No invented cable spline or separate inventory unit.', [pageSource(32)], 0) }],
  inventory: sourceBuild.bom.map((row) => ({ id: `hand-inventory-${row.part}`, name: families.find((family) => family.localKey === row.part)!.correctedName, scope: 'robot', basis: 'prepared-callout-units', accounting: 'tracked', quantity: row.quantity, partInstanceIds: parts.filter((part) => familyByPartId[part.id] === row.part).map((part) => part.id), sourceReferences: row.pages.map((page) => pageSource(page, page - 3)), ...(row.part === 'gray-double-pin-connector' ? { discrepancy: '48989 circular-center mold provisional versus65489; one prepared integral-pin unit, not five separate pieces.' } : {}) })),
  milestones: [{ id: 'hand-handle-seated', title: 'Handle joined without recounting', stepId: 'hand-step-4' }, { id: 'hand-jaws-coupled', title: 'Both actual jaws and H coupling fitted', stepId: 'hand-step-27' }, { id: 'hand-complete-source-sequence', title: 'Source assembly and F wiring authored; fits unchecked', stepId: 'hand-wiring' }],
  sourceMappings: [{ source: pageSource(3), stepId: 'hand-step-1' }, ...operations.map((operation) => ({ source: operation.sourceReference!, stepId: operation.stepId, operationId: operation.id }))], scenarios: [scenario], simulationObjects: [{ id: 'hand-demo-block', name: 'RoboBuild original demonstration block — outside source BOM', geometryId: propAsset.id, materialId: propMaterial.id, initialTransform: blockPose, evidence: gripEvidence }],
  coverage: { documentedSteps: 28, implementedSteps: 28, verifiedSteps: 0, modeledComponents: 39, verifiedComponents: 0, geometryConfidence: 0.85, dimensions: { inventory: { status: 'partial', verified: 0, total: 39, note: '39 individual prepared-unit identities reconcile to published numbered-step callout family rows; independent automated gate not yet exercised.' }, geometry: { status: 'partial', verified: 0, total: 39, note: 'Genuine licensed LDraw roots and separate56903/61254 units; source selection/mold and independent view checks pending.' }, placement: { status: 'partial', verified: 0, total: 39, note: 'Native bore/shaft origins retained; all source registrations explicitly unchecked, particularly frame bridge and H crossbar indices.' }, kinematics: { status: 'partial', verified: 0, total: 1, note: 'One actual powered azure crank; two nonlinear passive closure systems on the real assembled hierarchy. Parent must exercise branch/residual/native alignment tests.' }, simulation: { status: 'partial', verified: 0, total: 1, note: 'Separate original GLB block; two actual tyre contact anchors, continuous grip/hold/release extension authored, not independently validated.' } }, outstandingDeviations: ['All new placements require independent parent manual/CAD/browser comparison; no automatically verified fit claims.', 'Frame bridge48989 historical mold and selected mounting frames remain provisional; source-selected H hole indices/rest branch need independent comparison.', 'Physical jaw endpoints, force, motor-power calibration, compliant contact and full collision clearance are unknown; limits are modeled only.', 'Battery is prepared inside hub; six lesson scoring-brick types are unknown and excluded; no invented Force Sensor.', 'Lesson prose left/right buttons differs from linked SVG left press/release; the calibrated position demo is explicitly a RoboBuild extension.', 'Captive lead electrical topology is documented but flexible route/length is not reconstructed.'] }
};
