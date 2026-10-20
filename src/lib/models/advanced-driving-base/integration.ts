import type { AssemblyOperation, CameraPreset, Connection, PartInstance, PlacementEvidence, RobotModel, SourceReference, Transform, Vec3 } from '../../types/model.ts';
import { composeTransforms, identityTransform, relativeTransform, transformsEqual } from '../../core/transforms.ts';
import { evidence, mountPart, nativeLDrawTransform, placement, stepId, type BuildFragment } from '../authoring.ts';
import { advancedDrivingBaseDocuments } from '../catalog.ts';
import measuredBounds from '../../../../docs/validation/component-bounds.json' with { type: 'json' };

export const robotRootId = 'adb-robot';
const point = (frame: Transform, position: Vec3): Vec3 => composeTransforms(frame, { ...identityTransform(), position }).position;
const direction = (frame: Transform, vector: Vec3): Vec3 => point({ ...frame, position: [0, 0, 0] }, vector);
export const transformCamera = (frame: Transform, camera: CameraPreset): CameraPreset => ({
  ...camera, position: point(frame, camera.position), target: point(frame, camera.target), up: direction(frame, camera.up)
});

/** Fragment geometry ends in the robot frame; assembly tracks run in its separate work area. */
export function transformFragment(fragment: BuildFragment, work: Transform, final: Transform): BuildFragment {
  const world = (value: Transform): Transform => composeTransforms(work, value);
  return {
    ...fragment,
    parts: fragment.parts.map((part) => ({ ...part, initialTransform: world(part.initialTransform), finalTransform: composeTransforms(final, part.finalTransform), connectionPoints: part.connectionPoints.map((entry) => ({ ...entry })) })),
    steps: fragment.steps.map((step) => ({ ...step, ...(step.cameraPreset ? { cameraPreset: transformCamera(work, step.cameraPreset) } : {}) })),
    operations: fragment.operations.map((operation) => ({
      ...operation, fromTransforms: operation.fromTransforms.map(world), toTransforms: operation.toTransforms.map(world),
      ...(operation.cameraPreset ? { cameraPreset: transformCamera(work, operation.cameraPreset) } : {}),
      stages: operation.stages.map((stage) => ({
        ...stage, fromTransforms: stage.fromTransforms.map(world), toTransforms: stage.toTransforms.map(world),
        trajectory: stage.trajectory.type === 'linear' ? stage.trajectory : { type: 'cubic-bezier', control1: point(work, stage.trajectory.control1), control2: point(work, stage.trajectory.control2) },
        ...(stage.insertion ? { insertion: { ...stage.insertion, axis: direction(work, stage.insertion.axis) } } : {}),
        ...(stage.spin ? { spin: { ...stage.spin, axis: direction(work, stage.spin.axis) } } : {})
      })),
      parentChanges: operation.parentChanges.map((change) => ({ ...change,
        fromLocalTransform: change.fromParent === null ? world(change.fromLocalTransform) : change.fromLocalTransform,
        toLocalTransform: change.toParent === null ? world(change.toLocalTransform) : change.toLocalTransform
      }))
    })),
    subassemblies: fragment.subassemblies.map((assembly) => assembly.id === fragment.rootId
      ? { ...assembly, parentId: robotRootId, localTransform: composeTransforms(work, assembly.localTransform) }
      : { ...assembly }),
    cables: fragment.cables.map((cable) => ({ ...cable, controlPoints: cable.controlPoints.map((control) => control.parent === null ? { ...control, position: point(final, control.position) } : control) })),
    linkageConstraints: fragment.linkageConstraints.map((constraint) => ({ ...constraint, planeNormal: direction(final, constraint.planeNormal) }))
  };
}

