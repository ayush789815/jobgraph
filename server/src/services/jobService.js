import { runQuery } from '../config/database.js';
import { toPlain } from '../utils/neo4j.js';
import { buildJobsQuery, GET_JOB_BY_ID, MATCH_JOBS, RELATED_JOBS } from '../queries/jobQueries.js';
import { AppError } from '../middleware/errors.js';

const DEFAULT_RELATED_LIMIT = 10;
const DEFAULT_MATCH_LIMIT = 20;

export async function listJobs(filters) {
  const { cypher, params } = buildJobsQuery(filters);
  const records = await runQuery(cypher, params);
  return records.map((r) => mapJobRow(r, { withDescription: false }));
}

export async function getJobById(id) {
  const records = await runQuery(GET_JOB_BY_ID, { id });
  if (records.length === 0) {
    throw new AppError(`Job "${id}" was not found. It may have been removed.`, 404, 'JOB_NOT_FOUND');
  }
  return mapJobRow(records[0], { withDescription: true });
}

/** Related jobs via shared skills (2-hop). Returns an array of related-job summaries. */
export async function getRelatedJobs(jobId, limit = DEFAULT_RELATED_LIMIT) {
  const records = await runQuery(RELATED_JOBS, { jobId, limit });
  return records.map((r) => {
    const j = toPlain(r.get('j2'));
    const c = toPlain(r.get('c'));
    return {
      ...mapJobCore(j, c, r.get('l')),
      sharedSkills: toPlain(r.get('sharedSkills')),
      sharedSkillNames: toPlain(r.get('sharedSkillNames')),
    };
  });
}

/** Skill-based job matching with a transparent match percentage. */
export async function matchJobs(skillIds, limit = DEFAULT_MATCH_LIMIT) {
  const records = await runQuery(MATCH_JOBS, { skillIds, limit });
  // Note: MATCH_JOBS does not select skill/technology columns, so match rows
  // intentionally carry empty skills/technologies arrays — the client uses
  // matchedSkillNames/requiredSkills instead. mapJobRow tolerates that via
  // record.get(...) || [].
  return records.map((r) => ({
    ...mapJobRow(r, { withDescription: false }),
    matchingSkills: toPlain(r.get('matchingSkills')),
    matchedSkillNames: toPlain(r.get('matchedSkillNames')),
    totalSkills: toPlain(r.get('totalSkills')),
    requiredSkills: toPlain(r.get('requiredSkills')),
    matchPercentage: toPlain(r.get('matchPercentage')),
  }));
}

/* ------------------------------------------------------------------ */

function mapJobRow(record, { withDescription }) {
  const j = toPlain(record.get('j'));
  const c = toPlain(record.get('c'));
  const core = mapJobCore(j, c, record.get('l'));
  // Some queries (MATCH_JOBS) intentionally omit skill/technology columns;
  // the driver throws on record.get of a missing key, so guard with has().
  const skills = (record.has('skills') ? record.get('skills') : []).map((n) => toPlain(n));
  const technologies = (record.has('technologies') ? record.get('technologies') : []).map((n) => toPlain(n));
  const industry = record.has('i') ? toPlain(record.get('i')) : null;

  return {
    ...core,
    skills: skills.map((s) => ({ id: s.id, name: s.name, category: s.category })),
    technologies: technologies.map((t) => ({ id: t.id, name: t.name, category: t.category })),
    company: c ? { id: c.id, name: c.name, logo: c.logo || '', website: c.website || '' } : null,
    location: core.location,
    industry: industry ? { id: industry.id, name: industry.name } : null,
    ...(withDescription ? { description: j.description } : {}),
  };
}

function mapJobCore(j, c, lRaw) {
  const l = lRaw ? toPlain(lRaw) : null;
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
}
