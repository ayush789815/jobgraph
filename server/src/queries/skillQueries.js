/** Skill queries — all parameterized. */

export const LIST_SKILLS = `
MATCH (s:Skill)
OPTIONAL MATCH (s)<-[:REQUIRES]-(j:Job)
RETURN s, count(DISTINCT j) AS jobCount
ORDER BY jobCount DESC, toLower(s.name)
`;

export const GET_SKILL_BY_ID = `
MATCH (s:Skill {id: $id})
OPTIONAL MATCH (s)-[:RELATED_TO]->(r:Skill)
OPTIONAL MATCH (s)<-[:REQUIRES]-(j:Job)
OPTIONAL MATCH (j)-[:POSTED_BY]->(c:Company)
WITH s,
     collect(DISTINCT r) AS relatedSkills,
     count(DISTINCT j) AS jobCount,
     count(DISTINCT c) AS companyCount
RETURN s, relatedSkills, jobCount, companyCount
`;

/** Jobs requiring a skill (1 hop): (j:Job)-[:REQUIRES]->(:Skill {id}). */
export const SKILL_JOBS = `
MATCH (j:Job)-[:REQUIRES]->(s:Skill {id: $id})
OPTIONAL MATCH (j)-[:POSTED_BY]->(c:Company)
OPTIONAL MATCH (j)-[:LOCATED_IN]->(l:Location)
RETURN j, c, l
ORDER BY j.postedAt DESC
LIMIT $limit
`;

/**
 * Companies hiring for a skill — a 2-hop traversal:
 *   (j:Job)-[:REQUIRES]->(:Skill {id}) and (j:Job)-[:POSTED_BY]->(c:Company)
 * The answer to "who would hire me for this skill?" requires joining through
 * the job node in SQL, but falls out naturally from the graph.
 */
export const SKILL_COMPANIES = `
MATCH (j:Job)-[:REQUIRES]->(s:Skill {id: $id})
MATCH (j)-[:POSTED_BY]->(c:Company)
OPTIONAL MATCH (c)-[:IN_INDUSTRY]->(i:Industry)
WITH c, i, count(DISTINCT j) AS openJobs
RETURN c, i, openJobs
ORDER BY openJobs DESC, toLower(c.name)
`;
