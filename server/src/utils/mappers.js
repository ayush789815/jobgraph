import { toPlain } from './neo4j.js';
import { AppError } from '../middleware/errors.js';

/**
 * Shared record -> DTO mappers.
 *
 * Every service turns Neo4j records into the same handful of shapes (a job
 * summary, a location, a company, an industry, a named node with a count), so
 * those shapes live here once and the services just compose them.
 */

/** Returns the first record, or throws a 404 for the given node label. */
export function firstOrThrow(records, label, id, hint = '') {
  if (records.length === 0) {
    const suffix = hint ? ` ${hint}` : '';
    throw new AppError(`${label} "${id}" was not found.${suffix}`, 404, `${label.toUpperCase()}_NOT_FOUND`);
  }
  return records[0];
}

/** { id, name, category } for Skill/Technology-like nodes. */
export function toNamedNode(value) {
  const n = toPlain(value);
  return n ? { id: n.id, name: n.name, category: n.category || '' } : null;
}

export function toLocation(value) {
  const l = toPlain(value);
  return l ? { id: l.id, city: l.city, state: l.state, country: l.country } : null;
}

export function toIndustry(value) {
  const i = toPlain(value);
  return i ? { id: i.id, name: i.name } : null;
}

export function toCompany(value) {
  const c = toPlain(value);
  return c ? { id: c.id, name: c.name, logo: c.logo || '', website: c.website || '' } : null;
}

/** The job fields shared by every listing (details add a description). */
export function toJobSummary(jobValue, companyValue, locationValue) {
  const j = toPlain(jobValue);
  const c = toPlain(companyValue);
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
    location: toLocation(locationValue),
  };
}

/** A `RETURN <node>, count(...) AS <countKey>` row as one flat object. */
export function toCountedNode(record, nodeKey, countKey = 'jobCount') {
  return { ...toNamedNode(record.get(nodeKey)), [countKey]: toPlain(record.get(countKey)) };
}

/** Plain array for a collected column; empty when the query omits it. */
export function toPlainList(record, key) {
  const value = record.has(key) ? record.get(key) : null;
  return (value || []).map(toPlain);
}
