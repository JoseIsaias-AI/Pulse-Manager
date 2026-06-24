import { PsicologoDashboardRepository } from '../repositories/psicologoDashboardRepository';
import { NotFoundError } from '../utils/errors';

function toNumber(value: number | string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function rowsToRecord<T extends { total: number | string }>(
  rows: T[],
  key: keyof T
): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[String(row[key])] = toNumber(row.total);
    return acc;
  }, {});
}

export class PsicologoDashboardService {
  constructor(private readonly repository: PsicologoDashboardRepository) {}

  async obterDashboard(idPsicologo: number) {
    const existe = await this.repository.existePsicologo(idPsicologo);
    if (!existe) {
      throw new NotFoundError('Psicologo nao encontrado.');
    }

    const [resumo, labelsPorTipo, alunosPorStatus, evolucao] = await Promise.all([
      this.repository.obterResumo(idPsicologo),
      this.repository.listarLabelsPorTipo(idPsicologo),
      this.repository.listarAlunosPorStatus(idPsicologo),
      this.repository.obterEvolucaoAtendimentos(idPsicologo)
    ]);

    return {
      success: true as const,
      data: {
        idPsicologo,
        totalAtendimentos: toNumber(resumo.totalAtendimentos),
        alunosEmRisco: toNumber(resumo.alunosEmRisco),
        evolucaoAtendimentos: evolucao.map((item) => ({
          periodo: item.periodo,
          total: toNumber(item.total)
        })),
        indicadoresSaudeMental: {
          totalAlunosAcompanhados: toNumber(resumo.totalAlunosAcompanhados),
          totalLabels: toNumber(resumo.totalLabels),
          labelsPorTipo: rowsToRecord(labelsPorTipo, 'tipoLabel'),
          alunosPorStatus: rowsToRecord(alunosPorStatus, 'status')
        }
      }
    };
  }
}
