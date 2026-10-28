import research from '../../../docs/research/data/package-sorter.json' with { type: 'json' };
import crosswalk from '../../../docs/research/data/lego-part-crosswalk.json' with { type: 'json' };
import measuredBounds from '../../../docs/validation/component-bounds.json' with { type: 'json' };
import { geometryAssetsFor, materials, sourceDocumentsFor } from '../geometry/library.ts';
import { composeTransforms, identityTransform, quaternionFromAxisAngle, quaternionMultiply, relativeTransform } from '../core/transforms.ts';
import { addMate, evidence, mountPart, nativeLDrawTransform, placement } from './authoring.ts';
import type { AssemblyOperation, AssemblyStep, CameraPreset, Connection, Joint, MotorCommand, PartInstance, PlacementEvidence, Quaternion, RobotModel, SimulationScenario, SourceReference, Subassembly, Transform, Vec3 } from '../types/model.ts';

/** Canonical index PDFs, not the incompatible 18-step/156-unit 2021 edition. */
const documents = research.documents;
const reference = (documentId: string, page: number, step?: number): SourceReference => ({ documentId, page, instructionId: step === undefined ? undefined : String(step), sourceUrl: documents.find((value) => value.id === documentId)!.sourceUrl, confidence: 0.98 });
const sourceSteps = documents.flatMap((document) => document.steps.map((step) => ({ ...step, documentId: document.id })));
const camera: CameraPreset = { position: [360, 300, 420], target: [0, 65, -12], up: [0, 1, 0], projection: 'perspective', framing: 42, transitionMs: 400 };
const cameraFor = (target: Vec3): CameraPreset => ({
  ...camera,
  target,
  position: [camera.position[0] + target[0] - camera.target[0], camera.position[1] + target[1] - camera.target[1], camera.position[2] + target[2] - camera.target[2]]
});
const q = (x = 0, y = 0, z = 0): Quaternion => quaternionMultiply(quaternionMultiply(quaternionFromAxisAngle([0, 0, 1], z * Math.PI / 180), quaternionFromAxisAngle([0, 1, 0], y * Math.PI / 180)), quaternionFromAxisAngle([1, 0, 0], x * Math.PI / 180));
const native = (position: Vec3, rotation: Vec3 = [0, 0, 0]): Transform => nativeLDrawTransform(position, q(...rotation));
const numerical = evidence('diagram-derived', 'Hole-grid reconstruction from the cited manual view and unchanged native DAT origins. Exact historical mold, complete loop topology and assembled clearances await independent source-view comparison; not certified CAD assembly coordinates.', [], 0.65);
const fit = (source: SourceReference): PlacementEvidence => ({ ...placement(evidence('documented', 'Source assembly relationship and printed part callout.', [source]), numerical), placement: 'diagram-derived' });
const authored = evidence('app-authored', 'RoboBuild presentation work areas, inventory arrangement and timing; not LEGO engineering measurements.', [], 1);
const presentation = placement(authored, authored, true);

