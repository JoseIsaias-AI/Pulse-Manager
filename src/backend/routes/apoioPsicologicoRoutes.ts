import { Router } from 'express';
import { ApoioPsicologicoController } from '../controllers/apoioPsicologicoController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requirePermission } from '../middlewares/permissionMiddleware';
import { ApoioPsicologicoRepository } from '../repositories/apoioPsicologicoRepository';
import { ApoioPsicologicoService } from '../services/apoioPsicologicoService';

const router = Router();
const controller = new ApoioPsicologicoController(
  new ApoioPsicologicoService(new ApoioPsicologicoRepository())
);

router.post(
  '/apoio/solicitar',
  authMiddleware,
  requirePermission('solicitarApoioPsicologico'),
  controller.solicitar
);

router.get(
  '/apoio/solicitacoes',
  authMiddleware,
  requirePermission('listarSolicitacoesApoio'),
  controller.listarSolicitacoes
);

export default router;
