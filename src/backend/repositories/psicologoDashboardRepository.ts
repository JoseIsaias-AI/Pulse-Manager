import { query } from '../database/connection';

export interface PsicologoDashboardResumoRaw {
  totalAtendimentos: number | string;
  totalAlunosAcompanhados: number | string;
  alunosEmRisco: number | string;
  totalLabels: number | string;
}

export interface PsicologoDashboardLabelRaw {
  tipoLabel: string;
  total: number | string;
}

export interface PsicologoDashboardStatusRaw {
  status: string;
  total: number | string;
}

export class PsicologoDashboardRepository {
  async existePsicologo(idPsicologo: number): Promise<boolean> {
    const result = await query('SELECT 1 FROM psicologo WHERE id_psi = $1 LIMIT 1', [idPsicologo]);
    return result.rows.length > 0;
  }

  async obterResumo(idPsicologo: number): Promise<PsicologoDashboardResumoRaw> {
    const result = await query<PsicologoDashboardResumoRaw>(
      `SELECT
         (SELECT COUNT(*) FROM historico_psicologico WHERE id_psi = $1) AS "totalAtendimentos",
         (
           SELECT COUNT(*)
           FROM (
             SELECT id_aluno FROM historico_psicologico WHERE id_psi = $1
             UNION
             SELECT id_aluno FROM label WHERE id_psi = $1
           ) alunos_vinculados
         ) AS "totalAlunosAcompanhados",
         (
           SELECT COUNT(DISTINCT id_aluno)
           FROM label
           WHERE id_psi = $1 AND tipo_label = 'risco'
         ) AS "alunosEmRisco",
         (SELECT COUNT(*) FROM label WHERE id_psi = $1) AS "totalLabels"`,
      [idPsicologo]
    );

    return result.rows[0] || {
      totalAtendimentos: 0,
      totalAlunosAcompanhados: 0,
      alunosEmRisco: 0,
      totalLabels: 0
    };
  }

  async listarLabelsPorTipo(idPsicologo: number): Promise<PsicologoDashboardLabelRaw[]> {
    const result = await query<PsicologoDashboardLabelRaw>(
      `SELECT tipo_label AS "tipoLabel", COUNT(*) AS total
       FROM label
       WHERE id_psi = $1
       GROUP BY tipo_label
       ORDER BY tipo_label`,
      [idPsicologo]
    );

    return result.rows;
  }

  async listarAlunosPorStatus(idPsicologo: number): Promise<PsicologoDashboardStatusRaw[]> {
    const result = await query<PsicologoDashboardStatusRaw>(
      `SELECT a.status, COUNT(*) AS total
       FROM aluno a
       JOIN (
         SELECT id_aluno FROM historico_psicologico WHERE id_psi = $1
         UNION
         SELECT id_aluno FROM label WHERE id_psi = $1
       ) alunos_vinculados ON alunos_vinculados.id_aluno = a.id_aluno
       GROUP BY a.status
       ORDER BY a.status`,
      [idPsicologo]
    );

    return result.rows;
  }

  async obterEvolucaoAtendimentos(idPsicologo: number): Promise<Array<{ periodo: string; total: number | string }>> {
    const result = await query<{ periodo: string; total: number | string }>(
      `SELECT 'geral' AS periodo, COUNT(*) AS total
       FROM historico_psicologico
       WHERE id_psi = $1`,
      [idPsicologo]
    );

    return result.rows;
  }
}
