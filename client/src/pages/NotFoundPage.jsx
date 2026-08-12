import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="card mx-auto max-w-lg px-6 py-16 text-center">
      <p className="text-5xl">🧭</p>
      <h1 className="mt-4 text-2xl font-extrabold text-slate-900">This node doesn't exist</h1>
      <p className="mt-2 text-sm text-slate-500">
        The page you're looking for isn't part of the graph. It may have been moved or never existed.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Link to="/" className="btn-primary">Back to dashboard</Link>
        <Link to="/jobs" className="btn-secondary">Browse jobs</Link>
      </div>
    </div>
  );
}
