import { createContext, useContext } from 'react';
import type { Repository, Snapshot } from '../domain/repository';
export type AppState = {
  snapshot: Snapshot;
  repository: Repository;
  busy: boolean;
  message: string;
  error: boolean;
  notify: (message: string, error?: boolean) => void;
  perform: <T>(
    action: () => T,
    success?: string,
  ) => Promise<{ ok: true; value: T } | { ok: false }>;
};
export const AppContext = createContext<AppState | null>(null);
export function useCollection() {
  const value = useContext(AppContext);
  if (!value) throw new Error('Collection provider is required.');
  return value;
}
