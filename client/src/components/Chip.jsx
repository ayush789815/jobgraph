import { cx } from '../utils/format.js';

export default function Chip({ active, onClick, children, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
        active
          ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
          : 'border-slate-300 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700',
      )}
    >
      {children}
      {active && <span className="text-[10px] leading-none">✕</span>}
    </button>
  );
}
