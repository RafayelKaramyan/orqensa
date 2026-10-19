import { z } from 'zod';
import { copyScene, furniture, materials, ROOM, sceneSchema, tones, type Scene } from './scene';
const transferSchema = z
  .object({ format: z.literal('orqensa-space'), version: z.literal(1), scene: sceneSchema })
  .strict();
export function exportScene(scene: Scene) {
  return JSON.stringify(
    transferSchema.parse({ format: 'orqensa-space', version: 1, scene }),
    null,
    2,
  );
}
export function importScene(value: string): Scene {
  if (value.length > 40_000) throw new Error('Choose a room file smaller than 40 KB.');
  try {
    const { scene } = transferSchema.parse(JSON.parse(value));
    return copyScene(scene, scene.title);
  } catch {
    throw new Error('This is not a valid ORQENSA room file. Your saved rooms are unchanged.');
  }
}
export function shareToken(scene: Scene) {
  const bytes = new TextEncoder().encode(exportScene(scene));
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
}
export function readShare(token: string) {
  if (token.length > 12_000 || !/^[A-Za-z0-9_-]+$/.test(token))
    throw new Error('This shared room could not be opened.');
  try {
    return importScene(
      new TextDecoder('utf-8', { fatal: true }).decode(
        Uint8Array.from(atob(token.replaceAll('-', '+').replaceAll('_', '/')), (c) =>
          c.charCodeAt(0),
        ),
      ),
    );
  } catch {
    throw new Error(
      'This shared room could not be opened. Ask for a new link or import a room file.',
    );
  }
}
export function download(content: string, name: string, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const xml = (v: string) =>
  v.replace(
    /[<>&"']/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!,
  );
export function sceneSvg(scene: Scene) {
  const s = sceneSchema.parse(scene);
  const objects = s.objects
    .map((o) => {
      const f = furniture[o.kind];
      return `<g transform="translate(${70 + o.x * 100} ${100 + o.z * 100}) rotate(${o.rotation})"><rect x="${-f.width * 50}" y="${-f.depth * 50}" width="${f.width * 100}" height="${f.depth * 100}" rx="4" fill="${o.kind === 'plant' ? '#8a9878' : tones[s.tone].fabric}" stroke="#30362e" stroke-width="1.5"/><text text-anchor="middle" dy="4" font-family="sans-serif" font-size="10" fill="#20261f">${xml(f.name)}</text></g>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 650" role="img"><title>${xml(s.title)}</title><rect width="740" height="650" fill="#eeede7"/><text x="70" y="42" font-family="sans-serif" font-size="22" fill="#242924">${xml(s.title)}</text><text x="70" y="68" font-family="monospace" font-size="10" fill="#4d574e">ORQENSA / ${ROOM.width} × ${ROOM.depth} m / ${materials[s.material].name}</text><rect x="70" y="100" width="600" height="450" fill="${materials[s.material].color}" stroke="#242924" stroke-width="5"/>${objects}<text x="70" y="588" font-family="monospace" font-size="10" fill="#4d574e">Illustrative spatial study. Not a construction drawing.</text><text x="70" y="610" font-family="monospace" font-size="10" fill="#4d574e">Reference dimensions only. No structural or access assessment.</text></svg>`;
}
