import type { AssemblyOperation, AssemblyStep, CameraPreset, Connection, Evidence, PartInstance, PlacementEvidence, Quaternion, SourceReference, Subassembly, Transform, Vec3 } from '../../types/model.ts';
import { identityTransform, relativeTransform, composeTransforms, quaternionFromAxisAngle } from '../../core/transforms.ts';
import { evidence, nativeLDrawTransform, placement, stepId, mountPart, viewOperation, type BuildFragment } from '../authoring.ts';
import { advancedDrivingBaseDocuments } from '../catalog.ts';

const frontDocument = advancedDrivingBaseDocuments[0]!;
const source = (step: number): SourceReference => ({ documentId: frontDocument.id, page: step, instructionId: String(step), figure: `Front Part step ${step}`, sourceUrl: `${frontDocument.sourceUrl}#page=${step}`, confidence: 0.98 });
const cad = (geometryId: string, figure: string): SourceReference => ({ documentId: `ldraw-${geometryId}`, sourceUrl: `https://library.ldraw.org/library/official/parts/${geometryId}.dat`, figure, confidence: 0.98 });
const beamCad = cad('40490', '40490.dat lines 21–42; beamhole.dat lines 16–27; peghole.dat lines 18–23');
const pinCad = cad('2780', '2780.dat lines 13–14; confric5.dat collar y=-2..0, tip y=-20');
const blockCad = cad('48989', '48989.dat lines 13–21; s/48989s01.dat lines 12–14,122–125; connect.dat lines 86–100; connhole.dat lines 14–19');
const topology = (step: number, note: string): Evidence => evidence('documented', note, [source(step)], 0.98);
const fit = (step: number, note: string, refs: SourceReference[]): PlacementEvidence => placement(topology(step, note), evidence('cad-derived', note, refs));
const staging = placement(evidence('app-authored', 'Organized visible inventory; not a documented physical placement.', [], 1), evidence('app-authored', 'Presentation-only staging positions, clearance approach and timing. No physical assembly-time claim.', [], 1), true);
const beamFit = fit(1, '40490 native h1..h9 at z=-80..80, pitch20 LDU, faces y=±10; beam width x=±9. Registered long axis to scene +X and width to scene +Y. No recentering of geometry.', [beamCad]);
const farFit = fit(1, 'Pins enter h4/h6 from far face. 2780 native axis X; its collar spans x=-2..2 and ends x=±20. Seat its origin at beam face; collar occupies the 2-LDU face recess and one 20-LDU half enters the beam. Tip-contact to seating travel20 LDU =8 scene mm.', [beamCad, pinCad]);
const blockFit = fit(2, 'Each 48989 integral pair enters near beam holes h1/h3 or h7/h9. Body faces z=±10, pin bases at (0,±20,+10); connect collar projects2 LDU and tip20 LDU beyond base. Gray center is20 LDU from beam center: body face coincides with beam face, collar occupies recess. Travel20 LDU =8 scene mm.', [beamCad, blockCad]);
const upperFit = fit(3, 'Outer end hole of each 48989 is connhole at (0,±20,0), along native X, with faces x=±10. Seat 2780 origin at upward face x=+10, inserting its negative-X half20 LDU downward. Collar2 LDU enters face recess; free half points upward. Travel20 LDU =8 scene mm.', [pinCad, blockCad]);

// Native assembly axes: +X follows h1→h9; -Y is up; -Z is the visible near face.
// These are proper rotations, not reflected or bounding-box-centered placements.
const s = Math.SQRT1_2;
const beamPose = nativeLDrawTransform([80, 0, 0], [-0.5, 0.5, -0.5, 0.5]);
const farPose = (hole: number): Transform => nativeLDrawTransform([(hole - 1) * 20, 0, 10], [0, -s, 0, s]);
const blockPose = (center: number): Transform => nativeLDrawTransform([center, 0, -20], [0, 0, -s, s]);
const upperPose = (x: number): Transform => nativeLDrawTransform([x, -10, -20], [0, 0, -s, s]);
const at = (position: Vec3, orientation: Transform): Transform => ({ position, quaternion: [...orientation.quaternion], scale: [1, 1, 1] });

function part(id: string, geometryId: string, name: string, step: number, finalTransform: Transform, initialPosition: Vec3, placementEvidence: PlacementEvidence, subassemblyId = 'front-bracket'): PartInstance {
  return {
    id, geometryId, materialId: geometryId === '48989' ? 'ldraw-71' : 'ldraw-0', name,
    finalTransform, initialTransform: at(initialPosition, finalTransform), connectionPoints: [], subassemblyId,
    sourceReference: source(step), geometryConfidence: 0.95, inventoryScope: 'robot',
    category: geometryId === '40490' ? 'structure' : 'connector',
    identityEvidence: evidence('diagram-derived', `${name}; source shape crosswalk selects genuine ${geometryId}.dat. Manufacturer element number omitted: 2021 overview does not certify the 2019 mold.`, [source(step), cad(geometryId, 'Source-backed visual family crosswalk')]),
    placementEvidence
  };
}

const parts: PartInstance[] = [
  part('beam-1', '40490', 'Black Technic 9-hole beam', 1, beamPose, [32, 0, -40], beamFit),
  part('pin-1', '2780', 'Black friction pin — beam hole 4', 1, farPose(4), [8, 0, -20], farFit),
  part('pin-2', '2780', 'Black friction pin — beam hole 6', 1, farPose(6), [24, 0, -20], farFit),
  part('grey-connector-1', '48989', 'Light bluish gray 3-hole cross block — holes 1/3', 2, blockPose(20), [8, 0, 32], blockFit, 'left-end-bracket'),
  part('grey-connector-2', '48989', 'Light bluish gray 3-hole cross block — holes 7/9', 2, blockPose(140), [56, 0, 32], blockFit, 'right-end-bracket'),
  part('pin-3', '2780', 'Black upper friction pin — hole 1 end', 3, upperPose(0), [40, 0, -20], upperFit, 'left-end-bracket'),
  part('pin-4', '2780', 'Black upper friction pin — hole 9 end', 3, upperPose(160), [56, 0, -20], upperFit, 'right-end-bracket')
];
const byId: Record<string, PartInstance> = Object.fromEntries(parts.map((p) => [p.id, p]));
const requiredPart = (id: string): PartInstance => {
  const value = byId[id];
  if (!value) throw new Error(`Unknown authored bracket instance ${id}`);
  return value;
};
const camera = (position: Vec3, target: Vec3): CameraPreset => ({ position, target, up: [0, 1, 0], projection: 'perspective', framing: 36, transitionMs: 650 });
const cameras = [camera([112, 82, 116], [32, 0, 0]), camera([104, 66, 116], [32, 0, 6]), camera([110, 100, 105], [32, 4, 8])];
const operations: AssemblyOperation[] = [];
function mount(id: string, step: number, startMs: number, durationMs: number, axis: Vec3 | null, dependencies: string[]): string {
  const p = requiredPart(id);
  const operationId = `mount-${id}`;
  const endpoint = p.finalTransform;
  const depth = axis === null ? 0 : 8;
  const aligned = at(endpoint.position.map((value, i) => value - (axis?.[i] ?? 0) * depth) as Vec3, endpoint);
  const approachMs = durationMs - (axis === null ? 0 : 850);
  operations.push({
    id: operationId, stepId: stepId(1, step), operationType: axis === null ? 'align' : 'insert',
    partInstanceIds: [id], fromTransforms: [p.initialTransform], toTransforms: [endpoint], durationMs,
    easing: 'smoothstep', dependencies, cameraPreset: cameras[step - 1]!, sourceReference: source(step), startMs,
    stages: [
      { id: `${operationId}-approach`, startMs: 0, durationMs: approachMs, phase: axis === null ? 'transfer' : 'approach', nodes: [{ kind: 'part', id }], fromTransforms: [p.initialTransform], toTransforms: [aligned], trajectory: { type: 'linear' }, easing: 'smoothstep', evidence: staging },
      ...(axis === null ? [] : [{ id: `${operationId}-insert`, startMs: approachMs, durationMs: 850, phase: 'insert' as const, nodes: [{ kind: 'part' as const, id }], fromTransforms: [aligned], toTransforms: [endpoint], trajectory: { type: 'linear' as const }, easing: 'smoothstep' as const, insertion: { axis, depthMm: depth }, evidence: p.placementEvidence }])
    ], parentChanges: [], evidence: p.placementEvidence
  });
  return operationId;
}

