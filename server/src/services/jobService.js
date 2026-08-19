import { runQuery } from '../config/database.js';
import { toPlain } from '../utils/neo4j.js';
import {
  firstOrThrow,
  toCompany,
  toIndustry,
  toJobSummary,
  toNamedNode,
  toPlainList,
} from '../utils/mappers.js';
import { buildJobsQuery, GET_JOB_BY_ID, MATCH_JOBS, RELATED_JOBS } from '../queries/jobQueries.js';

const DEFAULT_RELATED_LIMIT = 10;
const DEFAULT_MATCH_LIMIT = 20;

export async function listJobs(filters) {
  const { cypher, params } = buildJobsQuery(filters);
  const records = await runQuery(cypher, params);
  return records.map((r) => mapJobRow(r, { withDescription: false }));
}

export async function getJobById(id) {
  const records = await runQuery(GET_JOB_BY_ID, { id });
  const record = firstOrThrow(records, 'Job', id, 'It may have been removed.');
  return mapJobRow(record, { withDescription: true });
}

/** Related jobs via shared skills (2-hop). Returns an array of related-job summaries. */
export async function getRelatedJobs(jobId, limit = DEFAULT_RELATED_LIMIT) {
  const records = await runQuery(RELATED_JOBS, { jobId, limit });
  return records.map((r) => ({
    ...toJobSummary(r.get('j2'), r.get('c'), r.get('l')),
    sharedSkills: toPlain(r.get('sharedSkills')),
    sharedSkillNames: toPlain(r.get('sharedSkillNames')),
  }));
}

/** Skill-based job matching with a transparent match percentage. */
export async function matchJobs(skillIds, limit = DEFAULT_MATCH_LIMIT) {
  const records = await runQuery(MATCH_JOBS, { skillIds, limit });
  // Note: MATCH_JOBS does not select skill/technology columns, so match rows
  // intentionally carry empty skills/technologies arrays — the client uses
  // matchedSkillNames/requiredSkills instead. mapJobRow tolerates that via
  // toPlainList's has() guard.
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
  return {
    ...toJobSummary(j, record.get('c'), record.get('l')),
    skills: toPlainList(record, 'skills').map(toNamedNode),
    technologies: toPlainList(record, 'technologies').map(toNamedNode),
    company: toCompany(record.get('c')),
    industry: record.has('i') ? toIndustry(record.get('i')) : null,
    ...(withDescription ? { description: j.description } : {}),
  };
}
