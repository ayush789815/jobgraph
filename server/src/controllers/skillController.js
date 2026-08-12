import * as skillService from '../services/skillService.js';
import * as graphService from '../services/graphService.js';

export async function listSkills(req, res) {
  res.json(await skillService.listSkills());
}

export async function getSkill(req, res) {
  res.json(await skillService.getSkillById(req.params.id));
}

export async function getSkillJobs(req, res) {
  res.json(await skillService.getSkillJobs(req.params.id));
}

/** Companies hiring for a skill — the 2-hop showcase endpoint. */
export async function getSkillCompanies(req, res) {
  res.json(await skillService.getSkillCompanies(req.params.id));
}

export async function getSkillConnections(req, res) {
  res.json(await graphService.getSkillConnections(req.params.id));
}
