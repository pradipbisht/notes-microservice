import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { errorHandler } from '../../../shared/middleware';
import authRoutes from './auth.route';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

/**
 * ✅ MIDDLEWARE (ORDER MATTERS)
 */

// 🔥 Morgan FIRST (so it logs everything)
app.use(morgan('combined'));

// Security + CORS
app.use(cors());
app.use(helmet());

// Body parsers (only once)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * ✅ ROUTES
 */

// Health check (important)
app.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'OK',
    service: 'auth-service',
  });
});

// Test route (for debugging morgan)
app.get('/test', (req, res) => {
  return res.send('Test route working');
});

// Auth routes
app.use('/api/auth', authRoutes);

/**
 * ❌ 404 Handler (optional but recommended)
 */
app.use((req, res) => {
  return res.status(404).json({
    message: 'Route not found',
  });
});

/**
 * ✅ GLOBAL ERROR HANDLER
 */
app.use(errorHandler);

/**
 * ✅ SERVER START
 */
app.listen(PORT, () => {
  console.log(`🚀 Auth service running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`❤️ Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/test`);
});

export default app;
