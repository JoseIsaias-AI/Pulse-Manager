import { NextFunction, Response } from 'express';
import { RequestComUsuario } from '../middlewares/authMiddleware';
import { PsicologoDashboardService } from '../services/psicologoDashboardService';
import { AppError } from '../utils/errors';
import { positiveInteger } from '../utils/validators';

export class PsicologoDashboardController {
  constructor(private readonly service: PsicologoDashboardService) {}

  obterDashboard = async (req: RequestComUsuario, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idPsicologo = positiveInteger(req.params.idPsicologo, 'idPsicologo');

      if (!req.usuario?.id) {
        res.status(401).json({
          success: false,
          data: null,
          message: 'Identificacao do psicologo nao informada.'
        });
        return;
      }

      if (req.usuario.id !== idPsicologo) {
        res.status(403).json({
          success: false,
          data: null,
          message: 'Psicologo nao pode acessar dashboard de outro psicologo.'
        });
        return;
      }

      res.status(200).json({
        ...await this.service.obterDashboard(idPsicologo),
        message: 'Dashboard psicologico carregado com sucesso.'
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
