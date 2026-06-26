import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { UsuarioRepository } from '../repositories/usuarioRepository';
import { AuthService } from '../services/authService';

const router = Router();
const controller = new AuthController(new AuthService(new UsuarioRepository()));

router.post('/auth/login', controller.login);

export default router;
