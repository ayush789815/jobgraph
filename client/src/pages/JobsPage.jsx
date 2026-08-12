import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import { useDebouncedValue } from '../hooks/useDebounce.js';
import { useUserSkills } from '../hooks/useUserSkills.js';
import PageHeader from '../components/PageHeader.jsx';
import SearchInput from '../components/SearchInput.jsx';
import SelectField from '../components/SelectField.jsx';
import Chip from '../components/Chip.jsx';
import JobCard from '../components/JobCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { GridSkeleton } from '../components/Skeleton.jsx';

const PAGE_SIZE = 30;

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');
  const debouncedQ = useDebouncedValue(q, 350);
  const [skillIds, setSkillIds] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [remoteType, setRemoteType] = useState('');
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState('newest');
  const [offset, setOffset] = useState(0);
  const { skills: userSkills } = useUserSkills();

  const { data: skillOptions } = useApi(() => api.get('/skills'), []);
  const { data: locations } = useApi(() => api.get('/locations'), []);

  const hasActiveFilters =
    debouncedQ || skillIds.length > 0 || experienceLevel || employmentType || remoteType || location;

  // Keep the URL in sync with the search box only.
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedQ) params.set('q', debouncedQ);
    else params.delete('q');
    setSearchParams(params, { replace: true });
  }, [debouncedQ, setSearchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset pagination when filters change.
  useEffect(() => setOffset(0), [debouncedQ, skillIds, experienceLevel, employmentType, remoteType, location, sort]);

  const fetchJobs = useCallback(
    () =>
      api.get('/jobs', {
        params: {
          q: debouncedQ || undefined,
          skills: skillIds.length ? skillIds : undefined,
          experienceLevel: experienceLevel || undefined,
          employmentType: employmentType || undefined,
          remoteType: remoteType || undefined,
          location: location || undefined,
          sort,
          limit: PAGE_SIZE,
          offset,
        },
      }),
    [debouncedQ, skillIds, experienceLevel, employmentType, remoteType, location, sort, offset],
  );

  const { data: jobs, loading, error, reload } = useApi(fetchJobs, [debouncedQ, skillIds, experienceLevel, employmentType, remoteType, location, sort, offset]);

  const clearAll = () => {
    setQ('');
    setSkillIds([]);
    setExperienceLevel('');
    setEmploymentType('');
    setRemoteType('');
    setLocation('');
  };

  const toggleSkill = useCallback(
    (id) => setSkillIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id])),
    [],
  );

  const resultCount = useMemo(() => jobs?.length ?? 0, [jobs]);

  return (
    <div>
      <PageHeader
        title="Job Explorer"
        subtitle="Search and filter jobs, then follow their skills into related opportunities."
        icon="💼"
        actions={
          hasActiveFilters ? (
            <button className="btn-ghost text-xs" onClick={clearAll}>
              Clear filters
            </button>
          ) : null
        }
      />

      {/* Search + sort */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <SearchInput className="flex-1" value={q} onChange={setQ} placeholder="Search by title, description, or company…" />
        <SelectField
          className="sm:w-44"
          value={sort}
          onChange={setSort}
          options={[
            { value: 'newest', label: 'Newest first' },
            { value: 'salary', label: 'Highest salary' },
          ]}
        />
      </div>

      {/* Filters */}
      <div className="card mb-5 p-4">
        <p className="label">Skills</p>
        {!skillOptions || skillOptions.length === 0 ? (
          <p className="text-xs text-slate-400">No skills available.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skillOptions.slice(0, 24).map((s) => (
              <Chip key={s.id} active={skillIds.includes(s.id)} onClick={() => toggleSkill(s.id)} title={`${s.jobCount} open jobs`}>
                {s.name}
                <span className="opacity-60">{s.jobCount}</span>
              </Chip>
            ))}
          </div>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <SelectField
            label="Experience"
            value={experienceLevel}
            onChange={setExperienceLevel}
            placeholder="Any level"
            options={[
              { value: 'Entry', label: 'Entry' },
              { value: 'Mid', label: 'Mid' },
              { value: 'Senior', label: 'Senior' },
              { value: 'Lead', label: 'Lead' },
            ]}
          />
          <SelectField
            label="Employment"
            value={employmentType}
            onChange={setEmploymentType}
            placeholder="Any type"
            options={[
              { value: 'Full-time', label: 'Full-time' },
              { value: 'Contract', label: 'Contract' },
              { value: 'Part-time', label: 'Part-time' },
              { value: 'Internship', label: 'Internship' },
            ]}
          />
          <SelectField
            label="Work mode"
            value={remoteType}
            onChange={setRemoteType}
            placeholder="Any mode"
            options={[
              { value: 'Remote', label: 'Remote' },
              { value: 'Hybrid', label: 'Hybrid' },
              { value: 'On-site', label: 'On-site' },
            ]}
          />
          <SelectField
            label="Location"
            value={location}
            onChange={setLocation}
            placeholder="Any city"
            options={(locations || []).map((l) => ({ value: l.city, label: `${l.city}${l.state ? `, ${l.state}` : ''}` }))}
          />
        </div>
      </div>

      {/* Results */}
      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading ? (
        <GridSkeleton cols={3} rows={2} />
      ) : resultCount === 0 ? (
        <EmptyState
          title="No jobs match those filters"
          description={hasActiveFilters ? 'Try removing a filter or searching for something else.' : 'Run the seed script to load jobs into the graph.'}
          action={hasActiveFilters ? <button className="btn-secondary" onClick={clearAll}>Clear all filters</button> : null}
        />
      ) : (
        <>
          <p className="mb-3 text-xs font-medium text-slate-400">
            Showing {offset + 1}–{offset + resultCount} of your filtered results{hasActiveFilters ? ' (all matches shown, newest first)' : ''}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} userSkills={userSkills} showMatch />
            ))}
          </div>
          {resultCount === PAGE_SIZE && (
            <div className="mt-6 text-center">
              <button className="btn-secondary" onClick={() => setOffset((o) => o + PAGE_SIZE)}>
                Load more jobs
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
