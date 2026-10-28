/** Scene space: right-handed Y-up, millimeters; no implicit recentering. */
export type Vec3 = [number, number, number];
export type Quaternion = [number, number, number, number];
export type Transform = {
  position: Vec3;
  quaternion: Quaternion;
  scale: Vec3;
};

/** One-based PDF page; instructionId remains book-local, not a timeline index. */
export type SourceReference = {
  documentId: string;
  page?: number;
  figure?: string;
  instructionId?: string;
  sourceUrl: string;
  confidence: number;
};

export type Evidence = {
  category: 'documented' | 'cad-derived' | 'measured' | 'diagram-derived' | 'app-authored' | 'unknown';
  confidence: number;
  sources: SourceReference[];
  note: string;
};
export type PlacementEvidence = {
  relationship: Evidence;
  placement: 'acquired-cad' | 'measured-attachment' | 'diagram-derived' | 'presentation-only';
  evidence: Evidence;
  fit: 'verified' | 'unchecked' | 'conflict';
};
export type SourceDocument = {
  id: string;
  title: string;
  sourceUrl: string;
  edition: string;
  sha256: string;
  pageCount?: number;
  redistribution: 'link-only' | 'permitted';
};
export type CameraPreset = {
  position: Vec3;
  target: Vec3;
  up: Vec3;
  projection: 'perspective' | 'orthographic';
  framing: number;
  transitionMs: number;
};

export type ConnectionPoint = {
  id: string;
  type: 'pin' | 'hole' | 'axle' | 'axle-hole' | 'stud' | 'tube' | 'fastener' | 'electrical' | 'surface';
  localTransform: Transform;
  evidence: PlacementEvidence;
};
export type Connection = {
  id: string;
  a: { partInstanceId: string; connectionPointId: string };
  b: { partInstanceId: string; connectionPointId: string };
  type: 'fixed' | 'pivot' | 'sliding' | 'electrical' | 'contact';
  installedByOperationId?: string;
  evidence: PlacementEvidence;
};

/** Required user fields are preserved; identity is independent of geometry. */
export type PartInstance = {
  id: string;
  partNumber?: string;
  geometryId: string;
  materialId: string;
  name: string;
  finalTransform: Transform;
  connectionPoints: ConnectionPoint[];
  subassemblyId?: string;
  sourceReference?: SourceReference;
  geometryConfidence: number;
  initialTransform: Transform;
  inventoryScope: 'robot' | 'sample';
  category: 'structure' | 'connector' | 'fastener' | 'motor' | 'sensor' | 'controller' | 'wheel' | 'gear' | 'cable' | 'other';
  identityEvidence: Evidence;
  placementEvidence: PlacementEvidence;
};

export type LicenseAttribution = {
  sourcePath: string;
  sourceUrl: string;
  sha256: string;
  originalHeader: string;
  authors: string[];
  licenseIds: string[];
  licenseUrls: string[];
  modifications: string[];
};
export type GeometryAsset = {
  id: string;
  url: string;
  format: 'dat' | 'mpd' | 'stl' | 'obj' | 'gltf' | 'glb';
  sha256: string;
  dependencyIds: string[];
  nativeUnits: 'ldu' | 'mm' | 'm' | 'declared';
  nativeToScene: Transform;
  preserveOrigin: true;
  attribution: LicenseAttribution[];
  materialSlots: { id: string; colorMode: 'inherited' | 'fixed' | 'edge'; materialId?: string }[];
  internalNodes?: { id: string; parentId?: string; localTransform: Transform }[];
};
export type MaterialDefinition = {
  id: string;
  name: string;
  color: string;
  metalness: number;
  roughness: number;
  opacity: number;
  category: 'plastic' | 'rubber' | 'metal' | 'electronic' | 'transparent';
  evidence: Evidence;
};

export type NodeRef = { kind: 'part' | 'subassembly'; id: string };
export type ParentChange = {
  node: NodeRef;
  fromParent: NodeRef | null;
  toParent: NodeRef | null;
  fromLocalTransform: Transform;
  toLocalTransform: Transform;
};
export type Spin = {
  axis: Vec3;
  turns: number;
};
export type Trajectory =
  | { type: 'linear' }
  | { type: 'cubic-bezier'; control1: Vec3; control2: Vec3 };
