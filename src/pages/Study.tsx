import { Link, useParams } from 'react-router-dom';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { studies } from '../data/studies';
import { ArrowLink, Eyebrow, Photo } from '../components/ui';
import { PageMotion } from '../components/PageMotion';
import { PlanDrawing } from '../components/PlanDrawing';
import NotFound from './NotFound';
export default function Study() {
  const { slug } = useParams();
  const index = studies.findIndex((s) => s.slug === slug);
  const study = studies[index];
  if (!study) return <NotFound />;
  const next = studies[(index + 1) % studies.length]!;
  return (
    <PageMotion>
      <section className="study-intro page-pad">
        <Link to="/work" className="back-link">
          ← All studies
        </Link>
        <div className="study-intro-heading">
          <Eyebrow>
            /{study.index} — {study.category}
          </Eyebrow>
          <h1>{study.title}</h1>
          <span className="mono">Fictional spatial study / 2026</span>
        </div>
        <Photo name={study.image} eager caption />
        <div className="study-metadata">
          <span>
            <small>TYPE</small>
            {study.category}
          </span>
          <span>
            <small>CONCEPT AREA</small>
            {study.area} m²
          </span>
          <span>
            <small>STATUS</small>Unbuilt / fictional
          </span>
          <span>
            <small>THE EXPLORATION</small>
            {study.theme}
          </span>
        </div>
      </section>
      <section className="study-story page-pad" data-reveal>
        <Eyebrow>/ The question</Eyebrow>
        <h2>{study.question}</h2>
        <div className="study-story-copy">
          <ArrowDown size={29} strokeWidth={1} />
          <p>{study.description}</p>
        </div>
      </section>
      <section className="study-process page-pad">
        <Photo name={study.second} caption />
        <div className="study-moves">
          <Eyebrow>/ Three spatial moves</Eyebrow>
          {study.moves.map((move, i) => (
            <div key={move} data-reveal>
              <span className="mono">0{i + 1}</span>
              <h3>{move}</h3>
            </div>
          ))}
        </div>
      </section>
      <section className="study-lab page-pad">
        <div>
          <Eyebrow>/ Continue the thought</Eyebrow>
          <h2>
            What would
            <br />
            you make room for?
          </h2>
          <p>
            Try the material direction in a 27 m² room. The lab is a separate interactive study,
            rather than a floor plan of the reference photograph.
          </p>
          <ArrowLink to={`/lab?floor=${study.material}`}>
            Explore this material in the lab
          </ArrowLink>
        </div>
        <PlanDrawing />
      </section>
      <Link to={`/work/${next.slug}`} className="next-study page-pad">
        <span className="mono">NEXT STUDY / {next.index}</span>
        <strong>{next.title}</strong>
        <ArrowUpRight aria-hidden="true" />
      </Link>
    </PageMotion>
  );
}
