import { AlunoRepository } from '../repositories/alunoRepository';
import { NotFoundError, PayloadValidationError } from '../utils/errors';

const perfisPermitidos = ['gestor', 'psicologo', 'aluno'];

export interface LoginPayload {
  cpf?: string;
  nome?: string;
  perfil?: string;
}

function apenasDigitos(value: string): string {
  return value.replace(/\D/g, '');
}

export class AuthService {
  constructor(private readonly alunoRepository: AlunoRepository) {}

  async login(payload: LoginPayload) {
    const cpf = apenasDigitos(String(payload.cpf || ''));
    const nomeInformado = String(payload.nome || '').trim();
    const perfil = String(payload.perfil || '').trim();

    if (cpf.length !== 11) {
      throw new PayloadValidationError('CPF invalido.');
    }

    if (nomeInformado.length < 3) {
      throw new PayloadValidationError('Nome muito curto.');
    }

    if (!perfisPermitidos.includes(perfil)) {
      throw new PayloadValidationError('Perfil invalido.');
    }

    const aluno = await this.alunoRepository.findOneByCpf(cpf);
    if (!aluno) {
      throw new NotFoundError('CPF nao encontrado.');
    }

    return {
      success: true,
      data: {
        id: aluno.idAluno,
        idAluno: aluno.idAluno,
        cpf: aluno.cpf,
        nome: nomeInformado,
        perfil,
        codigoPm: aluno.codigoPm
      }
    };
  }
}