export type MotionStage = {
  id: string;
  startMs: number;
  durationMs: number;
  phase: 'approach' | 'align' | 'insert' | 'fasten' | 'settle' | 'transfer';
  nodes: NodeRef[];
  fromTransforms: Transform[];
  toTransforms: Transform[];
  trajectory: Trajectory;
  easing: 'linear' | 'smoothstep';
  insertion?: { axis: Vec3; depthMm: number };
  spin?: Spin;
  evidence: PlacementEvidence;
};

/** Required user fields are unchanged. Transform arrays match partInstanceIds. */
export type AssemblyOperation = {
  id: string;
  stepId: string;
  operationType:
    | 'insert'
    | 'slide'
    | 'rotate'
    | 'fasten'
    | 'align'
    | 'attach'
    | 'connect'
    | 'merge-subassemblies';
  partInstanceIds: string[];
  fromTransforms: Transform[];
  toTransforms: Transform[];
  durationMs: number;
  easing: string;
  dependencies: string[];
  cameraPreset?: CameraPreset;
  sourceReference?: SourceReference;
  startMs: number;
  stages: MotionStage[];
  parentChanges: ParentChange[];
  evidence: PlacementEvidence;
};
export type InstallationMilestone = {
  partInstanceId: string;
  stepId: string;
  atMs: number;
  operationId: string;
};
export type VisibilityMilestone = {
  partInstanceId: string;
  stepId: string;
  atMs: number;
  visible: boolean;
};
export type AssemblyStep = {
  id: string;
  title: string;
  description: string;
  kind: 'numbered-instruction' | 'unnumbered-preparation' | 'presentation';
  action: 'assembly' | 'view' | 'wiring' | 'reuse';
  sourceReferences: SourceReference[];
  operationIds: string[];
  requiredPartInstanceIds: string[];
  warnings: string[];
  durationMs: number;
  cameraPreset?: CameraPreset;
};
export type Subassembly = {
  id: string;
  name: string;
  parentId?: string;
  localTransform: Transform;
  partInstanceIds: string[];
  childSubassemblyIds: string[];
  evidence: PlacementEvidence;
};

