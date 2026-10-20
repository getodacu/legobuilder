import assert from 'node:assert/strict';
import test from 'node:test';
import { compileAssembly, createFrame, sampleAssembly } from '../../src/lib/assembly/engine.ts';
import { readTransform, transformsEqual } from '../../src/lib/core/transforms.ts';
import { advancedDrivingBase } from '../../src/lib/models/advanced-driving-base.ts';
import { roboticHand } from '../../src/lib/models/robotic-hand.ts';
import { qualityCheck } from '../../src/lib/models/quality-check.ts';
import { packageSorter } from '../../src/lib/models/package-sorter.ts';
import type { AssemblyFrame } from '../../src/lib/types/model.ts';

// Exercise complete real graphs, including merged descendants and wiring state.
// Source identity/contact assertions live in each robot's independent manual test.
function state(frame: AssemblyFrame) {
  return {
    timeMs: frame.timeMs, stepIndex: frame.stepIndex,
    transforms: frame.transforms.slice(), subassemblies: frame.subassemblyTransforms.slice(),
    internal: frame.internalTransforms.slice(), environment: frame.environmentTransforms.slice(),
    environmentVisible: frame.environmentVisible.slice(), visible: frame.visible.slice(),
    installed: frame.installed.slice(), active: frame.active.slice(), connected: frame.connected.slice(),
    counts: { ...frame.counts }
  };
}

for (const model of [advancedDrivingBase, roboticHand, qualityCheck, packageSorter]) {
  test(`${model.id}: full-scene reverse, arbitrary seek and replay reproduce every pose and accounting lane`, () => {
    const compiled = compileAssembly(model), moving = createFrame(compiled), direct = createFrame(compiled);
    const buffers = [moving.transforms, moving.subassemblyTransforms, moving.internalTransforms,
      moving.environmentTransforms, moving.environmentVisible, moving.visible, moving.installed, moving.active, moving.connected, moving.counts];
    let seed = 0x726f626f;
    const times = [0, compiled.durationMs, 0, ...compiled.stepTimes.flatMap((step) => [step.startMs, step.endMs - 0.001, step.endMs])];
    for (let i = 0; i < 40; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      times.push(compiled.durationMs * seed / 0x100000000);
    }
    times.push(compiled.durationMs, 0, compiled.durationMs);
    for (const [index, time] of times.entries()) {
      // Dirty the reusable scene with the opposite endpoint before every seek.
      sampleAssembly(compiled, index % 2 ? compiled.durationMs : 0, moving);
      sampleAssembly(compiled, time, moving);
      sampleAssembly(compiled, time, direct);
      assert.deepEqual(state(moving), state(direct), `${model.id} @${time}ms`);
      assert.equal(moving.counts.robotInstalled, model.parts.reduce((count, part, i) => count + (part.inventoryScope === 'robot' ? moving.installed[i]! : 0), 0));
      assert.equal(moving.counts.sampleInstalled, model.parts.reduce((count, part, i) => count + (part.inventoryScope === 'sample' ? moving.installed[i]! : 0), 0));
      for (const lane of [moving.transforms, moving.subassemblyTransforms, moving.internalTransforms]) {
        for (let offset = 0; offset < lane.length; offset += 10) {
          assert.ok(lane.subarray(offset, offset + 10).every(Number.isFinite), 'No stale/nonfinite pose');
          assert.ok(Math.abs(Math.hypot(...lane.subarray(offset + 3, offset + 7)) - 1) < 1e-8, 'Rotations remain unit quaternions');
        }
      }
    }
    assert.equal(moving.counts.robotInstalled, moving.counts.robotTotal);
    assert.equal(moving.counts.sampleInstalled, moving.counts.sampleTotal);
    assert.equal(moving.counts.stepsComplete, model.steps.length);
    model.parts.forEach((part, index) => assert.ok(transformsEqual(readTransform(moving.transforms, index * 10), part.finalTransform), `Final descendant ${part.id}`));
    [moving.transforms, moving.subassemblyTransforms, moving.internalTransforms, moving.environmentTransforms,
      moving.environmentVisible, moving.visible, moving.installed, moving.active, moving.connected, moving.counts]
      .forEach((buffer, index) => assert.strictEqual(buffer, buffers[index], 'Scrubbing reuses scene buffers'));
    sampleAssembly(compiled, 0, moving);
    assert.equal(moving.counts.robotInstalled + moving.counts.sampleInstalled, 0, 'Reverse to inventory clears installed state');
  });
}
