import { Component } from 'react';

/**
 * Catches render-time errors so a component bug shows a readable message and a
 * way out instead of an empty white page.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] render failed:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="card flex max-w-lg flex-col items-center px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-2xl">⚠️</div>
          <h1 className="mt-4 text-base font-bold text-slate-900">JobGraph hit an unexpected error</h1>
          <p className="mt-1 text-sm text-slate-500">
            {error.message || 'The page could not be rendered.'}
          </p>
          <p className="mt-2 text-xs text-slate-400">Open the browser console for the full stack trace.</p>
          <button className="btn-secondary mt-5" onClick={() => window.location.reload()}>
            Reload the page
          </button>
        </div>
      </div>
    );
  }
}
