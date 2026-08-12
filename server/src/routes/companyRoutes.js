import { Router } from 'express';
import * as companyController from '../controllers/companyController.js';
import { validateIdParam } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errors.js';

const router = Router();

router.get('/', asyncHandler(companyController.listCompanies));
router.get('/:id/jobs', validateIdParam(), asyncHandler(companyController.getCompanyJobs));
router.get('/:id/connections', validateIdParam(), asyncHandler(companyController.getCompanyConnections));
router.get('/:id', validateIdParam(), asyncHandler(companyController.getCompany));

export default router;
