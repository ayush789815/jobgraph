import { Link, useParams } from 'react-router-dom';
import api from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import { Badge } from '../components/Badge.jsx';
import { CompanyAvatar } from '../components/JobCard.jsx';
import ErrorState from '../components/ErrorState.jsx';
import InlineError from '../components/InlineError.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { CardSkeleton } from '../components/Skeleton.jsx';
import { formatSalary, timeAgo } from '../utils/format.js';

export default function SkillDetailsPage() {
  const { id } = useParams();
  const { data: skill, loading, error, reload } = useApi(() => api.get(`/skills/${id}`), [id]);
  const { data: jobs, error: jobsError, reload: reloadJobs } = useApi(() => api.get(`/skills/${id}/jobs`), [id]);
  const { data: companies, error: companiesError, reload: reloadCompanies } = useApi(
    () => api.get(`/skills/${id}/companies`),
    [id],
  );

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={reload}
        title={error.status === 404 ? 'Skill not found' : undefined}
        className="mx-auto max-w-2xl"
      />
    );
  }

  if (loading || !skill) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><CardSkeleton rows={5} /></div>
        <CardSkeleton rows={3} />
      </div>
    );
  }

  return (
    <div>
      <nav className="mb-4 text-xs text-slate-400">
        <Link to="/skills" className="hover:text-brand-600">Skills</Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-600">{skill.name}</span>
      </nav>

      {/* Header */}
      <div className="card mb-6 bg-gradient-to-br from-emerald-600 to-teal-700 !border-transparent p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{skill.name}</h1>
            <p className="mt-1 text-sm text-emerald-100">Category: {skill.category}</p>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-extrabold tabular-nums">{skill.jobCount}</p>
              <p className="text-xs text-emerald-100">open jobs</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold tabular-nums">{skill.companyCount}</p>
              <p className="text-xs text-emerald-100">companies hiring</p>
            </div>
          </div>
        </div>
        <Link to={`/graph?skill=${skill.id}`} className="btn mt-5 bg-white text-emerald-700 hover:bg-emerald-50">
          Explore connections →
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Companies hiring — 2-hop query result */}
          <section className="card p-6">
            <h2 className="section-title">
              Companies hiring for {skill.name}{' '}
              <span className="font-normal text-slate-400">— found by traversing Job → Skill → Company (2 hops)</span>
            </h2>
            {companiesError ? (
              <InlineError className="mt-4" error={companiesError} onRetry={reloadCompanies} label="Could not load companies" />
            ) : !companies ? null : companies.length === 0 ? (
              <EmptyState title="No companies hiring yet" description="This skill is not required by any current job." icon="🏢" />
            ) : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {companies.map((c) => (
                  <li key={c.id}>
                    <Link to={`/companies/${c.id}`} className="card card-hover flex items-center gap-3 p-4">
                      <CompanyAvatar name={c.name} />
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900">{c.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {c.openJobs} open job{c.openJobs === 1 ? '' : 's'}
                          {c.industry ? ` · ${c.industry.name}` : ''}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Jobs requiring this skill */}
          <section className="card p-6">
            <h2 className="mb-4 section-title">Open jobs requiring {skill.name}</h2>
            {jobsError ? (
              <InlineError error={jobsError} onRetry={reloadJobs} label="Could not load open jobs" />
            ) : !jobs ? null : jobs.length === 0 ? (
              <EmptyState title="No jobs require this skill yet" icon="💼" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {jobs.map((j) => (
                  <li key={j.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link to={`/jobs/${j.id}`} className="truncate font-semibold text-slate-800 hover:text-brand-700">{j.title}</Link>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {j.companyName}{j.location ? ` · ${j.location.city}` : ''} · {j.employmentType} · {timeAgo(j.postedAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{formatSalary(j)}</span>
                      <Link to={`/jobs/${j.id}`} className="btn-primary !px-3 !py-1.5 text-xs">View</Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Related skills */}
        <aside>
          <div className="card p-5">
            <h2 className="mb-3 section-title">Related skills</h2>
            {skill.relatedSkills.length === 0 ? (
              <p className="text-sm text-slate-500">No related skills recorded.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skill.relatedSkills.map((r) => (
                  <Link
                    key={r.id}
                    to={`/skills/${r.id}`}
                    className="badge bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 transition-colors hover:bg-emerald-100"
                  >
                    {r.name}
                  </Link>
                ))}
              </div>
            )}
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Related skills are connected with :RELATED_TO edges, so you can hop from one skill to
              an adjacent one and discover entire new career paths.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
