import research from '../../../docs/research/data/hand-quality.json' with { type: 'json' };
const sourceCache = {
  'quality-main.svg': { url: 'https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt441de26b5a4d2a97/633b2e41a425ab7d963723b6/spike_kickstart_your_business_place-your-order_step03-program_en-us.svg?locale=en-us', sha256: 'b5ec1619edd4a0a616fdcdf6fff937f19fef243f183e6ede1d82ab8019293a59' },
  'quality-solution.svg': { url: 'https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltebd4ff3bea14f6cf/63502a67dcbfe55a60fa3cb8/spike_kickstart_your_business_place-your-order_step04-hint_en.svg?locale=en-us', sha256: '056d76e80e7b296d5395866141aca224a8882fe21e2b45ba5f5b02c2e99269a4' },
  'quality-other.svg': { url: 'https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt917e0c256b80ba6d/63513ac8dec6d64920ca68fa/spike_kickstart_your_business_place-your-order_teacher-solution_en.svg?locale=en-us', sha256: '18b7bd6a2788a15655bd50552f74df9f8285d3cfce33759c94ace594c0f6b99d' }
};
import { composeTransforms, identityTransform, quaternionFromAxisAngle, quaternionMultiply, relativeTransform } from '../core/transforms.ts';
import { geometryAssetsFor, materials, sourceDocumentsFor } from '../geometry/library.ts';
import { addMate, evidence, mountPart, nativeLDrawTransform, placement, viewOperation } from './authoring.ts';
import type { AssemblyOperation, AssemblyStep, CameraPreset, Connection, Evidence, InventoryLine, Joint, PartInstance, Quaternion, RobotModel, SourceDocument, SourceReference, Subassembly, Transform, Vec3 } from '../types/model.ts';

const at = (position: Vec3, quaternion: Quaternion = [0, 0, 0, 1]): Transform => ({ position, quaternion, scale: [1, 1, 1] });
const rx = (angle: number) => quaternionFromAxisAngle([1, 0, 0], angle);
const ry = (angle: number) => quaternionFromAxisAngle([0, 1, 0], angle);
const rz = (angle: number) => quaternionFromAxisAngle([0, 0, 1], angle);
const half = Math.PI / 2;
const manuals = research.manuals.filter((manual) => manual.id !== 'hand');
const source = (manual: string, step: number, page?: number): SourceReference => {
  const document = manuals.find((entry) => entry.id === manual)!;
  return { documentId: `quality-${manual}`, sourceUrl: document.url, instructionId: manual === 'robot-head' && page === 20 ? 'wiring-diagram' : String(step), page: page ?? step + (manual === 'idea-detector' ? 3 : 2), confidence: 1 };
};
const cad = (geometryId: string): SourceReference => ({ documentId: `ldraw-${geometryId}`, sourceUrl: `https://library.ldraw.org/library/official/parts/${geometryId}.dat`, confidence: 0.95 });
const fit = (ref: SourceReference, note: string, ids: string[]) => placement(
  evidence('documented', note, [ref]),
  evidence('diagram-derived', 'Nominal native DAT seat/hole grid selected from the manual view; robot validation records the bounded source-contact audit. Assembled mesh-fit remains unchecked. ' + note, [ref, ...ids.map(cad)], 0.65)
);
const authored = evidence('app-authored', 'RoboBuild work-area layout, approach timing and camera framing; not a physical source measurement.', [], 1);
const camera: CameraPreset = { position: [-220, 170, 240], target: [0, 40, 24], up: [0, 1, 0], projection: 'perspective', framing: 44, transitionMs: 650 };
const rearCamera: CameraPreset = { ...camera, position: [240, 190, -250] };
const families: Record<string, [string, number, PartInstance['category']]> = {
  'black-frame': ['64179', 0, 'structure'], 'tan-axle-pin': ['3749', 19, 'connector'],
  'black-pin': ['2780', 0, 'connector'], 'red-connector': ['49283', 4, 'connector'],
  'azure-l-beam': ['32526', 322, 'structure'], 'gray-double-pin-connector': ['48989', 71, 'connector'],
  'yellow-plate': ['39369', 14, 'structure'], 'color-sensor': ['37308', 15, 'sensor'],
  'yellow-brick': ['39789', 14, 'structure'], 'yellow-curve': ['24309', 14, 'structure'],
  'azure-panel-left': ['41750', 322, 'structure'], 'azure-panel-right': ['41749', 322, 'structure'],
  hub: ['45601c01', 15, 'controller'], 'medium-motor': ['54696p01', 15, 'motor'],
  'magenta-square-connector': ['39793', 26, 'connector'], 'gray-right-angle-connector': ['6536', 71, 'connector'],
  'gray-axle-pin': ['3673', 71, 'connector'], 'distance-sensor': ['37316', 15, 'sensor'],
  'azure-short-connector': ['49283', 322, 'connector'], 'red-axle': ['32062', 4, 'connector'],
  'magenta-short-connector': ['49283', 26, 'connector'], 'green-brick': ['39789', 2, 'other'],
  'blue-brick': ['39789', 1, 'other'], 'red-brick': ['39789', 4, 'other'], 'violet-brick': ['39789', 26, 'other']
};
const labels = research.parts as Record<string, { label: string }>;
// Real source-native features; their existence does not verify assembled fit.
const nativeFeatures: Record<string, { point: Vec3; axis: 'X' | 'Y' | 'Z'; type: PartInstance['connectionPoints'][number]['type'] }> = {
  '64179': { point: [40, -10, 60], axis: 'Y', type: 'hole' },
  '3749': { point: [0, 0, 0], axis: 'X', type: 'axle' },
  '2780': { point: [0, 0, 0], axis: 'X', type: 'pin' },
  '49283': { point: [0, 0, 0], axis: 'Z', type: 'axle-hole' },
  '32526': { point: [0, -10, 0], axis: 'Y', type: 'hole' },
  '48989': { point: [0, -20, 10], axis: 'Z', type: 'pin' },
  '39369': { point: [0, -10, 0], axis: 'Y', type: 'hole' },
  '37308': { point: [-30, 20, 0], axis: 'X', type: 'hole' },
  '39789': { point: [-30, 0, -10], axis: 'Y', type: 'stud' },
  '24309': { point: [0, 20, -10], axis: 'Y', type: 'tube' },
  '41750': { point: [0, 0, -10], axis: 'Y', type: 'stud' },
  '41749': { point: [0, 0, -10], axis: 'Y', type: 'stud' },
  '45601c01': { point: [40, -10, -110], axis: 'Z', type: 'hole' },
  '54696p01': { point: [0, -50, 0], axis: 'Y', type: 'axle-hole' },
  '39793': { point: [0, -10, 0], axis: 'Y', type: 'hole' },
  '6536': { point: [0, 20, -10], axis: 'Z', type: 'hole' },
  '3673': { point: [0, 0, 0], axis: 'X', type: 'pin' },
  '37316': { point: [70, 20, 0], axis: 'X', type: 'hole' },
  '32062': { point: [0, 0, 0], axis: 'X', type: 'axle' }
};
function nativeFrame(point: Vec3, axis: 'X' | 'Y' | 'Z'): Transform {
  return { ...nativeLDrawTransform(point), quaternion: axis === 'X' ? rz(-half) : axis === 'Y' ? rx(Math.PI) : rx(-half) };
}
const parts: PartInstance[] = [], operations: AssemblyOperation[] = [], steps: AssemblyStep[] = [], connections: Connection[] = [];
const installations: RobotModel['installations'] = [];
export const qualityCheckSourceFamilies: Record<string, string> = {};
const current = new Map<string, Transform>();
const roots = new Map<string, Transform>();
const parents = new Map<string, string | undefined>();
const subassemblies: Subassembly[] = [];
function group(id: string, name: string, initial: Transform, parentId?: string): void {
  const world = parentId ? composeTransforms(roots.get(parentId)!, initial) : initial;
  roots.set(id, world); parents.set(id, parentId);
  subassemblies.push({ id, name, parentId, localTransform: initial, partInstanceIds: [], childSubassemblyIds: [], evidence: placement(evidence('documented', name, [source('robot-head', 17)]), authored, true) });
  if (parentId) subassemblies.find((entry) => entry.id === parentId)!.childSubassemblyIds.push(id);
}
const headWork = at([-170, 0, -160]);
const yawRest = at([0, 40, -48]);
const pitchRest = at([-4, 12, 0]);
group('quality-base', 'Idea Detector fixed structure', identityTransform());
group('quality-head', 'Robot Head, separate until Head step 11', headWork);
group('quality-yaw', 'Lower motor output and orthogonal coupling', yawRest, 'quality-head');
group('quality-pitch', 'Upper motor body, sensor bracket and eyes', pitchRest, 'quality-yaw');
group('quality-lower-bracket', 'Prepared lower magenta connector, Head steps 2–4', at([170, 0, -120], rz(-half)));
group('quality-gray-coupler', 'Prepared gray right-angle coupler, Head steps 5–7', at([190, 0, 0]));
group('quality-retainer', 'Prepared cable retainer, Head steps 13–15', at([180, 0, 90]));
for (const side of ['left', 'right']) group(`quality-surround-${side}`, `Prepared yellow ${side} sensor surround`, at([side === 'left' ? -160 : 160, 17.6, 100], rx(Math.PI)));
for (const [index, color] of ['green', 'blue', 'red', 'violet'].entries()) group(`quality-sample-${color}`, `Loose ${color === 'violet' ? 'magenta (lesson violet)' : color} two-brick sample`, at([-120 + index * 40, 0, -140]));

