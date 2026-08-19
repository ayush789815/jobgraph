/**
 * JobGraph seed script.
 *
 * Usage:
 *   npm run seed          # MERGE nodes + relationships (safe to re-run)
 *   npm run seed:reset    # DETACH DELETE everything first, then seed
 *
 * Design:
 *  - Every node type has a uniqueness constraint on `id`, so MERGE is
 *    idempotent — re-running never duplicates data.
 *  - All inserts go through UNWIND batches with parameterized Cypher.
 *  - The dataset is generated deterministically (see data.js), so the graph
 *    looks the same every time unless you change the seed.
 *  - Credentials come only from environment variables; nothing is logged.
 */
import { closeDriver, getDriver, verifyConnection } from '../src/config/database.js';
import {
  COMPANIES,
  generateJobs,
  INDUSTRIES,
  LOCATIONS,
  RELATED_SKILLS,
  RELATED_TECHNOLOGIES,
  SKILLS,
  TECHNOLOGIES,
  seedInfo,
} from './data.js';

const RESET = process.argv.includes('--reset');

/* ------------------------------- helpers ------------------------------- */

function logSection(title) {
  console.log(`\n== ${title} ==`);
}

/** Drops undefined/null values — the Neo4j driver rejects undefined in params. */
function cleanRow(row) {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    if (v !== undefined && v !== null) out[k] = v;
  }
  return out;
}

/* ------------------------------- main ---------------------------------- */

async function main() {
  console.log('JobGraph seed — loading the graph into CognoDB');
  console.log(`Target dataset: ${seedInfo.companies} companies, ${seedInfo.skills} skills, ${seedInfo.technologies} technologies, ${seedInfo.locations} locations`);

  const db = await verifyConnection();
  if (!db.ok) {
    console.error(`\n✖ Cannot connect to CognoDB: ${db.message}`);
    console.error('  Make sure server/.env contains COGNODB_URI and COGNODB_PASSWORD, then try again.');
    process.exit(1);
  }
  console.log('✔ Connected to CognoDB');

  const driver = getDriver();
  const session = driver.session();
  try {
    if (RESET) {
      logSection('Reset');
      await session.run('MATCH (n) DETACH DELETE n');
      console.log('  Deleted all existing nodes and relationships');
    }

    logSection('Constraints');
    await createConstraints(session);

    logSection('Nodes');
    await batch(session, 'Industry', INDUSTRIES);
    await batch(session, 'Location', LOCATIONS);
    await batch(session, 'Company', COMPANIES.map(({ id, name, logo, description, website }) => ({ id, name, logo, description, website })));
    await batch(session, 'Skill', SKILLS);
    await batch(session, 'Technology', TECHNOLOGIES);

    logSection('Relationships');
    await companyIndustries(session);
    await relatedPairs(session, RELATED_SKILLS, 'Skill', 'RELATED_TO');
    await relatedPairs(session, RELATED_TECHNOLOGIES, 'Technology', 'RELATED_TO');

    const jobs = generateJobs(42);
    console.log(`  Generating ${jobs.length} jobs…`);
    await batch(session, 'Job', jobs.map((j) => ({
      id: j.id,
      title: j.title,
      description: j.description,
      employmentType: j.employmentType,
      experienceLevel: j.experienceLevel,
      salaryMin: j.salaryMin,
      salaryMax: j.salaryMax,
      salaryCurrency: j.salaryCurrency,
      remoteType: j.remoteType,
      postedAt: j.postedAt,
    })));
    await jobRelationships(session, jobs);

    logSection('Summary');
    await summarize(session);
  } finally {
    // Never let a cleanup failure mask the real seeding error.
    try {
      await session.close();
    } catch (err) {
      console.warn(`  ⚠ Could not close the session cleanly: ${err.message}`);
    }
    await closeDriver();
  }
}

/* --------------------------- write batches ------------------------------ */

async function createConstraints(session) {
  const statements = [
    'CREATE CONSTRAINT job_id IF NOT EXISTS FOR (n:Job) REQUIRE n.id IS UNIQUE',
    'CREATE CONSTRAINT company_id IF NOT EXISTS FOR (n:Company) REQUIRE n.id IS UNIQUE',
    'CREATE CONSTRAINT skill_id IF NOT EXISTS FOR (n:Skill) REQUIRE n.id IS UNIQUE',
    'CREATE CONSTRAINT technology_id IF NOT EXISTS FOR (n:Technology) REQUIRE n.id IS UNIQUE',
    'CREATE CONSTRAINT location_id IF NOT EXISTS FOR (n:Location) REQUIRE n.id IS UNIQUE',
    'CREATE CONSTRAINT industry_id IF NOT EXISTS FOR (n:Industry) REQUIRE n.id IS UNIQUE',
  ];
  for (const stmt of statements) {
    try {
      await session.run(stmt);
    } catch (err) {
      // Constraints are a hardening step; MERGE still prevents duplicates even
      // if the engine does not support this statement. Warn, don't abort.
      console.warn(`  ⚠ Could not create constraint (${stmt.split(' ')[2]}): ${err.message}`);
    }
  }
  console.log(`  Created ${statements.length} uniqueness constraints`);
}

/** UNWIND + MERGE nodes of one label from a list of { id, ...props } rows. */
async function batch(session, label, rows) {
  if (rows.length === 0) return;
  const cleanRows = rows.map(cleanRow);
  await session.run(
    `UNWIND $rows AS row
     MERGE (n:${label} {id: row.id})
     SET n += row`,
    { rows: cleanRows },
  );
  console.log(`  ${label}: ${rows.length} nodes upserted`);
}

