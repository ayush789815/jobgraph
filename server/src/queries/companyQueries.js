/** Company queries — all parameterized. */

export const LIST_COMPANIES = `
MATCH (c:Company)
OPTIONAL MATCH (c)<-[:POSTED_BY]-(j:Job)
OPTIONAL MATCH (c)-[:IN_INDUSTRY]->(i:Industry)
RETURN c, i, count(DISTINCT j) AS jobCount
ORDER BY jobCount DESC, toLower(c.name)
`;

export const GET_COMPANY_BY_ID = `
MATCH (c:Company {id: $id})
OPTIONAL MATCH (c)-[:IN_INDUSTRY]->(i:Industry)
RETURN c, i
`;

export const COMPANY_JOBS = `
MATCH (c:Company {id: $id})<-[:POSTED_BY]-(j:Job)
OPTIONAL MATCH (j)-[:LOCATED_IN]->(l:Location)
OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
RETURN j, c, l, collect(DISTINCT s) AS skills
ORDER BY j.postedAt DESC
LIMIT $limit
`;

/** Distinct skills across a company's open jobs, with how many jobs need each. */
export const COMPANY_SKILLS = `
MATCH (c:Company {id: $id})<-[:POSTED_BY]-(j:Job)-[:REQUIRES]->(s:Skill)
RETURN s, count(DISTINCT j) AS jobCount
ORDER BY jobCount DESC, toLower(s.name)
LIMIT $limit
`;

/** Distinct technologies across a company's open jobs. */
export const COMPANY_TECHNOLOGIES = `
MATCH (c:Company {id: $id})<-[:POSTED_BY]-(j:Job)-[:USES_TECH]->(t:Technology)
RETURN t, count(DISTINCT j) AS jobCount
ORDER BY jobCount DESC, toLower(t.name)
LIMIT $limit
`;

/** Locations where a company's jobs are based. */
export const COMPANY_LOCATIONS = `
MATCH (c:Company {id: $id})<-[:POSTED_BY]-(j:Job)-[:LOCATED_IN]->(l:Location)
RETURN l, count(DISTINCT j) AS jobCount
ORDER BY jobCount DESC, l.city
`;