export function attachmentFrame(fragment: BuildFragment, key: string): Transform {
  const site = fragment.attachmentSites[key];
  if (!site) throw new Error(`${fragment.rootId}: missing source-backed attachment site ${key}`);
  const part = fragment.parts.find((entry) => entry.id === site.partInstanceId);
  const connection = part?.connectionPoints.find((entry) => entry.id === site.connectionPointId);
  if (!part || !connection) throw new Error(`${fragment.rootId}.${key}: unresolved mechanical attachment frame`);
  return composeTransforms(part.finalTransform, connection.localTransform);
}

/** Root movement snapshots include every actual descendant; no reuse creates another instance. */
export function mergeModule(fragment: BuildFragment, work: Transform, final: Transform, options: {
  id: string; stepId: string; sourceReference: AssemblyOperation['sourceReference']; evidence: PlacementEvidence;
  cameraPreset: CameraPreset; dependencies: string[]; durationMs: number; axis: Vec3; depthMm: number;
}): AssemblyOperation {
  const aligned: Transform = { ...final, position: final.position.map((value, index) => value - options.axis[index]! * options.depthMm) as Vec3 };
  const insertionMs = 1000;
  return {
    id: options.id, stepId: options.stepId, operationType: 'merge-subassemblies',
    partInstanceIds: fragment.parts.map((part) => part.id),
    fromTransforms: fragment.parts.map((part) => composeTransforms(work, part.finalTransform)),
    toTransforms: fragment.parts.map((part) => composeTransforms(final, part.finalTransform)),
    durationMs: options.durationMs, startMs: 0, easing: 'smoothstep', dependencies: options.dependencies,
    cameraPreset: options.cameraPreset, sourceReference: options.sourceReference, evidence: options.evidence, parentChanges: [],
    stages: [
      { id: `${options.id}-approach`, startMs: 0, durationMs: options.durationMs - insertionMs, phase: 'approach', nodes: [{ kind: 'subassembly', id: fragment.rootId }], fromTransforms: [work], toTransforms: [aligned], trajectory: { type: 'linear' }, easing: 'smoothstep', evidence: { ...options.evidence, placement: 'presentation-only', evidence: { category: 'app-authored', confidence: 1, sources: [], note: 'Separate work-area transfer and timing are presentation, not source-measured physical motion.' } } },
      { id: `${options.id}-seat`, startMs: options.durationMs - insertionMs, durationMs: insertionMs, phase: 'insert', nodes: [{ kind: 'subassembly', id: fragment.rootId }], fromTransforms: [aligned], toTransforms: [final], trajectory: { type: 'linear' }, easing: 'smoothstep', insertion: { axis: options.axis, depthMm: options.depthMm }, evidence: options.evidence }
    ]
  };
}

export function inventoryBySource(parts: PartInstance[], familyByPartId: Record<string, string>): RobotModel['inventory'] {
  const groups = new Map<string, PartInstance[]>();
  for (const part of parts) {
    const family = familyByPartId[part.id];
    if (!family) throw new Error(`Missing source inventory family for ${part.id}`);
    const key = `${part.sourceReference?.documentId}:${family}`;
    const group = groups.get(key) ?? [];
    group.push(part); groups.set(key, group);
  }
  return [...groups].map(([key, group]) => ({ id: key.replace(':', '-'), name: group[0]!.name, scope: 'robot', basis: 'prepared-callout-units', accounting: 'tracked', quantity: group.length, partInstanceIds: group.map((part) => part.id), sourceReferences: [...new Map(group.map((part) => [`${part.sourceReference!.documentId}:${part.sourceReference!.page}`, part.sourceReference!])).values()] }));
}


