import { Router } from 'express';
import { Uc07JornadaController } from '../controllers/uc07JornadaController';
import { Uc07JornadaRepository } from '../repositories/uc07JornadaRepository';
import { Uc07JornadaService } from '../services/uc07JornadaService';

const router = Router();

const repository = new Uc07JornadaRepository();
const service = new Uc07JornadaService(repository);
const controller = new Uc07JornadaController(service);

router.get('/jornada/alunos/:idAluno', controller.obterJornadaAluno);

router.post('/frequencias', controller.registrarFrequencia);
router.post('/participacoes', controller.registrarParticipacaoEvento);
router.patch('/empregabilidade/:idAluno', controller.atualizarEmpregabilidade);
router.patch('/ensino-superior/:idAluno', controller.atualizarEnsinoSuperior);
router.post('/anotacoes-qualitativas', controller.registrarAnotacaoQualitativa);

export default router;
