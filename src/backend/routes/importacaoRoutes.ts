import { Router } from 'express';
import { ImportacaoController } from '../controllers/importacaoController';
import { ImportacaoRepository } from '../repositories/importacaoRepository';
import { ImportacaoService } from '../services/importacaoService';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requirePermission } from '../middlewares/permissionMiddleware';

const router = Router();
const controller = new ImportacaoController(new ImportacaoService(new ImportacaoRepository()));

router.post('/gestor/importacoes/alunos', authMiddleware, requirePermission('gerenciarImportacaoCsv'), controller.importarAlunos);
router.get('/gestor/exportacoes/alunos', authMiddleware, requirePermission('gerenciarImportacaoCsv'), controller.exportarAlunos);

export default router;
