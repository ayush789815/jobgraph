import { Router } from 'express';
import jobRoutes from './jobRoutes.js';
import skillRoutes from './skillRoutes.js';
import companyRoutes from './companyRoutes.js';
import statsRoutes from './statsRoutes.js';
import { verifyConnection } from '../config/database.js';
import { env } from '../config/env.js';

const router = Router();

router.get('/health', async (req, res) => {
  const db = await verifyConnection();
  // Driver failures can name the database host or credentials, so the raw
  // message stays server-side in production.
  const database = env.isProduction
    ? { ok: db.ok, configured: db.configured }
    : db;
  if (!db.ok) console.warn(`[health] CognoDB unavailable: ${db.message}`);
  res.status(db.ok ? 200 : 503).json({ status: db.ok ? 'ok' : 'degraded', database });
});

router.use('/jobs', jobRoutes);
router.use('/skills', skillRoutes);
router.use('/companies', companyRoutes);
router.use('/', statsRoutes);

export default router;
