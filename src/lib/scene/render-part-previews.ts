import { AmbientLight, Box3, Color, DirectionalLight, Group, Mesh, OrthographicCamera, Scene, Vector3, WebGLRenderer } from 'three';
import type { RobotModel } from '../types/model.ts';
import { learnerPartNames } from '../components/learner-parts.ts';
import { GeometryLibrary } from '../geometry/cache.ts';
import { SceneMaterials } from './materials.ts';

const ids = ['robotic-hand', 'advanced-driving-base', 'quality-check', 'package-sorter'];

export async function renderPreviews() {
  const models = await Promise.all(ids.map(async (id) => {
    const response = await fetch(`/models/${id}/manifest.json`);
    if (!response.ok) throw new Error(`${id} manifest: HTTP ${response.status}`);
    const model = await response.json() as RobotModel;
    if (model.id !== id) throw new Error(`Unexpected manifest for ${id}`);
    return model;
  }));
  const renderer = new WebGLRenderer({ antialias: true });
  const library = new GeometryLibrary();
  const images: Record<string, string> = {};
  const scene = new Scene();
  const part = new Group();
  const key = new DirectionalLight('#fff8ef', 2.9);
  const fill = new DirectionalLight('#dceaff', 1.25);
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.01, 10000);
  const direction = new Vector3(1.25, 1, 1.8).normalize();
  const center = new Vector3();
  const vertex = new Vector3();
  const bounds = new Box3();
  renderer.setSize(128, 128, false);
  scene.background = new Color('#526171');
  key.position.set(3, 7, 7);
  fill.position.set(-3, 1, -2);
  scene.add(part, key, fill, new AmbientLight('#ffffff', 1.35));
  try {
    for (const model of models) {
      const assets = new Map(model.geometryAssets.map((asset) => [asset.id, asset]));
      const materialIds = new Set(model.materials.map((material) => material.id));
      const materials = new SceneMaterials(model.materials);
      try {
        for (const { geometryId, materialId } of model.parts) {
          const name = `${geometryId}-${materialId}.webp`;
          const asset = assets.get(geometryId);
          if (!asset || !materialIds.has(materialId)) throw new Error(`Missing geometry or material: ${name}`);
          if (!Object.hasOwn(learnerPartNames, geometryId)) throw new Error(`Missing learner name: ${geometryId}`);
          if (images[name]) continue;
          const handle = await library.acquire(asset);
          try {
            handle.bounds.getCenter(center);
            camera.position.copy(center).addScaledVector(direction, 300);
            camera.lookAt(center);
            camera.updateMatrixWorld();
            bounds.makeEmpty();
            for (const primitive of handle.primitives) {
              if (primitive.kind !== 'mesh') continue;
              const mesh = new Mesh(primitive.geometry, materials.resolve(primitive.material, primitive.inheritColor, materialId, 'studio', false));
              mesh.matrixAutoUpdate = false;
              mesh.matrix.copy(primitive.matrix);
              part.add(mesh);
              const positions = primitive.geometry.getAttribute('position');
              for (let i = 0; i < positions.count; i++) {
                bounds.expandByPoint(vertex.fromBufferAttribute(positions, i).applyMatrix4(primitive.matrix).applyMatrix4(camera.matrixWorldInverse));
              }
            }
            if (bounds.isEmpty()) throw new Error(`No mesh vertices: ${name}`);
            const half = Math.max(bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y) * 0.56;
            bounds.getCenter(center);
            camera.left = center.x - half; camera.right = center.x + half;
            camera.bottom = center.y - half; camera.top = center.y + half;
            camera.updateProjectionMatrix();
            renderer.render(scene, camera);
            const image = renderer.domElement.toDataURL('image/webp', 0.9);
            if (!image.startsWith('data:image/webp;base64,')) throw new Error(`WebP encoding failed: ${name}`);
            images[name] = image.slice('data:image/webp;base64,'.length);
          } finally {
            part.clear();
            library.release(handle);
          }
        }
      } finally { materials.dispose(); }
    }
  } finally { library.dispose(); renderer.dispose(); renderer.forceContextLoss(); }
  return images;
}