export type JointLimit = {
  min: number;
  max: number;
  basis: 'modeled' | 'physical';
  evidence: Evidence;
};
export type Joint = {
  id: string;
  name: string;
  type: 'fixed' | 'revolute' | 'prismatic';
  parent: NodeRef;
  child: NodeRef;
  origin: Transform;
  childTransform: Transform;
  axis: Vec3;
  zero: number;
  limits?: JointLimit;
  maxSpeed?: { value: number; basis: 'modeled' | 'physical'; evidence: Evidence };
  drivenByMotorId?: string;
  coupling?: { driverJointId: string; ratio: number; offset: number; evidence: Evidence };
  /**
   * The external joint moves its actual child; geometryNodeId names the real rotor.
   * rotor: the motor body stays fixed and its rotor turns by the joint delta.
   * body: the body part/subtree follows the child while the rotor countertransforms
   * to stay fixed relative to the joint parent. Never rotate the body twice.
   */
  internalBinding?: { partInstanceId: string; geometryNodeId: string; movingSide: 'body' | 'rotor' };
  evidence: PlacementEvidence;
};
export type LinkageConstraint = {
  id: string;
  type: 'planar-closed-loop';
  driverJointId: string;
  dependentJointIds: string[];
  planeNormal: Vec3;
  links: { a: { node: NodeRef; point: Vec3 }; b: { node: NodeRef; point: Vec3 }; lengthMm: number }[];
  /** Values ordered [driverJointId, ...dependentJointIds], selecting the reference branch. */
  referenceJointValues: number[];
  branch: 'reference-continuous';
  toleranceMm: number;
  evidence: PlacementEvidence;
};
export type MotorDefinition = {
  id: string;
  partInstanceId: string;
  port?: string;
  jointId?: string;
  assignmentEvidence: Evidence;
};
export type MotorCommand = {
  motorId: string;
  startMs: number;
  durationMs: number;
  mode: 'position' | 'speed';
  from: number;
  to: number;
  unit: 'rad' | 'mm' | 'rad/s' | 'mm/s';
  easing: 'linear' | 'smoothstep';
  evidence: Evidence;
};
export type SensorSignal = {
  sensorPartInstanceId: string;
  port?: string;
  timeMs: number;
  type: 'color' | 'distance' | 'button' | 'light';
  value: string | number | boolean;
  basis: 'scripted-input' | 'geometric-model' | 'documented-output';
  evidence: Evidence;
};
export type CableRoute = {
  id: string;
  devicePartInstanceId: string;
  cablePartInstanceId?: string;
  captive: boolean;
  fromConnection: string;
  toConnection: string;
  controlPoints: { parent: NodeRef | null; position: Vec3 }[];
  routeEvidence: Evidence;
  lengthMm?: { value: number; evidence: Evidence };
};
/** External demo props, never official inventory or assembly participants. */
export type SimulationObject = {
  id: string;
  name: string;
  geometryId: string;
  materialId: string;
  initialTransform: Transform;
  evidence: Evidence;
};
export type SimulationScenario = {
  id: string;
  title: string;
  description: string;
  fidelity: 'deterministic-kinematics';
  durationMs: number;
  motorCommands: MotorCommand[];
  sensorSignals: SensorSignal[];
  objectEvents: {
    timeMs: number;
    /** A sample subassembly or external simulationObject ID; IDs must not collide. */
    objectSubassemblyId: string;
    action: 'attach' | 'release';
    parent: NodeRef | null;
    /** Parent-local on attach, world-space on release. */
    transform: Transform;
    capture?: {
      contacts: { holder: NodeRef; holderPoint: Vec3; objectPoint: Vec3 }[];
      maxGapMm: number;
      poseToleranceMm: number;
      angleToleranceRad: number;
      evidence: Evidence;
    };
    evidence: Evidence;
  }[];
  rootMotion: { node: NodeRef; timeMs: number; transform: Transform; evidence: Evidence }[];
  differentialDrive?: {
    rootSubassemblyId: string;
    leftJointId: string;
    rightJointId: string;
    wheelRadiusMm: number;
    trackWidthMm: number;
    /** Physical midpoint between wheel centers, in the assembly root's local millimeters. */
    axleCenterInRoot: Vec3;
    /** Completed assembly root pose, not the axle-center pose. */
    initialTransform: Transform;
    evidence: Evidence;
  };
  limitations: string[];
  sourceReferences: SourceReference[];
};

export type InventoryLine = {
  id: string;
  name: string;
  scope: 'robot' | 'sample';
  basis: 'prepared-callout-units' | 'printed-inventory' | 'step-additions' | 'cad-occurrences';
  accounting: 'tracked' | 'reference-only';
  quantity: number;
  partInstanceIds: string[];
  sourceReferences: SourceReference[];
  discrepancy?: string;
};
export type CoverageDimension = {
  status: 'unimplemented' | 'partial' | 'complete' | 'blocked';
  verified: number;
  total?: number;
  note: string;
};
export type ModelCoverage = {
  documentedSteps: number;
  implementedSteps: number;
  verifiedSteps: number;
  modeledComponents: number;
  verifiedComponents: number;
  geometryConfidence: number;
  dimensions: { inventory: CoverageDimension; geometry: CoverageDimension; placement: CoverageDimension; kinematics: CoverageDimension; simulation: CoverageDimension };
  outstandingDeviations: string[];
};
export type ModelIdentity = {
  id: string;
  name: string;
  manufacturer: string;
  edition: string;
  category: string;
  complexity: string;
  description: string;
};
export type RobotModel = ModelIdentity & {
  schemaVersion: 1;
  sourceDocuments: SourceDocument[];
  parts: PartInstance[];
  geometryAssets: GeometryAsset[];
  materials: MaterialDefinition[];
  steps: AssemblyStep[];
  operations: AssemblyOperation[];
  installations: InstallationMilestone[];
  visibility: VisibilityMilestone[];
  subassemblies: Subassembly[];
  connections: Connection[];
  joints: Joint[];
  linkageConstraints: LinkageConstraint[];
  motors: MotorDefinition[];
  cables: CableRoute[];
  inventory: InventoryLine[];
  milestones: { id: string; title: string; stepId: string }[];
  sourceMappings: { source: SourceReference; stepId?: string; operationId?: string }[];
  scenarios: SimulationScenario[];
  simulationObjects?: SimulationObject[];
  coverage: ModelCoverage;
};
export type CatalogEntry = {
  identity: ModelIdentity;
  modelUrl: string;
  previewUrl: string;
  coverage: ModelCoverage;
};

