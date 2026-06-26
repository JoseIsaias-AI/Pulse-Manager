import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import { errorMiddleware } from './middlewares/errorMiddleware';

export const app = express();
const frontendRoot = path.resolve(process.cwd(), 'src', 'frontend');
const chartJsRoot = path.resolve(process.cwd(), 'node_modules', 'chart.js', 'dist');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api', routes);
app.get('/', (_req, res) => {
  res.redirect('/pages/login.html');
});
app.use('/vendor/chart.js', express.static(chartJsRoot));
app.use(express.static(frontendRoot));
app.use(errorMiddleware);
