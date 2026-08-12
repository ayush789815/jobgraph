import { runQuery } from '../config/database.js';
import { toPlain } from '../utils/neo4j.js';
import {
  COMPANY_JOBS,
  COMPANY_LOCATIONS,
  COMPANY_SKILLS,
  COMPANY_TECHNOLOGIES,
  GET_COMPANY_BY_ID,
  LIST_COMPANIES,
} from '../queries/companyQueries.js';
import { AppError } from '../middleware/errors.js';

const DEFAULT_LIMIT = 50;

export async function listCompanies() {
  const records = await runQuery(LIST_COMPANIES);
  return records.map((r) => {
    const c = toPlain(r.get('c'));
    const i = toPlain(r.get('i'));
    return {
      id: c.id,
      name: c.name,
      logo: c.logo || '',
      website: c.website || '',
      description: c.description,
      jobCount: toPlain(r.get('jobCount')),
      industry: i ? { id: i.id, name: i.name } : null,
    };
  });
}

export async function getCompanyById(id) {
  const records = await runQuery(GET_COMPANY_BY_ID, { id });
  if (records.length === 0) {
    throw new AppError(`Company "${id}" was not found.`, 404, 'COMPANY_NOT_FOUND');
  }
  const r = records[0];
  const c = toPlain(r.get('c'));
  const i = toPlain(r.get('i'));
  return {
    id: c.id,
    name: c.name,
    logo: c.logo || '',
    website: c.website || '',
    description: c.description,
    industry: i ? { id: i.id, name: i.name } : null,
  };
}

export async function getCompanyJobs(id, limit = DEFAULT_LIMIT) {
  const records = await runQuery(COMPANY_JOBS, { id, limit });
  return records.map((r) => {
    const j = toPlain(r.get('j'));
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
      location: l ? { id: l.id, city: l.city, state: l.state, country: l.country } : null,
      // Skills come along so job cards can show badges and match percentages.
      skills: (r.get('skills') || []).map((n) => toPlain(n)),
    };
  });
}

export async function getCompanySkills(id, limit = DEFAULT_LIMIT) {
  const records = await runQuery(COMPANY_SKILLS, { id, limit });
  return records.map((r) => ({
    ...pickNode(r.get('s')),
    jobCount: toPlain(r.get('jobCount')),
  }));
}

export async function getCompanyTechnologies(id, limit = DEFAULT_LIMIT) {
  const records = await runQuery(COMPANY_TECHNOLOGIES, { id, limit });
  return records.map((r) => ({
    ...pickNode(r.get('t')),
    jobCount: toPlain(r.get('jobCount')),
  }));
}

export async function getCompanyLocations(id) {
  const records = await runQuery(COMPANY_LOCATIONS, { id });
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

function pickNode(node) {
  const n = toPlain(node);
  return { id: n.id, name: n.name, category: n.category || '' };
}
