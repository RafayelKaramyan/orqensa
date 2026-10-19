import { useId, useRef, useState, type PointerEvent, type KeyboardEvent } from 'react';
import {
  furniture,
  materials,
  placementProblem,
  snap,
  tones,
  type RoomObject,
  type Scene,
} from '../domain/scene';
type Props = {
  scene: Scene;
  selected?: string | null;
  onSelect?: (id: string) => void;
  onMove?: (id: string, x: number, z: number, revision: number) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  compact?: boolean;
};
type Drag = {
  id: string;
  x: number;
  z: number;
  offsetX: number;
  offsetZ: number;
  revision: number;
  originalX: number;
  originalZ: number;
};
export function FloorPlan({
  scene,
  selected,
  onSelect,
  onMove,
  onError,
  disabled = false,
  compact = false,
}: Props) {
  const prefix = useId().replaceAll(':', '');
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<Drag | null>(null);
  const [ghost, setGhost] = useState<{ id: string; x: number; z: number; valid: boolean } | null>(
    null,
  );
  const interactive = Boolean(onMove);
  function point(event: PointerEvent) {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return null;
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { x: (p.x - 70) / 100, z: (p.y - 70) / 100 };
  }
  function down(event: PointerEvent<SVGGElement>, object: RoomObject) {
    if (!interactive || disabled || event.button !== 0) return;
    const p = point(event);
    if (!p) return;
    onSelect?.(object.id);
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      id: object.id,
      x: object.x,
      z: object.z,
      offsetX: object.x - p.x,
      offsetZ: object.z - p.z,
      revision: scene.revision,
      originalX: object.x,
      originalZ: object.z,
    };
  }
  function move(event: PointerEvent<SVGGElement>) {
    const start = drag.current;
    const p = point(event);
    if (!start || !p) return;
    start.x = snap(p.x + start.offsetX);
    start.z = snap(p.z + start.offsetZ);
    const objects = scene.objects.map((o) =>
      o.id === start.id ? { ...o, x: start.x, z: start.z } : o,
    );
    setGhost({ id: start.id, x: start.x, z: start.z, valid: !placementProblem(objects) });
  }
  function up() {
    const start = drag.current;
    drag.current = null;
    setGhost(null);
    if (!start) return;
    if (Math.abs(start.x - start.originalX) < 0.01 && Math.abs(start.z - start.originalZ) < 0.01)
      return;
    const problem = placementProblem(
      scene.objects.map((o) => (o.id === start.id ? { ...o, x: start.x, z: start.z } : o)),
    );
    if (problem) onError?.(problem);
    else onMove?.(start.id, start.x, start.z, start.revision);
  }
  function key(event: KeyboardEvent<SVGGElement>, object: RoomObject) {
    if (disabled || !interactive) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect?.(object.id);
      return;
    }
    const vectors: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const vector = vectors[event.key];
    if (!vector) return;
    event.preventDefault();
    onSelect?.(object.id);
    const step = event.shiftKey ? 0.5 : 0.1;
    onMove?.(
      object.id,
      snap(object.x + vector[0] * step),
      snap(object.z + vector[1] * step),
      scene.revision,
    );
  }
  return (
    <svg
      ref={svg}
      className={`floor-plan ${compact ? 'floor-plan-compact' : ''}`}
      viewBox="0 0 740 590"
      role={interactive ? 'group' : 'img'}
      aria-labelledby={`${prefix}-title ${prefix}-desc`}
    >
      <title id={`${prefix}-title`}>{scene.title} — floor plan</title>
      <desc id={`${prefix}-desc`}>
        {interactive
          ? 'Select furniture, then use arrow keys to move by 0.1 metres. Hold Shift for 0.5 metres. Objects stay inside the room without overlapping. You can also use the position controls below.'
          : 'A six by four and a half metre room with a furniture layout.'}
      </desc>
      <defs>
        <pattern id={`${prefix}-grid`} width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M50 0H0v50" fill="none" stroke="#242924" strokeOpacity=".14" strokeWidth=".7" />
        </pattern>
        <pattern id={`${prefix}-oak`} width="24" height="450" patternUnits="userSpaceOnUse">
          <path d="M0 0v450m12-450v450" stroke="#775f43" strokeOpacity=".16" strokeWidth=".8" />
        </pattern>
        <pattern id={`${prefix}-terrazzo`} width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="m7 7 3-2 2 4-3 2Zm15 14 4-1 1 3-4 1Z" fill="#5c645b" fillOpacity=".2" />
          <circle cx="9" cy="25" r="1.3" fill="#eeeae1" />
        </pattern>
      </defs>
      <path
        d="M70 41h600m-600-7v14m600-14v14m27 22v450m-7-450h14m-14 450h14"
        stroke="currentColor"
        strokeWidth=".7"
      />
      <text x="370" y="28" textAnchor="middle" className="plan-dimension">
        6.00 m
      </text>
      <text
        x="717"
        y="300"
        textAnchor="middle"
        transform="rotate(90 717 300)"
        className="plan-dimension"
      >
        4.50 m
      </text>
      <rect
        x="70"
        y="70"
        width="600"
        height="450"
        fill={materials[scene.material].color}
        stroke="#242924"
        strokeWidth="6"
      />
      {scene.material !== 'limestone' && (
        <rect x="73" y="73" width="594" height="444" fill={`url(#${prefix}-${scene.material})`} />
      )}
      <rect x="73" y="73" width="594" height="444" fill={`url(#${prefix}-grid)`} />
      <path d="M670 130v175" stroke="#eeede7" strokeWidth="10" />
      <path d="M668 130v175m5-175v175" stroke="#242924" strokeWidth="1" />
      {scene.objects.map((object) => {
        const f = furniture[object.kind];
        const active = selected === object.id;
        const g = ghost?.id === object.id ? ghost : null;
        return (
          <g
            key={object.id}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={
              interactive
                ? `${f.name}, X ${object.x.toFixed(1)}, Y ${object.z.toFixed(1)} metres, ${object.rotation} degrees`
                : undefined
            }
            aria-pressed={interactive ? active : undefined}
            aria-disabled={interactive ? disabled : undefined}
            transform={`translate(${70 + (g?.x ?? object.x) * 100} ${70 + (g?.z ?? object.z) * 100}) rotate(${object.rotation})`}
            className={`plan-object ${active ? 'is-selected' : ''} ${g && !g.valid ? 'is-invalid' : ''}`}
            style={
              interactive ? { touchAction: 'none', cursor: disabled ? 'wait' : 'grab' } : undefined
            }
            onPointerDown={(event) => down(event, object)}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={() => {
              drag.current = null;
              setGhost(null);
            }}
            onKeyDown={(event) => key(event, object)}
            onClick={() => !disabled && onSelect?.(object.id)}
          >
            <rect
              className="object-outline"
              x={-f.width * 50 - 5}
              y={-f.depth * 50 - 5}
              width={f.width * 100 + 10}
              height={f.depth * 100 + 10}
              rx="6"
              fill="none"
              stroke="var(--blue)"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            {object.kind === 'plant' ? (
              <>
                <circle r="26" fill="#7f906b" stroke="#242924" />
                <path
                  d="m-15-15 30 30m-30 0 30-30M0-21v42m-21-21h42"
                  stroke="#44513b"
                  strokeWidth="1.5"
                />
              </>
            ) : (
              <>
                <rect
                  x={-f.width * 50}
                  y={-f.depth * 50}
                  width={f.width * 100}
                  height={f.depth * 100}
                  rx={object.kind === 'table' ? 14 : 4}
                  fill={
                    object.kind === 'desk' || object.kind === 'shelf' || object.kind === 'table'
                      ? '#d8c6a7'
                      : tones[scene.tone].fabric
                  }
                  stroke="#242924"
                  strokeWidth="1.3"
                />
                {(object.kind === 'sofa' || object.kind === 'chair') && (
                  <path
                    d={`M${-f.width * 50 + 8} ${f.depth * 50 - 9}V${-f.depth * 50 + 10}H${f.width * 50 - 8}V${f.depth * 50 - 9}`}
                    fill="none"
                    stroke="#242924"
                    strokeWidth="1"
                  />
                )}
                {object.kind === 'sofa' && (
                  <path d="M-35-32v65m70-65v65" stroke="#242924" strokeWidth=".8" />
                )}
                {object.kind === 'shelf' && (
                  <path
                    d="M-45-15v30m30-30v30m30-30v30m30-30v30"
                    stroke="#242924"
                    strokeWidth=".8"
                  />
                )}
              </>
            )}
            {!compact && (
              <text
                textAnchor="middle"
                y={object.kind === 'plant' ? 42 : f.depth * 50 + 17}
                className="object-label"
                transform={object.rotation === 180 ? 'rotate(180)' : undefined}
              >
                {f.name}
              </text>
            )}
          </g>
        );
      })}
      <text x="70" y="560" className="plan-dimension">
        27 m² / {materials[scene.material].name.toUpperCase()}
      </text>
      <path d="M590 556h80m-80-4v8m80-8v8" stroke="currentColor" strokeWidth="1" />
      <text x="630" y="578" textAnchor="middle" className="plan-dimension">
        0.8 m
      </text>
    </svg>
  );
}