mount('beam-1', 1, 0, 1200, null, []);
mount('pin-1', 1, 1400, 2000, [0, 0, 1], ['mount-beam-1']);
mount('pin-2', 1, 1400, 2000, [0, 0, 1], ['mount-beam-1']);
mount('grey-connector-1', 2, 0, 2400, [0, 0, -1], ['mount-pin-1', 'mount-pin-2']);
mount('grey-connector-2', 2, 0, 2400, [0, 0, -1], ['mount-pin-1', 'mount-pin-2']);
mount('pin-3', 3, 0, 2400, [0, -1, 0], ['mount-grey-connector-1']);
mount('pin-4', 3, 0, 2400, [0, -1, 0], ['mount-grey-connector-2']);

const connections: Connection[] = [];
function mate(id: string, aId: string, aPoint: string, bId: string, bPoint: string, worldPosition: Vec3, axis: Vec3, installedByOperationId: string, placementEvidence: PlacementEvidence): void {
  // Both point frames use the same world frame, then become actual part-local frames.
  // Frame +Y is the insertion axis; retained local positions map to native CAD faces.
  const up: Vec3 = [0, 1, 0];
  const dot = up[0] * axis[0] + up[1] * axis[1] + up[2] * axis[2];
  const worldFrame: Transform = {
    position: worldPosition, quaternion: dot === -1 ? [1, 0, 0, 0] : dot === 1 ? [0, 0, 0, 1] : [axis[2] * s, 0, -axis[0] * s, s], scale: [1, 1, 1]
  };
  for (const [partId, pointId, type] of [[aId, aPoint, 'hole'], [bId, bPoint, 'pin']] as const) {
    const p = requiredPart(partId);
    p.connectionPoints.push({ id: pointId, type, localTransform: relativeTransform(p.finalTransform, worldFrame), evidence: placementEvidence });
  }
  connections.push({ id, a: { partInstanceId: aId, connectionPointId: aPoint }, b: { partInstanceId: bId, connectionPointId: bPoint }, type: 'fixed', installedByOperationId, evidence: placementEvidence });
}
mate('beam-h4-pin', 'beam-1', 'h4-far-face', 'pin-1', 'collar-seat', [24, 0, -4], [0, 0, 1], 'mount-pin-1', farFit);
mate('beam-h6-pin', 'beam-1', 'h6-far-face', 'pin-2', 'collar-seat', [40, 0, -4], [0, 0, 1], 'mount-pin-2', farFit);
for (const [connector, holes] of [['grey-connector-1', [1, 3]], ['grey-connector-2', [7, 9]]] as const) {
  for (const hole of holes) mate(`beam-h${hole}-crossblock`, 'beam-1', `h${hole}-near-face`, connector, `integral-pin-h${hole}`, [(hole - 1) * 8, 0, 4], [0, 0, -1], `mount-${connector}`, blockFit);
}
mate('left-upper-pin', 'grey-connector-1', 'outer-upper-hole', 'pin-3', 'collar-seat', [0, 4, 8], [0, -1, 0], 'mount-pin-3', upperFit);
mate('right-upper-pin', 'grey-connector-2', 'outer-upper-hole', 'pin-4', 'collar-seat', [64, 4, 8], [0, -1, 0], 'mount-pin-4', upperFit);

const descriptions = [
  ['Prepare the 9-hole beam', 'Move the beam into the work area. Counting from its left end, press the two black friction pins into holes 4 and 6 from the far face. Their free ends remain behind the beam.', ['beam-1', 'pin-1', 'pin-2']],
  ['Seat the two gray cross blocks', 'Press each integral pin pair into the near face: holes 1/3 at the left end and 7/9 at the right. The opposite integral pins remain projecting toward you. Each cross block counts as one prepared unit, not five.', ['grey-connector-1', 'grey-connector-2']],
  ['Insert the upper pins', 'Press one black pin downward into the outer upward-facing hole of each cross block, above beam holes 1 and 9. These seven units remain the fixed datum for the complete Front Part.', ['pin-3', 'pin-4']]
] as const;
const steps: AssemblyStep[] = descriptions.map(([title, description, ids], index) => ({
  id: stepId(1, index + 1), title, description, kind: 'numbered-instruction', action: 'assembly', sourceReferences: [source(index + 1)],
  operationIds: operations.filter((op) => op.stepId === stepId(1, index + 1)).map((op) => op.id), requiredPartInstanceIds: [...ids],
  warnings: ['CAD-derived seating is not independently fit-verified. Animation timing and inventory arrangement are RoboBuild presentation.'],
  durationMs: index === 0 ? 4000 : 3000, cameraPreset: cameras[index]!
}));

