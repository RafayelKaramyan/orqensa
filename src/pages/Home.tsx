import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, MoveUpRight } from 'lucide-react';
import { ArrowLink, Eyebrow, Photo, SectionHeading } from '../components/ui';
import { PageMotion } from '../components/PageMotion';
import { PlanDrawing } from '../components/PlanDrawing';
import { studies } from '../data/studies';
export default function Home() {
  return (
    <PageMotion>
      <section className="home-hero page-pad">
        <div className="hero-topline">
          <Eyebrow>Architecture, interiors & possibilities.</Eyebrow>
          <span className="mono">Independent spatial studies / 2026</span>
        </div>
        <div className="hero-grid">
          <div className="hero-copy">
            <h1>
              <span data-hero-line>SPACE</span>
              <span data-hero-line>
                TO <i>BE.</i>
              </span>
            </h1>
            <div className="hero-description">
              <ArrowDownRight size={39} strokeWidth={1} aria-hidden="true" />
              <p>
                For the way we live.
                <br />
                For the things that change.
                <br />
                For a little more possibility.
              </p>
            </div>
            <ArrowLink to="/work">Explore the studies</ArrowLink>
          </div>
          <div className="hero-visual" data-hero-image>
            <Photo name="court" eager />
            <span className="visual-cross cross-top" aria-hidden="true">
              ＋
            </span>
            <span className="visual-cross cross-bottom" aria-hidden="true">
              ＋
            </span>
            <div className="hero-image-label">
              <span className="mono">01 / A pause between.</span>
              <Link to="/work/a-pause-between" aria-label="Open A pause between study">
                <ArrowUpRight />
              </Link>
            </div>
            <span className="vertical-note mono">LIGHT / MATERIAL / EVERYDAY LIFE</span>
          </div>
        </div>
        <div className="hero-foot">
          <span className="mono">Space, considered.</span>
          <span>Four ideas. One way of looking.</span>
          <span className="mono">Scroll to explore ↓</span>
        </div>
      </section>
      <section className="manifesto page-pad" data-reveal>
        <Eyebrow>/ The starting point</Eyebrow>
        <p>
          Good spaces don’t ask you
          <br />
          to live differently.
          <br />
          <span>They make room for you.</span>
        </p>
        <div className="manifesto-aside">
          <span className="small-cross" aria-hidden="true">
            ＋
          </span>
          <p>
            ORQENSA explores the relationship between light, material and everyday life. An
            independent collection of fictional spatial studies, made to be experienced.
          </p>
          <ArrowLink to="/studio">The thinking behind it</ArrowLink>
        </div>
      </section>
      <section className="selected-studies page-pad">
        <SectionHeading number="01" title="Places to begin.">
          <ArrowLink to="/work">View all four studies</ArrowLink>
        </SectionHeading>
        <div className="study-pair">
          {studies.slice(0, 2).map((study) => (
            <Link
              className={`study-card study-card-${study.index}`}
              to={`/work/${study.slug}`}
              key={study.slug}
              data-reveal
            >
              <div className="study-card-image" data-pan>
                <Photo name={study.image} />
                <span className="study-open" aria-hidden="true">
                  <MoveUpRight size={29} strokeWidth={1} />
                </span>
                <span className="study-index mono">/{study.index}</span>
              </div>
              <div className="study-card-heading">
                <h3>{study.title}</h3>
                <span className="mono">{study.category} / Concept</span>
              </div>
              <p>{study.theme}</p>
            </Link>
          ))}
        </div>
        <Link className="wide-study" to="/work/ground-and-sky" data-reveal>
          <div data-pan>
            <Photo name="concrete" />
            <span className="wide-study-caption">
              <span className="mono">/03 — Public space</span>
              <strong>Ground & sky.</strong>
              <ArrowUpRight aria-hidden="true" />
            </span>
          </div>
        </Link>
      </section>
      <section className="lab-feature">
        <div className="lab-feature-copy">
          <Eyebrow>/02 — From looking to making</Eyebrow>
          <h2>
            A small room.
            <br />A thousand
            <br />
            <span>possibilities.</span>
          </h2>
          <p>
            Start with 27 square metres. Move a chair. Change the floor. Find a different kind of
            balance.
          </p>
          <p className="lab-feature-note mono">Your plan. Your materials. Your pace.</p>
          <ArrowLink to="/lab">Make room in the space lab</ArrowLink>
        </div>
        <Link to="/lab" className="lab-feature-drawing" aria-label="Open the interactive space lab">
          <span className="drawing-tag mono">SPACE LAB / 001</span>
          <PlanDrawing />
          <span className="drawing-pill">
            Try a different arrangement <ArrowUpRight size={16} />
          </span>
        </Link>
      </section>
      <section className="material-feature page-pad">
        <SectionHeading number="03" title="A feeling, in material.">
          <ArrowLink to="/materials">Open the material library</ArrowLink>
        </SectionHeading>
        <div className="material-feature-grid">
          <Photo name="detail" />
          <div className="material-feature-copy" data-reveal>
            <Eyebrow>Less, but carefully chosen.</Eyebrow>
            <h3>
              Texture gives
              <br />a space its
              <br />
              quiet voice.
            </h3>
            <p>
              Warm oak. Pale stone. A little colour. Explore three floor finishes and three tones,
              then see how they change the same room.
            </p>
            <div className="material-strips" aria-hidden="true">
              <span className="texture-oak" />
              <span className="texture-limestone" />
              <span className="texture-terrazzo" />
            </div>
          </div>
        </div>
      </section>
    </PageMotion>
  );
}
