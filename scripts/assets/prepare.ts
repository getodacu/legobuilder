import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, rename, rm } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';
import { Matrix4, Quaternion, Vector3 } from 'three';
import type { GeometryAsset, LicenseAttribution, MaterialDefinition, SourceDocument, Transform } from '../../src/lib/types/model.ts';

type FileRecord = { path: string; localPath: string; sourceUrl: string; sha256: string; bytes: number; authors: string[]; licenseStatements: string[]; resolvedDependencies: Record<string, string> };
type RootRecord = { geometryId: string; dat: string; localPath: string; sha256: string; dependencyClosure: string[] };
type Crosswalk = { assets: RootRecord[]; files: FileRecord[]; families: { geometryId: string; material: { ldrawCode: number } }[] };
type SupportingDownload = { path: string; sourceUrl: string; sha256: string; bytes: number };
const root = resolve(import.meta.dirname, '../..');
const output = resolve(root, 'static/models/library');
const staging = `${output}.preparing`;
const hash = (data: Uint8Array | string) => createHash('sha256').update(data).digest('hex');
const fail = (message: string): never => { throw new Error(`Asset preparation: ${message}`); };
const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
const canonical = (name: string) => name.replaceAll('\\', '/').toLowerCase();
const nativeToScene: Transform = { position: [0, 0, 0], quaternion: [1, 0, 0, 0], scale: [0.4, 0.4, 0.4] };
const N = new Matrix4().makeScale(0.4, -0.4, -0.4);

// Independently authored narrow display palette, not a copied LDConfig library.
// RGB factual cross-check: private LDConfig; family/color identity: researched crosswalk.
// Roughness/metalness are RoboBuild presentation choices, not measured LEGO properties.
const palette: Record<number, [string, string, MaterialDefinition['category']]> = {
  0: ['Black', '#1b2a34', 'plastic'], 1: ['Blue', '#1e5aa8', 'plastic'],
  2: ['Green', '#00852b', 'plastic'], 4: ['Red', '#b40000', 'plastic'],
  14: ['Yellow', '#fac80a', 'plastic'], 15: ['White', '#f4f4f4', 'plastic'],
  19: ['Tan', '#d7ba8c', 'plastic'], 26: ['Magenta', '#901f76', 'plastic'],
  47: ['Transparent clear', '#fcfcfc', 'transparent'], 70: ['Reddish brown', '#5f3109', 'plastic'],
  71: ['Light bluish gray', '#969696', 'plastic'], 72: ['Dark bluish gray', '#646464', 'plastic'],
  322: ['Medium azure', '#68c3e2', 'plastic'], 334: ['Gold finish', '#dfc176', 'metal'],
  494: ['Electrical contact alloy', '#d0d0d0', 'metal'], 511: ['White cable rubber', '#f4f4f4', 'rubber'],
  10322: ['Medium azure integral tyre rubber', '#68c3e2', 'rubber']
};

