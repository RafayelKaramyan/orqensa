import { describe, expect, it } from 'vitest';
import { exportScene, importScene, readShare, sceneSvg, shareToken } from './transfer';
import { createScene } from './scene';
import { briefSchema, briefText } from './brief';
describe('portable rooms', () => {
  it('imports a validated copy without reusing identifiers', () => {
    const s = createScene();
    const imported = importScene(exportScene(s));
    expect(imported.id).not.toBe(s.id);
    expect(imported.title).toBe(s.title);
    expect(imported.objects.map((o) => o.kind)).toEqual(s.objects.map((o) => o.kind));
  });
  it('round trips Unicode titles through URL-safe snapshots', () => {
    const s = createScene('work', 'Տուն & café / 東京');
    const token = shareToken(s);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(readShare(token).title).toBe(s.title);
  });
  it.each(['', '<script>', 'a'.repeat(12001), '%%%'])(
    'rejects malformed sharing input',
    (token) => {
      expect(() => readShare(token)).toThrow('shared room');
    },
  );
  it('rejects future formats, extra fields and invalid geometry', () => {
    const data = JSON.parse(exportScene(createScene())) as Record<string, unknown>;
    expect(() => importScene(JSON.stringify({ ...data, version: 2 }))).toThrow('valid ORQENSA');
    expect(() => importScene(JSON.stringify({ ...data, script: 'x' }))).toThrow();
    const s = createScene();
    s.objects[0]!.x = -9;
    expect(() => importScene(JSON.stringify({ ...data, scene: s }))).toThrow();
  });
  it('limits the size of room imports', () => {
    expect(() => importScene(' '.repeat(40001))).toThrow('40 KB');
  });
  it('escapes user content in standalone SVG drawings', () => {
    const svg = sceneSvg(createScene('empty', '<script>&"test"'));
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;&amp;&quot;test&quot;');
    expect(svg).toContain('viewBox="0 0 740 650"');
  });
});
describe('project briefs', () => {
  const value = () => ({
    id: crypto.randomUUID(),
    title: 'A quiet place',
    kind: 'A home',
    area: 80,
    priorities: ['Natural light'],
    notes: '',
    layout: createScene(),
    updatedAt: new Date().toISOString(),
  });
  it('exports an attached snapshot and accurately describes delivery', () => {
    const text = briefText(briefSchema.parse(value()));
    expect(text).toContain('6 × 4.5 m');
    expect(text).toContain('has not been sent');
    expect(text).toContain('Natural light');
  });
  it('validates area, title and at least one unique priority', () => {
    expect(briefSchema.safeParse({ ...value(), area: 11 }).success).toBe(false);
    expect(briefSchema.safeParse({ ...value(), area: 12.5 }).success).toBe(false);
    expect(briefSchema.safeParse({ ...value(), title: ' ' }).success).toBe(false);
    expect(briefSchema.safeParse({ ...value(), priorities: [] }).success).toBe(false);
    expect(
      briefSchema.safeParse({ ...value(), priorities: ['Natural light', 'Natural light'] }).success,
    ).toBe(false);
  });
});
