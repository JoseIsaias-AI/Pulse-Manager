import { NextFunction, Request, Response } from 'express';

export interface RequestComUsuario extends Request {
  usuario?: {
    id?: number;
    perfil?: string;
    nome?: string;
  };
}

export function authMiddleware(req: RequestComUsuario, _res: Response, next: NextFunction): void {
  const idHeader = req.header('x-user-id');
  req.usuario = {
    id: idHeader ? Number(idHeader) : undefined,
    perfil: req.header('x-user-role') || undefined,
    nome: req.header('x-user-name') || undefined
  };
  next();
}
