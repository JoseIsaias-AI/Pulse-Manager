import { PerfilLogin, UsuarioRepository } from '../repositories/usuarioRepository';
import { NotFoundError, PayloadValidationError } from '../utils/errors';

const perfisPermitidos = ['gestor', 'psicologo', 'aluno'];

export interface LoginPayload {
  cpf?: string;
  nome?: string;
  perfil?: string;
}

export interface LoginResponse {
  success: true;
  message: string;
  data: {
    id: number;
    idAluno: number;
    cpf: string;
    nome: string;
    perfil: string;
    codigoPm: string | null;
  };
}

function apenasDigitos(value: string): string {
  return value.replace(/\D/g, '');
}

export class AuthService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async login(payload: LoginPayload): Promise<LoginResponse> {
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

    const usuario = await this.usuarioRepository.findOneByCpfAndPerfil(cpf, perfil as PerfilLogin);
    if (!usuario) {
      throw new NotFoundError('Usuario nao encontrado para o perfil informado.');
    }

    return {
      success: true,
      message: 'Login realizado com sucesso.',
      data: {
        id: usuario.id,
        idAluno: usuario.id,
        cpf: usuario.cpf,
        nome: usuario.nome,
        perfil: usuario.perfil,
        codigoPm: usuario.codigoPm
      }
    };
  }
}
