import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLink, Eyebrow, Photo, SectionHeading } from '../components/ui';
import { PageMotion } from '../components/PageMotion';
import credits from '../data/photo-credits.json';
export default function Studio() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash !== '#credits') return;
    const frame = requestAnimationFrame(() => document.getElementById('credits')?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, [hash]);
  return (
    <PageMotion>
      <section className="page-intro page-pad">
        <Eyebrow>/ An independent point of view</Eyebrow>
        <div className="page-intro-row">
          <h1>
            Begin with
            <br />
            <span>everyday life.</span>
          </h1>
          <p>
            Before a shape, a question.
            <br />
            Before a finish, a feeling.
            <br />
            Before a plan, a way of living.
          </p>
        </div>
      </section>
      <section className="studio-image page-pad" data-pan>
        <Photo name="interior" eager caption />
      </section>
      <section className="approach-section page-pad">
        <SectionHeading number="01" title="Three things to hold on to." />
        <div className="principles">
          {[
            [
              'Light comes first.',
              'Where does it enter? Where does it linger? A space begins with noticing the light already there.',
            ],
            [
              'Material has a memory.',
              'Grain, weight and texture change how a room feels. A small palette makes each choice easier to see.',
            ],
            [
              'A plan should leave room.',
              'Life rarely follows a fixed arrangement. Loose furniture and a clear centre let a room become something else.',
            ],
          ].map(([title, description], i) => (
            <article key={title} data-reveal>
              <span className="mono">0{i + 1} /</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="studio-note page-pad">
        <Eyebrow>/ About this project</Eyebrow>
        <div>
          <h2>
            A place to explore
            <br />
            what a website
            <br />
            <span>can feel like.</span>
          </h2>
          <p>
            ORQENSA is an independent frontend portfolio project by Rafayel Karamyan. It brings
            together an original visual system, editorial storytelling and a functional
            space-planning tool.
          </p>
          <p>
            The studio and its projects are fictional. The architecture in the reference photographs
            belongs to its respective creators. No built work, client commissions or professional
            architectural services are claimed here.
          </p>
          <p>
            Room drawings are illustrative. They are not construction documents or accessibility,
            building-code or structural assessments.
          </p>
          <ArrowLink to="/lab">Experience the space lab</ArrowLink>
        </div>
      </section>
      <section className="credits-section page-pad" id="credits">
        <SectionHeading number="02" title="Photography & credits." />
        <p>
          Reference images are used under the{' '}
          <a href="https://unsplash.com/license" target="_blank" rel="noreferrer">
            Unsplash License ↗
          </a>
          . Each photographer is linked below. Images are hosted locally as optimized WebP files.
        </p>
        <div className="credit-list">
          {Object.entries(credits).map(([key, credit]) => (
            <a href={credit.page} target="_blank" rel="noreferrer" key={key}>
              <span className="mono">{key}</span>
              <strong>{credit.author}</strong>
              <span>View photograph ↗</span>
            </a>
          ))}
        </div>
        <div className="project-credits">
          <p>
            Typography / Manrope, IBM Plex Mono
            <br />
            Icons / Lucide
            <br />
            Design & development / Rafayel Karamyan
          </p>
          <a href="https://github.com/RafayelKaramyan/orqensa" target="_blank" rel="noreferrer">
            Source & implementation notes ↗
          </a>
        </div>
      </section>
    </PageMotion>
  );
}
