import { PerfilLogin, UsuarioRepository } from '../repositories/usuarioRepository';
import { ForbiddenError, NotFoundError, PayloadValidationError } from '../utils/errors';

const perfisPermitidos = ['gestor', 'psicologo', 'aluno'];

export interface LoginPayload {
  email?: string;
  nome?: string;
  perfil?: string;
}

export interface LoginResponse {
  success: true;
  message: string;
  data: {
    id: number;
    idAluno: number;
    email: string;
    nome: string;
    perfil: string;
    codigoPm: string | null;
  };
}

export class AuthService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async login(payload: LoginPayload): Promise<LoginResponse> {
    const email = String(payload.email || '').trim().toLowerCase();
    const nomeInformado = String(payload.nome || '').trim();
    const perfil = String(payload.perfil || '').trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new PayloadValidationError('Email invalido.');
    }

    if (nomeInformado.length < 3) {
      throw new PayloadValidationError('Nome muito curto.');
    }

    if (!perfisPermitidos.includes(perfil)) {
      throw new PayloadValidationError('Perfil invalido.');
    }

    const usuarios = await this.usuarioRepository.findByEmail(email);
    if (!usuarios.length) {
      throw new NotFoundError('Usuario nao encontrado.');
    }

    const usuario = usuarios.find((item) => item.perfil === (perfil as PerfilLogin));
    if (!usuario) {
      throw new ForbiddenError('Perfil informado nao corresponde ao cadastro do usuario.');
    }

    return {
      success: true,
      message: 'Login realizado com sucesso.',
      data: {
        id: usuario.id,
        idAluno: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        perfil: usuario.perfil,
        codigoPm: usuario.codigoPm
      }
    };
  }
}
