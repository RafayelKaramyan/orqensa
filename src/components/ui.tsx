import { useEffect, useRef, type ReactNode } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import credits from '../data/photo-credits.json';
export function ArrowLink({
  to,
  children,
  className = '',
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link to={to} className={`arrow-link ${className}`}>
      {children}
      <ArrowUpRight size={19} aria-hidden="true" />
    </Link>
  );
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}
export function SectionHeading({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <span className="mono">/{number}</span>
      <h2>{title}</h2>
      {children && <div>{children}</div>}
    </div>
  );
}
export type PhotoKey = keyof typeof credits;
export function Photo({
  name,
  className = '',
  eager = false,
  caption = false,
}: {
  name: PhotoKey;
  className?: string;
  eager?: boolean;
  caption?: boolean;
}) {
  const credit = credits[name];
  return (
    <figure className={`photo ${className}`}>
      <div className="photo-frame">
        <img
          src={`${import.meta.env.BASE_URL}images/${name}-900.webp`}
          srcSet={`${import.meta.env.BASE_URL}images/${name}-900.webp 900w, ${import.meta.env.BASE_URL}images/${name}-1800.webp 1800w`}
          sizes="(max-width: 760px) 100vw, 65vw"
          alt={credit.alt}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          width={1800}
          height={1200}
          style={name === 'facade' ? { objectPosition: '50% 70%' } : undefined}
        />
      </div>
      {caption && (
        <figcaption>
          Reference photograph /{' '}
          <a href={credit.page} target="_blank" rel="noreferrer">
            {credit.author} ↗
          </a>
        </figcaption>
      )}
    </figure>
  );
}
export function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="dialog-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-header">
        <h2 id="dialog-title">{title}</h2>
        <button className="icon-button" aria-label="Close dialog" onClick={onClose}>
          <X size={22} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Empty({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-mark" aria-hidden="true">
        ＋
      </span>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
