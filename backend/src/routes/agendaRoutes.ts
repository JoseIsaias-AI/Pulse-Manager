import { Router } from 'express';
import { AgendaController } from '../controllers/agendaController';
import { AgendaRepository } from '../repositories/agendaRepository';
import { AgendaService } from '../services/agendaService';

const router = Router();
const controller = new AgendaController(new AgendaService(new AgendaRepository()));

router.get('/agenda', controller.listar);
router.post('/agenda', controller.criar);
router.patch('/agenda/:idAgenda', controller.atualizar);
router.delete('/agenda/:idAgenda', controller.cancelar);

export default router;
