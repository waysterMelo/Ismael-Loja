import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRouter } from './domain/auth/auth.router';
import { customersRouter } from './domain/customers/customers.router';
import { salesRouter } from './domain/sales/sales.router';
import { promissoryNotesRouter } from './domain/promissory-notes/promissory-notes.router';
import { dashboardRouter } from './domain/common/dashboard.router';
import { auditLogRouter } from './domain/audit-log/audit-log.router';
import { usersRouter } from './domain/users/users.router';
import { errorHandler } from './shared/middleware';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['*'];
app.use(helmet());
app.use(cors({
  origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
  credentials: true,
}));

app.use(express.json());

// Structured request logging
app.use((req, _res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // Capture response status after request is processed
  const originalSend = _res.send;
  _res.send = function(body) {
    const duration = Date.now() - start;
    const logEntry = {
      timestamp,
      method: req.method,
      path: req.path,
      status: _res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.headers['user-agent'] || 'unknown',
      ip: req.ip || req.socket.remoteAddress,
    };

    if (_res.statusCode >= 400) {
      console.error('[ERROR]', JSON.stringify(logEntry));
    } else {
      console.log('[REQUEST]', JSON.stringify(logEntry));
    }

    return originalSend.call(this, body);
  };

  next();
});

// Health check with detailed status
app.get('/api/health', async (_req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
  };

  res.json(health);
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/customers', customersRouter);
app.use('/api/sales', salesRouter);
app.use('/api/promissory-notes', promissoryNotesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/audit-log', auditLogRouter);
app.use('/api/users', usersRouter);

// Global error handler (must be last)
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Backend] Server started on port ${PORT}`);
  console.log(`[Backend] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Backend] PID: ${process.pid}`);
});
