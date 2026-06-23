import { NextFunction, Response } from 'express';
import { RequestComUsuario } from '../middlewares/authMiddleware';
import { ApoioPsicologicoService } from '../services/apoioPsicologicoService';
import { AppError } from '../utils/errors';

export class ApoioPsicologicoController {
  constructor(private readonly service: ApoioPsicologicoService) {}

  solicitar = async (req: RequestComUsuario, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(201).json({
        ...await this.service.solicitar(req.usuario?.id, req.body || {}),
        message: 'Solicitacao de apoio psicologico criada com sucesso.'
      });
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  listarSolicitacoes = async (req: RequestComUsuario, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({
        ...await this.service.listarPendentes(req.usuario?.id),
        message: 'Solicitacoes de apoio psicologico listadas com sucesso.'
      });
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  private handle(error: unknown, res: Response, next: NextFunction): void {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, data: null, message: error.message });
      return;
    }

    next(error);
  }
}