let step: AssemblyStep;
function begin(manual: string, number: number, action: AssemblyStep['action'] = 'assembly'): void {
  const row = research.builds['quality-check'].steps.find((entry) => entry.manual === manual && entry.step === number)!;
  step = { id: `quality-${manual}-step${number}`, title: `${manual === 'idea-detector' ? 'Idea Detector' : 'Robot Head'} · ${number}`, description: row.action, kind: 'numbered-instruction', action, sourceReferences: [source(manual, number)], operationIds: [], requiredPartInstanceIds: [], warnings: [], durationMs: 0, cameraPreset: manual === 'robot-head' && [12, 15].includes(number) ? rearCamera : camera };
  if (manual === 'robot-head' && [11, 12, 17].includes(number)) step.warnings.push('The motors use ports A and F, but this guide cannot confirm which port drives turning or tilting. Check the official wiring diagram and your robot before testing.');
  steps.push(step);
}
function record(op: AssemblyOperation): void {
  op.startMs = step.durationMs;
  op.dependencies = operations.length ? [operations[operations.length - 1]!.id] : [];
  operations.push(op); step.operationIds.push(op.id); step.durationMs += op.durationMs;
}
function add(family: string, id: string, pose: Transform, owner = 'quality-base', axis?: Vec3, depthMm?: number): PartInstance {
  const [geometryId, color, category] = families[family]!;
  const ref = step.sourceReferences[0]!;
  const index = parts.length;
  const initialTransform = at([-330 + (index % 9) * 76, 24 + Math.floor(index / 9) * 32, 260 + Math.floor(index / 9) * 72]);
  const scope = family.endsWith('-brick') && ['green-brick', 'blue-brick', 'red-brick', 'violet-brick'].includes(family) ? 'sample' : 'robot';
  const part: PartInstance = {
    id, geometryId, materialId: `ldraw-${color}`, category, inventoryScope: scope, name: labels[family]!.label,
    subassemblyId: owner, initialTransform, finalTransform: pose,
    connectionPoints: [{ id: `${id}-native-feature`, type: nativeFeatures[geometryId]!.type, localTransform: nativeFrame(nativeFeatures[geometryId]!.point, nativeFeatures[geometryId]!.axis), evidence: placement(evidence('cad-derived', 'Native source feature, not a generic bounding-box contact. Its existence is distinct from verifying the selected assembled mating relationship.', [cad(geometryId)], 0.95), evidence('cad-derived', 'Native DAT coordinate and bore/shaft axis; conversion N is applied exactly once.', [cad(geometryId)], 0.95)) }],
    sourceReference: ref,
    geometryConfidence: ['48989', '2780'].includes(geometryId) ? 0.8 : 0.95,
    identityEvidence: evidence('diagram-derived', `Source family ${family}; ${geometryId}.dat is licensed source-shape geometry, not a certified manufacturer element/mold number.`, [ref, cad(geometryId)], 0.95),
    placementEvidence: fit(ref, `Source introduction of ${family}. Native origins and 8 mm Technic pitch are preserved; no bounding-box alignment or asset recentering.`, [geometryId])
  };
  parts.push(part); qualityCheckSourceFamilies[id] = family;
  subassemblies.find((entry) => entry.id === owner)!.partInstanceIds.push(id);
  const workDelta = composeTransforms(roots.get(owner)!, relativeTransform(finalRoot(owner), identityTransform()));
  const target = composeTransforms(workDelta, pose);
  const workAxis = axis ? composeTransforms(at([0, 0, 0], workDelta.quaternion), at(axis)).position : undefined;
  const operation = mountPart({ ...part, finalTransform: target }, { id: `quality-install-${id}`, stepId: step.id, sourceReference: ref, startMs: 0, durationMs: 750, dependencies: [], cameraPreset: step.cameraPreset, axis: workAxis, depthMm });
  record(operation); current.set(id, target);
  step.requiredPartInstanceIds.push(id);
  installations.push({ partInstanceId: id, stepId: step.id, operationId: operation.id, atMs: operation.startMs + operation.durationMs });
  return part;
}
// Completed assembly frames, independently of temporary work-area parents.
function finalRoot(id: string): Transform {
  if (id === 'quality-yaw') return yawRest;
  if (id === 'quality-pitch') return composeTransforms(yawRest, pitchRest);
  if (id.startsWith('quality-sample-')) return subassemblies.find((entry) => entry.id === id)!.localTransform;
  return identityTransform();
}
function below(owner: string, root: string): boolean {
  for (let id: string | undefined = owner; id; id = parents.get(id)) if (id === root) return true;
  return false;
}
function merge(id: string, target: Transform, parentId: string, note: string): void {
  const from = roots.get(id)!, oldParent = parents.get(id);
  const moving = parts.filter((part) => below(part.subassemblyId!, id));
  const delta = composeTransforms(target, relativeTransform(from, identityTransform()));
  const fromTransforms = moving.map((part) => current.get(part.id)!);
  const toTransforms = fromTransforms.map((pose) => composeTransforms(delta, pose));
  const relation = fit(step.sourceReferences[0]!, note, [...new Set(moving.map((part) => part.geometryId))]);
  const operation: AssemblyOperation = {
    id: `quality-merge-${id}`, stepId: step.id, operationType: 'merge-subassemblies', partInstanceIds: moving.map((part) => part.id),
    fromTransforms, toTransforms, startMs: 0, durationMs: 1600, easing: 'smoothstep', dependencies: [], sourceReference: step.sourceReferences[0], cameraPreset: step.cameraPreset, evidence: relation,
    stages: [{ id: `quality-merge-${id}-transfer`, startMs: 0, durationMs: 1600, phase: 'transfer', nodes: [{ kind: 'subassembly', id }], fromTransforms: [from], toTransforms: [target], trajectory: { type: 'linear' }, easing: 'smoothstep', evidence: placement(relation.relationship, authored, true) }],
    parentChanges: [{ node: { kind: 'subassembly', id }, fromParent: oldParent ? { kind: 'subassembly', id: oldParent } : null, toParent: { kind: 'subassembly', id: parentId }, fromLocalTransform: oldParent ? relativeTransform(roots.get(oldParent)!, target) : target, toLocalTransform: relativeTransform(roots.get(parentId)!, target) }]
  };
  record(operation);
  moving.forEach((part, index) => current.set(part.id, toTransforms[index]!));
  for (const [root, world] of roots) if (below(root, id)) roots.set(root, composeTransforms(delta, world));
  parents.set(id, parentId);
}
const pin = (id: string, position: Vec3, owner = 'quality-base', orientation: Quaternion = rz(half), axis: Vec3 = [0, -1, 0]) => add('black-pin', id, at(position, orientation), owner, axis, 8);
const part = (id: string) => parts.find((entry) => entry.id === id)!;
function nativeMate(id: string, a: string, ap: Vec3, b: string, bp: Vec3, operationId: string, type: Connection['type'] = 'fixed', aAxis?: 'X' | 'Y' | 'Z', bAxis?: 'X' | 'Y' | 'Z', aType?: PartInstance['connectionPoints'][number]['type'], bType?: PartInstance['connectionPoints'][number]['type']): void {
  const receiver = part(a), moving = part(b), ref = operations.find((op) => op.id === operationId)!.sourceReference!;
  const relation = fit(ref, `Native DAT mating features ${a} (${ap.join(',')}) and ${b} (${bp.join(',')}) LDU.`, [receiver.geometryId, moving.geometryId]);
  connections.push(addMate(receiver, { id: `${id}-a`, type: aType ?? (receiver.inventoryScope === 'sample' ? 'stud' : 'hole'), localTransform: nativeFrame(ap, aAxis ?? nativeFeatures[receiver.geometryId]!.axis), evidence: relation }, moving, { id: `${id}-b`, type: bType ?? (moving.inventoryScope === 'sample' ? 'tube' : moving.category === 'connector' ? 'pin' : 'hole'), localTransform: nativeFrame(bp, bAxis ?? nativeFeatures[moving.geometryId]!.axis), evidence: relation }, { id, type, installedByOperationId: operationId, evidence: relation }));
}