const families = {
  "black-pin2": {
    "geometryId": "2780",
    "materialId": "ldraw-0",
    "name": "Technic Pin with Friction and Slots"
  },
  "black-beam9": {
    "geometryId": "40490",
    "materialId": "ldraw-0",
    "name": "Technic Beam  9"
  },
  "grey-pinbeam3": {
    "geometryId": "48989",
    "materialId": "ldraw-71",
    "name": "Technic Cross Block 1 x 3 (Pin/Pin/Pin) with 4 Pins"
  },
  "frame11x15": {
    "geometryId": "39790",
    "materialId": "ldraw-322",
    "name": "Technic Beam 15 x 11 with Open Center 13 x  9"
  },
  "blue-pin3": {
    "geometryId": "6558",
    "materialId": "ldraw-1",
    "name": "Technic Pin Long with Friction and Slot"
  },
  "white-doublecross": {
    "geometryId": "32184",
    "materialId": "ldraw-15",
    "name": "Technic Cross Block 1 x 3 (Axle/Pin/Axle)"
  },
  "medium-motor": {
    "geometryId": "54696p01",
    "materialId": "ldraw-15",
    "name": "Electric Powered Up Medium Angular Motor with Medium Azure Back and Hub Pattern"
  },
  "pink-connector3": {
    "geometryId": "39793",
    "materialId": "ldraw-26",
    "name": "Technic Connector Block  3 x  3 with  9 Perpendicular Holes"
  },
  "grey-iframe3x5": {
    "geometryId": "14720",
    "materialId": "ldraw-71",
    "name": "Technic Beam  5 x  3 H-shaped"
  },
  "color-sensor": {
    "geometryId": "37308",
    "materialId": "ldraw-15",
    "name": "Electric Powered Up Colour Sensor"
  },
  "ballcup": {
    "geometryId": "39370",
    "materialId": "ldraw-322",
    "name": "Technic Beam  5 x  3 H-shaped with Ball Socket"
  },
  "ball19": {
    "geometryId": "52629",
    "materialId": "ldraw-15",
    "name": "Technic Ball 19mm for Ball Castor"
  },
  "azur-angle3x5": {
    "geometryId": "32526",
    "materialId": "ldraw-322",
    "name": "Technic Beam  3 x  5 Bent 90"
  },
  "black-beam15": {
    "geometryId": "32278",
    "materialId": "ldraw-0",
    "name": "Technic Beam 15"
  },
  "red-axlepin3": {
    "geometryId": "11214",
    "materialId": "ldraw-4",
    "name": "Technic Axle Pin Long with Friction with  2L Pin"
  },
  "yellow-brick2x4": {
    "geometryId": "39789",
    "materialId": "ldraw-14",
    "name": "Brick  2 x  4 with  3 Axleholes Vertical"
  },
  "black-tube1": {
    "geometryId": "18654",
    "materialId": "ldraw-0",
    "name": "Technic Beam  1"
  },
  "grey-gear28": {
    "geometryId": "46372",
    "materialId": "ldraw-71",
    "name": "Technic Gear 28 Tooth Double Bevel"
  },
  "blue-wireclip": {
    "geometryId": "49283",
    "materialId": "ldraw-1",
    "name": "Technic Cable Clip"
  },
  "green-wireclip": {
    "geometryId": "49283",
    "materialId": "ldraw-2",
    "name": "Technic Cable Clip"
  },
  "red-wireclip": {
    "geometryId": "49283",
    "materialId": "ldraw-4",
    "name": "Technic Cable Clip"
  }
} as const;
const sourcePages = [
  {
    "step": 1,
    "description": "Begin 9-hole beam; insert two black friction pins from far face through holes4 and6, counting from upper-left end of displayed beam.",
    "additions": [
      {
        "family": "black-pin2",
        "quantity": 2
      },
      {
        "family": "black-beam9",
        "quantity": 1
      }
    ]
  },
  {
    "step": 2,
    "description": "Two grey 3-length beams with four integral pins attach to near side of black beam, across end holes1/3 and7/9; two pins of each grey connector remain projecting toward viewer.",
    "additions": [
      {
        "family": "grey-pinbeam3",
        "quantity": 2
      }
    ]
  },
  {
    "step": 3,
    "description": "Insert black pins downward into upward-facing outer end hole of each grey connector. This completes the first three-step bracket seed.",
    "additions": [
      {
        "family": "black-pin2",
        "quantity": 2
      }
    ]
  },
  {
    "step": 4,
    "description": "Join bracket to outside of one frame rail; grey projecting pins face into frame side holes, black vertical pins remain upward.",
    "additions": [
      {
        "family": "frame11x15",
        "quantity": 1
      }
    ]
  },
  {
    "step": 5,
    "description": "Insert five side-facing frame connection pins at the shown rail locations; two arrows plus three already-inserted instances define placement.",
    "additions": [
      {
        "family": "black-pin2",
        "quantity": 5
      }
    ]
  },
  {
    "step": 6,
    "description": "Build two white double-cross connectors, each with blue3-pin inserted axially through one end cross hole, short pin end emerging above.",
    "additions": [
      {
        "family": "blue-pin3",
        "quantity": 2
      },
      {
        "family": "white-doublecross",
        "quantity": 2
      }
    ]
  },
  {
    "step": 7,
    "description": "Attach two white connector units onto frame near motor rail ends, blue ends upward; insert six additional upward black frame pins at pictured edge locations.",
    "additions": [
      {
        "family": "black-pin2",
        "quantity": 6
      }
    ]
  },
  {
    "step": 8,
    "description": "Prepare medium motor, circular output pointing upward and cable toward lower-right; set output index marks as inset, insert blue3-pins laterally into housing mount holes.",
    "additions": [
      {
        "family": "medium-motor",
        "quantity": 1
      },
      {
        "family": "blue-pin3",
        "quantity": 2
      }
    ]
  },
  {
    "step": 9,
    "description": "Fit blue and green cable clips on opposite sides of medium motor housing.",
    "additions": [
      {
        "family": "blue-wireclip",
        "quantity": 1
      },
      {
        "family": "green-wireclip",
        "quantity": 1
      }
    ]
  },
  {
    "step": 10,
    "description": "Lower medium motor onto prepared frame mount; cable traverses frame opening, circular output upward.",
    "additions": []
  },
  {
    "step": 11,
    "description": "Insert four lateral black pins into magenta 1x3x3 connector block, two at each side.",
    "additions": [
      {
        "family": "black-pin2",
        "quantity": 4
      },
      {
        "family": "pink-connector3",
        "quantity": 1
      }
    ]
  },
  {
    "step": 12,
    "description": "Attach grey I-frame side bracket to magenta block; add one blue pin at bracket side.",
    "additions": [
      {
        "family": "blue-pin3",
        "quantity": 1
      },
      {
        "family": "grey-iframe3x5",
        "quantity": 1
      }
    ]
  },
  {
    "step": 13,
    "description": "Attach red cable clip to blue pin on I-frame bracket.",
    "additions": [
      {
        "family": "red-wireclip",
        "quantity": 1
      }
    ]
  },
  {
    "step": 14,
    "description": "Lower magenta-and-grey bracket over medium motor, pinning to surrounding frame connectors.",
    "additions": []
  },
  {
    "step": 15,
    "description": "Rotate camera to opposite side; add second grey I-frame bracket on other motor side.",
    "additions": [
      {
        "family": "grey-iframe3x5",
        "quantity": 1
      }
    ]
  },
  {
    "step": 16,
    "description": "Prepare first color sensor with two blue3-pins pointing upward from mount side.",
    "additions": [
      {
        "family": "blue-pin3",
        "quantity": 2
      },
      {
        "family": "color-sensor",
        "quantity": 1
      }
    ]
  },
  {
    "step": 17,
    "description": "Attach grey four-pin beam to sensor side using protruding mount pins; sensor lens remains unobstructed.",
    "additions": [
      {
        "family": "grey-pinbeam3",
        "quantity": 1
      }
    ]
  },
  {
    "step": 18,
    "description": "Press white19mm ball into Medium Azur ball-cup frame; ball surface protrudes downward in final driving orientation.",
    "additions": [
      {
        "family": "ballcup",
        "quantity": 1
      },
      {
        "family": "ball19",
        "quantity": 1
      }
    ]
  },
  {
    "step": 19,
    "description": "Join first ball-cup frame to first color-sensor unit using grey connector.",
    "additions": []
  },
  {
    "step": 20,
    "description": "Insert two black pins into visible side holes of ball-cup frame.",
    "additions": [
      {
        "family": "black-pin2",
        "quantity": 2
      }
    ]
  },
  {
    "step": 21,
    "description": "Attach Medium Azur L-shaped3x5 beam to this caster/sensor unit; long arm projects toward center of eventual front rail.",
    "additions": [
      {
        "family": "azur-angle3x5",
        "quantity": 1
      }
    ]
  },
  {
    "step": 22,
    "description": "Attach first caster/sensor unit to front frame/motor side; sensor is outboard and downward-facing after final rotation.",
    "additions": []
  },
  {
    "step": 23,
    "description": "Prepare second color sensor with two blue3-pins.",
    "additions": [
      {
        "family": "blue-pin3",
        "quantity": 2
      },
      {
        "family": "color-sensor",
        "quantity": 1
      }
    ]
  },
  {
    "step": 24,
    "description": "Attach second grey four-pin beam to second sensor, mirrored placement.",
    "additions": [
      {
        "family": "grey-pinbeam3",
        "quantity": 1
      }
    ]
  },
  {
    "step": 25,
    "description": "Prepare second white ball in Medium Azur ball-cup frame.",
    "additions": [
      {
        "family": "ballcup",
        "quantity": 1
      },
      {
        "family": "ball19",
        "quantity": 1
      }
    ]
  },
  {
    "step": 26,
    "description": "Join second caster frame to second sensor unit.",
    "additions": []
  },
  {
    "step": 27,
    "description": "Insert two black side pins into second ball-cup frame.",
    "additions": [
      {
        "family": "black-pin2",
        "quantity": 2
      }
    ]
  },
  {
    "step": 28,
    "description": "Attach second3x5 angular beam, mirrored relative to first sensor/caster.",
    "additions": [
      {
        "family": "azur-angle3x5",
        "quantity": 1
      }
    ]
  },
  {
    "step": 29,
    "description": "Attach second caster/sensor unit on other motor side.",
    "additions": []
  },
  {
    "step": 30,
    "description": "Add black15-hole rail spanning two sensor/caster units across front.",
    "additions": [
      {
        "family": "black-beam15",
        "quantity": 1
      }
    ]
  },
  {
    "step": 31,
    "description": "Make two yellow2x4 cross-hole brick units, two red axle/pins per brick, axles entering holes in brick face opposite studs.",
    "additions": [
      {
        "family": "red-axlepin3",
        "quantity": 4
      },
      {
        "family": "yellow-brick2x4",
        "quantity": 2
      }
    ]
  },
  {
    "step": 32,
    "description": "Slide one short black tube onto one red pin in each yellow brick unit.",
    "additions": [
      {
        "family": "black-tube1",
        "quantity": 2
      }
    ]
  },
  {
    "step": 33,
    "description": "Mount both yellow brick units atop outer front supports, studs outward/up in displayed orientation.",
    "additions": []
  },
  {
    "step": 34,
    "description": "Make two magenta connector blocks, each with two upward black pins.",
    "additions": [
      {
        "family": "black-pin2",
        "quantity": 4
      },
      {
        "family": "pink-connector3",
        "quantity": 2
      }
    ]
  },
  {
    "step": 35,
    "description": "Attach the two magenta connector blocks alongside motor, their pinned edges upward.",
    "additions": []
  },
  {
    "step": 36,
    "description": "Rotate camera to opposite end; no additional parts.",
    "additions": []
  },
  {
    "step": 37,
    "description": "Insert two black pins into opposing round holes of grey28-tooth double-bevel gear; not into center cross axle hole.",
    "additions": [
      {
        "family": "black-pin2",
        "quantity": 2
      },
      {
        "family": "grey-gear28",
        "quantity": 1
      }
    ]
  },
  {
    "step": 38,
    "description": "Mount grey gear on circular medium-motor output, using the two pin connections; no external tool is added.",
    "additions": []
  }
];

