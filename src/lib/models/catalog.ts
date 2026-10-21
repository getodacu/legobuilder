import type { CatalogEntry, ModelCoverage, ModelIdentity, SourceDocument } from '../types/model.ts';
import authoredSummaries from '../../../static/models/catalog-metadata.json' with { type: 'json' };

const legoAssets = 'https://assets.education.lego.com/v3/assets/blt293eea581807678a/';
const manual = (id: string, title: string, path: string, sha256: string, pageCount?: number): SourceDocument => ({
  id, title, sourceUrl: `${legoAssets}${path}?locale=en-us`, edition: '2019 PDF export; no printed revision',
  sha256, ...(pageCount === undefined ? {} : { pageCount }), redistribution: 'link-only'
});

export const advancedDrivingBaseIdentity: ModelIdentity = {
  id: 'advanced-driving-base', name: 'Advanced Driving Base', manufacturer: 'LEGO Education',
  edition: '2019 · five instruction books', category: 'Mobile robot', complexity: 'Advanced',
  description: 'Build a wheeled base with two drive motors, color sensors and front and rear tool outputs. The rear mounting fit in this guide needs checking against the official instructions.'
};

export const advancedDrivingBaseDocuments: SourceDocument[] = [
  manual('adb-book1', 'Advanced Driving Base — Front Part', 'blt9d23fa8f579e63ea/5f8802346c54ba0f72c2081e/advanced-driving-base-bi-pdf-book1of5.pdf', '903c68142601a3fbd50a4c22eac64e1fd950bd037b667626e4eacc362e8d7901', 38),
  manual('adb-book2', 'Advanced Driving Base — Right Side', 'blt0ee7fdaec9e58ae1/5f88021925f8972408a02fde/advanced-driving-base-bi-pdf-book2of5.pdf', '7985dd81ea0a880de3ac0223f4d2e382ff359cdad3bc733a688a19c5506a758b', 24),
  manual('adb-book3', 'Advanced Driving Base — Left Side', 'blt493de8c0e8747730/5f88021dce1f390e99419eca/advanced-driving-base-bi-pdf-book3of5.pdf', '03f0b4d6bdf4daf5f7fbbaa27a8443ce253a84582f0af4ee9f5ca1a981cd60c3', 24),
  manual('adb-book4', 'Advanced Driving Base — Rear Part', 'blt31204a16915d90ff/5f88023d0fa6ca0be8c8d3bd/advanced-driving-base-bi-pdf-book4of5.pdf', '6d8c32bc457e17a2f816da54a422f9cf4f0cde55235a5d3d610816d846342b89', 31),
  manual('adb-book5', 'Advanced Driving Base — Assembly', 'blt12341bbb85ea4318/5f8802c42792080f77214054/advanced-driving-base-bi-pdf-book5of5.pdf', '5099a43ac8a262d8a3003145699bc4bcb4ebef07d23d1a4414f080c5dc98d935', 23)
];

export const advancedDrivingBaseCoverage: ModelCoverage = {
  documentedSteps: 136, implementedSteps: 136, verifiedSteps: 3, modeledComponents: 234, verifiedComponents: 7,
  geometryConfidence: 0.9,
  dimensions: {
    inventory: { status: 'partial', verified: 7, total: 234, note: '234 distinct prepared callout identities are authored, reconciled by exact source-book/family rows at manifest generation. Historical molds/element numbers remain uncertified; reuse never adds another unit.' },
    geometry: { status: 'partial', verified: 7, total: 234, note: 'Actual licensed LDraw component roots, fixed source colors and genuine motor rotor nodes; later source-view correspondence, historical molds and physical fits remain independently unchecked.' },
    placement: { status: 'partial', verified: 7, total: 234, note: 'Original seven-unit datum retained; first three nominal source/CAD checks are not physical clearance certification. Side64179 frames now register actual motor-face bores; rear free bracket span64mm versus side pin span96mm still leaves four lower drive-to-rear contacts unjoined.' },
    kinematics: { status: 'partial', verified: 0, total: 4, note: 'Two real wheel joints and independent front D/rear C motor-output joints share the completed assembly hierarchy. Deterministic unit and real-browser motion checks passed; physical calibration and safe travel remain unverified.' },
    simulation: { status: 'partial', verified: 0, total: 1, note: 'Deterministic -Z-forward course, original non-BOM markers, typed B/F inputs and independent C/D commands passed real-browser checks. Collision/clearance, traction, motor power and optical response remain simplified extensions.' }
  },
  outstandingDeviations: [
    'Authored136-step coverage is not136 verified placements: only the original3 instructions/seven datum units have retained nominal source/CAD verification.',
    'Side64179 motor-frame registration uses actual native-X connhol2 bores at local x±40,z±40 after a proper90° yaw. Outside/lower reinforcement and retention/clearance remain independently unchecked; previous false Y-axis corner-hole connections were removed.',
    'Real free rear H/upright receiver span64mm versus side blue-pin span96mm and actual13L rail endpoint bores face a different axis: the rear approaches at diagram-derived source-feature midpoints, but four lower contacts are intentionally not claimed as fixed fits.',
    'Captive electrical topology and source clip identities are authored; unverified flexible cable splines, lengths, compliance and dynamic routing are not invented.',
    'LDraw dimensions use0.4mm/LDU, not certified manufacturer measurements; historical molds and manufacturer element IDs are not certified.',
    'Course props and behaviors are RoboBuild extensions, outside the234-unit source BOM; scripted color samples, modeled rates and no certified traction/collision physics.',
    'Original previews, deterministic union tests and course browser evidence have been exercised. Independent source-view comparison and mechanical clearance for all new poses are still required before any full-fit promotion.'
  ]
};

