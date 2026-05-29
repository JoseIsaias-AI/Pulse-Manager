import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors';

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
    return;
  }

  console.error('[ERROR]', err);
  res.status(500).json({
    success: false,
    message: 'Erro inesperado ao segmentar alunos.'
  });
}
