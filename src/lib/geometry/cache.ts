import {
  Box3, BufferGeometry, Group, LoadingManager, Material, Matrix4, Mesh,
  MeshStandardMaterial, Object3D, Quaternion, Texture, Vector3
} from 'three';
import { LDrawLoader } from 'three/addons/loaders/LDrawLoader.js';
import { LDrawConditionalLineMaterial } from 'three/addons/materials/LDrawConditionalLineMaterial.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import palette from '../../../static/models/library/materials.json' with { type: 'json' };
import type { GeometryAsset, GeometryCache, GeometryHandle } from '../types/model';

export type ThreeGeometryPrimitive = {
  readonly geometry: BufferGeometry;
  readonly material: Material;
  /** Native source-local geometry -> part-local Y-up scene millimeters, exactly once. */
  readonly matrix: Matrix4;
  readonly kind: 'mesh' | 'line' | 'conditional-line';
  readonly inheritColor: boolean;
  readonly nodeId?: string;
};
export type ThreeGeometryHandle = GeometryHandle & {
  readonly primitives: readonly ThreeGeometryPrimitive[];
  readonly bounds: Box3;
};
type Loaded = { primitives: ThreeGeometryPrimitive[]; bounds: Box3; geometries: Set<BufferGeometry>; materials: Set<Material> };
type Entry = { refs: number; abort: AbortController; promise: Promise<Loaded>; loaded?: Loaded };
const normalize = (name: string) => name.replaceAll('\\', '/').toLowerCase();

/** Retains immutable loader buffers. Every acquire returns one independently releasable lease. */
export class GeometryLibrary implements GeometryCache {
  private readonly entries = new Map<string, Entry>();
  private readonly leases = new Map<GeometryHandle, Entry>();
  private disposed = false;

  async acquire(asset: GeometryAsset): Promise<ThreeGeometryHandle> {
    if (this.disposed) throw new Error('GeometryLibrary is disposed. Create a library for the new viewer.');
    if (!/^[a-f0-9]{64}$/.test(asset.sha256)) throw new Error(`Geometry ${asset.id} has no valid SHA-256.`);
    if (!asset.preserveOrigin) throw new Error(`Geometry ${asset.id} must preserve its source origin.`);
    const transform = [...asset.nativeToScene.position, ...asset.nativeToScene.quaternion, ...asset.nativeToScene.scale];
    if (transform.some((value) => !Number.isFinite(value)) || asset.nativeToScene.scale.some((value) => value === 0)) throw new Error(`Geometry ${asset.id} has an invalid nativeToScene transform.`);
    if (Math.abs(Math.hypot(...asset.nativeToScene.quaternion) - 1) > 1e-6) throw new Error(`Geometry ${asset.id} nativeToScene quaternion must be normalized.`);
    const key = JSON.stringify(['geometry-v1', asset.sha256, asset.format, asset.nativeUnits, asset.nativeToScene, asset.materialSlots, asset.internalNodes ?? [], asset.dependencyIds]);
    let entry = this.entries.get(key);
    if (!entry) {
      const abort = new AbortController();
      const pending: Entry = {
        refs: 0,
        abort,
        promise: this.load(asset, abort.signal).then((loaded) => {
          if (this.disposed || abort.signal.aborted || pending.refs === 0) {
            this.destroy(loaded);
            throw new Error(`Geometry ${asset.id} finished after its viewer was released.`);
          }
          pending.loaded = loaded;
          return loaded;
        }).catch((error: unknown) => {
          if (this.entries.get(key) === pending) this.entries.delete(key);
          throw new Error(`Unable to load geometry ${asset.id} (${asset.url}): ${error instanceof Error ? error.message : String(error)}`, { cause: error });
        })
      };
      entry = pending;
      this.entries.set(key, entry);
    }
    entry.refs++;
    try {
      const loaded = await entry.promise;
      if (this.disposed) throw new Error(`Geometry ${asset.id} cannot be acquired after disposal.`);
      const handle: ThreeGeometryHandle = { assetId: asset.id, primitives: loaded.primitives, bounds: loaded.bounds };
      this.leases.set(handle, entry);
      return handle;
    } catch (error) {
      entry.refs--;
      throw error;
    }
  }

  release(handle: GeometryHandle): void {
    const entry = this.leases.get(handle);
    if (!entry) return; // Idempotent release; foreign handles never release another viewer's buffers.
    this.leases.delete(handle);
    entry.refs--;
    if (entry.refs !== 0) return;
    entry.abort.abort();
    for (const [key, value] of this.entries) if (value === entry) this.entries.delete(key);
    if (entry.loaded) this.destroy(entry.loaded);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.leases.clear();
    for (const entry of this.entries.values()) {
      entry.abort.abort();
      if (entry.loaded) this.destroy(entry.loaded);
    }
    this.entries.clear();
  }