begin('idea-detector', 1);
// Detector pp5–8: rails run along the frame's seven-hole sides, not across its five-hole ends.
add('black-frame', 'quality-rear-frame', at([0, 4, 104]));
add('tan-axle-pin', 'quality-rear-clip-pin', at([16, 8, 128], rz(half)), 'quality-base', [0, -1, 0], 8);
begin('idea-detector', 2);
// Coordinate-looking instance IDs are retained as identities, not current measurements.
for (const x of [-16, 16]) for (const z of [80, 96]) pin(`quality-frame-pin-${x * 1.5}-${z === 80 ? 72 : 104}`, [x, 8, z]);
add('red-connector', 'quality-rear-red-clip', at([16, 12, 128], rx(half)), 'quality-base', [0, -1, 0], 8);
begin('idea-detector', 3);
add('azure-l-beam', 'quality-l-beam-left', at([-16, 12, 104], rz(Math.PI)), 'quality-base', [0, -1, 0], 8);
add('azure-l-beam', 'quality-l-beam-right', at([16, 12, 104]), 'quality-base', [0, -1, 0], 8);
begin('idea-detector', 4);
for (const x of [-16, 16]) add('gray-double-pin-connector', `quality-hub-crossblock-${x * 1.5}`, at([x, 20, 96], rx(-half)), 'quality-base', [0, -1, 0], 8);
begin('idea-detector', 5);
// The four collars sit UNDER the outward short legs; source p8 shows the free halves pointing down.
for (const x of [-32, -16, 16, 32]) pin(`quality-plate-join-pin-${x / 2}`, [x, 8, 72], 'quality-base', rz(half), [0, 1, 0]);
begin('idea-detector', 6);
add('yellow-plate', 'quality-baseplate', at([0, 4, 0]), 'quality-base', [0, 1, 0], 8);
begin('idea-detector', 7);
const platePins: [number, number][] = [[-8, -48], [8, -48], [-8, 8], [8, 8], [0, 32], [0, 48]];
for (const [x, z] of platePins) pin(`quality-plate-pin-${x}-${z}`, [x, 8, z]);
begin('idea-detector', 8);
add('color-sensor', 'quality-color-sensor', at([0, 20, 40], quaternionMultiply(ry(-half), rz(half))), 'quality-base', [0, -1, 0], 8);
begin('idea-detector', 9);
for (const [side, z] of [['left', 16], ['right', 64]] as const) {
  const owner = `quality-surround-${side}`;
  add('yellow-brick', `quality-yellow-brick-${side}`, at([24, 17.6, z]), owner);
  for (const x of [0, 16]) add('tan-axle-pin', `quality-surround-pin-${side}-${x}`, at([x + 16, 8, z], rz(half)), owner, [0, 1, 0], 8);
}
begin('idea-detector', 10);
for (const side of ['left', 'right']) merge(`quality-surround-${side}`, identityTransform(), 'quality-base', 'Mount the two previously prepared yellow brick/pin side surrounds; no additional units.');
begin('idea-detector', 11);
// Rear half of each brick supports the curve; the front half supports the handed panel.
for (const [side, z] of [['left', 16], ['right', 64]] as const) add('yellow-curve', `quality-yellow-curve-${side}`, at([28, 27.2, z], ry(half)), 'quality-base', [0, -1, 0], 1.6);
begin('idea-detector', 12);
add('azure-panel-left', 'quality-panel-left', at([16, 27.2, 12], ry(-half)), 'quality-base', [0, -1, 0], 1.6);
add('azure-panel-right', 'quality-panel-right', at([16, 27.2, 68], ry(-half)), 'quality-base', [0, -1, 0], 1.6);
begin('idea-detector', 13, 'wiring');
// Shell end bores are X±40, Y=-30±20 after 45601's (0,-30,0) shell translation.
add('hub', 'quality-hub', at([0, 68, 84], rx(half)), 'quality-base', [0, -1, 0], 8);

