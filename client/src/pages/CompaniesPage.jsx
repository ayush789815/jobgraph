import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import PageHeader from '../components/PageHeader.jsx';
import { CompanyAvatar } from '../components/JobCard.jsx';
import { Badge } from '../components/Badge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { CardSkeleton } from '../components/Skeleton.jsx';
import { pluralize } from '../utils/format.js';

export default function CompaniesPage() {
  const { data: companies, loading, error, reload } = useApi(() => api.get('/companies'));

  return (
    <div>
      <PageHeader
        title="Company Explorer"
        subtitle={`${companies?.length ?? 0} companies — explore each one's open jobs, skills, and locations.`}
        icon="🏢"
      />

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} rows={3} />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <EmptyState title="No companies yet" description="Run the seed script to load companies into the graph." icon="🏢" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link key={company.id} to={`/companies/${company.id}`} className="card card-hover p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
              <div className="flex items-center gap-3">
                <CompanyAvatar name={company.name} />
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-slate-900">{company.name}</h3>
                  {company.industry && <Badge tone="rose" className="mt-0.5">{company.industry.name}</Badge>}
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{company.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="font-bold text-brand-600">{pluralize(company.jobCount, 'open job')}</span>
                <span className="link">View company →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
