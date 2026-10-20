import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { compileAssembly } from '../../src/lib/assembly/engine.ts';
import { advancedDrivingBase, advancedDrivingBaseSourceFamilies } from '../../src/lib/models/advanced-driving-base.ts';
import { roboticHand } from '../../src/lib/models/robotic-hand.ts';
import { qualityCheck } from '../../src/lib/models/quality-check.ts';
import { packageSorter } from '../../src/lib/models/package-sorter.ts';
import { reconcileSourceInventory } from '../../src/lib/models/advanced-driving-base/integration.ts';
import { compileSimulation } from '../../src/lib/simulation/kinematics.ts';
import sourceInventory from '../../docs/research/data/advanced-driving-base.json' with { type: 'json' };

// Validate authored data with the same engine contract used by the browser before publishing.
reconcileSourceInventory(advancedDrivingBase, advancedDrivingBaseSourceFamilies, sourceInventory.inventoryEvidence.byBook);
const models = [advancedDrivingBase, roboticHand, qualityCheck, packageSorter];
const summaries = [];
for (const model of models) {
  const numberedSteps = model.steps.filter((step) => step.kind === 'numbered-instruction').length;
  if (numberedSteps !== model.coverage.implementedSteps || numberedSteps > model.coverage.documentedSteps) throw new Error(`${model.id}: source step coverage disagrees with numbered instructions`);
  const assembly = compileAssembly(model);
  for (const scenario of model.scenarios) compileSimulation(assembly, scenario);
  const directory = new URL(`../../static/models/${model.id}/`, import.meta.url);
  await mkdir(directory, { recursive: true });
  const output = new URL('manifest.json', directory);
  await writeFile(output, `${JSON.stringify(model, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${fileURLToPath(output)}: ${model.parts.length} tracked units, ${numberedSteps}/${model.coverage.documentedSteps} documented steps implemented; placement fit remains unchecked.`);
  const { id, name, manufacturer, edition, category, complexity, description, coverage } = model;
  summaries.push({ identity: { id, name, manufacturer, edition, category, complexity, description }, coverage });
}
await writeFile(new URL('../../static/models/catalog-metadata.json', import.meta.url), `${JSON.stringify(summaries, null, 2)}\n`, 'utf8');
