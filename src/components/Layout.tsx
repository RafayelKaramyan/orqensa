import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, Pause, Play, Plus, X } from 'lucide-react';
import { useCollection } from '../state/context';
import { useMotion } from '../state/motion';
export function Layout() {
  const [menu, setMenu] = useState(false);
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);
  const main = useRef<HTMLElement>(null);
  const { reduced, toggle, systemReduced } = useMotion();
  const { snapshot, message, error, notify } = useCollection();
  const count = snapshot.status === 'ready' ? snapshot.collection.scenes.length : 0;
  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Space, considered.',
      '/work': 'Spatial studies',
      '/studio': 'The approach',
      '/materials': 'Material library',
      '/lab': 'Space lab',
      '/collection': 'Your collection',
      '/brief': 'A project brief',
      '/share': 'A shared room',
    };
    document.title = `${titles[pathname] ?? (pathname.startsWith('/work/') ? 'A spatial study' : pathname.startsWith('/lab/') ? 'Space lab' : 'Page not found')} — ORQENSA`;
    if (previousPath.current !== pathname) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      main.current?.focus({ preventScroll: true });
      previousPath.current = pathname;
    }
  }, [pathname]);
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          main.current?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="site-header">
        <Link to="/" className="wordmark" aria-label="ORQENSA home" onClick={() => setMenu(false)}>
          <span className="brand-mark" aria-hidden="true" />
          ORQENSA
          <span className="wordmark-dot" aria-hidden="true">
            ↗
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <NavLink to="/work">
            Studies <span>04</span>
          </NavLink>
          <NavLink to="/studio">Approach</NavLink>
          <NavLink to="/materials">Materials</NavLink>
        </nav>
        <div className="header-actions">
          <Link
            to="/collection"
            className="collection-link"
            aria-label={`Your collection, ${count} saved rooms`}
          >
            <Plus size={15} />
            <span>Saved</span>
            <span className="count">{count.toString().padStart(2, '0')}</span>
          </Link>
          <Link to="/lab" className="header-lab">
            Enter space lab <ArrowUpRight size={17} />
          </Link>
          <button
            className="icon-button menu-button"
            aria-label={menu ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menu}
            aria-controls="mobile-nav"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {menu && (
        <nav className="mobile-nav" id="mobile-nav" aria-label="Mobile navigation">
          {[
            ['/work', 'Spatial studies'],
            ['/studio', 'Our approach'],
            ['/materials', 'Materials'],
            ['/lab', 'Enter space lab'],
            ['/collection', 'Saved collection'],
            ['/brief', 'Build a brief'],
          ].map(([to, text]) => (
            <Link to={to!} key={to} onClick={() => setMenu(false)}>
              {text}
              <ArrowUpRight />
            </Link>
          ))}
        </nav>
      )}
      <main id="main" tabIndex={-1} ref={main}>
        <Suspense
          fallback={
            <div className="route-loading page-pad" role="status">
              Making a little room…
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <footer className="site-footer">
        <div className="footer-top">
          <p className="eyebrow">A little room for possibility.</p>
          <Link to="/brief">
            Let’s make
            <br />
            space.
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <p>
            A thought becomes a plan.
            <br />
            Start with what matters to you.
          </p>
        </div>
        <div className="footer-bottom">
          <Link to="/" className="footer-brand">
            ORQENSA
          </Link>
          <p>
            Independent portfolio concept
            <br />
            Design & development / Rafayel Karamyan
          </p>
          <Link
            to="/studio#credits"
            onClick={() => {
              if (pathname === '/studio') document.getElementById('credits')?.scrollIntoView();
            }}
          >
            Image credits & project notes ↗
          </Link>
          <button
            className="motion-control"
            onClick={toggle}
            disabled={systemReduced}
            aria-label={
              systemReduced
                ? 'Motion reduced by system preference'
                : reduced
                  ? 'Resume motion'
                  : 'Pause motion'
            }
          >
            {reduced ? <Play size={13} /> : <Pause size={13} />}
            {systemReduced ? 'Reduced motion' : reduced ? 'Motion paused' : 'Pause motion'}
          </button>
        </div>
      </footer>
      {message && (
        <div className={`notice ${error ? 'notice-error' : ''}`}>
          <p role={error ? 'alert' : 'status'}>{message}</p>
          <button className="icon-button" aria-label="Dismiss message" onClick={() => notify('')}>
            <X size={17} />
          </button>
        </div>
      )}
    </>
  );
}
