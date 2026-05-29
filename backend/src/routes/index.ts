import { Router } from 'express';
import jornadaRoutes from './jornadaRoutes';
import saudeMentalRoutes from './saudeMentalRoutes';
import agendaRoutes from './agendaRoutes';
import notificacaoRoutes from './notificacaoRoutes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.use(jornadaRoutes);
router.use(saudeMentalRoutes);
router.use(agendaRoutes);
router.use(notificacaoRoutes);

export default router;
