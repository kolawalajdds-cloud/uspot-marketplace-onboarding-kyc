import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import usersRoutes from './routes/users';
import businessesRoutes from './routes/businesses';
import complianceRoutes from './routes/compliance';
import servicesRoutes from './routes/services';
import cardsRoutes from './routes/cards';
import bookingsRoutes from './routes/bookings';
import reviewsRoutes from './routes/reviews';
import ledgerRoutes from './routes/ledger';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Healthcheck (handles both /api/health and /health)
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok', database: 'Neon PostgreSQL', time: new Date().toISOString() });
});

// Mount Routes - support both with and without /api prefix for Vercel serverless flexibility
const routeMounts = [
  { prefix: '/users', router: usersRoutes },
  { prefix: '/businesses', router: businessesRoutes },
  { prefix: '/compliance', router: complianceRoutes },
  { prefix: '/services', router: servicesRoutes },
  { prefix: '/customer/cards', router: cardsRoutes },
  { prefix: '/bookings', router: bookingsRoutes },
  { prefix: '/reviews', router: reviewsRoutes },
  { prefix: '/ledger', router: ledgerRoutes },
];

for (const { prefix, router } of routeMounts) {
  app.use(`/api${prefix}`, router);
  app.use(prefix, router);
}

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