/** Build-time cross-check against the independently researched source callout rows. */
export function reconcileSourceInventory(model: RobotModel, families: Record<string, string>, expectedByBook: Record<string, Record<string, number>>): void {
  const actual: Record<string, Record<string, number>> = {};
  for (const part of model.parts) {
    const book = part.sourceReference?.documentId.match(/^adb-book([1-5])$/)?.[1];
    const family = families[part.id];
    if (!book || !family) throw new Error(`ADB ${part.id}: missing exact source book/family`);
    const row = actual[book] ?? (actual[book] = {});
    row[family] = (row[family] ?? 0) + 1;
  }
  for (const book of new Set([...Object.keys(actual), ...Object.keys(expectedByBook)])) {
    const actualRow = actual[book] ?? {}, expectedRow = expectedByBook[book] ?? {};
    for (const family of new Set([...Object.keys(actualRow), ...Object.keys(expectedRow)])) {
      if ((actualRow[family] ?? 0) !== (expectedRow[family] ?? 0)) {
        throw new Error(`ADB Book ${book} ${family}: authored ${actualRow[family] ?? 0}, source callouts ${expectedRow[family] ?? 0}`);
      }
    }
  }
  if (model.parts.length !== 234 || Object.keys(families).length !== 234) throw new Error('ADB requires 234 unique prepared callout units, without reuse duplicates');
  const expectedSteps = [38, 24, 24, 31, 19];
  if (model.steps.length !== 136) throw new Error('ADB requires every one of the 136 source instructions');
  for (const [index, count] of expectedSteps.entries()) {
    for (let number = 1; number <= count; number++) {
      if (!model.steps.some((step) => step.id === `book${index + 1}-step${number}`)) throw new Error(`ADB missing Book ${index + 1} instruction ${number}`);
    }
  }
}

const assemblyDocument = advancedDrivingBaseDocuments[4]!;
export const assemblySource = (number: number): SourceReference => ({ documentId: assemblyDocument.id, page: number + 3, instructionId: String(number), figure: `Assembly instruction ${number}`, sourceUrl: `${assemblyDocument.sourceUrl}#page=${number + 3}`, confidence: 0.98 });
export function assemblyFit(number: number, note: string, geometryIds: string[]): PlacementEvidence {
  return placement(evidence('documented', note, [assemblySource(number)], 0.98), evidence('cad-derived', note, geometryIds.map((id) => ({ documentId: `ldraw-${id}`, sourceUrl: `https://library.ldraw.org/library/official/parts/${id}.dat`, figure: 'Native source connection primitives; no recentering', confidence: 0.95 }))));
}

