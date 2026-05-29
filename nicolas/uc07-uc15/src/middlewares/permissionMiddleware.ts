import { NextFunction, Request, Response } from 'express';
import { temPermissao, PERMISSOES } from '../config/permissions';

export function requirePermission(permissao: keyof typeof PERMISSOES) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const perfil = req.header('x-user-role') || req.query.perfil?.toString();
    if (!temPermissao(perfil, permissao)) {
      res.status(403).json({ success: false, message: 'Perfil sem permissao para executar esta acao.' });
      return;
    }
    next();
  };
}
