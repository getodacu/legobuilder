import {
  ACESFilmicToneMapping, Box3, BufferAttribute, BufferGeometry, Color, DirectionalLight, DynamicDrawUsage,
  EdgesGeometry, GridHelper, Group, HemisphereLight, InstancedMesh, LineBasicMaterial,
  LineSegments, Matrix4, Mesh, OrthographicCamera, PCFShadowMap, PerspectiveCamera,
  PlaneGeometry, PMREMGenerator, Quaternion, Raycaster, Scene, ShadowMaterial, Sphere,
  SRGBColorSpace, Vector2, Vector3, WebGLRenderer, type WebGLRenderTarget
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GeometryLibrary, type ThreeGeometryHandle, type ThreeGeometryPrimitive } from '../geometry/cache';
import type { AssemblyFrame, CameraPreset, RendererCallbacks, RendererController, RobotModel, ViewOptions } from '../types/model';
import { SceneMaterials } from './materials';
import { MechanicalOverlays, transformMatrix } from './overlays';
import { FlexibleCables } from './cables';
import { learnerPartNames } from '../components/learner-parts';
import { groupParts } from '../components/part-groups';
import { fitStepCamera, stepCameraPoints, stepSubjects } from './step-camera';

type CameraType = PerspectiveCamera | OrthographicCamera;
type Batch = { object: InstancedMesh; primitive: ThreeGeometryPrimitive; indices: number[]; materialId: string };
type PartLine = { object: LineSegments; primitive: ThreeGeometryPrimitive; index: number };
type Outline = { object: LineSegments; primitive: ThreeGeometryPrimitive; index: number };
type Label = { element: HTMLDivElement; leader: HTMLDivElement; index: number; full: string; short: string };
type CameraFlight = { start: number; duration: number; fromPosition: Vector3; fromTarget: Vector3; fromUp: Vector3; toPosition: Vector3; toTarget: Vector3; toUp: Vector3 };
const INITIAL_VIEW: ViewOptions = { mode: 'studio', explodedFactor: 0, labels: false, showJoints: false, showConnections: false, isolatedPartIds: [] };

/** The workspace owns time. This class consumes explicit snapshots, never animates robot poses. */
export class SceneController implements RendererController {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly root = new Group();
  private readonly ground: Mesh<PlaneGeometry, ShadowMaterial>;
  private readonly light = new DirectionalLight('#fff8ef', 3.2);
  private readonly rimLight = new DirectionalLight('#d2e5ff', 2);
  private readonly grid: GridHelper;
  private readonly environment: WebGLRenderTarget;
  private readonly labelLayer: HTMLDivElement;
  private readonly observer: ResizeObserver;
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private camera: CameraType = new PerspectiveCamera(36, 1, 0.1, 100000);
  private controls: OrbitControls;
  private model: RobotModel | null = null;
  private frame: AssemblyFrame | null = null;
  private guidedStepIndex?: number;
  private guidedCamera: 'step' | 'whole' | 'manual' = 'step';
  private showGuideTray = false;
  private guidedSubjects = new Set<string>();
  private guidedPoints: Vector3[] | null = null;
  private viewArea?: HTMLElement;
  private aperture = { left: 0, top: 0, width: 1, height: 1 };
  private handles: ThreeGeometryHandle[] = [];
  private materials: SceneMaterials | null = null;
  private overlays: MechanicalOverlays | null = null;
  private cables: FlexibleCables | null = null;
  private batches: Batch[] = [];
  private lines: PartLine[] = [];
  private propBatches: Batch[] = [];
  private propLines: PartLine[] = [];
  private propMatrices: Matrix4[] = [];
  private propIncluded = new Uint8Array(0);
  private courseRootY: number | null = null;
  private environmentVisible = false;
  private lastFrameTimeMs: number | null = null;
  private outlines: Outline[] = [];
  private labels: Label[] = [];
  private readonly edgeGeometries = new Map<BufferGeometry, EdgesGeometry>();
  private readonly selectedMaterial = new LineBasicMaterial({ color: '#65dfcf', depthTest: false, transparent: true, opacity: 1 });
  private readonly activeMaterial = new LineBasicMaterial({ color: '#ff936f', depthTest: false, transparent: true, opacity: 0.9 });
  private matrices: Matrix4[] = [];
  private explodeVectors: Vector3[] = [];
  private internalIndices = new Map<string, number>();
  private internalAuthored = new Map<string, { inverse: Matrix4; nodeIds: string[] }>();
  private internalBindings = new Map<string, { inverse: Matrix4; indices: number[] }>();
  private included = new Uint8Array(0);
  private partIndices = new Map<string, number>();
  private selected: string | null = null;
  private view: ViewOptions = INITIAL_VIEW;
  private autoCamera = true;
  private lastPreset: CameraPreset | undefined;
  private cameraSteps: { startMs: number; preset?: CameraPreset; operations: { at: number; preset: CameraPreset }[] }[] = [];
  private flight: CameraFlight | null = null;
  private generation = 0;
  private disposed = false;
  private raf = 0;
  private dirty = true;
  private width = 1;
  private height = 1;
  private readonly maxRatio = Math.min(window.devicePixelRatio || 1, 1.75);
  private ratio = this.maxRatio;
  private slowFrames = 0;
  private fastFrames = 0;
  private readonly raycaster = new Raycaster();
  private readonly pointer = new Vector2();
  private readonly pointerDown = new Vector2();
  private readonly scratchMatrix = new Matrix4();
  private readonly internalMatrix = new Matrix4();
  private readonly nodeMatrix = new Matrix4();
  private readonly position = new Vector3();
  private readonly quaternion = new Quaternion();
  private readonly scale = new Vector3();
  private readonly center = new Vector3();
  private readonly projected = new Vector3();
  private readonly bounds = new Box3();
  private readonly partBounds = new Box3();
  private readonly sphere = new Sphere();
  private readonly hidden = new Matrix4().makeScale(0, 0, 0);
  private readonly handleById = new Map<string, ThreeGeometryHandle>();

