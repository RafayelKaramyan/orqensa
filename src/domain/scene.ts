import { z } from 'zod';

export const ROOM = { width: 6, depth: 4.5 } as const;
export const materials = {
  oak: { name: 'Warm oak', color: '#bea17a', description: 'A warm grain. A softer rhythm.' },
  limestone: {
    name: 'Pale limestone',
    color: '#c9c8bc',
    description: 'Quiet texture. An open canvas.',
  },
  terrazzo: {
    name: 'Fine terrazzo',
    color: '#aaa99c',
    description: 'Small fragments. A little character.',
  },
} as const;
export const tones = {
  chalk: { name: 'Chalk', wall: '#dfdfd3', fabric: '#ccc7b8' },
  sage: { name: 'Sage', wall: '#a5afa0', fabric: '#75836d' },
  carbon: { name: 'Carbon', wall: '#6c7169', fabric: '#454b48' },
} as const;
export const furniture = {
  sofa: { name: 'Sofa', width: 2.1, depth: 0.85, height: 0.7 },
  table: { name: 'Low table', width: 1.2, depth: 0.65, height: 0.38 },
  chair: { name: 'Lounge chair', width: 0.7, depth: 0.7, height: 0.75 },
  desk: { name: 'Work table', width: 1.5, depth: 0.7, height: 0.74 },
  shelf: { name: 'Low shelf', width: 1.6, depth: 0.4, height: 0.8 },
  plant: { name: 'Plant', width: 0.55, depth: 0.55, height: 1.1 },
} as const;
export type FurnitureKind = keyof typeof furniture;
export type Material = keyof typeof materials;
export type Tone = keyof typeof tones;
export const materialSchema = z.enum(['oak', 'limestone', 'terrazzo']);
export const toneSchema = z.enum(['chalk', 'sage', 'carbon']);
export const lightSchema = z.enum(['day', 'evening']);
const objectSchema = z
  .object({
    id: z.uuid(),
    kind: z.enum(['sofa', 'table', 'chair', 'desk', 'shelf', 'plant']),
    x: z.number().finite(),
    z: z.number().finite(),
    rotation: z.union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)]),
  })
  .strict();
export type RoomObject = z.infer<typeof objectSchema>;
export function footprint(object: RoomObject) {
  const spec = furniture[object.kind];
  return object.rotation % 180
    ? { width: spec.depth, depth: spec.width }
    : { width: spec.width, depth: spec.depth };
}
export function placementProblem(objects: RoomObject[]): string | null {
  for (const [i, object] of objects.entries()) {
    const size = footprint(object);
    if (
      object.x - size.width / 2 < -0.001 ||
      object.x + size.width / 2 > ROOM.width + 0.001 ||
      object.z - size.depth / 2 < -0.001 ||
      object.z + size.depth / 2 > ROOM.depth + 0.001
    )
      return `${furniture[object.kind].name} would be outside the room.`;
    for (const other of objects.slice(i + 1)) {
      const b = footprint(other);
      if (
        Math.abs(object.x - other.x) < (size.width + b.width) / 2 - 0.005 &&
        Math.abs(object.z - other.z) < (size.depth + b.depth) / 2 - 0.005
      )
        return `${furniture[object.kind].name} would overlap ${furniture[other.kind].name.toLowerCase()}.`;
    }
  }
  return null;
}
export const sceneSchema = z
  .object({
    id: z.uuid(),
    title: z.string().trim().min(1).max(70),
    revision: z.number().int().nonnegative(),
    updatedAt: z.iso.datetime(),
    material: materialSchema,
    tone: toneSchema,
    light: lightSchema,
    objects: z.array(objectSchema).max(16),
  })
  .strict()
  .superRefine((scene, context) => {
    if (new Set(scene.objects.map((o) => o.id)).size !== scene.objects.length)
      context.addIssue({ code: 'custom', message: 'Object identifiers must be unique.' });
    const problem = placementProblem(scene.objects);
    if (problem) context.addIssue({ code: 'custom', message: problem });
  });
