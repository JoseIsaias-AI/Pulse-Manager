import { Router } from 'express';
import jornadaRoutes from './jornadaRoutes';
import saudeMentalRoutes from './saudeMentalRoutes';
import agendaRoutes from './agendaRoutes';
import notificacaoRoutes from './notificacaoRoutes';
import portalAlunoRoutes from './portalAlunoRoutes';
import segmentacaoRoutes from './segmentacaoRoutes';
import authRoutes from './authRoutes';
import alunoRoutes from './alunoRoutes';
import dashboardRoutes from './dashboardRoutes';
import psicologoRoutes from './psicologoRoutes';
import apoioPsicologicoRoutes from './apoioPsicologicoRoutes';
import importacaoRoutes from './importacaoRoutes';
import { getDatabaseConnectionInfo } from '../config/database';
import { pingDatabase } from '../database/connection';
import { isSupabaseClientConfigured } from '../integrations/supabaseClient';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'ok' },
    message: 'API disponivel.'
  });
});

router.get('/health/supabase', async (_req, res) => {
  try {
    await pingDatabase();

    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        database: {
          connected: true,
          ...getDatabaseConnectionInfo()
        },
        supabase: {
          httpClientConfigured: isSupabaseClientConfigured()
        }
      },
      message: 'Supabase e banco disponiveis.'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido ao conectar no banco.';

    res.status(503).json({ success: false, data: null, message });
  }
});

// segmentacaoRoutes deve vir antes de alunoRoutes para que
// GET /alunos/segmentacao nao seja capturado por /alunos/:idAluno
router.use(segmentacaoRoutes);
router.use(authRoutes);
router.use(alunoRoutes);
router.use(dashboardRoutes);
router.use(jornadaRoutes);
router.use(saudeMentalRoutes);
router.use(agendaRoutes);
router.use(notificacaoRoutes);
router.use(portalAlunoRoutes);
router.use(psicologoRoutes);
router.use(apoioPsicologicoRoutes);
router.use(importacaoRoutes);

export default router;
