import { NextFunction, Request, Response } from 'express';
import { DashboardFiltroQuery } from '../models/dashboardModel';
import { DashboardService } from '../services/dashboardService';
import { AppError } from '../utils/errors';

function optionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const texto = value.trim();
  return texto.length > 0 ? texto : undefined;
}

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  obterResumoImpacto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filtros = this.extrairFiltros(req);
      const resultado = await this.dashboardService.obterResumoImpacto(filtros);
      res.status(200).json({ ...resultado, message: 'Resumo de impacto carregado com sucesso.' });
    } catch (error) {
      this.tratarErro(error, res, next);
    }
  };

  obterResumoJornada = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filtros = this.extrairFiltros(req);
      const resultado = await this.dashboardService.obterResumoJornada(filtros);
      res.status(200).json({ ...resultado, message: 'Resumo de jornada carregado com sucesso.' });
    } catch (error) {
      this.tratarErro(error, res, next);
    }
  };

  consultarAlunosEmpregados = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filtros = this.extrairFiltros(req);
      const resultado = await this.dashboardService.consultarAlunosEmpregados(filtros);
      res.status(200).json({ ...resultado, message: 'Alunos empregados consultados com sucesso.' });
    } catch (error) {
      this.tratarErro(error, res, next);
    }
  };

  consultarConclusaoProgramas = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filtros = this.extrairFiltros(req);
      const resultado = await this.dashboardService.consultarConclusaoProgramas(filtros);
      res.status(200).json({ ...resultado, message: 'Conclusao de programas consultada com sucesso.' });
    } catch (error) {
      this.tratarErro(error, res, next);
    }
  };

  consultarAcessoEnsinoSuperior = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filtros = this.extrairFiltros(req);
      const resultado = await this.dashboardService.consultarAcessoEnsinoSuperior(filtros);
      res.status(200).json({ ...resultado, message: 'Acesso ao ensino superior consultado com sucesso.' });
    } catch (error) {
      this.tratarErro(error, res, next);
    }
  };

  consultarEvasaoRisco = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filtros = this.extrairFiltros(req);
      const resultado = await this.dashboardService.consultarEvasaoRisco(filtros);
      res.status(200).json({ ...resultado, message: 'Risco de evasao consultado com sucesso.' });
    } catch (error) {
      this.tratarErro(error, res, next);
    }
  };

  private extrairFiltros(req: Request): DashboardFiltroQuery {
    return {
      programa: optionalString(req.query.programa),
      categoria: optionalString(req.query.categoria),
      dataInicio: optionalString(req.query.dataInicio),
      dataFim: optionalString(req.query.dataFim)
    };
  }

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
