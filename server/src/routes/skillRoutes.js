import { Router } from 'express';
import * as skillController from '../controllers/skillController.js';
import { validateIdParam } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errors.js';

const router = Router();

router.get('/', asyncHandler(skillController.listSkills));
router.get('/:id/companies', validateIdParam(), asyncHandler(skillController.getSkillCompanies));
router.get('/:id/jobs', validateIdParam(), asyncHandler(skillController.getSkillJobs));
router.get('/:id/connections', validateIdParam(), asyncHandler(skillController.getSkillConnections));
router.get('/:id', validateIdParam(), asyncHandler(skillController.getSkill));

export default router;