// All seats below are native LDU, retaining each component's real DAT origin.
// X transverse, -Y above platform, +Z toward the open front catch frame.
// A row is one actual research instance, never a mesh proxy or repeated sample.
type Seat = { pose: Transform; group: string };
const seats = new Map<string, Seat>();
function put(book: 'robot2019' | 'base2019' | 'packages2019', family: string, first: number, group: string, positions: Vec3[], rotation: Vec3 = [0, 0, 0]): void {
  positions.forEach((position, index) => seats.set(`${book}:${family}:${String(first + index).padStart(2, '0')}`, { pose: native(position, rotation), group }));
}
const R = 'robot2019', B = 'base2019', P = 'packages2019';
put(R, 'hub', 1, 'platform', [[0, 10, -300]]);
put(R, 'panel-yellow-11x19', 1, 'platform', [[0, 0, 0]]);
put(R, 'peg-black-friction', 1, 'platform', [[-40, 0, -190], [40, 0, -190]], [0, -90, 0]);
put(R, 'peg-black-friction', 3, 'platform', [[-40, -10, 20], [40, -10, 20], [-40, -10, 60], [40, -10, 60]], [0, 0, 90]);
put(R, 'peg-tan-axle', 1, 'platform', [[-80, -10, -100]], [0, 0, 90]);
put(R, 'clip-red', 1, 'platform', [[-80, -30, -100]], [0, 0, 90]);
put(R, 'peg-black-friction', 7, 'platform', [[-100, 0, 80], [-100, 0, 160], [100, 0, 80], [100, 0, 160]]);
put(R, 'peg-black-friction', 11, 'platform', [[-80, 0, 190], [80, 0, 190]], [0, 90, 0]);
put(R, 'frame-azure-11x15', 1, 'platform', [[0, 0, 340]]);
put(R, 'frame-magenta-7x11', 1, 'platform', [[-220, 0, 120], [220, 0, 120]], [0, 90, 0]);
put(R, 'beam-yellow-3', 1, 'supports', [[-40, -20, 120], [40, -20, 120]]);
put(R, 'peg-black-friction', 13, 'supports', [[-40, -10, 100], [-40, -10, 140], [40, -10, 100], [40, -10, 140]], [0, 0, 90]);
put(R, 'peg-black-knob', 1, 'platform', [[-100, -10, 480], [100, -10, 480]], [0, 0, 90]);
put(R, 'motor-large', 1, 'yaw-motor-mount', [[0, -40, 80]], [0, 180, 0]);
put(R, 'connector-gray-3-four-snaps', 1, 'yaw-motor-mount', [[-60, -40, 80], [60, -40, 80]], [0, 90, 0]);
put(R, 'angular-azure-3x5', 1, 'yaw-motor-mount', [[-60, -40, 120], [60, -40, 120]], [90, 0, 0]);
put(R, 'peg-black-friction', 17, 'yaw-output', [[-20, -90, 80], [20, -90, 80]], [0, 0, 90]);
put(R, 'biscuit-magenta', 1, 'yaw-output', [[0, -100, 80]]);
put(R, 'peg-blue-3-friction', 1, 'yaw-output', [[0, -110, 60], [0, -110, 100]], [0, 0, -90]);
for (const [side, first, group] of [[-1, 1, 'pedestal-left'], [1, 2, 'pedestal-right']] as const) {
  const x = side * 280;
  // R19: three-member blue-pin chain H/5L/outer39794 short rail.
  put(R, 'beam-magenta-5', first, group, [[side * 300, 0, 120]], [0, 0, 90]);
  put(R, 'peg-blue-3-friction', side === -1 ? 3 : 5, group, [[side * 300, 0, 80], [side * 300, 0, 160]], [0, side === -1 ? 180 : 0, 0]);
  put(R, 'iframe-gray-3x5', first, group, [[x, -20, 120]], [0, 0, 90]);
  put(R, 'connector-gray-3-four-snaps', first + 2, group, [[x, -40, 120]], [90, 0, 0]);
  put(R, 'connector-gray-3-four-snaps', first + 4, group, [[x, -120, 120]], [90, 0, 0]);
  put(R, 'biscuit-black', first, group, [[x, -80, 120]], [0, 0, 90]);
  put(R, 'biscuit-black', first + 2, group, [[x, -160, 120]], [0, 0, 90]);
  put(R, 'peg-tan-axle', side === -1 ? 2 : 4, group, [[x, -190, 100], [x, -190, 140]], [0, 0, -90]);
}
// Native motor basis: X -> Z, Y -> X, Z -> Y (the body stands upright).
const upright: Vec3 = [-90, -90, 0];
put(B, 'tbeam-black-3x3', 1, 'foot-left', [[-20, -170, 100]], [90, 0, 90]);
put(B, 'tbeam-black-3x3', 2, 'foot-right', [[20, -170, 100]], [90, 0, 90]);
put(B, 'peg-black-friction', 1, 'foot-left', [[-20, -190, 80], [-20, -190, 120]]);
put(B, 'peg-black-friction', 3, 'foot-right', [[20, -190, 80], [20, -190, 120]]);
put(B, 'motor-medium', 1, 'motor-frame', [[0, -310, 80]], upright);
put(B, 'frame-black-5x7', 1, 'yaw', [[0, -130, 80]]);
put(B, 'peg-gray', 1, 'yaw', [[-50, -130, 60], [-50, -130, 100]]);
put(B, 'frame-black-5x7', 2, 'upper-frame', [[0, -150, 80]]);
put(B, 'peg-gray', 3, 'upper-frame', [[-50, -150, 60], [-50, -150, 100], [50, -150, 60], [50, -150, 100]]);
put(B, 'peg-black-friction', 5, 'upper-frame', [[-40, -140, 20], [40, -140, 20], [-40, -140, 140], [40, -140, 140]], [0, 0, 90]);
put(B, 'axle-yellow-7', 1, 'drive', [[-100, -310, 80]]);
put(B, 'axle-gray-5', 1, 'drive', [[60, -310, 80]]);
// B2p14–17: the two5L body rails use the nativeX=−20 receiver rows.
put(B, 'beam-magenta-5', 1, 'side-supports', [[-20, -310, 40], [20, -310, 40]], [90, 0, 0]);
put(B, 'peg-black-friction', 9, 'side-supports', [[-20, -270, 30], [20, -270, 30]], [0, -90, 0]);
put(B, 'peg-black-friction', 11, 'side-supports', [[-20, -350, 50], [-20, -330, 50], [-20, -290, 50], [20, -350, 50], [20, -330, 50], [20, -290, 50]], [0, -90, 0]);
put(B, 'biscuit-magenta', 1, 'yaw', [[0, -270, 0], [0, -350, 80]], [0, 90, 0]);
put(B, 'gear-gray-28', 1, 'drive', [[-60, -310, 80]], [0, 90, 0]);
// B2p18–22: the gray pairs straddle the biscuit, not the 13L ends.
// Their inward pins enter the biscuit side bores; outward pins enter7L.
put(B, 'beam-azure-13', 1, 'arm-support', [[-20, -290, 180]], [0, 90, 0]);
put(B, 'peg-black-friction', 17, 'arm-support', [[-40, -300, 180], [0, -300, 180]], [0, 0, 90]);
put(B, 'biscuit-magenta', 3, 'arm-support', [[-20, -310, 180]]);
put(B, 'connector-gray-3-four-snaps', 1, 'arm-support', [[-60, -310, 180], [20, -310, 180]], [90, 0, 90]);
// B2p21–22: the rear round END hole slides over the transverse F shaft.
// These 7L beams stand on edge; their nativeY bores are not vertical.
put(B, 'beam-azure-7', 1, 'arm-support', [[-80, -310, 140], [40, -310, 140]], [0, 0, 90]);
// B2p26 keys each60483 cross passage onto the F shaft. NativeY is its
// axle axis; nativeZ points from the cross hole to the pictured upper round hole.
put(B, 'beam-azure-2-cross', 1, 'rod-left', [[-100, -310, 80]], [90, -90, 0]);
put(B, 'beam-azure-2-cross', 2, 'rod-right', [[60, -310, 80]], [90, -90, 0]);
// B2p26 rods run above the7L beams: both spheres face INWARD.
put(B, 'peg-black-friction', 19, 'rod-left', [[-90, -330, 80]], [0, 180, 0]);
put(B, 'peg-black-friction', 20, 'rod-right', [[50, -330, 80]]);
// Historical :19/:20 IDs are stable; their corrected research family is6628 towball, not2780.
put(B, 'rod-gray-6', 1, 'ball-link-left', [[-80, -330, 180]], [0, 180, 0]);
put(B, 'rod-gray-6', 2, 'ball-link-right', [[40, -330, 180]], [0, 180, 0]);
for (const [side, ordinal, crank, upper, dish, fork] of [[-1, 1, 'crank-left', 'upper-left', 'dish-left', 'fork-left'], [1, 2, 'crank-right', 'upper-right', 'dish-right', 'fork-right']] as const) {
  // First source cradle is beside the gray shaft, not the first fork's side.
  const mastX = -side * 20;
  put(B, 'angular-yellow-2x4', ordinal, crank, [[mastX, -290, 120]], [90, 180, 0]);
  put(B, 'peg-tan-axle', ordinal, crank, [[mastX, -290, 110]], [0, -90, 0]);
  put(B, 'peg-black-friction', ordinal + 20, crank, [[mastX, -310, 130]], [0, -90, 0]);
  put(B, 'peg-blue-3-friction', ordinal, crank, [[mastX, -350, 140]], [0, -90, 0]);
  // B2p36/p40/p44: central ROUND bore receives F, not the yellow blue pin.
  // First source module is on the gray-shaft side; second is on yellow.
  const bearingX = -20 - side * 100;
  put(B, 'double-cross-block-light', ordinal, upper, [[bearingX, -310, 80]], [0, 90, 0]);
  put(B, 'peg-tan-axle', ordinal === 1 ? 3 : 5, upper, [[bearingX, -330, 90], [bearingX, -290, 90]], [0, 90, 0]);
  put(B, 'angular-azure-3x5', ordinal, upper, [[bearingX, -330, 100]], side === -1 ? [-90, 180, 0] : [-90, 0, 0]);
  put(B, 'peg-black-friction', ordinal === 1 ? 23 : 25, upper, [[bearingX, -250, 110], [bearingX + side * 40, -250, 110]], [0, -90, 0]);
  // The white bearing is20LDU thick and sits outside60483 before the plate.
  put(B, 'plate-round-azure-2x2', ordinal, dish, [[-20 + side * 118, -310, 80]], [0, 0, side * 90]);
  put(B, 'dish-transparent-6x6', ordinal, dish, [[-20 + side * 126, -310, 80]], [0, 0, side * 90]);
  put(B, 'tile-round-black-2x2', ordinal, dish, [[-20 + side * 134, -310, 80]], [0, 0, side * 90]);
  // B2p49 white lies BELOW13L and extends40LDU FORWARD, not inwardX.
  // B2p52 uses front-row40/−80, leaving the top-row ball40LDU aft.
  put(B, 'double-cross-block-light', ordinal + 2, `fork-pivot-${ordinal}`, [[-20 + side * 120, -270, 200]], [90, 0, 90]);
  put(B, 'axle-black-2-snap', ordinal, `fork-pivot-${ordinal}`, [[-20 + side * 120, -290, 180]], [0, 0, 90]);
  // B2p52/56: short bend goes from panel front rowY−40 toward spineY0,
  // placing the black tip inside the panel outline, not outside atY−72.
  put(B, 'angular-yellow-3x7', ordinal, fork, [[-20 + side * 120, -290, 220]], [0, 0, side === -1 ? 0 : 180]);
  put(B, 'peg-black-friction', ordinal + 30, fork, [[-20 + side * 120, -300, 340]], [0, 0, 90]);
  put(B, 'axle-red-2', ordinal, fork, [[-20 + side * 88, -300, 364]], [0, 0, 90]);
  put(B, 'angle-black-180', ordinal, fork, [[-20 + side * 88, -330, 364]], [90, 0, 0]);
  put(B, 'axle-black-2-snap', ordinal + 2, fork, [[-20 + side * 120, -290, 220]], [0, 0, 90]);
  put(B, 'panel-azure-3x11x2', ordinal, fork, [[-20 + side * 80, -330, 260]], side === -1 ? [0, 0, -90] : [180, 0, -90]);
  put(B, 'peg-black-knob', ordinal, fork, [[-20 + side * 70, -330, 180]], [0, side === -1 ? 180 : 0, 0]);
}
put(B, 'beam-magenta-11', 1, 'upper-left', [[-20, -250, 120]], [90, 0, 90]);
// B2p42–44: black beams attach to yellow by black/blue pins, not the L cage.
put(B, 'beam-black-15', 1, 'crank-left', [[20, -450, 140]], [90, 0, 0]);
put(B, 'beam-black-15', 2, 'crank-right', [[-20, -450, 140]], [90, 0, 0]);
put(B, 'peg-black-friction', 27, 'yaw', [[-20, -360, 80], [20, -360, 80]], [0, 0, 90]);
put(B, 'peg-black-friction', 29, 'crank-left', [[20, -570, 150]], [0, -90, 0]);
put(B, 'peg-black-friction', 30, 'crank-right', [[-20, -570, 150]], [0, -90, 0]);
put(B, 'color-sensor', 1, 'yaw', [[0, -570, 160]], [0, 180, 0]);
put(B, 'biscuit-magenta', 4, 'yaw', [[0, -390, 80]], [90, 0, 90]);
// Separate packages built exactly once, before the robot's placement/reuse instruction.
for (const [ordinal, side, group] of [[1, -1, 'package-magenta'], [2, 1, 'package-yellow']] as const) {
  const x = side * 280;
  put(P, 'gear-gray-36', ordinal, group, [[x, -200, 120]], [90, 0, 0]);
  put(P, 'axle-yellow-3', ordinal, group, [[x, -220, 120]], [0, 0, 90]);
  // Packages p5 underside inset aligns all THREE vertical cross holes, not
  // just the central3L axle: brick nativeX must follow gear nativeY.
  put(P, side === -1 ? 'brick-magenta-2x4-cross' : 'brick-yellow-2x4-cross', 1, group, [[x, -234, 120], [x, -258, 120]], [0, 90, 0]);
}

