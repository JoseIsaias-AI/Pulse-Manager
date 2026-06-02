import { NextFunction, Request, Response } from 'express';
import { AlunoService } from '../services/alunoService';
import { AppError } from '../utils/errors';
import { optionalString, optionalNumber, positiveInteger } from '../utils/validators';

export class AlunoController {
  constructor(private readonly service: AlunoService) {}

  listar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.listar({
        busca: optionalString(req.query.busca),
        status: optionalString(req.query.status),
        programa: optionalString(req.query.programa),
        limite: optionalNumber(req.query.limite, 'limite')
      });
      res.status(200).json(result);
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  cadastrar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.cadastrar(req.body);
      res.status(201).json(result);
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  obter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.obterPerfil(positiveInteger(req.params.idAluno, 'idAluno'));
      res.status(200).json(result);
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  atualizar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.atualizar(positiveInteger(req.params.idAluno, 'idAluno'), req.body);
      res.status(200).json(result);
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  inativar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.inativar(positiveInteger(req.params.idAluno, 'idAluno'));
      res.status(200).json(result);
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  private handle(error: unknown, res: Response, next: NextFunction): void {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
}
