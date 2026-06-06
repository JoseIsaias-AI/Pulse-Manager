import { Router } from 'express';
import jornadaRoutes from './jornadaRoutes';
import saudeMentalRoutes from './saudeMentalRoutes';
import agendaRoutes from './agendaRoutes';
import notificacaoRoutes from './notificacaoRoutes';
import portalAlunoRoutes from './portalAlunoRoutes';
import segmentacaoRoutes from './segmentacaoRoutes';
import alunoRoutes from './alunoRoutes';
import dashboardRoutes from './dashboardRoutes';
import psicologoRoutes from './psicologoRoutes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// segmentacaoRoutes deve vir antes de alunoRoutes para que
// GET /alunos/segmentacao não seja capturado por /alunos/:idAluno
router.use(segmentacaoRoutes);
router.use(alunoRoutes);
router.use(dashboardRoutes);
router.use(jornadaRoutes);
router.use(saudeMentalRoutes);
router.use(agendaRoutes);
router.use(notificacaoRoutes);
router.use(portalAlunoRoutes);
router.use(psicologoRoutes);

export default router;
