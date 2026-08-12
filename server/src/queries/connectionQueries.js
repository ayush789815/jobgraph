/**
 * Connection queries for the Graph Explorer.
 *
 * Each query returns the first- and second-hop neighborhood of a start node.
 * The service layer (graphService.js) assembles these into a { nodes, links }
 * JSON document the frontend renders as a force-directed graph.
 * All queries are parameterized.
 */

/** Job ego-neighborhood: skills, technologies, company, location, industry. */
export const JOB_NEIGHBORHOOD = `
MATCH (j:Job {id: $id})
OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
OPTIONAL MATCH (j)-[:USES_TECH]->(t:Technology)
OPTIONAL MATCH (j)-[:POSTED_BY]->(c:Company)
OPTIONAL MATCH (j)-[:LOCATED_IN]->(l:Location)
OPTIONAL MATCH (c)-[:IN_INDUSTRY]->(i:Industry)
RETURN j,
       collect(DISTINCT s) AS skills,
       collect(DISTINCT t) AS technologies,
       c, l, i
`;

/** Second hop for jobs: other jobs sharing at least one skill (2-hop traversal). */
export const JOB_RELATED_JOBS = `
MATCH (j1:Job {id: $id})-[:REQUIRES]->(s:Skill)<-[:REQUIRES]-(j2:Job)
WHERE j1.id <> j2.id
WITH j2, count(DISTINCT s) AS sharedSkills, collect(DISTINCT s.name) AS sharedSkillNames
ORDER BY sharedSkills DESC
LIMIT $limit
RETURN j2, sharedSkills, sharedSkillNames
`;

/** Skill ego-neighborhood: related skills plus the jobs/companies/tech around it. */
export const SKILL_NEIGHBORHOOD = `
MATCH (s:Skill {id: $id})
OPTIONAL MATCH (s)-[:RELATED_TO]->(r:Skill)
OPTIONAL MATCH (s)<-[:REQUIRES]-(j:Job)
OPTIONAL MATCH (j)-[:POSTED_BY]->(c:Company)
OPTIONAL MATCH (j)-[:USES_TECH]->(t:Technology)
OPTIONAL MATCH (j)-[:LOCATED_IN]->(l:Location)
WITH s, collect(DISTINCT r) AS relatedSkills
RETURN s, relatedSkills
`;

/** Second hop for skills: the jobs that require the skill, with their context. */
export const SKILL_JOBS_CONTEXT = `
MATCH (s:Skill {id: $id})<-[:REQUIRES]-(j:Job)
OPTIONAL MATCH (j)-[:POSTED_BY]->(c:Company)
OPTIONAL MATCH (j)-[:USES_TECH]->(t:Technology)
OPTIONAL MATCH (j)-[:LOCATED_IN]->(l:Location)
RETURN j, c, t, l
ORDER BY j.postedAt DESC
LIMIT $limit
`;

/** Company ego-neighborhood: industry plus all open jobs with their context. */
export const COMPANY_NEIGHBORHOOD = `
MATCH (c:Company {id: $id})
OPTIONAL MATCH (c)-[:IN_INDUSTRY]->(i:Industry)
OPTIONAL MATCH (c)<-[:POSTED_BY]-(j:Job)
OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
OPTIONAL MATCH (j)-[:USES_TECH]->(t:Technology)
OPTIONAL MATCH (j)-[:LOCATED_IN]->(l:Location)
WITH c, i, collect(DISTINCT j) AS jobs
RETURN c, i, jobs
`;
