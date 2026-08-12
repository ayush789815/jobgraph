/** Statistics and meta queries for the dashboard and filter dropdowns. */

/** Counts of each primary node label in one pass. */
export const NODE_COUNTS = `
MATCH (n)
WHERE n:Job OR n:Company OR n:Skill OR n:Technology OR n:Location OR n:Industry
RETURN labels(n)[0] AS type, count(*) AS count
`;

export const POPULAR_SKILLS = `
MATCH (s:Skill)<-[:REQUIRES]-(j:Job)
RETURN s, count(DISTINCT j) AS jobCount
ORDER BY jobCount DESC
LIMIT $limit
`;

export const POPULAR_TECHNOLOGIES = `
MATCH (t:Technology)<-[:USES_TECH]-(j:Job)
RETURN t, count(DISTINCT j) AS jobCount
ORDER BY jobCount DESC
LIMIT $limit
`;

export const RECENT_JOBS = `
MATCH (j:Job)-[:POSTED_BY]->(c:Company)
OPTIONAL MATCH (j)-[:LOCATED_IN]->(l:Location)
OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
RETURN j, c, l, collect(DISTINCT s) AS skills
ORDER BY j.postedAt DESC
LIMIT $limit
`;

export const ALL_LOCATIONS = `
MATCH (l:Location)<-[:LOCATED_IN]-(j:Job)
RETURN l, count(DISTINCT j) AS jobCount
ORDER BY jobCount DESC, l.city
`;
