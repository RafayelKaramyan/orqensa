import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Download, Printer, Save } from 'lucide-react';
import { briefSchema, briefText, priorities, type Brief as BriefType } from '../domain/brief';
import { leaseOf } from '../domain/repository';
import { useCollection } from '../state/context';
import { download } from '../domain/transfer';
import { FloorPlan } from '../components/FloorPlan';
import { Eyebrow } from '../components/ui';
import { StorageState } from '../components/StorageState';
export default function Brief() {
  const [params] = useSearchParams();
  const { snapshot } = useCollection();
  const id = params.get('read');
  if (id) {
    if (snapshot.status !== 'ready')
      return (
        <section className="page-pad collection-page">
          <StorageState />
        </section>
      );
    const brief = snapshot.collection.briefs.find((b) => b.id === id);
    if (!brief)
      return (
        <section className="page-pad not-found">
          <Eyebrow>/ A brief has moved on</Eyebrow>
          <h1>
            This brief
            <br />
            isn’t saved here.
          </h1>
          <Link to="/collection" className="arrow-link">
            Your collection <ArrowUpRight size={17} />
          </Link>
        </section>
      );
    return (
      <section className="brief-page page-pad">
        <BriefReview brief={brief} saved />
        <Link to="/brief" className="arrow-link no-print">
          Begin another brief <ArrowUpRight size={17} />
        </Link>
      </section>
    );
  }
  return <BriefForm key={params.get('layout') ?? 'new'} layoutId={params.get('layout')} />;
}
function BriefForm({ layoutId }: { layoutId: string | null }) {
  const { snapshot } = useCollection();
  const scenes = snapshot.status === 'ready' ? snapshot.collection.scenes : [];
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<BriefType['kind']>('A home');
  const [area, setArea] = useState('96');
  const [chosen, setChosen] = useState<string[]>(['Natural light']);
  const [notes, setNotes] = useState('');
  const [layout, setLayout] = useState(scenes.some((s) => s.id === layoutId) ? layoutId! : '');
  const [review, setReview] = useState<BriefType | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  function submit() {
    const result = briefSchema.safeParse({
      id: crypto.randomUUID(),
      title,
      kind,
      area: Number(area),
      priorities: chosen,
      notes,
      layout: scenes.find((s) => s.id === layout) ?? null,
      updatedAt: new Date().toISOString(),
    });
    if (result.success) {
      setReview(result.data);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      const fields: Record<string, string> = {};
      for (const issue of result.error.issues) fields[String(issue.path[0])] ??= issue.message;
      setErrors(fields);
    }
  }
  if (review)
    return (
      <section className="brief-page page-pad">
        <BriefReview brief={review} saved={false} />
        <button className="text-button no-print" onClick={() => setReview(null)}>
          <ArrowLeft size={16} />
          Back to your thoughts
        </button>
      </section>
    );
  return (
    <>
      <section className="page-intro page-pad">
        <Eyebrow>/ A project brief</Eyebrow>
        <div className="page-intro-row">
          <h1>
            Start with
            <br />
            <span>what matters.</span>
          </h1>
          <p>
            You don’t need all the answers.
            <br />A few clear thoughts are enough
            <br />
            to give an idea a beginning.
          </p>
        </div>
      </section>
      <section className="brief-builder page-pad">
        <aside>
          <span className="mono">01 / YOUR THOUGHTS</span>
          <h2>
            A place.
            <br />A feeling.
            <br />A possibility.
          </h2>
          <p>
            This brief stays with you. Review it, save it on this browser, or download a copy.
            Nothing is submitted or sent.
          </p>
          <div className="brief-progress">
            <span className="active">01 — Think</span>
            <span>02 — Review</span>
            <span>03 — Keep</span>
          </div>
        </aside>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          noValidate
        >
          <div className="form-field">
            <label htmlFor="brief-title">
              Give your idea a name <span>Required / 3–70 characters</span>
            </label>
            <input
              id="brief-title"
              value={title}
              maxLength={70}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="A home with a little more light"
              required
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <p id="title-error" className="field-error">
                Choose a name between 3 and 70 characters.
              </p>
            )}
          </div>
          <div className="form-two">
            <div className="form-field">
              <label htmlFor="brief-kind">What kind of place?</label>
              <select
                id="brief-kind"
                value={kind}
                onChange={(event) => setKind(event.target.value as BriefType['kind'])}
              >
                <option>A home</option>
                <option>A workspace</option>
                <option>A shared place</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="brief-area">Approximate total area / m²</label>
              <input
                type="number"
                id="brief-area"
                min="12"
                max="500"
                step="1"
                required
                value={area}
                onChange={(event) => setArea(event.target.value)}
                aria-invalid={Boolean(errors.area)}
                aria-describedby={errors.area ? 'area-error' : undefined}
              />
              {errors.area && (
                <p id="area-error" className="field-error">
                  Use a whole number from 12 to 500 m².
                </p>
              )}
            </div>
          </div>
          <fieldset className="priorities">
            <legend>
              What would make the biggest difference? <span>Choose at least one</span>
            </legend>
            {priorities.map((priority) => (
              <label key={priority}>
                <input
                  type="checkbox"
                  checked={chosen.includes(priority)}
                  onChange={(event) =>
                    setChosen(
                      event.target.checked
                        ? [...chosen, priority]
                        : chosen.filter((p) => p !== priority),
                    )
                  }
                />
                {priority}
              </label>
            ))}
            {errors.priorities && (
              <p className="field-error" role="alert">
                Choose at least one priority.
              </p>
            )}
          </fieldset>
          <div className="form-field">
            <label htmlFor="brief-layout">
              Attach a saved room <span>Optional</span>
            </label>
            <select
              id="brief-layout"
              value={layout}
              onChange={(event) => setLayout(event.target.value)}
            >
              <option value="">No room attached</option>
              {scenes.map((scene) => (
                <option key={scene.id} value={scene.id}>
                  {scene.title}
                </option>
              ))}
            </select>
            <small>
              The attached room is a snapshot. Later room edits won’t change your saved brief.
            </small>
          </div>
          <div className="form-field">
            <label htmlFor="brief-notes">
              Anything else to make room for? <span>Optional / {notes.length}/600</span>
            </label>
            <textarea
              id="brief-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={600}
              rows={5}
              placeholder="How do you want this place to feel?"
            />
            <small>Keep private or sensitive details out of a file you plan to share.</small>
          </div>
          <button className="button" type="submit">
            Review your brief <ArrowUpRight size={17} />
          </button>
          {Object.keys(errors).length > 0 && (
            <p className="field-error" role="alert">
              Please review the highlighted fields above.
            </p>
          )}
        </form>
      </section>
    </>
  );
}
function BriefReview({ brief, saved }: { brief: BriefType; saved: boolean }) {
  const { snapshot, repository, perform, busy } = useCollection();
  const kept =
    saved ||
    (snapshot.status === 'ready' && snapshot.collection.briefs.some((b) => b.id === brief.id));
  async function save() {
    await perform(
      () => repository.saveBrief(leaseOf(snapshot), brief),
      'Brief saved in your collection. It has not been sent anywhere.',
    );
  }
  return (
    <div className="brief-review">
      <Eyebrow>/ Your project brief</Eyebrow>
      <div className="brief-review-heading">
        <h1>{brief.title}</h1>
        <span className="mono">
          {brief.kind} / {brief.area} m²
        </span>
      </div>
      <div className="brief-review-grid">
        <div>
          <h2>What matters.</h2>
          <ul>
            {brief.priorities.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <h2>A little more context.</h2>
          <p className="preserve-lines">
            {brief.notes || 'No additional notes. A little room for the idea to grow.'}
          </p>
          <p className="disclosure">
            A fictional portfolio concept. This brief has not been submitted to a studio. The room
            plan is illustrative, not a construction document.
          </p>
        </div>
        {brief.layout && (
          <div className="brief-layout">
            <FloorPlan scene={brief.layout} compact />
            <span className="mono">ATTACHED ROOM / {brief.layout.title}</span>
            <p>Room snapshot / 27 m². The total project area above may include other spaces.</p>
          </div>
        )}
      </div>
      <div className="brief-review-actions no-print">
        <button className="button" onClick={() => void save()} disabled={busy || kept}>
          <Save size={16} />
          {kept ? 'Saved in your collection' : 'Save brief on this browser'}
        </button>
        <button
          className="button button-outline"
          onClick={() => download(briefText(brief), 'orqensa-brief.txt')}
        >
          <Download size={16} />
          Download brief
        </button>
        <button className="text-button" onClick={() => window.print()}>
          <Printer size={16} />
          Print
        </button>
        {kept && (
          <Link to="/collection" className="text-button">
            Your collection ↗
          </Link>
        )}
      </div>
    </div>
  );
}
