import { NextFunction, Request, Response } from 'express';
import {
  EmpregabilidadeAluno,
  StatusAluno,
  RiscoEvasao,
  SegmentacaoAlunoQuery
} from '../models/alunoModel';
import { SegmentacaoService } from '../services/segmentacaoService';
import { AppError } from '../utils/errors';

function optionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const texto = value.trim();
  return texto.length > 0 ? texto : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  return Number(value);
}

export class SegmentacaoController {
  constructor(private readonly service: SegmentacaoService) {}

  segmentar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const filtros: SegmentacaoAlunoQuery = {
      programa: optionalString(req.query.programa),
      status: optionalString(req.query.status) as StatusAluno | undefined,
      risco: optionalString(req.query.risco) as RiscoEvasao | undefined,
      categoria: optionalString(req.query.categoria),
      ocupacao: optionalString(req.query.ocupacao),
      empregabilidade: optionalString(req.query.empregabilidade) as EmpregabilidadeAluno | undefined,
      escolaridade: optionalString(req.query.escolaridade),
      curso: optionalString(req.query.curso),
      anoIngresso: optionalNumber(req.query.anoIngresso),
      busca: optionalString(req.query.busca),
      limite: optionalNumber(req.query.limite)
    };

    try {
      const resultado = await this.service.segmentar(filtros);
      res.status(200).json({ ...resultado, message: 'Segmentacao realizada com sucesso.' });
    } catch (error) {
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
  };
}
