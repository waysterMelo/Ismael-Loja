import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './domain/auth/auth.router';
import { customersRouter } from './domain/customers/customers.router';
import { salesRouter } from './domain/sales/sales.router';
import { promissoryNotesRouter } from './domain/promissory-notes/promissory-notes.router';
import { dashboardRouter } from './domain/common/dashboard.router';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/customers', customersRouter);
app.use('/api/sales', salesRouter);
app.use('/api/promissory-notes', promissoryNotesRouter);
app.use('/api/dashboard', dashboardRouter);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Backend] Running on port ${PORT}`);
});
