import { useState } from 'react';
import { useCollection } from '../state/context';
import { download } from '../domain/transfer';
import { Dialog } from './ui';
export function StorageState() {
  const { snapshot, repository, perform, busy } = useCollection();
  const [confirm, setConfirm] = useState(false);
  if (snapshot.status === 'ready') return null;
  return (
    <div className="storage-warning">
      <h2>
        {snapshot.status === 'corrupt'
          ? 'Your collection needs a moment.'
          : 'Saving is unavailable.'}
      </h2>
      <p>{snapshot.message}</p>
      {snapshot.status === 'corrupt' && (
        <div className="button-row">
          <button
            className="button button-outline"
            onClick={() => download(snapshot.raw, 'orqensa-recovery.txt')}
          >
            Download recovery copy
          </button>
          <button className="text-button" onClick={() => setConfirm(true)}>
            Start a new collection
          </button>
        </div>
      )}
      {confirm && snapshot.status === 'corrupt' && (
        <Dialog title="Start a new collection?" onClose={() => setConfirm(false)}>
          <p>
            This replaces unreadable saved data in this browser. Download the recovery copy first if
            you want to keep those original bytes.
          </p>
          <button
            className="button"
            disabled={busy}
            onClick={() =>
              void perform(
                () => repository.recover(snapshot.raw),
                'A new collection is ready.',
              ).then((result) => {
                if (result.ok) setConfirm(false);
              })
            }
          >
            Replace unreadable collection
          </button>
        </Dialog>
      )}
    </div>
  );
}
