import { NextFunction, Response } from 'express';
import { RequestComUsuario } from '../middlewares/authMiddleware';
import { DesempenhoService } from '../services/desempenhoService';
import { AppError } from '../utils/errors';
import { positiveInteger } from '../utils/validators';

export class DesempenhoController {
  constructor(private readonly service: DesempenhoService) {}

  obterDesempenho = async (req: RequestComUsuario, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idPsi = req.usuario?.id;
      if (!idPsi) {
        res.status(401).json({ success: false, data: null, message: 'Identificacao do psicologo nao informada.' });
        return;
      }
      const idAluno = positiveInteger(req.params.idAluno, 'idAluno');
      res.status(200).json({
        ...await this.service.obterDesempenho(idPsi, idAluno),
        message: 'Desempenho carregado com sucesso.'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, data: null, message: error.message });
        return;
      }
      next(error);
    }
  };
}
