import { AppError } from './errors.js';

const ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;
const MAX_SKILLS_PER_MATCH = 15;
const MAX_SEARCH_LENGTH = 100;

const ALLOWED = {
  experienceLevel: ['Entry', 'Mid', 'Senior', 'Lead'],
  employmentType: ['Full-time', 'Contract', 'Part-time', 'Internship'],
  remoteType: ['Remote', 'Hybrid', 'On-site'],
  sort: ['newest', 'salary'],
};

/**
 * Middleware factory: validates `req.params[name]` as a node id slug.
 * A valid id is a short, URL-safe string. Invalid ids fail fast with a 400
 * instead of reaching the database.
 */
export function validateIdParam(name = 'id') {
  return (req, res, next) => {
    const value = req.params[name];
    if (!value || !ID_PATTERN.test(value)) {
      return next(new AppError(`Invalid ${name}: expected a short id like "job-042".`, 400, 'INVALID_ID'));
    }
    next();
  };
}

/** Validates the POST /api/jobs/match body: { skillIds: string[] }. */
export function validateMatchBody(req, res, next) {
  const { skillIds } = req.body || {};
  if (!Array.isArray(skillIds) || skillIds.length < 1 || skillIds.length > MAX_SKILLS_PER_MATCH) {
    return next(
      new AppError(
        `Please provide between 1 and ${MAX_SKILLS_PER_MATCH} skill ids in "skillIds".`,
        400,
        'INVALID_SKILLS',
      ),
    );
  }
  const cleaned = [...new Set(skillIds.map((s) => String(s).trim()))];
  const bad = cleaned.filter((s) => !ID_PATTERN.test(s));
  if (bad.length > 0) {
    return next(new AppError(`Invalid skill id in list: "${bad[0]}".`, 400, 'INVALID_SKILL_ID'));
  }
  req.validatedSkillIds = cleaned;
  next();
}

/** Parses and sanitizes the job-explorer query string into a safe filters object. */
export function validateJobsQuery(req, res, next) {
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, MAX_SEARCH_LENGTH) : '';
  const skillIds = Array.isArray(req.query.skills)
    ? req.query.skills.filter((s) => ID_PATTERN.test(String(s))).slice(0, MAX_SKILLS_PER_MATCH)
    : [];
  const experienceLevel = pickAllowed(req.query.experienceLevel, 'experienceLevel');
  const employmentType = pickAllowed(req.query.employmentType, 'employmentType');
  const remoteType = pickAllowed(req.query.remoteType, 'remoteType');
  const location = typeof req.query.location === 'string' ? req.query.location.trim().slice(0, 64) : '';
  const sort = pickAllowed(req.query.sort, 'sort', 'newest');
  const limit = clampInt(req.query.limit, 1, 100, 30);
  const offset = clampInt(req.query.offset, 0, 10000, 0);

  req.jobFilters = { q, skillIds, experienceLevel, employmentType, remoteType, location, sort, limit, offset };
  next();
}

function pickAllowed(value, key, fallback = undefined) {
  if (!value) return undefined;
  const v = String(value);
  return ALLOWED[key].includes(v) ? v : fallback;
}

function clampInt(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}
