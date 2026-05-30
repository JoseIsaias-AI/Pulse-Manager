import { Router } from 'express';
import { SegmentacaoController } from '../controllers/segmentacaoController';
import { AlunoRepository } from '../repositories/alunoRepository';
import { SegmentacaoService } from '../services/segmentacaoService';

const router = Router();

const alunoRepository = new AlunoRepository();
const segmentacaoService = new SegmentacaoService(alunoRepository);
const segmentacaoController = new SegmentacaoController(segmentacaoService);

router.get('/alunos/segmentacao', (req, res, next) => {
  segmentacaoController.segmentar(req, res, next);
});

export default router;
