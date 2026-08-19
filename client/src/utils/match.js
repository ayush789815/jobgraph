/**
 * Skill-match helpers shared by the job cards, the match page and job details.
 * The 75% / 50% thresholds were repeated in each of those places, so both the
 * percentage and the colours it maps to live here.
 */

const TONES = [
  { min: 75, tone: 'emerald', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
  { min: 50, tone: 'amber', badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' },
  { min: 0, tone: 'slate', badge: 'bg-slate-100 text-slate-600', bar: 'bg-slate-400' },
];

/** Computes a client-side match % between a job's skills and the user's skills. */
export function computeMatch(job, userSkills) {
  if (!userSkills || userSkills.length === 0) return null;
  const required = job.skills || [];
  if (required.length === 0) return null;
  const matched = required.filter((s) => userSkills.includes(s.id)).length;
  return Math.round((matched / required.length) * 100);
}

/** Badge tone plus the badge/bar classes for a match percentage. */
export function matchTone(percent) {
  return TONES.find((t) => percent >= t.min) || TONES[TONES.length - 1];
}
