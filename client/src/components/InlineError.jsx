import { cx } from '../utils/format.js';

/**
 * Compact error notice for a secondary section of a page (a filter list, a
 * "related" panel) that failed while the main content loaded fine.
 */
export default function InlineError({ error, onRetry, label, className }) {
  if (!error) return null;
  return (
    <div
      className={cx(
        'flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800',
        className,
      )}
      role="status"
    >
      <span>⚠️</span>
      <span>
        {label ? `${label}: ` : ''}
        {error.message || 'Could not load this section.'}
      </span>
      {onRetry && (
        <button type="button" className="font-semibold underline hover:no-underline" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
