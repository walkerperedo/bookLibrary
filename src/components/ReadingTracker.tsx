'use client';

import { useReading, type ReadingStatus } from '@/modules/reading/store/reading.store';

export default function ReadingTracker({
  workId,
  title,
  coverUrl,
}: { workId: string; title?: string; coverUrl?: string }) {
  const entry = useReading((s) => s.get(workId));
  const setStatus = useReading((s) => s.setStatus);
  const setProgress = useReading((s) => s.setProgress);

  const current: ReadingStatus | undefined = entry?.status;

  function choose(status: ReadingStatus) {
    setStatus(workId, status, { title, coverUrl });
  }

  return (
    <div className="card p-3">
      <div className="text-sm font-medium mb-2">Reading status</div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => choose('WISHLIST')}
          className={`btn ${current === 'WISHLIST' ? 'ring-2 ring-brand-300' : ''}`}>
          Wishlist
        </button>
        <button onClick={() => choose('READING')}
          className={`btn ${current === 'READING' ? 'ring-2 ring-brand-300' : ''}`}>
          Reading
        </button>
        <button onClick={() => choose('COMPLETED')}
          className={`btn ${current === 'COMPLETED' ? 'ring-2 ring-brand-300' : ''}`}>
          Completed
        </button>
      </div>

      {/* Progreso opcional cuando está en Reading */}
      { (entry?.status === 'READING') && (
        <div className="mt-3">
          <label className="block text-xs mb-1">Progress: {Math.round(entry?.progress ?? 0)}%</label>
          <input
            type="range"
            min={0}
            max={100}
            value={entry?.progress ?? 0}
            onChange={(e) => setProgress(workId, Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {/* Etiquetas de fechas */}
      <div className="mt-3 text-xs text-slate-500 space-y-1">
        {entry?.startedAt && <div>Started: {new Date(entry.startedAt).toLocaleDateString()}</div>}
        {entry?.completedAt && <div>Completed: {new Date(entry.completedAt).toLocaleDateString()}</div>}
        {entry?.updatedAt && <div>Updated: {new Date(entry.updatedAt).toLocaleString()}</div>}
      </div>
    </div>
  );
}
