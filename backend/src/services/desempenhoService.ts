import { AlunoRepository } from '../repositories/alunoRepository';
import { ParticipacaoRepository } from '../repositories/participacaoRepository';
import { SaudeMentalRepository } from '../repositories/saudeMentalRepository';
import { AppError, NotFoundError } from '../utils/errors';

export class DesempenhoService {
  constructor(
    private readonly alunoRepository: AlunoRepository,
    private readonly participacaoRepository: ParticipacaoRepository,
    private readonly saudeMentalRepository: SaudeMentalRepository
  ) {}

  async obterDesempenho(idPsi: number, idAluno: number) {
    const aluno = await this.alunoRepository.findById(idAluno);
    if (!aluno) throw new NotFoundError('Aluno nao encontrado.');

    const temVinculo = await this.saudeMentalRepository.existeVinculo(idPsi, idAluno);
    if (!temVinculo) {
      throw new AppError('Psicologo nao possui vinculo com este aluno.', 403);
    }

    const participacoes = await this.participacaoRepository.findByAluno(idAluno);

    const presencas = participacoes.filter(p => p.statusPart).length;
    const notasValidas = participacoes
      .filter(p => p.nota !== null)
      .map(p => p.nota as number);

    const mediaNotas =
      notasValidas.length > 0
        ? Math.round((notasValidas.reduce((acc, n) => acc + n, 0) / notasValidas.length) * 10) / 10
        : null;

    return {
      success: true,
      data: {
        idAluno: aluno.idAluno,
        nomeAluno: aluno.nome,
        participacoes,
        resumo: {
          totalParticipacoes: participacoes.length,
          presencas,
          taxaPresenca:
            participacoes.length > 0
              ? Math.round((presencas / participacoes.length) * 100) / 100
              : 0,
          mediaNotas
        }
      }
    };
  }
}
