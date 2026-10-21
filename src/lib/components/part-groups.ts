import type { GeometryAsset, PartInstance } from '../types/model.ts';

export function groupParts(parts: readonly PartInstance[], assets: readonly GeometryAsset[]) {
  const names = new Map(assets.map((asset) => {
    const header = asset.attribution.find((source) => source.sourcePath === `parts/${asset.id}.dat`)?.originalHeader;
    return [asset.id, header?.split('\n')[0]?.replace(/^0\s+/, '').replace(/\s+/g, ' ').trim()];
  }));
  const groups = new Map<string, { key: string; name: string; parts: PartInstance[] }>();
  for (const part of parts) {
    const key = JSON.stringify([part.geometryId, part.materialId, part.inventoryScope, part.partNumber ?? '']);
    const group = groups.get(key);
    if (group) group.parts.push(part);
    else groups.set(key, { key, name: names.get(part.geometryId) || part.name, parts: [part] });
  }
  return [...groups.values()];
}
