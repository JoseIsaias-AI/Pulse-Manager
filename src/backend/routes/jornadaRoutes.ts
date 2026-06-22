import { Router } from 'express';
import { JornadaController } from '../controllers/jornadaController';
import { JornadaRepository } from '../repositories/jornadaRepository';
import { JornadaService } from '../services/jornadaService';
import { authMiddleware } from '../middlewares/authMiddleware';
import { RiscoEvasaoRepository } from '../repositories/riscoEvasaoRepository';
import { RiscoEvasaoService } from '../services/riscoEvasaoService';

const router = Router();

const repository = new JornadaRepository();
const riscoEvasaoService = new RiscoEvasaoService(new RiscoEvasaoRepository());
const service = new JornadaService(repository, riscoEvasaoService);
const controller = new JornadaController(service);

router.get('/atividades', controller.listarAtividades);
router.get('/jornada/alunos/:idAluno', controller.obterJornadaAluno);

router.post('/frequencias', authMiddleware, controller.registrarFrequencia);
router.post('/participacoes', authMiddleware, controller.registrarParticipacaoEvento);
router.patch('/empregabilidade/:idAluno', authMiddleware, controller.atualizarEmpregabilidade);
router.patch('/ensino-superior/:idAluno', authMiddleware, controller.atualizarEnsinoSuperior);
router.post('/anotacoes-qualitativas', authMiddleware, controller.registrarAnotacaoQualitativa);

export default router;