begin('robot-head', 1);
add('medium-motor', 'quality-lower-motor', at([0, 20, -48], ry(Math.PI)), 'quality-head');
for (const z of [-56, -40]) pin(`quality-disc-pin-${z}`, [0, 40, z], 'quality-yaw');
begin('robot-head', 2);
add('magenta-square-connector', 'quality-lower-square', at([0, 52, -48], rz(half)), 'quality-lower-bracket');
begin('robot-head', 3);
for (const [y, z] of [[44, -48], [60, -48], [52, -56], [52, -40]]) pin(`quality-coupling-pin-${y}-${z}`, [-4, y!, z!], 'quality-lower-bracket', identityTransform().quaternion, [1, 0, 0]);
begin('robot-head', 4);
merge('quality-lower-bracket', headWork, 'quality-yaw', 'Rotate prepared square connector upright; its two real edge bores receive the lower output-disc pins.');
begin('robot-head', 5);
add('gray-right-angle-connector', 'quality-gray-elbow', at([8, 52, -48]), 'quality-gray-coupler');
add('tan-axle-pin', 'quality-gray-axle-pin', at([4, 52, -48]), 'quality-gray-coupler', [1, 0, 0], 8);
begin('robot-head', 6);
add('gray-axle-pin', 'quality-plain-gray-pin', at([8, 44, -52], ry(half)), 'quality-gray-coupler', [0, 0, 1], 8);
begin('robot-head', 7);
merge('quality-gray-coupler', headWork, 'quality-yaw', 'Fit the gray/tan coupling to the upright square; 3673 remains a plain round pin, not an axle.');
begin('robot-head', 8);
const upperOrientation = quaternionMultiply(ry(half), rx(half));
add('medium-motor', 'quality-upper-motor', at([-24, 52, -48], upperOrientation), 'quality-pitch', [1, 0, 0], 8);
for (const x of [-32, -16]) pin(`quality-upper-body-pin-${x}`, [x, 108, -60], 'quality-pitch', ry(-half), [0, 0, 1]);
begin('robot-head', 9);
add('magenta-square-connector', 'quality-upper-square', at([-24, 108, -64], rx(half)), 'quality-pitch', [0, 0, 1], 8);
for (const y of [100, 116]) pin(`quality-sensor-pin-${y}`, [-24, y, -68], 'quality-pitch', ry(-half), [0, 0, 1]);
begin('robot-head', 10);
add('distance-sensor', 'quality-distance-sensor', at([-24, 108, -96], ry(-half)), 'quality-pitch', [0, 0, 1], 8);
begin('robot-head', 11, 'reuse');
merge('quality-head', identityTransform(), 'quality-base', 'Genuine Head step 11 integration onto the four existing plate pins, with every existing head descendant traveling together.');
begin('robot-head', 12, 'wiring');
// Electrical connection operations are appended below; this source step really turns and wires, not a fictitious new physical part.
begin('robot-head', 13);
// Head p17 retains the bundle with two cable clips, NOT a rigid motor-hole mount.
// The global seat is diagram-derived: absent flexible leads cannot locate it exactly.
add('azure-short-connector', 'quality-retainer-azure', at([-40, 76, -48], ry(half)), 'quality-retainer');
add('red-axle', 'quality-retainer-axle', at([-44, 76, -48]), 'quality-retainer', [-1, 0, 0], 8);
begin('robot-head', 14);
add('magenta-short-connector', 'quality-retainer-magenta', at([-48, 76, -48], ry(half)), 'quality-retainer', [1, 0, 0], 8);
begin('robot-head', 15, 'reuse');
merge('quality-retainer', identityTransform(), 'quality-pitch', 'Place the prepared retainer beside the far side of the moving head, supported by the captured flexible cable bundle, not by a rigid motor connection.');
const retainerSeat = placement(
  evidence('documented', 'Head pp15–17: two49283 clips joined by one32062 axle capture the flexible lead bundle. No rigid motor attachment is shown.', [source('robot-head', 15)]),
  evidence('unknown', 'Nominal display seat beside the upper motor only. Flexible lead geometry is absent; the manual does not dimension the bundle, clip seat, cable lengths or exact route. Pitch parenting is playback ownership, not a rigid physical mount.', [source('robot-head', 15)], 0.35)
);
retainerSeat.placement = 'diagram-derived';
for (const id of ['quality-retainer-azure', 'quality-retainer-axle', 'quality-retainer-magenta']) part(id).placementEvidence = retainerSeat;
operations.find((operation) => operation.id === 'quality-merge-quality-retainer')!.evidence = retainerSeat;
steps.find((entry) => entry.id === 'quality-robot-head-step15')!.warnings.push('Cable-retainer placement and cable routing are approximate in this view. Check the manual and leave enough cable movement for the head to tilt.');
begin('robot-head', 16);
for (const color of ['green', 'blue', 'red', 'violet']) {
  const owner = `quality-sample-${color}`, root = roots.get(owner)!;
  for (const [index, height] of [9.6, 19.2].entries()) add(`${color}-brick`, `quality-sample-${color}-${index + 1}`, composeTransforms(root, at([0, height, 0])), owner, index ? [0, -1, 0] : undefined, index ? 1.6 : undefined);
}
begin('robot-head', 17, 'view');
record(viewOperation('quality-final-source-view', steps.at(-1)!.id, source('robot-head', 17), camera, 1500));

