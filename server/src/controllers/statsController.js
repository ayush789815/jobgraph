import * as statsService from '../services/statsService.js';

export async function getStats(req, res) {
  res.json(await statsService.getDashboardStats());
}

export async function getLocations(req, res) {
  res.json(await statsService.listLocations());
}