const parts: PartInstance[] = research.instances.map((instance) => {
  const seat = seats.get(instance.id);
  if (!seat) throw new Error(`Unreconstructed source instance ${instance.id}`);
  const family = crosswalk.families.find((entry) => entry.build === 'package-sorter' && entry.input === 'docs/research/data/package-sorter.json' && entry.localKey === instance.partKey)!;
  const source = reference(instance.documentId, instance.pdfPage, instance.introducedAtStep);
  const category: PartInstance['category'] = instance.partKey === 'hub' ? 'controller' : instance.partKey.startsWith('motor-') ? 'motor' : instance.partKey === 'color-sensor' ? 'sensor' : instance.partKey.startsWith('gear-') ? 'gear' : /peg|axle|connector|block|clip/.test(instance.partKey) ? 'connector' : 'structure';
  return { id: instance.id, name: family.correctedName, geometryId: family.geometryId, materialId: `ldraw-${family.material.ldrawCode}`, category, inventoryScope: instance.documentId === P ? 'sample' : 'robot', finalTransform: seat.pose, initialTransform: identityTransform(), connectionPoints: [], sourceReference: source, geometryConfidence: 0.9, identityEvidence: evidence('diagram-derived', `${family.correctedName}; contextual source family ${instance.partKey}. Native LDraw basename is not a certified manufacturer SKU. Historical mold unchecked.`, [source], 0.9), placementEvidence: fit(source) };
});
const geometryAssets = geometryAssetsFor(parts.map((part) => part.geometryId));
const boundsById = Object.fromEntries(measuredBounds.assets.map((asset) => [asset.id, asset]));
let inventoryX = -500, inventoryZ = 260, rowDepth = 0;
for (const part of parts) {
  const bounds = boundsById[part.geometryId], geometry = geometryAssets.find((asset) => asset.id === part.geometryId)!;
  if (!bounds || geometry.sha256 !== bounds.sha256) throw new Error(`Package Sorter ${part.id}: measured native-origin bounds are missing or stale`);
  const width = bounds.max[0] - bounds.min[0], depth = bounds.max[2] - bounds.min[2];
  if (inventoryX + width > 500) { inventoryX = -500; inventoryZ += rowDepth + 12; rowDepth = 0; }
  // Inventory poses have identity rotation; these actual canonical bounds need no corner rotation.
  part.initialTransform = { ...identityTransform(), position: [inventoryX - bounds.min[0], 5 - bounds.min[1], inventoryZ - bounds.min[2]] };
  inventoryX += width + 12; rowDepth = Math.max(rowDepth, depth);
}
const partById = new Map(parts.map((part) => [part.id, part]));
const groupIds = [...new Set([...seats.values()].map((seat) => seat.group))];
const parent = new Map<string, string>();
const groupLocal = new Map<string, Transform>();
const members = new Map<string, string[]>();
const subassemblies: Subassembly[] = groupIds.map((id, index) => {
  const offset: Vec3 = id === 'platform' ? [0, 0, 0] : [(index % 5 - 2) * 180, 0, 240 + Math.floor(index / 5) * 160];
  const pose: Transform = { ...identityTransform(), position: offset };
  groupLocal.set(id, pose); members.set(id, []);
  return { id, name: id === 'upper-left' ? 'F shaft support cage' : id.replaceAll('-', ' '), localTransform: pose, partInstanceIds: [], childSubassemblyIds: [], evidence: presentation };
});
const groupWorld = (id: string): Transform => parent.has(id) ? composeTransforms(groupWorld(parent.get(id)!), groupLocal.get(id)!) : groupLocal.get(id)!;
function descendants(id: string): string[] { return [...members.get(id)!, ...groupIds.filter((child) => parent.get(child) === id).flatMap(descendants)]; }
function currentPart(id: string): Transform { const seat = seats.get(id)!; return members.get(seat.group)!.includes(id) ? composeTransforms(groupWorld(seat.group), seat.pose) : partById.get(id)!.initialTransform; }
const steps: AssemblyStep[] = [], operations: AssemblyOperation[] = [], installations: RobotModel['installations'] = [];
const connections: Connection[] = [];
const visibility: RobotModel['visibility'] = [];
const cables: RobotModel['cables'] = [];
const wireDevices: { port: string; id: string; nativeStub: Vec3; hubPort: Vec3 }[] = [
  { port: 'A', id: 'robot2019:motor-large:01', nativeStub: [0, 14, 142], hubPort: [-69, -68, -40] },
  { port: 'F', id: 'base2019:motor-medium:01', nativeStub: [0, 0, 143], hubPort: [69, -68, 40] },
  { port: 'D', id: 'base2019:color-sensor:01', nativeStub: [0, 0, 3], hubPort: [69, -68, -40] }
];
const merges: Record<string, [string, string][]> = {
  'robot2019:7': [['supports', 'platform']],
  'robot2019:10': [['yaw-output', 'yaw-motor-mount']],
  'robot2019:13': [['yaw-motor-mount', 'platform']],
  'robot2019:19': [['pedestal-left', 'platform'], ['pedestal-right', 'platform']],
  'base2019:3': [['foot-left', 'motor-frame'], ['foot-right', 'motor-frame']],
  'base2019:6': [['motor-frame', 'yaw']],
  'base2019:10': [['upper-frame', 'yaw']],
  'base2019:11': [['drive', 'yaw']],
  'base2019:14': [['side-supports', 'yaw']],
  'base2019:20': [['arm-support', 'yaw']],
  'base2019:23': [['ball-link-left', 'rod-left'], ['ball-link-right', 'rod-right']],
  'base2019:24': [['rod-left', 'yaw'], ['rod-right', 'yaw']],
  'base2019:27': [['crank-left', 'yaw']],
  'base2019:30': [['crank-right', 'yaw']],
  'base2019:34': [['upper-left', 'yaw']],
  'base2019:38': [['upper-right', 'upper-left']],
  'base2019:46': [['dish-left', 'drive'], ['dish-right', 'drive']],
  'base2019:47': [['fork-pivot-1', 'arm-support'], ['fork-pivot-2', 'arm-support']],
  'base2019:51': [['fork-left', 'fork-pivot-1']],
  'base2019:55': [['fork-right', 'fork-pivot-2']],
  'base2019:56': [['yaw', 'yaw-output']]
};
// Dependency order: the separate Packages instructions precede B2's reuse placement.
const ordered = [...sourceSteps.filter((step) => step.documentId === R), ...sourceSteps.filter((step) => step.documentId === B && step.step < 58), ...sourceSteps.filter((step) => step.documentId === P), ...sourceSteps.filter((step) => step.documentId === B && step.step === 58)];
let previous: string | undefined;
for (const sourceStep of ordered) {
  const id = `${sourceStep.documentId}-step${sourceStep.step}`, source = reference(sourceStep.documentId, sourceStep.pdfPage, sourceStep.step);
  const required = sourceStep.partsAdded.flatMap((line) => line.instanceIds);
  const own: AssemblyOperation[] = [];
  let time = 0;
  const append = (operation: AssemblyOperation) => { operation.startMs = time; operation.dependencies = previous ? [previous] : []; time += operation.durationMs; previous = operation.id; own.push(operation); operations.push(operation); };
  for (const partId of required) {
    const part = partById.get(partId)!, seat = seats.get(partId)!, target = composeTransforms(groupWorld(seat.group), seat.pose);
    // A prepared controller/frame transfer has no invented insertion. Axles/pins get
    // their true shaft direction; physical seat depth remains explicitly unchecked.
    const axial = /^(2780|3673|6558|3749|6628|44294|32073|4519|32062|18651)$/.test(part.geometryId);
    const end = composeTransforms(target, { ...identityTransform(), position: [1, 0, 0] }).position;
    const axis = end.map((v, i) => v - target.position[i]) as Vec3;
    const mount = mountPart({ ...part, finalTransform: target }, { id: `mount-${partId}`, stepId: id, sourceReference: source, startMs: time, durationMs: 650, dependencies: [], cameraPreset: cameraFor(target.position), ...(axial ? { axis, depthMm: part.geometryId === '6558' ? 16 : part.geometryId === '18651' ? 16 : part.geometryId === '44294' ? 20 : part.geometryId === '32073' ? 12 : 8 } : {}) });
    mount.parentChanges.push({ node: { kind: 'part', id: partId }, fromParent: null, toParent: { kind: 'subassembly', id: seat.group }, fromLocalTransform: target, toLocalTransform: seat.pose });
    append(mount); members.get(seat.group)!.push(partId);
    installations.push({ partInstanceId: partId, operationId: mount.id, stepId: id, atMs: time });
  }
  for (const [moving, destination] of merges[`${sourceStep.documentId}:${sourceStep.step}`] ?? []) {
    const from = groupWorld(moving), to = groupWorld(destination), ids = descendants(moving);
    const operation: AssemblyOperation = { id: `merge-${moving}`, stepId: id, operationType: 'merge-subassemblies', partInstanceIds: ids, fromTransforms: ids.map(currentPart), toTransforms: ids.map((partId) => composeTransforms(to, seats.get(partId)!.pose)), durationMs: 1100, easing: 'smoothstep', dependencies: [], cameraPreset: camera, sourceReference: source, startMs: time, stages: [{ id: `merge-${moving}-transfer`, startMs: 0, durationMs: 1100, phase: 'transfer', nodes: [{ kind: 'subassembly', id: moving }], fromTransforms: [from], toTransforms: [to], trajectory: { type: 'linear' }, easing: 'smoothstep', evidence: fit(source) }], parentChanges: [{ node: { kind: 'subassembly', id: moving }, fromParent: null, toParent: { kind: 'subassembly', id: destination }, fromLocalTransform: to, toLocalTransform: identityTransform() }], evidence: fit(source) };
    append(operation); parent.set(moving, destination); groupLocal.set(moving, identityTransform());
  }
  if (sourceStep.documentId === B && sourceStep.step === 58) {
    for (const group of ['package-magenta', 'package-yellow']) {
      const ids = descendants(group), from = groupWorld(group), to = identityTransform();
      append({ id: `place-${group}`, stepId: id, operationType: 'attach', partInstanceIds: ids, fromTransforms: ids.map(currentPart), toTransforms: ids.map((partId) => seats.get(partId)!.pose), durationMs: 1000, easing: 'smoothstep', dependencies: [], cameraPreset: camera, sourceReference: source, startMs: time, stages: [{ id: `place-${group}-lower`, startMs: 0, durationMs: 1000, phase: 'transfer', nodes: [{ kind: 'subassembly', id: group }], fromTransforms: [from], toTransforms: [to], trajectory: { type: 'linear' }, easing: 'smoothstep', evidence: fit(source) }], parentChanges: [], evidence: fit(source) });
      groupLocal.set(group, to);
    }
  }
  const isWiring = sourceStep.documentId === B && sourceStep.step === 57;
  if (isWiring) {
    const wiringSource = reference(B, 61), hub = partById.get('robot2019:hub:01')!;
    for (const wire of wireDevices) {
      const device = partById.get(wire.id)!, operationId = `connect-port-${wire.port}`;
      const cableFit = fit(wiringSource), devicePoint = `captive-${wire.port}`, hubPoint = `port-${wire.port}`;
      device.connectionPoints.push({ id: devicePoint, type: 'electrical', localTransform: native(wire.nativeStub), evidence: cableFit });
      hub.connectionPoints.push({ id: hubPoint, type: 'electrical', localTransform: native(wire.hubPort), evidence: cableFit });
      connections.push({ id: `wire-${wire.port}`, a: { partInstanceId: device.id, connectionPointId: devicePoint }, b: { partInstanceId: hub.id, connectionPointId: hubPoint }, type: 'electrical', installedByOperationId: operationId, evidence: cableFit });
      const ids = [device.id, hub.id], poses = ids.map(currentPart);
      append({ id: operationId, stepId: id, operationType: 'connect', partInstanceIds: ids, fromTransforms: poses, toTransforms: poses, durationMs: 350, easing: 'smoothstep', dependencies: [], cameraPreset: { ...camera, position: [-360, 280, -420] }, sourceReference: wiringSource, startMs: time, stages: [], parentChanges: [], evidence: cableFit });
      cables.push({ id: `cable-${wire.port}`, devicePartInstanceId: device.id, captive: true, fromConnection: `wire-${wire.port}`, toConnection: `wire-${wire.port}`, controlPoints: [{ parent: { kind: 'part', id: device.id }, position: native(wire.nativeStub).position }, { parent: null, position: [wire.port === 'A' ? -32 : 48, 30, 65] }, { parent: { kind: 'part', id: hub.id }, position: native(wire.hubPort).position }], routeEvidence: evidence('diagram-derived', 'Manual59 routing and61 electrical assignment; native cable-stub/socket origins retained. Intermediate bend is presentation-only, not measured cable envelope.', [source, wiringSource], 0.6) });
    }
  }
  if (!own.length) throw new Error(`Source step lacks a physical operation: ${id}`);
  steps.push({ id, title: `${sourceStep.documentId === R ? 'Robot' : sourceStep.documentId === B ? 'Base' : 'Packages'} · ${sourceStep.step}`, description: sourceStep.action, kind: 'numbered-instruction', action: isWiring ? 'wiring' : sourceStep.documentId === B && sourceStep.step === 58 ? 'reuse' : 'assembly', sourceReferences: isWiring ? [source, reference(B, 61)] : [source], operationIds: own.map((operation) => operation.id), requiredPartInstanceIds: required, warnings: sourceStep.documentId === B && sourceStep.step === 58 ? ['Use the two packages you already built. No extra parts are needed.'] : isWiring ? ['Check the cable route and clearance against the official wiring diagram. Flexible cables are not shown accurately in 3D.'] : [], durationMs: time, cameraPreset: camera });
}

