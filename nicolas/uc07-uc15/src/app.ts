import express from 'express';
import fs from 'fs';
import path from 'path';
import routes from './routes';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { corsMiddleware } from './config/cors';

export const app = express();

app.use((req, _res, next) => {
  console.log(`[SERVER] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const staticCandidates = [
  path.resolve(__dirname, '../../frontend'),
  path.resolve(__dirname, '../../../frontend')
];
const staticPath = staticCandidates.find((candidate) => fs.existsSync(candidate));

if (staticPath) {
  app.use(express.static(staticPath));
} else {
  console.warn('[SERVER] Pasta frontend nao encontrada. Servindo apenas API.');
}

app.get('/', (_req, res) => {
  res.redirect('/pages/segmentacao.html');
});

app.use(routes);
app.use(errorMiddleware);
