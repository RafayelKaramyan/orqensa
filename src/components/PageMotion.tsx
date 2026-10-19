import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotion } from '../state/motion';
gsap.registerPlugin(useGSAP, ScrollTrigger);
export function PageMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  const { reduced } = useMotion();
  useGSAP(
    () => {
      if (reduced) return;
      gsap.from('[data-hero-line]', {
        y: 72,
        duration: 1.15,
        stagger: 0.11,
        ease: 'power3.out',
        clearProps: 'transform',
      });
      gsap.from('[data-hero-image]', {
        clipPath: 'inset(12% 8% 8% 0%)',
        scale: 1.035,
        duration: 1.45,
        ease: 'power3.inOut',
        clearProps: 'all',
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.from(element, {
          y: 42,
          duration: 0.9,
          ease: 'power2.out',
          clearProps: 'transform',
          scrollTrigger: { trigger: element, start: 'top 92%', once: true },
        });
      });
      gsap.utils.toArray<HTMLElement>('[data-pan] img').forEach((element) => {
        gsap.fromTo(
          element,
          { yPercent: -4, scale: 1.1 },
          {
            yPercent: 4,
            scale: 1.1,
            ease: 'none',
            scrollTrigger: {
              trigger: element.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );
      });
    },
    { scope, dependencies: [reduced], revertOnUpdate: true },
  );
  return <div ref={scope}>{children}</div>;
}
