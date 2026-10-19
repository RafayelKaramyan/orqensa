import { useSyncExternalStore } from 'react';
const listeners = new Set<() => void>();
let preference = false;
try {
  preference = localStorage.getItem('orqensa.motion') === 'paused';
} catch {
  /* The system preference still applies. */
}
const query = window.matchMedia('(prefers-reduced-motion: reduce)');
function update() {
  document.documentElement.dataset.motion = preference || query.matches ? 'reduced' : 'full';
  listeners.forEach((f) => f());
}
query.addEventListener('change', update);
window.addEventListener('storage', (event) => {
  if (event.key === 'orqensa.motion') {
    preference = event.newValue === 'paused';
    update();
  }
});
update();
export function useMotion() {
  const reduced = useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },
    () => preference || query.matches,
  );
  return {
    reduced,
    systemReduced: query.matches,
    toggle: () => {
      preference = !preference;
      try {
        localStorage.setItem('orqensa.motion', preference ? 'paused' : 'full');
      } catch {
        /* A session-only preference is enough. */
      }
      update();
    },
  };
}