/** The fifteen new Book5 units; completed source modules are reused, never recounted. */
export function createAssemblyHardware(poses: {
  hub: Transform; topFrame: Transform; underside: Transform;
  stopAxles: [Transform, Transform]; bushes: [Transform, Transform];
}): BuildFragment {
  const result: BuildFragment = {
    rootId: 'adb-hardware', parts: [], steps: [], operations: [], installations: [], visibility: [], subassemblies: [], connections: [], joints: [], linkageConstraints: [], motors: [], cables: [], inventory: [], milestones: [], sourceMappings: [], attachmentSites: {}, familyByPartId: {}
  };
  const hubWork: Transform = { ...poses.hub, position: [32, 80, 250] };
  const topWork: Transform = { ...poses.topFrame, position: [300, 40, 0] };
  const undersideWork: Transform = { ...identityTransform(), position: [-300, 0, 0] };
  const frameFit = assemblyFit(11, '39794 has 20-LDU hole pitch. The source pair enters its long-edge transverse bores at native x=70,z=±40. 11214 collar is local x=10; native Ry(pi) places that collar at the outer face, axle inward and two-length pin outward. Axle-side insertion is20 LDU=8mm.', ['39794', '11214']);
  const braceFit = assemblyFit(15, '64179 long rail centers are native x=±40; outer faces x=±50. Two frames are120 LDU apart across X, leaving the20-LDU 48989 body gap. Its integral pins at native y=±20,z=±10 join the adjacent frame side bores at long coordinates±20. The four outer corner holes are native(x,z)=(±40,±60).', ['64179', '48989', '2780']);
  const hubFit = assemblyFit(8, 'The prepared hub includes its battery; Book5 introduces one prepared unit. Native 45601c01 side mounting bores are inherited from u9402 at x=±60,y=-10/-30/-50,z=±80; the port and body origins are preserved.', ['45601c01']);
  const stopFit = assemblyFit(13, '15462 axle is along native X from -50 to+50 LDU. The stop shoulder is x=48; tip-to-shoulder seating travel98 LDU=39.2mm. Source support bores, not mesh bounds, determine final orientation and stop seat.', ['15462']);
  const bushFit = assemblyFit(14, '3713 axis is native Z and its flange planes are z=±10 LDU. Source underside view identifies the two projecting axle ends; each bush seats on the actual lower support face.', ['3713', '15462']);
  const camera: CameraPreset = { position: [280, 240, -280], target: [32, 20, 64], up: [0, 1, 0], projection: 'perspective', framing: 48, transitionMs: 650 };
  const groups = [
    { id: 'assembly-hub', name: 'Prepared six-port hub with battery', work: hubWork, final: poses.hub, fit: hubFit },
    { id: 'assembly-top-frame', name: 'Book5 front upper frame', work: topWork, final: poses.topFrame, fit: frameFit },
    { id: 'assembly-underside', name: 'Paired underside reinforcement frames', work: undersideWork, final: poses.underside, fit: braceFit }
  ];
  const localById: Record<string, Transform> = {};
  const groupById: Record<string, typeof groups[number]> = {};
  function add(id: string, family: string, geometryId: string, material: number, name: string, number: number, local: Transform, fit: PlacementEvidence, group?: typeof groups[number]): PartInstance {
    const index = result.parts.length;
    const finalTransform = group ? composeTransforms(group.final, local) : local;
    const part: PartInstance = { id, geometryId, materialId: `ldraw-${material}`, name, finalTransform, initialTransform: { ...finalTransform, position: [(-5 + index % 8) * 105, 0, 430 + Math.floor(index / 8) * 115] }, connectionPoints: [], subassemblyId: group?.id ?? result.rootId, sourceReference: assemblySource(number), geometryConfidence: 0.95, inventoryScope: 'robot', category: geometryId === '45601c01' ? 'controller' : geometryId === '64179' || geometryId === '39794' ? 'structure' : 'connector', identityEvidence: evidence('diagram-derived', `${family}: genuine ${geometryId}.dat source-shape crosswalk; historical manufacturer element/mold not certified.`, [assemblySource(number)]), placementEvidence: fit };
    result.parts.push(part); result.familyByPartId[id] = family; localById[id] = local;
    if (group) groupById[id] = group;
    return part;
  }
  add('assembly-hub-unit', 'hub', '45601c01', 15, 'Six-port hub with installed battery', 1, identityTransform(), hubFit, groups[0]!);
  const topFrame = add('assembly-top-frame-unit', 'pink-frame7x11', '39794', 26, 'Magenta11×7 upper frame', 11, identityTransform(), frameFit, groups[1]!);
  for (const [index, z] of [-40, 40].entries()) add(`assembly-top-pin-${index + 1}`, 'red-axlepin3', '11214', 4, 'Red axle/pin — front tool attachment', 11, nativeLDrawTransform([80, 0, z], [0, 1, 0, 0]), frameFit, groups[1]!);
  for (let index = 0; index < 2; index++) add(`assembly-stop-axle-${index + 1}`, 'brown-axle5stop', '15462', 70, 'Reddish-brown5L axle with stop', 13, poses.stopAxles[index]!, stopFit);
  for (let index = 0; index < 2; index++) add(`assembly-bush-${index + 1}`, 'grey-bush', '3713', 71, 'Gray axle retaining bush', 14, poses.bushes[index]!, bushFit);
  const firstBrace = add('assembly-underside-frame-1', 'black-frame5x7', '64179', 0, 'Black7×5 underside frame — first', 15, nativeLDrawTransform([-60, 0, 0]), braceFit, groups[2]!);
  const cross = add('assembly-underside-crossblock', 'grey-pinbeam3', '48989', 71, 'Gray four-integral-pin frame bridge', 15, nativeLDrawTransform([0, 0, 0], [0.5, 0.5, 0.5, 0.5]), braceFit, groups[2]!);
  const secondBrace = add('assembly-underside-frame-2', 'black-frame5x7', '64179', 0, 'Black7×5 underside frame — second', 16, nativeLDrawTransform([60, 0, 0]), braceFit, groups[2]!);
  for (const [index, [x, z]] of [[-100, -60], [-100, 60], [100, -60], [100, 60]].entries()) add(`assembly-underside-pin-${index + 1}`, 'black-pin2', '2780', 0, 'Black outer-corner reinforcement pin', 17, nativeLDrawTransform([x!, -10, z!], [0, 0, -Math.SQRT1_2, Math.SQRT1_2]), braceFit, groups[2]!);
  result.subassemblies = [{ id: result.rootId, name: 'Book5 integration hardware', parentId: robotRootId, localTransform: identityTransform(), partInstanceIds: result.parts.filter((part) => part.subassemblyId === result.rootId).map((part) => part.id), childSubassemblyIds: groups.map((group) => group.id), evidence: hubFit }, ...groups.map((group) => ({ id: group.id, name: group.name, parentId: result.rootId, localTransform: group.work, partInstanceIds: result.parts.filter((part) => part.subassemblyId === group.id).map((part) => part.id), childSubassemblyIds: [], evidence: group.fit }))];
  for (const part of result.parts) {
    const number = Number(part.sourceReference!.instructionId);
    const group = groupById[part.id];
    const target = group ? composeTransforms(group.work, localById[part.id]!) : part.finalTransform;
    const axis: Vec3 | undefined = part.geometryId === '11214' ? direction(topWork, [-1, 0, 0]) : part.geometryId === '15462' ? [0, -1, 0] : part.geometryId === '3713' || part.geometryId === '2780' ? [0, 1, 0] : part.id === cross.id || part.id === secondBrace.id ? [-1, 0, 0] : undefined;
    const startsAfterFrame = part.geometryId === '11214' || part.id === cross.id;
    const dependencies = part.geometryId === '11214' ? [`mount-${topFrame.id}`] : part.id === cross.id ? [`mount-${firstBrace.id}`] : part.id === secondBrace.id ? [`mount-${cross.id}`] : part.geometryId === '2780' ? [`mount-${firstBrace.id}`, `mount-${secondBrace.id}`] : part.geometryId === '3713' ? [`mount-assembly-stop-axle-${part.id.endsWith('1') ? 1 : 2}`] : [];
    const operation = mountPart({ ...part, finalTransform: target }, { stepId: stepId(5, number), sourceReference: assemblySource(number), startMs: startsAfterFrame ? 1700 : 0, durationMs: part.id === topFrame.id || part.id === firstBrace.id ? 1500 : 3000, dependencies, cameraPreset: camera, ...(axis ? { axis, depthMm: part.geometryId === '15462' ? 39.2 : 8 } : {}) });
    result.operations.push(operation); result.installations.push({ partInstanceId: part.id, stepId: operation.stepId, atMs: operation.startMs + operation.durationMs, operationId: operation.id });
    result.sourceMappings.push({ source: operation.sourceReference!, stepId: operation.stepId, operationId: operation.id });
  }
  function internalMate(a: PartInstance, b: PartInstance, world: Transform, id: string, installedByOperationId: string): void {
    const aPoint = `${id}-receiver`, bPoint = `${id}-moving`;
    a.connectionPoints.push({ id: aPoint, type: 'hole', localTransform: relativeTransform(a.finalTransform, world), evidence: braceFit });
    b.connectionPoints.push({ id: bPoint, type: 'pin', localTransform: relativeTransform(b.finalTransform, world), evidence: braceFit });
    result.connections.push({ id, a: { partInstanceId: a.id, connectionPointId: aPoint }, b: { partInstanceId: b.id, connectionPointId: bPoint }, type: 'fixed', installedByOperationId, evidence: braceFit });
  }
  for (const [index, z] of [-8, 8].entries()) {
    internalMate(firstBrace, cross, composeTransforms(poses.underside, { ...identityTransform(), position: [-4, 0, z] }), `assembly-bridge-left-${index + 1}`, 'mount-assembly-underside-crossblock');
    internalMate(cross, secondBrace, composeTransforms(poses.underside, { ...identityTransform(), position: [4, 0, z] }), `assembly-bridge-right-${index + 1}`, 'mount-assembly-underside-frame-2');
  }
  for (const [index, z] of [-40, 40].entries()) internalMate(topFrame, result.parts.find((part) => part.id === `assembly-top-pin-${index + 1}`)!, composeTransforms(poses.topFrame, nativeLDrawTransform([70, 0, z])), `assembly-top-axlepin-${index + 1}`, `mount-assembly-top-pin-${index + 1}`);
  for (let index = 0; index < 4; index++) {
    const pin = result.parts.find((part) => part.id === `assembly-underside-pin-${index + 1}`)!;
    internalMate(index < 2 ? firstBrace : secondBrace, pin, { ...pin.finalTransform }, `assembly-underside-corner-${index + 1}`, `mount-${pin.id}`);
  }
  for (const [group, number, axis, depth] of [[groups[0]!, 8, [0, -1, 0], 8], [groups[1]!, 12, [0, -1, 0], 8], [groups[2]!, 18, [0, 1, 0], 8]] as const) {
    const fragment = { ...result, rootId: group.id, parts: result.parts.filter((part) => part.subassemblyId === group.id).map((part) => ({ ...part, finalTransform: localById[part.id]! })) };
    result.operations.push(mergeModule(fragment, group.work, group.final, { id: `assembly-seat-${group.id}`, stepId: stepId(5, number), sourceReference: assemblySource(number), evidence: group.fit, cameraPreset: camera, dependencies: fragment.parts.map((part) => `mount-${part.id}`), durationMs: 4000, axis: [...axis] as Vec3, depthMm: depth }));
  }
  result.inventory = inventoryBySource(result.parts, result.familyByPartId);
  return result;
}

