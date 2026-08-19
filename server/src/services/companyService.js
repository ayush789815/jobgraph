import { runQuery } from '../config/database.js';
import { toPlain } from '../utils/neo4j.js';
import {
  firstOrThrow,
  toCompany,
  toCountedNode,
  toIndustry,
  toJobSummary,
  toLocation,
  toPlainList,
} from '../utils/mappers.js';
import {
  COMPANY_JOBS,
  COMPANY_LOCATIONS,
  COMPANY_SKILLS,
  COMPANY_TECHNOLOGIES,
  GET_COMPANY_BY_ID,
  LIST_COMPANIES,
} from '../queries/companyQueries.js';

const DEFAULT_LIMIT = 50;

export async function listCompanies() {
  const records = await runQuery(LIST_COMPANIES);
  return records.map((r) => ({
    ...mapCompanyRow(r),
    jobCount: toPlain(r.get('jobCount')),
  }));
}

export async function getCompanyById(id) {
  const records = await runQuery(GET_COMPANY_BY_ID, { id });
  return mapCompanyRow(firstOrThrow(records, 'Company', id));
}

export async function getCompanyJobs(id, limit = DEFAULT_LIMIT) {
  const records = await runQuery(COMPANY_JOBS, { id, limit });
  return records.map((r) => ({
    ...toJobSummary(r.get('j'), r.get('c'), r.get('l')),
    // Skills come along so job cards can show badges and match percentages.
    skills: toPlainList(r, 'skills'),
  }));
}

export async function getCompanySkills(id, limit = DEFAULT_LIMIT) {
  const records = await runQuery(COMPANY_SKILLS, { id, limit });
  return records.map((r) => toCountedNode(r, 's'));
}

export async function getCompanyTechnologies(id, limit = DEFAULT_LIMIT) {
  const records = await runQuery(COMPANY_TECHNOLOGIES, { id, limit });
  return records.map((r) => toCountedNode(r, 't'));
}

export async function getCompanyLocations(id) {
  const records = await runQuery(COMPANY_LOCATIONS, { id });
  return records.map((r) => ({
    ...toLocation(r.get('l')),
    jobCount: toPlain(r.get('jobCount')),
  }));
}

function mapCompanyRow(record) {
  const c = toPlain(record.get('c'));
  return {
    ...toCompany(c),
    description: c.description,
    industry: toIndustry(record.get('i')),
  };
}
