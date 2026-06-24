import {
  AlunoRecord,
  AlunoRepository,
  AtualizarAlunoPayload,
  CriarAlunoPayload
} from './alunoRepository';

export class ImportacaoRepository {
  constructor(private readonly alunoRepository = new AlunoRepository()) {}

  listarAlunos(): Promise<AlunoRecord[]> {
    return this.alunoRepository.list({ limite: 10000 });
  }

  buscarAlunoPorEmail(email: string): Promise<AlunoRecord | null> {
    return this.alunoRepository.findOneByEmail(email);
  }

  buscarAlunoPorCpf(cpf: string): Promise<AlunoRecord | null> {
    return this.alunoRepository.findOneByCpf(cpf);
  }

  criarAluno(payload: CriarAlunoPayload): Promise<AlunoRecord> {
    return this.alunoRepository.create(payload);
  }

  atualizarAluno(idAluno: number, payload: AtualizarAlunoPayload): Promise<AlunoRecord | null> {
    return this.alunoRepository.update(idAluno, payload);
  }
}
