import { Router } from 'express';
import { JornadaController } from '../controllers/jornadaController';
import { JornadaRepository } from '../repositories/jornadaRepository';
import { JornadaService } from '../services/jornadaService';

const router = Router();

const repository = new JornadaRepository();
const service = new JornadaService(repository);
const controller = new JornadaController(service);

router.get('/jornada/alunos/:idAluno', controller.obterJornadaAluno);

router.post('/frequencias', controller.registrarFrequencia);
router.post('/participacoes', controller.registrarParticipacaoEvento);
router.patch('/empregabilidade/:idAluno', controller.atualizarEmpregabilidade);
router.patch('/ensino-superior/:idAluno', controller.atualizarEnsinoSuperior);
router.post('/anotacoes-qualitativas', controller.registrarAnotacaoQualitativa);

export default router;
