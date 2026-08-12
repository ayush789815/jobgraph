/**
 * Visual identity for the six node types — used by badges, cards, the graph
 * legend, and the force-directed graph so colors stay consistent everywhere.
 */
export const NODE_TYPES = {
  Job: {
    label: 'Job',
    dot: 'bg-indigo-500',
    badge: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    solid: '#6366f1',
    soft: '#eef2ff',
  },
  Company: {
    label: 'Company',
    dot: 'bg-violet-500',
    badge: 'bg-violet-50 text-violet-700 ring-violet-200',
    solid: '#8b5cf6',
    soft: '#f5f3ff',
  },
  Skill: {
    label: 'Skill',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    solid: '#10b981',
    soft: '#ecfdf5',
  },
  Technology: {
    label: 'Technology',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    solid: '#f59e0b',
    soft: '#fffbeb',
  },
  Location: {
    label: 'Location',
    dot: 'bg-sky-500',
    badge: 'bg-sky-50 text-sky-700 ring-sky-200',
    solid: '#0ea5e9',
    soft: '#f0f9ff',
  },
  Industry: {
    label: 'Industry',
    dot: 'bg-rose-500',
    badge: 'bg-rose-50 text-rose-700 ring-rose-200',
    solid: '#f43f5e',
    soft: '#fff1f2',
  },
};

export const NODE_TYPE_ORDER = ['Job', 'Company', 'Skill', 'Technology', 'Location', 'Industry'];

/** Relationship types that appear in the Graph Explorer. */
export const LINK_TYPES = [
  'REQUIRES',
  'USES_TECH',
  'POSTED_BY',
  'LOCATED_IN',
  'IN_INDUSTRY',
  'RELATED_TO',
  'SHARES_SKILLS',
];
