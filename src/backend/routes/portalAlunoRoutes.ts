import { Router } from 'express';
import { PortalAlunoController } from '../controllers/portalAlunoController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { AlunoRepository } from '../repositories/alunoRepository';
import { NotificacaoRepository } from '../repositories/notificacaoRepository';
import { PortalAlunoService } from '../services/portalAlunoService';

const router = Router();
const controller = new PortalAlunoController(
  new PortalAlunoService(new AlunoRepository(), new NotificacaoRepository())
);

router.get('/portal/alunos/:idAluno', authMiddleware, controller.visualizarPerfil);
router.patch('/portal/alunos/:idAluno/contato', authMiddleware, controller.atualizarContato);
router.get('/portal/alunos/:idAluno/notificacoes', authMiddleware, controller.listarNotificacoes);
router.get('/portal/oportunidades', controller.listarOportunidades);

export default router;
