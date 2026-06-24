import { NextFunction, Response } from 'express';
import { RequestComUsuario } from './authMiddleware';
import { PERMISSOES } from '../config/permissions';

export function requirePermission(acao: string) {
  return (req: RequestComUsuario, res: Response, next: NextFunction): void => {
    const perfil = req.usuario?.perfil;
    const perfisPermitidos = PERMISSOES[acao];
    if (!perfisPermitidos || !perfil || !perfisPermitidos.includes(perfil)) {
      res.status(403).json({ success: false, data: null, message: 'Acesso nao permitido para este perfil.' });
      return;
    }
    next();
  };
}