  private destroy(loaded: Loaded): void {
    const textures = new Set<Texture>();
    for (const geometry of loaded.geometries) geometry.dispose();
    for (const material of loaded.materials) {
      for (const value of Object.values(material)) if (value instanceof Texture) textures.add(value);
      material.dispose();
    }
    for (const texture of textures) texture.dispose();
  }

  private async load(asset: GeometryAsset, signal: AbortSignal): Promise<Loaded> {
    const response = await fetch(asset.url, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}; run npm run assets:prepare and restore the licensed generated library.`);
    const bytes = await response.arrayBuffer();
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    const sha256 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
    if (sha256 !== asset.sha256) throw new Error('Asset SHA-256 differs from its manifest. Regenerate assets and model manifests together.');
    if (signal.aborted) throw new Error('Asset acquisition was cancelled.');
    const manager = new LoadingManager();
    // Curated MPDs and other supported formats must be self-contained. Never probe arbitrary library/network paths.
    manager.setURLModifier((url) => {
      if (!url.startsWith('data:') && !url.startsWith('blob:')) throw new Error(`Undeclared external resource ${url}; pack and license all dependencies offline.`);
      return url;
    });
    let object: Object3D;
    let ldraw: LDrawLoader | undefined;
    const decoder = new TextDecoder();
    const geometries = new Set<BufferGeometry>();
    const ownedMaterials = new Set<Material>();
    try {
      if (asset.format === 'mpd' || asset.format === 'dat') {
        if (asset.nativeUnits !== 'ldu') throw new Error('LDraw requires declared nativeUnits=ldu.');
        const text = decoder.decode(bytes);
        const sections = new Set([...text.matchAll(/^0 FILE (.+)$/gm)].map((match) => normalize(match[1]!.trim())));
        const declared = new Set(asset.dependencyIds.map(normalize));
        if (asset.format === 'mpd' && (sections.size !== declared.size || [...sections].some((path) => !declared.has(path)))) throw new Error('MPD FILE sections differ from the declared licensed closure.');
        const aliases: Record<string, string> = {};
        for (const path of declared) {
          aliases[path] = path;
          const alias = path.replace(/^(parts|p)\//, '');
          if (aliases[alias] && aliases[alias] !== path) throw new Error(`Ambiguous LDraw reference ${alias}.`);
          aliases[alias] = path;
        }
        const fileMap: Record<string, string> = {};
        for (const line of text.split(/\r?\n/)) {
          if (!/^1\s/.test(line)) continue;
          const reference = line.trim().split(/\s+/).slice(14).join(' ').replaceAll('\\', '/');
          const target = aliases[normalize(reference)];
          if (!target || !sections.has(target)) throw new Error(`Missing packed dependency ${reference}; re-prepare the selected licensed closure.`);
          fileMap[reference] = target;
        }
        ldraw = new LDrawLoader(manager);
        ldraw.setConditionalLineMaterial(LDrawConditionalLineMaterial);
        ldraw.setFileMap(fileMap);
        const colors = [...palette.map((material) => {
          const code = material.id.replace('ldraw-', '');
          const finish = material.category === 'rubber' ? ' RUBBER' : material.category === 'metal' ? ' METAL' : '';
          return `0 !COLOUR RoboBuild_${code} CODE ${code} VALUE ${material.color} EDGE #333333${material.opacity < 1 ? ` ALPHA ${Math.round(material.opacity * 255)}` : ''}${finish}`;
        }), '0 !COLOUR RoboBuild_Inherited CODE 16 VALUE #f4f4f4 EDGE #333333'].join('\n');
        // Palette is runtime-authored; distributed original DAT bodies remain byte-preserved.
        const firstLine = text.indexOf('\n');
        const source = asset.format === 'mpd' ? `${text.slice(0, firstLine + 1)}${colors}\n${text.slice(firstLine + 1)}` : `${colors}\n${text}`;
        object = await new Promise<Group>((resolve, reject) => ldraw!.parse(source, resolve, reject));
      } else if (asset.format === 'stl') {
        if (asset.nativeUnits === 'ldu') throw new Error('STL units must be explicitly declared by its source, never assumed LDU.');
        const geometry = new STLLoader(manager).parse(bytes);
        geometries.add(geometry);
        const material = new MeshStandardMaterial({ color: '#f4f4f4', roughness: 0.38 });
        material.userData.inheritColor = true;
        ownedMaterials.add(material);
        object = new Mesh(geometry, material);
      } else if (asset.format === 'obj') {
        const text = decoder.decode(bytes);
        if (/^\s*(mtllib|usemtl)\s/m.test(text)) throw new Error('OBJ requires offline explicit licensed MTL/texture mapping; use a packed glTF asset for material-bearing OBJ.');
        object = new OBJLoader(manager).parse(text);
        object.traverse((node) => { if (node instanceof Mesh) for (const material of Array.isArray(node.material) ? node.material : [node.material]) material.userData.inheritColor = true; });
      } else {
        if (asset.nativeUnits !== 'm') throw new Error('glTF/GLB native units must be meters; declare their mm conversion in nativeToScene.');
        const gltf = await new GLTFLoader(manager).parseAsync(asset.format === 'gltf' ? decoder.decode(bytes) : bytes, '');
        object = gltf.scene;
      }
      object.updateMatrixWorld(true);
      const conversion = new Matrix4().compose(new Vector3(...asset.nativeToScene.position), new Quaternion(...asset.nativeToScene.quaternion), new Vector3(...asset.nativeToScene.scale));
      const nodeIds = new Set(asset.internalNodes?.map((node) => node.id) ?? []);
      const primitives: ThreeGeometryPrimitive[] = [];
      const bounds = new Box3();
      const foundNodes = new Set<string>();
      object.traverse((node) => {
        if (!(node instanceof Mesh) && !(node as Object3D & { isLineSegments?: boolean }).isLineSegments) return;
        const rendered = node as Mesh & { isLineSegments?: boolean; isConditionalLine?: boolean };
        const sourceGeometry = rendered.geometry;
        geometries.add(sourceGeometry);
        const nodeMaterials = Array.isArray(rendered.material) ? rendered.material : [rendered.material];
        for (const material of nodeMaterials) ownedMaterials.add(material);
        const matrix = new Matrix4().multiplyMatrices(conversion, node.matrixWorld);
        let nodeId: string | undefined;
        for (let parent: Object3D | null = node.parent; parent; parent = parent.parent) {
          const sourceName = String(parent.userData.fileName ?? parent.name);
          const id = ldraw ? normalize(sourceName) : sourceName;
          if (nodeIds.has(id)) { nodeId = id; foundNodes.add(id); break; }
        }
        if (nodeIds.has(node.name)) { nodeId = node.name; foundNodes.add(nodeId); }
        if (!sourceGeometry.boundingBox) sourceGeometry.computeBoundingBox();
        if (sourceGeometry.boundingBox) bounds.union(sourceGeometry.boundingBox.clone().applyMatrix4(matrix));
        const groups = Array.isArray(rendered.material) ? sourceGeometry.groups : [{ start: sourceGeometry.drawRange.start, count: sourceGeometry.drawRange.count, materialIndex: 0 }];
        if (Array.isArray(rendered.material) && !groups.length) throw new Error('Material-array geometry has no draw groups.');
        for (const group of groups) {
          const material = nodeMaterials[group.materialIndex ?? 0];
          if (!material) throw new Error('Source geometry references a missing material group.');
          const code = String(material.userData.code ?? '');
          if (ldraw && !code) throw new Error('LDraw material is unresolved; add its researched palette entry, never a fallback material.');
          const definition = palette.find((entry) => entry.id === `ldraw-${code}`);
          if (definition && material instanceof MeshStandardMaterial) {
            material.roughness = definition.roughness;
            material.metalness = definition.metalness;
          }
          let geometry = sourceGeometry;
          if (Array.isArray(rendered.material)) {
            // Draw-range views share immutable BufferAttributes/index; no copied mesh buffers.
            geometry = new BufferGeometry();
            for (const [name, attribute] of Object.entries(sourceGeometry.attributes)) geometry.setAttribute(name, attribute);
            geometry.setIndex(sourceGeometry.index);
            geometry.setDrawRange(group.start, group.count);
            geometry.boundingBox = sourceGeometry.boundingBox;
            geometry.boundingSphere = sourceGeometry.boundingSphere;
            geometries.add(geometry);
          }
          primitives.push({ geometry, material, matrix, kind: rendered.isConditionalLine ? 'conditional-line' : rendered.isLineSegments ? 'line' : 'mesh', inheritColor: code === '16' || code === '24' || material.userData.inheritColor === true, ...(nodeId ? { nodeId } : {}) });
        }
      });
      if (!primitives.some((primitive) => primitive.kind === 'mesh') || bounds.isEmpty() || [...bounds.min.toArray(), ...bounds.max.toArray()].some((value) => !Number.isFinite(value))) throw new Error('Asset contains no finite renderable source mesh.');
      for (const id of nodeIds) if (!foundNodes.has(id)) throw new Error(`Source articulation node ${id} was not retained by the loader.`);
      if (signal.aborted) throw new Error('Asset acquisition was cancelled.');
      return { primitives, bounds, geometries, materials: ownedMaterials };
    } catch (error) {
      this.destroy({ primitives: [], bounds: new Box3(), geometries, materials: ownedMaterials });
      throw error;
    } finally {
      // These are loader-only sentinels, never valid application materials.
      if (ldraw) {
        const sentinels = ldraw as LDrawLoader & { missingColorMaterial: Material; missingEdgeColorMaterial: Material; missingConditionalEdgeColorMaterial: Material };
        sentinels.missingColorMaterial.dispose();
        sentinels.missingEdgeColorMaterial.dispose();
        sentinels.missingConditionalEdgeColorMaterial.dispose();
      }
    }
  }
}
