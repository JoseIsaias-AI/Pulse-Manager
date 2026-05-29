import { CriarAlunoPayload, AlunoRecord, AlunoRepository, AtualizarAlunoPayload } from '../repositories/alunoRepository';
import { NotFoundError, PayloadValidationError, ConflictError } from '../utils/errors';
import { assertIsoDate } from '../utils/date';
import { normalizeText, requiredString } from '../utils/validators';

export class AlunoService {
  constructor(private readonly repository: AlunoRepository) {}

  async listar(filtros: { busca?: string; status?: string; programa?: string; limite?: number }) {
    return {
      success: true,
      data: {
        alunos: await this.repository.list(filtros as any),
      }
    };
  }

  async cadastrar(payload: CriarAlunoPayload) {
    const data = this.validarCadastro(payload);
    const existente = await this.repository.findOneByEmail(data.email);
    if (existente) {
      throw new ConflictError('Ja existe aluno cadastrado com este e-mail.');
    }

    const aluno = await this.repository.create(data);
    return { success: true, data: aluno };
  }

  async obterPerfil(idAluno: number) {
    const aluno = await this.repository.findById(idAluno);
    if (!aluno) {
      throw new NotFoundError('Aluno nao encontrado.');
    }

    return { success: true, data: aluno };
  }

  async atualizar(idAluno: number, payload: AtualizarAlunoPayload) {
    await this.garantirAluno(idAluno);
    const data = this.validarAtualizacao(payload);
    const aluno = await this.repository.update(idAluno, data);
    return { success: true, data: aluno };
  }

  async inativar(idAluno: number) {
    await this.garantirAluno(idAluno);
    const aluno = await this.repository.softDeactivate(idAluno);
    return { success: true, data: aluno };
  }

  private async garantirAluno(idAluno: number): Promise<AlunoRecord> {
    const aluno = await this.repository.findById(idAluno);
    if (!aluno) {
      throw new NotFoundError('Aluno nao encontrado.');
    }
    return aluno;
  }

  private validarCadastro(payload: CriarAlunoPayload): CriarAlunoPayload {
    const nome = requiredString(payload.nome, 'nome', 3);
    const email = requiredString(payload.email, 'email', 5).toLowerCase();
    if (!email.includes('@')) {
      throw new PayloadValidationError('O campo email deve conter um endereco valido.');
    }

    if (payload.idade !== undefined && (payload.idade < 0 || payload.idade > 120)) {
      throw new PayloadValidationError('O campo idade deve estar entre 0 e 120.');
    }

    return {
      ...payload,
      nome,
      email,
      dataIngresso: assertIsoDate(payload.dataIngresso, 'dataIngresso'),
      programa: payload.programa?.trim(),
      categoria: payload.categoria?.trim(),
      nivelJornada: payload.nivelJornada?.trim(),
      curso: payload.curso?.trim()
    };
  }

  private validarAtualizacao(payload: AtualizarAlunoPayload): AtualizarAlunoPayload {
    const data: AtualizarAlunoPayload = { ...payload };
    if (data.nome !== undefined) data.nome = requiredString(data.nome, 'nome', 3);
    if (data.email !== undefined) {
      data.email = requiredString(data.email, 'email', 5).toLowerCase();
      if (!data.email.includes('@')) throw new PayloadValidationError('O campo email deve conter um endereco valido.');
    }
    if (data.dataIngresso !== undefined) data.dataIngresso = assertIsoDate(data.dataIngresso, 'dataIngresso');
    if (data.riscoEvasao !== undefined && !['baixo', 'medio', 'alto'].includes(normalizeText(data.riscoEvasao))) {
      throw new PayloadValidationError('Risco de evasao invalido.');
    }
    return data;
  }
}

