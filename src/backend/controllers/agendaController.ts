import { NextFunction, Request, Response } from 'express';
import { AgendaService } from '../services/agendaService';
import { AppError } from '../utils/errors';
import { optionalNumber, optionalString, positiveInteger } from '../utils/validators';

export class AgendaController {
  constructor(private readonly service: AgendaService) {}

  listar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.listar({
        idAluno: optionalNumber(req.query.idAluno, 'idAluno'),
        idMembro: optionalNumber(req.query.idMembro, 'idMembro'),
        dataInicio: optionalString(req.query.dataInicio),
        dataFim: optionalString(req.query.dataFim)
      });
      res.status(200).json({ ...result, message: 'Agenda listada com sucesso.' });
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  criar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(201).json({
        ...await this.service.criar(req.body, this.perfil(req)),
        message: 'Compromisso criado com sucesso.'
      });
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  atualizar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({
        ...await this.service.atualizar(positiveInteger(req.params.idAgenda, 'idAgenda'), req.body, this.perfil(req)),
        message: 'Compromisso atualizado com sucesso.'
      });
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  cancelar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({
        ...await this.service.cancelar(positiveInteger(req.params.idAgenda, 'idAgenda'), this.perfil(req)),
        message: 'Compromisso cancelado com sucesso.'
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
