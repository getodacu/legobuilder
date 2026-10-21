import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groupParts } from '../../src/lib/components/part-groups.ts';
import { roboticHand } from '../../src/lib/models/robotic-hand.ts';

test('parts group by geometry, color, inventory scope and manufacturer identity without losing instances', () => {
  const part = roboticHand.parts.find((part) => part.geometryId === '2780')!;
  const parts = [
    part, { ...part, id: 'matching-pin' },
    { ...part, id: 'blue-pin', materialId: 'ldraw-1' },
    { ...part, id: 'sample-pin', inventoryScope: 'sample' as const },
    { ...part, id: 'different-mold', partNumber: 'another-element' },
    { ...part, id: 'different-geometry', geometryId: 'unknown', name: 'Special connector' }
  ];
  const groups = groupParts(parts, roboticHand.geometryAssets);
  assert.equal(groups.length, 5);
  assert.equal(groups[0]!.name, 'Technic Pin with Friction and Slots');
  assert.deepEqual(groups[0]!.parts.map((part) => part.id), [part.id, 'matching-pin']);
  assert.equal(groups.at(-1)!.name, 'Special connector');
  assert.deepEqual(groups.flatMap((group) => group.parts).map((part) => part.id).sort(), parts.map((part) => part.id).sort());
  assert.equal(parts.length, 6);
});
