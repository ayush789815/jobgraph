import { Link, useParams } from 'react-router-dom';
import api from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import { useUserSkills } from '../hooks/useUserSkills.js';
import { Badge, TypeBadge } from '../components/Badge.jsx';
import { CompanyAvatar, MatchBadge, computeMatch } from '../components/JobCard.jsx';
import ErrorState from '../components/ErrorState.jsx';
import InlineError from '../components/InlineError.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { CardSkeleton } from '../components/Skeleton.jsx';
import { salaryWithCurrency, timeAgo } from '../utils/format.js';

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-800">{value}</span>
    </div>
  );
}

export default function JobDetailsPage() {
  const { id } = useParams();
  const { skills: userSkills } = useUserSkills();

  const { data: job, loading, error, reload } = useApi(() => api.get(`/jobs/${id}`), [id]);
  const { data: related, error: relatedError, reload: reloadRelated } = useApi(() => api.get(`/jobs/${id}/related`), [id]);

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={reload}
        title={error.status === 404 ? 'Job not found' : undefined}
        className="mx-auto max-w-2xl"
      />
    );
  }

  if (loading || !job) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><CardSkeleton rows={6} /></div>
        <CardSkeleton rows={4} />
      </div>
    );
  }

  const match = computeMatch(job, userSkills);
  const company = job.company;

  return (
    <div>
      <nav className="mb-4 text-xs text-slate-400">
        <Link to="/jobs" className="hover:text-brand-600">Jobs</Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-600">{job.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{job.title}</h1>
                <p className="mt-1 text-sm text-slate-500">
                  <Link to={`/companies/${company?.id}`} className="link">{company?.name}</Link>
                  {' · '}{job.location ? `${job.location.city}, ${job.location.country}` : 'Remote-friendly'}
                </p>
              </div>
              <MatchBadge percent={match} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="indigo">{job.employmentType}</Badge>
              <Badge tone={job.experienceLevel === 'Entry' ? 'sky' : job.experienceLevel === 'Senior' ? 'violet' : 'gray'}>{job.experienceLevel}</Badge>
              <Badge tone={job.remoteType === 'Remote' ? 'emerald' : job.remoteType === 'Hybrid' ? 'amber' : 'gray'}>{job.remoteType}</Badge>
              <Badge tone="slate">{salaryWithCurrency(job)}</Badge>
              <Badge tone="gray">{timeAgo(job.postedAt)}</Badge>
            </div>

            <div className="mt-6 whitespace-pre-line text-sm leading-7 text-slate-600">{job.description}</div>
          </div>

          {/* Skills & technologies */}
          <div className="card p-6">
            <h2 className="section-title">Required skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <Link key={s.id} to={`/skills/${s.id}`} className="badge bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 transition-colors hover:bg-emerald-100">
                  {s.name}
                </Link>
              ))}
            </div>
            <h2 className="section-title mt-6">Technologies used</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.technologies.map((t) => (
                <Badge key={t.id} tone="amber">{t.name}</Badge>
              ))}
            </div>
          </div>

          {/* Related jobs — the multi-hop payoff */}
          <div className="card p-6">
            <h2 className="section-title">Related jobs <span className="font-normal text-slate-400">— share the most skills with this job (2-hop)</span></h2>
            {relatedError ? (
              <InlineError className="mt-3" error={relatedError} onRetry={reloadRelated} label="Could not load related jobs" />
            ) : related && related.length === 0 ? (
              <EmptyState title="No related jobs" description="This job has a unique skill combination." icon="🔗" />
            ) : (
              <ul className="mt-3 divide-y divide-slate-100">
                {related?.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link to={`/jobs/${r.id}`} className="truncate font-semibold text-slate-800 hover:text-brand-700">
                        {r.title}
                      </Link>
                      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                        <span>{r.companyName}</span>
                        {r.location && <span>· {r.location.city}</span>}
                        <span className="text-slate-300">·</span>
                        <span className="font-medium text-emerald-600">{r.sharedSkills} shared skill{r.sharedSkills === 1 ? '' : 's'}</span>
                        <span className="hidden sm:inline text-slate-400">({r.sharedSkillNames?.slice(0, 3).join(', ')})</span>
                      </p>
                    </div>
                    <Link to={`/graph?job=${r.id}`} className="btn-ghost shrink-0 text-xs">Graph →</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <CompanyAvatar name={company?.name} size="lg" />
              <div className="min-w-0">
                <p className="text-xs text-slate-400">Posted by</p>
                <Link to={`/companies/${company?.id}`} className="block truncate font-bold text-slate-900 hover:text-brand-700">
                  {company?.name}
                </Link>
                {job.industry && <Badge tone="rose" className="mt-1">{job.industry.name}</Badge>}
              </div>
            </div>
            {company?.website && (
              <a href={company.website} target="_blank" rel="noreferrer" className="link mt-3 block truncate text-xs">
                {company.website}
              </a>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-2 section-title">Details</h2>
            <div className="divide-y divide-slate-100">
              <DetailRow label="Salary" value={salaryWithCurrency(job)} />
              <DetailRow label="Experience" value={job.experienceLevel} />
              <DetailRow label="Employment" value={job.employmentType} />
              <DetailRow label="Work mode" value={job.remoteType} />
              <DetailRow label="Location" value={job.location ? `${job.location.city}${job.location.state ? `, ${job.location.state}` : ''}` : '—'} />
              <DetailRow label="Country" value={job.location?.country || '—'} />
              <DetailRow label="Posted" value={timeAgo(job.postedAt)} />
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 section-title">Why you'd match</h2>
            {match === null ? (
              <p className="text-sm text-slate-500">
                Add your skills on the <Link to="/match" className="link">Job Match</Link> page and every job card shows your match percentage.
              </p>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Match</span>
                  <span className="text-lg font-extrabold text-brand-600">{match}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${match}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {job.skills.filter((s) => userSkills.includes(s.id)).length} of {job.skills.length} required skills are in your profile.
                </p>
              </>
            )}
          </div>

          <Link to={`/graph?job=${job.id}`} className="btn-primary w-full">
            Explore connections →
          </Link>
        </div>
      </div>
    </div>
  );
}