/** Company -[:IN_INDUSTRY]-> Industry. */
async function companyIndustries(session) {
  const rows = COMPANIES.filter((c) => c.industryId).map((c) => ({ companyId: c.id, industryId: c.industryId }));
  await session.run(
    `UNWIND $rows AS row
     MATCH (c:Company {id: row.companyId})
     MATCH (i:Industry {id: row.industryId})
     MERGE (c)-[:IN_INDUSTRY]->(i)`,
    { rows },
  );
  console.log(`  Company-[:IN_INDUSTRY]->Industry: ${rows.length} relationships`);
}

/** Skill/Technology -[:RELATED_TO]-> pairs (created in both directions). */
async function relatedPairs(session, pairs, label, relType) {
  const rows = [];
  for (const [a, b] of pairs) {
    rows.push({ from: a, to: b });
    rows.push({ from: b, to: a });
  }
  await session.run(
    `UNWIND $rows AS row
     MATCH (a:${label} {id: row.from})
     MATCH (b:${label} {id: row.to})
     MERGE (a)-[:${relType}]->(b)`,
    { rows },
  );
  console.log(`  ${label}-[:${relType}]->${label}: ${rows.length} relationships (both directions)`);
}

/** Job edges: REQUIRES, USES_TECH, POSTED_BY, LOCATED_IN. */
async function jobRelationships(session, jobs) {
  const requires = [];
  const usesTech = [];
  const postedBy = [];
  const locatedIn = [];
  for (const j of jobs) {
    for (const s of j.skills) requires.push({ jobId: j.id, skillId: s });
    for (const t of j.tech) usesTech.push({ jobId: j.id, techId: t });
    postedBy.push({ jobId: j.id, companyId: j.companyId });
    locatedIn.push({ jobId: j.id, locationId: j.locationId });
  }

  await session.run(
    `UNWIND $rows AS row
     MATCH (j:Job {id: row.jobId})
     MATCH (s:Skill {id: row.skillId})
     MERGE (j)-[:REQUIRES]->(s)`,
    { rows: requires },
  );
  console.log(`  Job-[:REQUIRES]->Skill: ${requires.length} relationships`);

  await session.run(
    `UNWIND $rows AS row
     MATCH (j:Job {id: row.jobId})
     MATCH (t:Technology {id: row.techId})
     MERGE (j)-[:USES_TECH]->(t)`,
    { rows: usesTech },
  );
  console.log(`  Job-[:USES_TECH]->Technology: ${usesTech.length} relationships`);

  await session.run(
    `UNWIND $rows AS row
     MATCH (j:Job {id: row.jobId})
     MATCH (c:Company {id: row.companyId})
     MERGE (j)-[:POSTED_BY]->(c)`,
    { rows: postedBy },
  );
  console.log(`  Job-[:POSTED_BY]->Company: ${postedBy.length} relationships`);

  await session.run(
    `UNWIND $rows AS row
     MATCH (j:Job {id: row.jobId})
     MATCH (l:Location {id: row.locationId})
     MERGE (j)-[:LOCATED_IN]->(l)`,
    { rows: locatedIn },
  );
  console.log(`  Job-[:LOCATED_IN]->Location: ${locatedIn.length} relationships`);
}

/* ------------------------------ summary -------------------------------- */

async function summarize(session) {
  const countResult = await session.run(
    `MATCH (n)
     WHERE n:Job OR n:Company OR n:Skill OR n:Technology OR n:Location OR n:Industry
     RETURN labels(n)[0] AS type, count(*) AS count
     ORDER BY type`,
  );
  console.log('  Node counts:');
  for (const record of countResult.records) {
    console.log(`    ${String(record.get('type')).padEnd(12)} ${record.get('count')}`);
  }

  const topSkills = await session.run(
    `MATCH (s:Skill)<-[:REQUIRES]-(j:Job)
     RETURN s.name AS skill, count(DISTINCT j) AS jobs
     ORDER BY jobs DESC LIMIT 5`,
  );
  console.log('  Most in-demand skills:');
  for (const record of topSkills.records) {
    console.log(`    ${String(record.get('skill')).padEnd(20)} ${record.get('jobs')} jobs`);
  }

  // Proof the multi-hop traversal works: companies hiring for JavaScript.
  const hop = await session.run(
    `MATCH (j:Job)-[:REQUIRES]->(s:Skill {id: 'javascript'})
     MATCH (j)-[:POSTED_BY]->(c:Company)
     RETURN c.name AS company, count(DISTINCT j) AS jobs
     ORDER BY jobs DESC LIMIT 3`,
  );
  console.log('  Companies hiring for JavaScript (2-hop example):');
  for (const record of hop.records) {
    console.log(`    ${String(record.get('company')).padEnd(20)} ${record.get('jobs')} open jobs`);
  }

  console.log('\n✔ Seed complete. Start the API with "npm run dev" and open http://localhost:5173');
}

main().catch(async (err) => {
  console.error('\n✖ Seed failed:', err.message);
  if (err.code) console.error(`  code: ${err.code}`);
  if (err.cause) console.error(`  caused by: ${err.cause.message}`);
  if (err.stack) console.error(err.stack);
  await closeDriver();
  process.exit(1);
});
