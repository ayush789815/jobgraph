import { Router } from 'express';
import jobRoutes from './jobRoutes.js';
import skillRoutes from './skillRoutes.js';
import companyRoutes from './companyRoutes.js';
import statsRoutes from './statsRoutes.js';
import { verifyConnection } from '../config/database.js';
import { asyncHandler } from '../middleware/errors.js';

const router = Router();

router.get(
  '/health',
  asyncHandler(async (req, res) => {
    const db = await verifyConnection();
    res.status(db.ok ? 200 : 503).json({ status: db.ok ? 'ok' : 'degraded', database: db });
  }),
);

router.use('/jobs', jobRoutes);
router.use('/skills', skillRoutes);
router.use('/companies', companyRoutes);
router.use('/', statsRoutes);

export default router;
