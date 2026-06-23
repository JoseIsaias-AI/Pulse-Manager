import { NextFunction, Request, Response } from 'express';
import { AlunoService } from '../services/alunoService';
import { AppError } from '../utils/errors';
import { optionalString, optionalNumber, positiveInteger } from '../utils/validators';
import { EmpregabilidadeAluno, SegmentacaoAlunoQuery, StatusAluno } from '../models/alunoModel';

export class AlunoController {
  constructor(private readonly service: AlunoService) {}

  listar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filtros: SegmentacaoAlunoQuery = {
        busca: optionalString(req.query.busca),
        status: optionalString(req.query.status) as StatusAluno | undefined,
        programa: optionalString(req.query.programa),
        empregabilidade: optionalString(req.query.empregabilidade) as EmpregabilidadeAluno | undefined,
        escolaridade: optionalString(req.query.escolaridade),
        curso: optionalString(req.query.curso),
        anoIngresso: optionalNumber(req.query.anoIngresso, 'anoIngresso'),
        limite: optionalNumber(req.query.limite, 'limite')
      };
      const result = await this.service.listar(filtros);
      res.status(200).json({ ...result, message: 'Alunos listados com sucesso.' });
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  cadastrar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.cadastrar(req.body);
      res.status(201).json({ ...result, message: 'Aluno cadastrado com sucesso.' });
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  listarOpcoesCadastro = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.listarOpcoesCadastro();
      res.status(200).json({ ...result, message: 'Opcoes de cadastro listadas com sucesso.' });
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  obter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.obterPerfil(positiveInteger(req.params.idAluno, 'idAluno'));
      res.status(200).json({ ...result, message: 'Aluno consultado com sucesso.' });
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  atualizar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.atualizar(positiveInteger(req.params.idAluno, 'idAluno'), req.body);
      res.status(200).json({ ...result, message: 'Aluno atualizado com sucesso.' });
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  inativar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.inativar(positiveInteger(req.params.idAluno, 'idAluno'));
      res.status(200).json({ ...result, message: 'Aluno inativado com sucesso.' });
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
