import type { AssemblyOperation, AssemblyStep, CameraPreset, Connection, GeometryAsset, MaterialDefinition, PartInstance, Quaternion, RobotModel, Transform, Vec3 } from '../types/model.ts';
import { composeTransforms, identityTransform, quaternionFromAxisAngle, relativeTransform } from '../core/transforms.ts';
import { geometryAssetsFor, materials, sourceDocumentsFor } from '../geometry/library.ts';
import { evidence, nativeLDrawTransform, placement, stepId, viewOperation, type BuildFragment } from './authoring.ts';
import { advancedDrivingBaseCoverage, advancedDrivingBaseDocuments, advancedDrivingBaseIdentity } from './catalog.ts';
import { front } from './advanced-driving-base/front.ts';
import { leftSide, rightSide } from './advanced-driving-base/drivetrain.ts';
import { rear } from './advanced-driving-base/rear.ts';
import { assemblyFit, assemblySource, attachmentFrame, connectHubPort, createAssemblyHardware, createDrivingScenario, inventoryBySource, mergeModule, organizeInitialInventory, robotRootId, transformFragment } from './advanced-driving-base/integration.ts';
import simulationAssets from '../../../static/models/simulation/manifest.json' with { type: 'json' };

const at = (position: Vec3, quaternion: Quaternion = [0, 0, 0, 1]): Transform => ({ position, quaternion, scale: [1, 1, 1] });
const yaw = quaternionFromAxisAngle([0, 1, 0], Math.PI / 2);
const leftFinal = alignRoot(attachmentFrame(front, 'left-side-front-1'), attachmentFrame(leftSide, 'front-join-2'), quaternionFromAxisAngle([0, 0, 1], Math.PI / 2));
const rightFinal = alignRoot(attachmentFrame(front, 'right-side-front-1'), attachmentFrame(rightSide, 'front-join-2'), quaternionFromAxisAngle([0, 0, 1], -Math.PI / 2));
/** Source gravity/up and two independent bore directions fix the otherwise arbitrary bore-frame twist. */
function alignRoot(receiver: Transform, moving: Transform, quaternion: Quaternion): Transform {
  const rotated = composeTransforms(at([0, 0, 0], quaternion), moving);
  return at(receiver.position.map((value, index) => value - rotated.position[index]!) as Vec3, quaternion);
}
// Corrected Book4 p17 uses63869/60483 and vertical shafts. Its free32184 cap-bore rows still span64mm versus96mm for the drive pins; preserve the residual, never invent four mates.
const midpoint = (a: Transform, b: Transform): Transform => at(a.position.map((value, index) => (value + b.position[index]!) / 2) as Vec3);
const rearFinal = alignRoot(
  midpoint(composeTransforms(leftFinal, attachmentFrame(leftSide, 'rear-join-1')), composeTransforms(rightFinal, attachmentFrame(rightSide, 'rear-join-1'))),
  midpoint(attachmentFrame(rear, 'side-receiver-1-upper'), attachmentFrame(rear, 'side-receiver-2-upper')),
  yaw
);
const hubFinal = alignRoot(composeTransforms(rearFinal, attachmentFrame(rear, 'hub-axle-1')), nativeLDrawTransform([-70, -30, -80]), yaw);
const upperLeft = attachmentFrame(front, 'upper-front-left-1');
const upperRight = attachmentFrame(front, 'upper-front-right-2');
// Native 39794 side bores are 60 LDU (24 mm) from the frame origin; bottom face is 10 LDU (4 mm) below its center.
const topFrameFinal = at([(upperLeft.position[0] + upperRight.position[0]) / 2, upperLeft.position[1] + 4, upperLeft.position[2] + 24], yaw);
const undersideLeftRear = attachmentFrame(front, 'underside-left-rear');
const undersideRightFront = attachmentFrame(front, 'underside-right-front');
const undersideFinal = at([(undersideLeftRear.position[0] + undersideRightFront.position[0]) / 2, undersideLeftRear.position[1] - 4, (undersideLeftRear.position[2] + undersideRightFront.position[2]) / 2]);
const work: Record<string, Transform> = { front: identityTransform(), 'left-side': at([-430, 0, -230]), 'right-side': at([430, 0, -230]), rear: at([620, 0, 600]) };
const finals: Record<string, Transform> = { front: identityTransform(), 'left-side': leftFinal, 'right-side': rightFinal, rear: rearFinal };
const originals = [front, rightSide, leftSide, rear];
const fragments = originals.map((fragment) => transformFragment(fragment, work[fragment.rootId]!, finals[fragment.rootId]!));

