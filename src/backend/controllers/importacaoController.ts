import { NextFunction, Request, Response } from 'express';
import { ImportacaoService } from '../services/importacaoService';
import { AppError } from '../utils/errors';

export class ImportacaoController {
  constructor(private readonly service: ImportacaoService) {}

  importarAlunos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const csv = req.body?.csv ?? req.body?.conteudoCsv;
      const result = await this.service.importarAlunosCsv(csv);
      res.status(200).json({ ...result, message: 'Arquivo CSV importado com sucesso.' });
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  exportarAlunos = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const csv = await this.service.exportarAlunosCsv();
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="alunos.csv"');
      res.status(200).send(csv);
    } catch (error) {
      this.handle(error, res, next);
    }
  };

  private traduzirMensagemErro(error: unknown): string {
    const message = error instanceof Error ? error.message : '';

    if (message.includes('violates not-null constraint')) {
      const column = message.match(/column "([^"]+)"/)?.[1] || 'obrigatório';
      return `Não foi possível importar: o campo ${column} é obrigatório.`;
    }

    if (message.includes('value too long for type character varying')) {
      return 'Não foi possível importar: algum campo do CSV ultrapassa o tamanho máximo permitido no banco.';
    }

    if (message.includes('duplicate key value violates unique constraint')) {
      return 'Não foi possível importar: já existe um registro com uma informação única repetida.';
    }

    return message || 'Erro inesperado ao processar a importação.';
  }

  private handle(error: unknown, res: Response, next: NextFunction): void {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, data: null, message: error.message });
      return;
    }
    const message = this.traduzirMensagemErro(error);
    res.status(500).json({ success: false, data: null, message });
  }
}
