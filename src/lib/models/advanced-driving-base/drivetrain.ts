import type { AssemblyOperation, AssemblyStep, CameraPreset, Connection, ConnectionPoint, PartInstance, PlacementEvidence, Quaternion, SourceReference, Transform, Vec3 } from '../../types/model.ts';
import { identityTransform, relativeTransform } from '../../core/transforms.ts';
import { addMate, evidence, mountPart, nativeLDrawTransform, placement, stepId, type BuildFragment } from '../authoring.ts';
import { advancedDrivingBaseDocuments } from '../catalog.ts';

const s = Math.SQRT1_2;
const rx: Quaternion = [s, 0, 0, s];
const rz: Quaternion = [0, 0, s, s];
const beamRotation: Quaternion = [s, s, 0, 0];
const cycle: Quaternion = [0.5, 0.5, 0.5, 0.5];
const cad = (id: string, figure: string): SourceReference => ({ documentId: `ldraw-${id}`, sourceUrl: `https://library.ldraw.org/library/official/parts/${id}.dat`, figure, confidence: 0.98 });
const families: Record<string, [string, number, PartInstance['category'], string]> = {
  'large-motor': ['54675', 15, 'motor', 'Large Angular Motor'],
  'black-pin2': ['2780', 0, 'connector', 'Black friction pin'],
  'black-frame5x7': ['64179', 0, 'structure', 'Black 5 × 7 open frame'],
  'grey-pinbeam3': ['48989', 71, 'connector', 'Gray three-hole block with four integral pins'],
  'blue-pin3': ['6558', 1, 'connector', 'Blue 3L friction pin'],
  wheel88: ['49295p01', 0, 'wheel', '88 mm wheel with integral medium azure tyre'],
  'pink-connector3': ['39793', 26, 'connector', 'Magenta 3 × 3 perpendicular connector'],
  'grey-axle5': ['32073', 71, 'fastener', 'Gray 5L axle'],
  'grey-cross2x1': ['6536', 71, 'connector', 'Gray perpendicular axle/pin connector'],
  'black-doubleangle3x7': ['32009', 0, 'structure', 'Black double-angular beam'],
  'yellow-axle3': ['4519', 14, 'fastener', 'Yellow 3L axle'],
  'black-axle4': ['3705', 0, 'fastener', 'Black 4L axle'],
  'grey-cross3x2': ['63869', 71, 'connector', 'Gray axle/triple-pin cross block'],
  'black-angle4x4': ['63869', 71, 'connector', 'Gray axle/triple-pin cross block — corrected source family'],
  'red-axlepin3': ['11214', 4, 'connector', 'Red 2L friction pin / 1L axle'],
  'grey-iframe3x5': ['14720', 71, 'structure', 'Gray 3 × 5 H-frame'],
  'yellow-beam3': ['32523', 14, 'structure', 'Yellow 3-hole beam'],
  'magenta-wireclip': ['49283', 26, 'connector', 'Magenta cable clip'],
  'yellow-wireclip': ['49283', 14, 'connector', 'Yellow cable clip']
};
const descriptions = [
  'Prepare the large motor and five housing pins; align the output index mark.',
  'Press the 5 × 7 frame onto the two output-end housing pins.',
  'Add the gray frame support, the two output pins and the two projecting blue frame pins.',
  'Seat the integral-tyre wheel on the motor output. The tyre is not an additional prepared unit.',
  'Insert the two blue wheel-retaining pins in the opposing output holes.',
  'Press the magenta perpendicular connector onto the exposed wheel pins.',
  'Begin the separate outside reinforcement with the 5L axle and first perpendicular connector.',
  'Add the first angular beam and second perpendicular connector to that axle.',
  'Add the upper integral-pin block and yellow 3L axle.',
  'Add the second parallel angular beam to the prepared reinforcement.',
  'Slide the third perpendicular connector onto the lower axle.',
  'Insert the lower black connector pin.',
  'Move the previously prepared outside reinforcement onto the wheel module; engage its lower frame connection. No new units.',
  'Insert the 4L output axle through the reinforcement and wheel centre into the motor output.',
  'View the cable end and insert its two housing pins.',
  'Prepare the second reinforcement: gray cross block with two blue pins.',
  'Add the third angular beam to this cross-block unit.',
  'Add the second gray cross block. The old research key black-angle4x4 is not its physical color or shape.',
  'Insert the two red axle/pins into the reinforcement.',
  'Fit the gray H-frame to the red axle/pins.',
  'Cap this reinforcement with the yellow 3-hole beam.',
  'Move the completed cable-end reinforcement onto the motor and connect its upper end. No new units.',
  'Prepare the side-specific cable clip and its blue pin.',
  'View the housing side and attach the previously prepared clip. No new units.'
];

/** Both books were inspected: identical callout graph, opposite housing-side seats and clip colors.
 * Native part rotations are proper rotations; geometry is never reflected or recentered. */
