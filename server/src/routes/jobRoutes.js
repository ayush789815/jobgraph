import { Router } from 'express';
import * as jobController from '../controllers/jobController.js';
import { validateIdParam, validateJobsQuery, validateMatchBody } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errors.js';

const router = Router();

router.get('/', validateJobsQuery, asyncHandler(jobController.listJobs));
router.post('/match', validateMatchBody, asyncHandler(jobController.matchJobs));
router.get('/:id/related', validateIdParam(), asyncHandler(jobController.getRelatedJobs));
router.get('/:id/connections', validateIdParam(), asyncHandler(jobController.getJobConnections));
router.get('/:id', validateIdParam(), asyncHandler(jobController.getJob));

export default router;
