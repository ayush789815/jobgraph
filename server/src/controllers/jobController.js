import * as jobService from '../services/jobService.js';
import * as graphService from '../services/graphService.js';

export async function listJobs(req, res) {
  const jobs = await jobService.listJobs(req.jobFilters);
  res.json(jobs);
}

export async function getJob(req, res) {
  const job = await jobService.getJobById(req.params.id);
  res.json(job);
}

export async function getRelatedJobs(req, res) {
  const limit = Number(req.query.limit) || 10;
  const related = await jobService.getRelatedJobs(req.params.id, limit);
  res.json(related);
}

export async function getJobConnections(req, res) {
  const graph = await graphService.getJobConnections(req.params.id);
  res.json(graph);
}

export async function matchJobs(req, res) {
  const results = await jobService.matchJobs(req.validatedSkillIds);
  res.json(results);
}