export function createDrivingScenario(model: RobotModel): RobotModel['scenarios'][number] {
  const left = model.motors.find((motor) => motor.port === 'A'), right = model.motors.find((motor) => motor.port === 'E');
  const front = model.motors.find((motor) => motor.port === 'D'), rear = model.motors.find((motor) => motor.port === 'C');
  const leftWheel = model.parts.find((part) => part.id === 'left-wheel'), rightWheel = model.parts.find((part) => part.id === 'right-wheel');
  if (!left?.jointId || !right?.jointId || !front?.jointId || !rear?.jointId || !leftWheel || !rightWheel) throw new Error('ADB scenario requires both actual wheels and four source-port motor bindings');
  const extension = evidence('app-authored', 'RoboBuild demonstration extension: conservative modeled command rates, scripted color inputs and course waypoints; not a LEGO program or calibrated motor/traction measurement.', [], 1);
  const commands: RobotModel['scenarios'][number]['motorCommands'] = [];
  const phases = [
    [0, 4000, 2, 2], [4000, 2000, 1, 2], [6000, 4000, 2, 2], [10000, 2000, 2, 1], [12000, 4000, 2, 2], [16000, 2000, 0, 0]
  ];
  for (const [startMs, durationMs, leftSpeed, rightSpeed] of phases) for (const [motor, speed] of [[left, leftSpeed], [right, rightSpeed]] as const) commands.push({ motorId: motor.id, startMs: startMs!, durationMs: durationMs!, mode: 'speed', from: speed!, to: speed!, unit: 'rad/s', easing: 'linear', evidence: extension });
  for (const [motor, startMs, from, to] of [[front, 18000, 0, Math.PI / 2], [rear, 20000, 0, -Math.PI / 3], [front, 22000, Math.PI / 2, 0], [rear, 24000, -Math.PI / 3, 0]] as const) commands.push({ motorId: motor.id, startMs, durationMs: 1800, mode: 'position', from, to, unit: 'rad', easing: 'smoothstep', evidence: extension });
  const sensors = model.connections.filter((connection) => connection.type === 'electrical' && (connection.id === 'assembly-wire-B' || connection.id === 'assembly-wire-F'));
  const midpoint = leftWheel.finalTransform.position.map((value, index) => (value + rightWheel.finalTransform.position[index]!) / 2) as Vec3;
  return {
    id: 'adb-driving-course', title: 'Driving course and independent outputs — RoboBuild extension',
    description: 'The assembled robot follows a deterministic differential-drive course, reports scripted B/F color inputs, then independently exercises front D and rear C output gears. Course behavior is authored by RoboBuild, not copied from a manufacturer program.',
    fidelity: 'deterministic-kinematics', durationMs: 26000, motorCommands: commands,
    sensorSignals: sensors.flatMap((connection) => [{ sensorPartInstanceId: connection.a.partInstanceId, port: connection.id.endsWith('B') ? 'B' : 'F', timeMs: 0, type: 'color' as const, value: 'white', basis: 'scripted-input' as const, evidence: extension }, { sensorPartInstanceId: connection.a.partInstanceId, port: connection.id.endsWith('B') ? 'B' : 'F', timeMs: 6000, type: 'color' as const, value: 'black', basis: 'scripted-input' as const, evidence: extension }, { sensorPartInstanceId: connection.a.partInstanceId, port: connection.id.endsWith('B') ? 'B' : 'F', timeMs: 12000, type: 'color' as const, value: 'white', basis: 'scripted-input' as const, evidence: extension }]),
    objectEvents: [], rootMotion: [],
    differentialDrive: { rootSubassemblyId: robotRootId, leftJointId: left.jointId, rightJointId: right.jointId, wheelRadiusMm: 44, trackWidthMm: Math.abs(leftWheel.finalTransform.position[0] - rightWheel.finalTransform.position[0]), axleCenterInRoot: midpoint, initialTransform: identityTransform(), evidence: evidence('cad-derived', 'Wheel-center track and root-local axle midpoint come from actual assembled49295p01 centers. Radius44mm is the source88mm nominal family radius, not a certified measurement (licensed mesh outer radius43.9058mm). Forward=-Z,Yup; positive wheel coordinates rotate about world-X. No traction/collision physics claimed.', [leftWheel.sourceReference!, rightWheel.sourceReference!]) },
    limitations: ['Course props and collision boundaries are separate RoboBuild simulation objects, not source robot parts; source BOM remains234 units.', 'Color samples are scripted educational inputs, not an optical rendering model.', 'Motor rates, zero positions and path limits are modeled; physical calibration, slip, compliance, cable dynamics and collision physics are not certified.', 'Only actual powered wheels and front/rear pinned output gears move; no optional tool accessory is invented.'],
    sourceReferences: [assemblySource(1), assemblySource(2), assemblySource(3), assemblySource(4), assemblySource(5)]
  };
}