  constructor(private readonly host: HTMLElement, private readonly cache: GeometryLibrary, private readonly callbacks: RendererCallbacks) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', { alpha: false, antialias: true, powerPreference: 'high-performance' });
    if (!context) throw new Error('WebGL2 is unavailable. Enable hardware acceleration or use a WebGL2-capable browser; sources and inventory remain available.');
    this.renderer = new WebGLRenderer({ canvas, context, antialias: true, alpha: false });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;
    this.renderer.setPixelRatio(this.ratio);
    this.scene.background = new Color('#a9bad1');
    const room = new RoomEnvironment();
    const pmrem = new PMREMGenerator(this.renderer);
    this.environment = pmrem.fromScene(room, 0.04);
    this.scene.environment = this.environment.texture;
    this.scene.environmentIntensity = 0.75;
    room.dispose(); pmrem.dispose();
    this.scene.add(new HemisphereLight('#e9f2ff', '#65758a', 1.7));
    this.light.position.set(-160, 300, 180);
    this.light.castShadow = true;
    this.light.shadow.mapSize.set(1024, 1024);
    this.light.shadow.normalBias = 0.12;
    this.light.shadow.bias = -0.0001;
    this.light.shadow.radius = 4;
    this.scene.add(this.light, this.light.target, this.rimLight, this.rimLight.target, this.root);
    this.ground = new Mesh(new PlaneGeometry(1, 1), new ShadowMaterial({ color: '#050a10', opacity: 0.32 }));
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
    this.grid = new GridHelper(1000, 100, '#788ba0', '#46586b');
    this.grid.visible = false;
    this.scene.add(this.grid);
    canvas.tabIndex = 0;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Interactive assembly. Arrow keys orbit; Shift and arrow keys pan; plus and minus zoom; R resets; F focuses the step or active parts. Part selection is also available in inventory.');
    canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline-offset:-4px;';
    this.labelLayer = document.createElement('div');
    this.labelLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;';
    this.labelLayer.setAttribute('aria-hidden', 'true');
    host.append(canvas, this.labelLayer);
    this.camera.position.set(160, 130, 200);
    this.controls = this.createControls();
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('keydown', this.onKeyDown);
    canvas.addEventListener('wheel', this.onManual, { passive: true });
    canvas.addEventListener('webglcontextlost', this.onContextLost);
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(host);
    this.resize();
    this.raf = requestAnimationFrame(this.render);
  }

  private createControls(): OrbitControls {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = !this.reducedMotion.matches;
    controls.dampingFactor = 0.12;
    controls.minDistance = 2;
    controls.maxDistance = 20000;
    controls.minZoom = 0.05;
    controls.maxZoom = 100;
    controls.addEventListener('start', this.onControlStart);
    controls.addEventListener('end', this.onControlEnd);
    controls.addEventListener('change', this.onControlsChange);
    return controls;
  }

  private manipulating = false;
  private onControlStart = (): void => { this.manipulating = true; };
  private onControlEnd = (): void => { this.manipulating = false; };
  private onControlsChange = (): void => {
    if (this.manipulating) this.onManual();
    this.dirty = true;
  };
  private onManual = (): void => {
    this.flight = null;
    if (this.guidedStepIndex !== undefined) this.guidedCamera = 'manual';
    else if (this.autoCamera) { this.autoCamera = false; this.callbacks.onCameraOverride(); }
    this.dirty = true;
  };
  private onContextLost = (event: Event): void => {
    event.preventDefault();
    this.callbacks.onError(new Error('The WebGL2 context was lost. Reload the workbench to restore the geometry.'));
  };
  private onPointerDown = (event: PointerEvent): void => { this.pointerDown.set(event.clientX, event.clientY); };
  private onPointerUp = (event: PointerEvent): void => {
    if (event.button !== 0 || this.pointerDown.distanceToSquared(this.pointer.set(event.clientX, event.clientY)) > 25 || !this.frame) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersections = this.raycaster.intersectObjects(this.batches.map((batch) => batch.object), false);
    for (const hit of intersections) {
      if (hit.instanceId === undefined) continue;
      const indices = hit.object.userData.partIndices as number[];
      const index = indices[hit.instanceId];
      if (this.included[index]) { this.callbacks.onSelect(this.model!.parts[index].id); return; }
    }
    this.callbacks.onSelect(null);
  };
  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.target !== this.renderer.domElement || event.altKey || event.ctrlKey || event.metaKey) return;
    const key = event.key.toLowerCase();
    if (!['arrowleft', 'arrowright', 'arrowup', 'arrowdown', '+', '=', '-', '_', 'r', 'f'].includes(key)) return;
    event.preventDefault(); event.stopPropagation();
    if (key === 'r') { this.resetCamera(); return; }
    if (key === 'f') { this.fit(this.guidedStepIndex === undefined ? 'active' : 'step'); return; }
    if (key === '+' || key === '=') this.nudgeCamera('in');
    else if (key === '-' || key === '_') this.nudgeCamera('out');
    else if (event.shiftKey) {
      this.onManual();
      this.controls.pan(key === 'arrowleft' ? 24 : key === 'arrowright' ? -24 : 0, key === 'arrowup' ? 24 : key === 'arrowdown' ? -24 : 0);
    } else if (key === 'arrowleft' || key === 'arrowright') this.nudgeCamera(key === 'arrowleft' ? 'left' : 'right');
    else { this.onManual(); this.controls.rotateUp(key === 'arrowup' ? 0.12 : -0.12); }
  };

  private nudgeCamera(action: 'left' | 'right' | 'in' | 'out'): void {
    this.onManual();
    if (action === 'in') this.controls.dollyIn(0.86);
    else if (action === 'out') this.controls.dollyOut(0.86);
    else this.controls.rotateLeft(action === 'left' ? 0.12 : -0.12);
  }

  unloadModel(): void {
    this.generation++;
    this.clearModel();
  }

  async loadModel(model: RobotModel): Promise<void> {
    if (this.disposed) throw new Error('Cannot load geometry into a disposed viewer.');
    const generation = ++this.generation;
    this.clearModel();
    const acquired: ThreeGeometryHandle[] = [];
    let adopted = false;
    try {
      const props = model.simulationObjects ?? [];
      const usedIds = new Set([...model.parts, ...props].map((part) => part.geometryId));
      const assets = model.geometryAssets.filter((asset) => usedIds.has(asset.id));
      if (assets.length !== usedIds.size) throw new Error(`Model ${model.id} is missing a declared geometry asset.`);
      const results = await Promise.allSettled(assets.map(async (asset) => {
        const handle = await this.cache.acquire(asset);
        if (this.disposed || generation !== this.generation) { this.cache.release(handle); return null; }
        acquired.push(handle);
        return handle;
      }));
      const rejection = results.find((result) => result.status === 'rejected');
      if (rejection?.status === 'rejected') throw rejection.reason;
      if (this.disposed || generation !== this.generation) { for (const handle of acquired) this.cache.release(handle); return; }
      this.handles = acquired;
      adopted = true;
      this.model = model;
      this.materials = new SceneMaterials(model.materials);
      this.partIndices = new Map(model.parts.map((part, index) => [part.id, index]));
      this.matrices = model.parts.map(() => new Matrix4());
      this.included = new Uint8Array(model.parts.length);
      for (const handle of acquired) this.handleById.set(handle.assetId, handle);
      const groups = new Map<string, Batch>();
      const unknownParts = model.parts.filter((part) => !Object.hasOwn(learnerPartNames, part.geometryId));
      const unknownNames = new Map(unknownParts.length ? groupParts(unknownParts, model.geometryAssets)
        .flatMap((group) => group.parts.map((part) => [part.id, group.name] as const)) : []);
      for (let index = 0; index < model.parts.length; index++) {
        const part = model.parts[index];
        const handle = this.handleById.get(part.geometryId)!;
        if (!handle.primitives.some((primitive) => primitive.kind === 'mesh')) throw new Error(`Geometry ${part.geometryId} has no renderable mesh.`);
        for (let primitiveIndex = 0; primitiveIndex < handle.primitives.length; primitiveIndex++) {
          const primitive = handle.primitives[primitiveIndex];
          if (primitive.kind === 'mesh') {
            const key = `${part.geometryId}:${primitiveIndex}:${primitive.inheritColor ? part.materialId : 'fixed'}`;
            let batch = groups.get(key);
            if (!batch) {
              const compatible = model.parts.filter((entry) => entry.geometryId === part.geometryId && (!primitive.inheritColor || entry.materialId === part.materialId)).length;
              const object = new InstancedMesh(primitive.geometry, this.materials.resolve(primitive.material, primitive.inheritColor, part.materialId, this.view.mode, false), compatible);
              object.instanceMatrix.setUsage(DynamicDrawUsage);
              object.castShadow = true; object.receiveShadow = true;
              object.frustumCulled = false;
              batch = { object, primitive, indices: [], materialId: part.materialId };
              groups.set(key, batch); this.root.add(object);
            }
            batch.indices.push(index);
            let edges = this.edgeGeometries.get(primitive.geometry);
            if (!edges) {
              const source = primitive.geometry;
              const view = new BufferGeometry();
              view.setAttribute('position', source.getAttribute('position'));
              const start = source.drawRange.start;
              const count = Math.min(source.drawRange.count, (source.index?.count ?? source.getAttribute('position').count) - start);
              if (source.index) {
                view.setIndex(new BufferAttribute(source.index.array.subarray(start, start + count), 1));
              } else {
                const indices = new Uint32Array(count);
                for (let vertex = 0; vertex < count; vertex++) indices[vertex] = start + vertex;
                view.setIndex(new BufferAttribute(indices, 1));
              }
              edges = new EdgesGeometry(view, 24);
              // Temporary CPU view shares cache attributes; do not dispose shared GPU attributes.
              this.edgeGeometries.set(source, edges);
            }
            const outline = new LineSegments(edges, this.activeMaterial);
            outline.matrixAutoUpdate = false; outline.visible = false; outline.renderOrder = 5;
            this.root.add(outline); this.outlines.push({ object: outline, primitive, index });
          } else {
            const object = new LineSegments(primitive.geometry, this.materials.resolve(primitive.material, primitive.inheritColor, part.materialId, this.view.mode, true));
            object.matrixAutoUpdate = false;
            object.frustumCulled = false;
            this.root.add(object); this.lines.push({ object, primitive, index });
          }
        }
        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;left:0;top:0;display:none;max-width:220px;padding:4px 7px 4px 14px;border-left:2px solid var(--teal);border-radius:2px;background:var(--panel);color:var(--ink);font:11px/1.4 ui-monospace,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 1px 3px #00000066;';
        const leader = document.createElement('div');
        leader.style.cssText = 'position:absolute;left:0;top:0;display:none;width:12px;height:1px;background:var(--teal);';
        this.labelLayer.append(leader, label);
        this.labels.push({ element: label, leader, index, full: `${part.name} · ${part.id}`,
          short: unknownNames.get(part.id) ?? learnerPartNames[part.geometryId] });
      }
      this.batches = [...groups.values()];
      for (const batch of this.batches) { batch.object.userData.partIndices = batch.indices; batch.object.visible = false; }
      this.propMatrices = props.map(() => new Matrix4());
      this.propIncluded = new Uint8Array(props.length);
      const propGroups = new Map<string, Batch>();
      for (let index = 0; index < props.length; index++) {
        const prop = props[index];
        const handle = this.handleById.get(prop.geometryId)!;
        if (!handle.primitives.some((primitive) => primitive.kind === 'mesh')) throw new Error(`Geometry ${prop.geometryId} has no renderable mesh.`);
        transformMatrix(prop.initialTransform, this.propMatrices[index]);
        this.partBounds.copy(handle.bounds).applyMatrix4(this.propMatrices[index]);
        this.courseRootY = Math.min(this.courseRootY ?? Infinity, this.partBounds.min.y);
        for (let primitiveIndex = 0; primitiveIndex < handle.primitives.length; primitiveIndex++) {
          const primitive = handle.primitives[primitiveIndex];
          if (primitive.kind === 'mesh') {
            const key = `${prop.geometryId}:${primitiveIndex}:${primitive.inheritColor ? prop.materialId : 'fixed'}`;
            let batch = propGroups.get(key);
            if (!batch) {
              const compatible = props.filter((entry) => entry.geometryId === prop.geometryId && (!primitive.inheritColor || entry.materialId === prop.materialId)).length;
              const object = new InstancedMesh(primitive.geometry, this.materials.resolve(primitive.material, primitive.inheritColor, prop.materialId, this.view.mode, false), compatible);
              object.name = `simulation:${key}`;
              object.instanceMatrix.setUsage(DynamicDrawUsage);
              object.castShadow = true; object.receiveShadow = true;
              object.frustumCulled = false; object.visible = false;
              batch = { object, primitive, indices: [], materialId: prop.materialId };
              propGroups.set(key, batch); this.propBatches.push(batch); this.root.add(object);
            }
            batch.indices.push(index);
          } else {
            const object = new LineSegments(primitive.geometry, this.materials.resolve(primitive.material, primitive.inheritColor, prop.materialId, this.view.mode, true));
            object.name = `simulation:${prop.id}`;
            object.matrixAutoUpdate = false; object.frustumCulled = false; object.visible = false;
            this.root.add(object); this.propLines.push({ object, primitive, index });
          }
        }
      }
      for (const batch of this.propBatches) batch.object.userData.simulationObjectIds = batch.indices.map((index) => props[index].id);
      for (const handle of acquired) {
        const asset = model.geometryAssets.find((entry) => entry.id === handle.assetId)!;
        const nodes = asset.internalNodes ?? [];
        const binding = (id: string): { world: Matrix4; nodeIds: string[] } => {
          const node = nodes.find((entry) => entry.id === id);
          if (!node) throw new Error(`Missing internal geometry node ${asset.id}:${id}`);
          const local = transformMatrix(node.localTransform);
          if (!node.parentId) return { world: local, nodeIds: [id] };
          const parent = binding(node.parentId);
          return { world: parent.world.multiply(local), nodeIds: [...parent.nodeIds, id] };
        };
        for (const node of nodes) {
          const authored = binding(node.id);
          this.internalAuthored.set(`${asset.id}:${node.id}`, { inverse: authored.world.invert(), nodeIds: authored.nodeIds });
        }
      }
      this.explodeVectors = this.createExplodeVectors(model);
      this.overlays = new MechanicalOverlays(model); this.root.add(this.overlays.root);
      this.cables = new FlexibleCables(model); this.root.add(this.cables.root);
      this.selected = null; this.lastPreset = undefined; this.flight = null;
      this.dirty = true;
    } catch (cause) {
      if (adopted) {
        if (generation === this.generation) this.clearModel();
      } else {
        for (const handle of acquired) this.cache.release(handle);
      }
      throw cause instanceof Error ? cause : new Error(String(cause));
    }
  }

  private createExplodeVectors(model: RobotModel): Vector3[] {
    const assemblyCenter = new Vector3();
    for (const part of model.parts) assemblyCenter.add(new Vector3().fromArray(part.finalTransform.position));
    assemblyCenter.divideScalar(Math.max(1, model.parts.length));
    const vectors = model.parts.map((part) => {
      const radial = new Vector3().fromArray(part.finalTransform.position).sub(assemblyCenter);
      const connection = model.connections.find((entry) => entry.a.partInstanceId === part.id || entry.b.partInstanceId === part.id);
      const endpoint = connection?.a.partInstanceId === part.id ? connection.a : connection?.b;
      const point = part.connectionPoints.find((entry) => entry.id === endpoint?.connectionPointId);
      const direction = point
        ? new Vector3(0, 1, 0).applyQuaternion(new Quaternion().fromArray(point.localTransform.quaternion)).applyQuaternion(new Quaternion().fromArray(part.finalTransform.quaternion))
        : radial.clone();
      if (direction.lengthSq() < 0.0001) direction.set(0, 1, 0);
      if (direction.dot(radial) < 0) direction.negate();
      const bounds = this.handleById.get(part.geometryId)!.bounds;
      return direction.normalize().multiplyScalar(Math.max(14, Math.min(70, bounds.getSize(new Vector3()).length() * 0.65)));
    });
    // A connected child follows its mounting parent's separation, then its own.
    const adjacency = model.parts.map(() => [] as number[]);
    for (const connection of model.connections) {
      const a = this.partIndices.get(connection.a.partInstanceId)!;
      const b = this.partIndices.get(connection.b.partInstanceId)!;
      adjacency[a].push(b); adjacency[b].push(a);
    }
    const ranked = model.parts.map((part, index) => ({ index, size: this.handleById.get(part.geometryId)!.bounds.getSize(new Vector3()).length() })).sort((a, b) => b.size - a.size);
    const visited = new Uint8Array(model.parts.length);
    for (const { index: root } of ranked) {
      if (visited[root]) continue;
      visited[root] = 1;
      if (adjacency[root].length) vectors[root].set(0, 0, 0);
      const queue = [root];
      for (let cursor = 0; cursor < queue.length; cursor++) {
        const parent = queue[cursor];
        for (const child of adjacency[parent]) {
          if (visited[child]) continue;
          visited[child] = 1;
          // ponytail: cap inherited separation to 160 mm; author subassembly lanes if a denser build needs collision-free exploded paths.
          vectors[child].add(vectors[parent]).clampLength(0, 160);
        }
      }
    }
    return vectors;
  }

  update(frame: AssemblyFrame, guidedStepIndex?: number): void {
    if (!this.model || this.disposed) return;
    if (frame.compiled.model !== this.model) throw new Error('The assembly frame belongs to a different model.');
    const first = !this.frame;
    const guideChanged = first || this.guidedStepIndex !== guidedStepIndex;
    const returningToStart = frame.timeMs === 0 && this.lastFrameTimeMs !== 0;
    if (first || this.frame?.compiled !== frame.compiled) {
      this.cameraSteps = frame.compiled.stepTimes.map((stepTime) => ({
        startMs: stepTime.startMs,
        preset: this.model!.steps[stepTime.index].cameraPreset,
        operations: this.model!.operations
          .filter((operation) => operation.stepId === stepTime.stepId && operation.cameraPreset)
          .map((operation) => ({ at: operation.startMs, preset: operation.cameraPreset! }))
          .sort((a, b) => a.at - b.at)
      }));
      this.internalIndices.clear();
      frame.compiled.internalNodes.forEach((node, index) => this.internalIndices.set(`${node.partInstanceId}:${node.geometryNodeId}`, index));
      this.internalBindings.clear();
      for (const part of this.model.parts) {
        const asset = this.model.geometryAssets.find((entry) => entry.id === part.geometryId)!;
        for (const node of asset.internalNodes ?? []) {
          const authored = this.internalAuthored.get(`${asset.id}:${node.id}`)!;
          const indices = authored.nodeIds.map((id) => {
            const index = this.internalIndices.get(`${part.id}:${id}`);
            if (index === undefined) throw new Error(`Frame is missing internal node ${part.id}:${id}`);
            return index;
          });
          this.internalBindings.set(`${part.id}:${node.id}`, { inverse: authored.inverse, indices });
        }
      }
    }
    const wasEnvironmentVisible = this.environmentVisible;
    this.frame = frame;
    this.guidedStepIndex = guidedStepIndex;
    if (guideChanged) {
      this.guidedSubjects = guidedStepIndex === undefined ? new Set() : stepSubjects(this.model, guidedStepIndex);
      this.guidedPoints = null;
      this.showGuideTray = false;
      this.guidedCamera = 'step';
      this.lastPreset = undefined;
    }
    this.lastFrameTimeMs = frame.timeMs;
    this.environmentVisible = frame.environmentVisible.includes(1);
    if (this.environmentVisible && !wasEnvironmentVisible) this.flight = null;
    this.applyFrame();
    if (guidedStepIndex !== undefined) {
      if (guideChanged) this.frameStep(!first);
      return;
    }
    if (first) this.fitBounds(frame.timeMs === 0 ? 'active' : 'all', false);
    if (!first && returningToStart && this.autoCamera && !this.environmentVisible) this.fitBounds('active', false);
    const preset = this.currentPreset();
    if (preset !== this.lastPreset) {
      this.lastPreset = preset;
      if (preset && this.autoCamera) this.applyPreset(preset, !first);
    }
    this.dirty = true;
  }

  private applyFrame(): void {
    const frame = this.frame;
    if (!frame || !this.model) return;
    for (let index = 0; index < this.model.parts.length; index++) {
      const offset = index * 10;
      this.position.fromArray(frame.transforms, offset);
      if (frame.visible[index]) this.position.addScaledVector(this.explodeVectors[index], this.view.explodedFactor);
      this.quaternion.fromArray(frame.transforms, offset + 3);
      this.scale.fromArray(frame.transforms, offset + 7);
      this.matrices[index].compose(this.position, this.quaternion, this.scale);
      const id = this.model.parts[index].id;
      const showInGuide = this.guidedStepIndex === undefined || this.showGuideTray || frame.installed[index] || this.guidedSubjects.has(id) || this.selected === id;
      this.included[index] = frame.visible[index] && (this.view.isolatedPartIds.length ? this.view.isolatedPartIds.includes(id) : showInGuide) ? 1 : 0;
    }
    for (const batch of this.batches) {
      batch.object.visible = false;
      batch.indices.forEach((index, instance) => {
        if (this.included[index]) {
          batch.object.visible = true;
          batch.object.setMatrixAt(instance, this.primitiveMatrix(index, batch.primitive));
        }
        else batch.object.setMatrixAt(instance, this.hidden);
      });
      batch.object.instanceMatrix.needsUpdate = true;
    }
    for (const line of this.lines) {
      line.object.visible = Boolean(this.included[line.index]) && this.view.mode !== 'studio';
      if (line.object.visible) { line.object.matrix.copy(this.primitiveMatrix(line.index, line.primitive)); line.object.matrixWorldNeedsUpdate = true; }
    }
    for (let index = 0; index < this.propMatrices.length; index++) {
      const offset = index * 10;
      this.position.fromArray(frame.environmentTransforms, offset);
      this.quaternion.fromArray(frame.environmentTransforms, offset + 3);
      this.scale.fromArray(frame.environmentTransforms, offset + 7);
      this.propMatrices[index].compose(this.position, this.quaternion, this.scale);
      this.propIncluded[index] = frame.environmentVisible[index] && !this.view.isolatedPartIds.length && this.scale.x !== 0 && this.scale.y !== 0 && this.scale.z !== 0 ? 1 : 0;
    }
    for (const batch of this.propBatches) {
      batch.object.visible = false;
      for (let instance = 0; instance < batch.indices.length; instance++) {
        const index = batch.indices[instance];
        if (this.propIncluded[index]) {
          batch.object.setMatrixAt(instance, this.scratchMatrix.copy(this.propMatrices[index]).multiply(batch.primitive.matrix));
          batch.object.visible = true;
        } else batch.object.setMatrixAt(instance, this.hidden);
      }
      batch.object.instanceMatrix.needsUpdate = true;
    }
    for (const line of this.propLines) {
      line.object.visible = Boolean(this.propIncluded[line.index]) && this.view.mode !== 'studio';
      if (line.object.visible) {
        line.object.matrix.copy(this.propMatrices[line.index]).multiply(line.primitive.matrix);
        line.object.matrixWorldNeedsUpdate = true;
      }
    }
    for (const outline of this.outlines) {
      const selected = this.model.parts[outline.index].id === this.selected;
      outline.object.visible = this.guidedStepIndex === undefined && Boolean(this.included[outline.index]) && (selected || Boolean(frame.active[outline.index]));
      if (outline.object.visible) {
        outline.object.material = selected ? this.selectedMaterial : this.activeMaterial;
        outline.object.matrix.copy(this.primitiveMatrix(outline.index, outline.primitive));
        outline.object.matrixWorldNeedsUpdate = true;
      }
    }
    this.overlays?.update(this.matrices, frame, this.view, this.included);
    this.cables?.update(this.matrices, frame, this.view, this.included);
    this.configureStudio();
    this.dirty = true;
  }

  private primitiveMatrix(index: number, primitive: ThreeGeometryPrimitive): Matrix4 {
    this.scratchMatrix.copy(this.matrices[index]);
    if (primitive.nodeId && this.frame && this.model) {
      const part = this.model.parts[index];
      const binding = this.internalBindings.get(`${part.id}:${primitive.nodeId}`);
      if (binding) {
        this.internalMatrix.identity();
        for (const internalIndex of binding.indices) {
          const offset = internalIndex * 10;
          this.position.fromArray(this.frame.internalTransforms, offset);
          this.quaternion.fromArray(this.frame.internalTransforms, offset + 3);
          this.scale.fromArray(this.frame.internalTransforms, offset + 7);
          this.internalMatrix.multiply(this.nodeMatrix.compose(this.position, this.quaternion, this.scale));
        }
        this.scratchMatrix.multiply(this.internalMatrix.multiply(binding.inverse));
      }
    }
    return this.scratchMatrix.multiply(primitive.matrix);
  }

  select(id: string | null): void {
    if (id !== null && !this.partIndices.has(id)) throw new Error(`Unknown part instance: ${id}`);
    this.selected = id; this.applyFrame();
  }

  setView(options: ViewOptions): void {
    if (!Number.isFinite(options.explodedFactor) || options.explodedFactor < 0 || options.explodedFactor > 1) throw new Error('Exploded view strength must be between 0 and 1.');
    for (const id of options.isolatedPartIds) if (this.model && !this.partIndices.has(id)) throw new Error(`Unknown isolated instance: ${id}`);
    const changedMode = this.view.mode !== options.mode;
    const changedExplode = this.view.explodedFactor !== options.explodedFactor;
    this.view = { ...options, isolatedPartIds: [...options.isolatedPartIds] };
    this.grid.visible = options.mode === 'technical';
    if (changedMode && this.materials && this.model) {
      for (const batch of this.batches) batch.object.material = this.materials.resolve(batch.primitive.material, batch.primitive.inheritColor, batch.materialId, options.mode, false);
      for (const line of this.lines) line.object.material = this.materials.resolve(line.primitive.material, line.primitive.inheritColor, this.model.parts[line.index].materialId, options.mode, true);
      for (const batch of this.propBatches) batch.object.material = this.materials.resolve(batch.primitive.material, batch.primitive.inheritColor, batch.materialId, options.mode, false);
      for (const line of this.propLines) line.object.material = this.materials.resolve(line.primitive.material, line.primitive.inheritColor, this.model.simulationObjects![line.index].materialId, options.mode, true);
    }
    this.applyFrame();
    if (changedExplode && this.autoCamera && !this.environmentVisible) {
      if (options.explodedFactor) this.fitBounds('all', true);
      else {
        const preset = this.currentPreset();
        if (preset) this.applyPreset(preset, true);
        else this.fitBounds('all', true);
      }
    }
    this.dirty = true;
  }

  fit(target: 'all' | 'active' | 'step' | { subassemblyId: string }): void {
    if (target === 'step') {
      if (this.guidedStepIndex === undefined) return;
      this.guidedCamera = 'step';
      this.showGuideTray = false;
      this.applyFrame();
      this.frameStep(true);
      return;
    }
    this.onManual();
    const showTray = target === 'all' && this.guidedStepIndex !== undefined;
    if (showTray) {
      this.guidedCamera = 'whole';
      this.showGuideTray = true;
      this.applyFrame();
    }
    this.fitBounds(target, showTray, target === 'all');
  }

  private frameStep(animate: boolean): void {
    if (!this.frame || this.guidedStepIndex === undefined) return;
    const step = this.cameraSteps[this.guidedStepIndex];
    const preset = step.preset ?? step.operations[0]?.preset;
    const direction = preset ? new Vector3().fromArray(preset.position).sub(new Vector3().fromArray(preset.target)) : new Vector3(160, 130, 200);
    const up = preset ? new Vector3().fromArray(preset.up) : new Vector3(0, 1, 0);
    if (direction.lengthSq() === 0) direction.set(160, 130, 200);
    direction.normalize();
    this.guidedPoints ??= stepCameraPoints(this.frame, this.guidedStepIndex, this.guidedSubjects, (id) => this.handleById.get(id)!.bounds);
    if (!this.guidedPoints.length) { this.fitBounds('all', animate); return; }
    this.setProjection(preset?.projection === 'orthographic');
    this.camera.zoom = 1;
    const slope = Math.tan((this.camera instanceof PerspectiveCamera ? preset?.framing ?? 36 : 36) * Math.PI / 360);
    const { width, height } = this.aperture;
    const framingMargin = 0.86;
    const { target, distance, halfSize } = fitStepCamera(this.guidedPoints, direction, up, slope * width / this.height * framingMargin, slope * height / this.height * framingMargin);
    if (this.camera instanceof PerspectiveCamera) this.camera.fov = preset?.framing ?? 36;
    else {
      const halfHeight = Math.max(5, halfSize.y * this.height / height, halfSize.x * this.height / width) / framingMargin;
      this.camera.top = halfHeight; this.camera.bottom = -halfHeight;
      this.camera.right = halfHeight * this.width / this.height; this.camera.left = -this.camera.right;
    }
    this.camera.near = Math.max(0.05, distance / 10000);
    this.camera.far = Math.max(20000, distance * 20);
    this.camera.updateProjectionMatrix();
    this.moveCamera(direction.multiplyScalar(distance).add(target), target, up, animate ? 400 : 0);
  }

  private fitBounds(target: 'all' | 'active' | { subassemblyId: string }, animate: boolean, includeEnvironment = false): void {
    if (!this.model || !this.frame) return;
    let ids: Set<string> | null = null;
    if (typeof target === 'object') {
      ids = new Set<string>();
      const add = (id: string): void => {
        const sub = this.model!.subassemblies.find((entry) => entry.id === id);
        if (!sub) throw new Error(`Unknown subassembly: ${id}`);
        for (const partId of sub.partInstanceIds) ids!.add(partId);
        for (const child of sub.childSubassemblyIds) add(child);
      };
      add(target.subassemblyId);
    }
    this.bounds.makeEmpty();
    for (let index = 0; index < this.model.parts.length; index++) {
      if (!this.included[index]) continue;
      const part = this.model.parts[index];
      if (ids && !ids.has(part.id)) continue;
      if (target === 'active' && !(this.selected ? part.id === this.selected : this.frame.active[index])) continue;
      this.partBounds.copy(this.handleById.get(part.geometryId)!.bounds).applyMatrix4(this.matrices[index]);
      this.bounds.union(this.partBounds);
    }
    if (includeEnvironment) {
      for (let index = 0; index < this.propMatrices.length; index++) {
        if (!this.propIncluded[index]) continue;
        this.partBounds.copy(this.handleById.get(this.model.simulationObjects![index].geometryId)!.bounds).applyMatrix4(this.propMatrices[index]);
        this.bounds.union(this.partBounds);
      }
    }
    if (this.bounds.isEmpty()) return;
    this.bounds.getBoundingSphere(this.sphere);
    this.bounds.getCenter(this.center);
    const radius = Math.max(5, this.sphere.radius);
    const aspect = this.width / this.height;
    const apertureRatio = Math.min(this.aperture.width, this.aperture.height) / this.height;
    if (this.camera instanceof PerspectiveCamera) {
      this.camera.zoom = 1;
      const halfFov = Math.atan(Math.tan(this.camera.fov * Math.PI / 360) * apertureRatio);
      const distance = radius / Math.sin(halfFov) * 1.15;
      this.position.copy(this.camera.position).sub(this.controls.target).normalize();
      if (this.position.lengthSq() < 0.01) this.position.set(1, 0.8, 1.3).normalize();
      this.position.multiplyScalar(distance).add(this.center);
      this.camera.near = Math.max(0.05, distance / 10000); this.camera.far = Math.max(20000, distance * 20);
    } else {
      const halfHeight = radius * 1.15 / apertureRatio;
      this.camera.top = halfHeight; this.camera.bottom = -halfHeight;
      this.camera.right = halfHeight * aspect; this.camera.left = -this.camera.right; this.camera.zoom = 1;
      this.position.copy(this.camera.position).sub(this.controls.target).normalize();
      if (this.position.lengthSq() < 0.01) this.position.set(1, 0.8, 1.3).normalize();
      const distance = radius * 4;
      this.position.multiplyScalar(distance).add(this.center);
      this.camera.near = 0.05; this.camera.far = Math.max(20000, distance * 20);
    }
    this.camera.updateProjectionMatrix();
    this.moveCamera(this.position, this.center, new Vector3(0, 1, 0), animate ? 350 : 0);
  }

  resetCamera(): void {
    if (this.guidedStepIndex !== undefined) { this.fit('step'); return; }
    this.onManual();
    const preset = this.currentPreset();
    if (preset) { this.applyPreset(preset, false); return; }
    const assembled = this.frame && this.frame.timeMs > 0 ? this.cameraSteps.at(-1)?.preset : undefined;
    if (assembled) this.position.fromArray(assembled.position).sub(this.center.fromArray(assembled.target));
    else this.position.set(160, 130, 200);
    this.camera.position.copy(this.controls.target).add(this.position);
    this.camera.up.set(0, 1, 0);
    this.fitBounds(this.frame?.timeMs === 0 ? 'active' : 'all', false);
  }

  setAutoCamera(enabled: boolean): void {
    this.autoCamera = enabled;
    if (this.guidedStepIndex !== undefined) return;
    if (enabled) {
      const preset = this.currentPreset();
      if (preset) this.applyPreset(preset, true);
      else if (this.frame?.timeMs === 0) this.fitBounds('active', false);
    }
    else this.flight = null;
  }

  private currentPreset(): CameraPreset | undefined {
    if (!this.frame || this.frame.timeMs === 0 || this.environmentVisible) return undefined;
    const step = this.cameraSteps[this.frame.stepIndex];
    if (!step) return undefined;
    const elapsed = this.frame.timeMs - step.startMs;
    let preset = step.preset;
    for (const operation of step.operations) {
      if (operation.at > elapsed) break;
      preset = operation.preset;
    }
    return preset;
  }

  private setProjection(orthographic: boolean): void {
    if (orthographic !== (this.camera instanceof OrthographicCamera)) {
      const oldPosition = this.camera.position.clone();
      const oldUp = this.camera.up.clone();
      const target = this.controls.target.clone();
      this.controls.dispose();
      this.camera = orthographic ? new OrthographicCamera(-100, 100, 100, -100, 0.05, 100000) : new PerspectiveCamera(36, this.width / this.height, 0.05, 100000);
      this.camera.position.copy(oldPosition); this.camera.up.copy(oldUp);
      this.controls = this.createControls(); this.controls.target.copy(target);
      this.applyAperture();
    }
  }

  private applyPreset(preset: CameraPreset, animate: boolean): void {
    const orthographic = preset.projection === 'orthographic';
    if (!Number.isFinite(preset.framing) || preset.framing <= 0 || (!orthographic && preset.framing >= 180)) {
      throw new Error(orthographic
        ? `Invalid camera framing ${preset.framing}: orthographic framing must be a positive finite vertical span in millimetres. Correct the source camera preset.`
        : `Invalid camera framing ${preset.framing}: perspective framing must be a finite vertical field of view greater than 0 and less than 180 degrees. Correct the source camera preset.`);
    }
    this.setProjection(orthographic);
    const position = new Vector3().fromArray(preset.position);
    const target = new Vector3().fromArray(preset.target);
    if (this.camera instanceof OrthographicCamera) {
      const halfHeight = preset.framing / 2;
      this.camera.top = halfHeight; this.camera.bottom = -halfHeight;
      this.camera.right = halfHeight * this.width / this.height; this.camera.left = -this.camera.right; this.camera.zoom = 1;
    } else { this.camera.fov = preset.framing; this.camera.zoom = 1; }
    this.camera.updateProjectionMatrix();
    this.moveCamera(position, target, new Vector3().fromArray(preset.up), animate ? preset.transitionMs : 0);
  }

  private moveCamera(position: Vector3, target: Vector3, up: Vector3, duration: number): void {
    if (duration > 0 && !this.reducedMotion.matches) {
      this.flight = { start: performance.now(), duration, fromPosition: this.camera.position.clone(), fromTarget: this.controls.target.clone(), fromUp: this.camera.up.clone(), toPosition: position.clone(), toTarget: target.clone(), toUp: up.clone() };
    } else {
      this.flight = null; this.camera.position.copy(position); this.camera.up.copy(up); this.controls.target.copy(target); this.controls.update();
    }
    this.dirty = true;
  }

  private configureStudio(): void {
    if (!this.model) return;
    this.bounds.makeEmpty();
    for (let index = 0; index < this.model.parts.length; index++) {
      if (!this.included[index]) continue;
      this.bounds.union(this.partBounds.copy(this.handleById.get(this.model.parts[index].geometryId)!.bounds).applyMatrix4(this.matrices[index]));
    }
    for (let index = 0; index < this.propMatrices.length; index++) {
      if (!this.propIncluded[index]) continue;
      this.bounds.union(this.partBounds.copy(this.handleById.get(this.model.simulationObjects![index].geometryId)!.bounds).applyMatrix4(this.propMatrices[index]));
    }
    if (this.bounds.isEmpty()) return;
    const span = Math.max(100, this.bounds.getSize(this.scale).length());
    const center = this.bounds.getCenter(this.center);
    const floorY = this.environmentVisible && this.courseRootY !== null ? this.courseRootY : this.bounds.min.y - 0.25;
    this.ground.position.set(center.x, floorY, center.z);
    this.ground.scale.set(span * 8, span * 8, 1);
    this.grid.position.set(center.x, floorY + 0.05, center.z);
    this.light.position.copy(center).add(this.position.set(-span, span * 2, span));
    this.light.target.position.copy(center);
    this.rimLight.position.copy(center).add(this.position.set(span, span, -span));
    this.rimLight.target.position.copy(center);
    const camera = this.light.shadow.camera;
    camera.left = camera.bottom = -span; camera.right = camera.top = span;
    camera.near = 0.1; camera.far = span * 6; camera.updateProjectionMatrix();
  }

  setViewArea(area?: HTMLElement): void {
    if (this.viewArea === area) return;
    if (this.viewArea) this.observer.unobserve(this.viewArea);
    this.viewArea = area;
    if (area) this.observer.observe(area);
    this.resize();
  }

  private applyAperture(): void {
    const { left, top, width, height } = this.aperture;
    this.camera.setViewOffset(this.width, this.height, (this.width - width) / 2 - left, (this.height - height) / 2 - top, this.width, this.height);
  }

  private resize = (): void => {
    if (this.disposed) return;
    const host = this.host.getBoundingClientRect();
    const area = this.viewArea?.getBoundingClientRect();
    const width = Math.max(1, this.host.clientWidth), height = Math.max(1, this.host.clientHeight);
    const resized = this.width !== width || this.height !== height;
    this.width = width; this.height = height;
    if (resized) {
      this.renderer.setSize(width, height, false);
      if (this.camera instanceof OrthographicCamera) {
        this.camera.right = (this.camera.top - this.camera.bottom) / 2 * width / height;
        this.camera.left = -this.camera.right;
      }
    }
    const aperture = area && area.width > 0 && area.height > 0
      ? { left: area.left - host.left, top: area.top - host.top, width: area.width, height: area.height }
      : { left: 0, top: 0, width, height };
    const old = this.aperture;
    if (!resized && old.left === aperture.left && old.top === aperture.top && old.width === aperture.width && old.height === aperture.height) return;
    this.aperture = aperture;
    this.applyAperture();
    this.dirty = true;
    if (this.guidedStepIndex !== undefined) {
      if (this.guidedCamera === 'step') this.frameStep(Boolean(this.flight));
      else if (this.guidedCamera === 'whole') this.fitBounds('all', Boolean(this.flight));
    } else if (this.autoCamera && this.frame?.timeMs === 0) this.fitBounds('all', false);
  };

  private updateLabels(): void {
    if (!this.model || !this.frame) return;
    let shown = 0;
    for (const label of this.labels) {
      const index = label.index;
      const selected = this.model.parts[index].id === this.selected;
      const show = Boolean(this.included[index]) && (selected || this.guidedStepIndex === undefined && (this.view.labels || this.view.mode === 'inspection') && (this.frame.active[index] || shown < 12));
      if (!show) { label.element.style.display = label.leader.style.display = 'none'; continue; }
      const handle = this.handleById.get(this.model.parts[index].geometryId)!;
      handle.bounds.getCenter(this.projected).applyMatrix4(this.matrices[index]).project(this.camera);
      if (Math.abs(this.projected.x) > 1 || Math.abs(this.projected.y) > 1 || this.projected.z < -1 || this.projected.z > 1) { label.element.style.display = label.leader.style.display = 'none'; continue; }
      const x = (this.projected.x * 0.5 + 0.5) * this.width, y = (-this.projected.y * 0.5 + 0.5) * this.height;
      const { left, top, width, height } = this.aperture;
      if (x < left || x > left + width || y < top || y > top + height) { label.element.style.display = label.leader.style.display = 'none'; continue; }
      const text = this.guidedStepIndex === undefined ? label.full : label.short;
      if (label.element.textContent !== text) label.element.textContent = text;
      label.element.style.display = label.leader.style.display = 'block';
      const labelX = Math.max(left, Math.min(x + 10, left + width - label.element.offsetWidth));
      label.leader.style.transform = `translate(${x}px,${y}px)`;
      label.element.style.transform = `translate(${labelX}px,${Math.max(top, y - 12)}px)`;
      shown++;
    }
  }

  private render = (now: number): void => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.render);
    if (this.flight) {
      const flight = this.flight;
      const progress = Math.min(1, (now - flight.start) / flight.duration);
      const eased = progress * progress * (3 - 2 * progress);
      this.camera.position.lerpVectors(flight.fromPosition, flight.toPosition, eased);
      this.camera.up.lerpVectors(flight.fromUp, flight.toUp, eased).normalize();
      this.controls.target.lerpVectors(flight.fromTarget, flight.toTarget, eased);
      if (progress === 1) this.flight = null;
      this.dirty = true;
    }
    this.controls.update();
    if (!this.dirty) return;
    this.dirty = false;
    this.camera.updateMatrixWorld();
    this.updateLabels();
    const start = performance.now();
    this.renderer.render(this.scene, this.camera);
    const elapsed = performance.now() - start;
    // Bounded, renderer-local quality adaptation; never changes sampled state.
    this.slowFrames = elapsed > 22 ? this.slowFrames + 1 : 0;
    this.fastFrames = elapsed < 9 ? this.fastFrames + 1 : 0;
    if (this.slowFrames >= 20 && (this.ratio > 1 || this.light.shadow.mapSize.x > 512)) {
      if (this.ratio > 1) {
        this.ratio = Math.max(1, this.ratio - 0.25); this.renderer.setPixelRatio(this.ratio);
      }
      if (this.light.shadow.mapSize.x > 512) {
        this.light.shadow.mapSize.set(512, 512); this.light.shadow.map?.dispose(); this.light.shadow.map = null;
      }
      this.slowFrames = 0; this.dirty = true;
    } else if (this.fastFrames >= 180 && (this.ratio < this.maxRatio || this.light.shadow.mapSize.x < 1024)) {
      if (this.ratio < this.maxRatio) {
        this.ratio = Math.min(this.maxRatio, this.ratio + 0.25); this.renderer.setPixelRatio(this.ratio);
      } else {
        this.light.shadow.mapSize.set(1024, 1024); this.light.shadow.map?.dispose(); this.light.shadow.map = null;
      }
      this.fastFrames = 0; this.dirty = true;
    }
  };

  private clearModel(): void {
    for (const batch of this.batches) batch.object.dispose();
    for (const batch of this.propBatches) batch.object.dispose();
    for (const geometry of this.edgeGeometries.values()) geometry.dispose();
    this.edgeGeometries.clear();
    this.overlays?.dispose(); this.overlays = null;
    this.cables?.dispose(); this.cables = null;
    this.materials?.dispose(); this.materials = null;
    this.root.clear(); this.labelLayer.replaceChildren();
    for (const handle of this.handles) this.cache.release(handle);
    this.handles = []; this.handleById.clear(); this.batches = []; this.lines = []; this.outlines = []; this.labels = [];
    this.matrices = []; this.explodeVectors = []; this.internalIndices.clear(); this.internalAuthored.clear(); this.partIndices.clear();
    this.internalBindings.clear();
    this.propBatches = []; this.propLines = []; this.propMatrices = []; this.propIncluded = new Uint8Array(0);
    this.courseRootY = null; this.environmentVisible = false; this.lastFrameTimeMs = null;
    this.cameraSteps = []; this.lastPreset = undefined;
    this.guidedStepIndex = undefined; this.guidedPoints = null; this.guidedSubjects.clear();
    this.model = null; this.frame = null; this.selected = null; this.flight = null;
    this.dirty = true;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true; this.generation++;
    cancelAnimationFrame(this.raf); this.observer.disconnect(); this.controls.dispose(); this.clearModel();
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('pointerdown', this.onPointerDown); canvas.removeEventListener('pointerup', this.onPointerUp);
    canvas.removeEventListener('keydown', this.onKeyDown); canvas.removeEventListener('wheel', this.onManual); canvas.removeEventListener('webglcontextlost', this.onContextLost);
    this.ground.geometry.dispose(); this.ground.material.dispose();
    this.grid.geometry.dispose();
    for (const material of Array.isArray(this.grid.material) ? this.grid.material : [this.grid.material]) material.dispose();
    this.selectedMaterial.dispose(); this.activeMaterial.dispose(); this.light.shadow.dispose(); this.environment.dispose();
    this.renderer.dispose(); this.renderer.forceContextLoss(); canvas.remove(); this.labelLayer.remove(); this.scene.clear();
  }
}
