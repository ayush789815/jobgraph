import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import { useUserSkills } from '../hooks/useUserSkills.js';
import StatCard from '../components/StatCard.jsx';
import JobCard from '../components/JobCard.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { Badge } from '../components/Badge.jsx';
import { GridSkeleton, StatSkeleton } from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';

const STATS = [
  { key: 'jobs', label: 'Open jobs', icon: '💼', to: '/jobs', accent: 'bg-indigo-50 text-indigo-600' },
  { key: 'companies', label: 'Companies', icon: '🏢', to: '/companies', accent: 'bg-violet-50 text-violet-600' },
  { key: 'skills', label: 'Skills', icon: '🧠', to: '/skills', accent: 'bg-emerald-50 text-emerald-600' },
  { key: 'technologies', label: 'Technologies', icon: '⚙️', to: '/skills', accent: 'bg-amber-50 text-amber-600' },
  { key: 'locations', label: 'Locations', icon: '📍', to: '/jobs', accent: 'bg-sky-50 text-sky-600' },
  { key: 'industries', label: 'Industries', icon: '🌐', to: '/companies', accent: 'bg-rose-50 text-rose-600' },
];

export default function DashboardPage() {
  const { data, loading, error, reload } = useApi(() => api.get('/stats'));
  const { skills: userSkills } = useUserSkills();

  return (
    <div>
      {/* Hero */}
      <div className="card mb-6 overflow-hidden bg-gradient-to-br from-brand-600 via-brand-600 to-indigo-800 !border-transparent px-6 py-8 text-white sm:px-8">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Explore jobs through their connections</h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-100 sm:text-base">
          Every job in JobGraph is a node in a graph. Follow the edges between skills, technologies,
          companies and locations to discover opportunities you would never find with a keyword search.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/jobs" className="btn bg-white text-brand-700 hover:bg-brand-50">
            Browse jobs
          </Link>
          <Link to="/match" className="btn border border-white/40 text-white hover:bg-white/10">
            Match my skills
          </Link>
        </div>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {STATS.map((s) => (
              <StatCard key={s.key} label={s.label} value={data.counts[s.key] ?? 0} icon={s.icon} to={s.to} accent={s.accent} />
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Popular skills */}
            <section className="card p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="section-title">Most in-demand skills</h2>
                <Link to="/skills" className="link text-xs">View all skills</Link>
              </div>
              {data.popularSkills.length === 0 ? (
                <EmptyState title="No skills yet" description="Seed the database to see popular skills here." icon="🧠" />
              ) : (
                <ul className="space-y-3">
                  {data.popularSkills.map((skill, i) => {
                    const max = data.popularSkills[0].jobCount || 1;
                    return (
                      <li key={skill.id}>
                        <Link to={`/skills/${skill.id}`} className="group block">
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-semibold text-slate-700 group-hover:text-emerald-700">
                              <span className="mr-2 text-xs font-bold text-slate-300">{i + 1}</span>
                              {skill.name}
                            </span>
                            <span className="text-xs font-medium tabular-nums text-slate-400">
                              {skill.jobCount} job{skill.jobCount === 1 ? '' : 's'}
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                              style={{ width: `${Math.max(4, (skill.jobCount / max) * 100)}%` }}
                            />
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Popular technologies */}
            <section className="card p-5">
              <h2 className="mb-4 section-title">Popular technologies</h2>
              {data.popularTechnologies.length === 0 ? (
                <EmptyState title="No technologies yet" description="Seed the database to populate this section." icon="⚙️" />
              ) : (
                <ul className="space-y-3">
                  {data.popularTechnologies.map((t, i) => {
                    const max = data.popularTechnologies[0].jobCount || 1;
                    return (
                      <li key={t.id}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-semibold text-slate-700">
                            <span className="mr-2 text-xs font-bold text-slate-300">{i + 1}</span>
                            {t.name}
                          </span>
                          <span className="text-xs font-medium tabular-nums text-slate-400">
                            {t.jobCount} job{t.jobCount === 1 ? '' : 's'}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
                            style={{ width: `${Math.max(4, (t.jobCount / max) * 100)}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        </>
      )}

      {/* Recent jobs */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title text-base">Recently posted jobs</h2>
          <Link to="/jobs" className="link text-sm">Browse all</Link>
        </div>
        {loading ? (
          <GridSkeleton cols={3} rows={2} />
        ) : error ? null : data.recentJobs.length === 0 ? (
          <EmptyState title="No jobs yet" description="Run the seed script to load realistic jobs into the graph." icon="💼" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.recentJobs.map((job) => (
              <JobCard key={job.id} job={job} userSkills={userSkills} showMatch />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
