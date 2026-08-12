import * as companyService from '../services/companyService.js';
import * as graphService from '../services/graphService.js';

export async function listCompanies(req, res) {
  res.json(await companyService.listCompanies());
}

export async function getCompany(req, res) {
  res.json(await companyService.getCompanyById(req.params.id));
}

export async function getCompanyJobs(req, res) {
  const [jobs, skills, technologies, locations] = await Promise.all([
    companyService.getCompanyJobs(req.params.id),
    companyService.getCompanySkills(req.params.id, 24),
    companyService.getCompanyTechnologies(req.params.id, 24),
    companyService.getCompanyLocations(req.params.id),
  ]);
  res.json({ jobs, skills, technologies, locations });
}

export async function getCompanyConnections(req, res) {
  res.json(await graphService.getCompanyConnections(req.params.id));
}
