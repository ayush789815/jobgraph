import { cx } from '../utils/format.js';
import { NODE_TYPES } from '../utils/nodeTypes.js';

const TONES = {
  gray: 'bg-slate-100 text-slate-600',
  indigo: 'bg-indigo-50 text-indigo-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  sky: 'bg-sky-50 text-sky-700',
  rose: 'bg-rose-50 text-rose-700',
  violet: 'bg-violet-50 text-violet-700',
  slate: 'bg-slate-200 text-slate-700',
};

/** Simple pill with a fixed color tone. */
export function Badge({ tone = 'gray', children, className, title }) {
  return (
    <span title={title} className={cx('badge', TONES[tone] || TONES.gray, className)}>
      {children}
    </span>
  );
}

/** Pill colored by a node type (Job, Skill, Company, …). */
export function TypeBadge({ type, children, className }) {
  const t = NODE_TYPES[type] || NODE_TYPES.Job;
  return (
    <span className={cx('badge ring-1 ring-inset', t.badge, className)}>
      <span className={cx('h-1.5 w-1.5 rounded-full', t.dot)} />
      {children || t.label}
    </span>
  );
}
