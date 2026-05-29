import { Router } from 'express';
import agendaRoutes from './agendaRoutes';
import alunoRoutes from './alunoRoutes';
import dashboardRoutes from './dashboardRoutes';
import notificacaoRoutes from './notificacaoRoutes';
import portalAlunoRoutes from './portalAlunoRoutes';
import psicologoRoutes from './psicologoRoutes';
import saudeMentalRoutes from './saudeMentalRoutes';
import segmentacaoRoutes from './segmentacaoRoutes';
import uc07JornadaRoutes from './uc07JornadaRoutes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use('/api', segmentacaoRoutes);
router.use('/api', alunoRoutes);
router.use('/api', portalAlunoRoutes);
router.use('/api', dashboardRoutes);
router.use('/api', uc07JornadaRoutes);
router.use('/api', notificacaoRoutes);
router.use('/api', agendaRoutes);
router.use('/api', saudeMentalRoutes);
router.use('/api', psicologoRoutes);

export default router;