type Family = keyof typeof families;
const familyByPartId: Record<string, string> = {
  'beam-1': 'black-beam9', 'pin-1': 'black-pin2', 'pin-2': 'black-pin2',
  'grey-connector-1': 'grey-pinbeam3', 'grey-connector-2': 'grey-pinbeam3', 'pin-3': 'black-pin2', 'pin-4': 'black-pin2'
};
const rotate = quaternionFromAxisAngle;
const ry = rotate([0, 1, 0], Math.PI / 2);
const rz = rotate([0, 0, 1], -Math.PI / 2);
const whiteRotation: Quaternion = [0, 0, -s, s];
const uprightBlockRotation: Quaternion = [-0.5, 0.5, -0.5, 0.5];
const pose = (position: Vec3, nativeRotation: Quaternion = [0, 0, 0, 1]): Transform => at(position, nativeLDrawTransform([0, 0, 0], nativeRotation));
const shifted = (t: Transform, delta: Vec3): Transform => ({ ...t, position: t.position.map((n, i) => n + delta[i]!) as Vec3 });
const frameEvidence = fit(4, '39790 native frame has x bounds ±110, y±10, z±150 LDU (88×8×120 mm). Side-hole faces at z150 receive the four existing 48989 free pin bases. Registration is native translation [80,0,-180], no geometry centering.', [cad('39790', '39790.dat lines14–53; s/39790s01.dat lines14–20; s/39790s02.dat lines14–16'), blockCad]);
const subassemblies: Subassembly[] = [
  { id: 'front', name: 'Front Part — official Book 1', localTransform: identityTransform(), partInstanceIds: [], childSubassemblyIds: ['front-bracket'], evidence: frameEvidence },
  { id: 'front-bracket', name: 'Original datum bracket', parentId: 'front', localTransform: identityTransform(), partInstanceIds: ['beam-1', 'pin-1', 'pin-2'], childSubassemblyIds: ['left-end-bracket', 'right-end-bracket'], evidence: beamFit },
  { id: 'left-end-bracket', name: 'Left end cross block and upper pin', parentId: 'front-bracket', localTransform: identityTransform(), partInstanceIds: ['grey-connector-1', 'pin-3'], childSubassemblyIds: [], evidence: blockFit },
  { id: 'right-end-bracket', name: 'Right end cross block and upper pin', parentId: 'front-bracket', localTransform: identityTransform(), partInstanceIds: ['grey-connector-2', 'pin-4'], childSubassemblyIds: [], evidence: blockFit }
];
const preparationFrames: Record<string, Transform> = { front: identityTransform() };
function group(id: string, name: string, offset: Vec3, step: number, parentId = 'front', quaternion: Quaternion = [0, 0, 0, 1]): void {
  const parent = subassemblies.find((g) => g.id === parentId)!;
  parent.childSubassemblyIds.push(id);
  const world: Transform = { position: offset, quaternion, scale: [1, 1, 1] };
  preparationFrames[id] = world;
  subassemblies.push({ id, name, parentId, localTransform: relativeTransform(preparationFrames[parentId]!, world), partInstanceIds: [], childSubassemblyIds: [], evidence: fit(step, name + '; separate manual preparation, later reused without recounting.', [source(step)]) });
}
group('front-white-mounts', 'Two white motor supports', [0, 56, 64], 6);
group('front-medium-body', 'Medium motor and source cable clips', [104, 0, 48], 8);
group('front-motor-brace', 'Magenta upper connector and first H brace', [104, 0, 112], 11);
group('front-left-sensor', 'First sensor/caster unit', [-104, 0, 32], 16);
group('front-left-caster', 'First ball-cup preparation', [-104, 40, 32], 18, 'front-left-sensor');
group('front-right-sensor', 'Second sensor/caster unit', [104, 0, 32], 23);
group('front-right-caster', 'Second ball-cup preparation', [104, 40, 32], 25, 'front-right-sensor');
group('front-left-yellow', 'First yellow upper support', [-80, 56, 144], 31, 'front', [1, 0, 0, 0]);
group('front-right-yellow', 'Second yellow upper support', [80, 56, 144], 31, 'front', [1, 0, 0, 0]);
group('front-left-upright', 'First magenta upright support', [-100, 0, 160], 34);
group('front-right-upright', 'Second magenta upright support', [100, 0, 160], 34);
group('front-tool-output', 'Medium-motor rotor-driven gear and its two pins', [104, 80, 160], 37, 'front', [1, 0, 0, 0]);
const pageCamera = (step: number): CameraPreset => step < 15 || step === 36 || step >= 37
  ? camera([168, 140, 188], [32, 12, 48]) : camera([-120, 124, -152], [32, 12, 40]);
