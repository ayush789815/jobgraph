import { runQuery } from '../config/database.js';
import { toPlain } from '../utils/neo4j.js';
import {
  COMPANY_NEIGHBORHOOD,
  JOB_NEIGHBORHOOD,
  JOB_RELATED_JOBS,
  SKILL_JOBS_CONTEXT,
  SKILL_NEIGHBORHOOD,
} from '../queries/connectionQueries.js';
import { AppError } from '../middleware/errors.js';

const DEFAULT_SECOND_HOP_LIMIT = 8;

/**
 * Builds a { nodes, links } document for the Graph Explorer.
 *  - nodes: { id, name, type, depth, props } — depth 0 = focus, 1 = neighbor, 2 = second hop
 *  - links: { source, target, relationship, note? }
 * Relationship direction follows the seeded graph (e.g. Job -[:REQUIRES]-> Skill),
 * which lets the frontend draw meaningful arrows.
 */
export async function getJobConnections(id) {
  const [egoRecords, hopRecords] = await Promise.all([
    runQuery(JOB_NEIGHBORHOOD, { id }),
    runQuery(JOB_RELATED_JOBS, { id, limit: DEFAULT_SECOND_HOP_LIMIT }),
  ]);
  if (egoRecords.length === 0) throw new AppError(`Job "${id}" was not found.`, 404, 'JOB_NOT_FOUND');

  const g = new GraphBuilder();
  const r = egoRecords[0];
  const job = toPlain(r.get('j'));
  g.addStart({ id: job.id, name: job.title, type: 'Job', props: job });

  const skills = toPlain(r.get('skills'));
  const tech = toPlain(r.get('technologies'));
  const company = toPlain(r.get('c'));
  const location = toPlain(r.get('l'));
  const industry = toPlain(r.get('i'));

  for (const s of skills) g.addNode({ id: s.id, name: s.name, type: 'Skill', depth: 1, props: s }, null, 'REQUIRES');
  for (const t of tech) g.addNode({ id: t.id, name: t.name, type: 'Technology', depth: 1, props: t }, null, 'USES_TECH');
  if (company) {
    const companyKey = g.addNode({ id: company.id, name: company.name, type: 'Company', depth: 1, props: company }, null, 'POSTED_BY');
    if (industry) {
      g.addNode({ id: industry.id, name: industry.name, type: 'Industry', depth: 2, props: industry }, companyKey, 'IN_INDUSTRY');
    }
  }
  if (location) g.addNode({ id: location.id, name: location.city, type: 'Location', depth: 1, props: location }, null, 'LOCATED_IN');

  for (const hr of hopRecords) {
    const rel = toPlain(hr.get('j2'));
    g.addNode(
      { id: rel.id, name: rel.title, type: 'Job', depth: 2, props: rel },
      null,
      'SHARES_SKILLS',
      { note: `${toPlain(hr.get('sharedSkills'))} shared skill(s): ${toPlain(hr.get('sharedSkillNames')).join(', ')}` },
    );
  }

  return g.build({ focusName: job.title });
}

export async function getSkillConnections(id) {
  const [egoRecords, contextRecords] = await Promise.all([
    runQuery(SKILL_NEIGHBORHOOD, { id }),
    runQuery(SKILL_JOBS_CONTEXT, { id, limit: DEFAULT_SECOND_HOP_LIMIT }),
  ]);
  if (egoRecords.length === 0) throw new AppError(`Skill "${id}" was not found.`, 404, 'SKILL_NOT_FOUND');

  const g = new GraphBuilder();
  const r = egoRecords[0];
  const skill = toPlain(r.get('s'));
  g.addStart({ id: skill.id, name: skill.name, type: 'Skill', props: skill });

  for (const rel of toPlain(r.get('relatedSkills'))) {
    g.addNode({ id: rel.id, name: rel.name, type: 'Skill', depth: 1, props: rel }, null, 'RELATED_TO');
  }

  for (const cr of contextRecords) {
    const j = toPlain(cr.get('j'));
    // Node first, then an explicit link in the seeded direction (Job -[:REQUIRES]-> Skill).
    const jobId = g.addNode({ id: j.id, name: j.title, type: 'Job', depth: 1, props: j }, null, null);
    g.addLink(jobId, g.startId, 'REQUIRES');
    const c = toPlain(cr.get('c'));
    if (c) g.addNode({ id: c.id, name: c.name, type: 'Company', depth: 2, props: c }, jobId, 'POSTED_BY');
    const t = toPlain(cr.get('t'));
    if (t) g.addNode({ id: t.id, name: t.name, type: 'Technology', depth: 2, props: t }, jobId, 'USES_TECH');
    const l = toPlain(cr.get('l'));
    if (l) g.addNode({ id: l.id, name: l.city, type: 'Location', depth: 2, props: l }, jobId, 'LOCATED_IN');
  }

  return g.build({ focusName: skill.name });
}

