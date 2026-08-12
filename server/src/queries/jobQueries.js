/**
 * Job queries.
 *
 * Every statement below is parameterized: user input (search text, skill ids,
 * filter values, pagination) is passed in `params` and bound with `$name`.
 * The query *shape* is assembled from a fixed, allow-listed set of fragments —
 * never from raw user strings — so there is no way to inject Cypher.
 */

/** Job-explorer listing with optional filters. */
export function buildJobsQuery({ q, skillIds, experienceLevel, employmentType, remoteType, location, sort, limit, offset }) {
  const parts = [];
  const params = {};
  const where = [];

  parts.push('MATCH (j:Job)-[:POSTED_BY]->(c:Company)');
  parts.push('MATCH (j)-[:LOCATED_IN]->(l:Location)');

  // Skill filter requires a dedicated MATCH (not optional) so we can filter on it.
  if (skillIds.length > 0) {
    params.skillIds = skillIds;
    parts.push('MATCH (j)-[:REQUIRES]->(f:Skill)');
    parts.push('WHERE f.id IN $skillIds');
    parts.push('WITH DISTINCT j, c, l');
  }

  parts.push('OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)');
  parts.push('OPTIONAL MATCH (j)-[:USES_TECH]->(t:Technology)');

  if (q) {
    params.q = q.toLowerCase();
    where.push('(toLower(j.title) CONTAINS $q OR toLower(j.description) CONTAINS $q OR toLower(c.name) CONTAINS $q)');
  }
  if (experienceLevel) {
    params.experienceLevel = experienceLevel;
    where.push('j.experienceLevel = $experienceLevel');
  }
  if (employmentType) {
    params.employmentType = employmentType;
    where.push('j.employmentType = $employmentType');
  }
  if (remoteType) {
    params.remoteType = remoteType;
    where.push('j.remoteType = $remoteType');
  }
  if (location) {
    params.location = location;
    where.push('l.city = $location');
  }
  if (where.length > 0) parts.push(`WHERE ${where.join(' AND ')}`);

  parts.push('RETURN j, c, l, collect(DISTINCT s) AS skills, collect(DISTINCT t) AS technologies');

  if (sort === 'salary') {
    parts.push('ORDER BY j.salaryMax DESC, j.postedAt DESC');
  } else {
    parts.push('ORDER BY j.postedAt DESC');
  }

  params.limit = limit;
  params.offset = offset;
  parts.push('SKIP $offset LIMIT $limit');

  return { cypher: parts.join('\n'), params };
}

export const GET_JOB_BY_ID = `
MATCH (j:Job {id: $id})-[:POSTED_BY]->(c:Company)
OPTIONAL MATCH (j)-[:LOCATED_IN]->(l:Location)
OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
OPTIONAL MATCH (j)-[:USES_TECH]->(t:Technology)
OPTIONAL MATCH (c)-[:IN_INDUSTRY]->(i:Industry)
RETURN j, c, l, i,
       collect(DISTINCT s) AS skills,
       collect(DISTINCT t) AS technologies
`;

/**
 * Related jobs through shared skills — a 2-hop traversal:
 *   (j1:Job)-[:REQUIRES]->(:Skill)<-[:REQUIRES]-(j2:Job)
 * Returns the jobs that share the most skills with the given job.
 * This is the canonical graph query: "which other jobs are adjacent to this
 * one through the skills it requires?" — awkward to express in SQL.
 */
export const RELATED_JOBS = `
MATCH (j1:Job {id: $jobId})-[:REQUIRES]->(s:Skill)<-[:REQUIRES]-(j2:Job)
WHERE j1.id <> j2.id
OPTIONAL MATCH (j2)-[:POSTED_BY]->(c:Company)
OPTIONAL MATCH (j2)-[:LOCATED_IN]->(l:Location)
WITH j2, c, l, count(DISTINCT s) AS sharedSkills, collect(DISTINCT s.name) AS sharedSkillNames
RETURN j2, c, l, sharedSkills, sharedSkillNames
ORDER BY sharedSkills DESC, j2.postedAt DESC
LIMIT $limit
`;

/**
 * Skill-based job matching — the relationship-heavy showcase query.
 *
 * Two passes over the REQUIRES edges:
 *   1. count how many of the user's skills each job requires (matchingSkills),
 *   2. count how many skills the job requires in total (totalSkills),
 * then compute a transparent match percentage. In a relational model this
 * needs multiple self-joins over a join table; in a graph it is two hops.
 */
export const MATCH_JOBS = `
MATCH (j:Job)-[:REQUIRES]->(s:Skill)
WHERE s.id IN $skillIds
WITH j, count(DISTINCT s) AS matchingSkills, collect(DISTINCT s.name) AS matchedSkillNames
MATCH (j)-[:REQUIRES]->(required:Skill)
OPTIONAL MATCH (j)-[:POSTED_BY]->(c:Company)
OPTIONAL MATCH (j)-[:LOCATED_IN]->(l:Location)
WITH j, c, l, matchingSkills, matchedSkillNames,
     count(DISTINCT required) AS totalSkills,
     collect(DISTINCT required.name) AS requiredSkills
RETURN j, c, l, matchingSkills, matchedSkillNames, totalSkills, requiredSkills,
       CASE WHEN totalSkills = 0 THEN 0
            ELSE round(100.0 * matchingSkills / totalSkills)
       END AS matchPercentage
ORDER BY matchPercentage DESC, matchingSkills DESC, j.postedAt DESC
LIMIT $limit
`;
