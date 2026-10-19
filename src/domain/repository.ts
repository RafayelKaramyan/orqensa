import { z } from 'zod';
import { applyScene, sceneSchema, type Scene, type SceneCommand } from './scene';
import { briefSchema, type Brief } from './brief';

export const STORAGE_KEY = 'orqensa.collection.v1';
const collectionSchema = z
  .object({
    schema: z.literal(1),
    generation: z.uuid(),
    revision: z.number().int().nonnegative(),
    scenes: z.array(sceneSchema).max(12),
    briefs: z.array(briefSchema).max(12),
  })
  .strict()
  .superRefine((c, ctx) => {
    if (
      new Set(c.scenes.map((s) => s.id)).size !== c.scenes.length ||
      new Set(c.briefs.map((b) => b.id)).size !== c.briefs.length
    )
      ctx.addIssue({ code: 'custom', message: 'Saved identifiers must be unique.' });
  });
export type Collection = z.infer<typeof collectionSchema>;
export type Snapshot =
  | { status: 'ready'; collection: Collection; raw: string | null }
  | { status: 'corrupt'; raw: string; message: string }
  | { status: 'unavailable'; raw: null; message: string };
export type Lease = { generation: string; revision: number };
export type StorageAdapter = Pick<Storage, 'getItem' | 'setItem'>;
const empty = (): Collection => ({
  schema: 1,
  generation: crypto.randomUUID(),
  revision: 0,
  scenes: [],
  briefs: [],
});
export class CollectionError extends Error {}

export function createRepository(storage: StorageAdapter | null) {
  const listeners = new Set<() => void>();
  const initial = empty();
  let snapshot: Snapshot;
  function read(): Snapshot {
    if (!storage)
      return {
        status: 'unavailable',
        raw: null,
        message:
          'Browser storage is unavailable. You can still explore, export a room, and download a brief.',
      };
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (snapshot?.raw === raw && snapshot.status !== 'unavailable') return snapshot;
      if (raw === null) return { status: 'ready', collection: initial, raw };
      try {
        return { status: 'ready', collection: collectionSchema.parse(JSON.parse(raw)), raw };
      } catch {
        return {
          status: 'corrupt',
          raw,
          message:
            'Your saved collection could not be read. Download a recovery copy before starting again.',
        };
      }
    } catch {
      return {
        status: 'unavailable',
        raw: null,
        message:
          'The browser blocked access to saved rooms. Export your current work before leaving.',
      };
    }
  }
  snapshot = read();
  function publish(value: Snapshot) {
    if (value !== snapshot) {
      snapshot = value;
      listeners.forEach((f) => f());
    }
  }
  function ready() {
    const value = read();
    publish(value);
    if (value.status !== 'ready') throw new CollectionError(value.message);
    return value;
  }
  function transaction<T>(lease: Lease, change: (value: Collection) => T): T {
    const current = ready();
    if (
      current.collection.generation !== lease.generation ||
      current.collection.revision !== lease.revision
    )
      throw new CollectionError(
        'Your collection changed in another tab. The latest version is now shown; try your change again.',
      );
    const next = structuredClone(current.collection);
    const result = change(next);
    next.revision++;
    const collection = collectionSchema.parse(next);
    const raw = JSON.stringify(collection);
    try {
      storage!.setItem(STORAGE_KEY, raw);
    } catch {
      throw new CollectionError(
        'This change could not be saved. Browser storage may be full or blocked. Export your work and try again.',
      );
    }
    publish({ status: 'ready', collection, raw });
    return result;
  }
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    refresh: () => publish(read()),
    addScene(lease: Lease, scene: Scene) {
      return transaction(lease, (c) => {
        if (c.scenes.length >= 12)
          throw new CollectionError(
            'Your collection holds 12 rooms. Export or remove one before saving another.',
          );
        if (c.scenes.some((s) => s.id === scene.id))
          throw new CollectionError('This room is already saved.');
        c.scenes.unshift(sceneSchema.parse(scene));
        return scene.id;
      });
    },
    updateScene(lease: Lease, id: string, revision: number, command: SceneCommand) {
      return transaction(lease, (c) => {
        const index = c.scenes.findIndex((s) => s.id === id);
        const scene = c.scenes[index];
        if (!scene) throw new CollectionError('This room was removed in another tab.');
        if (scene.revision !== revision)
          throw new CollectionError(
            'This room changed in another tab. Review the current room and try again.',
          );
        c.scenes[index] = applyScene(scene, command);
      });
    },
    removeScene(lease: Lease, id: string) {
      return transaction(lease, (c) => {
        if (!c.scenes.some((s) => s.id === id))
          throw new CollectionError('This room has already been removed.');
        c.scenes = c.scenes.filter((s) => s.id !== id);
      });
    },
    saveBrief(lease: Lease, brief: Brief) {
      return transaction(lease, (c) => {
        if (c.briefs.length >= 12)
          throw new CollectionError(
            'Your collection holds 12 briefs. Remove one before saving another.',
          );
        if (c.briefs.some((b) => b.id === brief.id))
          throw new CollectionError(
            'This brief is already saved. Create a new brief to make another version.',
          );
        c.briefs.unshift(briefSchema.parse(brief));
        return brief.id;
      });
    },
    removeBrief(lease: Lease, id: string) {
      return transaction(lease, (c) => {
        c.briefs = c.briefs.filter((b) => b.id !== id);
      });
    },
    recover(expectedRaw: string) {
      const current = read();
      publish(current);
      if (current.status !== 'corrupt' || current.raw !== expectedRaw)
        throw new CollectionError(
          'The saved collection changed. Review its current state before resetting.',
        );
      const collection = empty();
      const raw = JSON.stringify(collection);
      try {
        storage!.setItem(STORAGE_KEY, raw);
      } catch {
        throw new CollectionError('The collection could not be reset. Browser storage is blocked.');
      }
      publish({ status: 'ready', collection, raw });
    },
  };
}
export type Repository = ReturnType<typeof createRepository>;

export function leaseOf(snapshot: Snapshot): Lease {
  if (snapshot.status !== 'ready') throw new CollectionError(snapshot.message);
  return { generation: snapshot.collection.generation, revision: snapshot.collection.revision };
}
export function withCollectionLock<T>(action: () => T): Promise<T> {
  return typeof navigator !== 'undefined' && navigator.locks
    ? navigator.locks.request('orqensa-collection', () => action())
    : Promise.resolve().then(action);
}
