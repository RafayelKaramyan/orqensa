import { describe, expect, it } from 'vitest';
import {
  applyScene,
  copyScene,
  createScene,
  footprint,
  placementProblem,
  sceneSchema,
  type RoomObject,
} from './scene';
const object = (extra: Partial<RoomObject> = {}): RoomObject => ({
  id: crypto.randomUUID(),
  kind: 'desk',
  x: 3,
  z: 2,
  rotation: 0,
  ...extra,
});
describe('spatial rules', () => {
  it.each(['living', 'work', 'empty'] as const)('starts with a valid %s arrangement', (preset) => {
    const scene = createScene(preset);
    expect(placementProblem(scene.objects)).toBeNull();
    expect(sceneSchema.safeParse(scene).success).toBe(true);
  });
  it('uses the rotated footprint for bounds and collisions', () => {
    const desk = object({ x: 0.4 });
    expect(placementProblem([desk])).toContain('outside');
    expect(placementProblem([{ ...desk, rotation: 90 }])).toBeNull();
    expect(footprint({ ...desk, rotation: 90 })).toEqual({ width: 0.7, depth: 1.5 });
  });
  it('allows touching edges while rejecting overlap', () => {
    const a = object({ x: 2 });
    expect(placementProblem([a, object({ x: 3.5 })])).toBeNull();
    expect(placementProblem([a, object({ x: 3.4 })])).toContain('overlap');
  });
  it('rejects invalid movement without mutating the original', () => {
    const s = createScene();
    const original = structuredClone(s);
    expect(() => applyScene(s, { type: 'move', id: s.objects[0]!.id, x: -2, z: 2 })).toThrow(
      'outside',
    );
    expect(s).toEqual(original);
  });
  it('snaps movement and increments the revision', () => {
    const s = createScene('empty');
    const added = applyScene(s, { type: 'add', kind: 'chair' });
    const next = applyScene(added, { type: 'move', id: added.objects[0]!.id, x: 2.14, z: 3.26 });
    expect(next.objects[0]).toMatchObject({ x: 2.1, z: 3.3 });
    expect(next.revision).toBe(2);
  });
  it('finds a collision-free position when furniture is added', () => {
    let s = createScene();
    for (let i = 0; i < 4; i++) s = applyScene(s, { type: 'add', kind: 'plant' });
    expect(s.objects.length).toBe(11);
    expect(placementProblem(s.objects)).toBeNull();
  });
  it('limits room complexity to sixteen objects', () => {
    let s = createScene('empty');
    for (let i = 0; i < 16; i++) s = applyScene(s, { type: 'add', kind: 'plant' });
    expect(() => applyScene(s, { type: 'add', kind: 'plant' })).toThrow('16 objects');
  });
  it('gives a useful result when no object can fit', () => {
    let s = createScene('empty');
    let error = '';
    for (let i = 0; i < 16; i++) {
      try {
        s = applyScene(s, { type: 'add', kind: 'sofa' });
      } catch (e) {
        error = (e as Error).message;
        break;
      }
    }
    expect(error).toContain('no clear position');
    expect(placementProblem(s.objects)).toBeNull();
  });
  it('removes a known object and rejects stale object identifiers', () => {
    const s = createScene();
    const id = s.objects[0]!.id;
    const next = applyScene(s, { type: 'remove', id });
    expect(next.objects).toHaveLength(6);
    expect(() => applyScene(next, { type: 'rotate', id })).toThrow('no longer');
  });
  it('creates independent identifiers for copied rooms and objects', () => {
    const s = createScene();
    const copy = copyScene(s);
    expect(copy.id).not.toBe(s.id);
    expect(copy.objects.some((o) => s.objects.some((old) => old.id === o.id))).toBe(false);
    copy.objects[0]!.x = 4;
    expect(s.objects[0]!.x).not.toBe(4);
  });
  it('restores history under the current room identity with a new revision', () => {
    const s = createScene();
    const next = applyScene(s, { type: 'material', value: 'terrazzo' });
    const restored = applyScene(next, {
      type: 'restore',
      value: { ...s, id: crypto.randomUUID() },
    });
    expect(restored.id).toBe(s.id);
    expect(restored.revision).toBe(2);
    expect(restored.material).toBe('oak');
  });
  it('rejects duplicate identifiers and unsupported rotation', () => {
    const s = createScene();
    s.objects[1]!.id = s.objects[0]!.id;
    expect(sceneSchema.safeParse(s).success).toBe(false);
    expect(
      sceneSchema.safeParse({ ...createScene(), objects: [object({ rotation: 45 as 90 })] })
        .success,
    ).toBe(false);
  });
  it('rejects nonfinite coordinates from untrusted commands', () => {
    const s = createScene();
    expect(() =>
      applyScene(s, { type: 'move', id: s.objects[0]!.id, x: Infinity, z: NaN }),
    ).toThrow();
  });
});