function unavailableCoverage(steps: number, units: number | undefined, note: string, permissionBlocked = false): ModelCoverage {
  const missing = { status: permissionBlocked ? 'blocked' as const : 'unimplemented' as const, verified: 0, note };
  return {
    documentedSteps: steps, implementedSteps: 0, verifiedSteps: 0, modeledComponents: 0, verifiedComponents: 0, geometryConfidence: 0,
    dimensions: {
      inventory: { status: 'unimplemented', verified: 0, ...(units === undefined ? {} : { total: units }), note },
      geometry: { ...missing }, placement: { ...missing }, kinematics: { ...missing }, simulation: { ...missing }
    }, outstandingDeviations: [note]
  };
}
function available(id: string): Extract<CatalogEntry, { status: 'available' }> {
  const summary = (authoredSummaries as unknown as { identity: ModelIdentity; coverage: ModelCoverage }[]).find((entry) => entry.identity.id === id);
  if (!summary) throw new Error(`Missing published model metadata: ${id}`);
  return { status: 'available', ...summary, modelUrl: `/models/${id}/manifest.json`, previewUrl: `/previews/${id}.png` };
}


export const catalog: CatalogEntry[] = [
  { status: 'available', identity: advancedDrivingBaseIdentity, modelUrl: '/models/advanced-driving-base/manifest.json',
    previewUrl: '/previews/advanced-driving-base.png', coverage: advancedDrivingBaseCoverage },
  available('robotic-hand'),
  available('quality-check'),
  available('package-sorter'),
  {
    status: 'blocked', identity: { id: 'vex-clawbot', name: 'V5 Clawbot', manufacturer: 'VEX Robotics', edition: 'historical2018 — manual 276-6009-750 Rev1', category: 'Mobile manipulator', complexity: 'Advanced', description: 'Permission-blocked historical build. Private official CAD inspection does not grant application conversion/use rights.' },
    sourceDocuments: [{ id: 'vex-historical2018', title: 'V5 Clawbot Build Instructions', sourceUrl: 'https://content.vexrobotics.com/docs/V5-Clawbot-BuildInstructions-0720.pdf', edition: '276-6009-750 Rev1 ©2018; distinct from CAD assembly revision', sha256: 'cd08303f81e1e48d6ab6ca6ff126ca9dff5c92ec579e4e06cfeb99d44a00dd8b', pageCount: 28, redistribution: 'link-only' }],
    coverage: unavailableCoverage(41, undefined, '41 documented historical2018 steps; conflicting printed/step inventories and preassembled claw scope remain unresolved. No procurement total asserted; no VEX runtime geometry converted or used.', true),
    blockers: ['Explicit scoped CAD-to-app conversion/use permission is absent, including localhost use.', 'Historical manual/CAD exact equivalence and inventory discrepancies remain unresolved.'],
    requiredScenario: 'Differential drive, arm and coupled claw pickup/transport/release on the actual source-backed hierarchy, only after permission and reconstruction.'
  }
];