export type Scene = z.infer<typeof sceneSchema>;
type ObjectSpec = [FurnitureKind, number, number, RoomObject['rotation']?];
export function createScene(
  preset: 'living' | 'work' | 'empty' = 'living',
  title = 'A room of your own',
): Scene {
  const specs: ObjectSpec[] =
    preset === 'living'
      ? [
          ['sofa', 1.45, 3.45],
          ['table', 1.5, 2.3],
          ['chair', 3.05, 3.4],
          ['desk', 4.5, 1.65],
          ['chair', 4.5, 2.55, 180],
          ['shelf', 4.85, 0.5],
          ['plant', 5.5, 3.85],
        ]
      : preset === 'work'
        ? [
            ['desk', 2.3, 1.15],
            ['chair', 2.3, 2.05, 180],
            ['sofa', 1.4, 3.7],
            ['table', 3.9, 3.5],
            ['shelf', 5.3, 2.2, 90],
            ['plant', 5.4, 0.65],
          ]
        : [];
  return sceneSchema.parse({
    id: crypto.randomUUID(),
    title,
    revision: 0,
    updatedAt: new Date().toISOString(),
    material: 'oak',
    tone: 'chalk',
    light: 'day',
    objects: specs.map(([kind, x, z, rotation = 0]) => ({
      id: crypto.randomUUID(),
      kind,
      x,
      z,
      rotation,
    })),
  });
}
export type SceneCommand =
  | { type: 'move'; id: string; x: number; z: number }
  | { type: 'rotate'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'add'; kind: FurnitureKind }
  | { type: 'material'; value: Material }
  | { type: 'tone'; value: Tone }
  | { type: 'light'; value: Scene['light'] }
  | { type: 'title'; value: string }
  | { type: 'restore'; value: Scene };
export const snap = (value: number) => Math.round(value * 10) / 10;
export function applyScene(scene: Scene, command: SceneCommand): Scene {
  let next = structuredClone(scene);
  if (command.type === 'move' || command.type === 'rotate' || command.type === 'remove') {
    const object = next.objects.find((o) => o.id === command.id);
    if (!object) throw new Error('This object is no longer in the room.');
    if (command.type === 'move') {
      object.x = snap(command.x);
      object.z = snap(command.z);
    } else if (command.type === 'rotate')
      object.rotation = ((object.rotation + 90) % 360) as RoomObject['rotation'];
    else next.objects = next.objects.filter((o) => o.id !== command.id);
  } else if (command.type === 'add') {
    if (next.objects.length === 16) throw new Error('A room can hold up to 16 objects.');
    let placed = false;
    const object: RoomObject = {
      id: crypto.randomUUID(),
      kind: command.kind,
      x: 0,
      z: 0,
      rotation: 0,
    };
    for (let z = 0.4; z <= ROOM.depth - 0.3 && !placed; z += 0.2) {
      for (let x = 0.4; x <= ROOM.width - 0.3 && !placed; x += 0.2) {
        object.x = snap(x);
        object.z = snap(z);
        if (!placementProblem([...next.objects, object])) {
          next.objects.push({ ...object });
          placed = true;
        }
      }
    }
    if (!placed)
      throw new Error('There is no clear position for this object. Make a little room first.');
  } else if (command.type === 'title') next.title = command.value.trim();
  else if (command.type === 'restore') next = { ...structuredClone(command.value), id: scene.id };
  else if (command.type === 'material') next.material = command.value;
  else if (command.type === 'tone') next.tone = command.value;
  else if (command.type === 'light') next.light = command.value;
  const problem = placementProblem(next.objects);
  if (problem) throw new Error(problem);
  next.revision = scene.revision + 1;
  next.updatedAt = new Date().toISOString();
  return sceneSchema.parse(next);
}
export function copyScene(scene: Scene, title = `${scene.title.slice(0, 62)} (copy)`): Scene {
  return sceneSchema.parse({
    ...structuredClone(scene),
    id: crypto.randomUUID(),
    title,
    revision: 0,
    updatedAt: new Date().toISOString(),
    objects: scene.objects.map((o) => ({ ...o, id: crypto.randomUUID() })),
  });
}