/** Shelf-pack real rotated licensed bounds, preserving every geometry's native origin. */
export function organizeInitialInventory(model: RobotModel): RobotModel {
  const boundsById = Object.fromEntries(measuredBounds.assets.map((asset) => [asset.id, asset]));
  const originals: Record<string, Transform> = {}, staged: Record<string, Transform> = {};
  const preserved: Record<string, true> = { 'beam-1': true, 'pin-1': true, 'pin-2': true, 'grey-connector-1': true, 'grey-connector-2': true, 'pin-3': true, 'pin-4': true };
  let x = -500, z = 250, rowDepth = 0;
  for (const part of model.parts) {
    if (preserved[part.id]) continue;
    const bounds = boundsById[part.geometryId];
    const geometry = model.geometryAssets.find((asset) => asset.id === part.geometryId);
    if (!bounds || geometry?.sha256 !== bounds.sha256) throw new Error(`ADB ${part.id}: exact licensed geometry bounds missing or stale`);
    const rotation = { ...part.initialTransform, position: [0, 0, 0] as Vec3 };
    const corners = [0, 1, 2, 3, 4, 5, 6, 7].map((mask) => point(rotation, [mask & 1 ? bounds.max[0]! : bounds.min[0]!, mask & 2 ? bounds.max[1]! : bounds.min[1]!, mask & 4 ? bounds.max[2]! : bounds.min[2]!]));
    const min = [0, 1, 2].map((axis) => Math.min(...corners.map((corner) => corner[axis]!)));
    const max = [0, 1, 2].map((axis) => Math.max(...corners.map((corner) => corner[axis]!)));
    const width = max[0]! - min[0]!, depth = max[2]! - min[2]!;
    if (x + width > 500) { x = -500; z += rowDepth + 12; rowDepth = 0; }
    originals[part.id] = part.initialTransform;
    staged[part.id] = { ...part.initialTransform, position: [x - min[0]!, -min[1]!, z - min[2]!] };
    x += width + 12; rowDepth = Math.max(rowDepth, depth);
  }
  return {
    ...model, parts: model.parts.map((part) => staged[part.id] ? { ...part, initialTransform: staged[part.id]! } : part),
    operations: model.operations.map((operation) => ({
      ...operation,
      fromTransforms: operation.fromTransforms.map((pose, index) => {
        const id = operation.partInstanceIds[index]!;
        return originals[id] && transformsEqual(pose, originals[id]!) ? staged[id]! : pose;
      }),
      stages: operation.stages.map((stage) => ({ ...stage, fromTransforms: stage.fromTransforms.map((pose, index) => {
        const node = stage.nodes[index]!;
        return node.kind === 'part' && originals[node.id] && transformsEqual(pose, originals[node.id]!) ? staged[node.id]! : pose;
      }) }))
    }))
  };
}

