import { NextFunction, Request, Response } from 'express';
import {
  AtualizarEmpregabilidadePayload,
  AtualizarEnsinoSuperiorPayload,
  RegistrarAnotacaoQualitativaPayload,
  RegistrarFrequenciaPayload,
  RegistrarParticipacaoPayload
} from '../models/jornadaModel';
import { JornadaService } from '../services/jornadaService';
import { AppError } from '../utils/errors';

function parseId(value: unknown, fieldName: string): number {
  if (Array.isArray(value)) {
    throw new AppError(`O parametro ${fieldName} deve ser um numero inteiro positivo.`, 400);
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new AppError(`O parametro ${fieldName} deve ser um numero inteiro positivo.`, 400);
  }
  return parsed;
}

export class JornadaController {
  constructor(private readonly service: JornadaService) { }

  listarAtividades = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tipo = typeof req.query.tipo === 'string' ? req.query.tipo : undefined;
      const resultado = await this.service.listarAtividades(tipo);
      res.status(200).json({ ...resultado, message: 'Atividades listadas com sucesso.' });
    } catch (error) {
      this.tratarErro(error, res, next);
    }
  };

  obterJornadaAluno = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idAluno = parseId(req.params.idAluno, 'idAluno');
      const resultado = await this.service.obterJornadaAluno(idAluno);
      res.status(200).json({ ...resultado, message: 'Jornada do aluno carregada com sucesso.' });
    } catch (error) {
      this.tratarErro(error, res, next);
    }
  };

  registrarFrequencia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload: RegistrarFrequenciaPayload = {
        idAluno: Number(req.body.idAluno),
        idAtividade: Number(req.body.idAtividade),
        statusPart: Boolean(req.body.statusPart),
        nota: req.body.nota !== undefined ? Number(req.body.nota) : undefined,
        dataPart: req.body.dataPart
      };

      const resultado = await this.service.registrarFrequencia(payload);
      res.status(resultado.data.operacao === 'criado' ? 201 : 200).json({
        ...resultado,
        message: 'Frequencia registrada com sucesso.'
      });
    } catch (error) {
      this.tratarErro(error, res, next);
    }
  };

  registrarParticipacaoEvento = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const payload: RegistrarParticipacaoPayload = {
        idAluno: Number(req.body.idAluno),
        idAtividade: Number(req.body.idAtividade),
        statusPart: Boolean(req.body.statusPart),
        nota: req.body.nota !== undefined ? Number(req.body.nota) : undefined,
        dataPart: req.body.dataPart
      };

      const resultado = await this.service.registrarParticipacaoEvento(payload);
      res.status(201).json({ ...resultado, message: 'Participacao registrada com sucesso.' });
    } catch (error) {
      this.tratarErro(error, res, next);
    }
  };

  atualizarEmpregabilidade = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const idAluno = parseId(req.params.idAluno, 'idAluno');
      const payload: AtualizarEmpregabilidadePayload = {
        ocupacao: String(req.body.ocupacao || ''),
        tipoVinculoEmpregaticio: req.body.tipoVinculoEmpregaticio,
        rendaMensal: req.body.rendaMensal !== undefined ? Number(req.body.rendaMensal) : undefined
      };

      const resultado = await this.service.atualizarEmpregabilidade(idAluno, payload);
      res.status(200).json({ ...resultado, message: 'Empregabilidade atualizada com sucesso.' });
    } catch (error) {
      this.tratarErro(error, res, next);
    }
  };

  atualizarEnsinoSuperior = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const idAluno = parseId(req.params.idAluno, 'idAluno');
      const payload: AtualizarEnsinoSuperiorPayload = {
        escolaridade: String(req.body.escolaridade || ''),
        instituicaoEnsinoSuperior: req.body.instituicaoEnsinoSuperior,
        cursoEnsinoSuperior: req.body.cursoEnsinoSuperior,
        statusEnsinoSuperior: req.body.statusEnsinoSuperior,
        dataIngressoEnsinoSuperior: req.body.dataIngressoEnsinoSuperior
      };

      const resultado = await this.service.atualizarEnsinoSuperior(idAluno, payload);
      res.status(200).json({ ...resultado, message: 'Ensino superior atualizado com sucesso.' });
    } catch (error) {
      this.tratarErro(error, res, next);
    }
  };

  registrarAnotacaoQualitativa = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const payload: RegistrarAnotacaoQualitativaPayload = {
        idAluno: Number(req.body.idAluno),
        titulo: String(req.body.titulo || ''),
        descricao: String(req.body.descricao || ''),
        autor: String(req.body.autor || ''),
        dataRegistro: req.body.dataRegistro
      };

      const resultado = await this.service.registrarAnotacaoQualitativa(payload);
      res.status(201).json({ ...resultado, message: 'Anotacao qualitativa registrada com sucesso.' });
    } catch (error) {
      this.tratarErro(error, res, next);
    }
  };

  private tratarErro(error: unknown, res: Response, next: NextFunction): void {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
      return;
    }

    next(error);
  }
}
