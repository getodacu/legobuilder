import {
  Color, LineBasicMaterial, Material, MeshStandardMaterial, ShaderMaterial, SRGBColorSpace,
  type MeshStandardMaterialParameters
} from 'three';
import type { MaterialDefinition, ViewOptions } from '../types/model';

/** Renderer-owned variants. Cache-owned source materials are never mutated. */
export class SceneMaterials {
  private readonly owned = new Map<string, Material>();
  private readonly definitions: Map<string, MaterialDefinition>;

  constructor(definitions: readonly MaterialDefinition[]) {
    this.definitions = new Map(definitions.map((definition) => [definition.id, definition]));
  }

  resolve(source: Material, inherited: boolean, materialId: string, mode: ViewOptions['mode'], line: boolean): Material {
    const key = `${source.uuid}:${inherited ? materialId : 'fixed'}:${mode}:${line}`;
    const cached = this.owned.get(key);
    if (cached) return cached;
    const definition = inherited ? this.definitions.get(materialId) : undefined;
    if (inherited && !definition) throw new Error(`Missing material definition: ${materialId}`);
    // Conditional-line shaders contain visibility logic and must remain intact.
    if (line && source instanceof ShaderMaterial) {
      const material = source.clone();
      if (material.uniforms.diffuse?.value instanceof Color) {
        if (mode === 'technical') material.uniforms.diffuse.value.setStyle('#263b36', SRGBColorSpace);
        else if (definition) material.uniforms.diffuse.value.setStyle(definition.color, SRGBColorSpace);
      }
      this.owned.set(key, material);
      return material;
    }
    const colored = source as Material & { color?: Color; roughness?: number; metalness?: number };
    const technical = mode === 'technical';
    const color = technical ? new Color(line ? '#263b36' : '#dfe8e4')
      : definition ? new Color().setStyle(definition.color, SRGBColorSpace) : colored.color?.clone() ?? new Color('#202522');
    const opacity = definition?.opacity ?? source.opacity;
    const parameters: MeshStandardMaterialParameters = {
      color, metalness: technical ? 0 : definition?.metalness ?? colored.metalness ?? 0,
      roughness: technical ? 0.95 : definition?.roughness ?? colored.roughness ?? 0.38,
      opacity, transparent: opacity < 1, depthWrite: opacity >= 1,
      side: source.side, flatShading: false,
      polygonOffset: mode !== 'studio', polygonOffsetFactor: 1, polygonOffsetUnits: 1
    };
    const material = line
      ? new LineBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: false })
      : source instanceof MeshStandardMaterial ? source.clone() : new MeshStandardMaterial(parameters);
    if (material instanceof MeshStandardMaterial) {
      if (inherited || technical) {
        material.color.copy(color);
        material.metalness = parameters.metalness!;
        material.roughness = parameters.roughness!;
        material.opacity = opacity;
        material.transparent = opacity < 1;
        material.depthWrite = opacity >= 1;
      }
      material.polygonOffset = mode !== 'studio';
      material.polygonOffsetFactor = 1;
      material.polygonOffsetUnits = 1;
    }
    return material;
  }

  dispose(): void {
    for (const material of this.owned.values()) material.dispose();
    this.owned.clear();
  }
}
