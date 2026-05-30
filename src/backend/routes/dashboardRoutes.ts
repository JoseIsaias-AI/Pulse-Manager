import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { DashboardRepository } from '../repositories/dashboardRepository';
import { DashboardService } from '../services/dashboardService';

const router = Router();

const dashboardRepository = new DashboardRepository();
const dashboardService = new DashboardService(dashboardRepository);
const dashboardController = new DashboardController(dashboardService);

router.get('/impacto/resumo', dashboardController.obterResumoImpacto);
router.get('/jornada/resumo', dashboardController.obterResumoJornada);

router.get('/impacto/alunos-empregados', dashboardController.consultarAlunosEmpregados);
router.get('/impacto/conclusao-programas', dashboardController.consultarConclusaoProgramas);
router.get('/impacto/acesso-ensino-superior', dashboardController.consultarAcessoEnsinoSuperior);
router.get('/jornada/evasao-risco', dashboardController.consultarEvasaoRisco);

export default router;
