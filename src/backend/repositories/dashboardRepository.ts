import { AlunoRecord, AlunoRepository } from './alunoRepository';
import { DashboardFiltroQuery } from '../models/dashboardModel';

export class DashboardRepository {
  private readonly alunoRepository = new AlunoRepository();

  async listarAlunosParaDashboard(filtros: DashboardFiltroQuery): Promise<AlunoRecord[]> {
    const alunos = await this.alunoRepository.list({
      programa: filtros.programa,
      categoria: filtros.categoria,
      limite: 10000
    });

    return alunos.filter((aluno) => {
      if (filtros.dataInicio && aluno.dataIngresso < filtros.dataInicio) return false;
      if (filtros.dataFim && aluno.dataIngresso > filtros.dataFim) return false;
      return true;
    });
  }
}
