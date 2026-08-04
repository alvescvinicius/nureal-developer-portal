import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apisRouter from './routes/apis';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'portal-backend', timestamp: new Date().toISOString() });
});

app.use('/api/apis', apisRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Nureal Developer Portal backend rodando em http://localhost:${PORT}`);
});
