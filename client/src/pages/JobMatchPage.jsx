import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import { useUserSkills } from '../hooks/useUserSkills.js';
import PageHeader from '../components/PageHeader.jsx';
import SearchInput from '../components/SearchInput.jsx';
import Chip from '../components/Chip.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { Badge } from '../components/Badge.jsx';
import { GridSkeleton } from '../components/Skeleton.jsx';
import { cx, formatSalary } from '../utils/format.js';

export default function JobMatchPage() {
  const { skills, toggleSkill } = useUserSkills();
  const { data: allSkills } = useApi(() => api.get('/skills'));
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filteredSkills = useMemo(() => {
    if (!allSkills) return [];
    const query = q.trim().toLowerCase();
    if (!query) return allSkills;
    return allSkills.filter((s) => s.name.toLowerCase().includes(query));
  }, [allSkills, q]);

  const runMatch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post('/jobs/match', { skillIds: skills });
      setResults(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const hasSelection = skills.length > 0;

  return (
    <div>
      <PageHeader
        title="Job Match"
        subtitle="Select your skills and JobGraph computes a transparent match percentage against every open job."
        icon="🎯"
      />

      {/* Skill picker */}
      <div className="card mb-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="section-title">Your skills</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Picked {skills.length} skill{skills.length === 1 ? '' : 's'} — saved in your browser. Job cards show matches automatically.
            </p>
          </div>
          <button className="btn-primary" disabled={!hasSelection || loading} onClick={runMatch}>
            {loading ? 'Matching…' : `Match me (${skills.length})`}
          </button>
        </div>

        <SearchInput className="mt-4 max-w-sm" value={q} onChange={setQ} placeholder="Filter skills…" />

        <div className="mt-4 flex flex-wrap gap-2">
          {filteredSkills.map((s) => (
            <Chip key={s.id} active={skills.includes(s.id)} onClick={() => toggleSkill(s.id)} title={s.category}>
              {s.name}
            </Chip>
          ))}
          {filteredSkills.length === 0 && <p className="text-sm text-slate-400">No skills match "{q}".</p>}
        </div>
      </div>

      {/* Results */}
      {!hasSelection ? (
        <EmptyState
          title="Pick at least one skill to get started"
          description="Choose the technologies you know (try JavaScript, Python, or SQL) and see which jobs fit you best — with the math shown openly."
          icon="🎯"
        />
      ) : error ? (
        <ErrorState error={error} onRetry={runMatch} />
      ) : loading ? (
        <GridSkeleton cols={3} rows={2} />
      ) : results === null ? (
        <EmptyState
          title="Ready when you are"
          description="Hit “Match me” to score every open job against your skills. The percentage is computed by the graph: matched skills ÷ total required skills."
          icon="📊"
        />
      ) : results.length === 0 ? (
        <EmptyState title="No matches found" description="No open jobs require any of your selected skills. Try adding more skills." icon="🔍" />
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title text-base">{results.length} jobs ranked by match</h2>
            <p className="text-xs text-slate-400">Match = your matched skills ÷ job's total required skills</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((job) => {
              const matched = job.matchedSkillNames || [];
              const required = job.requiredSkills || [];
              return (
                <article key={job.id} className="card card-hover flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/jobs/${job.id}`} className="line-clamp-2 font-bold text-slate-900 hover:text-brand-700">{job.title}</Link>
                      <p className="mt-0.5 truncate text-sm text-slate-500">{job.companyName}</p>
                    </div>
                    <span
                      className={cx(
                        'shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums',
                        job.matchPercentage >= 75 ? 'bg-emerald-100 text-emerald-700' : job.matchPercentage >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600',
                      )}
                    >
                      {job.matchPercentage}%
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cx('h-full rounded-full', job.matchPercentage >= 75 ? 'bg-emerald-500' : job.matchPercentage >= 50 ? 'bg-amber-500' : 'bg-slate-400')}
                        style={{ width: `${job.matchPercentage}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{matched.length} of {job.totalSkills}</span> required skills matched
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {matched.map((name) => (
                      <Badge key={name} tone="emerald">{name}</Badge>
                    ))}
                  </div>
                  {job.totalSkills > matched.length && (
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                      Also required: {required.filter((n) => !matched.includes(n)).slice(0, 4).join(', ')}
                      {required.filter((n) => !matched.includes(n)).length > 4 ? '…' : ''}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <span>{formatSalary(job)}</span>
                    <span>{job.remoteType} · {job.experienceLevel}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link to={`/jobs/${job.id}`} className="btn-primary flex-1 !py-1.5 text-xs">View job</Link>
                    <Link to={`/graph?job=${job.id}`} className="btn-secondary !py-1.5 text-xs" title="Explore graph">Graph</Link>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
