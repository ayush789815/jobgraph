import { runQuery } from '../config/database.js';
import { toPlain } from '../utils/neo4j.js';
import { GET_SKILL_BY_ID, LIST_SKILLS, SKILL_COMPANIES, SKILL_JOBS } from '../queries/skillQueries.js';
import { AppError } from '../middleware/errors.js';

const DEFAULT_JOBS_LIMIT = 50;

export async function listSkills() {
  const records = await runQuery(LIST_SKILLS);
  return records.map((r) => {
    const s = toPlain(r.get('s'));
    return {
      id: s.id,
      name: s.name,
      category: s.category,
      jobCount: toPlain(r.get('jobCount')),
    };
  });
}

export async function getSkillById(id) {
  const records = await runQuery(GET_SKILL_BY_ID, { id });
  if (records.length === 0) {
    throw new AppError(`Skill "${id}" was not found.`, 404, 'SKILL_NOT_FOUND');
  }
  const r = records[0];
  const s = toPlain(r.get('s'));
  return {
    id: s.id,
    name: s.name,
    category: s.category,
    jobCount: toPlain(r.get('jobCount')),
    companyCount: toPlain(r.get('companyCount')),
    relatedSkills: toPlain(r.get('relatedSkills')).map((rel) => ({ id: rel.id, name: rel.name, category: rel.category })),
  };
}

/** Jobs requiring this skill (1 hop). */
export async function getSkillJobs(id, limit = DEFAULT_JOBS_LIMIT) {
  const records = await runQuery(SKILL_JOBS, { id, limit });
  return records.map((r) => {
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
    };
  });
}

/** Companies with open jobs that require this skill (2 hops). */
export async function getSkillCompanies(id) {
  const records = await runQuery(SKILL_COMPANIES, { id });
  return records.map((r) => {
    const c = toPlain(r.get('c'));
    const i = toPlain(r.get('i'));
    return {
      id: c.id,
      name: c.name,
      logo: c.logo || '',
      website: c.website || '',
      openJobs: toPlain(r.get('openJobs')),
      industry: i ? { id: i.id, name: i.name } : null,
    };
  });
}
