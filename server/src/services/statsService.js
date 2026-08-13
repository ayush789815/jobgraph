import { runQuery } from '../config/database.js';
import { toPlain } from '../utils/neo4j.js';
import { ALL_LOCATIONS, NODE_COUNTS, POPULAR_SKILLS, POPULAR_TECHNOLOGIES, RECENT_JOBS } from '../queries/statsQueries.js';

const DEFAULT_POPULAR_LIMIT = 8;
const DEFAULT_RECENT_LIMIT = 6;

/** Dashboard payload: node counts, popular skills/technologies, recent jobs. */
export async function getDashboardStats() {
  const [countRecords, skillRecords, techRecords, recentRecords] = await Promise.all([
    runQuery(NODE_COUNTS),
    runQuery(POPULAR_SKILLS, { limit: DEFAULT_POPULAR_LIMIT }),
    runQuery(POPULAR_TECHNOLOGIES, { limit: DEFAULT_POPULAR_LIMIT }),
    runQuery(RECENT_JOBS, { limit: DEFAULT_RECENT_LIMIT }),
  ]);

  const counts = { jobs: 0, companies: 0, skills: 0, technologies: 0, locations: 0, industries: 0 };
  const labelToKey = {
    Job: 'jobs',
    Company: 'companies',
    Skill: 'skills',
    Technology: 'technologies',
    Location: 'locations',
    Industry: 'industries',
  };
  for (const r of countRecords) {
    const key = labelToKey[toPlain(r.get('type'))];
    if (key) counts[key] = toPlain(r.get('count'));
  }

  return {
    counts,
    popularSkills: skillRecords.map((r) => ({
      ...pick(r.get('s')),
      jobCount: toPlain(r.get('jobCount')),
    })),
    popularTechnologies: techRecords.map((r) => ({
      ...pick(r.get('t')),
      jobCount: toPlain(r.get('jobCount')),
    })),
    recentJobs: recentRecords.map((r) => {
      const j = toPlain(r.get('j'));
      const c = toPlain(r.get('c'));
      const l = toPlain(r.get('l'));
      return {
        id: j.id,
        title: j.title,
        employmentType: j.employmentType,
        experienceLevel: j.experienceLevel,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        salaryCurrency: j.salaryCurrency,
        remoteType: j.remoteType,
        postedAt: j.postedAt,
        companyName: c ? c.name : '',
        location: l ? { id: l.id, city: l.city, state: l.state, country: l.country } : null,
        skills: (r.get('skills') || []).map((n) => toPlain(n)),
      };
    }),
  };
}

export async function listLocations() {
  const records = await runQuery(ALL_LOCATIONS);
  return records.map((r) => {
    const l = toPlain(r.get('l'));
    return {
      id: l.id,
      city: l.city,
      state: l.state,
      country: l.country,
      jobCount: toPlain(r.get('jobCount')),
    };
  });
}

function pick(node) {
  const n = toPlain(node);
  return { id: n.id, name: n.name, category: n.category || '' };
}
