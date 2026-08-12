import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import PageHeader from '../components/PageHeader.jsx';
import SearchInput from '../components/SearchInput.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { CardSkeleton } from '../components/Skeleton.jsx';
import { Badge } from '../components/Badge.jsx';

export default function SkillsPage() {
  const { data: skills, loading, error, reload } = useApi(() => api.get('/skills'));
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    if (!skills) return [];
    const query = q.trim().toLowerCase();
    if (!query) return skills;
    return skills.filter((s) => s.name.toLowerCase().includes(query) || s.category.toLowerCase().includes(query));
  }, [skills, q]);

  return (
    <div>
      <PageHeader
        title="Skill Explorer"
        subtitle={`${skills?.length ?? 0} skills — each one is a node connected to the jobs that require it.`}
        icon="🧠"
      />

      <SearchInput className="mb-5 max-w-md" value={q} onChange={setQ} placeholder="Search skills or categories…" />

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <CardSkeleton key={i} rows={2} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No skills found" description={`Nothing matches "${q}". Try a different search.`} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((skill) => (
            <Link key={skill.id} to={`/skills/${skill.id}`} className="card card-hover p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate font-bold text-slate-900">{skill.name}</h3>
                <Badge tone="emerald" className="shrink-0">{skill.jobCount} jobs</Badge>
              </div>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">{skill.category}</p>
              <p className="mt-3 text-xs font-medium text-brand-600">Explore →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