const newByStep: Record<number, string[]> = {};
function add(id: string, family: Family, step: number, finalTransform: Transform, groupId = 'front', axis?: Vec3, depthMm?: number): PartInstance {
  const f = families[family];
  const p: PartInstance = {
    id: `front-${id}`, geometryId: f.geometryId, materialId: f.materialId, name: f.name,
    finalTransform, initialTransform: shifted(finalTransform, [-160 + (parts.length % 10) * 36 - finalTransform.position[0], 4 - finalTransform.position[1], 196 + Math.floor(parts.length / 10) * 36 - finalTransform.position[2]]),
    connectionPoints: [], subassemblyId: groupId, sourceReference: source(step), geometryConfidence: 0.95, inventoryScope: 'robot',
    category: family === 'medium-motor' ? 'motor' : family === 'color-sensor' ? 'sensor' : family === 'grey-gear28' ? 'gear' : family.includes('pin') || family.includes('clip') || family.includes('tube') ? 'connector' : 'structure',
    identityEvidence: evidence('diagram-derived', `${family}: official Book 1 callout matched to ${f.geometryId}.dat; LDraw identifier is not a certified manufacturer element number.`, [source(step), cad(f.geometryId, 'Contextual family crosswalk')]),
    placementEvidence: fit(step, 'Manual topology and native 20-LDU Technic feature pitch. Source-view registration/fit remains independently unchecked; see docs/validation/adb-front.md for feature selection and uncertainties.', [cad(f.geometryId, 'Native DAT feature positions; private manual source view')])
  };
  parts.push(p); byId[p.id] = p; familyByPartId[p.id] = family;
  subassemblies.find((g) => g.id === groupId)!.partInstanceIds.push(p.id);
  const introduced = newByStep[step] ??= [];
  introduced.push(p.id);
  const work = preparationFrames[groupId]!;
  const target = composeTransforms(work, p.finalTransform);
  const direction = axis ? composeTransforms(work, pose(axis)).position.map((value, i) => value - work.position[i]!) as Vec3 : undefined;
  operations.push(mountPart({ ...p, finalTransform: target }, {
    stepId: stepId(1, step), sourceReference: source(step), startMs: (introduced.length - 1) * 1900, durationMs: 1800,
    axis: direction, depthMm, dependencies: [
      ...operations.filter((op) => op.stepId === stepId(1, step - 1)).map((op) => op.id),
      ...(introduced.length > 1 ? [`mount-${introduced[introduced.length - 2]!}`] : [])
    ], cameraPreset: pageCamera(step)
  }));
  return p;
}
function reuse(groupId: string, step: number, axis: Vec3, depthMm: number): void {
  const g = subassemblies.find((item) => item.id === groupId)!;
  const ids: string[] = [];
  const descendants = (id: string): void => { const current = subassemblies.find((item) => item.id === id)!; ids.push(...current.partInstanceIds); current.childSubassemblyIds.forEach(descendants); };
  descendants(groupId);
  const from = preparationFrames[groupId]!, to = preparationFrames[g.parentId ?? 'front']!;
  const aligned = shifted(to, axis.map((v) => -v * depthMm) as Vec3);
  const id = `front-reuse-${groupId}-${step}`;
  operations.push({
    id, stepId: stepId(1, step), operationType: 'merge-subassemblies', partInstanceIds: ids,
    fromTransforms: ids.map((partId) => composeTransforms(from, requiredPart(partId).finalTransform)),
    toTransforms: ids.map((partId) => composeTransforms(to, requiredPart(partId).finalTransform)),
    durationMs: 2600, startMs: 0, easing: 'smoothstep', dependencies: operations.filter((op) => op.stepId === stepId(1, step - 1)).map((op) => op.id),
    cameraPreset: pageCamera(step), sourceReference: source(step), parentChanges: [], evidence: g.evidence,
    stages: [
      { id: `${id}-approach`, startMs: 0, durationMs: 1700, phase: 'approach', nodes: [{ kind: 'subassembly', id: groupId }], fromTransforms: [from], toTransforms: [aligned], trajectory: { type: 'linear' }, easing: 'smoothstep', evidence: staging },
      { id: `${id}-seat`, startMs: 1700, durationMs: 900, phase: 'insert', nodes: [{ kind: 'subassembly', id: groupId }], fromTransforms: [aligned], toTransforms: [to], trajectory: { type: 'linear' }, easing: 'smoothstep', insertion: { axis, depthMm }, evidence: g.evidence }
    ]
  });
  preparationFrames[groupId] = to;
}
// Exact frame datum: the four native short-rail side-hole faces meet the existing integral pins.
const frame = add('frame', 'frame11x15', 4, nativeLDrawTransform([80, 0, -180]), 'front', [0, 0, -1], 8);
frame.placementEvidence = frameEvidence;
for (const [connector, xs] of [['grey-connector-1', [0, 16]], ['grey-connector-2', [48, 64]]] as const) {
  for (const x of xs) mate(`front-frame-bracket-${x}`, frame.id, `front-side-x${x}`, connector, `free-integral-pin-x${x}`, [x, 0, 12], [0, 0, -1], 'mount-front-frame', frameEvidence);
}
for (const [side, x] of [['left', -12], ['right', 76]] as const) {
  for (const [i, z] of [24, 40].entries()) add(`${side}-side-pin-${i + 1}`, 'black-pin2', 5, pose([x, 0, z]), 'front', [side === 'left' ? 1 : -1, 0, 0], 8);
}
add('inner-front-pin', 'black-pin2', 5, pose([32, 0, 20], [0, -s, 0, s]), 'front', [0, 0, -1], 8);
for (const [side, x] of [['left', 0], ['right', 64]] as const) {
  add(`${side}-white-block`, 'white-doublecross', 6, pose([x, 8, 16], whiteRotation), 'front-white-mounts');
  // 6558's split collar is at native x=-10, not at its origin; short/long extents -30/+30.
  add(`${side}-white-blue-pin`, 'blue-pin3', 6, pose([side === 'left' ? x + 8 : x - 8, 8, 16], [0, 0, s, s]), 'front-white-mounts', [0, -1, 0], 16);
}
reuse('front-white-mounts', 7, [0, -1, 0], 8);
for (const [i, [x, z]] of ([[-8, 32], [-8, 112], [-8, 128], [72, 32], [72, 112], [72, 128]] as const).entries()) add(`frame-upper-pin-${i + 1}`, 'black-pin2', 7, pose([x, 4, z], rz), 'front', [0, -1, 0], 8);
add('medium-motor', 'medium-motor', 8, pose([8, 16, 8], ry), 'front-medium-body');
for (const [i, x] of [0, 64].entries()) add(`motor-blue-pin-${i + 1}`, 'blue-pin3', 8, pose([x, 8, 24], ry), 'front-medium-body', [0, 0, -1], 8);
add('blue-clip', 'blue-wireclip', 9, pose([0, 8, 24]), 'front-medium-body', [0, 0, -1], 8);
add('green-clip', 'green-wireclip', 9, pose([64, 8, 24]), 'front-medium-body', [0, 0, -1], 8);
reuse('front-medium-body', 10, [0, -1, 0], 8);
add('motor-top-block', 'pink-connector3', 11, pose([32, 32, 8], ry), 'front-motor-brace');
for (const [i, [x, z]] of ([[24, 20], [40, 20], [24, -4], [40, -4]] as const).entries()) add(`top-block-pin-${i + 1}`, 'black-pin2', 11, pose([x, 32, z], [0, -s, 0, s]), 'front-motor-brace', [0, 0, z === 20 ? -1 : 1], 8);
add('motor-h-brace-1', 'grey-iframe3x5', 12, pose([32, 16, 24], [-s, 0, 0, s]), 'front-motor-brace', [0, 0, -1], 8);
add('brace-blue-pin', 'blue-pin3', 12, pose([24, 24, 24], [0, 1, 0, 0]), 'front-motor-brace', [1, 0, 0], 8);
add('red-clip', 'red-wireclip', 13, pose([24, 24, 24], ry), 'front-motor-brace', [1, 0, 0], 8);
reuse('front-motor-brace', 14, [0, 0, -1], 8);
add('motor-h-brace-2', 'grey-iframe3x5', 15, pose([32, 16, -8], [-s, 0, 0, s]), 'front', [0, 0, 1], 8);
// Paired source preparations: the second source sequence is mirrored, never counted as reuse of the first.
for (const [side, center, start] of [['left', 0, 16], ['right', 64, 23]] as const) {
  const sensorGroup = `front-${side}-sensor`, casterGroup = `front-${side}-caster`;
  add(`${side}-color-sensor`, 'color-sensor', start, pose([center, 8, 32], [s, 0, 0, s]), sensorGroup);
  for (const [i, dx] of [-8, 8].entries()) add(`${side}-sensor-blue-pin-${i + 1}`, 'blue-pin3', start, pose([center + dx, 16, 32], rz), sensorGroup, [0, -1, 0], 8);
  const direction: Vec3 = [side === 'left' ? 1 : -1, 0, 0];
  const bridgeRotation: Quaternion = side === 'left' ? [0.5, 0.5, 0.5, 0.5] : [0.5, -0.5, -0.5, 0.5];
  add(`${side}-sensor-crossblock`, 'grey-pinbeam3', start + 1, pose([center + (side === 'left' ? -16 : 16), 8, 32], bridgeRotation), sensorGroup, direction, 8);
  const cupX = center + (side === 'left' ? -24 : 24);
  const cupRotation: Quaternion = side === 'left' ? [0, 0, 0, 1] : [0, 1, 0, 0];
  const cup = add(`${side}-ball-cup`, 'ballcup', start + 2, pose([cupX, 8, 24], cupRotation), casterGroup);
  const ballPose = composeTransforms(cup.finalTransform, nativeLDrawTransform([0, 46, 0]));
  add(`${side}-ball`, 'ball19', start + 2, ballPose, casterGroup);
  reuse(casterGroup, start + 3, direction, 8);
  const cupSeatX = center + (side === 'left' ? -20 : 20);
  const cupInsertion: Vec3 = [side === 'left' ? -1 : 1, 0, 0];
  for (const [i, y] of [0, 16].entries()) add(`${side}-caster-pin-${i + 1}`, 'black-pin2', start + 4, pose([cupSeatX, y, 8]), sensorGroup, cupInsertion, 8);
  add(`${side}-caster-angle`, 'azur-angle3x5', start + 5, pose([center + (side === 'left' ? -16 : 16), 0, 40], rz), sensorGroup, cupInsertion, 8);
  reuse(sensorGroup, start + 6, direction, 8);
}
// Beam15 is horizontal with vertical holes; the source pins occupy h3/h5 and h11/h13.
const longBeamRotation: Quaternion = [s, 0, s, 0];
add('sensor-cross-rail', 'black-beam15', 30, pose([32, 20, 32], longBeamRotation), 'front', [0, -1, 0], 8);
for (const [side, center] of [['left', -24], ['right', 88]] as const) {
  const yellowGroup = `front-${side}-yellow`;
  add(`${side}-yellow-brick`, 'yellow-brick2x4', 31, pose([center, 33.6, 24], ry), yellowGroup);
  for (const [i, z] of [16, 32].entries()) add(`${side}-yellow-axlepin-${i + 1}`, 'red-axlepin3', 31, pose([center, 20, z], rz), yellowGroup, [0, 1, 0], 8);
  add(`${side}-yellow-spacer`, 'black-tube1', 32, pose([center, 20, 16]), yellowGroup, [0, 1, 0], 8);
}
reuse('front-left-yellow', 33, [0, -1, 0], 16); reuse('front-right-yellow', 33, [0, -1, 0], 16);
for (const [side, center] of [['left', 0], ['right', 64]] as const) {
  const uprightGroup = `front-${side}-upright`;
  add(`${side}-upright-block`, 'pink-connector3', 34, pose([center, 36, 32], uprightBlockRotation), uprightGroup);
  for (const [i, dx] of [-8, 8].entries()) add(`${side}-upright-pin-${i + 1}`, 'black-pin2', 34, pose([center + dx, 48, 32], rz), uprightGroup, [0, -1, 0], 8);
}
reuse('front-left-upright', 35, [0, -1, 0], 4); reuse('front-right-upright', 35, [0, -1, 0], 4);
operations.push(viewOperation('front-opposite-view', stepId(1, 36), source(36), pageCamera(36), 1600));
add('gear28', 'grey-gear28', 37, pose([8, 40, 8], [-s, 0, 0, s]), 'front-tool-output');
for (const [i, x] of [0, 16].entries()) add(`gear-pin-${i + 1}`, 'black-pin2', 37, pose([x, 36, 8], rz), 'front-tool-output', [0, 1, 0], 8);
reuse('front-tool-output', 38, [0, -1, 0], 8);
operations[operations.length - 1]!.parentChanges.push({
  node: { kind: 'subassembly', id: 'front-tool-output' },
  fromParent: { kind: 'subassembly', id: 'front' }, toParent: { kind: 'subassembly', id: 'front-medium-body' },
  fromLocalTransform: identityTransform(), toLocalTransform: identityTransform()
});

