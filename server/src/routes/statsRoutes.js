import { Router } from 'express';
import * as statsController from '../controllers/statsController.js';
import { asyncHandler } from '../middleware/errors.js';

const router = Router();

router.get('/stats', asyncHandler(statsController.getStats));
router.get('/locations', asyncHandler(statsController.getLocations));

export default router;
