import { AlunoRepository } from '../repositories/alunoRepository';
import { NotificacaoRepository } from '../repositories/notificacaoRepository';
import { AppError, NotFoundError, PayloadValidationError } from '../utils/errors';

export class PortalAlunoService {
  constructor(
    private readonly alunoRepository: AlunoRepository,
    private readonly notificacaoRepository: NotificacaoRepository
  ) {}

  async visualizarPerfil(idAluno: number) {
    const aluno = await this.alunoRepository.findById(idAluno);
    if (!aluno) {
      throw new NotFoundError('Aluno nao encontrado no portal.');
    }

    return {
      success: true,
      data: {
        idAluno: aluno.idAluno,
        codigoPm: aluno.codigoPm,
        nome: aluno.nome,
        email: aluno.email,
        telefone: aluno.telefone,
        curso: aluno.curso,
        status: aluno.status,
        nivelJornada: aluno.nivelJornada
      }
    };
  }

  async atualizarContato(idAluno: number, payload: { email?: string; telefone?: string }) {
    const aluno = await this.alunoRepository.findById(idAluno);
    if (!aluno) {
      throw new NotFoundError('Aluno nao encontrado no portal.');
    }

    if (payload.email !== undefined && !payload.email.includes('@')) {
      throw new PayloadValidationError('O campo email deve conter um endereco valido.');
    }

    if (payload.email === undefined && payload.telefone === undefined) {
      throw new PayloadValidationError('Informe email ou telefone para atualizar o contato.');
    }

    const atualizado = await this.alunoRepository.updateContato(
      idAluno,
      payload.email?.trim().toLowerCase(),
      payload.telefone?.trim()
    );

    return { success: true, data: atualizado };
  }

  async listarNotificacoes(idAluno: number, usuarioId: number | undefined) {
    if (usuarioId !== undefined && usuarioId !== idAluno) {
      throw new AppError('Acesso negado: voce so pode visualizar suas proprias notificacoes.', 403);
    }

    const aluno = await this.alunoRepository.findById(idAluno);
    if (!aluno) {
      throw new NotFoundError('Aluno nao encontrado no portal.');
    }

    return { success: true, data: await this.notificacaoRepository.listar(idAluno) };
  }

  async listarOportunidades() {
    return { success: true, data: await this.notificacaoRepository.listarOportunidades() };
  }
}