export async function getCompanyConnections(id) {
  const records = await runQuery(COMPANY_NEIGHBORHOOD, { id });
  if (records.length === 0) throw new AppError(`Company "${id}" was not found.`, 404, 'COMPANY_NOT_FOUND');

  const g = new GraphBuilder();
  const r = records[0];
  const company = toPlain(r.get('c'));
  g.addStart({ id: company.id, name: company.name, type: 'Company', props: company });

  const industry = toPlain(r.get('i'));
  if (industry) g.addNode({ id: industry.id, name: industry.name, type: 'Industry', depth: 1, props: industry }, null, 'IN_INDUSTRY');

  for (const j of toPlain(r.get('jobs'))) {
    g.addNode({ id: j.id, name: j.title, type: 'Job', depth: 1, props: j }, null, 'POSTED_BY');
  }

  // Second hop: skills, technologies, and locations behind each open job.
  const secondHop = await runQuery(
    `
    MATCH (c:Company {id: $id})<-[:POSTED_BY]-(j:Job)
    OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
    OPTIONAL MATCH (j)-[:USES_TECH]->(t:Technology)
    OPTIONAL MATCH (j)-[:LOCATED_IN]->(l:Location)
    RETURN j, s, t, l
    `,
    { id },
  );
  for (const hr of secondHop) {
    const jobId = `Job:${toPlain(hr.get('j')).id}`;
    const s = toPlain(hr.get('s'));
    if (s) g.addNode({ id: s.id, name: s.name, type: 'Skill', depth: 2, props: s }, jobId, 'REQUIRES');
    const t = toPlain(hr.get('t'));
    if (t) g.addNode({ id: t.id, name: t.name, type: 'Technology', depth: 2, props: t }, jobId, 'USES_TECH');
    const l = toPlain(hr.get('l'));
    if (l) g.addNode({ id: l.id, name: l.city, type: 'Location', depth: 2, props: l }, jobId, 'LOCATED_IN');
  }

  return g.build({ focusName: company.name });
}

/* ------------------------------------------------------------------ */

class GraphBuilder {
  constructor() {
    this.nodes = new Map(); // key -> node
    this.links = new Map(); // "source|target|rel" -> link
    this.startId = null;
  }

  addStart({ id, name, type, props }) {
    const key = `${type}:${id}`;
    this.startId = key;
    this.nodes.set(key, { id: key, name, type, depth: 0, props: this.slim(props) });
    return key;
  }

  /**
   * Adds a neighbor node and, when `relationship` is provided, a typed link
   * from `fromKey` (defaults to the start node). Pass an explicit key (e.g.
   * "Job:job-012") to link through an intermediate node. Pass `null` for
   * relationship to add the node without a link, then call addLink() with the
   * exact source/target you want (this is how we keep arrow direction equal to
   * the seeded graph). Node and link maps dedupe by key.
   */
  addNode({ id, name, type, depth, props }, fromKey = null, relationship, extra = {}) {
    const key = `${type}:${id}`;
    if (!this.nodes.has(key)) {
      this.nodes.set(key, { id: key, name, type, depth, props: this.slim(props) });
    }
    if (relationship) {
      this.addLink(fromKey || this.startId, key, relationship, extra);
    }
    return key;
  }

  /** Adds a typed link between two node keys (deduped). */
  addLink(sourceKey, targetKey, relationship, extra = {}) {
    const linkKey = `${sourceKey}|${targetKey}|${relationship}`;
    if (!this.links.has(linkKey)) {
      this.links.set(linkKey, { source: sourceKey, target: targetKey, relationship, ...extra });
    }
  }

  build({ focusName }) {
    return {
      focus: { id: this.startId, name: focusName },
      nodes: [...this.nodes.values()],
      links: [...this.links.values()],
    };
  }

  /** Keeps payloads small: only the properties the frontend displays. */
  slim(props) {
    const allowed = new Set([
      'id', 'title', 'name', 'category', 'city', 'state', 'country',
      'salaryMin', 'salaryMax', 'salaryCurrency', 'employmentType',
      'experienceLevel', 'remoteType', 'postedAt', 'website', 'logo',
    ]);
    const out = {};
    for (const [k, v] of Object.entries(props || {})) {
      if (allowed.has(k)) out[k] = v;
    }
    return out;
  }
}
