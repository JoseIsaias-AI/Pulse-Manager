import { Router } from 'express';
import saudeMentalRoutes from './saudeMentalRoutes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.use(saudeMentalRoutes);

export default router;
