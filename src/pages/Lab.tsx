import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Eyebrow } from '../components/ui';
import { RoomEditor } from '../components/RoomEditor';
import {
  applyScene,
  createScene,
  materialSchema,
  toneSchema,
  type SceneCommand,
} from '../domain/scene';
import { leaseOf } from '../domain/repository';
import { useCollection } from '../state/context';
import { StorageState } from '../components/StorageState';
export default function Lab() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { snapshot } = useCollection();
  if (id) {
    if (snapshot.status !== 'ready')
      return (
        <section className="page-pad collection-page">
          <StorageState />
        </section>
      );
    const scene = snapshot.collection.scenes.find((s) => s.id === id);
    if (!scene)
      return (
        <section className="page-pad not-found">
          <Eyebrow>/ A room has moved on</Eyebrow>
          <h1>
            This room
            <br />
            isn’t saved here.
          </h1>
          <p>It may have been removed, or saved on another browser.</p>
          <Link className="button" to="/collection">
            Open your collection <ArrowUpRight size={17} />
          </Link>
        </section>
      );
    return <LabContent key={id} id={id} />;
  }
  return (
    <LabContent
      key={`draft-${params.get('floor')}-${params.get('tone')}-${params.get('preset')}`}
    />
  );
}
function LabContent({ id }: { id?: string }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { snapshot, repository, perform, notify } = useCollection();
  const [draft, setDraft] = useState(() => {
    const preset = params.get('preset');
    let scene = createScene(preset === 'work' || preset === 'empty' ? preset : 'living');
    const floor = materialSchema.safeParse(params.get('floor'));
    const tone = toneSchema.safeParse(params.get('tone'));
    if (floor.success) scene = { ...scene, material: floor.data };
    if (tone.success) scene = { ...scene, tone: tone.data };
    return scene;
  });
  const saved =
    id && snapshot.status === 'ready' ? snapshot.collection.scenes.find((s) => s.id === id) : null;
  const scene = saved ?? draft;
  async function change(command: SceneCommand, revision: number) {
    if (!id) {
      try {
        if (draft.revision !== revision)
          throw new Error('The room has changed. Try your move again.');
        const next = applyScene(draft, command);
        setDraft(next);
        return true;
      } catch (error) {
        notify(error instanceof Error ? error.message : 'This move could not be made.', true);
        return false;
      }
    }
    const result = await perform(() =>
      repository.updateScene(leaseOf(snapshot), id, revision, command),
    );
    return result.ok;
  }
  async function save() {
    const result = await perform(
      () => repository.addScene(leaseOf(snapshot), scene),
      'Room saved on this browser. Your changes will now save as you go.',
    );
    if (result.ok) navigate(`/lab/${result.value}`);
  }
  return (
    <section className="lab-page">
      <div className="lab-heading page-pad">
        <div>
          <Eyebrow>/ Space lab</Eyebrow>
          <h1>
            Room to <span>rearrange.</span>
          </h1>
        </div>
        <p>
          A 27 m² canvas for everyday life.
          <br />
          Try a thought. Keep what feels right.
        </p>
      </div>
      {!id && (
        <div className="preset-toolbar page-pad">
          <span className="mono">BEGIN WITH</span>
          <div>
            {[
              ['living', 'A place to live'],
              ['work', 'A place to work'],
              ['empty', 'A clean slate'],
            ].map(([key, label]) => (
              <Link
                key={key}
                to={`/lab?preset=${key}`}
                className={(params.get('preset') ?? 'living') === key ? 'active' : ''}
              >
                {label}
              </Link>
            ))}
          </div>
          <span>Saving stays on this browser.</span>
        </div>
      )}
      <div className="lab-workspace page-pad">
        <RoomEditor scene={scene} saved={Boolean(saved)} onChange={change} onSave={save} />
      </div>
      <div className="lab-next page-pad">
        <p>
          Found an arrangement worth keeping?
          <br />
          Give it a little more context.
        </p>
        <Link to={`/brief${saved ? `?layout=${scene.id}` : ''}`} className="arrow-link">
          Build a project brief <ArrowUpRight size={18} />
        </Link>
        <Link to="/collection">Your saved collection ↗</Link>
      </div>
    </section>
  );
}