export function connectHubPort(device: PartInstance, devicePointId: string, hub: PartInstance, port: 'A' | 'B' | 'C' | 'D' | 'E' | 'F', deviceWorld: Transform, hubWorld: Transform, number: number, cameraPreset: CameraPreset): { connection: Connection; operation: AssemblyOperation } {
  if (!device.connectionPoints.some((point) => point.id === devicePointId)) throw new Error(`ADB ${device.id}: missing actual captive electrical lead`);
  const positions: Record<typeof port, Vec3> = { A: [-69, -68, 40], B: [69, -68, 40], C: [-69, -68, 0], D: [69, -68, 0], E: [-69, -68, -40], F: [69, -68, -40] };
  const fit = assemblyFit(number, `Source assigns the existing captive device lead to hub port${port};45601 places six23807 socket origins at native x±69,y-68,z40/0/-40. Port labeling is fixed by the on-button nativeZ-80/Bluetooth+80 top view and source Book5 PDF23. Only documented electrical topology is committed; an unverified cable spline/length is deliberately not invented.`, [hub.geometryId, device.geometryId]);
  const id = `assembly-wire-${port}`, hubPoint = `port-${port}`;
  hub.connectionPoints.push({ id: hubPoint, type: 'electrical', localTransform: nativeLDrawTransform(positions[port]), evidence: fit });
  return {
    connection: { id, a: { partInstanceId: device.id, connectionPointId: devicePointId }, b: { partInstanceId: hub.id, connectionPointId: hubPoint }, type: 'electrical', installedByOperationId: id, evidence: fit },
    operation: { id, stepId: stepId(5, number), operationType: 'connect', partInstanceIds: [device.id, hub.id], fromTransforms: [deviceWorld, hubWorld], toTransforms: [deviceWorld, hubWorld], durationMs: 1400, startMs: number === 1 ? 3200 : 0, easing: 'smoothstep', dependencies: number === 1 ? ['mount-assembly-hub-unit'] : [], cameraPreset, sourceReference: assemblySource(number), stages: [], parentChanges: [], evidence: fit }
  };
}