// Electrical port coordinates follow the native hub port inserts in 45601.dat.
// The physical A/F axis assignment is explicitly UNKNOWN; only C/D endpoints are source-identified.
const electrical: [string, string, Vec3, string, number][] = [
  ['quality-color-sensor', 'D', [0, 0, 3], 'idea-detector', 13],
  ['quality-distance-sensor', 'C', [0, 14, 3], 'robot-head', 11],
  ['quality-lower-motor', 'A', [0, 0, 143], 'robot-head', 12],
  ['quality-upper-motor', 'F', [0, 0, 143], 'robot-head', 12]
];
const cables: RobotModel['cables'] = [];
for (const [deviceId, port, nativeStub, manual, number] of electrical) {
  step = steps.find((entry) => entry.id === `quality-${manual}-step${number}`)!;
  const device = part(deviceId), hub = part('quality-hub');
  const portIndex = ['A', 'B', 'C', 'D', 'E', 'F'].indexOf(port);
  const nativePort: Vec3 = [portIndex < 3 ? 69 : -69, -68, [0, 40, -40, 0, -40, 40][portIndex]!];
  const ref = source('robot-head', 17, 20);
  const assumption = port === 'A' || port === 'F';
  const note = assumption ? 'Modeling assumption only: A→lower yaw, F→upper body/pitch. Source verifies two motors at A/F but NOT the physical port-to-axis mapping.' : `Source wiring: ${deviceId} to ${port}.`;
  const ev = evidence(assumption ? 'unknown' : 'documented', note, [ref], assumption ? 0.35 : 1);
  const relation = placement(ev, evidence('cad-derived', 'Native captive stub and hub port insert origins; flexible route shape is app-authored.', [cad(device.geometryId), cad(hub.geometryId)], 0.9));
  const id = `quality-wire-${port}`;
  device.connectionPoints.push({ id: `${id}-device`, type: 'electrical', localTransform: nativeLDrawTransform(nativeStub), evidence: relation });
  hub.connectionPoints.push({ id: `${id}-hub`, type: 'electrical', localTransform: nativeLDrawTransform(nativePort), evidence: relation });
  connections.push({ id, a: { partInstanceId: device.id, connectionPointId: `${id}-device` }, b: { partInstanceId: hub.id, connectionPointId: `${id}-hub` }, type: 'electrical', installedByOperationId: id, evidence: relation });
  const op: AssemblyOperation = { id, stepId: step.id, operationType: 'connect', partInstanceIds: [device.id, hub.id], fromTransforms: [device.finalTransform, hub.finalTransform], toTransforms: [device.finalTransform, hub.finalTransform], startMs: step.durationMs, durationMs: 650, easing: 'smoothstep', dependencies: [step.operationIds.at(-1) ?? operations.find((entry) => entry.stepId === steps[steps.indexOf(step) - 1]?.id)?.id!].filter(Boolean), cameraPreset: step.cameraPreset, sourceReference: ref, stages: [], parentChanges: [], evidence: relation };
  operations.push(op); step.operationIds.push(id); step.durationMs += op.durationMs;
  if (assumption) step.warnings.push('The demo assumes A turns the head and F tilts it. The physical port-to-axis assignment is unverified; check your wiring before running a program.');
  cables.push({ id: `${id}-captive-route`, devicePartInstanceId: device.id, captive: true, fromConnection: id, toConnection: id, controlPoints: [
    { parent: { kind: 'part', id: device.id }, position: nativeLDrawTransform(nativeStub).position },
    { parent: { kind: 'part', id: device.id }, position: [0, 32, 12] },
    { parent: { kind: 'part', id: hub.id }, position: nativeLDrawTransform(nativePort).position }
  ], routeEvidence: evidence(assumption ? 'unknown' : 'app-authored', note + ' Schematic flexible lead path; no additional inventory instance or cable-safe-motion claim.', [ref], assumption ? 0.35 : 0.7) });
}
// A late wiring operation extends a step, but no physical track in another step overlaps it.
// Dependencies stay book-chronological rather than relying on array insertion order.
for (let index = 0; index < steps.length; index++) {
  const previous = index ? steps[index - 1]! : undefined;
  const first = operations.find((operation) => operation.id === steps[index]!.operationIds[0]);
  if (first && previous) first.dependencies = [...new Set([...first.dependencies.filter((id) => operations.find((operation) => operation.id === id)?.stepId === first.stepId), previous.operationIds[previous.operationIds.length - 1]!])];
}

