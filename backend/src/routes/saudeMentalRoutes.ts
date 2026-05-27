import { Router } from 'express';
import { SaudeMentalController } from '../controllers/saudeMentalController';
import { AlunoRepository } from '../repositories/alunoRepository';
import { SaudeMentalRepository } from '../repositories/saudeMentalRepository';
import { SaudeMentalService } from '../services/saudeMentalService';

const router = Router();
const controller = new SaudeMentalController(
  new SaudeMentalService(new SaudeMentalRepository(), new AlunoRepository())
);

router.get('/prontuarios', controller.listar);
router.post('/prontuarios', controller.criar);
router.get('/labels', controller.listarLabels);
router.post('/labels', controller.criarLabel);

export default router;
