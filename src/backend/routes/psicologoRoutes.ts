import { Router } from 'express';
import { DesempenhoController } from '../controllers/desempenhoController';
import { PsicologoDashboardController } from '../controllers/psicologoDashboardController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requirePermission } from '../middlewares/permissionMiddleware';
import { AlunoRepository } from '../repositories/alunoRepository';
import { ParticipacaoRepository } from '../repositories/participacaoRepository';
import { PsicologoDashboardRepository } from '../repositories/psicologoDashboardRepository';
import { SaudeMentalRepository } from '../repositories/saudeMentalRepository';
import { DesempenhoService } from '../services/desempenhoService';
import { PsicologoDashboardService } from '../services/psicologoDashboardService';

const router = Router();
const desempenhoController = new DesempenhoController(
  new DesempenhoService(
    new AlunoRepository(),
    new ParticipacaoRepository(),
    new SaudeMentalRepository()
  )
);
const dashboardController = new PsicologoDashboardController(
  new PsicologoDashboardService(new PsicologoDashboardRepository())
);

router.get(
  '/psicologo/dashboard/:idPsicologo',
  authMiddleware,
  requirePermission('acessarDashboardPsicologo'),
  dashboardController.obterDashboard
);

router.get(
  '/psicologo/alunos/:idAluno/desempenho',
  authMiddleware,
  requirePermission('acessarDesempenhoAluno'),
  desempenhoController.obterDesempenho
);

export default router;
