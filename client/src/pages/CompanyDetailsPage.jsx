import { Link, useParams } from 'react-router-dom';
import api from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import { useUserSkills } from '../hooks/useUserSkills.js';
import { CompanyAvatar } from '../components/JobCard.jsx';
import JobCard from '../components/JobCard.jsx';
import { Badge } from '../components/Badge.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { CardSkeleton, GridSkeleton } from '../components/Skeleton.jsx';
import { formatLocation, pluralize } from '../utils/format.js';

export default function CompanyDetailsPage() {
  const { id } = useParams();
  const { skills: userSkills } = useUserSkills();
  const { data: company, loading, error, reload } = useApi(() => api.get(`/companies/${id}`), [id]);
  const { data: details } = useApi(() => api.get(`/companies/${id}/jobs`), [id]);

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={reload}
        title={error.status === 404 ? 'Company not found' : undefined}
        className="mx-auto max-w-2xl"
      />
    );
  }

  if (loading || !company) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><CardSkeleton rows={5} /></div>
        <CardSkeleton rows={4} />
      </div>
    );
  }

  const jobs = details?.jobs || [];
  const skills = details?.skills || [];
  const technologies = details?.technologies || [];
  const locations = details?.locations || [];

  return (
    <div>
      <nav className="mb-4 text-xs text-slate-400">
        <Link to="/companies" className="hover:text-brand-600">Companies</Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-600">{company.name}</span>
      </nav>

      <div className="card mb-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <CompanyAvatar name={company.name} size="lg" />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{company.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {company.industry && <Badge tone="rose">{company.industry.name}</Badge>}
                <Badge tone="violet">{jobs.length} open jobs</Badge>
                {company.website && (
                  <a href={company.website} target="_blank" rel="noreferrer" className="link text-xs">{company.website}</a>
                )}
              </div>
            </div>
          </div>
          <Link to={`/graph?company=${company.id}`} className="btn-primary shrink-0">
            Explore connections →
          </Link>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{company.description}</p>
      </div>

      {/* Aggregates */}
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="mb-3 section-title">Hiring locations</h2>
          {locations.length === 0 ? (
            <p className="text-sm text-slate-500">No locations recorded.</p>
          ) : (
            <ul className="space-y-2">
              {locations.map((l) => (
                <li key={l.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{formatLocation(l)} · {l.country}</span>
                  <Badge tone="sky">{pluralize(l.jobCount, 'job')}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-3 section-title">In-demand skills</h2>
          {skills.length === 0 ? (
            <p className="text-sm text-slate-500">No skills recorded.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <Link key={s.id} to={`/skills/${s.id}`} className="badge bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 transition-colors hover:bg-emerald-100" title={`${s.jobCount} open jobs`}>
                  {s.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-3 section-title">Tooling</h2>
          {technologies.length === 0 ? (
            <p className="text-sm text-slate-500">No technologies recorded.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {technologies.map((t) => (
                <Badge key={t.id} tone="amber" title={`${t.jobCount} open jobs`}>{t.name}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Open jobs */}
      <section>
        <h2 className="mb-4 section-title text-base">Open jobs at {company.name}</h2>
        {!details ? (
          <GridSkeleton cols={3} rows={2} />
        ) : jobs.length === 0 ? (
          <EmptyState title="No open jobs right now" description="Check back soon — or explore similar companies." icon="💼" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={{ ...job, company: { id: company.id, name: company.name } }} userSkills={userSkills} showMatch />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
