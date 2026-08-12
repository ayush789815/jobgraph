import { Link } from 'react-router-dom';

export default function StatCard({ label, value, icon, to, accent = 'bg-brand-50 text-brand-600' }) {
  const content = (
    <div className="card card-hover flex items-center gap-4 p-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-0.5 text-2xl font-extrabold tabular-nums text-slate-900">{value}</p>
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-xl">
      {content}
    </Link>
  ) : (
    content
  );
}