const stopAxles = [leftSide, rightSide].map((side) => {
  const upperSeat = composeTransforms(finals[side.rootId]!, attachmentFrame(side, 'stop-axle5'));
  const orientation = quaternionFromAxisAngle([0, 0, 1], Math.PI / 2);
  const shoulderOffset = composeTransforms(at([0, 0, 0], orientation), at([19.2, 0, 0]));
  return at(upperSeat.position.map((value, index) => value - shoulderOffset.position[index]!) as Vec3, orientation);
}) as [Transform, Transform];
const bushes = stopAxles.map((axle) => at([axle.position[0], 8, axle.position[2]], quaternionFromAxisAngle([1, 0, 0], -Math.PI / 2))) as [Transform, Transform];
const hardware = createAssemblyHardware({ hub: hubFinal, topFrame: topFrameFinal, underside: undersideFinal, stopAxles, bushes });
const parts = [...fragments.flatMap((fragment) => fragment.parts), ...hardware.parts];
const byId: Record<string, PartInstance> = Object.fromEntries(parts.map((part) => [part.id, part]));
export const advancedDrivingBaseSourceFamilies = Object.assign({}, ...originals.map((fragment) => fragment.familyByPartId), hardware.familyByPartId) as Record<string, string>;
const assemblyCamera: CameraPreset = { position: [260, 210, -250], target: [32, 20, 80], up: [0, 1, 0], projection: 'perspective', framing: 52, transitionMs: 700 };
const undersideCamera: CameraPreset = { ...assemblyCamera, position: [210, -220, -180], target: [32, -4, 64], up: [0, -1, 0] };
const finalViewCamera: CameraPreset = { ...assemblyCamera, position: [200, 150, -165], target: [32, 20, 80], framing: 42 };
const operations: AssemblyOperation[] = [...fragments.flatMap((fragment) => fragment.operations), ...hardware.operations];
const connections: Connection[] = [...fragments.flatMap((fragment) => fragment.connections), ...hardware.connections];

for (const [fragment, number, axis] of [[leftSide, 6, [0, -1, 0]], [rightSide, 7, [0, -1, 0]], [rear, 9, [0, 0, -1]]] as const) {
  const fit = number === 9
    ? placement(
        evidence('documented', 'Book5 step9 brings the completed rear module toward four side pin ends and retains the hub with two top axles.', [assemblySource(9)]),
        evidence('diagram-derived', 'Source17 gray63869/azure60483 correction restores the vertical shaft stack and true free32184 cap bores. Their64mm row span still differs from the96mm drive-pin span; midpoint placement is not a four-point connection.', [assemblySource(9)], 0.45),
        true
      )
    : assemblyFit(number, 'Two housing-pin collars seat in actual unoccupied upper39790 bores; source pair correspondence preserves16mm pitch and handedness.', ['39790', '2780', '54675']);
  const dependencies = originals.filter((other) => number === 9 || other.rootId === fragment.rootId || other.rootId === 'front')
    .flatMap((other) => other.operations.slice(-1).map((operation) => operation.id));
  operations.push(mergeModule(fragment, work[fragment.rootId]!, finals[fragment.rootId]!, {
    id: `assembly-join-${fragment.rootId}`, stepId: stepId(5, number), sourceReference: assemblySource(number),
    evidence: fit, cameraPreset: assemblyCamera, dependencies, durationMs: 4200, axis: [...axis] as Vec3, depthMm: 8
  }));
}

function connectSites(receiver: BuildFragment, receiverKey: string, moving: BuildFragment, movingKey: string, number: number, operationId: string): void {
  const a = receiver.attachmentSites[receiverKey], b = moving.attachmentSites[movingKey];
  if (!a || !b) throw new Error(`ADB unresolved source connection ${receiverKey}/${movingKey}`);
  connections.push({ id: `assembly-mate-${receiver.rootId}-${receiverKey}-${moving.rootId}-${movingKey}`, a: { partInstanceId: a.partInstanceId, connectionPointId: a.connectionPointId }, b: { partInstanceId: b.partInstanceId, connectionPointId: b.connectionPointId }, type: 'fixed', installedByOperationId: operationId, evidence: assemblyFit(number, `${a.description} ${b.description} Source-selected local bores/shafts; independent fit remains unchecked.`, [byId[a.partInstanceId]!.geometryId, byId[b.partInstanceId]!.geometryId]) });
}
for (const [side, number] of [[leftSide, 6], [rightSide, 7]] as const) for (const [receiver, moving] of [[1, 2], [2, 1]]) connectSites(front, `${side === leftSide ? 'left' : 'right'}-side-front-${receiver}`, side, `front-join-${moving}`, number, `assembly-join-${side.rootId}`);

