import { Router } from 'express';
import { criar, listar } from '../controllers/saudeMentalController';

const router = Router();

router.get('/prontuarios', listar);
router.post('/prontuarios', criar);

export default router;
