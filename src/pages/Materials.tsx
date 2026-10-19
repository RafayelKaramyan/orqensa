import { useState } from 'react';
import { ArrowLink, Eyebrow, Photo } from '../components/ui';
import { PageMotion } from '../components/PageMotion';
import { materials, tones, type Material, type Tone } from '../domain/scene';
export default function Materials() {
  const [floor, setFloor] = useState<Material>('oak');
  const [tone, setTone] = useState<Tone>('chalk');
  return (
    <PageMotion>
      <section className="page-intro page-pad">
        <Eyebrow>/ Material library</Eyebrow>
        <div className="page-intro-row">
          <h1>
            Touch with
            <br />
            <span>your eyes.</span>
          </h1>
          <p>
            Three floors. Three tones.
            <br />A small palette with room to change.
            <br />
            <span className="muted">Digital approximations, made for exploration.</span>
          </p>
        </div>
      </section>
      <section className="palette-lab page-pad">
        <div
          className="palette-scene"
          style={
            {
              '--sample-wall': tones[tone].wall,
              '--sample-fabric': tones[tone].fabric,
            } as React.CSSProperties
          }
        >
          <span className="mono palette-label">
            MATERIAL STUDY / {materials[floor].name.toUpperCase()}
          </span>
          <div className="sample-wall" />
          <div className={`sample-floor texture-${floor}`} />
          <div className="sample-shadow" />
          <div className="sample-seat">
            <i />
            <i />
            <i />
          </div>
          <span className="palette-coordinate mono">Colour + texture + light</span>
        </div>
        <div className="palette-controls">
          <Eyebrow>/ Make a pairing</Eyebrow>
          <h2>
            Find your
            <br />
            kind of quiet.
          </h2>
          <fieldset>
            <legend>01 / Floor finish</legend>
            <div className="swatch-options">
              {Object.entries(materials).map(([key, value]) => (
                <button
                  key={key}
                  aria-pressed={floor === key}
                  onClick={() => setFloor(key as Material)}
                >
                  <span className={`swatch texture-${key}`} />
                  {value.name}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>02 / Wall & upholstery</legend>
            <div className="tone-options">
              {Object.entries(tones).map(([key, value]) => (
                <button key={key} aria-pressed={tone === key} onClick={() => setTone(key as Tone)}>
                  <span style={{ background: value.wall }} />
                  {value.name}
                </button>
              ))}
            </div>
          </fieldset>
          <p role="status">
            {materials[floor].description} Paired with {tones[tone].name.toLowerCase()}.
          </p>
          <ArrowLink to={`/lab?floor=${floor}&tone=${tone}`}>Try this pairing in a room</ArrowLink>
        </div>
      </section>
      <section className="material-notes page-pad">
        <Photo name="detail" caption />
        <div>
          <Eyebrow>/ From screen to space</Eyebrow>
          <h2>
            A sample
            <br />
            is a beginning.
          </h2>
          <p>
            Real materials vary with light, grain, finish and age. These digital swatches describe a
            direction, not a product specification.
          </p>
          <p>
            In the space lab, the same palette is applied to both the plan and the 3D study. Change
            the view to see the balance from a different angle.
          </p>
        </div>
      </section>
    </PageMotion>
  );
}
