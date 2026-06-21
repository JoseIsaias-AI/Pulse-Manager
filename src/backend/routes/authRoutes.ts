import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { AlunoRepository } from '../repositories/alunoRepository';
import { AuthService } from '../services/authService';

const router = Router();
const controller = new AuthController(new AuthService(new AlunoRepository()));

router.post('/auth/login', controller.login);

export default router;
