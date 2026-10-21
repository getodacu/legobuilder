import type { AssemblyOperation, AssemblyStep, CameraPreset, Connection, ConnectionPoint, PartInstance, PlacementEvidence, Quaternion, SourceReference, Transform, Vec3 } from '../../types/model.ts';
import { composeTransforms, identityTransform, quaternionFromAxisAngle, quaternionMultiply } from '../../core/transforms.ts';
import { addMate, evidence, mountPart, nativeLDrawTransform, placement, stepId, type BuildFragment } from '../authoring.ts';
import { advancedDrivingBaseDocuments } from '../catalog.ts';

const book = advancedDrivingBaseDocuments[3]!;
const source = (n: number): SourceReference => ({ documentId: book.id, page: n, instructionId: String(n), figure: `Rear Part step ${n}`, sourceUrl: `${book.sourceUrl}#page=${n}`, confidence: 0.98 });
const cad = (id: string, figure: string): SourceReference => ({ documentId: `ldraw-${id}`, sourceUrl: `https://library.ldraw.org/library/official/parts/${id}.dat`, figure, confidence: 0.98 });
const q = (axis: Vec3, angle: number): Quaternion => quaternionFromAxisAngle(axis, angle);
const rz = q([0, 0, 1], -Math.PI / 2);
const ry = q([0, 1, 0], -Math.PI / 2);
const bridge = quaternionMultiply(ry, rz);
const vertical: Quaternion = [-0.5, -0.5, -0.5, 0.5];
const hMount = q([1, 0, 0], -Math.PI / 2);
const pose = nativeLDrawTransform;
const presentation = placement(evidence('app-authored', 'Visible inventory, preparation work areas and animation timing are presentation, not source dimensions.', [], 1), evidence('app-authored', 'Clearance before the final axial seating motion is presentation-only.', [], 1), true);
const fit = (n: number, note: string, ids: string[]): PlacementEvidence => placement(evidence('documented', note, [source(n)]), evidence('cad-derived', `${note} Native LDraw pitch20 LDU; N=Rx(pi)*0.4. Source-selected hole correspondence remains unchecked, not a measured physical fit.`, ids.map((id) => cad(id, 'Native part feature/seat derivations recorded in docs/validation/adb-rear.md')), 0.85));
const railFit = fit(1, '48989 integral opposed pin pairs bridge two 40490 rails. Native rail holes run z=-80..80; connector pin bases (0,±20,±10).', ['40490', '48989']);
const motorFit = fit(5, 'The fixed medium motor body sits over the lower rail bridge; the circular output is indexed as the inset, not a spinning motor housing.', ['54696p01', '48989']);
const topFit = fit(29, '39794 frame is supported by two 62462 standoffs and the upper mounting brackets. Frame long-axis hole pitch is20 LDU.', ['39794', '62462', '32184']);
const outputFit = fit(26, '46372 uses two opposed pin holes at radius20 LDU to mount on the real medium drive hub. Gear axis is nativeZ, rotor axis nativeY; rotate gear Rx(pi/2).', ['46372', '54696p01']);
const parts: PartInstance[] = [];
const familyByPartId: Record<string, string> = {};
const introduced = new Map<string, number>();
const preparedOffset = new Map<string, Vec3>();
const operationPose = new Map<string, Transform>();
const operations: AssemblyOperation[] = [];
const connections: Connection[] = [];
const installations: BuildFragment['installations'] = [];
const groupMembers = new Map<string, string[]>();
const camera = (n: number): CameraPreset => ({ position: n >= 10 && n !== 29 ? [150, 115, -155] : [-150, 115, 120], target: [0, 5, -24], up: [0, 1, 0], projection: 'perspective', framing: 38, transitionMs: 600 });
const families: Record<string, [string, number, string, PartInstance['category']]> = {
  'grey-pinbeam3': ['48989', 71, 'Gray cross block with four integral pins', 'connector'],
  'black-beam9': ['40490', 0, 'Black nine-hole beam', 'structure'],
  'black-pin2': ['2780', 0, 'Black friction pin', 'connector'],
  'medium-motor': ['54696p01', 15, 'Medium angular output motor', 'motor'],
  'pink-connector3': ['39793', 26, 'Magenta perpendicular connector block', 'structure'],
  'grey-iframe3x5': ['14720', 71, 'Gray H-shaped frame', 'structure'],
  'blue-pin3': ['6558', 1, 'Blue long friction pin', 'connector'],
  'grey-pin3cross': ['32054', 71, 'Gray long pin with coaxial stop bush', 'connector'],
  'azur-wireclip': ['49283', 322, 'Medium azure cable clip', 'connector'],
  'white-doublecross': ['32184', 15, 'White axle/pin/axle cross block', 'connector'],
  'yellow-axle3': ['4519', 14, 'Yellow three-module axle', 'connector'],
  'azur-beam13': ['41239', 322, 'Medium azure thirteen-hole beam', 'structure'],
  'yellow-tube2': ['62462', 14, 'Yellow two-module pin joiner', 'connector'],
  'grey-gear28': ['46372', 71, 'Gray 28-tooth double-bevel output gear', 'gear'],
  'pink-frame7x11': ['39794', 26, 'Magenta seven-by-eleven frame', 'structure'],
  'red-axlepin3': ['11214', 4, 'Red long axle/pin', 'connector'],
  'grey-axlepin2': ['18651', 71, 'Gray two-module axle with one-module pin', 'connector'],
  'azur-beam7': ['32524', 322, 'Medium azure seven-hole upright', 'structure']
};
function shifted(t: Transform, delta: Vec3): Transform {
  return { ...t, position: t.position.map((v, i) => v + delta[i]!) as Vec3 };
}
function add(id: string, family: string, n: number, finalTransform: Transform, group = 'rear', offset: Vec3 = [0, 0, 0], e?: PlacementEvidence): PartInstance {
  const [geometryId, color, name, category] = families[family]!;
  const p: PartInstance = {
    id: `rear-${id}`, geometryId, materialId: `ldraw-${color}`, name, finalTransform,
    initialTransform: { ...finalTransform, position: [110 + (parts.length % 8) * 22, 0, 110 + Math.floor(parts.length / 8) * 22] },
    connectionPoints: [], subassemblyId: group, sourceReference: source(n), geometryConfidence: 0.93, inventoryScope: 'robot', category,
    identityEvidence: evidence('diagram-derived', `${name}; genuine ${geometryId}.dat selected from source shape, not a certified 2019 element/mold identifier.`, [source(n), cad(geometryId, 'Native LDraw root')]),
    placementEvidence: e ?? fit(n, 'Source topology registered to native holes and pin/axle axes; fit remains unchecked.', [geometryId])
  };
  parts.push(p); familyByPartId[p.id] = family; introduced.set(p.id, n); preparedOffset.set(p.id, offset);
  const members = groupMembers.get(group) ?? []; members.push(p.id); groupMembers.set(group, members);
  return p;
}
const get = (id: string): PartInstance => {
  const p = parts.find((p) => p.id === (id.startsWith('rear-') ? id : `rear-${id}`));
  if (!p) throw new Error(`Unknown rear part ${id}`);
  return p;
};
// Native module axes are motor axes. No asset is recentered or rescaled.
add('lower-rail-1', 'black-beam9', 1, pose([-20, 40, 60], rz), 'rear', [0, 0, 0], railFit);
for (const [i, z] of [0, 120].entries()) add(`bridge-${i + 1}`, 'grey-pinbeam3', 1, pose([0, 40, z], bridge), 'rear', [0, 0, 0], railFit);
add('lower-rail-2', 'black-beam9', 2, pose([20, 40, 60], rz), 'rear', [0, 0, 0], railFit);
for (const [i, z] of [-20, 140].entries()) add(`lower-up-pin-${i + 1}`, 'black-pin2', 3, pose([0, 30, z], rz));
for (const [i, x] of [-30, 30].entries()) for (const [j, z] of [40, 80].entries()) add(`lower-side-pin-${i + 1}-${j + 1}`, 'black-pin2', 4, pose([x, 40, z]));
add('motor', 'medium-motor', 5, pose([0, 0, 0]), 'rear', [0, 0, 0], motorFit);
for (const [i, z] of [-20, 140].entries()) for (const [j, y] of [-20, 20].entries()) add(`housing-pin-${i + 1}-${j + 1}`, 'black-pin2', 6, pose([-30, y, z]));
const bracketOffset: Vec3 = [-90, 25, 20];
add('biscuit', 'pink-connector3', 7, pose([0, -40, 60]), 'rear-bracket', bracketOffset);
for (const [i, x] of [-30, 30].entries()) for (const [j, z] of [40, 80].entries()) add(`biscuit-pin-${i + 1}-${j + 1}`, 'black-pin2', 7, pose([x, -40, z]), 'rear-bracket', bracketOffset);
add('bracket-frame-1', 'grey-iframe3x5', 8, pose([-40, 0, 60], vertical), 'rear-bracket', bracketOffset);
add('bracket-frame-2', 'grey-iframe3x5', 10, pose([40, 0, 60], vertical));
const connectorOffsets: Vec3[] = [[90, 0, -50], [90, 0, -20], [90, 0, 10], [90, 0, 40]];
for (const [i, z] of [-20, 140].entries()) for (const [j, y] of [-20, 20].entries()) {
  const k = i * 2 + j + 1, group = `rear-extended-${k}`, delta = connectorOffsets[k - 1]!;
  add(`extended-gray-${k}`, 'grey-pin3cross', 11, pose([60, y, z]), group, delta);
  add(`extended-blue-${k}`, 'blue-pin3', 11, pose([20, y, z], q([0, 1, 0], Math.PI)), group, delta);
}
for (const [i, y] of [-20, 20].entries()) add(`outer-rail-${i + 1}`, 'black-beam9', 13, pose([60, y, 60], rz));
const clipOffset: Vec3 = [80, 25, 60];
add('rail-clip', 'azur-wireclip', 14, pose([80, 20, 60], q([0, 1, 0], Math.PI / 2)), 'rear-rail-clip-unit', clipOffset);
add('rail-clip-pin', 'blue-pin3', 14, pose([60, 20, 60], q([0, 1, 0], Math.PI)), 'rear-rail-clip-unit', clipOffset);
for (const [i, z] of [-20, 140].entries()) {
  const group = `rear-mount-${i + 1}`, delta: Vec3 = [-100, 25, i * 55];
  const lowerZ = i === 0 ? z - 20 : z + 20;
  const upperZ = i === 0 ? z + 20 : z - 20;
  add(`white-lower-${i + 1}`, 'white-doublecross', 16, pose([-60, -40, lowerZ], vertical), group, delta);
  for (const [j, x] of [-80, -40].entries()) add(`yellow-shaft-${i + 1}-${j + 1}`, 'yellow-axle3', 16, pose([x, -40, z], ry), group, delta);
  add(`mount-frame-${i + 1}`, 'grey-iframe3x5', 17, pose([-40, 0, z], hMount), group, delta);
  add(`mount-clip-${i + 1}`, 'azur-wireclip', 17, pose([-80, -40, z]), group, delta);
  // Source preparation names lower/upper; installed cap separation is along moduleZ.
  add(`white-upper-${i + 1}`, 'white-doublecross', 18, pose([-60, -40, upperZ], vertical), group, delta);
}
const beamOffset: Vec3 = [-80, 30, -85];
add('azur-rail-1', 'azur-beam13', 20, pose([-60, -20, 60]), 'rear-azur-rail-unit', beamOffset);
for (const [i, z] of [0, 120].entries()) add(`azur-rail-pin-${i + 1}`, 'blue-pin3', 20, pose([-60, -40, z], rz), 'rear-azur-rail-unit', beamOffset);
add('azur-rail-2', 'azur-beam13', 22, pose([-60, -60, 60]));
for (const [i, z] of [-40, 160].entries()) {
  const group = `rear-standoff-${i + 1}`, delta: Vec3 = [-60, 40, i * 50];
  add(`yellow-standoff-${i + 1}`, 'yellow-tube2', 23, pose([-60, -90, z], rz), group, delta);
  add(`standoff-bottom-pin-${i + 1}`, 'black-pin2', 23, pose([-60, -70, z], rz), group, delta);
  add(`standoff-top-pin-${i + 1}`, 'black-pin2', 23, pose([-60, -110, z], rz), group, delta);
}
const outputOffset: Vec3 = [80, 50, -70];
add('output-gear', 'grey-gear28', 25, pose([0, -60, 0], q([1, 0, 0], Math.PI / 2)), 'rear-output', outputOffset, outputFit);
for (const [i, z] of [-20, 20].entries()) add(`gear-pin-${i + 1}`, 'black-pin2', 25, pose([0, -50, z], rz), 'rear-output', outputOffset, outputFit);
const frameOffset: Vec3 = [0, 90, 50];
add('top-frame', 'pink-frame7x11', 27, pose([0, -120, 60]), 'rear-top-frame-unit', frameOffset, topFit);
for (const [i, z] of [20, 100].entries()) add(`red-interface-pin-${i + 1}`, 'red-axlepin3', 27, pose([-80, -120, z]), 'rear-top-frame-unit', frameOffset);
for (const [i, z] of [-20, 140].entries()) add(`top-upright-pin-${i + 1}`, 'grey-axlepin2', 28, pose([80, -120, z]), 'rear-top-frame-unit', frameOffset);
for (const [i, z] of [-20, 140].entries()) {
  const group = `rear-upright-unit-${i + 1}`, delta: Vec3 = [100, 35, i * 60];
  add(`upright-${i + 1}`, 'azur-beam7', 30, pose([80, -60, z], vertical), group, delta);
  add(`upright-axle-${i + 1}`, 'grey-axlepin2', 30, pose([100, 0, z]), group, delta);
}

