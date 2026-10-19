import { Component, lazy, Suspense, useRef, useState, type ReactNode } from 'react';
import {
  Check,
  ChevronDown,
  Download,
  Moon,
  Pencil,
  Plus,
  Redo2,
  RotateCw,
  Save,
  Share2,
  Sun,
  Trash2,
  Undo2,
} from 'lucide-react';
import {
  furniture,
  materials,
  tones,
  type Scene,
  type SceneCommand,
  type FurnitureKind,
  type Material,
  type Tone,
} from '../domain/scene';
import { download, exportScene, sceneSvg, shareToken } from '../domain/transfer';
import { useCollection } from '../state/context';
import { FloorPlan } from './FloorPlan';
import { Dialog } from './ui';
const ThreeRoom = lazy(() => import('./ThreeRoom'));
class ViewBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="view-unavailable">
        <h3>The 3D view is unavailable.</h3>
        <p>
          Switch to the floor plan to keep arranging your room. All controls and exports still work.
        </p>
      </div>
    ) : (
      this.props.children
    );
  }
}
type Props = {
  scene: Scene;
  saved: boolean;
  onChange: (command: SceneCommand, revision: number) => Promise<boolean>;
  onSave?: () => Promise<void>;
};
type History = { past: Scene[]; future: Scene[]; revision: number };
export function RoomEditor({ scene, saved, onChange, onSave }: Props) {
  const { busy, notify } = useCollection();
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<'plan' | '3d'>('plan');
  const [angle, setAngle] = useState(40);
  const [modal, setModal] = useState<'name' | 'share' | 'export' | null>(null);
  const [name, setName] = useState(scene.title);
  const [history, setHistory] = useState<History>({
    past: [],
    future: [],
    revision: scene.revision,
  });
  const committing = useRef(false);
  const object = scene.objects.find((o) => o.id === selected);
  const historyCurrent = history.revision === scene.revision;
  async function commit(command: SceneCommand, revision = scene.revision) {
    if (busy || committing.current) return false;
    committing.current = true;
    const before = structuredClone(scene);
    try {
      const success = await onChange(command, revision);
      if (success) {
        setHistory({
          past: [...(historyCurrent ? history.past : []), before].slice(-30),
          future: [],
          revision: scene.revision + 1,
        });
      }
      return success;
    } finally {
      committing.current = false;
    }
  }
  async function travel(direction: 'undo' | 'redo') {
    if (!historyCurrent || committing.current || busy) return;
    const target = direction === 'undo' ? history.past.at(-1) : history.future[0];
    if (!target) return;
    committing.current = true;
    try {
      if (await onChange({ type: 'restore', value: target }, scene.revision))
        setHistory(
          direction === 'undo'
            ? {
                past: history.past.slice(0, -1),
                future: [scene, ...history.future],
                revision: scene.revision + 1,
              }
            : {
                past: [...history.past, scene],
                future: history.future.slice(1),
                revision: scene.revision + 1,
              },
        );
    } finally {
      committing.current = false;
    }
  }
  const shareUrl = `${location.origin}${location.pathname}#/share?room=${shareToken(scene)}`;
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      notify('Room link copied. Anyone with this link can preview this snapshot.');
    } catch {
      notify('Select and copy the link below. Clipboard access was unavailable.', true);
    }
  }
  function switchView(next: 'plan' | '3d') {
    if (next === '3d') {
      try {
        const context = document.createElement('canvas').getContext('webgl2');
        if (!context) throw new Error();
        context.getExtension('WEBGL_lose_context')?.loseContext();
      } catch {
        notify(
          '3D is unavailable in this browser. The floor plan and all room controls are ready to use.',
          true,
        );
        return;
      }
    }
    setView(next);
  }
  return (
    <div className="room-editor">
      <div className="editor-topbar">
        <div>
          <span className="eyebrow">
            {saved ? 'Saved on this browser' : 'An unsaved exploration'}
          </span>
          <div className="room-title">
            <h2>{scene.title}</h2>
            <button
              className="icon-button"
              aria-label="Rename room"
              onClick={() => {
                setName(scene.title);
                setModal('name');
              }}
            >
              <Pencil size={16} />
            </button>
          </div>
        </div>
        <div className="editor-actions">
          <button
            className="icon-button"
            aria-label="Undo last change"
            disabled={!historyCurrent || !history.past.length || busy}
            onClick={() => void travel('undo')}
          >
            <Undo2 size={18} />
          </button>
          <button
            className="icon-button"
            aria-label="Redo last change"
            disabled={!historyCurrent || !history.future.length || busy}
            onClick={() => void travel('redo')}
          >
            <Redo2 size={18} />
          </button>
          <span className="toolbar-divider" />
          <button
            className="icon-button"
            aria-label="Share a room snapshot"
            onClick={() => setModal('share')}
          >
            <Share2 size={18} />
          </button>
          <button
            className="icon-button"
            aria-label="Export room"
            onClick={() => setModal('export')}
          >
            <Download size={19} />
          </button>
          {!saved && (
            <button className="button button-small" disabled={busy} onClick={() => void onSave?.()}>
              <Save size={15} />
              Save room
            </button>
          )}
          {saved && (
            <span className="saved-indicator mono">
              <Check size={13} />
              {busy ? 'Saving…' : 'Saved locally'}
            </span>
          )}
        </div>
      </div>
      <div className="editor-body">
        <aside className="material-panel">
          <span className="eyebrow">/01 — Atmosphere</span>
          <fieldset disabled={busy}>
            <legend>Floor finish</legend>
            <div className="editor-swatches">
              {Object.entries(materials).map(([key, value]) => (
                <button
                  key={key}
                  aria-pressed={scene.material === key}
                  onClick={() => void commit({ type: 'material', value: key as Material })}
                >
                  <span className={`swatch texture-${key}`} />
                  <span>{value.name}</span>
                  {scene.material === key && <Check size={13} />}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset disabled={busy}>
            <legend>Wall & upholstery</legend>
            <div className="editor-tones">
              {Object.entries(tones).map(([key, value]) => (
                <button
                  key={key}
                  aria-label={`${value.name} tone`}
                  aria-pressed={scene.tone === key}
                  onClick={() => void commit({ type: 'tone', value: key as Tone })}
                >
                  <i style={{ background: value.wall }} />
                  <span>{value.name}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset disabled={busy}>
            <legend>Light in the 3D study</legend>
            <div className="segmented light-toggle">
              <button
                aria-pressed={scene.light === 'day'}
                onClick={() => void commit({ type: 'light', value: 'day' })}
              >
                <Sun size={14} />
                Day
              </button>
              <button
                aria-pressed={scene.light === 'evening'}
                onClick={() => void commit({ type: 'light', value: 'evening' })}
              >
                <Moon size={14} />
                Evening
              </button>
            </div>
          </fieldset>
          <div className="panel-foot">
            <span className="mono">27 m² / 6 × 4.5 m</span>
            <p>
              A fixed room.
              <br />
              An open arrangement.
            </p>
          </div>
        </aside>
        <div className="editor-canvas">
          <div className="canvas-toolbar">
            <div className="segmented" aria-label="Room view">
              <button aria-pressed={view === 'plan'} onClick={() => switchView('plan')}>
                Floor plan
              </button>
              <button aria-pressed={view === '3d'} onClick={() => switchView('3d')}>
                3D study
              </button>
            </div>
            <span className="mono">
              {view === 'plan' ? 'MOVE / ROTATE / MAKE ROOM' : 'ISOMETRIC / ILLUSTRATIVE'}
            </span>
            {view === '3d' && (
              <button
                className="icon-button"
                aria-label="Rotate 3D viewpoint"
                onClick={() => setAngle(angle + 90)}
              >
                <RotateCw size={17} />
              </button>
            )}
          </div>
          {view === 'plan' ? (
            <FloorPlan
              scene={scene}
              selected={selected}
              onSelect={setSelected}
              onMove={(id, x, z, revision) => {
                void commit({ type: 'move', id, x, z }, revision);
              }}
              onError={(message) => notify(message, true)}
              disabled={busy}
            />
          ) : (
            <ViewBoundary>
              <Suspense
                fallback={
                  <div className="view-loading" role="status">
                    Building the spatial study…
                  </div>
                }
              >
                <ThreeRoom
                  scene={scene}
                  angle={angle}
                  onUnavailable={() => {
                    setView('plan');
                    notify(
                      'The browser released the 3D view. Your room is intact in the floor plan.',
                      true,
                    );
                  }}
                />
              </Suspense>
            </ViewBoundary>
          )}
          <div className="canvas-caption">
            <span className="mono">
              {view === 'plan'
                ? '0.1 m snap / Arrow keys to move'
                : `${materials[scene.material].name} / ${tones[scene.tone].name} / ${scene.light}`}
            </span>
            <span>Illustrative. Not a construction drawing.</span>
          </div>
        </div>
        <aside className="object-panel">
          <span className="eyebrow">/02 — Make it yours</span>
          <div className="add-object">
            <label htmlFor="add-furniture">Add an object</label>
            <div className="select-with-icon">
              <select
                id="add-furniture"
                disabled={busy}
                value=""
                onChange={(event) => {
                  if (event.target.value)
                    void commit({ type: 'add', kind: event.target.value as FurnitureKind });
                }}
              >
                <option value="">Choose furniture…</option>
                {Object.entries(furniture).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.name}
                  </option>
                ))}
              </select>
              <Plus size={15} />
            </div>
            <p>Up to 16 objects. Clear positions are found automatically.</p>
          </div>
          <div className="object-inspector">
            <h3>{object ? furniture[object.kind].name : 'Select an object'}</h3>
            {object ? (
              <>
                <span className="mono">
                  {furniture[object.kind].width} × {furniture[object.kind].depth} m /{' '}
                  {object.rotation}°
                </span>
                <fieldset className="position-fields" disabled={busy}>
                  <legend>Move by 0.1 m</legend>
                  <div>
                    <span>X position</span>
                    <button
                      aria-label="Move selected object left"
                      onClick={() =>
                        void commit({ type: 'move', id: object.id, x: object.x - 0.1, z: object.z })
                      }
                    >
                      −
                    </button>
                    <output aria-label="X position">{object.x.toFixed(1)}</output>
                    <button
                      aria-label="Move selected object right"
                      onClick={() =>
                        void commit({ type: 'move', id: object.id, x: object.x + 0.1, z: object.z })
                      }
                    >
                      ＋
                    </button>
                  </div>
                  <div>
                    <span>Y position</span>
                    <button
                      aria-label="Move selected object up"
                      onClick={() =>
                        void commit({ type: 'move', id: object.id, x: object.x, z: object.z - 0.1 })
                      }
                    >
                      −
                    </button>
                    <output aria-label="Y position">{object.z.toFixed(1)}</output>
                    <button
                      aria-label="Move selected object down"
                      onClick={() =>
                        void commit({ type: 'move', id: object.id, x: object.x, z: object.z + 0.1 })
                      }
                    >
                      ＋
                    </button>
                  </div>
                </fieldset>
                <div className="object-buttons">
                  <button
                    disabled={busy}
                    onClick={() => void commit({ type: 'rotate', id: object.id })}
                  >
                    <RotateCw size={14} />
                    Rotate 90°
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => void commit({ type: 'remove', id: object.id })}
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
              </>
            ) : (
              <p>
                Choose a piece in the plan, or select one below. Then move, rotate or remove it.
              </p>
            )}
          </div>
          <div className="object-list">
            <h3>
              In this room{' '}
              <span className="mono">{scene.objects.length.toString().padStart(2, '0')}</span>
            </h3>
            {scene.objects.length ? (
              scene.objects.map((o, i) => (
                <button
                  key={o.id}
                  aria-pressed={selected === o.id}
                  onClick={() => setSelected(o.id)}
                >
                  <span className="mono">{(i + 1).toString().padStart(2, '0')}</span>
                  {furniture[o.kind].name}
                  <ChevronDown size={12} />
                </button>
              ))
            ) : (
              <p>A clear floor. Add your first object.</p>
            )}
          </div>
        </aside>
      </div>
      <div className="editor-instructions">
        <p>
          <strong>Make a move.</strong> Drag furniture on the plan, or select an object and use the
          arrow keys. Hold Shift for a 0.5 m step. The position controls offer the same movement.
        </p>
        <p>
          Changes to a saved room are stored on this browser. The 3D study shows the same
          arrangement from above.
        </p>
      </div>
      {modal === 'name' && (
        <Dialog title="Give this room a name." onClose={() => setModal(null)}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void commit({ type: 'title', value: name }).then((ok) => {
                if (ok) setModal(null);
              });
            }}
          >
            <label htmlFor="room-name">Room name</label>
            <input
              id="room-name"
              required
              maxLength={70}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
            />
            <button className="button" disabled={busy || !name.trim()}>
              Keep this name <Check size={16} />
            </button>
          </form>
        </Dialog>
      )}
      {modal === 'share' && (
        <Dialog title="A room worth sharing." onClose={() => setModal(null)}>
          <p>
            This link contains a snapshot of your room and its name. Anyone with the link can view
            it and save a separate copy. Future edits do not change this snapshot.
          </p>
          <label htmlFor="share-url">Room link</label>
          <textarea
            id="share-url"
            readOnly
            rows={3}
            value={shareUrl}
            onFocus={(event) => event.target.select()}
          />
          <button className="button" onClick={() => void copyLink()}>
            Copy room link <Share2 size={15} />
          </button>
        </Dialog>
      )}
      {modal === 'export' && (
        <Dialog title="Take the plan with you." onClose={() => setModal(null)}>
          <p>
            Keep an editable room file, or download a standalone drawing. Both include the room as
            it is now.
          </p>
          <div className="export-options">
            <button
              onClick={() => {
                download(exportScene(scene), 'orqensa-room.json', 'application/json');
                notify('Room file prepared for download.');
              }}
            >
              <strong>Editable room file</strong>
              <span>
                JSON / Import it to another browser <Download size={16} />
              </span>
            </button>
            <button
              onClick={() => {
                download(sceneSvg(scene), 'orqensa-plan.svg', 'image/svg+xml');
                notify('Plan drawing prepared for download.');
              }}
            >
              <strong>Room drawing</strong>
              <span>
                SVG / Opens without this website <Download size={16} />
              </span>
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
