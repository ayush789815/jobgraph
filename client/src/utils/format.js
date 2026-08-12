/** "$110k – $150k" from a job object (or "—" when unknown). */
export function formatSalary(job) {
  if (!job || !job.salaryMin || !job.salaryMax) return '—';
  const fmt = (n) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n.toLocaleString()}`);
  return `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`;
}

/** "3d ago", "2h ago", etc. from an ISO date string. */
export function timeAgo(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/** "Nimbus Labs" -> "NL" for avatar circles. */
export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/** Joins class names, ignoring falsy values. */
export function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

/** Salary range with currency prefix (e.g. "$110k – $150k"). */
export function salaryWithCurrency(job) {
  const range = formatSalary(job);
  if (range === '—' || !job?.salaryCurrency) return range;
  const symbol = job.salaryCurrency === 'USD' ? '$' : `${job.salaryCurrency} `;
  return symbol === '$' ? range : `${symbol}${range}`;
}
