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

/** "1 job" / "4 jobs" — count plus the correctly pluralized noun. */
export function pluralize(count, noun, plural = `${noun}s`) {
  return `${count} ${count === 1 ? noun : plural}`;
}

/**
 * "Berlin, BE" from a location node. `include` picks the qualifier appended
 * after the city ('state', 'country' or 'none'); `fallback` is used when the
 * job has no location at all (i.e. it is remote).
 */
export function formatLocation(location, { fallback = '—', include = 'state' } = {}) {
  if (!location || !location.city) return fallback;
  const qualifier = include === 'none' ? null : location[include];
  return qualifier ? `${location.city}, ${qualifier}` : location.city;
}

/** "USES_TECH" -> "uses tech" for graph relationship labels. */
export function humanizeRelationship(relationship) {
  return String(relationship || '').replace(/_/g, ' ').toLowerCase();
}

/** Salary range with currency prefix (e.g. "$110k – $150k"). */
export function salaryWithCurrency(job) {
  const range = formatSalary(job);
  if (range === '—' || !job?.salaryCurrency) return range;
  const symbol = job.salaryCurrency === 'USD' ? '$' : `${job.salaryCurrency} `;
  return symbol === '$' ? range : `${symbol}${range}`;
}
