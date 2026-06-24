import { ApoioPsicologicoRepository } from '../repositories/apoioPsicologicoRepository';
import { NotFoundError, PayloadValidationError, AppError } from '../utils/errors';

export interface SolicitarApoioPayload {
  idAluno?: unknown;
  mensagem?: unknown;
}

export class ApoioPsicologicoService {
  constructor(private readonly repository: ApoioPsicologicoRepository) {}

  async solicitar(idAlunoSessao: number | undefined, payload: SolicitarApoioPayload) {
    if (!Number.isInteger(idAlunoSessao) || Number(idAlunoSessao) <= 0) {
      throw new AppError('Identificacao do aluno nao informada na sessao.', 401);
    }

    if (payload.idAluno !== undefined) {
      throw new PayloadValidationError('O campo idAluno deve vir exclusivamente da sessao.');
    }

    const mensagem = String(payload.mensagem || '').trim();
    if (mensagem.length < 10) {
      throw new PayloadValidationError('O campo mensagem deve ter pelo menos 10 caracteres.');
    }

    if (mensagem.length > 500) {
      throw new PayloadValidationError('O campo mensagem deve ter no maximo 500 caracteres.');
    }

    const alunoExiste = await this.repository.existeAluno(Number(idAlunoSessao));
    if (!alunoExiste) {
      throw new NotFoundError('Aluno da sessao nao encontrado.');
    }

    const idPsicologo = await this.repository.escolherPsicologoDisponivel();
    if (!idPsicologo) {
      throw new NotFoundError('Nenhum psicologo disponivel para receber a solicitacao.');
    }

    return {
      success: true as const,
      data: await this.repository.criar(Number(idAlunoSessao), idPsicologo, mensagem)
    };
  }

  async listarPendentes(idPsicologo: number | undefined) {
    if (!Number.isInteger(idPsicologo) || Number(idPsicologo) <= 0) {
      throw new AppError('Identificacao do psicologo nao informada na sessao.', 401);
    }

    return {
      success: true as const,
      data: await this.repository.listarPendentesPorPsicologo(Number(idPsicologo))
    };
  }
}