// Real source-local frames. These are independently inspectable CAD features, not
// bounding-box contacts. All connection fit flags intentionally remain unchecked.
function mate(id: string, aId: string, ap: Vec3, bId: string, bp: Vec3, type: Connection['type'] = 'fixed'): void {
  const a = partById.get(aId)!, b = partById.get(bId)!;
  connections.push(addMate(a, { id: `${id}-a`, type: 'hole', localTransform: native(ap), evidence: a.placementEvidence }, b, { id: `${id}-b`, type: 'axle', localTransform: native(bp), evidence: b.placementEvidence }, { id, type, installedByOperationId: installations.find((event) => event.partInstanceId === bId)!.operationId, evidence: b.placementEvidence }));
}
const pid = (book: string, family: string, ordinal = 1) => `${book}:${family}:${String(ordinal).padStart(2, '0')}`;
mate('yaw-rotor-output-seat', pid(R, 'motor-large'), [0, -50, 0], pid(R, 'biscuit-magenta'), [0, 10, 0], 'pivot');
mate('medium-shaft-seven', pid(B, 'motor-medium'), [0, -50, 0], pid(B, 'axle-yellow-7'), [50, 0, 0], 'pivot');
mate('medium-shaft-five', pid(B, 'motor-medium'), [0, 30, 0], pid(B, 'axle-gray-5'), [-30, 0, 0], 'pivot');
mate('z28-axle-seat', pid(B, 'axle-yellow-7'), [40, 0, 0], pid(B, 'gear-gray-28'), [0, 0, 0]);
// Round bearing seats, not keyed outputs: rotating F does not rigidly rotate
// this carrier. Its passive pitch and fork swivels require rod/contact closure.
mate('carrier-left-round-bearing', pid(B, 'axle-yellow-7'), [20, 0, 0], pid(B, 'beam-azure-7'), [0, 0, -60], 'pivot');
mate('carrier-right-round-bearing', pid(B, 'axle-gray-5'), [-20, 0, 0], pid(B, 'beam-azure-7', 2), [0, 0, -60], 'pivot');
mate('rear-frame-gray-round-bearing', pid(B, 'axle-gray-5'), [20, 0, 0], pid(B, 'double-cross-block-light'), [0, 0, 0], 'pivot');
mate('rear-frame-yellow-round-bearing', pid(B, 'axle-yellow-7'), [-20, 0, 0], pid(B, 'double-cross-block-light', 2), [0, 0, 0], 'pivot');
for (let ordinal = 1; ordinal <= 2; ordinal++) {
  mate(`package-${ordinal}-shaft`, pid(P, 'gear-gray-36', ordinal), [0, 0, 10], pid(P, 'axle-yellow-3', ordinal), [10, 0, 0]);
  const family = ordinal === 1 ? 'brick-magenta-2x4-cross' : 'brick-yellow-2x4-cross';
  mate(`package-${ordinal}-lower-brick`, pid(P, 'axle-yellow-3', ordinal), [10, 0, 0], pid(P, family), [0, 24, 0]);
  mate(`package-${ordinal}-upper-brick`, pid(P, family), [0, 0, 0], pid(P, family, 2), [0, 24, 0]);
  // Base58 reuses these same samples on the two exposed pedestal axles.
  // The outer gear holes, not the central package axle, receive that support.
  for (const [index, y] of [[0, -20], [1, 20]] as const) {
    const gear = partById.get(pid(P, 'gear-gray-36', ordinal))!;
    const peg = partById.get(pid(R, 'peg-tan-axle', (ordinal === 1 ? 2 : 4) + index))!;
    const seatFit = fit(reference(B, 60, 58));
    connections.push(addMate(gear, { id: `pedestal-hole-${index}`, type: 'axle-hole', localTransform: native([0, y, 0]), evidence: seatFit }, peg, { id: 'exposed-sample-axle', type: 'axle', localTransform: native([10, 0, 0]), evidence: seatFit }, { id: `sample-${ordinal}-pedestal-${index}`, type: 'sliding', installedByOperationId: `place-package-${ordinal === 1 ? 'magenta' : 'yellow'}`, evidence: seatFit }));
    const support = partById.get(pid(R, 'biscuit-black', ordinal + 2))!;
    support.connectionPoints.push({ id: `sample-seat-${index}`, type: 'surface', localTransform: native([-30, 8.5, y]), evidence: { ...seatFit, evidence: evidence('diagram-derived', '39793 nativeX−30 edge-hole annulus at radius8.5; 32498 bottom axle-boss ring meets it nominally. Actual source sample is removable along both exposed axles.', [reference(R, 22, 19), reference(B, 60, 58)], 0.9) } });
    gear.connectionPoints.push({ id: `pedestal-seat-${index}`, type: 'surface', localTransform: native([-8.5, y, -10]), evidence: { ...seatFit, evidence: evidence('diagram-derived', '32498 bottom extra-axle boss nativeZ−10, radius8.5 from Y±20 (s/32498s01 ring material). This is not a marker at an empty bore centre.', [reference(B, 60, 58)], 0.9) } });
  }
  const side = ordinal === 1 ? -1 : 1;
  mate(`cradle-${ordinal}-body-round`, pid(B, 'motor-medium'), [20, -side * 20, 20], pid(B, 'peg-tan-axle', ordinal), [-10, 0, 0], 'pivot');
  mate(`cradle-${ordinal}-keyed-root`, pid(B, 'angular-yellow-2x4', ordinal), [0, 0, 0], pid(B, 'peg-tan-axle', ordinal), [10, 0, 0]);
  mate(`fork-${ordinal}-carrier-round`, pid(B, 'beam-azure-13'), [0, 0, side * 120], pid(B, 'axle-black-2-snap', ordinal), [0, 0, 0], 'pivot');
  mate(`fork-${ordinal}-white-bearing-key`, pid(B, 'double-cross-block-light', ordinal + 2), [0, -20, 0], pid(B, 'axle-black-2-snap', ordinal), [20, 0, 0]);
  mate(`fork-${ordinal}-white-forward-key`, pid(B, 'double-cross-block-light', ordinal + 2), [0, 20, 0], pid(B, 'axle-black-2-snap', ordinal + 2), [20, 0, 0]);
  mate(`fork-${ordinal}-32271-key`, pid(B, 'angular-yellow-3x7', ordinal), [0, 0, 0], pid(B, 'axle-black-2-snap', ordinal + 2), [0, 0, 0]);
}
// Actual ball/socket centers only: this does not assert the currently unchecked
// world placements close.2739a sockets are not ordinary cylindrical pin holes.
for (let ordinal = 1; ordinal <= 2; ordinal++) {
  for (const pin of [partById.get(pid(B, 'peg-black-friction', ordinal + 18))!, partById.get(pid(B, 'peg-black-knob', ordinal))!]) {
    pin.connectionPoints.push({ id: 'towball-center', type: 'surface', localTransform: native([-10, 0, 0]), evidence: { ...fit(pin.sourceReference!), evidence: evidence('diagram-derived', 'Canonical B2p24/p52/p56 spherical-headed callouts; genuine6628.dat sphere center(-10,0,0), radius8LDU. Source identity established; assembled socket fit remains unchecked.', [pin.sourceReference!], 0.95) } });
  }
  const rod = partById.get(pid(B, 'rod-gray-6', ordinal))!;
  for (const z of [0, 100]) rod.connectionPoints.push({ id: `socket-${z}`, type: 'surface', localTransform: native([0, 0, z]), evidence: { ...fit(rod.sourceReference!), evidence: evidence('diagram-derived', 'B2p25 sockets over the p24 towballs; p53/p57 circled fork-end hookup.2739a.dat repeats s/2739as01.dat at z0/100: fixed40mm socket-center span, not a telescoping link or a proven operating branch.', [rod.sourceReference!, reference(B, ordinal === 1 ? 53 : 57)], 0.95) } });
}
// Real material patches only; their existence does not trigger sample capture.
for (const [ordinal, side] of [[1, -1], [2, 1]] as const) {
  const panel = partById.get(pid(B, 'panel-azure-3x11x2', ordinal))!;
  for (const [id, point, note] of [
    ['support-lip-centroid', [9, 4.5, -side * 74.5], '11954 quad121/511: nativeX9 upward lip, Y0..9, terminal Z69..80. Finite facet, not an infinite support plane.'],
    ['inner-face-witness', [-8, 10, -side * 60], '11954 quad126/516: real nativeY10 inner material patch; native(-8,10,±60) is outside the nearby pin holes.']
  ] as const) panel.connectionPoints.push({ id, type: 'surface', localTransform: native([...point]), evidence: { ...fit(panel.sourceReference!), evidence: evidence('diagram-derived', note, [panel.sourceReference!], 0.9) } });
  const cap = partById.get(pid(B, 'angle-black-180', ordinal))!;
  cap.connectionPoints.push({ id: 'inner-annular-face-witness', type: 'surface', localTransform: native([-side * 10, 8.5, 0]), evidence: { ...fit(cap.sourceReference!), evidence: evidence('diagram-derived', '32034 actual connhole face at nativeX±10, annulus8<radius<9; radius8.5 avoids the central pin-hole void. Candidate opposed grip face, not a certified active contact.', [cap.sourceReference!], 0.9) } });
  const gear = partById.get(pid(P, 'gear-gray-36', ordinal))!;
  for (const [id, point] of [['crest-plus-x', [47, 0, 0]], ['bottom-face-plus-x', [38, 0, -10]]] as const) gear.connectionPoints.push({ id, type: 'surface', localTransform: native([...point]), evidence: { ...fit(gear.sourceReference!), evidence: evidence('diagram-derived', '32498 actual toothb12 crest/ring-face material: radius47 only near the middle; axial faceZ−10 includes ring radius38. Not a constant47LDU cylinder or a capture event.', [gear.sourceReference!], 0.9) } });
  const family = ordinal === 1 ? 'brick-magenta-2x4-cross' : 'brick-yellow-2x4-cross';
  for (const brickOrdinal of [1, 2]) {
    const brick = partById.get(pid(P, family, brickOrdinal))!;
    for (const s of [-1, 1]) brick.connectionPoints.push({ id: `side-${s}`, type: 'surface', localTransform: native([s * 40, 12, 0]), evidence: { ...fit(brick.sourceReference!), evidence: evidence('diagram-derived', '39789 native box4 side faceX±40, bodyY0..24,Z±20. Full long-axis width80LDU=32mm; short-axis width40LDU=16mm. Actual package orientation/contact height still required.', [brick.sourceReference!], 0.9) } });
  }
}
// Registered material witnesses, NOT an asserted active contact. The native
// motor shell isX29 here, leaving1LDU clearance to the nominal11L inner face.
const rearBar = partById.get(pid(B, 'beam-magenta-11'))!;
rearBar.connectionPoints.push({ id: 'rear-frame-stop-candidate', type: 'surface', localTransform: native([9, -10, 20]), evidence: { ...fit(rearBar.sourceReference!), evidence: evidence('diagram-derived', '32525 native material edge(9,-10,20); B2p41 four-pin crossbar. Candidate stop against motor shell, not a proven active contact or a moved marker.', [rearBar.sourceReference!], 0.8) } });
const mediumBody = partById.get(pid(B, 'motor-medium'))!;
mediumBody.connectionPoints.push({ id: 'rear-frame-stop-body-candidate', type: 'surface', localTransform: native([29, 0, 69]), evidence: { ...fit(mediumBody.sourceReference!), evidence: evidence('diagram-derived', 'u9366 rootZ140 plus s/u9366s01.dat rect atX29,Z[-90,-9]: real body face at motor-native(29,0,69). Nominal crossbar witness is1LDU away; contact angle/active mode is not certified.', [mediumBody.sourceReference!, reference(B, 41)], 0.8) } });
const mechanismSource = [reference(B, 13, 11), reference(B, 26, 24), reference(B, 36, 34), reference(B, 42, 40), reference(B, 44, 42), reference(B, 53, 51), reference(B, 58, 56)];
const mechanismFit = { ...fit(mechanismSource[0]), evidence: evidence('diagram-derived', 'Only actual motor outputs are active. Nominal native carrier, cage, mast, pedestal and package receiving frames plus both genuine40mm rods close. Continuous passive/contact branch, source encoder phase/sign and finite capture/release remain unresolved; pickup is disabled rather than imposing a planar four-bar, fake attachment or invented motor ratio.', mechanismSource, 0.65) } satisfies PlacementEvidence;
const subref = (id: string) => ({ kind: 'subassembly' as const, id });
function revolute(id: string, parentId: string, childId: string, pivot: Vec3, axis: Vec3, zero = 0): Joint {
  const origin = native(pivot);
  return { id, name: id.replaceAll('-', ' '), type: 'revolute', parent: subref(parentId), child: subref(childId), origin, childTransform: relativeTransform(origin, identityTransform()), axis, zero, evidence: mechanismFit };
}
const joints: Joint[] = [
  { ...revolute('yaw-A', 'platform', 'yaw-output', [0, -90, 80], [0, 1, 0]), drivenByMotorId: 'motor-A', internalBinding: { partInstanceId: pid(R, 'motor-large'), geometryNodeId: 'parts/u9363.dat', movingSide: 'rotor' } },
  { ...revolute('output-F', 'yaw', 'drive', [-50, -310, 80], [1, 0, 0]), drivenByMotorId: 'motor-F', internalBinding: { partInstanceId: pid(B, 'motor-medium'), geometryNodeId: 'parts/u9363p01.dat', movingSide: 'rotor' } }
];
const wiringSource = reference(B, 61);
const wiring = evidence('documented', 'Official B2 p61 and Python p13: A large yaw motor, F medium lift motor, D color sensor.', [wiringSource], 0.99);
const motors: RobotModel['motors'] = [{ id: 'motor-A', partInstanceId: pid(R, 'motor-large'), port: 'A', jointId: 'yaw-A', assignmentEvidence: wiring }, { id: 'motor-F', partInstanceId: pid(B, 'motor-medium'), port: 'F', jointId: 'output-F', assignmentEvidence: wiring }];
const program = research.documentedProgram;
const pythonRef: SourceReference = { documentId: 'sorter-python', page: 13, sourceUrl: program.pythonSourceUrl, confidence: 0.99 };
const svgRef: SourceReference = { documentId: 'sorter-blocks', sourceUrl: program.blockProgramUrl, confidence: 0.99 };
const programEvidence = evidence('documented', 'Official source absolute encoder targets and magenta acceptance branch. Encoder positions are not physical hard stops.', [pythonRef, svgRef], 0.99);
function scenario(variant: 'python' | 'svg'): SimulationScenario {
  const motorCommands: MotorCommand[] = [], sensorSignals: SimulationScenario['sensorSignals'] = [];
  let time = 0;
  const angle = { A: 0, F: 0 };
  const target = (port: 'A' | 'F', degrees: number, speed = 250) => {
    const start = angle[port];
    let delta = (degrees - start) % 360;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const end = start + delta;
    if (Math.abs(delta) > 1e-10) {
      const durationMs = Math.max(250, Math.abs(delta) / speed * 1000);
      motorCommands.push({ motorId: `motor-${port}`, startMs: time, durationMs, mode: 'position', from: start * Math.PI / 180, to: end * Math.PI / 180, unit: 'rad', easing: 'linear', evidence: variant === 'python' ? programEvidence : evidence('app-authored', 'SVG25% mapped to conservative250 degrees/s for deterministic playback; percent is not asserted equivalent to degrees/s.', [svgRef], 1) });
      time += durationMs; angle[port] = end;
    }
  };
  const check = (color: 'magenta' | 'yellow') => {
    target('F', 235); time += 4000;
    sensorSignals.push({ sensorPartInstanceId: pid(B, 'color-sensor'), port: 'D', timeMs: time, type: 'color', value: color, basis: 'scripted-input', evidence: evidence('app-authored', 'The actual two source samples are staged magenta then yellow. Color-read timing and branch logic follow the source; synthetic D input is not an optical classifier.', [reference(P, 5, 3), pythonRef], 1) });
    if (color === 'magenta') { target('A', 0); target('F', 25); time += 1000; target('F', 240); }
    else { time += 1000; target('F', 25); for (let n = 0; n < 3; n++) { target('F', angle.F - 100, 1000); target('F', angle.F + 100, 1000); } }
  };
  target('A', 0); target('F', 240); target('A', 90); target('F', 25); check('magenta');
  target('A', 0); target('F', 240); target('A', 270); target('F', 25); check('yellow');
  if (variant === 'python') { target('A', 0); target('F', 240); } else { target('F', 240); target('A', 0); }
  return { id: `sorter-${variant}-source-command-replay`, title: `Source ${variant === 'python' ? 'Python' : 'SVG'} motor replay — pickup disabled`, description: 'NOT a functional sorting demonstration: only physical yawA and motorF output shafts/gear are active. Nominal native receiving frames and both40mm rods close, but continuous passive motion and package contacts are not yet solved. Source magenta/yellow branch commands and the two distinct program orders remain inspectable.', fidelity: 'deterministic-kinematics', durationMs: time + 1000, motorCommands, sensorSignals, objectEvents: [], rootMotion: [], limitations: ['BLOCKED: continuous passive/contact branch, A/F encoder phase/sign and finite capture/release route. No package is falsely attached, moved or teleported.', 'All assembled seating still requires independent manual comparison.', 'No conveyor, third motor, independent gripper, fabricated reduction gear or certified physical limit.', 'Program sounds are represented by dwell intervals, not licensed audio; D samples are explicit RoboBuild scripted inputs.', 'SVG25% speed is not equivalent to Python250 degrees/s; the SVG playback rate is an explicit modeled assumption.', 'Source variants retain their distinct final A0/F240 ordering.'], sourceReferences: [variant === 'python' ? pythonRef : svgRef, wiringSource] };
}
const selectedMaterials = materials; // Fixed-color MPD subparts require the complete licensed palette.
const inventory: RobotModel['inventory'] = [...new Set(research.instances.map((instance) => `${instance.documentId}:${instance.partKey}`))].map((key) => {
  const instances = research.instances.filter((instance) => `${instance.documentId}:${instance.partKey}` === key);
  return { id: `inventory-${key}`, name: partById.get(instances[0].id)!.name, scope: instances[0].documentId === P ? 'sample' : 'robot', basis: 'prepared-callout-units', accounting: 'tracked', quantity: instances.length, partInstanceIds: instances.map((instance) => instance.id), sourceReferences: instances.map((instance) => reference(instance.documentId, instance.pdfPage, instance.introducedAtStep)) };
});
export const packageSorter: RobotModel = {
  schemaVersion: 1, id: 'package-sorter', name: 'Package Sorter', manufacturer: 'LEGO Education', edition: 'Robot + Base + Packages · 2019', category: 'Color sorting mechanism', complexity: 'Advanced', description: 'Build the base, moving arm and two packages. The demonstration shows motor movement only; package pickup and sorting are not available.',
  sourceDocuments: [...documents.map((document) => ({ id: document.id, title: document.titleOnOfficialIndex, sourceUrl: document.sourceUrl, sha256: document.sha256, pageCount: document.pdfPageCount, edition: 'Official building-instructions index2019; SHA-locked', redistribution: 'link-only' as const })), { id: 'sorter-python', title: 'SPIKE Prime Python Programs', sourceUrl: program.pythonSourceUrl, sha256: program.pythonPdfSha256, edition: 'February2024; sorter p13', redistribution: 'link-only' }, { id: 'sorter-blocks', title: 'Automate It teacher block program', sourceUrl: program.blockProgramUrl, sha256: program.blockProgramSha256, edition: 'Official lesson SVG', redistribution: 'link-only' }, ...sourceDocumentsFor(geometryAssets, selectedMaterials)],
  parts, geometryAssets, materials: selectedMaterials, steps, operations, installations, visibility, subassemblies, connections, joints, linkageConstraints: [], motors, cables, inventory,
  milestones: [{ id: 'platform-complete', title: 'Platform and pedestals', stepId: 'robot2019-step19' }, { id: 'arm-mounted', title: 'Arm attached to the turntable', stepId: 'base2019-step56' }, { id: 'samples-built', title: 'Both packages built', stepId: 'packages2019-step3' }, { id: 'packages-placed', title: 'Reuse packages on pedestals', stepId: 'base2019-step58' }],
  sourceMappings: steps.map((step) => ({ source: step.sourceReferences[0], stepId: step.id })), scenarios: [scenario('python'), scenario('svg')],
  coverage: { documentedSteps: 80, implementedSteps: 80, verifiedSteps: 0, modeledComponents: 166, verifiedComponents: 0, geometryConfidence: 0.9, dimensions: { inventory: { status: 'complete', verified: 166, total: 166, note: 'Independent canonical2019 printed callout transcription:57+101 robot,8 sample.' }, geometry: { status: 'partial', verified: 0, total: 166, note: 'Genuine licensed native-origin LDraw geometry; historic molds not certified.' }, placement: { status: 'partial', verified: 0, total: 166, note: 'Source/native receiving-graph reconstruction. Every assembled fit remains honestly unchecked.' }, kinematics: { status: 'partial', verified: 0, total: 2, note: 'Only actual A/F motor outputs active; passive contact branch disabled.' }, simulation: { status: 'blocked', verified: 0, total: 2, note: 'Pickup/sorting disabled. Source-specific Python/SVG motor command replays are not full functional sorting acceptance.' } }, outstandingDeviations: ['Nominal carrier/cage/mast/pedestal/package receiving frames and40mm rods close; continuous contact branch, encoder phase/sign and finite capture/release remain unproved.', 'Object capture/release is intentionally not fabricated while actual finite3D contacts are unresolved.', 'All166 assembled fits remain unchecked, including whole-module A mounting, unintended intersections, cable envelopes and source-global route registration.', 'Battery preparation R p3 and wiring B p61 remain outside the80 numbered instructions and158 robot callout units; the latter is associated with the source57 cable-routing operation.', 'Captive flexible cables are not geometry-calibrated; physical envelope and bend clearances unknown.'] }
};
