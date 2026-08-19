import { runQuery } from '../config/database.js';
import { toPlain } from '../utils/neo4j.js';
import { firstOrThrow, toCompany, toCountedNode, toIndustry, toJobSummary, toNamedNode } from '../utils/mappers.js';
import { GET_SKILL_BY_ID, LIST_SKILLS, SKILL_COMPANIES, SKILL_JOBS } from '../queries/skillQueries.js';

const DEFAULT_JOBS_LIMIT = 50;

export async function listSkills() {
  const records = await runQuery(LIST_SKILLS);
  return records.map((r) => toCountedNode(r, 's'));
}

export async function getSkillById(id) {
  const r = firstOrThrow(await runQuery(GET_SKILL_BY_ID, { id }), 'Skill', id);
  return {
    ...toNamedNode(r.get('s')),
    jobCount: toPlain(r.get('jobCount')),
    companyCount: toPlain(r.get('companyCount')),
    relatedSkills: toPlain(r.get('relatedSkills')).map(toNamedNode),
  };
}

/** Jobs requiring this skill (1 hop). */
export async function getSkillJobs(id, limit = DEFAULT_JOBS_LIMIT) {
  const records = await runQuery(SKILL_JOBS, { id, limit });
  return records.map((r) => toJobSummary(r.get('j'), r.get('c'), r.get('l')));
}

/** Companies with open jobs that require this skill (2 hops). */
export async function getSkillCompanies(id) {
  const records = await runQuery(SKILL_COMPANIES, { id });
  return records.map((r) => ({
    ...toCompany(r.get('c')),
    openJobs: toPlain(r.get('openJobs')),
    industry: toIndustry(r.get('i')),
  }));
}
