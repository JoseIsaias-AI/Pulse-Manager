import { NextFunction, Request, Response } from 'express';
import { NotificacaoService } from '../services/notificacaoService';
import { AppError } from '../utils/errors';
import { optionalNumber } from '../utils/validators';

export class NotificacaoController {
  constructor(private readonly service: NotificacaoService) {}

  listar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.listar(optionalNumber(req.query.idAluno, 'idAluno'));
      res.status(200).json({ ...result, message: 'Comunicacoes listadas com sucesso.' });
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  criar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.criar(req.body, req.header('x-user-role'));
      res.status(201).json({ ...result, message: 'Comunicacao criada com sucesso.' });
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  listarOportunidades = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({
        ...await this.service.listarOportunidades(),
        message: 'Oportunidades listadas com sucesso.'
      });
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  criarOportunidade = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(201).json({
        ...await this.service.criarOportunidade(req.body),
        message: 'Oportunidade criada com sucesso.'
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
