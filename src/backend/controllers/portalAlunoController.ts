import { NextFunction, Request, Response } from 'express';
import { RequestComUsuario } from '../middlewares/authMiddleware';
import { PortalAlunoService } from '../services/portalAlunoService';
import { AppError } from '../utils/errors';
import { positiveInteger } from '../utils/validators';

export class PortalAlunoController {
  constructor(private readonly service: PortalAlunoService) {}

  visualizarPerfil = async (req: RequestComUsuario, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.visualizarPerfil(
        positiveInteger(req.params.idAluno, 'idAluno'),
        req.usuario?.id
      );
      res.status(200).json({ ...result, message: 'Perfil do aluno carregado com sucesso.' });
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  atualizarContato = async (req: RequestComUsuario, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.atualizarContato(
        positiveInteger(req.params.idAluno, 'idAluno'),
        req.body,
        req.usuario?.id
      );
      res.status(200).json({ ...result, message: 'Contato atualizado com sucesso.' });
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  listarNotificacoes = async (req: RequestComUsuario, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idAluno = positiveInteger(req.params.idAluno, 'idAluno');
      const result = await this.service.listarNotificacoes(idAluno, req.usuario?.id);
      res.status(200).json({ ...result, message: 'Notificacoes carregadas com sucesso.' });
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  listarOportunidades = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.listarOportunidades();
      res.status(200).json({ ...result, message: 'Oportunidades carregadas com sucesso.' });
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
