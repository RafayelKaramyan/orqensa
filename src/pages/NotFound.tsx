import { ArrowLink, Eyebrow } from '../components/ui';
export default function NotFound() {
  return (
    <section className="page-pad not-found">
      <Eyebrow>/ 404 — A little off plan</Eyebrow>
      <h1>
        There’s room
        <br />
        to start again.
      </h1>
      <p>This page isn’t part of the plan. Your saved collection is still available.</p>
      <div className="button-row">
        <ArrowLink to="/">Back to the beginning</ArrowLink>
        <ArrowLink to="/collection">Your collection</ArrowLink>
      </div>
    </section>
  );
}
