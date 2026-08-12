import { Link } from 'react-router-dom';
import { Badge } from './Badge.jsx';
import { cx, formatSalary, initials, timeAgo } from '../utils/format.js';

/** Computes a client-side match % between a job's skills and the user's skills. */
export function computeMatch(job, userSkills) {
  if (!userSkills || userSkills.length === 0) return null;
  const required = job.skills || [];
  if (required.length === 0) return null;
  const matched = required.filter((s) => userSkills.includes(s.id)).length;
  return Math.round((matched / required.length) * 100);
}

export function MatchBadge({ percent, className }) {
  if (percent === null || percent === undefined) return null;
  const tone = percent >= 75 ? 'emerald' : percent >= 50 ? 'amber' : 'slate';
  return (
    <Badge tone={tone} className={className} title={`${percent}% of this job's required skills match your profile`}>
      {percent}% match
    </Badge>
  );
}

export default function JobCard({ job, userSkills = [], showMatch = false }) {
  const match = showMatch ? computeMatch(job, userSkills) : null;
  const company = job.company || { name: job.companyName };
  const location = job.location ? `${job.location.city}${job.location.state ? `, ${job.location.state}` : ''}` : 'Remote-friendly';

  return (
    <article className="card card-hover flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/jobs/${job.id}`} className="line-clamp-2 text-base font-bold text-slate-900 transition-colors hover:text-brand-700">
            {job.title}
          </Link>
          <p className="mt-0.5 truncate text-sm text-slate-500">{company.name}</p>
        </div>
        <MatchBadge percent={match} className="shrink-0" />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone={job.employmentType === 'Full-time' ? 'indigo' : 'gray'}>{job.employmentType}</Badge>
        <Badge tone={job.experienceLevel === 'Entry' ? 'sky' : job.experienceLevel === 'Senior' ? 'violet' : 'gray'}>
          {job.experienceLevel}
        </Badge>
        <Badge tone={job.remoteType === 'Remote' ? 'emerald' : job.remoteType === 'Hybrid' ? 'amber' : 'gray'}>
          {job.remoteType}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(job.skills || []).slice(0, 5).map((s) => (
          <Link
            key={s.id}
            to={`/skills/${s.id}`}
            className="badge bg-slate-100 text-slate-600 transition-colors hover:bg-emerald-100 hover:text-emerald-800"
            title={s.category}
          >
            {s.name}
          </Link>
        ))}
        {(job.skills || []).length > 5 && <Badge tone="slate">+{(job.skills || []).length - 5}</Badge>}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
          <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{location}</span>
        </div>
        <span className="shrink-0 text-sm font-bold tabular-nums text-slate-900">{formatSalary(job)}</span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-400">{timeAgo(job.postedAt)}</span>
        <div className="flex items-center gap-2">
          <Link to={`/graph?job=${job.id}`} className="link text-xs" title="Explore this job's graph connections">
            Explore graph
          </Link>
          <Link to={`/jobs/${job.id}`} className="btn-primary !px-3 !py-1.5 text-xs">
            View
          </Link>
        </div>
      </div>
    </article>
  );
}

/** Tiny avatar circle from company initials — used in list rows and details. */
export function CompanyAvatar({ name, size = 'md', className }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' };
  const palette = ['bg-brand-100 text-brand-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-sky-100 text-sky-700', 'bg-rose-100 text-rose-700'];
  const color = palette[(name || '').length % palette.length];
  return (
    <div className={cx('flex shrink-0 items-center justify-center rounded-xl font-bold', sizes[size], color, className)}>
      {initials(name) || '?'}
    </div>
  );
}
