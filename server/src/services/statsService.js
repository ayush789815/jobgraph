import { runQuery } from '../config/database.js';
import { toPlain } from '../utils/neo4j.js';
import { toCountedNode, toJobSummary, toLocation, toPlainList } from '../utils/mappers.js';
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
    popularSkills: skillRecords.map((r) => toCountedNode(r, 's')),
    popularTechnologies: techRecords.map((r) => toCountedNode(r, 't')),
    recentJobs: recentRecords.map((r) => ({
      ...toJobSummary(r.get('j'), r.get('c'), r.get('l')),
      skills: toPlainList(r, 'skills'),
    })),
  };
}

export async function listLocations() {
  const records = await runQuery(ALL_LOCATIONS);
  return records.map((r) => ({
    ...toLocation(r.get('l')),
    jobCount: toPlain(r.get('jobCount')),
  }));
}
