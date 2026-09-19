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
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'Neon PostgreSQL', time: new Date().toISOString() });
});

// Mount Routes
app.use('/api/users', usersRoutes);
app.use('/api/businesses', businessesRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/customer/cards', cardsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/ledger', ledgerRoutes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Marketplace Neon API server running on http://localhost:${PORT}`);
});
