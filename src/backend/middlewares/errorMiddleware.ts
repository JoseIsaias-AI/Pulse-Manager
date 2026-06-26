import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, data: null, message: err.message });
  }

  console.error(err);
  return res.status(500).json({ success: false, data: null, message: 'Erro interno do servidor' });
}
