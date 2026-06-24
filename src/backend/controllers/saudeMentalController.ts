import { NextFunction, Request, Response } from 'express';
import { SaudeMentalService } from '../services/saudeMentalService';
import { AppError } from '../utils/errors';
import { optionalNumber } from '../utils/validators';

export class SaudeMentalController {
  constructor(private readonly service: SaudeMentalService) {}

  listar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({
        ...await this.service.listar({
        idAluno: optionalNumber(req.query.idAluno, 'idAluno'),
        idPsi: optionalNumber(req.query.idPsi, 'idPsi')
        }, this.perfil(req)),
        message: 'Prontuarios carregados com sucesso.'
      });
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  criar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(201).json({
        ...await this.service.criar(req.body, this.perfil(req)),
        message: 'Prontuario criado com sucesso.'
      });
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  listarLabels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({
        ...await this.service.listarLabels({
        idAluno: optionalNumber(req.query.idAluno, 'idAluno'),
        idPsi: optionalNumber(req.query.idPsi, 'idPsi')
        }, this.perfil(req)),
        message: 'Labels carregadas com sucesso.'
      });
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  criarLabel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(201).json({
        ...await this.service.criarLabel(req.body, this.perfil(req)),
        message: 'Label criada com sucesso.'
      });
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  private perfil(req: Request): string | undefined {
    return (req.header('x-user-role') || req.query.perfil)?.toString();
  }

  private handle(error: unknown, res: Response, next: NextFunction): void {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, data: null, message: error.message });
      return;
    }
    next(error);
  }
}
