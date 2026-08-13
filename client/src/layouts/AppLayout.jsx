import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import SearchInput from '../components/SearchInput.jsx';
import { useDebouncedValue } from '../hooks/useDebounce.js';
import { cx } from '../utils/format.js';

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10', end: true },
  { to: '/jobs', label: 'Job Explorer', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { to: '/skills', label: 'Skills', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { to: '/companies', label: 'Companies', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { to: '/match', label: 'Job Match', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { to: '/graph', label: 'Graph Explorer', icon: 'M4 7h16M4 12h16M4 17h16M8 3v18M12 3v18M16 3v18', isGraph: true },
];

function NavIcon({ d, isGraph }) {
  if (isGraph) {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="5" r="2.2" fill="currentColor" stroke="none" />
        <circle cx="5" cy="17" r="2.2" fill="currentColor" stroke="none" />
        <circle cx="19" cy="17" r="2.2" fill="currentColor" stroke="none" />
        <path d="M12 7.2v3.4M7 15.4l2.6-3M17 15.4l-2.6-3M10.6 12.8h2.8" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebouncedValue(searchText, 400);
  const navigate = useNavigate();
  const prevSearch = useRef(debouncedSearch);

  // Debounced global search. Navigate only when the query *changes* — never on
  // mount (React StrictMode double-invokes effects in dev, which would
  // otherwise bounce every route to /jobs on first load). replace:true keeps
  // history clean; the Jobs page debounces its own fetch, so this doesn't fire
  // an API call per keystroke.
  useEffect(() => {
    const previous = prevSearch.current;
    prevSearch.current = debouncedSearch;
    if (previous === debouncedSearch) return; // mount / no change
    if (debouncedSearch) {
      navigate(`/jobs?q=${encodeURIComponent(debouncedSearch)}`, { replace: true });
    } else if (previous) {
      // Search was cleared after having been active — drop the query param.
      navigate('/jobs', { replace: true });
    }
  }, [debouncedSearch, navigate]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/" className="flex items-center gap-2.5 px-5 py-5" onClick={() => setSidebarOpen(false)}>
        <svg className="h-8 w-8" viewBox="0 0 32 32">
          <circle cx="16" cy="8" r="4" fill="#4f46e5" />
          <circle cx="8" cy="24" r="4" fill="#10b981" />
          <circle cx="24" cy="24" r="4" fill="#f59e0b" />
          <path d="M16 12v4M10 21l2-3M22 21l-2-3M13 19h6" stroke="#64748b" strokeWidth="2" fill="none" />
        </svg>
        <div>
          <p className="text-lg font-extrabold leading-tight tracking-tight text-slate-900">JobGraph</p>
          <p className="text-[11px] font-medium text-slate-400">Intelligent Job Explorer</p>
        </div>
      </Link>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-150',
                isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )
            }
          >
            <NavIcon d={item.icon} isGraph={item.isGraph} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <p className="text-[11px] leading-relaxed text-slate-400">
          Graph-powered job discovery — skills, technologies, companies &amp; opportunities.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              className="btn-ghost !px-2.5 lg:hidden"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <SearchInput
              className="max-w-md flex-1"
              placeholder="Search jobs, skills, companies…"
              value={searchText}
              onChange={setSearchText}
            />
            <Link to="/match" className="btn-primary hidden sm:inline-flex">
              Match me
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>

        <footer className="mx-auto max-w-7xl px-6 pb-8 text-center text-xs text-slate-400">
          JobGraph — built with React, Express &amp; CognoDB. Data lives in a graph, not a spreadsheet.
        </footer>
      </div>
    </div>
  );
}
