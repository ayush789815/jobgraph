import { cx } from '../utils/format.js';

export default function ErrorState({ error, onRetry, title, className }) {
  const isOffline = error?.status === 503;
  return (
    <div className={cx('card flex flex-col items-center px-6 py-14 text-center', className)}>
      <div
        className={cx(
          'flex h-14 w-14 items-center justify-center rounded-2xl text-2xl',
          isOffline ? 'bg-amber-50' : 'bg-rose-50',
        )}
      >
        {isOffline ? '🛰️' : '⚠️'}
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-900">{title || (isOffline ? 'CognoDB is offline' : 'Something went wrong')}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{error?.message || 'An unexpected error occurred.'}</p>
      {onRetry && (
        <button className="btn-secondary mt-5" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