// Actual native anchors: the frame side holes and white supports use measured primitive origins.
for (const [side, x] of [['left', -12], ['right', 76]] as const) {
  for (const [i, z] of [24, 40].entries()) mate(`front-frame-${side}-pin-${i + 1}`, frame.id, `${side}-side-hole-${i + 1}`, `front-${side}-side-pin-${i + 1}`, 'frame-collar', [x, 0, z], [side === 'left' ? 1 : -1, 0, 0], `mount-front-${side}-side-pin-${i + 1}`, frameEvidence);
}
mate('front-inner-pin-seat', frame.id, 'front-center-inner-face', 'front-inner-front-pin', 'frame-collar', [32, 0, 20], [0, 0, -1], 'mount-front-inner-front-pin', frameEvidence);
for (const [i, [x, z]] of ([[-8, 32], [-8, 112], [-8, 128], [72, 32], [72, 112], [72, 128]] as const).entries()) mate(`front-vertical-pin-seat-${i + 1}`, frame.id, `upper-vertical-hole-${i + 1}`, `front-frame-upper-pin-${i + 1}`, 'frame-collar', [x, 4, z], [0, -1, 0], `mount-front-frame-upper-pin-${i + 1}`, frameEvidence);
for (const [side, x] of [['left', 0], ['right', 64]] as const) {
  const blueX = side === 'left' ? x + 8 : x - 8;
  const ev = fit(7, '32184 end cross-hole axis nativeX registers vertically and long axis nativeY registers across frameX. Source6 blue6558 collar sits on upper white faceY12, long half down toY-4. Its exposed lower8mm enters actual39790 short-rail vertical bore atX8/56,Z16. Old upper pins3/4 are MOTORBOTTOM mounts, not white mounts; source10 is modeled separately with the actual motor native bottom-hole faces.', [source(6), source(7), cad('32184', '32184.dat lines17–18 endcrossholes and lines37–38 centralroundhole facesnativeZ±10'), cad('6558', '6558.dat lines15–17 splitcollarnativeX-10'), cad('39790', 'nearshort-rail native vertical boresX±60,Z140')]);
  mate(`front-${side}-white-frame-pin`, frame.id, `${side}-white-support-vertical-hole`, `front-${side}-white-blue-pin`, 'long-half-frame-entry', [blueX, 4, 16], [0, -1, 0], 'front-reuse-front-white-mounts-7', ev);
  mate(`front-${side}-white-blue-seat`, `front-${side}-white-block`, 'inboard-upper-cross-hole', `front-${side}-white-blue-pin`, 'split-collar', [blueX, 12, 16], [0, -1, 0], `mount-front-${side}-white-blue-pin`, ev);
}
const motorFoundation = fit(10, 'Source10 medium motor lowers onto original upright pins3/4. Actual native motor bottom-hole entrance faces (0,30,-20)/(0,30,140), nativeRy90 at[8,16,8], map exactly to original collars[0/64,4,8]. Body lowerfaceY4; source15 Hinside facesZ-4/20 straddle motor width. Neither white6558 pins nor whitecenter roundbores are invented motor supports.', [source(10), source(15), cad('54696p01', 'u9364c01.dat bodyassemblies; u9365.dat line31 nativebottomconnhol3 atY20,Z-20, reversedprimitive entrance atY30; u9366.dat line17 bottom atY30,Z140'), pinCad]);
for (const [side, x, pinId] of [['left', 0, 'pin-3'], ['right', 64, 'pin-4']] as const) mate(`front-${side}-motor-datum-pin`, 'front-medium-motor', `${side}-bottom-native-y30-bore`, pinId, 'motor-bottom-seat', [x, 4, 8], [0, -1, 0], 'front-reuse-front-medium-body-10', motorFoundation);
for (const [i, x] of [0, 64].entries()) {
  const motor = requiredPart('front-medium-motor');
  mate(`front-motor-side-pin-${i + 1}`, motor.id, `housing-side-bore-${i + 1}`, `front-motor-blue-pin-${i + 1}`, 'split-collar', [x, 8, 20], [0, 0, -1], `mount-front-motor-blue-pin-${i + 1}`, motor.placementEvidence);
  mate(`front-motor-clip-${i + 1}`, `front-${i === 0 ? 'blue' : 'green'}-clip`, 'housing-facing-socket-face', `front-motor-blue-pin-${i + 1}`, 'clip-seat', [x, 8, 20], [0, 0, -1], `mount-front-${i === 0 ? 'blue' : 'green'}-clip`, motor.placementEvidence);
}
for (const [i, [x, z]] of ([[24, 20], [40, 20], [24, -4], [40, -4]] as const).entries()) {
  const block = requiredPart('front-motor-top-block');
  mate(`front-brace-top-pin-${i + 1}`, block.id, `perpendicular-edge-bore-${i + 1}`, `front-top-block-pin-${i + 1}`, 'block-collar', [x, 32, z], [0, 0, z === 20 ? -1 : 1], `mount-front-top-block-pin-${i + 1}`, block.placementEvidence);
  mate(`front-brace-upper-bar-${i + 1}`, `front-motor-h-brace-${z === 20 ? 1 : 2}`, `upper-end-bar-${i % 2 + 1}`, `front-top-block-pin-${i + 1}`, 'brace-seat', [x, 32, z], [0, 0, z === 20 ? -1 : 1], z === 20 ? 'mount-front-motor-h-brace-1' : 'mount-front-motor-h-brace-2', block.placementEvidence);
}
const braceEvidence = fit(12, '14720 perpendicular central bore nativeZ-20, through nativeX; sidefaceX-10. Blue6558 collar nativeX-10 and red49283 bush face nativeZ±10. This uses the actual perpendicular bore, not the upper end-bar through-hole.', [cad('14720', '14720.dat line18 and symmetric face details'), cad('6558', '6558.dat lines15–17'), cad('49283', '49283.dat lines14–28')]);
mate('front-brace-cross-pin', 'front-motor-h-brace-1', 'middle-perpendicular-side-bore', 'front-brace-blue-pin', 'split-collar', [28, 24, 24], [1, 0, 0], 'mount-front-brace-blue-pin', braceEvidence);
mate('front-brace-red-clip', 'front-red-clip', 'brace-facing-socket-face', 'front-brace-blue-pin', 'red-clip-seat', [28, 24, 24], [1, 0, 0], 'mount-front-red-clip', braceEvidence);
const braceFoundation = fit(14, 'Source14 inside H lower-bar center receives the single source5 inner-facing frame pin; source15 outside H lower-bar end holes receive original beam h4/h6 far pins. 14720 lower end bar raw native(x,z)=(0,40)/(±20,40), faceY±10. Outside lower-bar centers stay at datumY0, not Y8.', [source(14), source(15), cad('14720', '14720.dat line15 lower32523 end bar; native bore centers x-20/0/+20,z40'), beamCad, pinCad, cad('39790', 'Near rail center inner-facing horizontal bore native(0,0,130)')]);
mate('front-brace-inner-frame-pin', 'front-motor-h-brace-1', 'lower-bar-center-near-face', 'front-inner-front-pin', 'brace-free-half-seat', [32, 0, 20], [0, 0, -1], 'front-reuse-front-motor-brace-14', braceFoundation);
mate('front-brace-outer-beam-h4', 'front-motor-h-brace-2', 'lower-bar-end-h4-far-face', 'pin-1', 'brace-free-half-seat', [24, 0, -4], [0, 0, 1], 'mount-front-motor-h-brace-2', braceFoundation);
mate('front-brace-outer-beam-h6', 'front-motor-h-brace-2', 'lower-bar-end-h6-far-face', 'pin-2', 'brace-free-half-seat', [40, 0, -4], [0, 0, 1], 'mount-front-motor-h-brace-2', braceFoundation);
for (const [side, center] of [['left', -24], ['right', 88]] as const) {
  const brick = requiredPart(`front-${side}-yellow-brick`);
  for (const [i, z] of [16, 32].entries()) {
    mate(`front-${side}-brick-axle-${i + 1}`, brick.id, `lower-cross-hole-${i + 1}`, `front-${side}-yellow-axlepin-${i + 1}`, 'axle-pin-collar', [center, 24, z], [0, 1, 0], `mount-front-${side}-yellow-axlepin-${i + 1}`, brick.placementEvidence);
    mate(`front-${side}-yellow-cup-${i + 1}`, `front-${side}-ball-cup`, `upper-vertical-hole-${i + 1}`, `front-${side}-yellow-axlepin-${i + 1}`, 'cup-entry-bearing', [center, 12, z], [0, -1, 0], `front-reuse-front-${side}-yellow-33`, brick.placementEvidence);
  }
  mate(`front-${side}-brick-spacer`, `front-${side}-yellow-spacer`, 'upper-bore-face', `front-${side}-yellow-axlepin-1`, 'spacer-seat', [center, 24, 16], [0, 1, 0], `mount-front-${side}-yellow-spacer`, brick.placementEvidence);
  mate(`front-${side}-yellow-cross-rail`, 'front-sensor-cross-rail', side === 'left' ? 'end-hole-h1-upper-face' : 'end-hole-h15-upper-face', `front-${side}-yellow-axlepin-2`, 'cross-rail-collar', [center, 24, 32], [0, -1, 0], `front-reuse-front-${side}-yellow-33`, brick.placementEvidence);
}
for (const [side, center] of [['left', 0], ['right', 64]] as const) {
  const upright = requiredPart(`front-${side}-upright-block`);
  for (const [i, dx] of [-8, 8].entries()) {
    mate(`front-${side}-upright-upper-${i + 1}`, upright.id, `upper-edge-bore-${i + 1}`, `front-${side}-upright-pin-${i + 1}`, 'upright-collar', [center + dx, 48, 32], [0, -1, 0], `mount-front-${side}-upright-pin-${i + 1}`, upright.placementEvidence);
    mate(`front-${side}-upright-lower-${i + 1}`, upright.id, `lower-edge-bore-${i + 1}`, `front-${side}-sensor-blue-pin-${i + 1}`, 'upright-seat', [center + dx, 24, 32], [0, -1, 0], `front-reuse-front-${side}-upright-35`, upright.placementEvidence);
  }
}
for (const [side, center, start] of [['left', 0, 16], ['right', 64, 23]] as const) {
  const ev = fit(start, '37308 native optical axis-Z registers scene-Y using nativeRx90. Upper pin bores native(x,y,z)=(±20,0,10) have worldcollarsY12. Sensor side nativeX±30,Y±20 bores receive horizontal48989 integralpairs; source20 uses cup outer-end verticalrow nativeY±20 and source21 Lshort-leg endpoint holes0/40, not two adjacentholes.', [source(start), cad('37308', 's/u9408s01.dat line32 perpendicularbores; nativeX30,Y±20 sidebores'), cad('6558', 'splitcollarnativeX-10')]);
  for (const [i, dx] of [-8, 8].entries()) {
    mate(`front-${side}-sensor-pin-${i + 1}`, `front-${side}-color-sensor`, `upper-perpendicular-mount-${i + 1}`, `front-${side}-sensor-blue-pin-${i + 1}`, 'split-collar', [center + dx, 12, 32], [0, -1, 0], `mount-front-${side}-sensor-blue-pin-${i + 1}`, ev);
    mate(`front-${side}-rail-sensor-${i + 1}`, 'front-sensor-cross-rail', `${side}-hole-${side === 'left' ? (i === 0 ? 3 : 5) : (i === 0 ? 11 : 13)}`, `front-${side}-sensor-blue-pin-${i + 1}`, 'rail-lower-face', [center + dx, 16, 32], [0, -1, 0], 'mount-front-sensor-cross-rail', ev);
  }
  const cup = requiredPart(`front-${side}-ball-cup`), ball = requiredPart(`front-${side}-ball`);
  cup.connectionPoints.push({ id: 'ball-socket-center', type: 'surface', localTransform: nativeLDrawTransform([0, 46, 0]), evidence: cup.placementEvidence });
  ball.connectionPoints.push({ id: 'ball-center', type: 'surface', localTransform: identityTransform(), evidence: cup.placementEvidence });
  connections.push({ id: `front-${side}-ball-socket`, a: { partInstanceId: cup.id, connectionPointId: 'ball-socket-center' }, b: { partInstanceId: ball.id, connectionPointId: 'ball-center' }, type: 'contact', installedByOperationId: `mount-${ball.id}`, evidence: cup.placementEvidence });
  const gray = requiredPart(`front-${side}-sensor-crossblock`);
  const sensorFaceX = center + (side === 'left' ? -12 : 12), cupFaceX = center + (side === 'left' ? -20 : 20);
  for (const [i, z] of [24, 40].entries()) {
    mate(`front-${side}-sensor-gray-${i + 1}`, `front-${side}-color-sensor`, `side-bore-${i + 1}`, gray.id, `sensor-integral-base-${i + 1}`, [sensorFaceX, 8, z], [side === 'left' ? 1 : -1, 0, 0], `mount-${gray.id}`, ev);
    mate(`front-${side}-gray-cup-${i + 1}`, cup.id, `inner-end-horizontal-bore-${i + 1}`, gray.id, `caster-integral-base-${i + 1}`, [cupFaceX, 8, z], [side === 'left' ? -1 : 1, 0, 0], `front-reuse-front-${side}-caster-${start + 3}`, ev);
  }
  for (const [i, y] of [0, 16].entries()) {
    mate(`front-${side}-cup-side-pin-${i + 1}`, cup.id, `outer-end-side-hole-${i + 1}`, `front-${side}-caster-pin-${i + 1}`, 'cup-collar', [cupFaceX, y, 8], [side === 'left' ? -1 : 1, 0, 0], `mount-front-${side}-caster-pin-${i + 1}`, ev);
    mate(`front-${side}-cup-angle-${i + 1}`, `front-${side}-caster-angle`, `short-leg-end-hole-${i + 1}`, `front-${side}-caster-pin-${i + 1}`, 'angle-seat', [cupFaceX, y, 8], [side === 'left' ? -1 : 1, 0, 0], `mount-front-${side}-caster-angle`, ev);
  }
  for (const [i, z] of [24, 40].entries()) mate(`front-${side}-angle-frame-${i + 1}`, `front-${side}-caster-angle`, `long-arm-native-z${z === 24 ? 40 : 0}-frame-seat`, `front-${side}-side-pin-${i + 1}`, 'angle-frame-seat', [side === 'left' ? -12 : 76, 0, z], [side === 'left' ? 1 : -1, 0, 0], `front-reuse-front-${side}-sensor-${start + 6}`, ev);
}
const outputEvidence = fit(38, '46372 gear axis nativeZ; opposing round holes native x±20,y0, not center cross axle hole. Lower z+10 face meets motor rotor native y=-50 at sceneY36. Two2780 collars seat there and occupy round output holes native z±20; acquired rotor node parts/u9363p01.dat rotates, not housing.', [cad('46372', '46372.dat lines51–55'), cad('54696p01', '54696p01.dat line18; s/u9363s01.dat roundbores'), pinCad]);
for (const [i, x] of [0, 16].entries()) {
  mate(`front-gear-pin-seat-${i + 1}`, 'front-gear28', `round-hole-${i + 1}`, `front-gear-pin-${i + 1}`, 'gear-collar', [x, 36, 8], [0, 1, 0], `mount-front-gear-pin-${i + 1}`, outputEvidence);
  mate(`front-rotor-gear-seat-${i + 1}`, 'front-medium-motor', `rotor-round-hole-${i + 1}`, `front-gear-pin-${i + 1}`, 'rotor-collar', [x, 36, 8], [0, -1, 0], 'front-reuse-front-tool-output-38', outputEvidence);
}
const attachmentSites: BuildFragment['attachmentSites'] = {};
const integrationDocument = advancedDrivingBaseDocuments[4]!;
const integrationSource = (page: number): SourceReference => ({ documentId: integrationDocument.id, page, sourceUrl: `${integrationDocument.sourceUrl}#page=${page}`, confidence: 0.85, figure: `Book 5 integration page ${page}` });
function site(key: string, partId: string, pointId: string, frame: Transform, type: PartInstance['connectionPoints'][number]['type'], description: string, page: number): void {
  const p = requiredPart(partId);
  p.connectionPoints.push({ id: pointId, type, localTransform: frame, evidence: placement(evidence('diagram-derived', description, [integrationSource(page)], 0.85), evidence('cad-derived', description + ' Actual native feature; source-to-feature correspondence remains unchecked.', [cad(p.geometryId, 'Native DAT hole/shaft primitive')], 0.85)) });
  attachmentSites[key] = { partInstanceId: partId, connectionPointId: pointId, description, sourceReference: integrationSource(page) };
}
for (const [side, nativeX] of [['left', -100], ['right', 100]] as const) {
  for (const [i, nativeZ] of [60, 20].entries()) {
    site(`${side}-side-front-${i + 1}`, frame.id, `${side}-side-receiver-${i + 1}`, nativeLDrawTransform([nativeX, -10, nativeZ]), 'hole', `Book5 side housing-pin receiver: actual39790 vertical bore (${nativeX},-10,${nativeZ})LDU; upper face worldX${side === 'left' ? -8 : 72},Y4,Z${nativeZ === 60 ? 48 : 64}. Source correspondence unchecked. Not a pin-to-pin joint with Book1step5 horizontal pins.`, side === 'left' ? 9 : 10);
  }
}
for (const [side, center] of [['left', 0], ['right', 64]] as const) {
  for (const [i, dx] of [-8, 8].entries()) site(`upper-front-${side}-${i + 1}`, `front-${side}-upright-pin-${i + 1}`, 'upper-frame-seat', { position: [0, 0, 0], quaternion: [0, 0, -s, s], scale: [1, 1, 1] }, 'pin', `39793 native edge bore (30,0,${dx < 0 ? -20 : 20}); collar world(${center + dx},48,32), axisY; Book5 upper frame.`, 15);
}
for (const [side, x] of [['left', -100], ['right', 100]] as const) {
  for (const [end, z] of [['front', 60], ['rear', -60]] as const) site(`underside-${side}-${end}`, frame.id, `underside-${side}-${end}`, nativeLDrawTransform([x, 10, z]), 'hole', `39790 actual lower-face vertical bore (${x},10,${z})LDU; source underside5x7 four-pin correspondence is unchecked.`, 21);
}
for (const [side, x] of [['left', -100], ['right', 100]] as const) site(`stop-axle-${side}`, frame.id, `stop-axle-${side}`, nativeLDrawTransform([x, -10, 100]), 'hole', `39790 actual through bore (${x},-10,100)LDU; Book5stop axle passes vertically through selected source rail hole. Source correspondence requires parent source comparison.`, 16);
site('front-medium-electrical', 'front-medium-motor', 'captive-cable', nativeLDrawTransform([0, 0, 143]), 'electrical', 'Actual u9364c01 captive cable stub at native z143; no extra inventory cable/pin.', 4);
for (const side of ['left', 'right'] as const) site(`${side}-color-electrical`, `front-${side}-color-sensor`, 'captive-cable', nativeLDrawTransform([0, 0, 3]), 'electrical', 'Actual37308 captive cable stub at native z3; no extra inventory cable/pin.', 5);
const extraSteps: AssemblyStep[] = sourcePages.filter((page) => page.step > 3).map((page) => ({
  id: stepId(1, page.step), title: `Front Part ${page.step}: ${page.description.split(';')[0].split('.')[0]}`,
  description: page.description, kind: 'numbered-instruction', action: page.step === 36 ? 'view' : page.additions.length ? 'assembly' : 'reuse', sourceReferences: [source(page.step)],
  operationIds: operations.filter((op) => op.stepId === stepId(1, page.step)).map((op) => op.id), requiredPartInstanceIds: newByStep[page.step] ?? [],
  warnings: ['Source topology and licensed native CAD authored; only the original steps1–3 have parent-exercised verification. Source-view registration, tolerances and contact fits remain unchecked. Staging/timing are presentation-only.'],
  durationMs: Math.max(2000, ...operations.filter((op) => op.stepId === stepId(1, page.step)).map((op) => op.startMs + op.durationMs)) + 300, cameraPreset: pageCamera(page.step)
}));
export const front: BuildFragment = {
  rootId: 'front', attachmentSites, familyByPartId, parts, steps: [...steps, ...extraSteps], operations,
  installations: operations.filter((op) => op.partInstanceIds.length === 1 && op.id.startsWith('mount-')).map((op) => ({ partInstanceId: op.partInstanceIds[0]!, stepId: op.stepId, atMs: op.startMs + op.durationMs, operationId: op.id })),
  visibility: [], subassemblies, connections,
  joints: [{ id: 'front-tool-joint', name: 'Front medium-motor supported output', type: 'revolute', parent: { kind: 'subassembly', id: 'front-medium-body' }, child: { kind: 'subassembly', id: 'front-tool-output' }, origin: pose([8, 36, 8]), childTransform: pose([-8, -36, -8]), axis: [0, 1, 0], zero: 0, drivenByMotorId: 'front-medium', internalBinding: { partInstanceId: 'front-medium-motor', geometryNodeId: 'parts/u9363p01.dat', movingSide: 'rotor' }, evidence: outputEvidence }],
  linkageConstraints: [], motors: [{ id: 'front-medium', partInstanceId: 'front-medium-motor', port: 'D', jointId: 'front-tool-joint', assignmentEvidence: evidence('documented', 'Book5 page4 portD front medium output; motor remains one prepared unit with captive cable.', [integrationSource(4)]) }], cables: [],
  inventory: (Object.keys(families) as Family[]).map((family) => ({ id: `book1-${family}`, name: families[family].name, scope: 'robot', basis: 'prepared-callout-units', accounting: 'tracked', quantity: sourcePages.reduce((sum, page) => sum + page.additions.filter((line) => line.family === family).reduce((n, line) => n + line.quantity, 0), 0), partInstanceIds: parts.filter((p) => familyByPartId[p.id] === family).map((p) => p.id), sourceReferences: sourcePages.filter((page) => page.additions.some((line) => line.family === family)).map((page) => source(page.step)) })),
  milestones: [{ id: 'front-datum-complete', title: 'Original seven-unit datum bracket', stepId: stepId(1, 3) }, { id: 'front-frame-prepared', title: 'Frame and motor mount pins prepared', stepId: stepId(1, 7) }, { id: 'front-two-sensors', title: 'Both distinct source sensor/caster units installed', stepId: stepId(1, 29) }, { id: 'front-book1-authored', title: 'Front Part source coverage complete — fits unchecked', stepId: stepId(1, 38) }],
  sourceMappings: operations.map((op) => ({ source: op.sourceReference!, stepId: op.stepId, operationId: op.id }))
};