for (const x of [-16, 16]) for (const z of [80, 96]) nativeMate(`quality-frame-seat-${x}-${z}`, 'quality-rear-frame', [x / 0.4, -10, (104 - z) / 0.4], `quality-frame-pin-${x * 1.5}-${z === 80 ? 72 : 104}`, [0, 0, 0], `quality-install-quality-frame-pin-${x * 1.5}-${z === 80 ? 72 : 104}`);
nativeMate('quality-rear-clip-frame-seat', 'quality-rear-frame', [40, -10, -60], 'quality-rear-clip-pin', [0, 0, 0], 'quality-install-quality-rear-clip-pin');
nativeMate('quality-rear-clip-axle-seat', 'quality-rear-red-clip', [0, 0, -10], 'quality-rear-clip-pin', [0, 0, 0], 'quality-install-quality-rear-red-clip');
for (const z of [-56, -40]) {
  nativeMate(`quality-lower-disc-${z}`, 'quality-lower-motor', [0, -50, (z + 48) / 0.4], `quality-disc-pin-${z}`, [0, 0, 0], `quality-install-quality-disc-pin-${z}`);
  nativeMate(`quality-square-edge-${z}`, 'quality-lower-square', [-30, 0, -(z + 48) / 0.4], `quality-disc-pin-${z}`, [0, 0, 0], 'quality-merge-quality-lower-bracket', 'fixed', 'X');
}
for (const [index, x] of [-32, -16].entries()) {
  nativeMate(`quality-upper-housing-seat-${index}`, 'quality-upper-motor', [30, -(x + 24) / 0.4, 140], `quality-upper-body-pin-${x}`, [0, 0, 0], `quality-install-quality-upper-body-pin-${x}`, 'fixed', 'X');
  nativeMate(`quality-upper-bracket-seat-${index}`, 'quality-upper-square', [(x + 24) / 0.4, -10, 0], `quality-upper-body-pin-${x}`, [0, 0, 0], 'quality-install-quality-upper-square');
}
for (const color of ['green', 'blue', 'red', 'violet']) nativeMate(`quality-stack-${color}`, `quality-sample-${color}-1`, [-30, 0, -10], `quality-sample-${color}-2`, [-30, 24, -10], `quality-install-quality-sample-${color}-2`);
// Plate bore centers use the real 39369 20-LDU grid; pin collars are on its upper Y=-10 face.
for (const [x, z] of platePins) nativeMate(`quality-base-pin-seat-${x}-${z}`, 'quality-baseplate', [x / 0.4, -10, -z / 0.4], `quality-plate-pin-${x}-${z}`, [0, 0, 0], `quality-install-quality-plate-pin-${x}-${z}`);
for (const x of [-16, 16]) for (const sign of [-1, 1]) nativeMate(`quality-hub-integral-seat-${x}-${sign}`, 'quality-hub', [x / 0.4, -30 + sign * 20, -110], `quality-hub-crossblock-${x * 1.5}`, [0, -sign * 20, -10], 'quality-install-quality-hub');
for (const [side, x] of [['left', -16], ['right', 16]] as const) {
  for (const z of [80, 96]) nativeMate(`quality-l-seat-${side}-${z}`, `quality-l-beam-${side}`, [0, side === 'left' ? -10 : 10, (104 - z) / 0.4], `quality-frame-pin-${x * 1.5}-${z === 80 ? 72 : 104}`, [0, 0, 0], `quality-install-quality-l-beam-${side}`);
  for (const sign of [-1, 1]) nativeMate(`quality-crossblock-seat-${side}-${sign}`, `quality-l-beam-${side}`, [0, side === 'left' ? 10 : -10, (104 - 96 - sign * 8) / 0.4], `quality-hub-crossblock-${x * 1.5}`, [0, sign * 20, 10], `quality-install-quality-hub-crossblock-${x * 1.5}`);
  for (const offset of [0, 40]) {
    const pinX = x + (side === 'left' ? -1 : 1) * offset * 0.4;
    nativeMate(`quality-short-leg-seat-${side}-${offset}`, `quality-l-beam-${side}`, [offset, side === 'left' ? -10 : 10, 80], `quality-plate-join-pin-${pinX / 2}`, [0, 0, 0], `quality-install-quality-plate-join-pin-${pinX / 2}`);
    nativeMate(`quality-plate-join-seat-${side}-${offset}`, 'quality-baseplate', [pinX / 0.4, -10, -180], `quality-plate-join-pin-${pinX / 2}`, [0, 0, 0], 'quality-install-quality-baseplate');
  }
}
for (const [x, z] of platePins) {
  if (x === 0) nativeMate(`quality-color-seat-${z}`, 'quality-color-sensor', [-30, (z - 40) / 0.4, 0], `quality-plate-pin-${x}-${z}`, [0, 0, 0], 'quality-install-quality-color-sensor');
  else nativeMate(`quality-head-plate-seat-${x}-${z}`, 'quality-lower-motor', [-x / 0.4, 30, (z + 48) / 0.4], `quality-plate-pin-${x}-${z}`, [0, 0, 0], 'quality-merge-quality-head', 'fixed', 'Y');
}
nativeMate('quality-upper-output-to-coupling', 'quality-lower-square', [0, -10, 0], 'quality-upper-motor', [0, -50, 0], 'quality-install-quality-upper-motor', 'pivot');
// Head pp5/10: four face pins, not an invented central axle, retain the reversed upper output.
for (const [y, z, squareX, squareZ, rotorX, rotorZ] of [[44, -48, -20, 0, 0, -20], [60, -48, 20, 0, 0, 20], [52, -56, 0, 20, 20, 0], [52, -40, 0, -20, -20, 0]]) {
  const id = `quality-coupling-pin-${y}-${z}`;
  nativeMate(`quality-coupling-face-${y}-${z}`, 'quality-lower-square', [squareX!, -10, squareZ!], id, [0, 0, 0], `quality-install-${id}`);
  nativeMate(`quality-upper-disc-${y}-${z}`, 'quality-upper-motor', [rotorX!, -50, rotorZ!], id, [0, 0, 0], 'quality-install-quality-upper-motor');
}
nativeMate('quality-gray-axle-elbow-seat', 'quality-gray-elbow', [-10, 0, 0], 'quality-gray-axle-pin', [0, 0, 0], 'quality-install-quality-gray-axle-pin', 'fixed', 'X');
nativeMate('quality-gray-plain-pin-seat', 'quality-gray-elbow', [0, 20, 10], 'quality-plain-gray-pin', [0, 0, 0], 'quality-install-quality-plain-gray-pin');
nativeMate('quality-gray-pin-square-seat', 'quality-lower-square', [0, 10, 0], 'quality-gray-axle-pin', [0, 0, 0], 'quality-merge-quality-gray-coupler');
for (const y of [100, 116]) nativeMate(`quality-eyes-side-seat-${y}`, 'quality-distance-sensor', [70, (108 - y) / 0.4, 0], `quality-sensor-pin-${y}`, [0, 0, 0], 'quality-install-quality-distance-sensor');
// Detector pp12–15: axle up into brick underside, pin down into the real plate bore.
for (const [side, z, panel, panelSign] of [['left', 16, 'quality-panel-left', 1], ['right', 64, 'quality-panel-right', -1]] as const) {
  for (const [index, bx] of [-20, 20].entries()) {
    const id = `quality-surround-pin-${side}-${index * 16}`;
    nativeMate(`quality-surround-axle-${side}-${index}`, `quality-yellow-brick-${side}`, [bx, 24, 0], id, [0, 0, 0], `quality-install-${id}`, 'fixed', 'Y', 'X', 'axle-hole', 'axle');
    nativeMate(`quality-surround-plate-${side}-${index}`, 'quality-baseplate', [(16 + index * 16) / 0.4, -10, -z / 0.4], id, [0, 0, 0], `quality-merge-quality-surround-${side}`, 'fixed', 'Y', 'X', 'hole', 'pin');
  }
  // Socket centers, not underside tube axes: tubes lie BETWEEN these stud pockets.
  for (const bx of [-30, -10]) for (const bz of [-10, 10]) nativeMate(`quality-panel-stud-${side}-${bx}-${bz}`, `quality-yellow-brick-${side}`, [bx, 0, bz], panel, [panelSign * 10 - bz, 24, bx + 20], `quality-install-${panel}`, 'fixed', 'Y', 'Y', 'stud', 'tube');
  for (const bx of [10, 30]) for (const bz of [-10, 10]) nativeMate(`quality-curve-stud-${side}-${bx}-${bz}`, `quality-yellow-brick-${side}`, [bx, 0, bz], `quality-yellow-curve-${side}`, [bz, 24, 10 - bx], `quality-install-quality-yellow-curve-${side}`, 'fixed', 'Y', 'Y', 'stud', 'tube');
}
// Both clips are 20 LDU thick along native Z; the 40-LDU axle fills their bores.
nativeMate('quality-retainer-azure-axle', 'quality-retainer-azure', [0, 0, 0], 'quality-retainer-axle', [10, 0, 0], 'quality-install-quality-retainer-axle', 'fixed', 'Z', 'X', 'axle-hole', 'axle');
nativeMate('quality-retainer-magenta-axle', 'quality-retainer-magenta', [0, 0, 0], 'quality-retainer-axle', [-10, 0, 0], 'quality-install-quality-retainer-magenta', 'fixed', 'Z', 'X', 'axle-hole', 'axle');

