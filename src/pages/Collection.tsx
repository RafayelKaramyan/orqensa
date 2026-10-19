import { useRef, useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Download, Plus, Trash2, Upload } from 'lucide-react';
import { useCollection } from '../state/context';
import { leaseOf } from '../domain/repository';
import { copyScene, type Scene } from '../domain/scene';
import { download, exportScene, importScene } from '../domain/transfer';
import { briefText } from '../domain/brief';
import { Dialog, Empty, Eyebrow } from '../components/ui';
import { FloorPlan } from '../components/FloorPlan';
import { StorageState } from '../components/StorageState';
export default function Collection() {
  const { snapshot, repository, perform, busy, notify } = useCollection();
  const navigate = useNavigate();
  const file = useRef<HTMLInputElement>(null);
  const [imported, setImported] = useState<Scene | null>(null);
  const [remove, setRemove] = useState<{
    id: string;
    title: string;
    type: 'scene' | 'brief';
  } | null>(null);
  async function openFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    event.target.value = '';
    if (!selected) return;
    try {
      if (selected.size > 40_000) throw new Error('Choose a room file smaller than 40 KB.');
      setImported(importScene(await selected.text()));
    } catch (error) {
      notify(error instanceof Error ? error.message : 'This room file could not be opened.', true);
    }
  }
  async function keepImported() {
    if (!imported) return;
    const result = await perform(
      () => repository.addScene(leaseOf(snapshot), imported),
      'Imported room saved as a separate copy.',
    );
    if (result.ok) {
      setImported(null);
      navigate(`/lab/${result.value}`);
    }
  }
  return (
    <>
      <section className="page-intro page-pad">
        <Eyebrow>/ Yours, on this browser</Eyebrow>
        <div className="page-intro-row">
          <h1>
            A collection
            <br />
            <span>of possibilities.</span>
          </h1>
          <p>
            Rooms you’ve arranged.
            <br />
            Thoughts you’ve kept.
            <br />
            <span className="muted">Local to this browser. Export to keep a backup.</span>
          </p>
        </div>
      </section>
      <section className="collection-page page-pad">
        <StorageState />
        <div className="collection-toolbar">
          <h2>
            Saved rooms{' '}
            <span className="mono">
              {snapshot.status === 'ready' ? `${snapshot.collection.scenes.length} / 12` : '—'}
            </span>
          </h2>
          <div className="button-row">
            <input
              className="sr-only"
              type="file"
              aria-label="Import an ORQENSA room file"
              accept=".json,application/json"
              ref={file}
              tabIndex={-1}
              onChange={(event) => void openFile(event)}
            />
            <button
              className="button button-outline button-small"
              onClick={() => file.current?.click()}
            >
              <Upload size={15} />
              Import room
            </button>
            <Link className="button button-small" to="/lab?preset=empty">
              <Plus size={16} />
              New room
            </Link>
          </div>
        </div>
        {snapshot.status === 'ready' &&
          (snapshot.collection.scenes.length ? (
            <div className="saved-rooms">
              {snapshot.collection.scenes.map((scene) => (
                <article className="saved-room" key={scene.id}>
                  <Link
                    to={`/lab/${scene.id}`}
                    aria-label={`Open ${scene.title}`}
                    className="saved-room-plan"
                  >
                    <FloorPlan scene={scene} compact />
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                  <div className="saved-room-title">
                    <h3>
                      <Link to={`/lab/${scene.id}`}>{scene.title}</Link>
                    </h3>
                    <span className="mono">{scene.objects.length} objects / 27 m²</span>
                  </div>
                  <div className="saved-room-actions">
                    <button
                      disabled={busy}
                      onClick={() =>
                        void perform(
                          () => repository.addScene(leaseOf(snapshot), copyScene(scene)),
                          'A separate room copy is saved.',
                        )
                      }
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() =>
                        download(exportScene(scene), 'orqensa-room.json', 'application/json')
                      }
                    >
                      Export
                    </button>
                    <button
                      aria-label={`Remove ${scene.title}`}
                      onClick={() => setRemove({ id: scene.id, title: scene.title, type: 'scene' })}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <Empty title="A little room for your first idea.">
              <p>
                Start with a plan. Move a few things around. Save the arrangement when it feels
                right.
              </p>
              <Link to="/lab" className="arrow-link">
                Enter the space lab <ArrowUpRight size={17} />
              </Link>
            </Empty>
          ))}
        <div className="collection-toolbar briefs-toolbar">
          <h2>
            Project briefs{' '}
            <span className="mono">
              {snapshot.status === 'ready' ? `${snapshot.collection.briefs.length} / 12` : '—'}
            </span>
          </h2>
          <Link className="text-button" to="/brief">
            Build a brief <Plus size={16} />
          </Link>
        </div>
        {snapshot.status === 'ready' &&
          (snapshot.collection.briefs.length ? (
            <div className="saved-briefs">
              {snapshot.collection.briefs.map((brief) => (
                <article key={brief.id}>
                  <div>
                    <span className="mono">
                      {brief.kind} / {brief.area} m²
                    </span>
                    <h3>{brief.title}</h3>
                    <p>{brief.priorities.join(' · ')}</p>
                  </div>
                  <div className="button-row">
                    <Link to={`/brief?read=${brief.id}`} className="text-button">
                      Read brief ↗
                    </Link>
                    <button
                      className="icon-button"
                      aria-label={`Download ${brief.title}`}
                      onClick={() => download(briefText(brief), 'orqensa-brief.txt')}
                    >
                      <Download size={17} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Remove brief ${brief.title}`}
                      onClick={() => setRemove({ id: brief.id, title: brief.title, type: 'brief' })}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="brief-empty">
              No briefs saved yet. A few clear thoughts are a good place to start.
            </p>
          ))}
        <p className="disclosure">
          Saved rooms and briefs live in this browser’s local storage. Clearing site data removes
          them. Use room exports and brief downloads to keep an independent copy.
        </p>
      </section>
      {imported && (
        <Dialog title="A new possibility." onClose={() => setImported(null)}>
          <p>
            Preview “{imported.title}”. Saving creates a separate room with new identifiers and
            leaves your existing rooms intact.
          </p>
          <FloorPlan scene={imported} compact />
          <button className="button" disabled={busy} onClick={() => void keepImported()}>
            Save this room copy <Plus size={16} />
          </button>
        </Dialog>
      )}
      {remove && (
        <Dialog
          title={`Remove this ${remove.type === 'scene' ? 'room' : 'brief'}?`}
          onClose={() => setRemove(null)}
        >
          <p>
            “{remove.title}” will be removed from this browser. Download a copy first if you want to
            keep it.
          </p>
          <div className="button-row">
            <button
              className="button"
              disabled={busy}
              onClick={() =>
                void perform(() => {
                  const lease = leaseOf(snapshot);
                  if (remove.type === 'scene') repository.removeScene(lease, remove.id);
                  else repository.removeBrief(lease, remove.id);
                }, 'Removed from your collection.').then((result) => {
                  if (result.ok) setRemove(null);
                })
              }
            >
              Remove from collection
            </button>
            <button className="text-button" onClick={() => setRemove(null)}>
              Keep it
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
