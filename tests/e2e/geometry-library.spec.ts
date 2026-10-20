import { test, expect } from '@playwright/test';
import type { GeometryAsset, MaterialDefinition } from '../../src/lib/types/model';
import type { ThreeGeometryHandle } from '../../src/lib/geometry/cache';
import type { MeshStandardMaterial } from 'three';

test('all selected authorised roots load their real closure, retain source origins, fixed colours and independent leases', async ({ page }, info) => {
  test.setTimeout(180_000);
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('requestfailed', (request) => failures.push(`${request.url()}: ${request.failure()?.errorText}`));
  page.on('response', (response) => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
  await page.goto('/');

  // Import the actual development modules in Chromium: no Node loader, fake buffers,
  // intercepted routes or private renderer/controller exposure.
  const result = await page.evaluate(async () => {
    const cacheModule = '/src/lib/geometry/cache.ts';
    const materialsModule = '/src/lib/scene/materials.ts';
    const { GeometryLibrary } = await import(/* @vite-ignore */ cacheModule);
    const { SceneMaterials } = await import(/* @vite-ignore */ materialsModule);
    const response = await fetch('/models/library/manifest.json');
    if (!response.ok) throw new Error(`Library manifest: HTTP ${response.status}`);
    const manifest = await response.json() as { assets: GeometryAsset[]; materials: MaterialDefinition[] };
    const require = (condition: boolean, message: string) => { if (!condition) throw new Error(message); };
    require(new Set(manifest.assets.map((asset) => asset.id)).size === manifest.assets.length, 'Duplicate source root identity.');
    const library = new GeometryLibrary();
    const reports: { id: string; min: number[]; max: number[]; primitives: number; meshVertices: number; nodes: string[] }[] = [];
    const byId = new Map(manifest.assets.map((asset) => [asset.id, asset]));
    const assetFor = (id: string) => { const asset = byId.get(id); if (!asset) throw new Error(`Missing researched root ${id}`); return asset; };
    try {
      for (const asset of manifest.assets) {
        require(asset.format === 'mpd' && asset.nativeUnits === 'ldu' && asset.preserveOrigin, `${asset.id}: wrong source format, units or origin contract.`);
        require(JSON.stringify(asset.nativeToScene) === JSON.stringify({ position: [0, 0, 0], quaternion: [1, 0, 0, 0], scale: [0.4, 0.4, 0.4] }), `${asset.id}: LDU must convert once with Rx(pi), without recentering.`);
        require(asset.url === `/models/library/${asset.id}.mpd`, `${asset.id}: unexpected source URL.`);
        const sourceResponse = await fetch(asset.url);
        require(sourceResponse.ok, `${asset.id}: missing actual public MPD.`);
        const source = await sourceResponse.text();
        const sections = [...source.matchAll(/^0 FILE (.+)$/gm)].map((match) => match[1]!.trim().toLowerCase());
        require(sections[0] === `parts/${asset.id}.dat`, `${asset.id}: root source section is not first.`);
        const declared = [...asset.dependencyIds].sort();
        require(JSON.stringify([...sections].sort()) === JSON.stringify(declared), `${asset.id}: actual source closure differs from manifest.`);
        require(JSON.stringify(asset.attribution.map((file) => file.sourcePath).sort()) === JSON.stringify(declared), `${asset.id}: closure has unattributed files.`);
        for (const file of asset.attribution) {
          require(file.sourceUrl.startsWith('https://') && /^[a-f0-9]{64}$/.test(file.sha256), `${asset.id}: invalid source attribution ${file.sourcePath}.`);
          require(file.licenseIds.length > 0 && file.licenseIds.every((id) => id === 'CC-BY-2.0' || id === 'CC-BY-4.0'), `${asset.id}: unauthorised closure license.`);
        }
        const handle = await library.acquire(asset) as ThreeGeometryHandle;
        try {
          const min = handle.bounds.min.toArray(), max = handle.bounds.max.toArray();
          require([...min, ...max].every(Number.isFinite) && min.every((value, axis) => value < max[axis]!), `${asset.id}: invalid millimeter bounds.`);
        // An independent MPD triangle walk is the normalization oracle for EVERY root.
        // It reads source vertices and type-1 affine references, not loader bounds.
        const files: Record<string, string[][]> = {};
        let current = '';
        for (const line of source.split(/\r?\n/)) {
          if (line.startsWith('0 FILE ')) { current = line.slice(7).trim().toLowerCase(); files[current] = []; }
          else if (/^[1-5]\s/.test(line)) files[current]!.push(line.trim().split(/\s+/));
        }
        const sourceMin = [Infinity, Infinity, Infinity], sourceMax = [-Infinity, -Infinity, -Infinity];
        const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0];
        const walk = (path: string, parent: number[], ancestors: string[]) => {
          require(!ancestors.includes(path), `${asset.id}: cyclic source dependency.`);
          const rows = files[path];
          require(!!rows, `${asset.id}: unresolved actual source section ${path}.`);
          for (const row of rows!) {
            if (row[0] === '1') {
              const values = row.slice(2, 14).map(Number);
              const local = [values[3]!, values[4]!, values[5]!, values[0]!, values[6]!, values[7]!, values[8]!, values[1]!, values[9]!, values[10]!, values[11]!, values[2]!];
              const combined = new Array<number>(12);
              for (let axis = 0; axis < 3; axis++) {
                for (let column = 0; column < 3; column++) combined[axis * 4 + column] = parent[axis * 4]! * local[column]! + parent[axis * 4 + 1]! * local[4 + column]! + parent[axis * 4 + 2]! * local[8 + column]!;
                combined[axis * 4 + 3] = parent[axis * 4]! * local[3]! + parent[axis * 4 + 1]! * local[7]! + parent[axis * 4 + 2]! * local[11]! + parent[axis * 4 + 3]!;
              }
              const reference = row.slice(14).join(' ').replaceAll('\\', '/').toLowerCase();
              const resolved = files[reference] ? reference : [`parts/${reference}`, `p/${reference}`].find((candidate) => files[candidate]);
              require(!!resolved, `${asset.id}: undeclared source reference ${reference}.`);
              walk(resolved!, combined, [...ancestors, path]);
            } else if (row[0] === '3' || row[0] === '4') {
              for (let offset = 2; offset < row.length; offset += 3) {
                const x = Number(row[offset]), y = Number(row[offset + 1]), z = Number(row[offset + 2]);
                for (let axis = 0; axis < 3; axis++) {
                  const value = (parent[axis * 4]! * x + parent[axis * 4 + 1]! * y + parent[axis * 4 + 2]! * z + parent[axis * 4 + 3]!) * (axis === 0 ? 0.4 : -0.4);
                  sourceMin[axis] = Math.min(sourceMin[axis]!, value); sourceMax[axis] = Math.max(sourceMax[axis]!, value);
                }
              }
            }
          }
        };
        walk(`parts/${asset.id}.dat`, identity, []);
          const renderedMin = [Infinity, Infinity, Infinity], renderedMax = [-Infinity, -Infinity, -Infinity];
          let meshVertices = 0;
          for (const primitive of handle.primitives) {
            require(primitive.matrix.elements.every(Number.isFinite), `${asset.id}: nonfinite source-to-part matrix.`);
            const position = primitive.geometry.getAttribute('position');
            require(!!position && position.count > 0, `${asset.id}: empty actual primitive.`);
            for (let index = 0; index < position.count; index++) {
              require(Number.isFinite(position.getX(index)) && Number.isFinite(position.getY(index)) && Number.isFinite(position.getZ(index)), `${asset.id}: nonfinite actual source vertex.`);
              if (primitive.kind === 'mesh') {
                const x = position.getX(index), y = position.getY(index), z = position.getZ(index), matrix = primitive.matrix.elements;
                for (let axis = 0; axis < 3; axis++) {
                  const value = matrix[axis]! * x + matrix[4 + axis]! * y + matrix[8 + axis]! * z + matrix[12 + axis]!;
                  renderedMin[axis] = Math.min(renderedMin[axis]!, value); renderedMax[axis] = Math.max(renderedMax[axis]!, value);
                }
              }
            }
            if (primitive.kind === 'mesh') meshVertices += position.count;
          }
          require(meshVertices >= 3, `${asset.id}: no actual source triangles.`);
          for (let axis = 0; axis < 3; axis++) require(Math.abs(renderedMin[axis]! - sourceMin[axis]!) < 0.01 && Math.abs(renderedMax[axis]! - sourceMax[axis]!) < 0.01, `${asset.id}: loaded triangle bounds disagree with source-local mm normalization on axis ${axis}: loaded ${renderedMin[axis]}..${renderedMax[axis]}, source ${sourceMin[axis]}..${sourceMax[axis]}.`);
          const nodes = [...new Set(handle.primitives.map((primitive) => primitive.nodeId).filter((id): id is string => !!id))].sort();
          require(JSON.stringify(nodes) === JSON.stringify((asset.internalNodes ?? []).map((node) => node.id).sort()), `${asset.id}: lost internal source articulation.`);
          reports.push({ id: asset.id, min, max, primitives: handle.primitives.length, meshVertices, nodes });
        } finally { library.release(handle); }
      }

      const materials = new SceneMaterials(manifest.materials);
      const materialReports: { id: string; inherited: number; fixed: number; fixedCodes: string[]; inheritedColors: string[] }[] = [];
      try {
        for (const id of ['2780', '49295p01', '54675', '54696p01']) {
          const handle = await library.acquire(assetFor(id)) as ThreeGeometryHandle;
          try {
            let inherited = 0, fixed = 0;
            const fixedCodes = new Set<string>(), inheritedColors = new Set<string>();
            for (const primitive of handle.primitives.filter((entry) => entry.kind === 'mesh')) {
              const source = primitive.material as MeshStandardMaterial;
              const original = { color: source.color.getHexString(), opacity: source.opacity, roughness: source.roughness, metalness: source.metalness };
              for (const mode of ['studio', 'technical', 'inspection'] as const) {
                const red = materials.resolve(source, primitive.inheritColor, 'ldraw-4', mode, false) as MeshStandardMaterial;
                const blue = materials.resolve(source, primitive.inheritColor, 'ldraw-1', mode, false) as MeshStandardMaterial;
                if (mode === 'technical') {
                  require(red.color.getHexString() === 'dfe8e4' && blue.color.getHexString() === 'dfe8e4' && red.roughness === 0.95 && blue.metalness === 0, `${id}: technical faces must neutralize source and instance colors without replacing actual geometry.`);
                } else if (primitive.inheritColor) {
                  require(red !== blue && red.color.getHexString() === 'b40000' && blue.color.getHexString() === '1e5aa8', `${id}: actual inherited mesh does not follow instance colour.`);
                  inheritedColors.add(red.color.getHexString()); inheritedColors.add(blue.color.getHexString());
                } else {
                  require(red.color.equals(source.color) && blue.color.equals(source.color), `${id}: fixed source child recoloured by instance override.`);
                  require(red.opacity === source.opacity && blue.roughness === source.roughness && blue.metalness === source.metalness, `${id}: fixed source finish lost.`);
                }
                require(JSON.stringify({ color: source.color.getHexString(), opacity: source.opacity, roughness: source.roughness, metalness: source.metalness }) === JSON.stringify(original), `${id}: renderer mutated cache-owned source material.`);
              }
              if (primitive.inheritColor) inherited++;
              else { fixed++; fixedCodes.add(String(source.userData.code)); }
            }
            materialReports.push({ id, inherited, fixed, fixedCodes: [...fixedCodes].sort(), inheritedColors: [...inheritedColors].sort() });
          } finally { library.release(handle); }
        }
      } finally { materials.dispose(); }

      // Independent leases share immutable buffers, but a duplicate or foreign release
      // cannot dispose the remaining viewer's geometry. The last lease must dispose it.
      const pin = assetFor('2780');
      const [first, second] = await Promise.all([library.acquire(pin), library.acquire(pin)]) as [ThreeGeometryHandle, ThreeGeometryHandle];
      require(first !== second && first.primitives === second.primitives, 'Acquisitions must yield separate leases sharing immutable source buffers.');
      const geometries = [...new Set(first.primitives.map((primitive) => primitive.geometry))];
      const disposals = new Map(geometries.map((geometry) => [geometry, 0]));
      for (const geometry of geometries) geometry.addEventListener('dispose', () => disposals.set(geometry, disposals.get(geometry)! + 1));
      library.release(first);
      library.release(first);
      library.release({ assetId: pin.id });
      require([...disposals.values()].every((count) => count === 0), 'A live second lease lost its source buffers.');
      require(second.primitives.every((primitive) => primitive.geometry.getAttribute('position').count > 0), 'Second viewer lease is unusable.');
      library.release(second);
      require([...disposals.values()].every((count) => count === 1), 'Last lease must dispose each owned buffer exactly once.');
      const fresh = await library.acquire(pin) as ThreeGeometryHandle;
      require(fresh.primitives !== first.primitives && fresh.primitives.every((primitive) => !disposals.has(primitive.geometry)), 'Released entry reused stale disposed source buffers.');
      library.release(fresh);

      let badHash = '';
      try { await library.acquire({ ...pin, sha256: '0'.repeat(64) }); }
      catch (error) { badHash = error instanceof Error ? error.message : String(error); }
      require(/SHA-256 differs/.test(badHash), `Corrupt-source hash was not rejected: ${badHash}`);
      const recovered = await library.acquire(pin) as ThreeGeometryHandle;
      require(Math.abs(recovered.bounds.max.x - 8) < 0.001, 'A rejected hash poisoned subsequent valid acquisition.');
      let disposedGeometry = 0;
      const retainedGeometry = recovered.primitives.find((primitive) => primitive.kind === 'mesh')!.geometry;
      retainedGeometry.addEventListener('dispose', () => disposedGeometry++);
      library.dispose(); library.dispose(); library.release(recovered);
      require(disposedGeometry === 1, 'Viewer disposal must invalidate retained buffers once, with idempotent stale release.');
      let disposedError = '';
      try { await library.acquire(pin); }
      catch (error) { disposedError = error instanceof Error ? error.message : String(error); }
      require(/disposed/i.test(disposedError), 'Disposed viewer accepted a new acquisition.');
      return { roots: reports, materials: materialReports, badHash, disposedError, releasedBufferCount: geometries.length };
    } finally { library.dispose(); }
  });

  await info.attach('actual-library-source-bounds-materials-and-lifecycle', { body: JSON.stringify(result, null, 2), contentType: 'application/json' });
  await info.attach('new-page-errors-and-failed-assets', { body: JSON.stringify(failures, null, 2), contentType: 'application/json' });
  expect(failures).toEqual([]);
  const root = (id: string) => { const found = result.roots.find((entry) => entry.id === id); expect(found, `Actual loaded source root ${id}`).toBeDefined(); return found!; };
  const closeVector = (actual: number[], expected: number[]) => { for (let axis = 0; axis < 3; axis++) expect(actual[axis]).toBeCloseTo(expected[axis]!, 3); };
  // Independently source-bound dimensions: source-local origins survive the sole LDU conversion.
  closeVector(root('40490').min, [-3.6, -4, -35.6]);
  closeVector(root('40490').max, [3.6, 4, 35.6]);
  expect(root('2780').min[0], 'Native X=-20 LDU remains X=-8 mm, not recentered or rotated to another axis').toBeCloseTo(-8, 3);
  expect(root('2780').max[0], 'Native X=20 LDU remains X=8 mm').toBeCloseTo(8, 3);
  closeVector(root('48989').min, [-4, -11.6, -12]);
  closeVector(root('48989').max, [4, 11.6, 12]);
  expect(root('54675').nodes).toEqual(['parts/u9363.dat', 'parts/u9367c01.dat']);
  expect(root('54696p01').nodes).toEqual(['parts/u9363p01.dat', 'parts/u9364c01.dat']);
  const inheritedPin = result.materials.find((entry) => entry.id === '2780')!;
  expect(inheritedPin.inherited).toBeGreaterThan(0);
  expect(inheritedPin.fixed).toBe(0);
  expect(inheritedPin.inheritedColors).toEqual(['1e5aa8', 'b40000']);
  expect(result.materials.find((entry) => entry.id === '49295p01')!.fixedCodes).toContain('10322');
  for (const id of ['54675', '54696p01']) {
    const motor = result.materials.find((entry) => entry.id === id)!;
    expect(motor.fixed).toBeGreaterThan(0);
    expect(motor.fixedCodes).toEqual(expect.arrayContaining(['72', '322', '511']));
  }
  expect(result.releasedBufferCount).toBeGreaterThan(0);
  expect(result.badHash).toMatch(/SHA-256 differs/);
  expect(result.disposedError).toMatch(/disposed/i);
});