const modeledMotion = evidence('app-authored', 'Conservative ±35° demo envelope and playback rate; not measured physical stops, calibrated speed, motor encoder range or cable-safe travel.', [], 1);
const yawJoint: Joint = { id: 'quality-yaw-joint', name: 'Lower output yaw (modeled A assignment)', type: 'revolute', parent: { kind: 'subassembly', id: 'quality-head' }, child: { kind: 'subassembly', id: 'quality-yaw' }, origin: yawRest, childTransform: identityTransform(), axis: [0, 1, 0], zero: 0, limits: { min: -35 * Math.PI / 180, max: 35 * Math.PI / 180, basis: 'modeled', evidence: modeledMotion }, drivenByMotorId: 'quality-motor-A-assumption', internalBinding: { partInstanceId: 'quality-lower-motor', geometryNodeId: 'parts/u9363p01.dat', movingSide: 'rotor' }, evidence: fit(source('robot-head', 4), 'Lower motor native rotor origin [0,-50,0] LDU; actual output drives the coupling, body remains on the plate.', ['54696p01']) };
const pitchJoint: Joint = { id: 'quality-pitch-joint', name: 'Upper body pitch (modeled F assignment)', type: 'revolute', parent: { kind: 'subassembly', id: 'quality-yaw' }, child: { kind: 'subassembly', id: 'quality-pitch' }, origin: pitchRest, childTransform: identityTransform(), axis: [1, 0, 0], zero: 0, limits: { ...yawJoint.limits!, evidence: modeledMotion }, drivenByMotorId: 'quality-motor-F-assumption', internalBinding: { partInstanceId: 'quality-upper-motor', geometryNodeId: 'parts/u9363p01.dat', movingSide: 'body' }, evidence: fit(source('robot-head', 8), 'Upper output is attached to the yaw coupling; the actual upper motor BODY carries the eyes and rotates about its native rotor. The internal rotor countertransforms, not the housing.', ['54696p01', '39793']) };
const programReference = (key: 'quality-main.svg' | 'quality-solution.svg' | 'quality-other.svg'): SourceReference => ({ documentId: `quality-${key}`, sourceUrl: sourceCache[key].url, confidence: 1 });
const responseEvidence = evidence('app-authored', 'RoboBuild inspection-response demonstration from documented color, range and eye-light capabilities. Scripted presence and accept/reject meanings are extensions, not the inspected lesson truth table. A/F axis assignment is unverified.', [programReference('quality-main.svg'), programReference('quality-solution.svg')], 1);
const violetEvidence = evidence('documented', 'Possible-solution SVG: D violet triggers A clockwise30/counterclockwise60/clockwise60/counterclockwise30 degrees. Demo timings are authored; physical A axis unknown. This is not the separate teacher red-A/green-F variant.', [programReference('quality-solution.svg')], 1);
const wave = (motorId: string, startMs: number, ev: Evidence): RobotModel['scenarios'][number]['motorCommands'] => [0, 30, -30, 30, 0].slice(1).map((degree, index) => ({ motorId, startMs: startMs + index * 650, durationMs: 650, mode: 'position', from: [0, 30, -30, 30][index]! * Math.PI / 180, to: degree * Math.PI / 180, unit: 'rad', easing: 'smoothstep', evidence: ev }));
const scenarios: RobotModel['scenarios'] = [{
  id: 'quality-inspection-response-extension', title: 'RoboBuild inspection-response demo', description: 'A person presents the real two-brick magenta sample to D. Scripted range and color signals cue the source violet/A expression, then an explicitly app-authored upper-body response and eye-light change. No conveyor, classifier or grasping hardware.', fidelity: 'deterministic-kinematics', durationMs: 8000,
  motorCommands: [...wave('quality-motor-A-assumption', 1600, violetEvidence), ...wave('quality-motor-F-assumption', 4600, responseEvidence)],
  sensorSignals: [
    { sensorPartInstanceId: 'quality-color-sensor', port: 'D', timeMs: 0, type: 'color', value: 'none', basis: 'scripted-input', evidence: responseEvidence },
    { sensorPartInstanceId: 'quality-distance-sensor', port: 'C', timeMs: 0, type: 'light', value: 100, basis: 'documented-output', evidence: evidence('documented', 'Official main program lights the C eyes; 100% and cue timing are authored, not a calibrated measured intensity.', [programReference('quality-main.svg')]) },
    { sensorPartInstanceId: 'quality-distance-sensor', port: 'C', timeMs: 100, type: 'distance', value: 500, basis: 'scripted-input', evidence: responseEvidence },
    { sensorPartInstanceId: 'quality-distance-sensor', port: 'C', timeMs: 1200, type: 'distance', value: 120, basis: 'scripted-input', evidence: responseEvidence },
    { sensorPartInstanceId: 'quality-color-sensor', port: 'D', timeMs: 1600, type: 'color', value: 'violet', basis: 'scripted-input', evidence: violetEvidence },
    { sensorPartInstanceId: 'quality-distance-sensor', port: 'C', timeMs: 4300, type: 'light', value: 35, basis: 'documented-output', evidence: responseEvidence },
    { sensorPartInstanceId: 'quality-color-sensor', port: 'D', timeMs: 7400, type: 'color', value: 'none', basis: 'scripted-input', evidence: responseEvidence },
    { sensorPartInstanceId: 'quality-distance-sensor', port: 'C', timeMs: 7500, type: 'light', value: 100, basis: 'documented-output', evidence: responseEvidence }
  ], objectEvents: [], rootMotion: [
    { node: { kind: 'subassembly', id: 'quality-sample-violet' }, timeMs: 0, transform: roots.get('quality-sample-violet')!, evidence: responseEvidence },
    { node: { kind: 'subassembly', id: 'quality-sample-violet' }, timeMs: 500, transform: at([-120, 8, -140]), evidence: responseEvidence },
    { node: { kind: 'subassembly', id: 'quality-sample-violet' }, timeMs: 1200, transform: at([-120, 8, 40]), evidence: responseEvidence },
    { node: { kind: 'subassembly', id: 'quality-sample-violet' }, timeMs: 1600, transform: at([-51.6, 8, 40]), evidence: responseEvidence },
    { node: { kind: 'subassembly', id: 'quality-sample-violet' }, timeMs: 6800, transform: at([-51.6, 8, 40]), evidence: responseEvidence },
    { node: { kind: 'subassembly', id: 'quality-sample-violet' }, timeMs: 7300, transform: at([-120, 8, 40]), evidence: responseEvidence },
    { node: { kind: 'subassembly', id: 'quality-sample-violet' }, timeMs: 7700, transform: at([-120, 8, -140]), evidence: responseEvidence },
    { node: { kind: 'subassembly', id: 'quality-sample-violet' }, timeMs: 8000, transform: roots.get('quality-sample-violet')!, evidence: responseEvidence }
  ], limitations: ['Human presentation is an authored sample-support path, not robot transport.', 'No automatic defect detection or complete color acceptance truth table is documented.', 'Distance presence cue and second-axis response are RoboBuild extensions.', 'A→yaw and F→upper-body are explicit modeling assumptions; actual cable-to-axis assignment remains unknown.', '±35° bounds and command durations are modeled, not calibrated cable-safe physical limits.', 'Sound and Hub display images in the source program are not reproduced by this motion/eye-light workflow.'], sourceReferences: [source('robot-head', 17, 20), programReference('quality-main.svg'), programReference('quality-solution.svg')]
}];
const inventory: InventoryLine[] = [];
for (const [module, rows] of Object.entries(research.builds['quality-check'].bomByModule)) for (const row of rows) {
  const sample = module === 'loose-sample-packages';
  const ids = parts.filter((entry) => qualityCheckSourceFamilies[entry.id] === row.part && (sample ? entry.inventoryScope === 'sample' : entry.sourceReference?.documentId === `quality-${module}`)).map((entry) => entry.id);
  inventory.push({ id: `quality-bom-${module}-${row.part}`, name: labels[row.part]!.label, scope: sample ? 'sample' : 'robot', basis: 'prepared-callout-units', accounting: 'tracked', quantity: row.quantity, partInstanceIds: ids, sourceReferences: row.pages.map((page) => source(sample ? 'robot-head' : module, page - (sample || module === 'robot-head' ? 2 : 3), page)) });
}
const geometryAssets = geometryAssetsFor(parts.map((entry) => entry.geometryId));
// Fixed source-colored electronic subparts reference palette materials beyond each inherited body material.
const selectedMaterials = materials;
const documents: SourceDocument[] = [
  ...manuals.map((manual): SourceDocument => ({ id: `quality-${manual.id}`, title: manual.title, sourceUrl: manual.url, sha256: manual.sha256, edition: 'Official2019 PDF; SHA-locked, no printed revision', pageCount: manual.pages, redistribution: 'link-only' })),
  ...(['quality-main.svg', 'quality-solution.svg', 'quality-other.svg'] as const).map((key): SourceDocument => ({ id: `quality-${key}`, title: key === 'quality-other.svg' ? 'Distinct teacher variant: red A / green F' : key === 'quality-solution.svg' ? 'Possible solution: violet A sequence' : 'Main initialization and eye-light program', sourceUrl: sourceCache[key].url, sha256: sourceCache[key].sha256, edition: 'Official lesson SVG, private evidence only', redistribution: 'link-only' })),
  ...sourceDocumentsFor(geometryAssets, selectedMaterials)
];
export const qualityCheck: RobotModel = {
  id: 'quality-check', name: 'Quality Check Robot', manufacturer: 'LEGO Education', edition: 'Idea Detector + Robot Head · 2019', category: 'Expressive sensor robot', complexity: 'Intermediate', description: 'Build a color-sensing base and a head that turns and tilts. Prepare four colored samples to try the inspection demonstration. Check the A/F motor wiring against the manual.', schemaVersion: 1,
  sourceDocuments: documents, parts, geometryAssets, materials: selectedMaterials, steps, operations, installations, visibility: [], subassemblies, connections, joints: [yawJoint, pitchJoint], linkageConstraints: [], motors: [
    { id: 'quality-motor-A-assumption', partInstanceId: 'quality-lower-motor', port: 'A', jointId: yawJoint.id, assignmentEvidence: evidence('app-authored', 'App-authored command binding only: modeled A→lower yaw. Physical source A/F port-to-axis mapping remains UNKNOWN and unverified.', [source('robot-head', 17, 20)], 0.35) },
    { id: 'quality-motor-F-assumption', partInstanceId: 'quality-upper-motor', port: 'F', jointId: pitchJoint.id, assignmentEvidence: evidence('app-authored', 'App-authored command binding only: modeled F→upper body/pitch. Physical source A/F port-to-axis mapping remains UNKNOWN and unverified.', [source('robot-head', 17, 20)], 0.35) }
  ], cables, inventory, scenarios,
  milestones: [{ id: 'quality-base-complete', title: 'Idea Detector complete', stepId: 'quality-idea-detector-step13' }, { id: 'quality-head-integrated', title: 'Head mounted on detector', stepId: 'quality-robot-head-step11' }, { id: 'quality-samples-prepared', title: 'Eight bricks, four loose samples', stepId: 'quality-robot-head-step16' }],
  sourceMappings: steps.flatMap((entry) => entry.sourceReferences.map((reference) => ({ source: reference, stepId: entry.id }))),
  coverage: { documentedSteps: 30, implementedSteps: 30, verifiedSteps: 0, modeledComponents: 63, verifiedComponents: 0, geometryConfidence: 0.9,
    dimensions: { inventory: { status: 'complete', verified: 63, total: 63, note: 'Independent official callout transcription:34 detector +21 head +8 loose sample units; historical element IDs not certified.' }, geometry: { status: 'complete', verified: 0, total: 63, note: 'Licensed genuine DAT geometry, native origins preserved; historical molds and assembled mesh fit unchecked.' }, placement: { status: 'partial', verified: 0, total: 63, note: 'Detector frame/L/crossblock/hub and plate-join contacts source-audited; Head output/bracket seats compared. Whole-step mesh fit and remaining contacts unchecked.' }, kinematics: { status: 'partial', verified: 0, total: 2, note: 'Actual serial yaw/upper-body hierarchy and rotor/body binding; source physical A/F mapping and safe travel unknown.' }, simulation: { status: 'partial', verified: 0, total: 1, note: 'Authored deterministic response scenario using source violet sequence and distinct labeled extensions; current corrections not yet exercised.' } },
    outstandingDeviations: ['Bounded Detector support/exterior and Head native-seat audit is not whole-model source/mesh verification; not acceptance-complete.', '48989 circular-center crossblock is a provisional historical mold.', 'Physical motor-port-to-axis mapping is UNKNOWN; A→yaw/F→body is a modeling assumption, not source truth.', 'Modeled ±35° demo travel is not a physical stop or cable-clearance calibration.', 'Retainer clips capture flexible leads, not a rigid motor mount; absent lead geometry leaves its exact global seat UNKNOWN. Flexible cable paths are illustrative; no measured cable length.', 'Teacher red-A/green-F and possible-solution violet-A programs remain distinct; authored demo does not claim an automatic defect classifier.'] }
};
