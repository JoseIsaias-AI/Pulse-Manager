import { Router } from 'express';
import { NotificacaoController } from '../controllers/notificacaoController';
import { AlunoRepository } from '../repositories/alunoRepository';
import { NotificacaoRepository } from '../repositories/notificacaoRepository';
import { NotificacaoService } from '../services/notificacaoService';

const router = Router();
const controller = new NotificacaoController(
  new NotificacaoService(new NotificacaoRepository(), new AlunoRepository())
);

router.get('/comunicacao', controller.listar);
router.post('/comunicacao', controller.criar);
router.get('/comunicacao/oportunidades', controller.listarOportunidades);
router.post('/comunicacao/oportunidades', controller.criarOportunidade);

export default router;
