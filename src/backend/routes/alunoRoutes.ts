import { Router } from 'express';
import { AlunoController } from '../controllers/alunoController';
import { AlunoRepository } from '../repositories/alunoRepository';
import { AlunoService } from '../services/alunoService';
import { RiscoEvasaoRepository } from '../repositories/riscoEvasaoRepository';
import { RiscoEvasaoService } from '../services/riscoEvasaoService';

const router = Router();
const riscoEvasaoService = new RiscoEvasaoService(new RiscoEvasaoRepository());
const controller = new AlunoController(
  new AlunoService(new AlunoRepository(), riscoEvasaoService)
);

router.get('/alunos', controller.listar);
router.post('/alunos', controller.cadastrar);
router.get('/alunos/opcoes-cadastro', controller.listarOpcoesCadastro);
router.get('/alunos/:idAluno', controller.obter);
router.patch('/alunos/:idAluno', controller.atualizar);
router.delete('/alunos/:idAluno', controller.inativar);

export default router;