const operationIds = new Map<number, string[]>();
function record(op: AssemblyOperation): void {
  operations.push(op);
  const n = Number(op.stepId.split('step')[1]);
  operationIds.set(n, [...(operationIds.get(n) ?? []), op.id]);
}
function introduce(p: PartInstance, n: number, axis?: Vec3, depthMm?: number): void {
  const prepared = p.subassemblyId?.startsWith('rear-mount-') ? composeTransforms(pose([0, 0, 0], q([1, 0, 0], p.subassemblyId === 'rear-mount-1' ? Math.PI / 2 : -Math.PI / 2)), p.finalTransform) : p.finalTransform;
  const target = shifted(prepared, preparedOffset.get(p.id)!);
  const previous = operations.filter((op) => Number(op.stepId.split('step')[1]) < n).at(-1);
  const op = mountPart({ ...p, finalTransform: target }, { id: `rear-install-${p.id.slice(5)}`, stepId: stepId(4, n), sourceReference: source(n), startMs: 0, durationMs: 2600, dependencies: previous ? [previous.id] : [], cameraPreset: camera(n), ...(axis ? { axis, depthMm } : {}) });
  record(op); operationPose.set(p.id, target);
  installations.push({ partInstanceId: p.id, stepId: op.stepId, atMs: op.durationMs, operationId: op.id });
}
function transfer(n: number, groups: string[], axis: Vec3, depthMm: number, e: PlacementEvidence): void {
  const ids = groups.flatMap((g) => groupMembers.get(g) ?? []);
  const members = ids.map(get), from = members.map((p) => operationPose.get(p.id)!), to = members.map((p) => p.finalTransform);
  const aligned = to.map((t) => shifted(t, axis.map((a) => -a * depthMm) as Vec3));
  const id = `rear-join-step${n}`;
  record({ id, stepId: stepId(4, n), operationType: 'merge-subassemblies', partInstanceIds: ids, fromTransforms: from, toTransforms: to, durationMs: 3000, startMs: 0, easing: 'smoothstep', dependencies: operations.filter((op) => op.partInstanceIds.some((id) => ids.includes(id))).map((op) => op.id), cameraPreset: camera(n), sourceReference: source(n), parentChanges: [], evidence: e,
    stages: [
      { id: `${id}-approach`, startMs: 0, durationMs: 1800, phase: 'approach', nodes: ids.map((id) => ({ kind: 'part' as const, id })), fromTransforms: from, toTransforms: aligned, trajectory: { type: 'linear' }, easing: 'smoothstep', evidence: presentation },
      { id: `${id}-seat`, startMs: 1800, durationMs: 1200, phase: 'insert', nodes: ids.map((id) => ({ kind: 'part' as const, id })), fromTransforms: aligned, toTransforms: to, trajectory: { type: 'linear' }, easing: 'smoothstep', insertion: { axis, depthMm }, evidence: e }
    ] });
  members.forEach((p) => operationPose.set(p.id, p.finalTransform));
}
for (let n = 1; n <= 31; n++) {
  for (const p of parts.filter((p) => introduced.get(p.id) === n)) {
    let axis: Vec3 | undefined;
    if (p.geometryId === '2780') axis = p.id.includes('standoff-bottom') ? [0, 1, 0] : p.id.includes('standoff-top') || p.id.includes('gear-pin') || p.id.includes('up-pin') ? [0, -1, 0] : p.finalTransform.position[0] > 0 ? [-1, 0, 0] : [1, 0, 0];
    if (p.geometryId === '4519' || p.id.includes('white-upper') || p.id.includes('mount-clip') || p.id.includes('mount-frame') || p.geometryId === '54696p01') axis = [0, -1, 0];
    if (p.geometryId === '6558') axis = p.id.includes('azur-rail-pin') ? [0, -1, 0] : [1, 0, 0];
    if (p.geometryId === '18651' || p.id.includes('outer-rail') || p.id === 'rear-lower-rail-2' || p.geometryId === '48989') axis = [-1, 0, 0];
    if (p.geometryId === '11214' || p.id === 'rear-bracket-frame-1') axis = [1, 0, 0];
    if (p.id === 'rear-bracket-frame-2') axis = [-1, 0, 0];
    if (p.id === 'rear-azur-rail-2') axis = [0, -1, 0];
    introduce(p, n, axis, axis ? 8 : undefined);
  }
  if (n === 9) transfer(n, ['rear-bracket'], [0, -1, 0], 8, motorFit);
  if (n === 12) transfer(n, [1, 2, 3, 4].map((k) => `rear-extended-${k}`), [-1, 0, 0], 16, fit(n, 'Reuse the four prepared coaxial6558/32054 units. Blue long half enters the motor40LDU; stop bush spans moduleX30..50; gray shaft spans50..90.', ['54696p01', '6558', '32054']));
  if (n === 15) transfer(n, ['rear-rail-clip-unit'], [-1, 0, 0], 16, fit(n, 'Reuse the medium azure clip unit. The blue short half occupies the clip bore; its40LDU long half enters the lower black rail and intervening clearance toward the housing. Guide the captive lead as illustrated; no extra cable BOM item.', ['49283', '6558', '40490']));
  if (n === 19) transfer(n, ['rear-mount-1', 'rear-mount-2'], [1, 0, 0], 8, fit(n, 'Reuse both white axle-supported H-frame mounting brackets at the motor end mounts.', ['14720', '32184', '4519', '54696p01']));
  if (n === 21) transfer(n, ['rear-azur-rail-unit'], [0, 1, 0], 16, fit(n, 'Raise the prepared lower thirteen-hole rail; blue long halves enter the inner white-cap vertical center bores, leaving their upper halves for the second rail.', ['41239', '6558', '32184']));
  if (n === 24) transfer(n, ['rear-standoff-1', 'rear-standoff-2'], [0, -1, 0], 8, topFit);
  if (n === 26) transfer(n, ['rear-output'], [0, -1, 0], 8, outputFit);
  if (n === 29) transfer(n, ['rear-top-frame-unit'], [0, -1, 0], 8, topFit);
  if (n === 31) transfer(n, ['rear-upright-unit-1', 'rear-upright-unit-2'], [-1, 0, 0], 8, fit(n, 'Change viewing side and install the prepared uprights over the exposed upper18651 axles and lower32054 pin shafts. The bottom18651 shafts stay perpendicular to beam length.', ['32524', '18651', '39794', '32054']));
}

