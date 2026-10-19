import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createRepository, withCollectionLock } from '../domain/repository';
import { AppContext } from './context';
function browserStorage() {
  try {
    return localStorage;
  } catch {
    return null;
  }
}
const repository = createRepository(browserStorage());
export function CollectionProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    repository.subscribe,
    repository.getSnapshot,
    repository.getSnapshot,
  );
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const [notice, setNotice] = useState({ message: '', error: false });
  useEffect(() => {
    const refresh = (event: StorageEvent) => {
      if (event.key === null || event.key === 'orqensa.collection.v1') repository.refresh();
    };
    const focus = () => repository.refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', focus);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', focus);
    };
  }, []);
  const notify = (message: string, error = false) => setNotice({ message, error });
  async function perform<T>(action: () => T, success?: string) {
    if (locked.current) return { ok: false } as const;
    locked.current = true;
    setBusy(true);
    try {
      const value = await withCollectionLock(action);
      if (success) notify(success);
      return { ok: true, value } as const;
    } catch (error) {
      notify(error instanceof Error ? error.message : 'This change could not be completed.', true);
      return { ok: false } as const;
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  return (
    <AppContext value={{ snapshot, repository, busy, ...notice, notify, perform }}>
      {children}
    </AppContext>
  );
}
