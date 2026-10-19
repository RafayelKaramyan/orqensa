import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Plus } from 'lucide-react';
import { Eyebrow } from '../components/ui';
import { FloorPlan } from '../components/FloorPlan';
import { readShare, download, exportScene } from '../domain/transfer';
import { leaseOf } from '../domain/repository';
import { useCollection } from '../state/context';
import { materials, tones } from '../domain/scene';
export default function Shared() {
  const [params] = useSearchParams();
  const token = params.get('room') ?? '';
  return <SharedRoom key={token} token={token} />;
}
function SharedRoom({ token }: { token: string }) {
  const [{ scene, error }] = useState(() => {
    try {
      return { scene: readShare(token), error: null };
    } catch (error) {
      return {
        scene: null,
        error: error instanceof Error ? error.message : 'This shared room could not be opened.',
      };
    }
  });
  const { snapshot, repository, perform, busy } = useCollection();
  const navigate = useNavigate();
  async function save() {
    if (!scene) return;
    const result = await perform(
      () => repository.addScene(leaseOf(snapshot), scene),
      'A separate copy is now in your collection.',
    );
    if (result.ok) navigate(`/lab/${result.value}`);
  }
  return (
    <section className="shared-page page-pad">
      <Eyebrow>/ A shared possibility</Eyebrow>
      {scene ? (
        <>
          <div className="shared-heading">
            <h1>{scene.title}</h1>
            <p>
              A snapshot someone chose to share.
              <br />
              Make a copy to make it your own.
            </p>
          </div>
          <div className="shared-room">
            <FloorPlan scene={scene} />
            <div>
              <span className="mono">27 m² / 6 × 4.5 m</span>
              <h2>Room to begin again.</h2>
              <dl>
                <div>
                  <dt>Floor</dt>
                  <dd>{materials[scene.material].name}</dd>
                </div>
                <div>
                  <dt>Tone</dt>
                  <dd>{tones[scene.tone].name}</dd>
                </div>
                <div>
                  <dt>Objects</dt>
                  <dd>{scene.objects.length}</dd>
                </div>
              </dl>
              <button className="button" onClick={() => void save()} disabled={busy}>
                Save a separate copy <Plus size={16} />
              </button>
              <button
                className="text-button"
                onClick={() =>
                  download(exportScene(scene), 'orqensa-room.json', 'application/json')
                }
              >
                Download room file ↗
              </button>
              <p className="muted">
                Opening this link does not change your collection. The shared plan is illustrative,
                not a construction drawing.
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="not-found">
          <h1>
            This room
            <br />
            couldn’t be opened.
          </h1>
          <p role="alert">{error}</p>
          <Link to="/lab" className="button">
            Begin your own room <ArrowUpRight size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}
