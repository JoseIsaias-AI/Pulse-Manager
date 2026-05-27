import { Request, Response, NextFunction } from 'express';
import * as service from '../services/saudeMentalService';

function ehPsicologo(req: Request): boolean {
  return req.headers['x-eh-psicologo'] === 'true';
}

export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const prontuario = await service.criar(req.body, ehPsicologo(req));
    return res.status(201).json(prontuario);
  } catch (error) {
    return next(error);
  }
}

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const idPsi = req.query.id_psi ? Number(req.query.id_psi) : undefined;
    const prontuarios = await service.listar(idPsi, ehPsicologo(req));
    return res.status(200).json(prontuarios);
  } catch (error) {
    return next(error);
  }
}