const hub = byId['assembly-hub-unit']!;
const hubWork = hardware.subassemblies.find((assembly) => assembly.id === 'assembly-hub')!.localTransform;
const electrical = [
  [front, 'front-medium-electrical', 'D', 1], [front, 'left-color-electrical', 'B', 2], [front, 'right-color-electrical', 'F', 2],
  [leftSide, 'motor-electrical', 'A', 3], [rear, 'motor-electrical', 'C', 4], [rightSide, 'motor-electrical', 'E', 5]
] as const;
for (const [fragment, key, port, number] of electrical) {
  const site = fragment.attachmentSites[key];
  const originalPart = site && fragment.parts.find((part) => part.id === site.partInstanceId);
  if (!originalPart || !site) throw new Error(`ADB port${port}: missing source-backed captive device/site`);
  const device = byId[originalPart.id]!;
  const pointId = site.connectionPointId;
  const wiring = connectHubPort(device, pointId, hub, port, composeTransforms(work[fragment.rootId]!, originalPart.finalTransform), hubWork, number, assemblyCamera);
  operations.push(wiring.operation); connections.push(wiring.connection);
}

function hardwareMate(id: string, receiver: PartInstance, moving: PartInstance, worldFrame: Transform, number: number, operationId: string): void {
  const fit = assemblyFit(number, 'Coincident source/CAD-derived seat planes in the completed robot frame; source-selected bore correspondence and real clearances remain independently unchecked.', [receiver.geometryId, moving.geometryId]);
  receiver.connectionPoints.push({ id: `${id}-receiver`, type: 'hole', localTransform: relativeTransform(receiver.finalTransform, worldFrame), evidence: fit });
  moving.connectionPoints.push({ id: `${id}-moving`, type: moving.geometryId === '18651' || moving.geometryId === '15462' ? 'axle' : 'pin', localTransform: relativeTransform(moving.finalTransform, worldFrame), evidence: fit });
  connections.push({ id, a: { partInstanceId: receiver.id, connectionPointId: `${id}-receiver` }, b: { partInstanceId: moving.id, connectionPointId: `${id}-moving` }, type: 'fixed', installedByOperationId: operationId, evidence: fit });
}
for (const side of ['left', 'right']) for (const number of [1, 2]) {
  const site = front.attachmentSites[`upper-front-${side}-${number}`]!;
  hardwareMate(`assembly-top-seat-${side}-${number}`, byId['assembly-top-frame-unit']!, byId[site.partInstanceId]!, attachmentFrame(front, `upper-front-${side}-${number}`), 12, 'assembly-seat-assembly-top-frame');
}
for (const [index, [side, end]] of [['left', 'rear'], ['left', 'front'], ['right', 'rear'], ['right', 'front']].entries()) hardwareMate(`assembly-under-seat-${index + 1}`, byId['front-frame']!, byId[`assembly-underside-pin-${index + 1}`]!, attachmentFrame(front, `underside-${side}-${end}`), 18, 'assembly-seat-assembly-underside');
for (const index of [1, 2]) {
  const site = rear.attachmentSites[`hub-axle-${index}`]!;
  hardwareMate(`assembly-rear-hub-axle-${index}`, hub, byId[site.partInstanceId]!, composeTransforms(rearFinal, attachmentFrame(rear, `hub-axle-${index}`)), 9, 'assembly-join-rear');
  const axle = byId[`assembly-stop-axle-${index}`]!, bush = byId[`assembly-bush-${index}`]!;
  const side = index === 1 ? leftSide : rightSide;
  for (const [face, siteName] of [['upper', 'stop-axle5'], ['lower', 'stop-axle5-opposite']] as const) {
    const site = side.attachmentSites[siteName]!;
    hardwareMate(`assembly-stop-${index}-${face}-bore`, byId[site.partInstanceId]!, axle, composeTransforms(side === leftSide ? leftFinal : rightFinal, attachmentFrame(side, siteName)), 13, `mount-${axle.id}`);
  }
  hardwareMate(`assembly-bush-seat-${index}`, axle, bush, at([bush.finalTransform.position[0], 12, bush.finalTransform.position[2]]), 14, `mount-${bush.id}`);
}

