import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, List, LayoutGrid } from 'lucide-react';
import { categories, studies } from '../data/studies';
import { Eyebrow, Photo } from '../components/ui';
import { PageMotion } from '../components/PageMotion';
export default function Work() {
  const [params, setParams] = useSearchParams();
  const category = categories.find((c) => c === params.get('type')) ?? 'All';
  const list = params.get('view') === 'list';
  const filtered = studies.filter((s) => category === 'All' || s.category === category);
  function filter(value: string) {
    const next = new URLSearchParams(params);
    if (value === 'All') next.delete('type');
    else next.set('type', value);
    setParams(next);
  }
  function view(value: boolean) {
    const next = new URLSearchParams(params);
    if (value) next.set('view', 'list');
    else next.delete('view');
    setParams(next);
  }
  return (
    <PageMotion>
      <section className="page-intro page-pad">
        <Eyebrow>/ The collection</Eyebrow>
        <div className="page-intro-row">
          <h1>
            Spatial
            <br />
            <span>studies.</span>
          </h1>
          <p>
            Four fictional places.
            <br />
            Four questions about how we live.
            <br />
            <span className="muted">Reference photography, original spatial narratives.</span>
          </p>
        </div>
      </section>
      <section className="work-section page-pad">
        <div className="work-toolbar">
          <div className="filter-group" aria-label="Filter studies">
            {categories.map((c) => (
              <button key={c} aria-pressed={category === c} onClick={() => filter(c)}>
                {c}
                <span>
                  {c === 'All'
                    ? '04'
                    : studies
                        .filter((s) => s.category === c)
                        .length.toString()
                        .padStart(2, '0')}
                </span>
              </button>
            ))}
          </div>
          <div className="view-toggle" aria-label="Study presentation">
            <button
              className="icon-button"
              aria-label="Grid view"
              aria-pressed={!list}
              onClick={() => view(false)}
            >
              <LayoutGrid size={17} />
            </button>
            <button
              className="icon-button"
              aria-label="List view"
              aria-pressed={list}
              onClick={() => view(true)}
            >
              <List size={18} />
            </button>
          </div>
        </div>
        <p className="sr-only" role="status">
          Showing {filtered.length} {category === 'All' ? '' : category.toLowerCase()} studies
        </p>
        <div className={list ? 'work-list' : 'work-grid'}>
          {filtered.map((study) => (
            <Link to={`/work/${study.slug}`} key={study.slug} className="work-item" data-reveal>
              <span className="mono work-number">/{study.index}</span>
              <Photo name={study.image} />
              <div className="work-item-text">
                <h2>{study.title}</h2>
                <p>{study.theme}</p>
                <span className="mono">
                  {study.category} / {study.area} m² concept
                </span>
              </div>
              <ArrowUpRight className="work-arrow" aria-hidden="true" />
            </Link>
          ))}
        </div>
        <p className="disclosure">
          These are fictional design studies for a frontend portfolio. The photographs are licensed
          visual references; they do not depict work designed or built by ORQENSA.
        </p>
      </section>
    </PageMotion>
  );
}