// Each endpoint is retained in its own CAD-local frame, never a bounding-box contact.
function point(p: PartInstance, id: string, type: ConnectionPoint['type'], nativePosition: Vec3, e: PlacementEvidence): ConnectionPoint {
  const result: ConnectionPoint = { id: `rear-${id}`, type, localTransform: pose(nativePosition), evidence: e };
  p.connectionPoints.push(result); return result;
}
function nativeBoreOrientation(p: PartInstance, position: Vec3): Quaternion {
  if (p.geometryId === '46372' || p.geometryId === '49283' || (p.geometryId === '48989' && Math.abs(position[2]) === 10)) return q([1, 0, 0], Math.PI / 2);
  if (p.geometryId === '54696p01') return position[1] === 30 || position[1] === -50 ? [0, 0, 0, 1] : rz;
  if (p.geometryId === '14720') return Math.abs(position[2]) === 40 ? [0, 0, 0, 1] : rz;
  if (p.geometryId === '39794') return position[1] === 0 ? rz : [0, 0, 0, 1];
  if (p.geometryId === '32184') return position[2] === 0 ? rz : q([1, 0, 0], Math.PI / 2);
  if (['2780', '6558', '32054', '18651', '11214', '62462', '48989', '4519', '39793'].includes(p.geometryId)) return rz;
  return [0, 0, 0, 1];
}
function mateNative(id: string, aId: string, aPosition: Vec3, bId: string, bPosition: Vec3, n: number, type: Connection['type'] = 'fixed'): void {
  const a = get(aId), b = get(bId), e = fit(n, 'Manual mating relationship; local positions are native bore/seat features. Unchecked selected hole registration is explicitly not fit verification.', [a.geometryId, b.geometryId]);
  const ap: ConnectionPoint = { id: `rear-${id}-a`, type: 'hole', localTransform: pose(aPosition, nativeBoreOrientation(a, aPosition)), evidence: e };
  const bp: ConnectionPoint = { id: `rear-${id}-b`, type: 'pin', localTransform: pose(bPosition, nativeBoreOrientation(b, bPosition)), evidence: e };
  const commit = operations.find((op) => op.stepId === stepId(4, n) && (op.partInstanceIds.includes(b.id) || op.partInstanceIds.includes(a.id)));
  if (!commit) throw new Error(`Rear mate ${id}: source step ${n} has no endpoint operation`);
  connections.push(addMate(a, ap, b, bp, { id: `rear-${id}`, type, installedByOperationId: commit.id, evidence: e }));
}
for (const [i, z] of [0, 120].entries()) for (const [j, rail] of ['lower-rail-1', 'lower-rail-2'].entries()) for (const k of [-20, 20]) {
  mateNative(`bridge-${i + 1}-rail-${j + 1}-${k < 0 ? 'a' : 'b'}`, rail, [0, j === 0 ? 10 : -10, z + k - 60], `bridge-${i + 1}`, [0, k, j === 0 ? 10 : -10], j === 0 ? 1 : 2);
}
for (const [i, z] of [-20, 140].entries()) {
  mateNative(`lower-pin-seat-${i + 1}`, `bridge-${i + 1}`, [10, i === 0 ? -20 : 20, 0], `lower-up-pin-${i + 1}`, [0, 0, 0], 3);
  mateNative(`motor-lower-${i + 1}`, 'motor', [0, 30, z], `lower-up-pin-${i + 1}`, [0, 0, 0], 5);
  mateNative(`upright-top-${i + 1}`, 'top-frame', [70, 0, z - 60], `top-upright-pin-${i + 1}`, [-10, 0, 0], 28);
  mateNative(`upright-pin-${i + 1}`, `upright-${i + 1}`, [0, -10, -60], `top-upright-pin-${i + 1}`, [-10, 0, 0], 31);
  mateNative(`upright-shaft-${i + 1}`, `upright-${i + 1}`, [0, 10, 60], `upright-axle-${i + 1}`, [-10, 0, 0], 30);
  mateNative(`gear-drive-${i + 1}`, 'motor', [0, -50, i === 0 ? -20 : 20], `gear-pin-${i + 1}`, [0, 0, 0], 26, 'pivot');
  mateNative(`gear-pin-seat-${i + 1}`, 'output-gear', [0, i === 0 ? -20 : 20, -10], `gear-pin-${i + 1}`, [0, 0, 0], 25);
}
for (const [i, side] of [-1, 1].entries()) for (const [j, z] of [40, 80].entries()) {
  const rail = `lower-rail-${i + 1}`, frame = `bracket-frame-${i + 1}`;
  mateNative(`lower-side-seat-${i + 1}-${j + 1}`, rail, [0, side * 10, z - 60], `lower-side-pin-${i + 1}-${j + 1}`, [0, 0, 0], 4);
  mateNative(`bracket-lower-seat-${i + 1}-${j + 1}`, frame, [z - 60, -side * 10, 40], `lower-side-pin-${i + 1}-${j + 1}`, [0, 0, 0], i === 0 ? 9 : 10);
  mateNative(`biscuit-pin-seat-${i + 1}-${j + 1}`, 'biscuit', [side * 30, 0, z - 60], `biscuit-pin-${i + 1}-${j + 1}`, [0, 0, 0], 7);
  mateNative(`bracket-upper-seat-${i + 1}-${j + 1}`, frame, [z - 60, -side * 10, -40], `biscuit-pin-${i + 1}-${j + 1}`, [0, 0, 0], i === 0 ? 8 : 10);
}
for (const [i, z] of [-20, 140].entries()) for (const [j, y] of [-20, 20].entries()) {
  const k = i * 2 + j + 1;
  mateNative(`extended-coaxial-${k}`, `extended-gray-${k}`, [-30, 0, 0], `extended-blue-${k}`, [-10, 0, 0], 11);
  mateNative(`extended-motor-${k}`, 'motor', [30, y, z], `extended-blue-${k}`, [-10, 0, 0], 12);
  mateNative(`extended-rail-${k}`, `outer-rail-${j + 1}`, [0, -10, z - 60], `extended-gray-${k}`, [-10, 0, 0], 13);
  if (j === 0) mateNative(`extended-upright-${k}`, `upright-${i + 1}`, [0, -10, 40], `extended-gray-${k}`, [10, 0, 0], 31);
  mateNative(`housing-seat-${k}`, 'motor', [-30, y, z], `housing-pin-${i + 1}-${j + 1}`, [0, 0, 0], 6);
}
for (const i of [1, 2]) {
  const sign = i === 1 ? 1 : -1;
  for (const [j, nativeY] of [-20, 20].entries()) {
    mateNative(`white-lower-shaft-${i}-${j + 1}`, `white-lower-${i}`, [sign * 10, nativeY, 0], `yellow-shaft-${i}-${j + 1}`, [-sign * 10, 0, 0], 16);
    mateNative(`white-upper-shaft-${i}-${j + 1}`, `white-upper-${i}`, [-sign * 10, nativeY, 0], `yellow-shaft-${i}-${j + 1}`, [sign * 10, 0, 0], 18);
  }
  mateNative(`h-frame-shaft-${i}`, `mount-frame-${i}`, [0, 10, -40], `yellow-shaft-${i}-2`, [-10, 0, 0], 17);
  mateNative(`clip-shaft-${i}`, `mount-clip-${i}`, [0, 0, -10], `yellow-shaft-${i}-1`, [-10, 0, 0], 17);
  for (const [j, y] of [-20, 20].entries()) mateNative(`housing-h-frame-${i}-${j + 1}`, `mount-frame-${i}`, [10, 0, y], `housing-pin-${i}-${j + 1}`, [0, 0, 0], 19);
  mateNative(`rail-white-center-${i}`, `white-upper-${i}`, [0, 0, 10], `azur-rail-pin-${i}`, [-10, 0, 0], 21);
  mateNative(`rail-lower-pin-${i}`, 'azur-rail-1', [0, -10, i === 1 ? -60 : 60], `azur-rail-pin-${i}`, [-10, 0, 0], 20);
  mateNative(`rail-upper-pin-${i}`, 'azur-rail-2', [0, 10, i === 1 ? -60 : 60], `azur-rail-pin-${i}`, [10, 0, 0], 22);
}
for (const [i, z] of [-40, 160].entries()) {
  mateNative(`standoff-bottom-seat-${i + 1}`, `yellow-standoff-${i + 1}`, [-20, 0, 0], `standoff-bottom-pin-${i + 1}`, [0, 0, 0], 23);
  mateNative(`standoff-top-seat-${i + 1}`, `yellow-standoff-${i + 1}`, [20, 0, 0], `standoff-top-pin-${i + 1}`, [0, 0, 0], 23);
  mateNative(`standoff-upper-rail-${i + 1}`, 'azur-rail-2', [0, -10, z - 60], `standoff-bottom-pin-${i + 1}`, [0, 0, 0], 24);
  mateNative(`top-frame-standoff-${i + 1}`, 'top-frame', [-60, 10, z - 60], `standoff-top-pin-${i + 1}`, [0, 0, 0], 29);
}
for (const [i, z] of [20, 100].entries()) mateNative(`red-frame-interface-${i + 1}`, 'top-frame', [-70, 0, z - 60], `red-interface-pin-${i + 1}`, [10, 0, 0], 27);
for (const i of [1, 2]) {
  const rail = get(`azur-rail-${i}`);
  for (const z of [-100, -60, 60, 100]) point(rail, `rail-${i}-native-hole-${z}`, 'hole', [0, -10, z], fit(22, 'Actual41239 pin/standoff candidate bores at nativeZ±60/±100, through-axisY. Selected source/world registration remains unchecked.', ['41239']));
}
mateNative('rail-clip-bush', 'rail-clip', [0, 0, -10], 'rail-clip-pin', [-10, 0, 0], 14);
mateNative('rail-clip-beam', 'outer-rail-2', [0, 10, 0], 'rail-clip-pin', [-10, 0, 0], 15);
// The output bearing is the actual internal rotor; the body remains a structural part.
point(get('motor'), 'output-bearing', 'axle-hole', [0, -50, 0], outputFit);
point(get('motor'), 'captive-lead', 'electrical', [0, 0, 143], motorFit);
const attachmentSites: BuildFragment['attachmentSites'] = {};
attachmentSites['motor-electrical'] = { partInstanceId: 'rear-motor', connectionPointId: 'rear-captive-lead', description: 'Actual captive motor cable stub native(0,0,143); no separate cable inventory instance.', sourceReference: source(15) };
for (const i of [1, 2]) for (const [name, nativeZ] of [['upper', -40], ['lower', 0]] as const) {
  const p = get(`upright-${i}`), cp = point(p, `side-receiver-${i}-${name}`, 'hole', [0, 10, nativeZ], fit(31, 'Actual32524 through bore: long nativeZ pitch20, nativeY faces±10. Available inspection feature; no Book5 correspondence asserted.', ['32524']));
  attachmentSites[`side-receiver-${i}-${name}`] = { partInstanceId: p.id, connectionPointId: cp.id, description: 'Available seven-hole upright bore; not an asserted Book5 receiver.', sourceReference: source(31) };
}
for (const [i, z] of [20, 100].entries()) {
  const p = get('top-frame'), cp = point(p, `upper-frame-bore-${i + 1}`, 'hole', [-70, 0, z - 60], topFit);
  cp.localTransform = pose([-70, 0, z - 60], rz);
  attachmentSites[`upper-frame-bore-${i + 1}`] = { partInstanceId: p.id, connectionPointId: cp.id, description: '39794 opposite longitudinal side bore; nativeX axis,20LDU deep, not a stud or arbitrary surface.', sourceReference: source(27) };
}
for (const i of [1, 2]) {
  const p = get(`top-upright-pin-${i}`), cp = point(p, `hub-axle-${i}`, 'axle', [10, 0, 0], fit(28, 'Book4 p28 and p30 use genuine18651 axle2/pin1, not2780. The upper exposed axle passes the upright and enters a Book5 hub side bore.', ['18651']));
  cp.localTransform = pose([10, 0, 0], rz);
  attachmentSites[`hub-axle-${i}`] = { partInstanceId: p.id, connectionPointId: cp.id, description: 'Exposed top axle after the upright; nativeX axis. Book5 instruction9/PDF12 top arrows lead to hub side bores.', sourceReference: { documentId: advancedDrivingBaseDocuments[4]!.id, page: 12, instructionId: '9', sourceUrl: `${advancedDrivingBaseDocuments[4]!.sourceUrl}#page=12`, confidence: 0.95 } };
  const rail = get('azur-rail-1'), end = point(rail, `azur-end-${i}`, 'hole', [0, -10, i === 1 ? -120 : 120], fit(22, 'True41239 endpoint bore: nativeZ±120, nativeY face-10. Endpoint span240LDU=96mm.', ['41239']));
  attachmentSites[`azur-end-${i}`] = { partInstanceId: rail.id, connectionPointId: end.id, description: 'Actual13-beam endpoint bore;96mm center span, not the64mm upright span. Book5 correspondence remains to be fit-registered.', sourceReference: source(22) };
  const upperRail = get('azur-rail-2'), upperEnd = point(upperRail, `azur-upper-end-${i}`, 'hole', [0, -10, i === 1 ? -120 : 120], fit(22, 'True41239 upper-rail endpoint; nativeY bore axis, same96mm end span and40LDU stacked rail separation.', ['41239']));
  attachmentSites[`azur-upper-end-${i}`] = { partInstanceId: upperRail.id, connectionPointId: upperEnd.id, description: 'Actual stacked upper thirteen-hole rail end bore; no Book5 axis/orientation correspondence asserted.', sourceReference: source(22) };
  const mount = get(`mount-frame-${i}`);
  for (const [endName, nativeZ] of [['a', -40], ['b', 40]] as const) {
    const bore = point(mount, `mount-end-${i}-${endName}`, 'hole', [-20, -10, nativeZ], fit(19, 'Actual14720 outer three-hole crossbar at nativeZ±40; bore nativeY. Selected source bracket registration remains unchecked.', ['14720']));
    attachmentSites[`mount-end-${i}-${endName}`] = { partInstanceId: mount.id, connectionPointId: bore.id, description: 'Native H-frame crossbar end bore. Do not infer that current diagram registration is independently fit-verified.', sourceReference: source(19) };
  }
  for (const [endName, nativeZ] of [['top', -40], ['bottom', 40]] as const) for (const nativeX of [-20, 0, 20]) for (const nativeY of [-10, 10]) {
    if ((nativeZ === -40 && nativeX === 0) || (nativeX === -20 && nativeY === -10)) continue;
    const key = `mount-free-${i}-${endName}-${nativeX}-${nativeY}`;
    const bore = point(mount, key, 'hole', [nativeX, nativeY, nativeZ], fit(19, 'Actual free14720 end-crossbar nativeY through bore. Upper middle bore is occupied by the yellow shaft and excluded.', ['14720']));
    attachmentSites[key] = { partInstanceId: mount.id, connectionPointId: bore.id, description: 'Free native H-frame crossbar bore; source/native Book5 mapping remains unresolved.', sourceReference: source(19) };
  }
  for (const [height, nativeZ] of [['upper', -20], ['lower', 20]] as const) {
    const bore = point(mount, `mount-spine-${i}-${height}`, 'hole', [-10, 0, nativeZ], fit(19, 'Actual14720 central-spine bores normal nativeX. Their other ends receive motor housing pins; these are not asserted free Book5 receivers.', ['14720']));
    bore.localTransform = pose([-10, 0, nativeZ], rz);
    attachmentSites[`mount-spine-${i}-${height}`] = { partInstanceId: mount.id, connectionPointId: bore.id, description: 'Native central-spine bore already occupied by a motor housing pin. Book5 drive-side receiver registration remains explicitly unresolved.', sourceReference: source(19) };
  }
}
const descriptions = [
  'Prepare the first nine-hole rail with two gray integral-pin bridge blocks.', 'Close the lower parallel rail pair.', 'Insert the two upward-facing black pins.', 'Fit four lateral pins to the lower rails.', 'Seat and index the medium angular motor.', 'Fit four motor-housing pins.', 'Prepare the magenta connector and four black pins.', 'Attach the first H-frame to the prepared connector.', 'Install the prepared bracket over the motor.', 'Change camera side and install the opposite H-frame.', 'Prepare four blue/gray coaxial stop-bush units.', 'Install the four prepared connector units.', 'Install two outer nine-hole black rails.', 'Prepare the medium azure cable-clip unit.', 'Install the clip and guide the captive motor lead.', 'Prepare two white cross blocks with four yellow three-module shafts.', 'Fit H-frames and medium azure clips to the two mounts.', 'Close both mounts with the second pair of WHITE cross blocks.', 'Install both prepared mounting brackets.', 'Prepare the thirteen-hole medium azure rail and its two pins.', 'Install the prepared thirteen-hole rail.', 'Install the second parallel thirteen-hole rail.', 'Prepare two yellow standoffs with pins at both ends.', 'Install the two prepared standoffs.', 'Prepare the output gear with two black pins.', 'Seat the output gear on the indexed medium rotor.', 'Prepare the magenta frame with two red axle/pins.', 'Add two gray axle2/pin1 connectors on the opposite frame side.', 'Install the prepared top frame on its supports.', 'Prepare two seven-hole uprights with bottom transverse axle/pins.', 'Change camera side and install both uprights.'
];
const reuseSteps = new Set([9, 12, 15, 19, 21, 24, 26, 29, 31]);
const steps: AssemblyStep[] = descriptions.map((description, index) => {
  const n = index + 1;
  return { id: stepId(4, n), title: `Rear module · ${n}`, description, kind: 'numbered-instruction', action: reuseSteps.has(n) ? 'reuse' : 'assembly', sourceReferences: [source(n)], operationIds: operationIds.get(n)!, requiredPartInstanceIds: parts.filter((p) => introduced.get(p.id) === n).map((p) => p.id), warnings: n === 18 ? ['Use the two white axle/pin/axle cross blocks shown in the manual, not gray cross blocks.'] : [], durationMs: 3300, cameraPreset: camera(n) };
});
const subassemblies: BuildFragment['subassemblies'] = [...groupMembers].map(([id, ids]) => ({ id, name: id === 'rear' ? 'Rear structural module' : id.replaceAll('-', ' '), ...(id === 'rear' ? {} : { parentId: 'rear' }), localTransform: identityTransform(), partInstanceIds: ids, childSubassemblyIds: id === 'rear' ? [...groupMembers.keys()].filter((key) => key !== 'rear') : [], evidence: id === 'rear-output' ? outputFit : motorFit }));
export const rear: BuildFragment = {
  rootId: 'rear', parts, steps, operations, installations, visibility: [], subassemblies, connections,
  joints: [{ id: 'rear-output-joint', name: 'Rear medium rotor and pinned output gear', type: 'revolute', parent: { kind: 'part', id: 'rear-motor' }, child: { kind: 'subassembly', id: 'rear-output' }, origin: pose([0, -50, 0]), childTransform: pose([0, 50, 0]), axis: [0, 1, 0], zero: 0, drivenByMotorId: 'rear-output-motor', internalBinding: { partInstanceId: 'rear-motor', geometryNodeId: 'parts/u9363p01.dat', movingSide: 'rotor' }, evidence: outputFit }],
  linkageConstraints: [], motors: [{ id: 'rear-output-motor', partInstanceId: 'rear-motor', port: 'C', jointId: 'rear-output-joint', assignmentEvidence: evidence('documented', 'Book5 instruction4/PDF7 assigns the Rear medium motor to hub port C.', [{ documentId: advancedDrivingBaseDocuments[4]!.id, page: 7, instructionId: '4', sourceUrl: `${advancedDrivingBaseDocuments[4]!.sourceUrl}#page=7`, confidence: 0.98 }]) }],
  cables: [],
  inventory: Object.entries(families).map(([family, [, , name]]) => ({ id: `rear-inventory-${family}`, name, scope: 'robot' as const, basis: 'prepared-callout-units' as const, accounting: 'tracked' as const, quantity: parts.filter((p) => familyByPartId[p.id] === family).length, partInstanceIds: parts.filter((p) => familyByPartId[p.id] === family).map((p) => p.id), sourceReferences: [...new Set(parts.filter((p) => familyByPartId[p.id] === family).map((p) => introduced.get(p.id)!))].map(source) })),
  milestones: [{ id: 'rear-lower-rails', title: 'Rear lower rail and motor mount', stepId: stepId(4, 6) }, { id: 'rear-output-ready', title: 'Rear motor output', stepId: stepId(4, 26) }, { id: 'rear-module-authored', title: 'Rear module', stepId: stepId(4, 31) }],
  sourceMappings: operations.map((op) => ({ source: op.sourceReference!, stepId: op.stepId, operationId: op.id })), attachmentSites, familyByPartId
};
