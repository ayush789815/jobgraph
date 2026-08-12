import { Link } from 'react-router-dom';
import { NODE_TYPES } from '../../utils/nodeTypes.js';
import { formatSalary, timeAgo } from '../../utils/format.js';
import { TypeBadge } from '../Badge.jsx';

const PROP_LABELS = {
  title: 'Title',
  name: 'Name',
  category: 'Category',
  city: 'City',
  state: 'State',
  country: 'Country',
  employmentType: 'Employment type',
  experienceLevel: 'Experience',
  salaryMin: 'Salary min',
  salaryMax: 'Salary max',
  remoteType: 'Work mode',
  postedAt: 'Posted',
  website: 'Website',
};

export default function NodePanel({ node, connections, onClose }) {
  if (!node) return null;
  const type = NODE_TYPES[node.type] || NODE_TYPES.Job;
  const props = node.props || {};

  const detailRoute =
    node.type === 'Job'
      ? `/jobs/${props.id}`
      : node.type === 'Skill'
        ? `/skills/${props.id}`
        : node.type === 'Company'
          ? `/companies/${props.id}`
          : null;

  const related = connections.filter((l) => l.source === node.id || l.target === node.id);

  const rows = Object.entries(props)
    .filter(([k, v]) => v !== null && v !== undefined && v !== '' && PROP_LABELS[k])
    .map(([k, v]) => ({ label: PROP_LABELS[k], value: v }));

  return (
    <div className="card flex max-h-[520px] flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: type.solid }} />
          <TypeBadge type={node.type} />
        </div>
        <button className="btn-ghost !px-2 !py-1 text-slate-400" onClick={onClose} aria-label="Close panel">
          ✕
        </button>
      </div>

      <div className="nice-scroll flex-1 overflow-y-auto p-4">
        <h3 className="text-base font-bold text-slate-900">{node.name}</h3>

        {rows.length > 0 && (
          <dl className="mt-3 space-y-1.5 text-xs">
            {rows.map((row) => (
              <div key={row.label} className="flex justify-between gap-3">
                <dt className="shrink-0 text-slate-400">{row.label}</dt>
                <dd className="text-right font-medium text-slate-700">
                  {row.label === 'Posted' ? timeAgo(row.value) : row.label === 'Salary min' || row.label === 'Salary max' ? formatSalary({ salaryMin: row.value, salaryMax: row.value }) : String(row.value)}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {related.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              {related.length} connection{related.length > 1 ? 's' : ''}
            </p>
            <ul className="space-y-1.5">
              {related.map((l) => {
                const other = l.source === node.id ? l.target : l.source;
                const otherNode = connections.find((n) => n.id === other);
                if (!otherNode) return null;
                return (
                  <li key={`${l.source}-${l.target}-${l.relationship}`} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
                    <span className="truncate text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">{otherNode.name}</span>
                      <span className="mx-1 text-slate-400">·</span>
                      {l.relationship.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {detailRoute && (
          <Link to={detailRoute} className="btn-primary mt-4 w-full text-xs">
            Open {node.type.toLowerCase()} page →
          </Link>
        )}
      </div>
    </div>
  );
}
