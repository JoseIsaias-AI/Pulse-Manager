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
import { getDatabaseConnectionInfo } from '../config/database';
import { pingDatabase } from '../database/connection';
import { isSupabaseClientConfigured } from '../integrations/supabaseClient';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.get('/health/supabase', async (_req, res) => {
  try {
    await pingDatabase();

    res.status(200).json({
      status: 'ok',
      database: {
        connected: true,
        ...getDatabaseConnectionInfo()
      },
      supabase: {
        httpClientConfigured: isSupabaseClientConfigured()
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido ao conectar no banco.';

    res.status(503).json({
      status: 'error',
      database: {
        connected: false,
        ...getDatabaseConnectionInfo(),
        message
      },
      supabase: {
        httpClientConfigured: isSupabaseClientConfigured()
      }
    });
  }
});

// segmentacaoRoutes deve vir antes de alunoRoutes para que
// GET /alunos/segmentacao nao seja capturado por /alunos/:idAluno
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
