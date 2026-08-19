import express from 'express';
import cors from 'cors';
import { allowedOrigins, env } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';
import { rateLimit, securityHeaders } from './middleware/security.js';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(securityHeaders);

const origins = allowedOrigins();
app.use(cors({ origin: origins === null ? true : origins, methods: ['GET', 'POST'], maxAge: 600 }));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));
app.use(express.json({ limit: '100kb' }));

// Tiny request logger (method, path, status, duration).
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (env.nodeEnv !== 'test') {
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
    }
  });
  next();
});

app.get('/', (req, res) => {
  res.json({
    name: 'JobGraph API',
    tagline: 'Explore jobs through the connections between skills, technologies, companies, and opportunities.',
    docs: '/api/health',
  });
});

app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