const descriptions = [
  ['Connect the front motor to D', 'Prepare the hub with its battery installed. Plug the front medium motor’s attached cable into port D.'],
  ['Connect the color sensors to B and F', 'Plug the two front color-sensor cables into ports B and F. Follow the crossed cable assignment in the official wiring diagram.'],
  ['Connect the left drive motor to A', 'Plug the left large motor’s attached cable into port A. Keep the completed left module beside the front assembly for now.'],
  ['Connect the rear motor to C', 'Plug the rear medium motor’s cable into port C. This motor drives the rear tool output.'],
  ['Connect the right drive motor to E', 'Plug the right large motor’s cable into port E. Check all six hub connections against the official wiring diagram.'],
  ['Attach the left drive module', 'Bring the completed left module to the front frame. Align its two housing pins with the matching frame holes and press the module into place.'],
  ['Attach the right drive module', 'Bring the completed right module to the opposite side of the front frame. Check its mirrored orientation before aligning and seating the housing pins.'],
  ['Lower the hub into the chassis', 'Lower the hub onto the upper supports between the drive modules. The rear module’s upper axles will retain it in the next step.'],
  ['Position the rear module', 'Bring the rear module toward the blue pins on the drive modules, with its two upper axles facing the hub holes. Compare these connections with Book 5 before trying to join them.'],
  ['Check the rear connections', 'Inspect the four lower side-pin positions and the upper axle-to-hub connections from this side. Compare the gaps with the official illustration; pause if the parts do not align.'],
  ['Prepare the second upper frame', 'Fit two red axle/pins into the long-edge transverse holes of the magenta 11 × 7 frame. Build this small assembly beside the robot.'],
  ['Fit the front upper frame', 'Align the prepared frame with the four upright pins around the front motor and lower it into place. Rotate the view to check all four connections.'],
  ['Insert both 5L stop axles', 'Insert the two reddish-brown 5L stop axles through the upper side supports. Their stop shoulders determine how far they seat.'],
  ['Retain the axles from below', 'Look underneath the robot and press the two gray bushes onto the projecting axle ends.'],
  ['Prepare the first underside frame', 'Fit the gray cross block with four integral pins to one black 7 × 5 frame.'],
  ['Join the underside frames', 'Attach the second black 7 × 5 frame to the opposite pair of pins on the gray cross block. Keep the 8 mm gap between the frame bodies.'],
  ['Insert the outer-corner pins', 'Insert one black pin into each of the four outer corner holes of the paired frames.'],
  ['Fit the underside reinforcement', 'Align the paired frames with the four receiving points underneath the robot and attach them. Return the view upright when finished.'],
  ['Check the completed assembly', 'Compare the upright robot with the final official illustration. Check the frame connections and wiring before trying the movement demonstration.']
];
for (const number of [10, 19]) operations.push(viewOperation(`assembly-view-${number}`, stepId(5, number), assemblySource(number), number === 19 ? finalViewCamera : assemblyCamera, 2200));
for (const operation of operations) if (operation.stepId === stepId(5, 14) || operation.stepId === stepId(5, 18)) operation.cameraPreset = undersideCamera;
const assemblySteps: AssemblyStep[] = descriptions.map(([title, description], index) => {
  const number = index + 1, ownOperations = operations.filter((operation) => operation.stepId === stepId(5, number));
  return { id: stepId(5, number), title: title!, description: description!, kind: 'numbered-instruction', action: number <= 5 ? 'wiring' : number === 10 || number === 19 ? 'view' : [6, 7, 8, 9, 12, 18].includes(number) ? 'reuse' : 'assembly', sourceReferences: [assemblySource(number)], operationIds: ownOperations.map((operation) => operation.id), requiredPartInstanceIds: hardware.parts.filter((part) => part.sourceReference!.instructionId === String(number)).map((part) => part.id), warnings: number <= 5 ? ['Cable paths and lengths are not shown accurately in 3D. Follow the official wiring diagram and check cable reach before connecting.'] : number === 9 || number === 10 ? ['The rear mounting points do not align in this 3D guide: the modeled spans differ by 32 mm. Check Book 5 before joining the rear module. Do not force the parts to match the animation.'] : [], durationMs: Math.max(2200, ...ownOperations.map((operation) => operation.startMs + operation.durationMs + 300)), cameraPreset: number === 14 || number === 18 ? undersideCamera : assemblyCamera };
});
const geometryAssets = geometryAssetsFor([...new Set(parts.map((part) => part.geometryId))]);
const sourceCourseAsset = simulationAssets.assets.find((asset) => asset.id === 'robobuild-course-marker');
if (!sourceCourseAsset) throw new Error('Missing generated original RoboBuild course geometry');
const sourcePose = sourceCourseAsset.nativeToScene;
const courseAsset: GeometryAsset = {
  ...sourceCourseAsset, format: 'glb', nativeUnits: 'm', preserveOrigin: true,
  nativeToScene: { position: [sourcePose.position[0]!, sourcePose.position[1]!, sourcePose.position[2]!], quaternion: [sourcePose.quaternion[0]!, sourcePose.quaternion[1]!, sourcePose.quaternion[2]!, sourcePose.quaternion[3]!], scale: [sourcePose.scale[0]!, sourcePose.scale[1]!, sourcePose.scale[2]!] },
  materialSlots: sourceCourseAsset.materialSlots.map((slot) => ({ ...slot, colorMode: 'fixed' as const }))
};
const courseMaterialIds = new Set(courseAsset.materialSlots.map((slot) => slot.materialId!));
const propMaterials: MaterialDefinition[] = simulationAssets.materials.filter((material) => courseMaterialIds.has(material.id)).map((material) => ({ ...material, category: material.category === 'rubber' ? 'rubber' as const : 'plastic' as const, evidence: evidence('app-authored', material.evidence.note, [], material.evidence.confidence) }));
const courseEvidence = evidence('app-authored', 'Original RoboBuild educational course markers, not manufacturer parts, source BOM, manual accessories or a calibrated real obstacle course. Actual generatedGLB with unchanged origin; collision/clearance validation is separate.', [], 1);
const floorY = Math.min(byId['left-wheel']!.finalTransform.position[1], byId['right-wheel']!.finalTransform.position[1]) - 44;
const authored: RobotModel = {
  ...advancedDrivingBaseIdentity, schemaVersion: 1, parts, geometryAssets: [...geometryAssets, courseAsset], materials: [...materials, ...propMaterials], sourceDocuments: [...advancedDrivingBaseDocuments, ...sourceDocumentsFor(geometryAssets, materials)],
  steps: [...fragments.flatMap((fragment) => fragment.steps), ...assemblySteps], operations,
  installations: [...fragments.flatMap((fragment) => fragment.installations), ...hardware.installations], visibility: [],
  subassemblies: [{ id: robotRootId, name: 'Advanced Driving Base — tracked source modules', localTransform: identityTransform(), partInstanceIds: [], childSubassemblyIds: [...originals.map((fragment) => fragment.rootId), hardware.rootId], evidence: placement(evidence('documented', 'Book5 directs four source modules and fifteen new prepared units into the build.', [assemblySource(19)]), evidence('diagram-derived', 'Front H1 remains the fixed world datum. Rear registration aligns candidate feature midpoints only: source/CAD free-bore geometry does not close its four pin contacts.', [assemblySource(6), assemblySource(7), assemblySource(9)], 0.5), true) }, ...fragments.flatMap((fragment) => fragment.subassemblies), ...hardware.subassemblies],
  connections, joints: fragments.flatMap((fragment) => fragment.joints), linkageConstraints: fragments.flatMap((fragment) => fragment.linkageConstraints), motors: fragments.flatMap((fragment) => fragment.motors), cables: fragments.flatMap((fragment) => fragment.cables),
  inventory: inventoryBySource(parts, advancedDrivingBaseSourceFamilies), milestones: [...fragments.flatMap((fragment) => fragment.milestones), { id: 'adb-drive-modules-seated', title: 'Both drive modules attached', stepId: stepId(5, 7) }, { id: 'adb-rear-hub-retained', title: 'Rear module attachment — check fit', stepId: stepId(5, 9) }, { id: 'adb-source-sequence-authored', title: 'Final assembly check', stepId: stepId(5, 19) }],
  sourceMappings: operations.map((operation) => ({ source: operation.sourceReference!, stepId: operation.stepId, operationId: operation.id })),
  scenarios: [], simulationObjects: [[280, -250], [-420, -530], [-510, -800], [20, -1080]].map(([x, z], index) => ({ id: `adb-course-marker-${index + 1}`, name: `RoboBuild course marker${index + 1}`, geometryId: courseAsset.id, materialId: 'robobuild-marker-charcoal', initialTransform: at([x!, floorY, z!]), evidence: courseEvidence })), coverage: advancedDrivingBaseCoverage
};
authored.scenarios = [createDrivingScenario(authored)];
export const advancedDrivingBase = organizeInitialInventory(authored);
