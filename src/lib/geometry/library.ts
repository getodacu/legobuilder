import manifest from '../../../static/models/library/manifest.json' with { type: 'json' };
import type { GeometryAsset, MaterialDefinition, SourceDocument } from '../types/model';

/** Generated, licensed source assets; run `npm run assets:prepare` before authoring/build. */
const assets = manifest.assets as GeometryAsset[];
const byId: Record<string, GeometryAsset> = Object.fromEntries(assets.map((asset) => [asset.id, asset]));
export const materials = manifest.materials as MaterialDefinition[];

export function geometryAssetsFor(ids: readonly string[]): GeometryAsset[] {
  return [...new Set(ids)].map((id) => {
    const asset = byId[id];
    if (!asset) throw new Error(`Unknown licensed geometry ${id}; add its researched closure before authoring a model.`);
    return asset;
  });
}

/** Only selected component roots and actually referenced material documents enter a model. */
export function sourceDocumentsFor(geometryAssets: readonly GeometryAsset[], selectedMaterials: readonly MaterialDefinition[]): SourceDocument[] {
  const documents = new Map<string, SourceDocument>();
  for (const asset of geometryAssets) {
    const root = asset.attribution.find((file) => file.sourcePath === `parts/${asset.id}.dat`);
    const edition = root?.originalHeader.match(/^0\s+!LDRAW_ORG\s+(.+)$/m)?.[1]?.trim();
    if (!root || !edition) throw new Error(`Missing original source/edition attribution for ${asset.id}.`);
    const id = `ldraw-${asset.id}`;
    documents.set(id, {
      id, title: `LDraw ${asset.id}.dat`, sourceUrl: root.sourceUrl, sha256: root.sha256,
      edition: `${edition}; historical mold not certified`, redistribution: 'permitted'
    });
  }
  for (const material of selectedMaterials) {
    for (const source of material.evidence.sources) {
      if (documents.has(source.documentId)) continue;
      const document = (manifest.sourceDocuments as SourceDocument[]).find((entry) => entry.id === source.documentId);
      if (!document) throw new Error(`Missing source document ${source.documentId} for material ${material.id}; regenerate the licensed library.`);
      documents.set(document.id, document);
    }
  }
  return [...documents.values()];
}
