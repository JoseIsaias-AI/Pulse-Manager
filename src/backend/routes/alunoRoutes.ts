import { Router } from 'express';
import { AlunoController } from '../controllers/alunoController';
import { AlunoRepository } from '../repositories/alunoRepository';
import { AlunoService } from '../services/alunoService';

const router = Router();
const controller = new AlunoController(new AlunoService(new AlunoRepository()));

router.get('/alunos', controller.listar);
router.post('/alunos', controller.cadastrar);
router.get('/alunos/opcoes-cadastro', controller.listarOpcoesCadastro);
router.get('/alunos/:idAluno', controller.obter);
router.patch('/alunos/:idAluno', controller.atualizar);
router.delete('/alunos/:idAluno', controller.inativar);

export default router;
