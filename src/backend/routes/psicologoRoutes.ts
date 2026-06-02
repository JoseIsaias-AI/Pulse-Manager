import { Router } from 'express';
import { DesempenhoController } from '../controllers/desempenhoController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requirePermission } from '../middlewares/permissionMiddleware';
import { AlunoRepository } from '../repositories/alunoRepository';
import { ParticipacaoRepository } from '../repositories/participacaoRepository';
import { SaudeMentalRepository } from '../repositories/saudeMentalRepository';
import { DesempenhoService } from '../services/desempenhoService';

const router = Router();
const controller = new DesempenhoController(
  new DesempenhoService(
    new AlunoRepository(),
    new ParticipacaoRepository(),
    new SaudeMentalRepository()
  )
);

router.get(
  '/psicologo/alunos/:idAluno/desempenho',
  authMiddleware,
  requirePermission('acessarDesempenhoAluno'),
  controller.obterDesempenho
);

export default router;