export type StepTime = { stepId: string; index: number; startMs: number; endMs: number };
export interface CompiledAssembly {
  readonly model: RobotModel;
  readonly partIds: readonly string[];
  /** Stable model.subassemblies array order, including roots later merged. */
  readonly subassemblyIds: readonly string[];
  /** External simulation props in model.simulationObjects array order, not BOM order. */
  readonly simulationObjectIds: readonly string[];
  readonly connectionIds: readonly string[];
  readonly internalNodes: readonly { partInstanceId: string; geometryNodeId: string }[];
  readonly durationMs: number;
  readonly stepTimes: readonly StepTime[];
}
export type AssemblyCounts = {
  robotInstalled: number;
  robotTotal: number;
  sampleInstalled: number;
  sampleTotal: number;
  fastenersInstalled: number;
  fastenersTotal: number;
  stepsComplete: number;
  stepsTotal: number;
};
export type AssemblyFrame = {
  readonly compiled: CompiledAssembly;
  timeMs: number;
  stepIndex: number;
  /** Per part: position3, normalized quaternion4, scale3. */
  readonly transforms: Float64Array;
  /** Per compiled subassembly: actual world position3, quaternion4, scale3. */
  readonly subassemblyTransforms: Float64Array;
  /** Per compiled internal node: parent-local position3, quaternion4, scale3. */
  readonly internalTransforms: Float64Array;
  /** External props: world position3, quaternion4, scale3; hidden during assembly. */
  readonly environmentTransforms: Float64Array;
  readonly environmentVisible: Uint8Array;
  readonly installed: Uint8Array;
  readonly active: Uint8Array;
  readonly visible: Uint8Array;
  readonly connected: Uint8Array;
  readonly counts: AssemblyCounts;
};
export type CompileAssembly = (model: RobotModel) => CompiledAssembly;
export type CreateFrame = (compiled: CompiledAssembly) => AssemblyFrame;
export type SampleAssembly = (compiled: CompiledAssembly, timeMs: number, out: AssemblyFrame) => AssemblyFrame;
export type GetStepAtTime = (compiled: CompiledAssembly, timeMs: number) => StepTime | null;
export type GetStepTime = (compiled: CompiledAssembly, stepId: string) => StepTime;

/** Geometry is opaque here: the Three.js loader chooses its concrete handle. */
export interface GeometryHandle {
  readonly assetId: string;
}
export interface GeometryCache {
  acquire(asset: GeometryAsset): Promise<GeometryHandle>;
  release(handle: GeometryHandle): void;
  dispose(): void;
}
export type ViewOptions = {
  mode: 'studio' | 'technical' | 'inspection';
  explodedFactor: number;
  labels: boolean;
  showJoints: boolean;
  showConnections: boolean;
  isolatedPartIds: readonly string[];
};
export interface RendererController {
  loadModel(model: RobotModel): Promise<void>;
  update(frame: AssemblyFrame): void;
  select(partInstanceId: string | null): void;
  setView(options: ViewOptions): void;
  fit(target: 'all' | 'active' | { subassemblyId: string }): void;
  resetCamera(): void;
  setAutoCamera(enabled: boolean): void;
  dispose(): void;
}
export type RendererCallbacks = {
  onSelect: (partInstanceId: string | null) => void;
  onCameraOverride: () => void;
  onError: (error: Error) => void;
};
export type SimulationFrame = {
  readonly compiled: CompiledSimulation;
  readonly assembly: AssemblyFrame;
  timeMs: number;
  readonly jointValues: Float64Array;
  readonly sensorValues: (string | number | boolean | null)[];
};
export type CompiledSimulation = {
  readonly assembly: CompiledAssembly;
  readonly scenario: SimulationScenario;
  readonly jointIds: readonly string[];
  readonly sensorPartIds: readonly string[];
};
export type CompileSimulation = (assembly: CompiledAssembly, scenario: SimulationScenario) => CompiledSimulation;
export type CreateSimulationFrame = (compiled: CompiledSimulation) => SimulationFrame;
export type SampleSimulation = (compiled: CompiledSimulation, timeMs: number, out: SimulationFrame) => SimulationFrame;
