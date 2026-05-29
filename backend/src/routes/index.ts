import { Router } from 'express';
import jornadaRoutes from './jornadaRoutes';
import saudeMentalRoutes from './saudeMentalRoutes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.use(jornadaRoutes);
router.use(saudeMentalRoutes);

export default router;