async function prepare() {
  const crosswalk = JSON.parse(await readFile(resolve(root, 'docs/research/data/lego-part-crosswalk.json'), 'utf8')) as Crosswalk;
  const requiredRoots = new Set(crosswalk.families.map((family) => family.geometryId));
  if (!requiredRoots.size || !crosswalk.files.length || new Set(crosswalk.assets.map((asset) => asset.geometryId)).size !== crosswalk.assets.length || crosswalk.assets.length !== requiredRoots.size || crosswalk.assets.some((asset) => !requiredRoots.has(asset.geometryId) || !/^[a-z0-9_-]+$/.test(asset.geometryId) || canonical(asset.dat) !== `${asset.geometryId}.dat`)) fail('Selected roots must safely and uniquely cover the researched part families.');
  const research = JSON.parse(await readFile(resolve(root, 'docs/research/data/geometry-assets.json'), 'utf8')) as { supportingDownloads: SupportingDownload[] };
  const paletteSource = research.supportingDownloads.find((file) => file.path === '.research-cache/geometry/ldraw/LDConfig.ldr');
  if (!paletteSource) return fail('Missing researched LDConfig provenance.');
  const paletteBytes = await readFile(resolve(root, paletteSource.path));
  if (paletteBytes.length !== paletteSource.bytes || hash(paletteBytes) !== paletteSource.sha256) fail(`Hash/size mismatch ${paletteSource.path}; restore original ${paletteSource.sourceUrl}.`);
  const paletteEdition = /^0\s+!LDRAW_ORG\s+(.+)$/m.exec(paletteBytes.toString('utf8'))?.[1]?.trim();
  if (!paletteEdition) return fail('Missing LDConfig edition declaration.');
  const sourceDocuments: SourceDocument[] = [{
    id: 'ldraw-palette', title: 'LDraw.org LDConfig — factual RGB cross-check only',
    sourceUrl: paletteSource.sourceUrl, sha256: hash(paletteBytes), edition: paletteEdition,
    redistribution: 'link-only'
  }];
  const files: Record<string, FileRecord> = {};
  const texts: Record<string, string> = {};
  const attribution: Record<string, LicenseAttribution> = {};
  for (const file of crosswalk.files) {
    const path = canonical(file.path);
    if (!/^(parts|p)\/[a-z0-9_./-]+\.dat$/.test(path) || path.includes('..')) fail(`Unsafe source path ${file.path}.`);
    if (files[path]) fail(`Duplicate source path ${path}.`);
    const expectedPath = resolve(root, '.research-cache/geometry/ldraw', path);
    if (resolve(root, file.localPath) !== expectedPath) fail(`Cache path for ${path} escapes the licensed library.`);
    let bytes: Buffer;
    try { bytes = await readFile(expectedPath); } catch { return fail(`Missing private cache file ${file.localPath}; restore the researched original (never substitute a primitive).`); }
    if (bytes.length !== file.bytes || hash(bytes) !== file.sha256) fail(`Hash/size mismatch ${file.localPath}; restore original ${file.sourceUrl}.`);
    const text = bytes.toString('utf8');
    if (!Buffer.from(text, 'utf8').equals(bytes)) fail(`Non-UTF-8 source ${path}; establish a byte-preserving text encoding route before MPD emission.`);
    const declarations = [...text.matchAll(/^0\s+!LICENSE\s+(.+)$/gm)].map((match) => match[1]!.trim());
    if (!declarations.length || declarations.some((value) => !/^Licensed under CC BY (4\.0|2\.0 and CC BY 4\.0) : see CAreadme\.txt$/.test(value))) fail(`Unapproved license declaration in ${path}.`);
    if (declarations.join('\n') !== file.licenseStatements.join('\n')) fail(`License metadata mismatch in ${path}.`);
    const mixed = declarations.some((value) => value.includes('2.0'));
    const lines = text.split(/\r?\n/);
    const firstGeometry = lines.findIndex((line) => /^[1-5]\s/.test(line));
    attribution[path] = {
      sourcePath: path, sourceUrl: file.sourceUrl, sha256: file.sha256,
      originalHeader: lines.slice(0, firstGeometry < 0 ? undefined : firstGeometry).join('\n'),
      authors: file.authors, licenseIds: mixed ? ['CC-BY-2.0', 'CC-BY-4.0'] : ['CC-BY-4.0'],
      licenseUrls: mixed ? ['https://creativecommons.org/licenses/by/2.0/', 'https://creativecommons.org/licenses/by/4.0/'] : ['https://creativecommons.org/licenses/by/4.0/'],
      modifications: ['Original DAT bytes retained in deterministic MPD FILE sections; no geometry editing, recentering or decimation. Runtime N = Rx(pi) * scale(0.4) converts to scene mm.']
    };
    files[path] = file;
    texts[path] = text;
  }
  // Validate actual type-1 records against the independently inspected dependency map.
  for (const [path, file] of Object.entries(files)) {
    const actual = new Set<string>();
    for (const line of texts[path]!.split(/\r?\n/)) {
      if (!/^1\s/.test(line)) continue;
      const tokens = line.trim().split(/\s+/);
      if (tokens.length < 15 || tokens.slice(2, 14).some((value) => !Number.isFinite(Number(value)))) fail(`Malformed type-1 geometry in ${path}: ${line}`);
      const ref = tokens.slice(14).join(' ');
      actual.add(canonical(ref));
      const target = Object.entries(file.resolvedDependencies).find(([name]) => canonical(name) === canonical(ref))?.[1];
      if (!target || !files[canonical(target)]) fail(`Missing researched dependency ${ref} from ${path}; restore/research the closure.`);
    }
    if (actual.size !== Object.keys(file.resolvedDependencies).length) fail(`Dependency map differs from source ${path}.`);
  }
  const selected = new Set<string>();
  const allColors = new Set<number>(crosswalk.families.map((family) => family.material.ldrawCode));
  const assets: GeometryAsset[] = [];
  const packed: { path: string; text: string }[] = [];
  for (const asset of [...crosswalk.assets].sort((a, b) => a.geometryId.localeCompare(b.geometryId, 'en'))) {
    const rootPath = `parts/${canonical(asset.dat)}`;
    if (files[rootPath]?.sha256 !== asset.sha256) fail(`Root metadata mismatch for ${asset.geometryId}.`);
    const closure = new Set<string>();
    const visiting = new Set<string>();
    const visit = (path: string) => {
      if (visiting.has(path)) fail(`Cyclic DAT dependency at ${path}.`);
      if (closure.has(path)) return;
      const file = files[path];
      if (!file) fail(`Missing closure file ${path}.`);
      visiting.add(path);
      for (const dependency of Object.values(file!.resolvedDependencies)) visit(canonical(dependency));
      visiting.delete(path);
      closure.add(path);
    };
    visit(rootPath);
    if ([...closure].sort().join('\n') !== asset.dependencyClosure.map(canonical).sort().join('\n')) fail(`Researched dependency closure differs for ${asset.geometryId}.`);
    const paths = [rootPath, ...[...closure].filter((path) => path !== rootPath).sort()];
    const aliases: Record<string, string> = {};
    const colors = new Set<number>();
    for (const path of paths) {
      selected.add(path);
      for (const [ref, target] of Object.entries(files[path]!.resolvedDependencies)) {
        const alias = canonical(ref);
        if (aliases[alias] && aliases[alias] !== canonical(target)) fail(`Ambiguous MPD dependency ${ref} in ${asset.geometryId}.`);
        aliases[alias] = canonical(target);
      }
      for (const line of texts[path]!.split(/\r?\n/)) {
        const match = /^[1-5]\s+(\S+)/.exec(line);
        if (!match) continue;
        const code = Number(match[1]);
        if (!Number.isInteger(code)) fail(`Unsupported color ${match[1]} in ${path}; author a licensed material mapping.`);
        if (code !== 16 && code !== 24) { colors.add(code); allColors.add(code); }
      }
    }
    // FILE wrappers only: the full original text (including histories, BFC and INVERTNEXT) is untouched.
    const mpd = paths.map((path) => `0 FILE ${path}\n${texts[path]}${texts[path]!.endsWith('\n') ? '' : '\n'}`).join('');
    const internalNodes: NonNullable<GeometryAsset['internalNodes']> = [];
    if (asset.geometryId === '54675' || asset.geometryId === '54696p01') {
      for (const line of texts[rootPath]!.split(/\r?\n/).filter((line) => /^1\s/.test(line))) {
        const t = line.trim().split(/\s+/);
        const ref = t.slice(14).join(' ');
        const target = aliases[canonical(ref)]!;
        const v = t.slice(2, 14).map(Number);
        const local = new Matrix4().set(v[3]!, v[4]!, v[5]!, v[0]!, v[6]!, v[7]!, v[8]!, v[1]!, v[9]!, v[10]!, v[11]!, v[2]!, 0, 0, 0, 1);
        local.premultiply(N).multiply(N.clone().invert());
        const p = new Vector3(); const q = new Quaternion(); const s = new Vector3();
        local.decompose(p, q, s);
        internalNodes.push({ id: target, localTransform: { position: p.toArray(), quaternion: q.toArray(), scale: s.toArray() } });
      }
    }
    assets.push({
      id: asset.geometryId, url: `/models/library/${asset.geometryId}.mpd`, format: 'mpd', sha256: hash(mpd),
      dependencyIds: paths, nativeUnits: 'ldu', nativeToScene, preserveOrigin: true,
      attribution: paths.map((path) => attribution[path]!),
      materialSlots: [{ id: '16', colorMode: 'inherited' }, { id: '24', colorMode: 'edge' }, ...[...colors].sort((a, b) => a - b).map((code) => ({ id: String(code), colorMode: 'fixed' as const, materialId: `ldraw-${code}` }))],
      ...(internalNodes.length ? { internalNodes } : {})
    });
    packed.push({ path: `${asset.geometryId}.mpd`, text: mpd });
  }
  const materials: MaterialDefinition[] = [...allColors].sort((a, b) => a - b).map((code) => {
    const color = palette[code];
    if (!color) return fail(`Color ${code} needs an explicitly authored narrow material entry.`);
    return {
      id: `ldraw-${code}`, name: color[0], color: color[1], category: color[2],
      metalness: color[2] === 'metal' ? 0.85 : 0,
      roughness: color[2] === 'rubber' ? 0.95 : color[2] === 'metal' ? 0.25 : 0.38,
      opacity: color[2] === 'transparent' ? 0.5 : 1,
      evidence: { category: 'app-authored', confidence: 0.8, sources: [{ documentId: 'ldraw-palette', sourceUrl: paletteSource.sourceUrl, confidence: 0.8 }], note: 'Narrow independently authored display palette; factual RGB cross-check against the hash-locked private LDraw configuration, family identity from LEGO crosswalk. Roughness, metalness and opacity are RoboBuild presentation choices, not measured calibration or LDConfig-derived PBR properties. No LDConfig text redistributed.' }
    };
  });
  // Read license prerequisites before touching output. No network or unreviewed assets enter this script.
  const licenses = await Promise.all(['CAreadme.txt', 'CAlicense.txt', 'CC-BY-4.0.txt'].map(async (name) => ({ name, bytes: await readFile(resolve(root, '.research-cache/geometry/licenses', name)) })));
  await rm(staging, { recursive: true, force: true });
  await mkdir(resolve(staging, 'licenses'), { recursive: true });
  for (const file of packed) await writeFile(resolve(staging, file.path), file.text);
  for (const license of licenses) await writeFile(resolve(staging, 'licenses', license.name), license.bytes);
  const selectedRecords = [...selected].sort().map((path) => attribution[path]!);
  await writeFile(resolve(staging, 'manifest.json'), json({ schemaVersion: 1, conversionVersion: 'curated-mpd-v1', assets, materials, sourceDocuments }));
  await writeFile(resolve(staging, 'materials.json'), json(materials.map(({ id, color, category, opacity, roughness, metalness }) => ({ id, color, category, opacity, roughness, metalness }))));
  await writeFile(resolve(staging, 'attribution.json'), json({ schemaVersion: 1, sourceCrosswalk: 'docs/research/data/lego-part-crosswalk.json', sourceCrosswalkSha256: hash(await readFile(resolve(root, 'docs/research/data/lego-part-crosswalk.json'))), roots: assets.map((asset) => ({ id: asset.id, url: asset.url, sha256: asset.sha256, sourcePaths: asset.dependencyIds, internalNodes: asset.internalNodes ?? [] })), files: selectedRecords, palette: materials, sourceDocuments }));
  await writeFile(resolve(staging, 'CREDITS.txt'), `RoboBuild licensed LDraw component library\n\n${assets.length} researched roots, ${selected.size} selected DAT source files. Source origins retained.\nOriginal DAT text is packed without editing into MPD FILE sections.\nRuntime conversion: Rx(pi) * scale(0.4), LDU to scene mm. No endorsement by LEGO or LDraw.\nMixed files retain CC BY 2.0 and CC BY 4.0 history obligations; see licenses/CAreadme.txt.\nRoboBuild's authored display palette is not measured material calibration.\n\n${selectedRecords.map((file) => `${file.sourcePath}\n${file.authors.join('; ')}\n${file.sourceUrl}\n${file.licenseIds.join(' + ')}\n${file.licenseUrls.join('\n')}\nSHA-256 ${file.sha256}\n`).join('\n')}`);
  await mkdir(dirname(output), { recursive: true });
  await rm(output, { recursive: true, force: true });
  await rename(staging, output);
  console.log(`Prepared ${assets.length} genuine MPDs / ${selected.size} selected DATs at ${relative(root, output)}; all ${crosswalk.files.length} private cache hashes verified.`);
}

prepare().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
