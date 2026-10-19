import { describe, expect, it } from 'vitest';
import { createRepository, leaseOf, STORAGE_KEY, type StorageAdapter } from './repository';
import { createScene } from './scene';
import { briefSchema } from './brief';
function memory(initial: string | null = null) {
  let raw = initial;
  return {
    getItem: () => raw,
    setItem: (_: string, value: string) => {
      raw = value;
    },
  };
}
describe('durable collection', () => {
  it('persists a room only after the storage write succeeds', () => {
    const storage = memory();
    const repo = createRepository(storage);
    const scene = createScene();
    repo.addScene(leaseOf(repo.getSnapshot()), scene);
    const reloaded = createRepository(storage).getSnapshot();
    expect(reloaded.status === 'ready' && reloaded.collection.scenes[0]?.id).toBe(scene.id);
  });
  it('does not announce success or change in-memory data after a quota failure', () => {
    const storage: StorageAdapter = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    const repo = createRepository(storage);
    const before = repo.getSnapshot();
    expect(() => repo.addScene(leaseOf(before), createScene())).toThrow('could not be saved');
    expect(repo.getSnapshot()).toBe(before);
  });
  it('blocks stale collection writes across repository instances', () => {
    const storage = memory();
    const first = createRepository(storage);
    first.addScene(leaseOf(first.getSnapshot()), createScene());
    const second = createRepository(storage);
    const lease = leaseOf(second.getSnapshot());
    first.addScene(leaseOf(first.getSnapshot()), createScene());
    expect(() => second.addScene(lease, createScene())).toThrow('another tab');
    expect(second.getSnapshot()).toEqual(first.getSnapshot());
  });
  it('protects a scene revision even with a current collection lease', () => {
    const repo = createRepository(memory());
    const scene = createScene();
    repo.addScene(leaseOf(repo.getSnapshot()), scene);
    repo.updateScene(leaseOf(repo.getSnapshot()), scene.id, 0, {
      type: 'material',
      value: 'terrazzo',
    });
    expect(() =>
      repo.updateScene(leaseOf(repo.getSnapshot()), scene.id, 0, { type: 'tone', value: 'sage' }),
    ).toThrow('changed in another tab');
  });
  it('limits saved rooms and rejects duplicate identifiers', () => {
    const repo = createRepository(memory());
    const s = createScene();
    repo.addScene(leaseOf(repo.getSnapshot()), s);
    expect(() => repo.addScene(leaseOf(repo.getSnapshot()), s)).toThrow('already saved');
    for (let i = 1; i < 12; i++) repo.addScene(leaseOf(repo.getSnapshot()), createScene());
    expect(() => repo.addScene(leaseOf(repo.getSnapshot()), createScene())).toThrow('12 rooms');
  });
  it('retains corrupt bytes and blocks writes until a guarded reset', () => {
    const storage = memory('{broken data');
    const repo = createRepository(storage);
    expect(repo.getSnapshot()).toMatchObject({ status: 'corrupt', raw: '{broken data' });
    expect(() => leaseOf(repo.getSnapshot())).toThrow('recovery copy');
    expect(storage.getItem()).toBe('{broken data');
    repo.recover('{broken data');
    expect(repo.getSnapshot().status).toBe('ready');
    expect(createRepository(storage).getSnapshot().status).toBe('ready');
  });
  it('does not reset a collection that changed after the recovery warning', () => {
    const storage = memory('bad');
    const repo = createRepository(storage);
    storage.setItem(STORAGE_KEY, 'different bad');
    expect(() => repo.recover('bad')).toThrow('changed');
    expect(storage.getItem()).toBe('different bad');
  });
  it('handles storage read denial and absence', () => {
    expect(createRepository(null).getSnapshot().status).toBe('unavailable');
    const blocked: StorageAdapter = {
      getItem: () => {
        throw new Error();
      },
      setItem: () => {},
    };
    expect(createRepository(blocked).getSnapshot().status).toBe('unavailable');
  });
  it('saves brief layouts as independent snapshots', () => {
    const repo = createRepository(memory());
    const scene = createScene();
    repo.addScene(leaseOf(repo.getSnapshot()), scene);
    const brief = briefSchema.parse({
      id: crypto.randomUUID(),
      title: 'A quiet home',
      kind: 'A home',
      area: 96,
      priorities: ['More storage'],
      notes: '',
      layout: scene,
      updatedAt: new Date().toISOString(),
    });
    repo.saveBrief(leaseOf(repo.getSnapshot()), brief);
    repo.updateScene(leaseOf(repo.getSnapshot()), scene.id, 0, {
      type: 'material',
      value: 'limestone',
    });
    const snapshot = repo.getSnapshot();
    expect(snapshot.status === 'ready' && snapshot.collection.briefs[0]!.layout!.material).toBe(
      'oak',
    );
  });
  it('notifies subscribers of persisted changes and supports unsubscription', () => {
    const repo = createRepository(memory());
    let calls = 0;
    const off = repo.subscribe(() => calls++);
    repo.addScene(leaseOf(repo.getSnapshot()), createScene());
    expect(calls).toBe(1);
    off();
    repo.addScene(leaseOf(repo.getSnapshot()), createScene());
    expect(calls).toBe(1);
  });
  it('blocks removed-room updates and preserves saved brief snapshots', () => {
    const repo = createRepository(memory());
    const s = createScene();
    repo.addScene(leaseOf(repo.getSnapshot()), s);
    repo.removeScene(leaseOf(repo.getSnapshot()), s.id);
    expect(() =>
      repo.updateScene(leaseOf(repo.getSnapshot()), s.id, 0, { type: 'title', value: 'New' }),
    ).toThrow('removed');
  });
});
