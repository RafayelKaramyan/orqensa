import { z } from 'zod';
import { materials, sceneSchema } from './scene';
export const priorities = [
  'Natural light',
  'More storage',
  'A quiet corner',
  'Room to change',
] as const;
export const briefSchema = z
  .object({
    id: z.uuid(),
    title: z.string().trim().min(3).max(70),
    kind: z.enum(['A home', 'A workspace', 'A shared place']),
    area: z.number().int().min(12).max(500),
    priorities: z.array(z.enum(priorities)).min(1).max(4),
    notes: z.string().trim().max(600),
    layout: sceneSchema.nullable(),
    updatedAt: z.iso.datetime(),
  })
  .strict()
  .superRefine((b, ctx) => {
    if (new Set(b.priorities).size !== b.priorities.length)
      ctx.addIssue({ code: 'custom', message: 'Choose each priority once.' });
  });
export type Brief = z.infer<typeof briefSchema>;
export function briefText(brief: Brief) {
  const b = briefSchema.parse(brief);
  return `ORQENSA / Project brief\n\n${b.title}\n${b.kind} · ${b.area} m²\n\nPRIORITIES\n${b.priorities.map((p) => `— ${p}`).join('\n')}\n\nNOTES\n${b.notes || 'No additional notes.'}\n\n${b.layout ? `SPATIAL STUDY\n${b.layout.title}\nRoom: 6 × 4.5 m\nFloor: ${materials[b.layout.material].name}\nObjects: ${b.layout.objects.length}\n` : 'No layout attached.\n'}\nPrepared as a local portfolio concept. This file has not been sent to a studio. Room drawings are illustrative spatial studies, not construction documents.\n`;
}