function makeSide(side: 'right' | 'left', book: 2 | 3): BuildFragment {
  const sign = side === 'right' ? 1 : -1;
  const document = advancedDrivingBaseDocuments[book - 1]!;
  const source = (page: number): SourceReference => ({ documentId: document.id, page, instructionId: String(page), figure: `${side === 'right' ? 'Right' : 'Left'} Side step ${page}`, sourceUrl: `${document.sourceUrl}#page=${page}`, confidence: 0.98 });
  const sourceFit = (page: number, note: string, ids: string[], confidence = 0.9): PlacementEvidence => placement(
    evidence('documented', note, [source(page)], 0.98),
    evidence('cad-derived', note, ids.map((id) => cad(id, 'Native source features; see docs/validation/adb-drivetrain.md')), confidence)
  );
  const rootId = `${side}-side`;
  const wheelId = `${side}-wheel-shaft`;
  const outsideId = `${side}-outside-reinforcement`;
  const backId = `${side}-cable-end-reinforcement`;
  const clipId = `${side}-clip-unit`;
  const parts: PartInstance[] = [];
  const operations: AssemblyOperation[] = [];
  const connections: Connection[] = [];
  const familyByPartId: Record<string, string> = {};
  const introduced = new Map<string, number>();
  const mounting: Record<string, { axis?: Vec3; depthMm?: number }> = {};
  const offsets: Record<string, Vec3> = { [outsideId]: [128, 0, 0], [backId]: [-128, 0, 0], [clipId]: [0, 0, 120] };
  const nativeAxis = (axis: Vec3): Vec3 => [axis[0], -axis[1], -axis[2]];
  const camera = (page: number): CameraPreset => ({ position: page < 15 ? [125, 130, 165] : [-135, 125, -155], target: [0, 16, -8], up: [0, 1, 0], projection: 'perspective', framing: 150, transitionMs: 650 });
  function part(name: string, family: string, page: number, position: Vec3, rotation: Quaternion = [0, 0, 0, 1], group = rootId, axis?: Vec3, depthLdu?: number, note = 'Source-view placement on the native 20-LDU Technic grid; independent fit has not been verified.'): PartInstance {
    const [geometryId, color, category, label] = families[family]!;
    const finalTransform = nativeLDrawTransform(position, rotation);
    const index = parts.length;
    const p: PartInstance = {
      id: `${side}-${name}`, geometryId, materialId: `ldraw-${color}`, name: `${side === 'right' ? 'Right' : 'Left'} — ${label}`,
      initialTransform: { position: [-192 + (index % 8) * 48, -64, -180 - Math.floor(index / 8) * 48], quaternion: [...finalTransform.quaternion], scale: [1, 1, 1] },
      finalTransform, connectionPoints: [], subassemblyId: group, sourceReference: source(page), geometryConfidence: geometryId === '48989' ? 0.9 : 0.95,
      inventoryScope: 'robot', category,
      identityEvidence: evidence('diagram-derived', `${label}: contextual source/CAD crosswalk; genuine ${geometryId}.dat. Exact 2019 historical mold is not certified.`, [source(page), cad(geometryId, 'Contextual visual-family crosswalk')]),
      placementEvidence: sourceFit(page, note, [geometryId])
    };
    parts.push(p); familyByPartId[p.id] = family; introduced.set(p.id, page);
    mounting[p.id] = axis ? { axis: nativeAxis(axis), depthMm: depthLdu! * 0.4 } : {};
    return p;
  }
  const motor = part('motor', 'large-motor', 1, [0, 0, 0], undefined, rootId, undefined, undefined,
    '54675 preserves its native origin. Body u9367c01 is fixed; genuine rotor node parts/u9363.dat is at [0,-50,0] LDU.');
  for (const [i, x] of [-40, 40].entries()) part(`housing-pin-${i + 1}`, 'black-pin2', 1, [x, 0, -30], [0, -s, 0, s], rootId, [0, 0, 1], 20,
    'Housing front-face seats native [±40,0,-30], axis Z; u9367s01 connhol3 is translated by body y=-20. Pin collar at face, 20-LDU entering half.');
  for (const [i, z] of [20, 80, 120].entries()) part(`housing-pin-${i + 3}`, 'black-pin2', 1, [sign * 50, 20, z], undefined, rootId, [-sign, 0, 0], 20,
    'Source lower housing-side row: native x=±50,y=20; white end z20, azure end z80/120. Mirror books use opposite actual housing faces.');
  const frame = part('frame', 'black-frame5x7', 2, [0, 0, -80], [0, s, 0, s], rootId, [0, 0, 1], 20,
    'ProperRy(pi/2): frame long7-hole rails span motorX. Actual nativeX-axis connhol2 atframe[-40,0,±40] (s/64179s01.dat:66 and mirrors) maps motor[±40,0,-40]; outerfaceframeX=-50 maps motorZ=-30, exactly both motor nose collars. No cornerY-bore is relabeledZ.');
  part('frame-block', 'grey-pinbeam3', 3, [sign * 80, 0, -80], cycle, rootId, [-sign, 0, 0], 20,
    '48989 pins local[0,±20,-sign×10] map motor[sign×70,0,-100/-60], matching64179 short-end nativeZ=sign×70 longitudinal bore faces atframeX±20. Body axisX mapsmotorY; source visible upright post is an actual transverse bore.');
  for (const [i, z] of [-20, 20].entries()) part(`rotor-pin-${i + 1}`, 'black-pin2', 3, [0, -50, z], rz, wheelId, [0, 1, 0], 20,
    'u9363 rotor native pin-hole pair z=±20 at rotor front y=-50. 2780 collar seats on the actual rotor face, not the motor bounding box.');
  for (const [i, x] of [0, sign * 40].entries()) part(`frame-pin-${i + 1}`, 'blue-pin3', 3, [x, 0, -140], [0, s, 0, s], rootId, [0, 0, 1], 20,
    'Source3 uses adjacent middle+lower bores of the front LONG rail: nativeframe[50,0,Z=0/sign×40]. ProperRy(pi/2) maps their collarfaces to motorZ=-130. Pin short1L entersframe, long2L projects to motorZ=-170; second free bearing centreZ=-160.');
  const wheel = part('wheel', 'wheel88', 4, [0, -60, 0], rx, wheelId, [0, 1, 0], 20,
    '49295 wheel hub faces local z=±10. Rx(pi/2) sends local +Z to motor -Y: inner face reaches rotor y=-50 when wheel origin y=-60. Body-to-wheel-centre offset24mm. Integral tyre fixed color10322 is not a separate part.');
  for (const [i, x] of [-20, 20].entries()) part(`wheel-pin-${i + 1}`, 'blue-pin3', 5, [x, -60, 0], rz, wheelId, [0, 1, 0], 40,
    '6558 short-side collar coordinate -10 is placed at wheel outer face y=-70; its 2L half passes wheel hub and enters rotor. The outer1L end accepts the magenta block.');
  const pink = part('wheel-block', 'pink-connector3', 6, [0, -80, 0], undefined, wheelId, [0, 1, 0], 20,
    '39793 holes local x=±20 take the two wheel pins. Block lower face y=+10 coincides wheel outer hub face y=-70; centre is y=-80.');
  part('brace-axle5', 'grey-axle5', 7, [0, -20, -140], undefined, outsideId, [1, 0, 0], 20,
    '32073 true axle spans x=-50..50 LDU. The assembled stack is five20-LDU layers, not a universal8mm axle insertion. First connector seats one20-LDU bearing.');
  part('brace-cross-1', 'grey-cross2x1', 7, [-40, -20, -140], undefined, outsideId, [1, 0, 0], 20);
  part('brace-beam-1', 'black-doubleangle3x7', 8, [-20, -100, -140], beamRotation, outsideId, [1, 0, 0], 20,
    '32009 native lower axle hole [80,0,0] and upper[0,0,-160] map to assembled [x,-20,-140] and[x,-100,20]. Beam thickness20LDU alongX.');
  part('brace-cross-2', 'grey-cross2x1', 8, [0, -20, -140], undefined, outsideId, [1, 0, 0], 20);
  part('brace-upper-block', 'grey-pinbeam3', 9, [0, -100, 0], cycle, outsideId, [1, 0, 0], 20,
    '48989 long axis maps toZ and integral pins toX. Pins at z=±20 carry paired angular beam holes; its transverse centre bore axisY is the 4L shaft bearing.');
  part('brace-axle3', 'yellow-axle3', 9, [0, -100, 20], undefined, outsideId, [1, 0, 0], 60,
    '4519 spans60LDU; end faces x=±30 match the exterior faces of the paired beams. Full stack seating travel60LDU=24mm.');
  part('brace-beam-2', 'black-doubleangle3x7', 10, [20, -100, -140], beamRotation, outsideId, [-1, 0, 0], 20);
  part('brace-cross-3', 'grey-cross2x1', 11, [40, -20, -140], undefined, outsideId, [-1, 0, 0], 20);
  part('brace-pin', 'black-pin2', 12, [40, 0, -150], [0, -s, 0, s], outsideId, [0, 0, 1], 20);
  const shaft = part('output-axle4', 'black-axle4', 14, [0, -70, 0], rz, wheelId, [0, 1, 0], 80,
    '3705 is80LDU long: centre y=-70 gives ends-110/-30. It crosses top bearing(-110..-90), magenta(-90..-70), wheel(-70..-50), and actual rotor front axle socket(-50..-30). Full insertion32mm, rotor engagement8mm.');
  for (const [i, x] of [-40, 40].entries()) part(`rear-housing-pin-${i + 1}`, 'black-pin2', 15, [x, 0, 150], [0, -s, 0, s], rootId, [0, 0, -1], 20,
    'u9390 rear face is native z=150 after its+140 translation; independent rear holes x=±40,y=0.');
  part('rear-cross-1', 'grey-cross3x2', 16, [-sign * 20, 20, 160], cycle, backId, undefined, undefined,
    '63869 proper cyclic rotation maps its axle bore to motorY and triple-pin bores to motorX. Source16 uses middle+one-end row holes, not both row ends.');
  for (const [i, y] of [20, 40].entries()) part(`rear-blue-pin-${i + 1}`, 'blue-pin3', 16, [0, y, 180], side === 'right' ? [0, 0, 0, 1] : [0, 1, 0, 0], backId, [-sign, 0, 0], 20,
    'Blue pin collar seats first63869 inner face at motorX=-sign×10; short1L enters first block, long2L crosses beam and second block. Left uses properRy(pi), not reflected geometry. Selected row holes are local[0,20,0] and[20,20,0].');
  part('rear-beam', 'black-doubleangle3x7', 17, [0, -20, 180], rz, backId, [-sign, 0, 0], 20,
    '32009 short-leg ROUND holes native[40,0,0]/[60,0,0] map motor[0,20/40,180], exactly matching adjacent blue pins; do not insert a round pin into its end cross-hole[80,0,0].');
  part('rear-cross-2', 'black-angle4x4', 18, [sign * 20, 20, 160], cycle, backId, [-sign, 0, 0], 20,
    'Source18 second gray63869 uses the same proper cyclic orientation; its20LDU row layer is on the opposite side of the beam from the source16 block. Source books reverse which nativeX side is introduced first.');
  for (const [i, x] of [-sign * 20, sign * 20].entries()) part(`rear-red-pin-${i + 1}`, 'red-axlepin3', 19, [x, 0, 160], rz, backId, [0, 1, 0], 20,
    '11214 AXLE half localX10..30 enters actual63869 axle bore, motorY10..30. Its2L pin half remains motorY-30..10 and accepts14720 central-spine holes, not its end crossbars.');
  const iframe = part('rear-iframe', 'grey-iframe3x5', 20, [0, 0, 160], cycle, backId, [0, 1, 0], 20,
    '14720 SPINE holes native[0,0,±20], axesX, register with red pins at motorX±20,axisY. Independently both end-bar middle holes native[0,0,±40] register with rear housing pins motorX±40 at faceZ150.');
  part('rear-yellow-beam', 'yellow-beam3', 21, [0, -20, 160], [s, 0, s, 0], backId, [0, 1, 0], 20,
    '32523 native outer holesZ±20 map motorX±20 atY-20,Z160, covering the remaining1L of each red pin. Beam occupies motorY-30..-10, adjoining14720 spineY-10..10 without overlap.');
  const clipFamily = side === 'right' ? 'magenta-wireclip' : 'yellow-wireclip';
  const clipPin = part('clip-pin', 'blue-pin3', 23, [sign * 60, -20, 20], side === 'right' ? [0, 0, 0, 1] : [0, 1, 0, 0], clipId, [-sign, 0, 0], 20);
  const clip = part('clip', clipFamily, 23, [sign * 70, -20, 20], [0, sign * s, 0, s], clipId, [-sign, 0, 0], 20,
    '49283 uses its native cross-bore, rather than a decorative separate cable mesh. Right clip magenta, left clip yellow. The free pin half is seated in the source white housing-side hole.');

  const partById = new Map(parts.map((p) => [p.id, p]));
  function shifted(pose: Transform, offset: Vec3): Transform { return { ...pose, position: pose.position.map((v, i) => v + offset[i]) as Vec3 }; }
  function merge(page: number, groupId: string): void {
    const groupParts = parts.filter((p) => p.subassemblyId === groupId);
    const offset = offsets[groupId]!;
    const fromTransforms = groupParts.map((p) => shifted(p.finalTransform, offset));
    const toTransforms = groupParts.map((p) => p.finalTransform);
    const fromRoot = identityTransform();
    const toRoot = { ...identityTransform(), position: offset.map((v) => -v) as Vec3 };
    const axis: Vec3 = groupId === outsideId ? [0, -1, 0] : groupId === backId ? [0, 0, 1] : [-sign, 0, 0];
    const contact = shifted(toRoot, axis.map((v) => -v * 8) as Vec3);
    const id = `${side}-merge-${page}`;
    operations.push({ id, stepId: stepId(book, page), operationType: 'merge-subassemblies', partInstanceIds: groupParts.map((p) => p.id), fromTransforms, toTransforms,
      startMs: 0, durationMs: 3000, easing: 'smoothstep', dependencies: operations.filter((op) => op.partInstanceIds.some((id) => groupParts.some((p) => p.id === id))).map((op) => op.id), sourceReference: source(page), cameraPreset: camera(page),
      stages: [{ id: `${id}-transfer`, startMs: 0, durationMs: 2200, phase: 'approach', nodes: [{ kind: 'subassembly', id: groupId }], fromTransforms: [fromRoot], toTransforms: [contact], trajectory: { type: 'linear' }, easing: 'smoothstep', evidence: placement(evidence('documented', descriptions[page - 1]!, [source(page)]), evidence('app-authored', 'Separate work area, approach and timing are presentation only.', [], 1), true) },
        { id: `${id}-seat`, startMs: 2200, durationMs: 800, phase: 'insert', nodes: [{ kind: 'subassembly', id: groupId }], fromTransforms: [contact], toTransforms: [toRoot], trajectory: { type: 'linear' }, easing: 'smoothstep', insertion: { axis, depthMm: 8 }, evidence: sourceFit(page, descriptions[page - 1]!, groupParts.map((p) => p.geometryId), 0.75) }], parentChanges: [], evidence: sourceFit(page, descriptions[page - 1]!, groupParts.map((p) => p.geometryId), 0.75) });
  }
  for (let page = 1; page <= 24; page++) {
    const pageParts = parts.filter((p) => introduced.get(p.id) === page);
    for (const p of pageParts) {
      const offset = offsets[p.subassemblyId!] ?? [0, 0, 0];
      const inWorkArea = { ...p, finalTransform: shifted(p.finalTransform, offset) };
      const op = mountPart(inWorkArea, { id: `${side}-mount-${p.id.slice(side.length + 1)}`, stepId: stepId(book, page), sourceReference: source(page), startMs: 0, durationMs: 2200,
        dependencies: page > 1 ? operations.filter((op) => op.stepId === stepId(book, page - 1)).map((op) => op.id) : [], cameraPreset: camera(page), ...mounting[p.id] });
      // Parts in one illustrated callout move together, with independent identity and installation events.
      operations.push(op);
    }
    if (page === 13) merge(page, outsideId);
    if (page === 22) merge(page, backId);
    if (page === 24) merge(page, clipId);
  }
  function point(p: PartInstance, id: string, type: ConnectionPoint['type'], nativePosition: Vec3, nativeRotation?: Quaternion, fit = p.placementEvidence): ConnectionPoint {
    // Connection-frame +Y follows the actual native bore/shaft axis, not a world-space contact guess.
    const axialX = ['2780', '6558', '32073', '3705', '4519', '11214', '6536', '63869'].includes(p.geometryId) ||
      (p.geometryId === '54675' && (id.includes('side') || id.includes('housing-seat') || id.includes('hub'))) ||
      (p.geometryId === '48989' && type !== 'pin' && !id.includes('yellow'));
    const axialZ = ['64179', '49295p01', '49283'].includes(p.geometryId) ||
      (p.geometryId === '54675' && (id.includes('front-face') || id.includes('rear-face'))) ||
      (p.geometryId === '48989' && (type === 'pin' || id.includes('yellow')));
    const orientation: Quaternion = nativeRotation ?? (axialX ? [0, 0, -s, s] : axialZ ? rx : [0, 0, 0, 1]);
    return { id, type, localTransform: nativeLDrawTransform(nativePosition, orientation), evidence: fit };
  }
  function mate(a: PartInstance, ap: ConnectionPoint, b: PartInstance, bp: ConnectionPoint, page: number, type: Connection['type'] = 'fixed'): void {
    connections.push(addMate(a, ap, b, bp, { id: `${side}-mate-${connections.length + 1}`, type, installedByOperationId: operations.find((op) => op.stepId === stepId(book, page) && op.partInstanceIds.includes(b.id))?.id, evidence: b.placementEvidence }));
  }
  const pin = (name: string) => partById.get(`${side}-${name}`)!;
  for (const [i, x] of [-40, 40].entries()) {
    const p = pin(`housing-pin-${i + 1}`);
    mate(motor, point(motor, `front-face-${i}`, 'hole', [x, 0, -30]), p, point(p, 'collar', 'pin', [0, 0, 0]), 1);
    mate(p, point(p, 'frame-bearing', 'pin', [-10, 0, 0]),
      frame, point(frame, `nose-side-bore-${i}`, 'hole', [-40, 0, x], [0, 0, -s, s]), 2);
  }
  for (const [i, z] of [20, 80, 120].entries()) {
    const p = pin(`housing-pin-${i + 3}`);
    mate(motor, point(motor, `lower-side-${z}`, 'hole', [sign * 50, 20, z]), p, point(p, 'collar', 'pin', [0, 0, 0]), 1);
  }
  // Independently authored native hub faces: coincident origin does not recenter either acquired mesh.
  mate(motor, point(motor, 'rotor-wheel-seat', 'surface', [0, -50, 0]), wheel, point(wheel, 'inner-hub-face', 'surface', [0, 0, -10]), 4, 'pivot');
  for (const [i, x] of [-20, 20].entries()) {
    const p = pin(`wheel-pin-${i + 1}`);
    mate(wheel, point(wheel, `outer-pin-${i}`, 'hole', [x, 0, 10]), p, point(p, 'wheel-collar', 'pin', [-10, 0, 0]), 5);
    mate(p, point(p, 'block-bearing', 'pin', [-20, 0, 0]), pink, point(pink, `lower-hole-${i}`, 'hole', [x, 0, 0]), 6);
  }
  mate(motor, point(motor, 'output-axle-engagement', 'axle-hole', [0, -40, 0]), shaft, point(shaft, 'rotor-engagement', 'axle', [30, 0, 0]), 14, 'pivot');
  for (const [i, x] of [-40, 40].entries()) {
    const p = pin(`rear-housing-pin-${i + 1}`);
    mate(motor, point(motor, `rear-face-${i}`, 'hole', [x, 0, 150]), p, point(p, 'rear-collar', 'pin', [0, 0, 0]), 15);
    mate(p, point(p, 'iframe-bearing', 'pin', [10, 0, 0]), iframe, point(iframe, `housing-endbar-${i}`, 'hole', [0, 0, x]), 22);
  }
  for (const [i, z] of [-20, 20].entries()) {
    const p = pin(`rotor-pin-${i + 1}`);
    mate(motor, point(motor, `rotor-pin-hole-${i}`, 'hole', [0, -50, z]), p, point(p, 'rotor-collar', 'pin', [0, 0, 0]), 3, 'pivot');
  }
  for (const [i, x] of [0, sign * 40].entries()) {
    const p = pin(`frame-pin-${i + 1}`);
    mate(frame, point(frame, `projecting-pin-seat-${i}`, 'hole', [50, 0, x], [0, 0, -s, s]), p, point(p, 'frame-collar', 'pin', [-10, 0, 0]), 3);
  }
  const frameBlock = pin('frame-block');
  for (const [i, z] of [-20, 20].entries()) {
    mate(frame, point(frame, `integral-block-hole-${i}`, 'hole', [-z, 0, sign * 70], rx),
      frameBlock, point(frameBlock, `integral-frame-pin-${i}`, 'pin', [0, z, -sign * 10]), 3);
  }
  mate(pin('brace-cross-3'), point(pin('brace-cross-3'), 'black-pin-front-seat', 'hole', [0, 20, -10], rx),
    pin('brace-pin'), point(pin('brace-pin'), 'lower-cross-collar', 'pin', [0, 0, 0]), 12);
  const lowerAxle = pin('brace-axle5');
  for (const [i, x] of [-40, 0, 40].entries()) {
    const p = pin(`brace-cross-${i + 1}`);
    mate(lowerAxle, point(lowerAxle, `cross-bearing-${i}`, 'axle', [x, 0, 0]), p, point(p, 'axle-bearing', 'axle-hole', [0, 0, 0]), i === 0 ? 7 : i === 1 ? 8 : 11);
  }
  for (const [i, x] of [-20, 20].entries()) {
    const p = pin(`brace-beam-${i + 1}`);
    mate(lowerAxle, point(lowerAxle, `beam-bearing-${i}`, 'axle', [x, 0, 0]), p, point(p, 'lower-axle-hole', 'axle-hole', [80, 0, 0]), i === 0 ? 8 : 10);
    for (const [j, z] of [-20, 20].entries()) {
      mate(pin('brace-upper-block'), point(pin('brace-upper-block'), `beam-${i}-pin-${j}`, 'pin', [0, z, i === 0 ? -10 : 10]),
        p, point(p, `upper-integral-pin-${j}`, 'hole', [0, i === 0 ? 10 : -10, z === 20 ? -160 : -120]), i === 0 ? 9 : 10);
    }
  }
  mate(pin('brace-upper-block'), point(pin('brace-upper-block'), 'centre-shaft-bearing', 'hole', [0, 0, 0]), shaft, point(shaft, 'outside-shaft-bearing', 'axle', [-30, 0, 0]), 14, 'pivot');
  mate(pin('brace-upper-block'), point(pin('brace-upper-block'), 'yellow-axle-bearing', 'hole', [0, 20, 0]), pin('brace-axle3'), point(pin('brace-axle3'), 'central-bearing', 'axle', [0, 0, 0]), 9);
  mate(clipPin, point(clipPin, 'clip-bearing', 'pin', [10, 0, 0]), clip, point(clip, 'native-cross-bore', 'axle-hole', [0, 0, 0]), 23);
  mate(motor, point(motor, 'clip-housing-seat', 'hole', [sign * 50, -20, 20]), clipPin, point(clipPin, 'housing-collar', 'pin', [-10, 0, 0]), 24);
  for (const [i, rowX] of [0, 20].entries()) {
    const p = pin(`rear-blue-pin-${i + 1}`);
    mate(pin('rear-cross-1'), point(pin('rear-cross-1'), `blue-collar-${i}`, 'hole', [rowX, 20, sign * 10], rx),
      p, point(p, 'cross-collar', 'pin', [-10, 0, 0]), 16);
    mate(p, point(p, 'beam-bearing', 'pin', [0, 0, 0]), pin('rear-beam'),
      point(pin('rear-beam'), `round-row-hole-${i}`, 'hole', [40 + i * 20, 0, 0]), 17);
    mate(p, point(p, 'second-cross-bearing', 'pin', [20, 0, 0]), pin('rear-cross-2'),
      point(pin('rear-cross-2'), `blue-bearing-${i}`, 'hole', [rowX, 20, 0], rx), 18);
  }
  for (const i of [0, 1]) {
    const cross = pin(`rear-cross-${i + 1}`);
    const red = pin(`rear-red-pin-${i + 1}`);
    mate(cross, point(cross, 'red-axle-bearing', 'axle-hole', [0, 0, 0]),
      red, point(red, 'axle-bearing', 'axle', [20, 0, 0]), 19);
    mate(red, point(red, 'iframe-pin-bearing', 'pin', [0, 0, 0]),
      iframe, point(iframe, `spine-red-${i}`, 'hole', [0, 0, i === 0 ? -sign * 20 : sign * 20], [0, 0, -s, s]), 20);
    mate(red, point(red, 'yellow-pin-bearing', 'pin', [-20, 0, 0]),
      pin('rear-yellow-beam'), point(pin('rear-yellow-beam'), `red-pin-hole-${i}`, 'hole', [0, 0, i === 0 ? -sign * 20 : sign * 20]), 21);
  }
  const attachmentSites: BuildFragment['attachmentSites'] = {};
  function site(key: string, p: PartInstance, nativePosition: Vec3, description: string, page: number, type: ConnectionPoint['type'] = 'hole', rotation?: Quaternion): void {
    const cp = point(p, `integration-${key}`, type, nativePosition, rotation);
    p.connectionPoints.push(cp);
    attachmentSites[key] = { partInstanceId: p.id, connectionPointId: cp.id, description, sourceReference: source(page) };
  }
  site('motor-electrical', motor, [0, 14, 142], 'Captive cable stub:54675→u9367c01.dat native[0,14,142], source motor unit includes its cable; not an additional prepared unit or detachable motor-side plug.', 1, 'electrical', rx);
  for (const [i, z] of [80, 120].entries()) {
    site(`front-join-${i + 1}`, pin(`housing-pin-${i + 4}`), [0, 0, 0], `Housing-pin collar seat on Front39790 upper face; motor native x=${sign * 50},y20,z${z}. Frame +Y follows downward native ${sign > 0 ? '+' : '-'}X.`, 1, 'pin', [0, 0, -sign * s, s]);
    site(`hub-${i === 0 ? 'front' : 'rear'}`, motor, [-sign * 50, 20, z], 'Actual opposite housing-side hole, not a certified hub fit; integration must select source seat and hub orientation.', 1);
    site(`hub-outer-${i + 1}`, motor, [-sign * 50, -20, z], 'Second actual upper housing bore; no arbitrary bounding-box attachment.', 1);
  }
  for (const [i, x] of [0, sign * 40].entries()) {
    site(`rear-join-${i + 1}`, pin(`frame-pin-${i + 1}`), [20, 0, 0], `Source3 adjacent front-long-rail pin second bearing at motor native[${x},0,-160], axis motorZ; not a guessed symmetric±20 pair.`, 3, 'pin');
  }
  site('stop-axle5', pin('rear-cross-1'), [-20, 20, -sign * 10], 'Unoccupied END round triple-pin bore, not the red-occupied axle bore. Actual upper bore face; source13 correspondence and lower retention remain to be validated.', 16, 'hole', [sign * s, 0, 0, s]);
  site('stop-axle5-opposite', pin('rear-cross-2'), [-20, 20, sign * 10], 'Same unoccupied round-bore line at opposite cross-block lower face. No invented Front-rail or spacer mating.', 18, 'hole', [sign * s, 0, 0, s]);
  site('rear-iframe-upper', iframe, [0, 0, -40], 'Actual14720 end-bar centre, not a source-certified upper7x11 attachment.', 20);
  for (const p of parts) {
    if (p.connectionPoints.length !== 0) continue;
    const nativePosition: Vec3 = p.geometryId === '32009' ? [80, 0, 0] : [0, 0, 0];
    p.connectionPoints.push(point(p, 'native-inspection-feature', p.geometryId === '63869' ? 'axle-hole' : p.geometryId === '2780' || p.geometryId === '6558' || p.geometryId === '11214' ? 'pin' : 'hole', nativePosition));
  }
  const steps: AssemblyStep[] = descriptions.map((description, index) => {
    const page = index + 1;
    return { id: stepId(book, page), title: `${side === 'right' ? 'Right' : 'Left'} side — ${page}`, description, kind: 'numbered-instruction', action: [13, 22, 24].includes(page) ? 'reuse' : 'assembly',
      sourceReferences: [source(page)], operationIds: operations.filter((op) => op.stepId === stepId(book, page)).map((op) => op.id), requiredPartInstanceIds: parts.filter((p) => introduced.get(p.id) === page).map((p) => p.id),
      warnings: [], durationMs: [13, 22, 24].includes(page) ? 3400 : 2800, cameraPreset: camera(page) };
  });
  const assemblyEvidence = sourceFit(24, 'Complete source module hierarchy, including fixed housing and genuinely driven wheel/shaft group; no second motor inventory unit for rotor.', ['54675', '49295p01']);
  const rootParts = parts.filter((p) => p.subassemblyId === rootId).map((p) => p.id);
  const groupIds = [wheelId, outsideId, backId, clipId];
  const modeledRate = evidence('app-authored', 'Conservative application command ceiling2rad/s, not measured motor specification or encoder polarity. Continuous drive rotation; physical stops and calibrated rates unknown.', [], 1);
  const wheelOrigin = nativeLDrawTransform([0, -60, 0]);
  return {
    rootId, parts, steps, operations,
    installations: parts.map((p) => { const op = operations.find((op) => op.partInstanceIds.includes(p.id))!; return { partInstanceId: p.id, stepId: op.stepId, atMs: op.startMs + op.durationMs, operationId: op.id }; }),
    visibility: [],
    subassemblies: [{ id: rootId, name: `${side} drive module`, localTransform: identityTransform(), partInstanceIds: rootParts, childSubassemblyIds: groupIds, evidence: assemblyEvidence },
      ...groupIds.map((id) => ({ id, name: id, parentId: rootId, localTransform: identityTransform(), partInstanceIds: parts.filter((p) => p.subassemblyId === id).map((p) => p.id), childSubassemblyIds: [], evidence: assemblyEvidence }))],
    connections,
    joints: [{ id: `${side}-wheel-joint`, name: `${side} drive wheel and shaft`, type: 'revolute', parent: { kind: 'subassembly', id: rootId }, child: { kind: 'subassembly', id: wheelId }, origin: wheelOrigin,
      childTransform: relativeTransform(wheelOrigin, identityTransform()), axis: [0, side === 'right' ? -1 : 1, 0], zero: 0, maxSpeed: { value: 2, basis: 'modeled', evidence: modeledRate }, drivenByMotorId: `${side}-drive-motor`,
      internalBinding: { partInstanceId: motor.id, geometryNodeId: 'parts/u9363.dat', movingSide: 'rotor' }, evidence: assemblyEvidence }],
    linkageConstraints: [], motors: [{ id: `${side}-drive-motor`, partInstanceId: motor.id, port: side === 'left' ? 'A' : 'E', jointId: `${side}-wheel-joint`, assignmentEvidence: evidence('documented', `Book5 source drive port${side === 'left' ? 'A' : 'E'}; mechanical positive joint angle is not a claim about hardware encoder polarity.`, [{ ...advancedDrivingBaseDocuments[4]!, documentId: advancedDrivingBaseDocuments[4]!.id, page: side === 'left' ? 6 : 8, instructionId: side === 'left' ? '3' : '5', sourceUrl: `${advancedDrivingBaseDocuments[4]!.sourceUrl}#page=${side === 'left' ? 6 : 8}`, confidence: 0.98 }]) }],
    cables: [],
    inventory: Object.keys(families).flatMap((family) => { const selected = parts.filter((p) => familyByPartId[p.id] === family); return selected.length ? [{ id: `${side}-inventory-${family}`, name: families[family]![3], scope: 'robot' as const, basis: 'prepared-callout-units' as const, accounting: 'tracked' as const, quantity: selected.length, partInstanceIds: selected.map((p) => p.id), sourceReferences: [...new Set(selected.map((p) => introduced.get(p.id)!))].map(source) }] : []; }),
    milestones: [{ id: `${side}-wheel-seated`, title: `${side} wheel and retaining block`, stepId: stepId(book, 6) }, { id: `${side}-outside-seated`, title: `${side} outside reinforcement joined`, stepId: stepId(book, 13) }, { id: `${side}-complete`, title: `${side === 'right' ? 'Right' : 'Left'} drive module`, stepId: stepId(book, 24) }],
    sourceMappings: operations.map((op) => ({ source: op.sourceReference!, stepId: op.stepId, operationId: op.id })), attachmentSites, familyByPartId
  };
}

export const rightSide: BuildFragment = makeSide('right', 2);
export const leftSide: BuildFragment = makeSide('left', 3);
